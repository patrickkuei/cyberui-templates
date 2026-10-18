import type { Device, TemperatureUnit } from '../data/types';
import { formatTemp } from './units';

/**
 * The short state line under a device's name ("70%", "Off", "Target 20 °C").
 * A Record<DeviceKind, ...> cannot be used here because each kind reads
 * different fields, so this is a switch over the kind, and TypeScript fails the
 * build if a new kind is added without a case (the function would not return).
 */
export function describeDevice(device: Device, unit: TemperatureUnit): string {
  switch (device.kind) {
    case 'light':
      return device.on ? `${device.brightness}%` : 'Off';
    case 'plug':
      return device.on ? 'On' : 'Off';
    case 'thermostat':
      return device.on ? `Target ${formatTemp(device.targetC, unit)}` : 'Off';
    case 'sensor':
      return formatTemp(device.readingC, unit);
  }
}
