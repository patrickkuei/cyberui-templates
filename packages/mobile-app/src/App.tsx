import { useEffect, useReducer, useRef, type MouseEvent, type ReactNode } from 'react';
import { Button } from 'cyberui-2045';
import { AppBar } from './components/AppBar';
import { BottomNav } from './components/BottomNav';
import { SCREEN_TITLE_ID } from './components/ScreenTitle';
import { scriptedConnection, type Connection } from './connection';
import { PRODUCT_NAME, ROUTE_TITLES } from './data/product';
import { isTab, useHashRoute, type Route } from './router/useHashRoute';
import { AddDeviceScreen } from './screens/AddDeviceScreen';
import { AddRoomScreen } from './screens/AddRoomScreen';
import { DeviceScreen } from './screens/DeviceScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RoomsScreen } from './screens/RoomsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { createInitialState, reducer } from './state/reducer';
import './App.css';

interface AppProps {
  /**
   * How the app finds and links devices (connection/types.ts). The scripted one
   * discovers nothing; pass your own to make Add device and Reconnect real.
   */
  connection?: Connection;
}

export default function App({ connection = scriptedConnection }: AppProps) {
  // The only state in the app. Screens read it and describe changes as actions
  // (state/reducer.ts); a reload restores the starting data, nothing is saved.
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const { route, param, leave } = useHashRoute();
  const device = route === 'device' ? state.devices.find((candidate) => candidate.id === param) : undefined;
  const title = route === 'device' ? (device?.name ?? ROUTE_TITLES.device) : ROUTE_TITLES[route];

  // On a route change: keep the document title in step, scroll to the top (one
  // document holds every screen, so the old scroll position would carry over),
  // and move focus to the new screen's <h1>. Without that a keyboard or
  // screen-reader user is left on the tab they pressed, or on a Back button
  // that no longer exists. Not on first load, where the browser's own focus
  // handling is right (and StrictMode runs effects twice in development, which
  // the ref also absorbs). A change of device inside the device route is a
  // route change too.
  const shown = useRef(`${route}/${param ?? ''}`);
  useEffect(() => {
    document.title = `${title} — ${PRODUCT_NAME}`;
    const key = `${route}/${param ?? ''}`;
    if (shown.current === key) return;
    shown.current = key;
    window.scrollTo(0, 0);
    document.getElementById(SCREEN_TITLE_ID)?.focus({ preventScroll: true });
  }, [route, param, title]);

  // The skip link would normally be href="#main", but following it would write
  // location.hash, and every unknown hash falls back to Home. Focusing <main> does the same job.
  const skipToMain = (event: MouseEvent) => {
    event.preventDefault();
    document.getElementById('main')?.focus();
  };

  // Record<Route, ...> (like ROUTE_TITLES in data/product.ts) makes adding a
  // route without a screen a type error, instead of a blank <main>. ROUTES in
  // router/useHashRoute.ts is the one list to start from.
  const screens: Record<Route, () => ReactNode> = {
    devices: () => <HomeScreen state={state} dispatch={dispatch} />,
    // key: another device's page starts clean (a Reconnect in progress is not carried over to it).
    device: () => <DeviceScreen key={param} state={state} dispatch={dispatch} connection={connection} deviceId={param} leave={leave} />,
    rooms: () => <RoomsScreen state={state} dispatch={dispatch} />,
    settings: () => <SettingsScreen state={state} dispatch={dispatch} />,
    add: () => <AddDeviceScreen devices={state.devices} rooms={state.rooms} connection={connection} dispatch={dispatch} leave={leave} />,
    'add-room': () => <AddRoomScreen rooms={state.rooms} dispatch={dispatch} leave={leave} />,
  };

  const tab = isTab(route);

  return (
    <div className="app">
      <a className="skip-link" href="#main" onClick={skipToMain}>
        Skip to main content
      </a>
      <AppBar onBack={tab ? undefined : leave} />
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
      {/* Pushed screens (a device's page, Add device, Add room) hide the nav: they have their own Back, and a form with the on-screen keyboard open should not carry a bar under its fields. Moving to another tab also clears the notice. */}
      {tab && <BottomNav route={route} onNavigate={() => dispatch({ type: 'notice/dismiss' })} />}
    </div>
  );
}
