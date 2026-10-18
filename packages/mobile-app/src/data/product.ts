// The app's own words, apart from the devices and presets. Everything here is
// fiction: Kestrel is not a real product, and nothing it shows is connected to
// anything. "Swap Kestrel for your product" is a data edit, not a hunt through JSX.
import type { Route } from '../router/useHashRoute';
import type { DeviceKind, LinkState } from './types';
import type { LinkStep } from '../connection/types';

export const PRODUCT_NAME = 'Kestrel';

/** The app bar's small label. The full sentence is DEMO_NOTE. */
export const DEMO_BADGE = 'Demo';

/**
 * The app says what is mock in three places and the README: the badge in the
 * app bar, this sentence in Settings, and a line on the Scan screen
 * (CONNECT_COPY.scripted). Delete them, and the mock parts they describe, when you
 * make the app real.
 */
export const DEMO_NOTE = `Template demo: ${PRODUCT_NAME} is fictional and controls nothing.`;

/**
 * Record<Route, ...>: a route without a title is a compile error. The title is
 * the document title and, for the three tabs, the bottom nav label and the
 * screen's <h1>. The device page's <h1> is the device's own name instead.
 */
export const ROUTE_TITLES: Record<Route, string> = {
  devices: 'Home',
  device: 'Device',
  rooms: 'Rooms',
  settings: 'Settings',
  add: 'Add device',
  'add-room': 'Add room',
};

export const KIND_LABELS: Record<DeviceKind, string> = {
  light: 'Light',
  plug: 'Plug',
  thermostat: 'Thermostat',
  sensor: 'Sensor',
};

/** What a row and a device page say instead of a value when the device cannot be reached. */
export const LINK_WORDS: Record<Exclude<LinkState, 'connected'>, string> = {
  lost: 'Lost',
  offline: 'Offline',
};

export const HOME_COPY = {
  filterLabel: 'Show devices in',
  all: 'All',
  turnOffRoom: 'Turn off',
  add: 'Add device',
  empty: 'No devices yet. Add one to get started.',
  emptyFilter: 'Nothing in this room yet.',
} as const;

export const DEVICE_COPY = {
  turnOn: 'Turn on',
  turnOff: 'Turn off',
  lightPresets: 'Scenes',
  thermostatPresets: 'Modes',
  lightLevel: 'Brightness',
  target: 'Target temperature',
  now: 'Now',
  sensorNote: 'Nothing to control here: this sensor only reports.',
  linkTitle: 'Link',
  disconnect: 'Disconnect',
  reconnect: 'Reconnect',
  remove: 'Remove device',
  notFound: 'That device is not here any more.',
  notFoundBack: 'Back to Home',
  batteryLow: 'Battery is low.',
} as const;

export const ROOMS_COPY = {
  add: 'Add room',
  turnOff: 'Turn off',
  remove: 'Remove room',
  open: 'Show devices',
} as const;

export const ADD_ROOM = {
  nameLabel: 'Room name',
  namePlaceholder: 'Kitchen',
  save: 'Add room',
  cancel: 'Cancel',
  maxLength: 24,
  errors: {
    required: 'Enter a name for the room.',
    duplicate: 'There is already a room with that name.',
  },
} as const;

export const CONNECT_COPY = {
  scanTitle: 'Find a device nearby',
  scanIntro: 'Put the device in pairing mode, then scan.',
  scanStart: 'Start scan',
  // The one place the Scan screen says what is mock (README: "Honest about what is mock").
  scripted: 'This scan is scripted: nothing is discovered. It shows a fixed list.',
  scanning: 'Scanning…',
  stopScan: 'Cancel',
  scanAgain: 'Scan again',
  found: (count: number) => (count === 1 ? '1 device nearby' : `${count} devices nearby`),
  noneLeft: 'Everything the scan can find is already added.',
  enterCode: 'Enter a code instead',
  codeTitle: 'Enter the pairing code',
  codeLabel: 'Pairing code',
  codeHelp: '6 letters or numbers.',
  codeError: 'Enter the 6-character pairing code: letters and numbers only.',
  codeSubmit: 'Link device',
  backToScan: 'Back to scan',
  linkTitle: 'Linking',
  linkFailed: 'The link failed',
  tryAgain: 'Try again',
  cancel: 'Cancel',
  detailsTitle: 'Name the device',
  nameLabel: 'Device name',
  nameError: 'Enter a name for the device.',
  nameMaxLength: 30,
  roomLabel: 'Room',
  kindLabel: 'Type',
  save: 'Add device',
  codeLength: 6,
} as const;

export const LINK_STEP_LABELS: Record<LinkStep, string> = {
  found: 'Device found',
  pairing: 'Pairing code accepted',
  securing: 'Securing the link',
  ready: 'Ready',
};

export const SETTINGS_COPY = {
  temperatureTitle: 'Temperature',
  unitLabel: 'Temperature unit',
  alertsTitle: 'Alerts and access',
  alertOffline: 'Alert me when a device goes offline',
  remoteAccess: 'Remote access',
  aboutTitle: 'About',
  version: `${PRODUCT_NAME} 1.0, a template`,
} as const;
