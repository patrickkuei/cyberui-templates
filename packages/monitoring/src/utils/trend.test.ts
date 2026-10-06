import { describe, it, expect } from 'vitest';
import { describeRequestRate, describeLatency, describeErrorRate } from './trend';
import { ERROR_RATE_THRESHOLD_PCT, P95_LATENCY_THRESHOLD_MS } from '../data/thresholds';

describe('describeRequestRate', () => {
  // Baseline of these recent samples is 414.
  const recent = [400, 410, 420, 415, 425];

  it('reports steady when the current value is within ~8% of the recent average', () => {
    expect(describeRequestRate(440, recent)).toEqual({ text: 'steady', tone: 'default' });
    expect(describeRequestRate(390, recent)).toEqual({ text: 'steady', tone: 'default' });
  });
  it('reports rising when the current value is well above the recent average', () => {
    expect(describeRequestRate(500, recent)).toEqual({ text: 'rising', tone: 'success' });
  });
  it('reports falling, in a neutral tone, when the current value is well below the recent average', () => {
    expect(describeRequestRate(340, recent)).toEqual({ text: 'falling', tone: 'default' });
  });
  it('treats per-tick noise of about ±30 around the baseline as steady', () => {
    expect(describeRequestRate(444, recent)).toEqual({ text: 'steady', tone: 'default' });
    expect(describeRequestRate(384, recent)).toEqual({ text: 'steady', tone: 'default' });
  });
  it('reports steady when there is no history or the baseline is zero', () => {
    expect(describeRequestRate(420, [])).toEqual({ text: 'steady', tone: 'default' });
    expect(describeRequestRate(420, [0, 0, 0])).toEqual({ text: 'steady', tone: 'default' });
  });
});

describe('describeLatency', () => {
  it('reports within target under 500ms', () => {
    expect(describeLatency(220)).toEqual({ text: 'within target', tone: 'success' });
  });
  it('reports elevated above the latency threshold', () => {
    expect(describeLatency(P95_LATENCY_THRESHOLD_MS + 20)).toEqual({ text: 'elevated', tone: 'warning' });
  });
  it('treats a value exactly on the threshold as within target, like the tiles and alarms do', () => {
    expect(describeLatency(P95_LATENCY_THRESHOLD_MS)).toEqual({ text: 'within target', tone: 'success' });
  });
});

describe('describeErrorRate', () => {
  it('reports healthy at or under the threshold', () => {
    expect(describeErrorRate(0.5)).toEqual({ text: 'healthy', tone: 'success' });
    expect(describeErrorRate(ERROR_RATE_THRESHOLD_PCT)).toEqual({ text: 'healthy', tone: 'success' });
  });
  it('reports above threshold over it', () => {
    expect(describeErrorRate(ERROR_RATE_THRESHOLD_PCT + 1.1)).toEqual({ text: 'above threshold', tone: 'error' });
  });
});
