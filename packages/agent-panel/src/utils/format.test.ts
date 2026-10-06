import { describe, it, expect } from 'vitest';
import { formatClock, formatRelativeTime, formatTokens } from './format';

describe('formatClock', () => {
  it('is HH:MM:SS in 24-hour local time, zero padded', () => {
    const at = new Date(2026, 9, 6, 7, 5, 9).getTime();
    expect(formatClock(at)).toBe('07:05:09');
    expect(formatClock(new Date(2026, 9, 6, 23, 59, 0).getTime())).toBe('23:59:00');
  });
});

describe('formatTokens', () => {
  it('groups thousands', () => {
    expect(formatTokens(5400)).toBe('5,400');
    expect(formatTokens(32000)).toBe('32,000');
    expect(formatTokens(90)).toBe('90');
  });
});

describe('formatRelativeTime', () => {
  const NOW = 10_000_000;
  it('says just now, then seconds, minutes and hours ago', () => {
    expect(formatRelativeTime(NOW - 1000, NOW)).toBe('just now');
    expect(formatRelativeTime(NOW - 30_000, NOW)).toBe('30s ago');
    expect(formatRelativeTime(NOW - 5 * 60_000, NOW)).toBe('5m ago');
    expect(formatRelativeTime(NOW - 3 * 3_600_000, NOW)).toBe('3h ago');
  });

  it('never goes negative when the timestamp is in the future', () => {
    expect(formatRelativeTime(NOW + 60_000, NOW)).toBe('just now');
  });
});
