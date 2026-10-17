import { describe, it, expect } from 'vitest';
import { STARTING_DEVICES } from '../data/devices';
import { DEMO_NOTE } from '../data/product';
import type { Device } from '../data/types';
import { createInitialState, reducer, type Action, type AppState } from './reducer';

const start = (): AppState => createInitialState();
const device = (state: AppState, id: string): Device => state.devices.find((candidate) => candidate.id === id)!;
const run = (state: AppState, ...actions: Action[]) => actions.reduce(reducer, state);

describe('reducer', () => {
  it('starts from the starting data, with nothing to report', () => {
    const state = start();
    expect(state.devices).toEqual(STARTING_DEVICES);
    expect(state.sceneResult).toBeNull();
    expect(state.notice).toBeNull();
  });

  describe('device/toggle', () => {
    it('flips only the device it names', () => {
      const next = run(start(), { type: 'device/toggle', id: 'desk-lamp' });
      expect(device(next, 'desk-lamp')).toMatchObject({ on: false });
      expect(next.devices.filter((d) => d.id !== 'desk-lamp')).toEqual(STARTING_DEVICES.filter((d) => d.id !== 'desk-lamp'));
    });

    it('turns it back on with a second toggle, keeping the brightness it had', () => {
      const next = run(start(), { type: 'device/toggle', id: 'desk-lamp' }, { type: 'device/toggle', id: 'desk-lamp' });
      expect(device(next, 'desk-lamp')).toMatchObject({ on: true, brightness: 70 });
    });

    it('leaves an offline device and a sensor alone, and returns the same state object', () => {
      const state = start();
      expect(reducer(state, { type: 'device/toggle', id: 'hall-light' })).toBe(state);
      expect(reducer(state, { type: 'device/toggle', id: 'living-sensor' })).toBe(state);
      expect(reducer(state, { type: 'device/toggle', id: 'nope' })).toBe(state);
    });
  });

  describe('device/set-brightness', () => {
    it('sets a light and clamps to the slider range', () => {
      expect(device(run(start(), { type: 'device/set-brightness', id: 'desk-lamp', value: 35 }), 'desk-lamp')).toMatchObject({ brightness: 35 });
      expect(device(run(start(), { type: 'device/set-brightness', id: 'desk-lamp', value: 500 }), 'desk-lamp')).toMatchObject({ brightness: 100 });
      expect(device(run(start(), { type: 'device/set-brightness', id: 'desk-lamp', value: -5 }), 'desk-lamp')).toMatchObject({ brightness: 5 });
    });

    it('ignores a device that is not a light, or is offline', () => {
      const state = start();
      expect(reducer(state, { type: 'device/set-brightness', id: 'tv-plug', value: 30 })).toBe(state);
      expect(reducer(state, { type: 'device/set-brightness', id: 'hall-light', value: 30 })).toBe(state);
    });
  });

  describe('device/set-target', () => {
    it('sets a thermostat in Celsius and clamps to its range', () => {
      expect(device(run(start(), { type: 'device/set-target', id: 'hall-thermostat', valueC: 22.5 }), 'hall-thermostat')).toMatchObject({ targetC: 22.5 });
      expect(device(run(start(), { type: 'device/set-target', id: 'hall-thermostat', valueC: 99 }), 'hall-thermostat')).toMatchObject({ targetC: 30 });
      expect(device(run(start(), { type: 'device/set-target', id: 'hall-thermostat', valueC: 0 }), 'hall-thermostat')).toMatchObject({ targetC: 10 });
    });

    it('ignores a device that is not a thermostat', () => {
      const state = start();
      expect(reducer(state, { type: 'device/set-target', id: 'desk-lamp', valueC: 22 })).toBe(state);
    });
  });

  describe('device/add and device/remove', () => {
    it('adds an online device at the end, numbers the ids, and reports it with the demo sentence', () => {
      const next = run(
        start(),
        { type: 'device/add', draft: { name: 'Shelf lamp', room: 'Bedroom', kind: 'light' } },
        { type: 'device/add', draft: { name: 'Kettle plug', room: 'Hall', kind: 'plug' } },
      );
      expect(next.devices.slice(-2)).toEqual([
        { id: 'new-1', name: 'Shelf lamp', room: 'Bedroom', kind: 'light', status: 'online', on: false, brightness: 70 },
        { id: 'new-2', name: 'Kettle plug', room: 'Hall', kind: 'plug', status: 'online', on: false },
      ]);
      expect(next.notice).toBe(`Added Kettle plug to Hall. ${DEMO_NOTE}`);
    });

    it('gives each kind the fields it needs', () => {
      const next = run(
        start(),
        { type: 'device/add', draft: { name: 'A', room: 'Hall', kind: 'thermostat' } },
        { type: 'device/add', draft: { name: 'B', room: 'Hall', kind: 'sensor' } },
      );
      expect(device(next, 'new-1')).toMatchObject({ kind: 'thermostat', on: true, targetC: 20, currentC: 20 });
      expect(device(next, 'new-2')).toMatchObject({ kind: 'sensor', readingC: 20 });
    });

    it('removes only the named device', () => {
      const next = run(start(), { type: 'device/remove', id: 'tv-plug' });
      expect(next.devices.map((d) => d.id)).toEqual(STARTING_DEVICES.map((d) => d.id).filter((id) => id !== 'tv-plug'));
    });

    it('does not reuse an id after a removal', () => {
      const next = run(
        start(),
        { type: 'device/add', draft: { name: 'A', room: 'Hall', kind: 'plug' } },
        { type: 'device/remove', id: 'new-1' },
        { type: 'device/add', draft: { name: 'B', room: 'Hall', kind: 'plug' } },
      );
      expect(next.devices.at(-1)!.id).toBe('new-2');
    });
  });

  describe('scene/apply', () => {
    it('changes exactly the devices the scene lists that are not already as it wants them, and reports them', () => {
      const next = run(start(), { type: 'scene/apply', sceneId: 'good-night' });
      expect(next.sceneResult).toEqual({
        sceneId: 'good-night',
        // The bedside lamp is already off, so it is not "changed". The hall light is offline.
        changed: ['desk-lamp', 'tv-plug', 'fan-plug', 'hall-thermostat'],
        offline: ['hall-light'],
      });
      expect(device(next, 'desk-lamp')).toMatchObject({ on: false });
      expect(device(next, 'tv-plug')).toMatchObject({ on: false });
      expect(device(next, 'fan-plug')).toMatchObject({ on: true });
      expect(device(next, 'hall-thermostat')).toMatchObject({ targetC: 18 });
    });

    it('leaves devices it does not mention, and the offline device, untouched', () => {
      const next = run(start(), { type: 'scene/apply', sceneId: 'good-night' });
      expect(device(next, 'living-sensor')).toEqual(device(start(), 'living-sensor'));
      expect(device(next, 'bedroom-sensor')).toEqual(device(start(), 'bedroom-sensor'));
      expect(device(next, 'hall-light')).toEqual(device(start(), 'hall-light'));
    });

    it('sets brightness together with on/off', () => {
      const next = run(start(), { type: 'scene/apply', sceneId: 'morning' });
      expect(device(next, 'desk-lamp')).toMatchObject({ on: true, brightness: 80 });
      expect(device(next, 'bedside-lamp')).toMatchObject({ on: true, brightness: 60 });
    });

    it('passes over a device that has been removed', () => {
      const next = run(start(), { type: 'device/remove', id: 'fan-plug' }, { type: 'scene/apply', sceneId: 'good-night' });
      expect(next.sceneResult?.changed).not.toContain('fan-plug');
    });

    it('does nothing for a scene that does not exist', () => {
      const state = start();
      expect(reducer(state, { type: 'scene/apply', sceneId: 'nope' })).toBe(state);
    });
  });

  describe('settings', () => {
    it('changes the unit without touching any stored temperature', () => {
      const next = run(start(), { type: 'settings/set-unit', unit: 'F' });
      expect(next.settings.unit).toBe('F');
      expect(next.devices).toBe(start().devices);
      expect(device(next, 'hall-thermostat')).toMatchObject({ targetC: 20 });
    });

    it('changes each flag on its own', () => {
      const next = run(start(), { type: 'settings/set-flag', flag: 'remoteAccess', value: true });
      expect(next.settings).toEqual({ unit: 'C', alertOffline: true, remoteAccess: true });
      expect(run(next, { type: 'settings/set-flag', flag: 'alertOffline', value: false }).settings).toEqual({
        unit: 'C',
        alertOffline: false,
        remoteAccess: true,
      });
    });
  });

  it('dismisses the notice', () => {
    const added = run(start(), { type: 'device/add', draft: { name: 'A', room: 'Hall', kind: 'plug' } });
    expect(run(added, { type: 'notice/dismiss' }).notice).toBeNull();
  });

  it('throws for an action it does not know, instead of ignoring it', () => {
    expect(() => reducer(start(), { type: 'nope' } as unknown as Action)).toThrow(/Unhandled action/);
  });
});
