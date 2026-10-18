import type { Device, Room } from './types';

/** What a light's level allows, in percent. The reducer clamps to the same range. */
export const LEVEL = { min: 5, max: 100, step: 5 } as const;

// MOCK: these rooms and devices do not exist. Switching one, moving a slider or
// pressing a preset changes this in-memory list and nothing else; no message
// is sent to anything, and a reload puts the list back as it is here
// (state/reducer.ts). The link (connected, lost, offline), the signal, the
// latency, the battery and the wattage are fixed here, not measured: a device
// never drops by itself. Names are generic on purpose. Replace the lists with
// whatever your hub or backend returns; keep at least one of every kind and
// one device that is lost, weak and low on battery while you work so each state
// is visible without interaction (devices.test.ts checks that).
export const STARTING_ROOMS: Room[] = [
  { id: 'living-room', name: 'Living room' },
  { id: 'bedroom', name: 'Bedroom' },
  { id: 'hall', name: 'Hall' },
];

export const STARTING_DEVICES: Device[] = [
  { id: 'floor-lamp', name: 'Floor lamp', roomId: 'living-room', kind: 'light', link: 'connected', signal: 4, latencyMs: 14, on: true, level: 35, watts: 12 },
  { id: 'desk-lamp', name: 'Desk lamp', roomId: 'living-room', kind: 'light', link: 'connected', signal: 4, latencyMs: 12, on: true, level: 70, watts: 10 },
  { id: 'tv-plug', name: 'TV plug', roomId: 'living-room', kind: 'plug', link: 'connected', signal: 3, latencyMs: 22, on: true, watts: 85 },
  { id: 'living-sensor', name: 'Living room sensor', roomId: 'living-room', kind: 'sensor', link: 'connected', signal: 3, latencyMs: 31, readingC: 21.5, batteryLow: false },
  { id: 'bedside-lamp', name: 'Bedside lamp', roomId: 'bedroom', kind: 'light', link: 'connected', signal: 4, latencyMs: 16, on: false, level: 40, watts: 8 },
  { id: 'fan-plug', name: 'Fan plug', roomId: 'bedroom', kind: 'plug', link: 'connected', signal: 1, latencyMs: 96, on: false, watts: 35 },
  { id: 'bedroom-sensor', name: 'Bedroom sensor', roomId: 'bedroom', kind: 'sensor', link: 'connected', signal: 2, latencyMs: 44, readingC: 19, batteryLow: true },
  { id: 'hall-thermostat', name: 'Hall thermostat', roomId: 'hall', kind: 'thermostat', link: 'connected', signal: 4, latencyMs: 18, on: true, targetC: 20, currentC: 19.5 },
  { id: 'hall-light', name: 'Hall light', roomId: 'hall', kind: 'light', link: 'lost', signal: 2, latencyMs: 60, on: false, level: 50, watts: 9 },
];
