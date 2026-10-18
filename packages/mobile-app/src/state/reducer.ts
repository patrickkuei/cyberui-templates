import { BRIGHTNESS, STARTING_DEVICES } from '../data/devices';
import { SCENES } from '../data/scenes';
import { DEFAULT_SETTINGS } from '../data/settings';
import { pairedMessage } from '../data/product';
import type { Device, NewDevice, SceneResult, ScenePatch, Settings, TemperatureUnit } from '../data/types';
import { TARGET_C } from '../utils/units';

// The one place state changes. Every screen reads from AppState and describes a
// change as an Action; nothing else holds app data (the form fields and which
// sheet is open are screen state, not app state).
//
// MOCK BOUNDARY: this reducer is the whole backend. Toggling a device,
// applying a scene or pairing one only edits the in-memory state below; a
// reload restores the starting data, and nothing is sent to anything. To
// connect a real hub, send the request where the action is dispatched (or in
// an effect that watches state) and keep this reducer for the optimistic
// update, so the screens do not change.

export interface AppState {
  devices: Device[];
  settings: Settings;
  /** What the last scene did, for the Scenes screen to report. */
  sceneResult: SceneResult | null;
  /** The confirmation after pairing a device, until it is dismissed. */
  notice: string | null;
  /** Numbers the ids of devices added in this session (new-1, new-2, ...). */
  nextDeviceNumber: number;
}

/**
 * Every way state can change. A discriminated union, so the switch in
 * reducer() is checked for completeness (assertNever): an action added here
 * without a case is a compile error, not a click that silently does nothing.
 */
export type Action =
  | { type: 'device/toggle'; id: string }
  | { type: 'device/set-brightness'; id: string; value: number }
  | { type: 'device/set-target'; id: string; valueC: number }
  | { type: 'device/add'; draft: NewDevice }
  | { type: 'device/remove'; id: string }
  | { type: 'scene/apply'; sceneId: string }
  | { type: 'settings/set-unit'; unit: TemperatureUnit }
  | { type: 'settings/set-flag'; flag: 'alertOffline' | 'remoteAccess'; value: boolean }
  | { type: 'notice/dismiss' };

export function createInitialState(): AppState {
  return {
    devices: STARTING_DEVICES,
    settings: DEFAULT_SETTINGS,
    sceneResult: null,
    notice: null,
    nextDeviceNumber: 1,
  };
}

function assertNever(value: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(value)}`);
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** A new device starts online, and off where it has a switch. The numbers are plain defaults. */
function createDevice(draft: NewDevice, id: string): Device {
  const base = { id, name: draft.name, room: draft.room, status: 'online' } as const;
  switch (draft.kind) {
    case 'light':
      return { ...base, kind: 'light', on: false, brightness: 70 };
    case 'plug':
      return { ...base, kind: 'plug', on: false };
    case 'thermostat':
      return { ...base, kind: 'thermostat', on: true, targetC: 20, currentC: 20 };
    case 'sensor':
      return { ...base, kind: 'sensor', readingC: 20 };
  }
}

/** Applies what a scene asks for to the fields the device's kind has. The rest of the patch is ignored. */
function applyPatch(device: Device, patch: ScenePatch): Device {
  switch (device.kind) {
    case 'light':
      return { ...device, on: patch.on ?? device.on, brightness: patch.brightness ?? device.brightness };
    case 'plug':
      return { ...device, on: patch.on ?? device.on };
    case 'thermostat':
      return { ...device, on: patch.on ?? device.on, targetC: patch.targetC ?? device.targetC };
    case 'sensor':
      return device;
  }
}

/** Devices are flat objects of primitives, so comparing every field is comparing the device. */
function sameDevice(a: Device, b: Device): boolean {
  const left: Record<string, unknown> = { ...a };
  const right: Record<string, unknown> = { ...b };
  return Object.keys(left).every((key) => left[key] === right[key]);
}

/** Replaces one device, but only if it exists and is online-ish: an offline device cannot be controlled. */
function updateControllable(state: AppState, id: string, change: (device: Device) => Device): AppState {
  const target = state.devices.find((device) => device.id === id);
  if (!target || target.status === 'offline') return state;
  const next = change(target);
  if (next === target) return state;
  return { ...state, devices: state.devices.map((device) => (device.id === id ? next : device)) };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'device/toggle':
      return updateControllable(state, action.id, (device) => (device.kind === 'sensor' ? device : { ...device, on: !device.on }));

    case 'device/set-brightness':
      return updateControllable(state, action.id, (device) =>
        device.kind === 'light' ? { ...device, brightness: clamp(action.value, BRIGHTNESS.min, BRIGHTNESS.max) } : device,
      );

    case 'device/set-target':
      return updateControllable(state, action.id, (device) =>
        device.kind === 'thermostat' ? { ...device, targetC: clamp(action.valueC, TARGET_C.min, TARGET_C.max) } : device,
      );

    case 'device/add': {
      // MOCK: nothing is paired. The form checked the pairing code and dropped it.
      const device = createDevice(action.draft, `new-${state.nextDeviceNumber}`);
      return {
        ...state,
        devices: [...state.devices, device],
        nextDeviceNumber: state.nextDeviceNumber + 1,
        notice: pairedMessage(device.name, device.room),
      };
    }

    case 'device/remove':
      return { ...state, devices: state.devices.filter((device) => device.id !== action.id) };

    case 'scene/apply': {
      // MOCK: edits the in-memory devices only. A device that no longer exists
      // is passed over; an offline one is reported, not changed.
      const scene = SCENES.find((candidate) => candidate.id === action.sceneId);
      if (!scene) return state;
      const changed: string[] = [];
      const offline: string[] = [];
      let devices = state.devices;
      for (const { deviceId, patch } of scene.changes) {
        const before = devices.find((device) => device.id === deviceId);
        if (!before) continue;
        if (before.status === 'offline') {
          offline.push(deviceId);
          continue;
        }
        const after = applyPatch(before, patch);
        if (sameDevice(before, after)) continue;
        changed.push(deviceId);
        devices = devices.map((device) => (device.id === deviceId ? after : device));
      }
      return { ...state, devices, sceneResult: { sceneId: scene.id, changed, offline } };
    }

    case 'settings/set-unit':
      return { ...state, settings: { ...state.settings, unit: action.unit } };

    case 'settings/set-flag':
      // MOCK: remembered in memory so the switch responds. No notification is ever scheduled or requested.
      return { ...state, settings: { ...state.settings, [action.flag]: action.value } };

    case 'notice/dismiss':
      return { ...state, notice: null };

    default:
      return assertNever(action);
  }
}
