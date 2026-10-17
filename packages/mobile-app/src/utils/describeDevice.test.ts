import { describe, it, expect } from 'vitest';
import { STARTING_DEVICES } from '../data/devices';
import type { Device } from '../data/types';
import { describeDevice } from './describeDevice';

const byId = (id: string): Device => STARTING_DEVICES.find((device) => device.id === id)!;

describe('describeDevice', () => {
  it('shows a light as its brightness when on and Off when off', () => {
    expect(describeDevice(byId('desk-lamp'), 'C')).toBe('70%');
    expect(describeDevice(byId('bedside-lamp'), 'C')).toBe('Off');
  });

  it('shows a plug as On or Off', () => {
    expect(describeDevice(byId('tv-plug'), 'C')).toBe('On');
    expect(describeDevice(byId('fan-plug'), 'C')).toBe('Off');
  });

  it('shows a thermostat target in the chosen unit', () => {
    expect(describeDevice(byId('hall-thermostat'), 'C')).toBe('Target 20 °C');
    expect(describeDevice(byId('hall-thermostat'), 'F')).toBe('Target 68 °F');
  });

  it('shows a sensor as its reading in the chosen unit', () => {
    expect(describeDevice(byId('living-sensor'), 'C')).toBe('21.5 °C');
    expect(describeDevice(byId('living-sensor'), 'F')).toBe('71 °F');
  });
});
