import { describe, it, expect } from 'vitest';
import { STARTING_DEVICES } from './devices';
import { DEVICE_KINDS, DEVICE_STATUSES, ROOMS } from './types';
import { KIND_LABELS } from './product';

describe('starting devices', () => {
  it('include every kind of device, so each one is visible without interaction', () => {
    expect(new Set(STARTING_DEVICES.map((device) => device.kind))).toEqual(new Set(DEVICE_KINDS));
  });

  it('include every status, including a low-battery and an offline device', () => {
    expect(new Set(STARTING_DEVICES.map((device) => device.status))).toEqual(new Set(DEVICE_STATUSES));
  });

  it('use distinct ids and distinct names, in rooms that exist', () => {
    expect(new Set(STARTING_DEVICES.map((device) => device.id)).size).toBe(STARTING_DEVICES.length);
    expect(new Set(STARTING_DEVICES.map((device) => device.name)).size).toBe(STARTING_DEVICES.length);
    for (const device of STARTING_DEVICES) expect(ROOMS).toContain(device.room);
  });

  it('keep the kind list and the kind labels in step, so a new kind needs a label', () => {
    expect(Object.keys(KIND_LABELS).sort()).toEqual([...DEVICE_KINDS].sort());
  });

  it('keep temperatures in a sane Celsius range', () => {
    for (const device of STARTING_DEVICES) {
      if (device.kind === 'thermostat') expect([device.targetC, device.currentC].every((c) => c >= 5 && c <= 35)).toBe(true);
      if (device.kind === 'sensor') expect(device.readingC).toBeGreaterThanOrEqual(5);
    }
  });
});
