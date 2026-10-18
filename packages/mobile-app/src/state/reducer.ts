import { LEVEL, STARTING_DEVICES, STARTING_ROOMS } from '../data/devices';
import { LIGHT_PRESETS, THERMOSTAT_PRESETS } from '../data/presets';
import { ADD_ROOM } from '../data/product';
import { DEFAULT_SETTINGS } from '../data/settings';
import type { Device, DeviceDraft, Room, Settings, TemperatureUnit } from '../data/types';
import { isReachable, isSwitchable, roomName, roomNameProblem } from '../utils/summary';
import { TARGET_C } from '../utils/units';

// The one place state changes. Every screen reads from AppState and describes a
// change as an Action; nothing else holds app data (the form fields, the scan
// and the open step of Add device are screen state, not app state).
//
// MOCK BOUNDARY: this reducer is the whole backend. Switching a device,
// pressing a preset, linking or removing one only edits the in-memory state
// below; a reload restores the starting data, and nothing is sent to anything.
// To connect a real hub, send the request where the action is dispatched (or in
// an effect that watches state) and keep this reducer for the instant update,
// so the screens do not change. Linking itself goes through a Connection
// (connection/types.ts), which is where a real protocol plugs in.

export interface AppState {
  rooms: Room[];
  devices: Device[];
  settings: Settings;
  /** Which room Home shows, or null for all of them. Kept here because Rooms sets it and Home reads it. */
  roomFilter: string | null;
  /** The line shown under the app bar until it is dismissed (a device or room was added or removed, or a room could not be). */
  notice: string | null;
  /** Number the ids of devices and rooms added in this session (new-1, room-1, ...). */
  nextDeviceNumber: number;
  nextRoomNumber: number;
}

/**
 * Every way state can change. A discriminated union, so the switch in
 * reducer() is checked for completeness (assertNever): an action added here
 * without a case is a compile error, not a click that silently does nothing.
 */
export type Action =
  | { type: 'device/toggle'; id: string }
  | { type: 'device/set-level'; id: string; value: number }
  | { type: 'device/set-target'; id: string; valueC: number }
  | { type: 'device/preset'; id: string; presetId: string }
  | { type: 'device/disconnect'; id: string }
  | { type: 'device/reconnected'; id: string }
  | { type: 'device/add'; draft: DeviceDraft }
  | { type: 'device/remove'; id: string }
  | { type: 'room/turn-off'; id: string }
  | { type: 'room/add'; name: string }
  | { type: 'room/remove'; id: string }
  | { type: 'filter/set'; roomId: string | null }
  | { type: 'settings/set-unit'; unit: TemperatureUnit }
  | { type: 'settings/set-flag'; flag: 'alertOffline' | 'remoteAccess'; value: boolean }
  | { type: 'notice/dismiss' };

export function createInitialState(): AppState {
  return {
    rooms: STARTING_ROOMS,
    devices: STARTING_DEVICES,
    settings: DEFAULT_SETTINGS,
    roomFilter: null,
    notice: null,
    nextDeviceNumber: 1,
    nextRoomNumber: 1,
  };
}

function assertNever(value: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(value)}`);
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** A new device starts connected, and off where it has a power state. The numbers are plain defaults. */
function createDevice(draft: DeviceDraft, id: string): Device {
  const base = { id, name: draft.name, roomId: draft.roomId, link: 'connected', signal: draft.signal ?? 3, latencyMs: 25 } as const;
  switch (draft.kind) {
    case 'light':
      return { ...base, kind: 'light', on: false, level: 70, watts: 10 };
    case 'plug':
      return { ...base, kind: 'plug', on: false, watts: 40 };
    case 'thermostat':
      return { ...base, kind: 'thermostat', on: true, targetC: 20, currentC: 20 };
    case 'sensor':
      return { ...base, kind: 'sensor', readingC: 20, batteryLow: false };
  }
}

/** Replaces one device, but only if it exists and can be reached: a lost or offline device cannot be controlled. */
function updateControllable(state: AppState, id: string, change: (device: Device) => Device): AppState {
  const target = state.devices.find((device) => device.id === id);
  if (!target || !isReachable(target)) return state;
  const next = change(target);
  if (next === target) return state;
  return { ...state, devices: state.devices.map((device) => (device.id === id ? next : device)) };
}

/** Replaces one device whatever its link, for the two actions that are about the link itself. */
function updateAny(state: AppState, id: string, change: (device: Device) => Device): AppState {
  if (!state.devices.some((device) => device.id === id)) return state;
  return { ...state, devices: state.devices.map((device) => (device.id === id ? change(device) : device)) };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'device/toggle':
      return updateControllable(state, action.id, (device) => (isSwitchable(device) ? { ...device, on: !device.on } : device));
    case 'device/set-level':
      // Picking a level also switches the light on. Otherwise a light dragged
      // to 80% would still be off: a level on the slider, a dark glyph and an
      // "Off" on its row, all at once.
      return updateControllable(state, action.id, (device) =>
        device.kind === 'light' ? { ...device, on: true, level: clamp(action.value, LEVEL.min, LEVEL.max) } : device,
      );
    case 'device/set-target':
      // Like a light's level, picking a target also switches the thermostat on.
      return updateControllable(state, action.id, (device) =>
        device.kind === 'thermostat' ? { ...device, on: true, targetC: clamp(action.valueC, TARGET_C.min, TARGET_C.max) } : device,
      );
    case 'device/preset':
      return updateControllable(state, action.id, (device) => {
        if (device.kind === 'light') {
          const preset = LIGHT_PRESETS.find((candidate) => candidate.id === action.presetId);
          return preset ? { ...device, on: true, level: preset.level } : device;
        }
        if (device.kind === 'thermostat') {
          const preset = THERMOSTAT_PRESETS.find((candidate) => candidate.id === action.presetId);
          return preset ? { ...device, on: preset.on, targetC: preset.targetC ?? device.targetC } : device;
        }
        return device;
      });
    case 'device/disconnect':
      // MOCK: nothing is disconnected. The device is only marked offline here.
      return updateAny(state, action.id, (device) => (device.link === 'connected' ? { ...device, link: 'offline' } : device));
    case 'device/reconnected':
      // Dispatched once the Connection's link() has resolved (components/LinkRun.tsx).
      return updateAny(state, action.id, (device) => (device.link === 'connected' ? device : { ...device, link: 'connected' }));
    case 'device/add': {
      // MOCK: nothing is paired. The pairing code was checked by the form and dropped.
      const id = action.draft.id ?? `new-${state.nextDeviceNumber}`;
      if (state.devices.some((device) => device.id === id) || !state.rooms.some((room) => room.id === action.draft.roomId)) return state;
      const device = createDevice(action.draft, id);
      return {
        ...state,
        devices: [...state.devices, device],
        nextDeviceNumber: action.draft.id ? state.nextDeviceNumber : state.nextDeviceNumber + 1,
        notice: `Added ${device.name} to ${roomName(state.rooms, device.roomId)}.`,
      };
    }
    case 'device/remove': {
      const removed = state.devices.find((device) => device.id === action.id);
      if (!removed) return state;
      return { ...state, devices: state.devices.filter((device) => device.id !== action.id), notice: `Removed ${removed.name}.` };
    }
    case 'room/turn-off':
      return {
        ...state,
        devices: state.devices.map((device) =>
          device.roomId === action.id && isReachable(device) && isSwitchable(device) && device.on ? { ...device, on: false } : device,
        ),
      };
    case 'room/add': {
      if (roomNameProblem(action.name, state.rooms) !== null) return state;
      const name = action.name.trim();
      // The form's input caps the length (ADD_ROOM.maxLength); the reducer
      // enforces it too, like the other room rules, so a dispatch that skips the form cannot overflow a card.
      if (name.length > ADD_ROOM.maxLength) return state;
      return {
        ...state,
        rooms: [...state.rooms, { id: `room-${state.nextRoomNumber}`, name }],
        nextRoomNumber: state.nextRoomNumber + 1,
        notice: `Added the room ${name}.`,
      };
    }
    case 'room/remove': {
      const room = state.rooms.find((candidate) => candidate.id === action.id);
      if (!room) return state;
      const count = state.devices.filter((device) => device.roomId === room.id).length;
      // A room can only go when it is empty: its devices would have nowhere to be.
      if (count > 0) {
        return { ...state, notice: `${room.name} still has ${count} ${count === 1 ? 'device' : 'devices'}. Remove ${count === 1 ? 'it' : 'them'} first.` };
      }
      return {
        ...state,
        rooms: state.rooms.filter((candidate) => candidate.id !== room.id),
        roomFilter: state.roomFilter === room.id ? null : state.roomFilter,
        notice: `Removed the room ${room.name}.`,
      };
    }
    case 'filter/set':
      return { ...state, roomFilter: action.roomId };
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
