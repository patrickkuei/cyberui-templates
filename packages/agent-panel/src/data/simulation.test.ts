import { describe, it, expect } from 'vitest';
import {
  activeRun,
  cancelRun,
  cancelTask,
  createInitialState,
  deriveStatus,
  resolveApproval,
  retryTask,
  sendMessage,
  setPaused,
  taskProgress,
  tick,
} from './simulation';
import { CONTEXT_WINDOW_TOKENS, MAX_FINISHED_TASKS, MAX_MESSAGES, MAX_RUNS, MAX_TRACE_STEPS, TASK_CONCURRENCY } from './limits';
import type { AgentState, AgentStatus } from './types';

const NOW = 1_000_000;
const fresh = () => createInitialState(NOW);

/**
 * Ticks (revealing replies at once) until the active run ends. `decide` answers
 * an approval when one is pending. Throws if the run never ends, which is how a
 * hung scenario shows up (Review Focus #1).
 */
function settle(state: AgentState, decide?: (s: AgentState) => AgentState, limit = 400): AgentState {
  let s = state;
  for (let i = 0; i < limit; i++) {
    if (!activeRun(s)) return s;
    if (decide && activeRun(s)?.approval) s = decide(s);
    s = tick(s, NOW + i, Infinity);
  }
  throw new Error('the run did not finish');
}

describe('createInitialState', () => {
  it('starts with one finished exchange and a trace for it', () => {
    const s = fresh();
    expect(s.messages.map((m) => m.role)).toEqual(['user', 'agent']);
    expect(s.trace.every((t) => t.runId === 'seed-run')).toBe(true);
    expect(activeRun(s)).toBeUndefined();
  });

  it('seeds one task in each of four states, so every panel and Retry have something to show on first paint', () => {
    expect(fresh().tasks.map((t) => t.status).sort()).toEqual(['done', 'failed', 'queued', 'running']);
  });
});

describe('sendMessage', () => {
  it('adds the message and starts a run', () => {
    const s = sendMessage(fresh(), '  hello there  ', NOW);
    expect(s.messages.at(-1)).toMatchObject({ role: 'user', text: 'hello there' });
    expect(activeRun(s)).toBeDefined();
  });

  it('is ignored when blank, mid-run or when the context is full, returning the same state', () => {
    const s = fresh();
    expect(sendMessage(s, '   ', NOW)).toBe(s);
    const running = sendMessage(s, 'hello', NOW);
    expect(sendMessage(running, 'again', NOW)).toBe(running);
    const full = { ...s, contextTokens: CONTEXT_WINDOW_TOKENS };
    expect(sendMessage(full, 'hello', NOW)).toBe(full);
  });
});

describe('tick', () => {
  it('runs a scenario with no approval to the end: trace, task, and a fully shown reply', () => {
    const s = settle(sendMessage(fresh(), 'Summarise this week’s support tickets.', NOW));
    const run = s.runs.at(-1)!;
    expect(run.ended).toBe('done');
    const kinds = s.trace.filter((t) => t.runId === run.id).map((t) => t.kind);
    expect(kinds).toEqual(['thought', 'tool', 'observation', 'tool']);
    expect(s.trace.filter((t) => t.runId === run.id).every((t) => t.outcome === 'ok')).toBe(true);
    expect(s.tasks.find((t) => t.runId === run.id)?.status).toBe('done');
    const reply = s.messages.at(-1)!;
    expect(reply.role).toBe('agent');
    expect(reply.revealed).toBe(reply.text.length);
  });

  it('streams a reply a few characters per tick unless told to show it at once', () => {
    let s = sendMessage(fresh(), 'hello there', NOW);
    for (let i = 0; i < 12; i++) s = tick(s, NOW + i);
    const reply = s.messages.at(-1)!;
    expect(reply.role).toBe('agent');
    expect(reply.revealed).toBeGreaterThan(0);
    expect(reply.revealed).toBeLessThan(reply.text.length);
  });

  it('answers a message it has no script for honestly, without hanging', () => {
    const s = settle(sendMessage(fresh(), 'what is the weather', NOW));
    expect(s.messages.at(-1)!.text).toMatch(/scripted demo/i);
  });

  it('returns the very same object when nothing changed, so React skips the render', () => {
    let s = fresh();
    // Drain the seeded background tasks first; the seed has one running and one queued.
    for (let i = 0; i < 200; i++) s = tick(s, NOW + i);
    expect(s.tasks.some((t) => t.status === 'running' || t.status === 'queued')).toBe(false);
    expect(tick(s, NOW + 999)).toBe(s);
  });

  it('starts queued tasks by priority, up to the pool size, and leaves the rest queued', () => {
    const base = fresh();
    const make = (id: string, priority: 'low' | 'normal' | 'high') => ({
      id, title: id, status: 'queued' as const, priority, ticksDone: 0, ticksTotal: 5, createdAt: NOW,
    });
    // Four queued tasks and nothing running: the pool takes the three most urgent.
    const s = tick({ ...base, tasks: [make('a', 'low'), make('b', 'high'), make('c', 'high'), make('d', 'normal')] }, NOW);
    expect(s.tasks.filter((t) => t.status === 'running')).toHaveLength(TASK_CONCURRENCY);
    expect(s.tasks.filter((t) => t.status === 'queued').map((t) => t.id)).toEqual(['a']);
  });

  it('moves a task to done after its ticks', () => {
    let s = fresh();
    const running = s.tasks.find((t) => t.status === 'running')!;
    for (let i = 0; i < running.ticksTotal; i++) s = tick(s, NOW + i);
    expect(s.tasks.find((t) => t.id === running.id)?.status).toBe('done');
  });
});

describe('deriveStatus', () => {
  it('is idle with no run, then thinking, then working, and never blinks back to thinking between steps', () => {
    let s = fresh();
    expect(deriveStatus(s)).toBe('idle');
    s = sendMessage(s, 'summarise tickets', NOW);
    const seen: AgentStatus[] = [deriveStatus(s)];
    for (let i = 0; i < 200 && activeRun(s); i++) {
      s = tick(s, NOW + i, Infinity);
      seen.push(deriveStatus(s));
    }
    expect(seen[0]).toBe('thinking');
    expect(seen).toContain('working');
    expect(seen.lastIndexOf('thinking')).toBeLessThan(seen.indexOf('working'));
  });
});

describe('taskProgress', () => {
  it('is derived from ticks, and 100 for a task with no ticks to do', () => {
    const s = fresh();
    expect(taskProgress({ ...s.tasks[0]!, ticksDone: 20, ticksTotal: 80 })).toBe(25);
    expect(taskProgress({ ...s.tasks[0]!, ticksDone: 0, ticksTotal: 0 })).toBe(100);
  });
});

const approve = (s: AgentState) => resolveApproval(s, activeRun(s)!.approval!.id, true, NOW);
const reject = (s: AgentState) => resolveApproval(s, activeRun(s)!.approval!.id, false, NOW);

/** Ticks until the run parks on its approval. */
function untilApproval(state: AgentState): AgentState {
  let s = state;
  for (let i = 0; i < 200 && !activeRun(s)?.approval; i++) s = tick(s, NOW + i, Infinity);
  return s;
}

describe('approvals', () => {
  it('parks the run, waits, and takes the approve branch: refund processed', () => {
    const waiting = untilApproval(sendMessage(fresh(), 'refund order #4821', NOW));
    expect(deriveStatus(waiting)).toBe('waiting');
    expect(waiting.trace.at(-1)).toMatchObject({ kind: 'approval', outcome: 'waiting' });
    // The run does not move while it waits, however many ticks pass (background tasks still do).
    const later = tick(tick(waiting, NOW + 500, Infinity), NOW + 501, Infinity);
    expect(deriveStatus(later)).toBe('waiting');
    expect(later.trace).toHaveLength(waiting.trace.length);
    expect(later.messages).toHaveLength(waiting.messages.length);
    const done = settle(approve(waiting));
    expect(done.messages.at(-1)!.text).toMatch(/refund .* is processed/i);
    expect(done.trace.some((t) => t.kind === 'decision' && t.title === 'Approved by you')).toBe(true);
    expect(done.tasks.some((t) => t.title === 'Process refund #4821' && t.status === 'done')).toBe(true);
  });

  it('takes the reject branch: nothing is processed', () => {
    const done = settle(reject(untilApproval(sendMessage(fresh(), 'refund order #4821', NOW))));
    expect(done.messages.at(-1)!.text).toMatch(/left order #4821 untouched/i);
    expect(done.tasks.some((t) => t.title === 'Process refund #4821')).toBe(false);
  });

  it('shows a failed first attempt, then the retry succeeding (release notes)', () => {
    const done = settle(approve(untilApproval(sendMessage(fresh(), 'draft the release notes', NOW))));
    const run = done.runs.at(-1)!;
    const observations = done.trace.filter((t) => t.runId === run.id && t.kind === 'observation').map((t) => t.outcome);
    expect(observations.slice(0, 2)).toEqual(['error', 'ok']);
  });

  it('ignores an approval id that is not the one waiting', () => {
    const waiting = untilApproval(sendMessage(fresh(), 'refund order', NOW));
    expect(resolveApproval(waiting, 'nope', true, NOW)).toBe(waiting);
  });
});

describe('steering', () => {
  it('pausing freezes the whole simulation, and resuming restarts it', () => {
    const paused = setPaused(fresh(), true);
    expect(deriveStatus(paused)).toBe('paused');
    expect(tick(paused, NOW)).toBe(paused);
    expect(sendMessage(paused, 'hello', NOW)).toBe(paused);
    expect(setPaused(paused, true)).toBe(paused);
    expect(deriveStatus(setPaused(paused, false))).toBe('idle');
  });

  it('stopping a run cuts a half-streamed reply where it is and settles pending trace steps', () => {
    let s = sendMessage(fresh(), 'hello there', NOW);
    while (!(s.messages.at(-1)!.role === 'agent' && s.messages.at(-1)!.revealed > 0)) s = tick(s, NOW);
    const stopped = cancelRun(s, NOW);
    const reply = stopped.messages.at(-1)!;
    expect(reply.text.length).toBe(reply.revealed);
    expect(stopped.runs.at(-1)!.ended).toBe('cancelled');
    expect(stopped.trace.some((t) => t.outcome === 'pending' || t.outcome === 'waiting')).toBe(false);
    expect(activeRun(stopped)).toBeUndefined();
    expect(cancelRun(stopped, NOW)).toBe(stopped);
  });

  it('cancelling the task a run is waiting for ends the run politely instead of hanging it (Review Focus #1)', () => {
    let s = approve(untilApproval(sendMessage(fresh(), 'refund order', NOW)));
    for (let i = 0; i < 50 && !s.tasks.some((t) => t.title === 'Process refund #4821'); i++) s = tick(s, NOW + i);
    const task = s.tasks.find((t) => t.title === 'Process refund #4821')!;
    const done = settle(cancelTask(s, task.id));
    expect(done.messages.at(-1)!.text).toMatch(/stopped before it finished/i);
  });

  it('cancels only queued or running tasks, and retries only failed or cancelled ones', () => {
    const s = fresh();
    const failed = s.tasks.find((t) => t.status === 'failed')!;
    const done = s.tasks.find((t) => t.status === 'done')!;
    expect(cancelTask(s, done.id)).toBe(s);
    expect(retryTask(s, done.id)).toBe(s);
    const retried = retryTask(s, failed.id).tasks.find((t) => t.id === failed.id)!;
    expect(retried).toMatchObject({ status: 'queued', ticksDone: 0 });
    expect(retried.error).toBeUndefined();
    const cancelled = cancelTask(s, s.tasks.find((t) => t.status === 'queued')!.id);
    expect(cancelled.tasks.filter((t) => t.status === 'cancelled')).toHaveLength(1);
  });
});

describe('caps (Review Focus #2)', () => {
  it('keeps every list bounded however long the tab stays open', () => {
    let s = fresh();
    // 110 runs of a scenario that adds a task and four trace steps each: enough to pass every cap.
    for (let i = 0; i < 110; i++) {
      s = { ...s, contextTokens: 0 }; // a real tab would hit the context limit first; this test is about the lists
      s = settle(sendMessage(s, 'summarise tickets', NOW + i));
    }
    expect(s.messages).toHaveLength(MAX_MESSAGES);
    expect(s.trace).toHaveLength(MAX_TRACE_STEPS);
    expect(s.runs).toHaveLength(MAX_RUNS);
    const finished = s.tasks.filter((t) => t.status === 'done' || t.status === 'failed' || t.status === 'cancelled');
    expect(finished.length).toBeLessThanOrEqual(MAX_FINISHED_TASKS);
  });
});
