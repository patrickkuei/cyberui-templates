import type { TemperatureUnit } from '../data/types';

// Temperatures are stored in degrees Celsius, always. The unit setting only
// changes how they are shown and how the target slider and the plus and minus
// buttons are scaled, so switching unit never loses precision and the state
// never holds two truths.

/** The thermostat's allowed target, in Celsius, and the step the stored value snaps to. */
export const TARGET_C = { min: 10, max: 30, step: 0.5 } as const;

export function toDisplay(celsius: number, unit: TemperatureUnit): number {
  return unit === 'C' ? celsius : (celsius * 9) / 5 + 32;
}

/** "21 °C", "19.5 °C", "70 °F": Celsius keeps its half degrees, Fahrenheit is whole degrees. For labels and speech. */
export function formatTemp(celsius: number, unit: TemperatureUnit): string {
  if (unit === 'F') return `${Math.round(toDisplay(celsius, 'F'))} °F`;
  return `${Number.isInteger(celsius) ? celsius : celsius.toFixed(1)} °C`;
}

/** "21°", "19.5°", "70°": the number and a degree sign, for the big numerals. The unit is in Settings and in the accessible name. */
export function formatDegrees(celsius: number, unit: TemperatureUnit): string {
  return formatTemp(celsius, unit).replace(/ °[CF]$/, '°');
}

/** The slider's scale in the unit being shown: the same range as TARGET_C, in whole degrees for Fahrenheit. */
export function sliderScale(unit: TemperatureUnit): { min: number; max: number; step: number } {
  return unit === 'C'
    ? { ...TARGET_C }
    : { min: toDisplay(TARGET_C.min, 'F'), max: toDisplay(TARGET_C.max, 'F'), step: 1 };
}

/**
 * Turns a value in the displayed unit back into the stored Celsius, snapped to
 * TARGET_C.step. A whole Fahrenheit degree is 0.56 °C, so snapping to half a
 * degree moves the value by at most 0.25 °C (0.45 °F): converting it back and
 * rounding to a whole degree returns the number that was picked
 * (units.test.ts checks every one).
 */
export function fromDisplay(value: number, unit: TemperatureUnit): number {
  const celsius = unit === 'C' ? value : ((value - 32) * 5) / 9;
  const snapped = Math.round(celsius / TARGET_C.step) * TARGET_C.step;
  return Math.min(TARGET_C.max, Math.max(TARGET_C.min, snapped));
}

/** One plus or minus press, in the displayed unit: half a degree Celsius, a whole degree Fahrenheit. */
export function nudge(celsius: number, direction: 1 | -1, unit: TemperatureUnit): number {
  const shown = Math.round(toDisplay(celsius, unit) / sliderScale(unit).step) * sliderScale(unit).step;
  return fromDisplay(shown + direction * sliderScale(unit).step, unit);
}
