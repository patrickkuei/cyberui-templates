import { LINK_WORDS } from '../data/product';
import type { Device, TemperatureUnit } from '../data/types';
import { formatDegrees } from './units';

/**
 * The one value a device shows at the right of its row ("70%", "On", "21.5°",
 * "Lost"). A device that cannot be reached shows the word for that instead of
 * a state it may no longer be in. The switch is on the kind rather than a
 * Record<DeviceKind, ...> because each kind reads different fields; TypeScript
 * fails the build if a new kind is added without a case (the function would not
 * return).
 */
export function describeDevice(device: Device, unit: TemperatureUnit): string {
  if (device.link !== 'connected') return LINK_WORDS[device.link];
  switch (device.kind) {
    case 'light':
      return device.on ? `${device.level}%` : 'Off';
    case 'plug':
      return device.on ? 'On' : 'Off';
    case 'thermostat':
      return device.on ? formatDegrees(device.targetC, unit) : 'Off';
    case 'sensor':
      return formatDegrees(device.readingC, unit);
  }
}
