import { describe, it, expect } from 'vitest';
import { STARTING_DEVICES } from '../data/devices';
import type { Device } from '../data/types';
import { createInitialState, reducer, type Action, type AppState } from './reducer';

const start = (): AppState => createInitialState();
const device = (state: AppState, id: string): Device => state.devices.find((candidate) => candidate.id === id)!;
const run = (state: AppState, ...actions: Action[]): AppState => actions.reduce(reducer, state);

describe('reducer', () => {
  it('starts from the starting data, with no filter and no notice', () => {
    const state = start();
    expect(state.devices).toBe(STARTING_DEVICES);
    expect(state.roomFilter).toBeNull();
    expect(state.notice).toBeNull();
  });

  describe('device/toggle', () => {
    it('flips only that device', () => {
      const next = reducer(start(), { type: 'device/toggle', id: 'desk-lamp' });
      expect(device(next, 'desk-lamp')).toMatchObject({ on: false });
      expect(device(next, 'tv-plug')).toMatchObject({ on: true });
      expect(device(next, 'bedside-lamp')).toMatchObject({ on: false });
    });

    it('does nothing for a device that is lost or offline, or one that does not exist', () => {
      const state = start();
      expect(reducer(state, { type: 'device/toggle', id: 'hall-light' })).toBe(state);
      expect(reducer(state, { type: 'device/toggle', id: 'nope' })).toBe(state);
      const offline = run(state, { type: 'device/disconnect', id: 'desk-lamp' });
      expect(reducer(offline, { type: 'device/toggle', id: 'desk-lamp' })).toBe(offline);
    });

    it('does nothing for a sensor, which has no power', () => {
      const state = start();
      expect(reducer(state, { type: 'device/toggle', id: 'living-sensor' })).toBe(state);
    });
  });

  describe('device/set-level', () => {
    it('sets the level and switches the light on, so the slider never leaves a dark light at 80%', () => {
      const next = reducer(start(), { type: 'device/set-level', id: 'bedside-lamp', value: 80 });
      expect(device(next, 'bedside-lamp')).toMatchObject({ on: true, level: 80 });
    });

    it('keeps the level inside what a light allows', () => {
      expect(device(reducer(start(), { type: 'device/set-level', id: 'desk-lamp', value: 500 }), 'desk-lamp')).toMatchObject({ level: 100 });
      expect(device(reducer(start(), { type: 'device/set-level', id: 'desk-lamp', value: 0 }), 'desk-lamp')).toMatchObject({ level: 5 });
    });

    it('ignores a device that is not a light, and one that cannot be reached', () => {
      const state = start();
      expect(reducer(state, { type: 'device/set-level', id: 'tv-plug', value: 50 })).toBe(state);
      expect(reducer(state, { type: 'device/set-level', id: 'hall-light', value: 50 })).toBe(state);
    });
  });

  describe('device/set-target', () => {
    it('sets the target in Celsius, inside the allowed range, and switches the thermostat on', () => {
      const off = run(start(), { type: 'device/preset', id: 'hall-thermostat', presetId: 'off' });
      expect(device(off, 'hall-thermostat')).toMatchObject({ on: false });
      const next = reducer(off, { type: 'device/set-target', id: 'hall-thermostat', valueC: 21.5 });
      expect(device(next, 'hall-thermostat')).toMatchObject({ on: true, targetC: 21.5 });
      expect(device(reducer(start(), { type: 'device/set-target', id: 'hall-thermostat', valueC: 99 }), 'hall-thermostat')).toMatchObject({ targetC: 30 });
      expect(device(reducer(start(), { type: 'device/set-target', id: 'hall-thermostat', valueC: 1 }), 'hall-thermostat')).toMatchObject({ targetC: 10 });
    });

    it('ignores anything that is not a thermostat', () => {
      const state = start();
      expect(reducer(state, { type: 'device/set-target', id: 'desk-lamp', valueC: 21 })).toBe(state);
    });
  });

  describe('device/preset', () => {
    it('sets a light to the level of the preset and switches it on', () => {
      const night = reducer(start(), { type: 'device/preset', id: 'bedside-lamp', presetId: 'night' });
      expect(device(night, 'bedside-lamp')).toMatchObject({ on: true, level: 5 });
      const reading = reducer(start(), { type: 'device/preset', id: 'desk-lamp', presetId: 'reading' });
      expect(device(reading, 'desk-lamp')).toMatchObject({ on: true, level: 80 });
      const movie = reducer(start(), { type: 'device/preset', id: 'desk-lamp', presetId: 'movie' });
      expect(device(movie, 'desk-lamp')).toMatchObject({ level: 25 });
    });

    it('sets a thermostat to Heat or Eco, or switches it off and keeps its target', () => {
      expect(device(reducer(start(), { type: 'device/preset', id: 'hall-thermostat', presetId: 'heat' }), 'hall-thermostat')).toMatchObject({ on: true, targetC: 22 });
      expect(device(reducer(start(), { type: 'device/preset', id: 'hall-thermostat', presetId: 'eco' }), 'hall-thermostat')).toMatchObject({ on: true, targetC: 18 });
      expect(device(reducer(start(), { type: 'device/preset', id: 'hall-thermostat', presetId: 'off' }), 'hall-thermostat')).toMatchObject({ on: false, targetC: 20 });
      // Off keeps whatever the target was, so switching it on again brings that back.
      const warm = run(start(), { type: 'device/set-target', id: 'hall-thermostat', valueC: 24 }, { type: 'device/preset', id: 'hall-thermostat', presetId: 'off' });
      expect(device(warm, 'hall-thermostat')).toMatchObject({ on: false, targetC: 24 });
    });

    it('ignores a preset the device does not have, and a device that has none', () => {
      const state = start();
      expect(reducer(state, { type: 'device/preset', id: 'desk-lamp', presetId: 'heat' })).toBe(state);
      expect(reducer(state, { type: 'device/preset', id: 'tv-plug', presetId: 'night' })).toBe(state);
      expect(reducer(state, { type: 'device/preset', id: 'hall-light', presetId: 'night' })).toBe(state);
    });
  });

  describe('device/disconnect and device/reconnected', () => {
    it('marks a connected device offline, and keeps its signal for later', () => {
      const next = reducer(start(), { type: 'device/disconnect', id: 'desk-lamp' });
      expect(device(next, 'desk-lamp')).toMatchObject({ link: 'offline', signal: 4, latencyMs: 12 });
    });

    it('leaves a device that is already down as it is', () => {
      const state = start();
      expect(device(reducer(state, { type: 'device/disconnect', id: 'hall-light' }), 'hall-light').link).toBe('lost');
    });

    it('brings a lost or offline device back, with the state it had', () => {
      const back = reducer(start(), { type: 'device/reconnected', id: 'hall-light' });
      expect(device(back, 'hall-light')).toMatchObject({ link: 'connected', on: false, level: 50 });
      const round = run(start(), { type: 'device/disconnect', id: 'desk-lamp' }, { type: 'device/reconnected', id: 'desk-lamp' });
      expect(device(round, 'desk-lamp')).toMatchObject({ link: 'connected', on: true, level: 70 });
    });

    it('does nothing for an unknown id', () => {
      const state = start();
      expect(reducer(state, { type: 'device/disconnect', id: 'nope' })).toBe(state);
      expect(reducer(state, { type: 'device/reconnected', id: 'nope' })).toBe(state);
    });
  });

  describe('device/add', () => {
    it('adds a scanned device under its own id, in the room chosen, and says so', () => {
      const next = reducer(start(), { type: 'device/add', draft: { id: 'shelf-lamp', name: 'Shelf lamp', roomId: 'bedroom', kind: 'light', signal: 4 } });
      expect(device(next, 'shelf-lamp')).toMatchObject({ kind: 'light', roomId: 'bedroom', link: 'connected', on: false, signal: 4 });
      expect(next.notice).toBe('Added Shelf lamp to Bedroom.');
      expect(next.nextDeviceNumber).toBe(1);
    });

    it('numbers a device added by code, and starts it off where it has a switch', () => {
      const next = run(
        start(),
        { type: 'device/add', draft: { name: 'A', roomId: 'hall', kind: 'plug' } },
        { type: 'device/add', draft: { name: 'B', roomId: 'hall', kind: 'sensor' } },
      );
      expect(device(next, 'new-1')).toMatchObject({ kind: 'plug', on: false });
      expect(device(next, 'new-2')).toMatchObject({ kind: 'sensor', batteryLow: false });
      expect(next.nextDeviceNumber).toBe(3);
    });

    it('starts a thermostat on and a light off, whatever the kind says about the rest', () => {
      const next = run(
        start(),
        { type: 'device/add', draft: { name: 'T', roomId: 'hall', kind: 'thermostat' } },
        { type: 'device/add', draft: { name: 'L', roomId: 'hall', kind: 'light' } },
      );
      expect(device(next, 'new-1')).toMatchObject({ kind: 'thermostat', on: true });
      expect(device(next, 'new-2')).toMatchObject({ kind: 'light', on: false });
    });

    it('refuses an id that is taken and a room that does not exist', () => {
      const state = start();
      expect(reducer(state, { type: 'device/add', draft: { id: 'desk-lamp', name: 'X', roomId: 'hall', kind: 'light' } })).toBe(state);
      expect(reducer(state, { type: 'device/add', draft: { name: 'X', roomId: 'nowhere', kind: 'light' } })).toBe(state);
    });
  });

  describe('device/remove', () => {
    it('removes the device and says so', () => {
      const next = reducer(start(), { type: 'device/remove', id: 'desk-lamp' });
      expect(next.devices.map((d) => d.id)).not.toContain('desk-lamp');
      expect(next.devices).toHaveLength(STARTING_DEVICES.length - 1);
      expect(next.notice).toBe('Removed Desk lamp.');
    });

    it('does nothing for an unknown id', () => {
      const state = start();
      expect(reducer(state, { type: 'device/remove', id: 'nope' })).toBe(state);
    });
  });

  describe('room/turn-off', () => {
    it('switches off what is on in that room only', () => {
      const next = reducer(start(), { type: 'room/turn-off', id: 'living-room' });
      expect(device(next, 'desk-lamp')).toMatchObject({ on: false });
      expect(device(next, 'floor-lamp')).toMatchObject({ on: false });
      expect(device(next, 'tv-plug')).toMatchObject({ on: false });
      expect(device(next, 'hall-thermostat')).toMatchObject({ on: true });
    });

    it('does not touch a device that cannot be reached, whose state is not known', () => {
      const lostOn = { ...device(start(), 'hall-light'), on: true } as Device;
      const state = { ...start(), devices: start().devices.map((d) => (d.id === 'hall-light' ? lostOn : d)) };
      const next = reducer(state, { type: 'room/turn-off', id: 'hall' });
      expect(device(next, 'hall-light')).toMatchObject({ on: true });
      expect(device(next, 'hall-thermostat')).toMatchObject({ on: false });
    });
  });

  describe('room/add', () => {
    it('adds a room with a numbered id, trimmed, and says so', () => {
      const next = reducer(start(), { type: 'room/add', name: '  Kitchen ' });
      expect(next.rooms.at(-1)).toEqual({ id: 'room-1', name: 'Kitchen' });
      expect(next.notice).toBe('Added the room Kitchen.');
      expect(next.nextRoomNumber).toBe(2);
    });

    it('refuses an empty name and a name that is taken, whatever its case', () => {
      const state = start();
      expect(reducer(state, { type: 'room/add', name: '   ' })).toBe(state);
      expect(reducer(state, { type: 'room/add', name: 'hall' })).toBe(state);
      expect(reducer(state, { type: 'room/add', name: 'LIVING ROOM' })).toBe(state);
    });
  });

  describe('room/remove', () => {
    it('removes a room that is empty', () => {
      const next = run(start(), { type: 'room/add', name: 'Kitchen' }, { type: 'room/remove', id: 'room-1' });
      expect(next.rooms.map((room) => room.id)).toEqual(['living-room', 'bedroom', 'hall']);
      expect(next.notice).toBe('Removed the room Kitchen.');
    });

    it('refuses a room that still has devices, and says how many, in the singular and the plural', () => {
      const state = start();
      const blocked = reducer(state, { type: 'room/remove', id: 'living-room' });
      expect(blocked.rooms).toBe(state.rooms);
      expect(blocked.notice).toBe('Living room still has 4 devices. Remove them first.');
      const one = run(
        start(),
        { type: 'device/remove', id: 'hall-light' },
        { type: 'room/remove', id: 'hall' },
      );
      expect(one.rooms.map((room) => room.id)).toContain('hall');
      expect(one.notice).toBe('Hall still has 1 device. Remove it first.');
    });

    it('clears the home filter if it pointed at the room that went', () => {
      const next = run(start(), { type: 'room/add', name: 'Kitchen' }, { type: 'filter/set', roomId: 'room-1' }, { type: 'room/remove', id: 'room-1' });
      expect(next.roomFilter).toBeNull();
      const other = run(start(), { type: 'room/add', name: 'Kitchen' }, { type: 'filter/set', roomId: 'hall' }, { type: 'room/remove', id: 'room-1' });
      expect(other.roomFilter).toBe('hall');
    });

    it('does nothing for an unknown id', () => {
      const state = start();
      expect(reducer(state, { type: 'room/remove', id: 'nope' })).toBe(state);
    });
  });

  it('sets and clears the room filter', () => {
    const next = reducer(start(), { type: 'filter/set', roomId: 'hall' });
    expect(next.roomFilter).toBe('hall');
    expect(reducer(next, { type: 'filter/set', roomId: null }).roomFilter).toBeNull();
  });

  it('sets the unit and the two flags, each on its own', () => {
    const unit = reducer(start(), { type: 'settings/set-unit', unit: 'F' });
    expect(unit.settings).toEqual({ unit: 'F', alertOffline: true, remoteAccess: false });
    const alerts = reducer(start(), { type: 'settings/set-flag', flag: 'alertOffline', value: false });
    expect(alerts.settings).toEqual({ unit: 'C', alertOffline: false, remoteAccess: false });
    const remote = reducer(start(), { type: 'settings/set-flag', flag: 'remoteAccess', value: true });
    expect(remote.settings).toEqual({ unit: 'C', alertOffline: true, remoteAccess: true });
  });

  it('dismisses the notice', () => {
    const noticed = reducer(start(), { type: 'device/remove', id: 'desk-lamp' });
    expect(noticed.notice).not.toBeNull();
    expect(reducer(noticed, { type: 'notice/dismiss' }).notice).toBeNull();
  });

  it('throws on an action it does not know, instead of ignoring it', () => {
    expect(() => reducer(start(), { type: 'nope' } as unknown as Action)).toThrow(/Unhandled action/);
  });

  it('never mutates the state it was given', () => {
    const state = start();
    const frozen = JSON.stringify(state);
    run(
      state,
      { type: 'device/toggle', id: 'desk-lamp' },
      { type: 'room/turn-off', id: 'hall' },
      { type: 'room/add', name: 'Kitchen' },
      { type: 'device/remove', id: 'tv-plug' },
    );
    expect(JSON.stringify(state)).toBe(frozen);
  });
});
