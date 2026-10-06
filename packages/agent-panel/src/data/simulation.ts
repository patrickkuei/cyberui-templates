import {
  CHARS_PER_TICK,
  MAX_FINISHED_TASKS,
  MAX_MESSAGES,
  MAX_RUNS,
  MAX_TRACE_STEPS,
  TASK_CONCURRENCY,
  TOKENS,
  contextLevel,
} from './limits';
import { matchScenario } from './scenarios';
import type {
  AgentState,
  AgentStatus,
  Run,
  Scenario,
  Task,
  TraceKind,
  TraceOutcome,
  TraceStep,
} from './types';

// A pure, timer-free, random-free engine. Every function takes a state and
// returns the next one; none reads a clock or Math.random, so tests need no
// seeding and the hook (useSimulatedAgent.ts) is the only thing with a timer.
// Each returns the SAME object when nothing changed, so React skips the render
// on an idle tick.
//
// The model: one scripted Run at a time works through a Scenario's steps,
// writing trace steps, creating Tasks and streaming a reply. Tasks run in a
// small worker pool (TASK_CONCURRENCY). An `approval` step parks the run until
// resolveApproval is called.

const PRIORITY_RANK = { high: 0, normal: 1, low: 2 } as const;

/** The run that has not ended, if any. */
export function activeRun(state: AgentState): Run | undefined {
  return state.runs.find((run) => run.ended === null);
}

export function taskProgress(task: Task): number {
  return task.ticksTotal === 0 ? 100 : Math.round((task.ticksDone / task.ticksTotal) * 100);
}

export function deriveStatus(state: AgentState): AgentStatus {
  if (state.paused) return 'paused';
  const run = activeRun(state);
  if (!run) return 'idle';
  if (run.approval) return 'waiting';
  const type = run.current?.step.type;
  return type === undefined || type === 'think' ? 'thinking' : 'working';
}

export function createInitialState(now: number): AgentState {
  const min = 60_000;
  return {
    paused: false,
    startedAt: now,
    contextTokens: 4800,
    toolCalls: 3,
    nextId: 1,
    messages: [
      { id: 'seed-m1', role: 'user', text: "What's on the queue today?", revealed: 26, at: now - 9 * min },
      {
        id: 'seed-m2',
        role: 'agent',
        text: 'Four items: an index refresh is running, a weekly digest is queued, last night’s CRM sync failed and needs a retry, and the chat archive finished.',
        revealed: 999,
        runId: 'seed-run',
        at: now - 9 * min + 4000,
      },
    ],
    trace: [
      { id: 'seed-s1', runId: 'seed-run', kind: 'thought', title: 'Check the queue', detail: 'List every task and group them by state.', outcome: 'ok', at: now - 9 * min + 1000 },
      { id: 'seed-s2', runId: 'seed-run', kind: 'tool', title: 'tasks.list()', outcome: 'ok', at: now - 9 * min + 2000 },
      { id: 'seed-s3', runId: 'seed-run', kind: 'observation', title: '4 tasks: 1 running, 1 queued, 1 failed, 1 done.', outcome: 'ok', at: now - 9 * min + 3000 },
    ],
    tasks: [
      { id: 'seed-t1', title: 'Index refresh: help-center articles', status: 'running', priority: 'low', ticksDone: 20, ticksTotal: 80, createdAt: now - 20 * min },
      { id: 'seed-t2', title: 'Weekly digest draft', status: 'queued', priority: 'normal', ticksDone: 0, ticksTotal: 30, createdAt: now - 15 * min },
      { id: 'seed-t3', title: 'Sync CRM contacts', status: 'failed', priority: 'normal', ticksDone: 14, ticksTotal: 40, error: 'Timed out after 30 s', createdAt: now - 3 * 60 * min },
      { id: 'seed-t4', title: 'Archive resolved chats', status: 'done', priority: 'low', ticksDone: 24, ticksTotal: 24, createdAt: now - 4 * 60 * min },
    ],
    runs: [{ id: 'seed-run', scenarioId: 'seed', remaining: [], current: null, approval: null, ended: 'done' }],
  };
}

// ---- Commands (user actions) ------------------------------------------------

/**
 * Starts a run for the message. Ignored (state returned unchanged) when the
 * text is blank, a run is already going, the agent is paused, or the context
 * is full: the UI disables the composer in those cases and says why.
 */
export function sendMessage(state: AgentState, text: string, now: number, scenarios?: Scenario[]): AgentState {
  const body = text.trim();
  if (!body || activeRun(state) || state.paused || contextLevel(state.contextTokens) === 'full') return state;
  const s = draft(state);
  const scenario = matchScenario(body, scenarios);
  const runId = newId(s, 'r');
  s.messages.push({ id: newId(s, 'm'), role: 'user', text: body, revealed: body.length, at: now });
  s.contextTokens += TOKENS.user;
  s.runs.push({ id: runId, scenarioId: scenario.id, remaining: [...scenario.steps], current: null, approval: null, ended: null });
  return trim(s);
}

// ---- Time -------------------------------------------------------------------

/**
 * Advances the simulation by one tick. `charsPerTick` is how much of a reply
 * to reveal; pass Infinity to show replies at once (reduced motion).
 */
export function tick(state: AgentState, now: number, charsPerTick: number = CHARS_PER_TICK): AgentState {
  if (state.paused) return state;
  const s = draft(state);
  const tasksMoved = advanceTasks(s);
  const run = activeRun(s);
  const runMoved = run ? advanceRun(s, run, now, charsPerTick) : false;
  return tasksMoved || runMoved ? trim(s) : state;
}

function advanceTasks(s: AgentState): boolean {
  let moved = false;
  s.tasks = s.tasks.map((task) => {
    if (task.status !== 'running') return task;
    moved = true;
    const ticksDone = task.ticksDone + 1;
    return ticksDone >= task.ticksTotal ? { ...task, ticksDone: task.ticksTotal, status: 'done' } : { ...task, ticksDone };
  });
  const free = TASK_CONCURRENCY - s.tasks.filter((t) => t.status === 'running').length;
  if (free > 0) {
    const next = s.tasks
      .filter((t) => t.status === 'queued')
      .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.createdAt - b.createdAt)
      .slice(0, free)
      .map((t) => t.id);
    if (next.length > 0) {
      moved = true;
      s.tasks = s.tasks.map((t) => (next.includes(t.id) ? { ...t, status: 'running' } : t));
    }
  }
  return moved;
}

/** Returns whether anything changed. A run parked on an approval does not move. */
function advanceRun(s: AgentState, run: Run, now: number, charsPerTick: number): boolean {
  if (run.approval) return false;
  let next = run.current ? advanceCurrent(s, run, now, charsPerTick) : beginNext(s, run, now);
  // A step that just finished hands over to the next one in the same tick, so
  // the status does not blink back to "thinking" between steps.
  if (next !== run && next.current === null && next.approval === null && next.ended === null) {
    next = beginNext(s, next, now);
  }
  if (next === run) return false;
  replaceRun(s, next);
  return true;
}

function beginNext(s: AgentState, run: Run, now: number): Run {
  const [step, ...rest] = run.remaining;
  if (!step) return { ...run, ended: 'done' };
  const base = { ...run, remaining: rest };
  const current = (traceId: string | null, ticksLeft: number, extra: { taskId?: string; messageId?: string } = {}) => ({
    step,
    ticksLeft,
    traceId,
    taskId: extra.taskId ?? null,
    messageId: extra.messageId ?? null,
  });
  switch (step.type) {
    case 'think': {
      s.contextTokens += TOKENS.think;
      return { ...base, current: current(addTrace(s, run.id, 'thought', step.title, step.detail, 'pending', now), step.ticks) };
    }
    case 'tool': {
      s.contextTokens += TOKENS.tool;
      s.toolCalls += 1;
      return { ...base, current: current(addTrace(s, run.id, 'tool', `${step.tool}(${step.input})`, undefined, 'pending', now), step.ticks) };
    }
    case 'task': {
      const taskId = newId(s, 't');
      s.tasks.push({ id: taskId, title: step.title, status: 'queued', priority: step.priority ?? 'normal', ticksDone: 0, ticksTotal: step.ticks, runId: run.id, createdAt: now });
      return { ...base, current: current(addTrace(s, run.id, 'tool', `Task: ${step.title}`, undefined, 'pending', now), 0, { taskId }) };
    }
    case 'approval': {
      const traceId = addTrace(s, run.id, 'approval', 'Waiting for your approval', step.prompt, 'waiting', now);
      return { ...base, current: null, approval: { id: newId(s, 'a'), prompt: step.prompt, approve: step.approve, reject: step.reject, traceId } };
    }
    case 'reply': {
      s.contextTokens += TOKENS.reply;
      const messageId = newId(s, 'm');
      s.messages.push({ id: messageId, role: 'agent', text: step.text, revealed: 0, runId: run.id, at: now });
      return { ...base, current: current(null, 0, { messageId }) };
    }
  }
}

function advanceCurrent(s: AgentState, run: Run, now: number, charsPerTick: number): Run {
  const cur = run.current!;
  const { step } = cur;
  const finish = (patch: Partial<Run> = {}): Run => ({ ...run, current: null, ...patch });
  switch (step.type) {
    case 'think':
    case 'tool': {
      if (cur.ticksLeft > 1) return { ...run, current: { ...cur, ticksLeft: cur.ticksLeft - 1 } };
      if (step.type === 'tool' && step.failFirst) {
        // First attempt fails, as scripted; the retry is the same step without the failure.
        const { failFirst, ...retry } = step;
        setOutcome(s, cur.traceId, 'error');
        addTrace(s, run.id, 'observation', failFirst, undefined, 'error', now);
        return finish({ remaining: [retry, ...run.remaining] });
      }
      setOutcome(s, cur.traceId, 'ok');
      if (step.type === 'tool') addTrace(s, run.id, 'observation', step.output, undefined, 'ok', now);
      return finish();
    }
    case 'task': {
      const task = s.tasks.find((t) => t.id === cur.taskId);
      if (task?.status === 'queued' || task?.status === 'running') return run;
      if (task?.status === 'done') {
        setOutcome(s, cur.traceId, 'ok');
        return finish();
      }
      setOutcome(s, cur.traceId, 'error');
      addTrace(s, run.id, 'decision', 'The task did not finish, so I am stopping here', undefined, 'error', now);
      return finish({ remaining: [{ type: 'reply', text: 'That task was stopped before it finished, so I did not go any further.' }] });
    }
    case 'reply': {
      const message = s.messages.find((m) => m.id === cur.messageId);
      if (!message) return finish({ ended: 'done' });
      const revealed = Math.min(message.text.length, message.revealed + charsPerTick);
      s.messages = s.messages.map((m) => (m.id === message.id ? { ...m, revealed } : m));
      return revealed >= message.text.length ? finish({ ended: 'done' }) : { ...run };
    }
    case 'approval':
      return run; // never current: beginNext parks the run on `approval` instead
  }
}

// ---- Helpers ----------------------------------------------------------------

/** A copy whose arrays this function may push to; the objects inside are never mutated. */
function draft(state: AgentState): AgentState {
  return { ...state, messages: [...state.messages], trace: [...state.trace], tasks: [...state.tasks], runs: [...state.runs] };
}

function newId(s: AgentState, prefix: string): string {
  const id = `${prefix}${s.nextId}`;
  s.nextId += 1;
  return id;
}

function addTrace(s: AgentState, runId: string, kind: TraceKind, title: string, detail: string | undefined, outcome: TraceOutcome, at: number): string {
  const id = newId(s, 's');
  const step: TraceStep = { id, runId, kind, title, outcome, at };
  if (detail !== undefined) step.detail = detail;
  s.trace.push(step);
  return id;
}

function setOutcome(s: AgentState, traceId: string | null, outcome: TraceOutcome): void {
  if (traceId) s.trace = s.trace.map((t) => (t.id === traceId ? { ...t, outcome } : t));
}

function replaceRun(s: AgentState, run: Run): void {
  s.runs = s.runs.map((r) => (r.id === run.id ? run : r));
}

/** Keeps every list bounded, so a tab left open does not grow forever. */
function trim(s: AgentState): AgentState {
  const finished = s.tasks.filter((t) => t.status === 'done' || t.status === 'failed' || t.status === 'cancelled');
  const drop = new Set(finished.slice(0, Math.max(0, finished.length - MAX_FINISHED_TASKS)).map((t) => t.id));
  return {
    ...s,
    messages: s.messages.slice(-MAX_MESSAGES),
    trace: s.trace.slice(-MAX_TRACE_STEPS),
    runs: s.runs.slice(-MAX_RUNS),
    tasks: drop.size > 0 ? s.tasks.filter((t) => !drop.has(t.id)) : s.tasks,
  };
}
