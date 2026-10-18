// The shapes everything else is typed against. No behaviour lives here.

/** A room. The id is what devices point at, so renaming a room never touches a device. */
export interface Room {
  id: string;
  name: string;
}

export type TemperatureUnit = 'C' | 'F';

/**
 * How a device is reached. 'lost' is a link that dropped by itself and
 * 'offline' is one the person disconnected on purpose; both mean the controls
 * are unavailable until Reconnect works. Nothing in the app detects or changes
 * this by itself: it is fixed in the starting data until someone presses
 * Disconnect or Reconnect (and both are mock, see state/reducer.ts).
 */
export const LINK_STATES = ['connected', 'lost', 'offline'] as const;
export type LinkState = (typeof LINK_STATES)[number];

/** Signal is drawn as this many bars, so a device's `signal` runs from 0 to SIGNAL_BARS. */
export const SIGNAL_BARS = 4;

interface DeviceBase {
  id: string;
  name: string;
  roomId: string;
  link: LinkState;
  /** 0 to SIGNAL_BARS. Kept while the link is down so a successful Reconnect brings it back. */
  signal: number;
  /** Round-trip time in milliseconds. Invented. */
  latencyMs: number;
}

/**
 * What each kind of device carries besides the fields every device has.
 * DeviceKind and Device are both derived from this one interface, so a kind
 * cannot exist without its fields, and a Record<DeviceKind, ...> elsewhere
 * (drawings, labels) is a compile error until a new kind is handled in every
 * one of them.
 *
 * Temperatures are always degrees Celsius. units.ts converts for display.
 * `watts` is an invented draw while the device is on: nothing measures
 * anything, and a room's total is derived from it (utils/summary.ts), never
 * stored.
 */
interface KindFields {
  light: { on: boolean; level: number; watts: number };
  plug: { on: boolean; watts: number };
  thermostat: { on: boolean; targetC: number; currentC: number };
  /** Sensors have no power control: they only report. */
  sensor: { readingC: number; batteryLow: boolean };
}

export type DeviceKind = keyof KindFields;
export type Device = { [K in DeviceKind]: DeviceBase & { kind: K } & KindFields[K] }[DeviceKind];

/** The kinds, in the order the manual Add device form lists them. */
export const DEVICE_KINDS: readonly DeviceKind[] = ['light', 'plug', 'thermostat', 'sensor'];

/** A device the person has linked and named. The pairing code is checked and then dropped. */
export interface DeviceDraft {
  /** Set when the device came from the scan (its nearby id); otherwise the reducer numbers it. */
  id?: string;
  name: string;
  roomId: string;
  kind: DeviceKind;
  signal?: number;
}

/** A device the scripted scan "finds". See data/nearby.ts. */
export interface NearbyDevice {
  id: string;
  name: string;
  kind: DeviceKind;
  signal: number;
}

export interface Settings {
  unit: TemperatureUnit;
  /** MOCK: stored in memory only. Nothing is ever scheduled, requested or shown. */
  alertOffline: boolean;
  /** MOCK: stored in memory only. There is no remote access. */
  remoteAccess: boolean;
}
