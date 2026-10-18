import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The single source of truth for routes; Route is derived from it so the two
 * can't drift. To add a screen, start here: App.tsx keeps its screens in a
 * Record<Route, ...>, data/product.ts keeps its title in another and PARENT_TAB
 * below says where a pushed screen returns to, so the compiler then lists what
 * is still missing.
 *
 * 'devices' is Home and 'device' is one device's page (#/device/desk-lamp): the
 * second path segment is that route's parameter.
 */
export const ROUTES = ['devices', 'device', 'rooms', 'settings', 'add', 'add-room'] as const;
export type Route = (typeof ROUTES)[number];

/** The routes that get a tab in the bottom nav. A new route is not a tab until you list it here. */
export const TAB_ROUTES = ['devices', 'rooms', 'settings'] as const satisfies readonly Route[];
export type TabRoute = (typeof TAB_ROUTES)[number];

/** Pushed screens have their own Back and no bottom nav. Each says which tab it belongs to. */
export type PushedRoute = Exclude<Route, TabRoute>;
const PARENT_TAB: Record<PushedRoute, TabRoute> = {
  device: 'devices',
  add: 'devices',
  'add-room': 'rooms',
};

export const isTab = (route: Route): route is TabRoute => (TAB_ROUTES as readonly string[]).includes(route);

const DEFAULT_ROUTE: Route = 'devices';

export interface ParsedRoute {
  route: Route;
  /** The second path segment, for the one route that has a parameter (the device's id). */
  param: string | undefined;
}

export function parseHash(hash: string): ParsedRoute {
  const [name = '', param] = hash.replace(/^#\/?/, '').split('/');
  const route = (ROUTES as readonly string[]).includes(name) ? (name as Route) : DEFAULT_ROUTE;
  return { route, param: route === 'device' && param ? decodeURIComponent(param) : undefined };
}

// Hash routing (#/rooms) rather than the History API, so the app works on a
// static host such as GitHub Pages, and inside an iframe, with no server
// config. Each screen is a history entry, so the phone's Back button closes a
// pushed screen instead of leaving the app.
export function useHashRoute(): ParsedRoute & { leave: () => void } {
  const [parsed, setParsed] = useState<ParsedRoute>(() => parseHash(window.location.hash));
  const current = useRef<Route>(parsed.route);
  // True once a pushed screen was reached by moving around inside this page.
  // Back is only a safe way out of it then: when someone opens a link straight
  // to #/add, history.back() would leave the app (or, in the site's preview
  // dialog, undo the dialog opening).
  const arrivedFromApp = useRef(false);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash(window.location.hash);
      if (!isTab(next.route) && current.current !== next.route) arrivedFromApp.current = true;
      current.current = next.route;
      setParsed((previous) => (previous.route === next.route && previous.param === next.param ? previous : next));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  /** Closes a pushed screen: Back when that is safe, otherwise replaces the entry with its parent tab. */
  const leave = useCallback(() => {
    if (arrivedFromApp.current) {
      window.history.back();
      return;
    }
    const route = current.current;
    window.location.replace(`#/${isTab(route) ? route : PARENT_TAB[route]}`);
  }, []);

  return { ...parsed, leave };
}
