import { describe, it, expect } from 'vitest';
import { STARTING_DEVICES } from '../data/devices';
import type { Device } from '../data/types';
import { describeDevice } from './describeDevice';

const byId = (id: string): Device => STARTING_DEVICES.find((device) => device.id === id)!;
const with_ = (id: string, change: Record<string, unknown>): Device => ({ ...byId(id), ...change }) as Device;

describe('describeDevice', () => {
  it('shows a light as its level when on and Off when off', () => {
    expect(describeDevice(byId('desk-lamp'), 'C')).toBe('70%');
    expect(describeDevice(byId('bedside-lamp'), 'C')).toBe('Off');
  });

  it('shows a plug as On or Off', () => {
    expect(describeDevice(byId('tv-plug'), 'C')).toBe('On');
    expect(describeDevice(byId('fan-plug'), 'C')).toBe('Off');
  });

  it('shows a thermostat target as degrees in the chosen unit, and Off when it is off', () => {
    expect(describeDevice(byId('hall-thermostat'), 'C')).toBe('20°');
    expect(describeDevice(byId('hall-thermostat'), 'F')).toBe('68°');
    expect(describeDevice(with_('hall-thermostat', { on: false }), 'C')).toBe('Off');
  });

  it('shows a sensor as its reading in the chosen unit', () => {
    expect(describeDevice(byId('living-sensor'), 'C')).toBe('21.5°');
    expect(describeDevice(byId('living-sensor'), 'F')).toBe('71°');
  });

  it('shows the word for a link that is down instead of a state it may no longer be in', () => {
    expect(describeDevice(byId('hall-light'), 'C')).toBe('Lost');
    expect(describeDevice(with_('desk-lamp', { link: 'offline' }), 'C')).toBe('Offline');
    expect(describeDevice(with_('living-sensor', { link: 'lost' }), 'C')).toBe('Lost');
  });
});
