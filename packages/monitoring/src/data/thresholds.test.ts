import { describe, it, expect } from 'vitest';
import { ERROR_RATE_THRESHOLD_PCT, P95_LATENCY_THRESHOLD_MS, isErrorRateHigh, isLatencyHigh } from './thresholds';

describe('thresholds', () => {
  it('treats a value exactly on the limit as healthy and anything above as high', () => {
    expect(isErrorRateHigh(ERROR_RATE_THRESHOLD_PCT)).toBe(false);
    expect(isErrorRateHigh(ERROR_RATE_THRESHOLD_PCT + 0.01)).toBe(true);
    expect(isLatencyHigh(P95_LATENCY_THRESHOLD_MS)).toBe(false);
    expect(isLatencyHigh(P95_LATENCY_THRESHOLD_MS + 1)).toBe(true);
  });
});
