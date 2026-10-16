import { describe, it, expect } from 'vitest';
import { FEATURES } from './features';

describe('features', () => {
  it('has six features with distinct ids, titles and icons', () => {
    expect(FEATURES).toHaveLength(6);
    expect(new Set(FEATURES.map((feature) => feature.id)).size).toBe(6);
    expect(new Set(FEATURES.map((feature) => feature.title)).size).toBe(6);
    expect(new Set(FEATURES.map((feature) => feature.icon)).size).toBe(6);
  });
});
