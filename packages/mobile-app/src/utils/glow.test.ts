import { describe, it, expect } from 'vitest';
import { STARTING_DEVICES } from '../data/devices';
import type { Device } from '../data/types';
import { TARGET_C } from './units';
import { bodyOpacity, glowLevel, haloOpacity, haloRadius } from './glow';

const byId = (id: string): Device => STARTING_DEVICES.find((device) => device.id === id)!;
const with_ = (id: string, change: Record<string, unknown>): Device => ({ ...byId(id), ...change }) as Device;

describe('glowLevel', () => {
  it('lights a light in proportion to its level while it is on, and not at all while it is off', () => {
    expect(glowLevel(with_('desk-lamp', { level: 70 }))).toBe(70);
    expect(glowLevel(with_('desk-lamp', { level: 20 }))).toBe(20);
    expect(glowLevel(with_('desk-lamp', { on: false }))).toBe(0);
  });

  it('lights a plug at one fixed brightness while it is on', () => {
    expect(glowLevel(byId('tv-plug'))).toBe(70);
    expect(glowLevel(byId('fan-plug'))).toBe(0);
  });

  it('lights a thermostat from cool to warm across its range, and not at all while it is off', () => {
    const cool = glowLevel(with_('hall-thermostat', { targetC: TARGET_C.min }));
    const warm = glowLevel(with_('hall-thermostat', { targetC: TARGET_C.max }));
    expect(cool).toBe(20);
    expect(warm).toBe(100);
    expect(glowLevel(byId('hall-thermostat'))).toBeGreaterThan(cool);
    expect(glowLevel(byId('hall-thermostat'))).toBeLessThan(warm);
    expect(glowLevel(with_('hall-thermostat', { on: false }))).toBe(0);
  });

  it('keeps a sensor faintly lit while it is reachable', () => {
    expect(glowLevel(byId('living-sensor'))).toBe(35);
  });

  it('puts out anything whose link is down, whatever it was doing', () => {
    for (const link of ['lost', 'offline']) {
      for (const id of ['desk-lamp', 'tv-plug', 'hall-thermostat', 'living-sensor']) expect(glowLevel(with_(id, { link })), `${id} ${link}`).toBe(0);
    }
  });
});

describe('the halo drawn for a level', () => {
  it('is absent at 0 and grows brighter and wider with the level', () => {
    expect(haloOpacity(0)).toBe(0);
    expect(haloRadius(0)).toBe(0);
    expect(bodyOpacity(0)).toBe(0);
    const levels = [5, 25, 50, 75, 100];
    for (const draw of [haloOpacity, haloRadius, bodyOpacity]) {
      const values = levels.map(draw);
      expect(values, draw.name).toEqual([...values].sort((a, b) => a - b));
      expect(new Set(values).size, draw.name).toBe(values.length);
    }
  });

  it('never makes a lit glyph invisible: the lowest level still has a halo', () => {
    expect(haloOpacity(5)).toBeGreaterThanOrEqual(0.15);
    expect(haloRadius(5)).toBeGreaterThan(14);
  });

  it('stays inside what the drawing allows at full level', () => {
    expect(haloOpacity(100)).toBe(1);
    expect(haloRadius(100)).toBe(48);
    expect(bodyOpacity(100)).toBeLessThanOrEqual(0.5);
  });
});
