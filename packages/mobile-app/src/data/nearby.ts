import type { LinkStep } from '../connection/types';
import type { NearbyDevice } from './types';

// MOCK: nothing is discovered. This is the fixed list the scripted scan
// (connection/scripted.ts) hands back after its progress bar, in this order.
// Each id doubles as the new device's id once it is added, so a device that is
// already in the list is left out of the next scan. Replace it by writing a
// real Connection (connection/types.ts).
export const NEARBY: readonly NearbyDevice[] = [
  { id: 'shelf-lamp', name: 'Shelf lamp', kind: 'light', signal: 4 },
  { id: 'kettle-plug', name: 'Kettle plug', kind: 'plug', signal: 3 },
  { id: 'porch-thermostat', name: 'Porch thermostat', kind: 'thermostat', signal: 2 },
  { id: 'garage-sensor', name: 'Garage sensor', kind: 'sensor', signal: 1 },
];

/**
 * Which devices the scripted link refuses, and where. ONE device is scripted to
 * fail on purpose, so the failure state (the step that failed, the message, a
 * Try again button) is visible without anyone breaking anything. It is the
 * Hall light, which is also the one lost device in the starting data: press
 * Reconnect on its page. Every other device links.
 */
export const LINK_FAILURES: Readonly<Record<string, { step: LinkStep; message: string }>> = {
  'hall-light': { step: 'securing', message: 'No response from the hub' },
};
