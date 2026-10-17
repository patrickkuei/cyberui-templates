import { describe, it, expect } from 'vitest';
import { BRIGHTNESS, STARTING_DEVICES } from './devices';
import { SCENES } from './scenes';
import { TARGET_C } from '../utils/units';

describe('scenes', () => {
  it('has three scenes with distinct ids and names', () => {
    expect(SCENES).toHaveLength(3);
    expect(new Set(SCENES.map((scene) => scene.id)).size).toBe(3);
    expect(new Set(SCENES.map((scene) => scene.name)).size).toBe(3);
  });

  it('only changes devices that exist, once each, and only with fields their kind has', () => {
    for (const scene of SCENES) {
      const ids = scene.changes.map((change) => change.deviceId);
      expect(new Set(ids).size, `${scene.name} lists a device twice`).toBe(ids.length);
      for (const { deviceId, patch } of scene.changes) {
        const device = STARTING_DEVICES.find((candidate) => candidate.id === deviceId);
        expect(device, `${scene.name} names "${deviceId}", which is not a starting device`).toBeDefined();
        if (patch.brightness !== undefined) {
          expect(device!.kind, `${scene.name}: brightness on ${deviceId}`).toBe('light');
          expect(patch.brightness).toBeGreaterThanOrEqual(BRIGHTNESS.min);
          expect(patch.brightness).toBeLessThanOrEqual(BRIGHTNESS.max);
        }
        if (patch.targetC !== undefined) {
          expect(device!.kind, `${scene.name}: a target on ${deviceId}`).toBe('thermostat');
          expect(patch.targetC).toBeGreaterThanOrEqual(TARGET_C.min);
          expect(patch.targetC).toBeLessThanOrEqual(TARGET_C.max);
        }
        if (patch.on !== undefined) expect(device!.kind, `${scene.name}: on/off for ${deviceId}`).not.toBe('sensor');
      }
    }
  });

  it('reaches the offline device in at least one scene, so skipping it can be seen', () => {
    const offline = STARTING_DEVICES.filter((device) => device.status === 'offline').map((device) => device.id);
    expect(SCENES.some((scene) => scene.changes.some((change) => offline.includes(change.deviceId)))).toBe(true);
  });
});
