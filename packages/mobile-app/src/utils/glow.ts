import { isReachable } from './summary';
import { TARGET_C } from './units';
import type { Device } from '../data/types';

// How lit a device's glyph is. This is the app's one bold idea (README,
// "Light is state"): a device that is on glows in the accent in proportion to
// its level, a device that is off is dark. Everything here is a plain number,
// so the drawing (components/Glyph.tsx) stays dumb and the rule is testable
// without a browser.

/**
 * 0 (dark) to 100 (as bright as it gets).
 *  - a light glows with its level while it is on;
 *  - a plug has no level, so it glows at a fixed brightness while it is on;
 *  - a thermostat glows with its target, from cool to warm across TARGET_C;
 *  - a sensor is always on, so it keeps a faint steady glow while it is reachable;
 *  - anything whose link is down is dark, whatever its last state was.
 */
export function glowLevel(device: Device): number {
  if (!isReachable(device)) return 0;
  switch (device.kind) {
    case 'light':
      return device.on ? device.level : 0;
    case 'plug':
      return device.on ? 70 : 0;
    case 'thermostat':
      return device.on ? Math.round(20 + (80 * (device.targetC - TARGET_C.min)) / (TARGET_C.max - TARGET_C.min)) : 0;
    case 'sensor':
      return 35;
  }
}

/** The halo's opacity: never invisible while something is lit, brighter in proportion to the level. */
export const haloOpacity = (level: number): number => (level <= 0 ? 0 : Math.round((0.15 + 0.85 * (level / 100)) * 100) / 100);

/** The halo's radius in the glyph's 64-unit box: it grows with the level. */
export const haloRadius = (level: number): number => (level <= 0 ? 0 : Math.round(14 + (34 * level) / 100));

/** How much the glyph's body fills with the accent: faint at low levels, 40% at full. */
export const bodyOpacity = (level: number): number => (level <= 0 ? 0 : Math.round(level * 0.4) / 100);
