import { describe, it, expect } from 'vitest';
import { TARGET_C, formatDegrees, formatTemp, fromDisplay, nudge, sliderScale, toDisplay } from './units';

describe('units', () => {
  it('converts Celsius to Fahrenheit for display', () => {
    expect(toDisplay(0, 'F')).toBe(32);
    expect(toDisplay(21, 'F')).toBeCloseTo(69.8);
    expect(toDisplay(21, 'C')).toBe(21);
  });

  it('formats half degrees in Celsius and whole degrees in Fahrenheit', () => {
    expect(formatTemp(21, 'C')).toBe('21 °C');
    expect(formatTemp(19.5, 'C')).toBe('19.5 °C');
    expect(formatTemp(21, 'F')).toBe('70 °F');
    expect(formatTemp(19.5, 'F')).toBe('67 °F');
  });

  it('formats the big numerals as the number and a degree sign, in either unit', () => {
    expect(formatDegrees(21, 'C')).toBe('21°');
    expect(formatDegrees(19.5, 'C')).toBe('19.5°');
    expect(formatDegrees(21, 'F')).toBe('70°');
  });

  it('scales the slider to the same range in either unit', () => {
    expect(sliderScale('C')).toEqual({ min: 10, max: 30, step: 0.5 });
    expect(sliderScale('F')).toEqual({ min: 50, max: 86, step: 1 });
  });

  it('snaps a picked value to half a degree Celsius, inside the allowed range', () => {
    expect(fromDisplay(21.3, 'C')).toBe(21.5);
    expect(fromDisplay(5, 'C')).toBe(TARGET_C.min);
    expect(fromDisplay(99, 'C')).toBe(TARGET_C.max);
    expect(fromDisplay(70, 'F')).toBe(21);
  });

  it('gives back the same whole Fahrenheit degree after storing it as Celsius, for every degree on the slider', () => {
    const { min, max } = sliderScale('F');
    for (let fahrenheit = min; fahrenheit <= max; fahrenheit++) {
      const stored = fromDisplay(fahrenheit, 'F');
      expect(Math.round(toDisplay(stored, 'F')), `${fahrenheit} °F`).toBe(fahrenheit);
    }
  });

  describe('nudge, one press of plus or minus', () => {
    it('moves half a degree in Celsius', () => {
      expect(nudge(20, 1, 'C')).toBe(20.5);
      expect(nudge(20, -1, 'C')).toBe(19.5);
    });

    it('moves a whole degree in Fahrenheit, so the shown number changes by exactly one', () => {
      expect(Math.round(toDisplay(nudge(20, 1, 'F'), 'F'))).toBe(69);
      expect(Math.round(toDisplay(nudge(20, -1, 'F'), 'F'))).toBe(67);
    });

    it('stops at the ends of the range', () => {
      expect(nudge(TARGET_C.max, 1, 'C')).toBe(TARGET_C.max);
      expect(nudge(TARGET_C.min, -1, 'C')).toBe(TARGET_C.min);
    });
  });
});
