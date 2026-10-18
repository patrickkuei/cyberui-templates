// Fixed one-tap presets for the two kinds of device that have a level to set.
// They are data, not settings: nothing lets the person edit them, and a preset
// only ever changes the device whose page it is on (state/reducer.ts,
// 'device/preset'). MOCK, like everything that changes a device here.

export interface LightPreset {
  id: string;
  label: string;
  /** Percent. A light preset also turns the light on: pressing "Night" on a light that is off lights it. */
  level: number;
}

export interface ThermostatPreset {
  id: string;
  label: string;
  on: boolean;
  /** Degrees Celsius. Left out where the preset only switches the thermostat off (the target is kept). */
  targetC?: number;
}

export const LIGHT_PRESETS: readonly LightPreset[] = [
  { id: 'reading', label: 'Reading', level: 80 },
  { id: 'movie', label: 'Movie', level: 25 },
  { id: 'night', label: 'Night', level: 5 },
];

export const THERMOSTAT_PRESETS: readonly ThermostatPreset[] = [
  { id: 'heat', label: 'Heat', on: true, targetC: 22 },
  { id: 'eco', label: 'Eco', on: true, targetC: 18 },
  { id: 'off', label: 'Off', on: false },
];
