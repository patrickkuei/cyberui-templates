import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The single source of truth for routes; Route is derived from it so the two
 * can't drift. To add a screen, start here: App.tsx keeps its screens in a
 * Record<Route, ...> and data/product.ts keeps its title in another, so the
 * compiler then lists what is still missing.
 */
export const ROUTES = ['devices', 'scenes', 'settings', 'add'] as const;
export type Route = (typeof ROUTES)[number];

/**
 * The routes that get a tab in the bottom nav. 'add' is not one: it is pushed
 * on top of Devices (it has its own Back and hides the nav). A new route is
 * not a tab until you list it here.
 */
export type TabRoute = Exclude<Route, 'add'>;
export const TAB_ROUTES: readonly TabRoute[] = ['devices', 'scenes', 'settings'];

const DEFAULT_ROUTE: Route = 'devices';

function parseHash(hash: string): Route {
  const value = hash.replace(/^#\/?/, '');
  return (ROUTES as readonly string[]).includes(value) ? (value as Route) : DEFAULT_ROUTE;
}

// Hash routing (#/scenes) rather than the History API, so the app works on a
// static host such as GitHub Pages, and inside an iframe, with no server
// config. Each screen is a history entry, so the phone's Back button closes
// Add device instead of leaving the app.
export function useHashRoute(): { route: Route; leaveAdd: () => void } {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const current = useRef(route);
  // True once Add device was reached by moving around inside this page. Back
  // is only a safe way out of Add device then: when someone opens a link
  // straight to #/add, history.back() would leave the app (or, in the site's
  // preview dialog, undo the dialog opening).
  const arrivedFromApp = useRef(false);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash(window.location.hash);
      if (next === 'add' && current.current !== 'add') arrivedFromApp.current = true;
      current.current = next;
      setRoute(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  /** Closes Add device: Back when that is safe, otherwise replaces the entry with Devices. */
  const leaveAdd = useCallback(() => {
    if (arrivedFromApp.current) window.history.back();
    else window.location.replace(`#/${DEFAULT_ROUTE}`);
  }, []);

  return { route, leaveAdd };
}
