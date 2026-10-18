import { useEffect, useReducer, useRef, type MouseEvent, type ReactNode } from 'react';
import { Button } from 'cyberui-2045';
import { AppBar } from './components/AppBar';
import { BottomNav } from './components/BottomNav';
import { SCREEN_TITLE_ID } from './components/ScreenTitle';
import { PRODUCT_NAME, ROUTE_TITLES } from './data/product';
import { useHashRoute, type Route } from './router/useHashRoute';
import { AddDeviceScreen } from './screens/AddDeviceScreen';
import { DevicesScreen } from './screens/DevicesScreen';
import { ScenesScreen } from './screens/ScenesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { createInitialState, reducer } from './state/reducer';
import './App.css';

export default function App() {
  // The only state in the app. Screens read it and describe changes as actions
  // (state/reducer.ts); a reload restores the starting data, nothing is saved.
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const { route, leaveAdd } = useHashRoute();

  // On a route change: keep the document title in step, scroll to the top (one
  // document holds every screen, so the old scroll position would carry over),
  // and move focus to the new screen's <h1>. Without that a keyboard or
  // screen-reader user is left on the tab they pressed, or on a Back button
  // that no longer exists. Not on first load, where the browser's own focus
  // handling is right (and StrictMode runs effects twice in development, which
  // the ref also absorbs).
  const shownRoute = useRef<Route>(route);
  useEffect(() => {
    document.title = `${ROUTE_TITLES[route]} — ${PRODUCT_NAME}`;
    if (shownRoute.current === route) return;
    shownRoute.current = route;
    window.scrollTo(0, 0);
    document.getElementById(SCREEN_TITLE_ID)?.focus({ preventScroll: true });
  }, [route]);

  // The skip link would normally be href="#main", but following it would write
  // location.hash, and every unknown hash falls back to Devices. Focusing <main> does the same job.
  const skipToMain = (event: MouseEvent) => {
    event.preventDefault();
    document.getElementById('main')?.focus();
  };

  // Record<Route, ...> (like ROUTE_TITLES in data/product.ts) makes adding a
  // route without a screen a type error, instead of a blank <main>. ROUTES in
  // router/useHashRoute.ts is the one list to start from.
  const screens: Record<Route, () => ReactNode> = {
    devices: () => <DevicesScreen state={state} dispatch={dispatch} />,
    scenes: () => <ScenesScreen state={state} dispatch={dispatch} />,
    settings: () => <SettingsScreen state={state} dispatch={dispatch} />,
    add: () => <AddDeviceScreen dispatch={dispatch} leave={leaveAdd} />,
  };

  return (
    <div className="app">
      <a className="skip-link" href="#main" onClick={skipToMain}>
        Skip to main content
      </a>
      <AppBar onBack={route === 'add' ? leaveAdd : undefined} />
      <div className={state.notice ? 'notice-region notice-region--open' : 'notice-region'}>
        {/* role="status" is a polite live region. It must be in the page before its text changes, so it is always rendered. */}
        <p role="status" className="notice-text">
          {state.notice ?? ''}
        </p>
        {state.notice && (
          <Button variant="ghost" onClick={() => dispatch({ type: 'notice/dismiss' })}>
            Dismiss
          </Button>
        )}
      </div>
      <main id="main" className="screen" tabIndex={-1}>
        {screens[route]()}
      </main>
      {/* Add device hides the nav: a form with the on-screen keyboard open should not carry a bar under its fields. */}
      {route !== 'add' && <BottomNav route={route} />}
    </div>
  );
}
