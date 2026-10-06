import { describe, it, expect } from 'vitest';
import { describeActivity } from './describeActivity';
import { activeRun, createInitialState, resolveApproval, sendMessage, setPaused, tick } from './simulation';
import type { AgentState } from './types';

const NOW = 1_000_000;
const fresh = () => createInitialState(NOW);

/** Ticks until `done` is true for the state, so a test can stop on the exact step it wants. */
function tickUntil(state: AgentState, done: (s: AgentState) => boolean): AgentState {
  let s = state;
  for (let i = 0; i < 300 && !done(s); i++) s = tick(s, NOW + i, Infinity);
  return s;
}

describe('describeActivity', () => {
  it('idle: says what the queue is doing, or that nothing is', () => {
    expect(describeActivity(fresh())).toBe('Idle. 1 task running, 1 queued.');
    const drained = tickUntil(fresh(), (s) => !s.tasks.some((t) => t.status === 'running' || t.status === 'queued'));
    expect(describeActivity(drained)).toBe('Idle. Nothing in progress.');
  });

  it('thinking: shows the step title', () => {
    const s = tickUntil(sendMessage(fresh(), 'refund order #4821', NOW), (st) => activeRun(st)?.current?.step.type === 'think');
    expect(describeActivity(s)).toBe('Thinking: Plan the refund.');
  });

  it('working on a tool: shows the call', () => {
    const s = tickUntil(sendMessage(fresh(), 'refund order #4821', NOW), (st) => activeRun(st)?.current?.step.type === 'tool');
    expect(describeActivity(s)).toBe('Calling orders.lookup(order #4821).');
  });

  it('working on a task: says it is waiting for the task', () => {
    const s = tickUntil(sendMessage(fresh(), 'summarise tickets', NOW), (st) => activeRun(st)?.current?.step.type === 'task');
    expect(describeActivity(s)).toBe('Waiting for the task "Summarise 38 tickets" to finish.');
  });

  it('writing a reply', () => {
    const s = tickUntil(sendMessage(fresh(), 'hello', NOW), (st) => activeRun(st)?.current?.step.type === 'reply');
    expect(describeActivity(s)).toBe('Writing a reply.');
  });

  it('waiting: says it is asking the person, and what', () => {
    const s = tickUntil(sendMessage(fresh(), 'refund order #4821', NOW), (st) => !!activeRun(st)?.approval);
    expect(describeActivity(s)).toBe('Asking you before going on: Refund $42.00 to the customer for order #4821?');
  });

  it('paused: says nothing will move, even mid-run', () => {
    const s = setPaused(sendMessage(fresh(), 'hello', NOW), true);
    expect(describeActivity(s)).toBe('Paused. Nothing will move until you resume.');
  });

  it('is idle again after the approval is answered and the run ends', () => {
    let s = tickUntil(sendMessage(fresh(), 'refund order #4821', NOW), (st) => !!activeRun(st)?.approval);
    s = resolveApproval(s, activeRun(s)!.approval!.id, false, NOW);
    s = tickUntil(s, (st) => !activeRun(st));
    expect(describeActivity(s)).toMatch(/^Idle\./);
  });
});
