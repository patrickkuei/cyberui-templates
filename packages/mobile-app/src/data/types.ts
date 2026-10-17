// The shapes everything else is typed against. No behaviour lives here.

/** Where a device lives. The Devices screen groups by room, in this order. */
export const ROOMS = ['Living room', 'Bedroom', 'Hall'] as const;
export type Room = (typeof ROOMS)[number];

/** What the app shows for a device. Online, low battery and offline are fixed in the starting data: nothing here detects them. */
export const DEVICE_STATUSES = ['online', 'low-battery', 'offline'] as const;
export type DeviceStatus = (typeof DEVICE_STATUSES)[number];

export type TemperatureUnit = 'C' | 'F';

interface DeviceBase {
  id: string;
  name: string;
  room: Room;
  status: DeviceStatus;
}

/**
 * What each kind of device carries besides the fields every device has.
 * DeviceKind and Device are both derived from this one interface, so a kind
 * cannot exist without its fields, and a Record<DeviceKind, ...> elsewhere
 * (icons, labels, the controls in the device sheet) is a compile error until
 * a new kind is handled in every one of them.
 *
 * Temperatures are always degrees Celsius. units.ts converts for display.
 */
interface KindFields {
  light: { on: boolean; brightness: number };
  plug: { on: boolean };
  thermostat: { on: boolean; targetC: number; currentC: number };
  /** Sensors have no switch: they only report. */
  sensor: { readingC: number };
}

export type DeviceKind = keyof KindFields;
export type Device = { [K in DeviceKind]: DeviceBase & { kind: K } & KindFields[K] }[DeviceKind];

/** The kinds, in the order the Add device form lists them. */
export const DEVICE_KINDS: readonly DeviceKind[] = ['light', 'plug', 'thermostat', 'sensor'];

/** A device the person has filled in the Add device form for. The pairing code is checked by the form and then dropped. */
export interface NewDevice {
  name: string;
  room: Room;
  kind: DeviceKind;
}

/** What a scene may change on a device. A field that does not fit the device's kind is ignored (and data/scenes.test.ts keeps the data honest). */
export interface ScenePatch {
  on?: boolean;
  brightness?: number;
  targetC?: number;
}

export interface Scene {
  id: string;
  name: string;
  summary: string;
  changes: { deviceId: string; patch: ScenePatch }[];
}

export interface Settings {
  unit: TemperatureUnit;
  /** MOCK: stored in memory only. Nothing is ever scheduled, requested or shown. */
  alertOffline: boolean;
  /** MOCK: stored in memory only. There is no remote access. */
  remoteAccess: boolean;
}

/** What applying a scene did, by device id. Offline devices are skipped, not changed. */
export interface SceneResult {
  sceneId: string;
  changed: string[];
  offline: string[];
}
