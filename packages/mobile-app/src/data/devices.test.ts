import { describe, it, expect } from 'vitest';
import { LINK_FAILURES, NEARBY } from './nearby';
import { STARTING_DEVICES, STARTING_ROOMS } from './devices';
import { DEVICE_KINDS, LINK_STATES } from './types';
import { KIND_LABELS } from './product';
import { attentionOf } from '../utils/summary';

describe('starting devices', () => {
  it('include every kind of device, so each one is visible without interaction', () => {
    expect(new Set(STARTING_DEVICES.map((device) => device.kind))).toEqual(new Set(DEVICE_KINDS));
  });

  it('include a connected device and a lost one, and every reason to look at a device', () => {
    expect(new Set(STARTING_DEVICES.map((device) => device.link))).toEqual(new Set(['connected', 'lost']));
    expect(LINK_STATES).toContain('offline'); // reached by pressing Disconnect, not present at the start
    const reasons = new Set(STARTING_DEVICES.flatMap(attentionOf));
    expect(reasons).toEqual(new Set(['lost', 'weak', 'battery']));
  });

  it('include lights that are at different levels and a light that is off, so the glow differs', () => {
    const lights = STARTING_DEVICES.flatMap((device) => (device.kind === 'light' ? [device] : []));
    expect(new Set(lights.filter((light) => light.on).map((light) => light.level)).size).toBeGreaterThanOrEqual(2);
    expect(lights.some((light) => !light.on)).toBe(true);
  });

  it('use distinct ids and distinct names, in rooms that exist', () => {
    expect(new Set(STARTING_DEVICES.map((device) => device.id)).size).toBe(STARTING_DEVICES.length);
    expect(new Set(STARTING_DEVICES.map((device) => device.name)).size).toBe(STARTING_DEVICES.length);
    const roomIds = STARTING_ROOMS.map((room) => room.id);
    for (const device of STARTING_DEVICES) expect(roomIds).toContain(device.roomId);
  });

  it('have rooms with distinct ids and names, and every room has a device to show', () => {
    expect(new Set(STARTING_ROOMS.map((room) => room.id)).size).toBe(STARTING_ROOMS.length);
    expect(new Set(STARTING_ROOMS.map((room) => room.name.toLowerCase())).size).toBe(STARTING_ROOMS.length);
    for (const room of STARTING_ROOMS) expect(STARTING_DEVICES.some((device) => device.roomId === room.id)).toBe(true);
  });

  it('keep the kind list and the kind labels in step, so a new kind needs a label', () => {
    expect(Object.keys(KIND_LABELS).sort()).toEqual([...DEVICE_KINDS].sort());
  });

  it('keep signals, latencies and temperatures in sane ranges', () => {
    for (const device of STARTING_DEVICES) {
      expect(device.signal).toBeGreaterThanOrEqual(0);
      expect(device.signal).toBeLessThanOrEqual(4);
      expect(device.latencyMs).toBeGreaterThan(0);
      if (device.kind === 'thermostat') expect([device.targetC, device.currentC].every((c) => c >= 5 && c <= 35)).toBe(true);
      if (device.kind === 'sensor') expect(device.readingC).toBeGreaterThanOrEqual(5);
    }
  });
});

describe('the scripted data', () => {
  it('fails exactly one link on purpose, and it is the lost device, so the failure is visible', () => {
    const failing = Object.keys(LINK_FAILURES);
    expect(failing).toHaveLength(1);
    const device = STARTING_DEVICES.find((candidate) => candidate.id === failing[0]);
    expect(device?.link).toBe('lost');
    expect(LINK_FAILURES[failing[0]!]?.message).toBe('No response from the hub');
  });

  it('lists nearby devices whose ids do not collide with the starting devices', () => {
    expect(NEARBY.length).toBeGreaterThanOrEqual(3);
    const taken = new Set(STARTING_DEVICES.map((device) => device.id));
    for (const nearby of NEARBY) expect(taken.has(nearby.id), nearby.id).toBe(false);
    expect(new Set(NEARBY.map((nearby) => nearby.id)).size).toBe(NEARBY.length);
  });
});
