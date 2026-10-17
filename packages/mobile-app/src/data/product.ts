// The app's own words, apart from the devices and scenes. Everything here is
// fiction: Kestrel is not a real product, and nothing it shows is connected to
// anything. "Swap Kestrel for your product" is a data edit, not a hunt through JSX.
import type { Route } from '../router/useHashRoute';
import type { DeviceKind, Room } from './types';

export const PRODUCT_NAME = 'Kestrel';

/** The app bar's small label. The full sentence is DEMO_NOTE. */
export const DEMO_BADGE = 'Demo';

/**
 * The app's one persistent "this is a demo" signal besides the badge (the
 * README has the rest). It appears in Settings and in the confirmation after
 * pairing a device, which is the moment a person has typed something. Delete it,
 * and the mock parts it describes, when you make the app real.
 */
export const DEMO_NOTE = `Template demo: ${PRODUCT_NAME} is fictional and controls nothing.`;

/**
 * Record<Route, ...>: a route without a title is a compile error. The title is
 * the screen's <h1>, the document title and (for the tabs) the bottom nav label.
 */
export const ROUTE_TITLES: Record<Route, string> = {
  devices: 'Devices',
  scenes: 'Scenes',
  settings: 'Settings',
  add: 'Add device',
};

export const KIND_LABELS: Record<DeviceKind, string> = {
  light: 'Light',
  plug: 'Plug',
  thermostat: 'Thermostat',
  sensor: 'Sensor',
};

export const ADD_DEVICE = {
  nameLabel: 'Device name',
  namePlaceholder: 'Desk lamp',
  nameError: 'Enter a name for the device.',
  roomLabel: 'Room',
  kindLabel: 'Type',
  codeLabel: 'Pairing code',
  codeHelp: '6 letters or numbers.',
  codeError: 'Enter the 6-character pairing code: letters and numbers only.',
  save: 'Save device',
  cancel: 'Cancel',
  nameMaxLength: 30,
  codeLength: 6,
} as const;

/** Shown on the Devices screen after a device is added. MOCK: nothing was paired. */
export function pairedMessage(name: string, room: Room): string {
  return `Added ${name} to ${room}. ${DEMO_NOTE}`;
}

export const SETTINGS_COPY = {
  temperatureTitle: 'Temperature',
  unitLabel: 'Temperature unit',
  alertsTitle: 'Alerts and access',
  alertOffline: 'Alert me when a device goes offline',
  remoteAccess: 'Remote access',
  aboutTitle: 'About',
  version: `${PRODUCT_NAME} 1.0, a template`,
} as const;
