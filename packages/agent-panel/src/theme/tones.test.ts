import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { CONTEXT_TONE, STATUS_VIEW, TASK_BADGE, TONE_CLASS, TRACE_KIND_LABEL, TRACE_STATUS } from './tones';
import type { AgentStatus } from '../data/types';

const AGENT_STATUSES: AgentStatus[] = ['idle', 'thinking', 'working', 'waiting', 'paused'];

describe('TONE_CLASS', () => {
  it('has a rule in App.css for every tone class, so no tone renders without a colour', () => {
    const css = readFileSync(resolve(__dirname, '../App.css'), 'utf8');
    for (const className of Object.values(TONE_CLASS)) {
      expect(css, `App.css has no .${className} rule`).toMatch(new RegExp(`\\.${className}\\s*\\{`));
    }
  });
});

describe('STATUS_VIEW', () => {
  it('has an entry for every agent status, each with a label', () => {
    expect(Object.keys(STATUS_VIEW).sort()).toEqual([...AGENT_STATUSES].sort());
    for (const status of AGENT_STATUSES) expect(STATUS_VIEW[status].label.length).toBeGreaterThan(0);
  });

  it('only uses tones that have a class (the type guarantees it; this guards a future `any`)', () => {
    for (const view of Object.values(STATUS_VIEW)) expect(TONE_CLASS).toHaveProperty(view.tone);
    for (const tone of Object.values(CONTEXT_TONE)) expect(TONE_CLASS).toHaveProperty(tone);
  });
});

describe('trace maps', () => {
  it('covers every trace outcome and kind', () => {
    expect(TRACE_STATUS).toEqual({ ok: 'success', error: 'error', waiting: 'warning', pending: 'info' });
    expect(Object.keys(TRACE_KIND_LABEL).sort()).toEqual(['approval', 'decision', 'observation', 'thought', 'tool']);
  });
});

describe('TASK_BADGE', () => {
  it('has a variant for every task status', () => {
    expect(TASK_BADGE).toEqual({
      queued: 'secondary',
      running: 'accent',
      done: 'success',
      failed: 'error',
      cancelled: 'warning',
    });
  });
});

describe('CONTEXT_TONE', () => {
  it('warns at high and errors at full', () => {
    expect(CONTEXT_TONE).toEqual({ ok: 'default', high: 'warning', full: 'error' });
  });
});
