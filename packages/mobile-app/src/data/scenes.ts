import type { Scene } from './types';

// MOCK: a scene is a list of changes to the in-memory devices (state/reducer.ts,
// 'scene/apply'). It reaches no real device. A device that is offline is
// skipped and reported as such. Devices are named by id, so renaming one in
// data/devices.ts does not break a scene (scenes.test.ts checks every id and
// that each change fits its device's kind).
export const SCENES: Scene[] = [
  {
    id: 'good-night',
    name: 'Good night',
    summary: 'Lights and plugs off, fan on, heating turned down.',
    changes: [
      { deviceId: 'desk-lamp', patch: { on: false } },
      { deviceId: 'tv-plug', patch: { on: false } },
      { deviceId: 'bedside-lamp', patch: { on: false } },
      { deviceId: 'fan-plug', patch: { on: true } },
      { deviceId: 'hall-thermostat', patch: { targetC: 18 } },
      { deviceId: 'hall-light', patch: { on: false } },
    ],
  },
  {
    id: 'morning',
    name: 'Morning',
    summary: 'Lamps on, fan off, heating turned up.',
    changes: [
      { deviceId: 'desk-lamp', patch: { on: true, brightness: 80 } },
      { deviceId: 'bedside-lamp', patch: { on: true, brightness: 60 } },
      { deviceId: 'fan-plug', patch: { on: false } },
      { deviceId: 'hall-thermostat', patch: { on: true, targetC: 21 } },
    ],
  },
  {
    id: 'away',
    name: 'Away',
    summary: 'Everything off, heating turned right down.',
    changes: [
      { deviceId: 'desk-lamp', patch: { on: false } },
      { deviceId: 'bedside-lamp', patch: { on: false } },
      { deviceId: 'tv-plug', patch: { on: false } },
      { deviceId: 'fan-plug', patch: { on: false } },
      { deviceId: 'hall-thermostat', patch: { targetC: 16 } },
      { deviceId: 'hall-light', patch: { on: false } },
    ],
  },
];
