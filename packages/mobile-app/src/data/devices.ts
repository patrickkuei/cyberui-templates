import type { Device } from './types';

/** What a light's brightness slider allows, in percent. The reducer clamps to the same range. */
export const BRIGHTNESS = { min: 5, max: 100, step: 5 } as const;

// MOCK: these devices do not exist. Switching one, moving a slider or applying
// a scene changes this in-memory list and nothing else; no message is sent to
// anything, and a reload puts the list back as it is here (state/reducer.ts).
// Status (online, low battery, offline) is fixed here, not detected: a device
// never goes offline by itself. Names are generic on purpose. Replace the list
// with whatever your hub or backend returns; keep at least one of every kind
// and status while you work so each state is visible without interaction
// (devices.test.ts checks that for the starting data).
export const STARTING_DEVICES: Device[] = [
  { id: 'desk-lamp', name: 'Desk lamp', room: 'Living room', kind: 'light', status: 'online', on: true, brightness: 70 },
  { id: 'tv-plug', name: 'TV plug', room: 'Living room', kind: 'plug', status: 'online', on: true },
  { id: 'living-sensor', name: 'Living room sensor', room: 'Living room', kind: 'sensor', status: 'online', readingC: 21.5 },
  { id: 'bedside-lamp', name: 'Bedside lamp', room: 'Bedroom', kind: 'light', status: 'online', on: false, brightness: 40 },
  { id: 'fan-plug', name: 'Fan plug', room: 'Bedroom', kind: 'plug', status: 'online', on: false },
  { id: 'bedroom-sensor', name: 'Bedroom sensor', room: 'Bedroom', kind: 'sensor', status: 'low-battery', readingC: 19 },
  { id: 'hall-thermostat', name: 'Hall thermostat', room: 'Hall', kind: 'thermostat', status: 'online', on: true, targetC: 20, currentC: 19.5 },
  { id: 'hall-light', name: 'Hall light', room: 'Hall', kind: 'light', status: 'offline', on: false, brightness: 50 },
];
