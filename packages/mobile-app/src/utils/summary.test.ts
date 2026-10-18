import { describe, it, expect } from 'vitest';
import { STARTING_DEVICES, STARTING_ROOMS } from '../data/devices';
import type { Device } from '../data/types';
import { attentionOf, homeSummary, isOn, needsAttention, roomName, roomNameProblem, roomOnText, roomStats, wattsOf } from './summary';

const byId = (id: string): Device => STARTING_DEVICES.find((device) => device.id === id)!;
const with_ = (id: string, change: Record<string, unknown>): Device => ({ ...byId(id), ...change }) as Device;

describe('attentionOf', () => {
  it('is empty for a healthy device', () => {
    expect(attentionOf(byId('desk-lamp'))).toEqual([]);
    expect(needsAttention(byId('desk-lamp'))).toBe(false);
  });

  it('names a lost link, a disconnected one, a weak signal and a low battery', () => {
    expect(attentionOf(byId('hall-light'))).toEqual(['lost']);
    expect(attentionOf(with_('desk-lamp', { link: 'offline' }))).toEqual(['offline']);
    expect(attentionOf(byId('fan-plug'))).toEqual(['weak']);
    expect(attentionOf(byId('bedroom-sensor'))).toEqual(['battery']);
  });

  it('does not call a signal weak when the link is down: there is no signal to be weak', () => {
    expect(attentionOf(with_('fan-plug', { link: 'lost' }))).toEqual(['lost']);
  });

  it('counts a signal of one bar as weak and two as fine', () => {
    expect(attentionOf(with_('desk-lamp', { signal: 1 }))).toEqual(['weak']);
    expect(attentionOf(with_('desk-lamp', { signal: 2 }))).toEqual([]);
  });
});

describe('isOn and wattsOf', () => {
  it('counts a device as on only when it is switched on and reachable', () => {
    expect(isOn(byId('desk-lamp'))).toBe(true);
    expect(isOn(byId('bedside-lamp'))).toBe(false);
    expect(isOn(with_('desk-lamp', { link: 'lost' }))).toBe(false);
    expect(isOn(byId('living-sensor'))).toBe(false);
  });

  it('draws a plug at its wattage while it is on, and nothing while it is off', () => {
    expect(wattsOf(byId('tv-plug'))).toBe(85);
    expect(wattsOf(byId('fan-plug'))).toBe(0);
  });

  it('draws a light in proportion to its level, so dimming it lowers the figure', () => {
    expect(wattsOf(with_('desk-lamp', { level: 100 }))).toBe(10);
    expect(wattsOf(with_('desk-lamp', { level: 50 }))).toBe(5);
    expect(wattsOf(with_('desk-lamp', { level: 5 }))).toBe(1);
    expect(wattsOf(with_('desk-lamp', { on: false }))).toBe(0);
  });

  it('draws nothing for a thermostat, a sensor or a device that cannot be reached', () => {
    expect(wattsOf(byId('hall-thermostat'))).toBe(0);
    expect(wattsOf(byId('living-sensor'))).toBe(0);
    expect(wattsOf(with_('tv-plug', { link: 'offline' }))).toBe(0);
  });
});

describe('roomStats and roomOnText', () => {
  it('counts the devices, the ones that can be switched, the ones on and the watts', () => {
    expect(roomStats(STARTING_DEVICES, 'living-room')).toEqual({ devices: 4, switchable: 3, on: 3, watts: 4 + 7 + 85 });
    expect(roomStats(STARTING_DEVICES, 'bedroom')).toEqual({ devices: 3, switchable: 2, on: 0, watts: 0 });
    expect(roomStats(STARTING_DEVICES, 'hall')).toEqual({ devices: 2, switchable: 2, on: 1, watts: 0 });
  });

  it('derives the total from the devices: the same list gives the same figure and a changed one changes it', () => {
    const before = roomStats(STARTING_DEVICES, 'living-room').watts;
    const after = roomStats(
      STARTING_DEVICES.map((device) => (device.id === 'tv-plug' ? ({ ...device, on: false } as Device) : device)),
      'living-room',
    ).watts;
    expect(before - after).toBe(85);
  });

  it('says how many are on, and nothing for a room with nothing to switch', () => {
    expect(roomOnText({ devices: 4, switchable: 3, on: 2, watts: 0 })).toBe('2 of 3 on');
    expect(roomOnText({ devices: 1, switchable: 0, on: 0, watts: 0 })).toBe('');
  });

  it('has no devices for a room id that does not exist', () => {
    expect(roomStats(STARTING_DEVICES, 'nowhere')).toEqual({ devices: 0, switchable: 0, on: 0, watts: 0 });
  });
});

describe('homeSummary', () => {
  it('says how many are on and how many need attention', () => {
    expect(homeSummary(STARTING_DEVICES)).toBe('4 on, 3 need attention');
  });

  it('says "needs" for one', () => {
    const one = STARTING_DEVICES.filter((device) => device.id !== 'fan-plug' && device.id !== 'hall-light');
    expect(homeSummary(one)).toBe('4 on, 1 needs attention');
  });

  it('leaves attention out when there is none', () => {
    expect(homeSummary(STARTING_DEVICES.filter((device) => !needsAttention(device)))).toBe('4 on');
  });

  it('says when nothing is on', () => {
    expect(homeSummary([byId('bedside-lamp')])).toBe('Nothing is on');
    expect(homeSummary([byId('bedside-lamp'), byId('hall-light')])).toBe('Nothing is on, 1 needs attention');
  });
});

describe('roomName and roomNameProblem', () => {
  it('finds a room by id', () => {
    expect(roomName(STARTING_ROOMS, 'hall')).toBe('Hall');
    expect(roomName(STARTING_ROOMS, 'nowhere')).toBe('');
  });

  it('requires a name, ignoring spaces', () => {
    expect(roomNameProblem('', STARTING_ROOMS)).toBe('required');
    expect(roomNameProblem('   ', STARTING_ROOMS)).toBe('required');
  });

  it('refuses a name that is taken, ignoring case and surrounding space', () => {
    expect(roomNameProblem('hall', STARTING_ROOMS)).toBe('duplicate');
    expect(roomNameProblem('  LIVING ROOM ', STARTING_ROOMS)).toBe('duplicate');
  });

  it('accepts a new name', () => {
    expect(roomNameProblem('Kitchen', STARTING_ROOMS)).toBeNull();
  });
});
