import { useEffect, useState } from 'react';

/**
 * The single source of truth for routes; Route is derived from it so the two
 * can't drift. To add a page, start here: App.tsx keeps its labels and pages in
 * Record<Route, ...> maps, so the compiler then lists what is still missing.
 */
export const ROUTES = ['console', 'tasks', 'logs'] as const;
export type Route = (typeof ROUTES)[number];

const DEFAULT_ROUTE: Route = 'console';

function parseHash(hash: string): Route {
  const value = hash.replace(/^#\/?/, '');
  return (ROUTES as readonly string[]).includes(value) ? (value as Route) : DEFAULT_ROUTE;
}

// Hash routing (#/tasks) rather than the History API, so the app works on a
// static host such as GitHub Pages, and inside an iframe, with no server config.
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}
