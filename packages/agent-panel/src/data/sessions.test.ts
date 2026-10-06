import { describe, it, expect } from 'vitest';
import { createSessionLogs } from './sessions';

const NOW = 50_000_000_000;

describe('createSessionLogs', () => {
  const logs = createSessionLogs(NOW);

  it('makes 14 sessions with distinct ids', () => {
    expect(logs).toHaveLength(14);
    expect(new Set(logs.map((l) => l.id)).size).toBe(14);
  });

  it('sorts them newest first, all before now, so the list never looks stale', () => {
    expect(logs.every((l) => l.startedAt < NOW)).toBe(true);
    const times = logs.map((l) => l.startedAt);
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it('is relative to now, so a later now moves every session with it', () => {
    const later = createSessionLogs(NOW + 60_000);
    expect(later[0]!.startedAt - logs[0]!.startedAt).toBe(60_000);
  });

  it('has at least one session of every outcome, so each filter has something to show', () => {
    expect(new Set(logs.map((l) => l.outcome))).toEqual(new Set(['resolved', 'escalated', 'abandoned']));
  });
});
