import type { Device, Room } from '../data/types';

// What the app says about a set of devices, derived from the devices themselves
// and never stored: a total kept in state is a total that can disagree with the
// devices it sums. Everything here is a pure function of the device list, so
// Home, Rooms and the device page cannot drift apart.

export type Attention = 'lost' | 'offline' | 'weak' | 'battery';

/** A signal of this many bars or fewer counts as weak. */
export const WEAK_SIGNAL = 1;

export const isReachable = (device: Device): boolean => device.link === 'connected';

/** Lights, plugs and thermostats have a power state; sensors only report. */
export type Switchable = Exclude<Device, { kind: 'sensor' }>;
export const isSwitchable = (device: Device): device is Switchable => device.kind !== 'sensor';

/** On means switched on and reachable. A device whose link is down has no state we can trust, so it is not counted as on. */
export const isOn = (device: Device): boolean => isSwitchable(device) && isReachable(device) && device.on;

/** Why a device needs a look, in the order a person should read them. Empty when nothing is wrong. */
export function attentionOf(device: Device): Attention[] {
  const reasons: Attention[] = [];
  if (device.link === 'lost') reasons.push('lost');
  if (device.link === 'offline') reasons.push('offline');
  if (isReachable(device) && device.signal <= WEAK_SIGNAL) reasons.push('weak');
  if (device.kind === 'sensor' && device.batteryLow) reasons.push('battery');
  return reasons;
}

export const needsAttention = (device: Device): boolean => attentionOf(device).length > 0;

/**
 * The invented draw of one device in watts. A plug draws its wattage while it
 * is on; a light draws its wattage in proportion to its level, so dimming it
 * lowers the room's figure. Thermostats and sensors are not metered.
 */
export function wattsOf(device: Device): number {
  if (!isOn(device)) return 0;
  if (device.kind === 'light') return Math.round((device.watts * device.level) / 100);
  if (device.kind === 'plug') return device.watts;
  return 0;
}

export interface RoomStats {
  devices: number;
  /** Devices that have a power state (everything except sensors). */
  switchable: number;
  on: number;
  watts: number;
}

export function roomStats(devices: readonly Device[], roomId: string): RoomStats {
  const inRoom = devices.filter((device) => device.roomId === roomId);
  return {
    devices: inRoom.length,
    switchable: inRoom.filter(isSwitchable).length,
    on: inRoom.filter(isOn).length,
    watts: inRoom.reduce((sum, device) => sum + wattsOf(device), 0),
  };
}

/** "3 of 3 on", or nothing for a room that has nothing to switch. */
export function roomOnText(stats: RoomStats): string {
  return stats.switchable === 0 ? '' : `${stats.on} of ${stats.switchable} on`;
}

/**
 * The one sentence at the top of Home: "4 on, 2 need attention". Attention is
 * only mentioned when there is some, so a quiet home is a short sentence.
 */
export function homeSummary(devices: readonly Device[]): string {
  const on = devices.filter(isOn).length;
  const attention = devices.filter(needsAttention).length;
  const onText = on === 0 ? 'Nothing is on' : `${on} on`;
  if (attention === 0) return onText;
  return `${onText}, ${attention} ${attention === 1 ? 'needs' : 'need'} attention`;
}

export function roomName(rooms: readonly Room[], roomId: string): string {
  return rooms.find((room) => room.id === roomId)?.name ?? '';
}

/**
 * Checks a new room's name against the rules: required, and unique ignoring
 * case and surrounding space. Returns the problem, or null when it is fine. The
 * form shows it and the reducer enforces it, so a dispatch that skips the form
 * still cannot create a duplicate.
 */
export function roomNameProblem(name: string, rooms: readonly Room[]): 'required' | 'duplicate' | null {
  const wanted = name.trim().toLowerCase();
  if (wanted === '') return 'required';
  return rooms.some((room) => room.name.trim().toLowerCase() === wanted) ? 'duplicate' : null;
}
