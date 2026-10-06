export type AgentStatus = 'idle' | 'thinking' | 'working' | 'waiting' | 'paused';
export type Priority = 'low' | 'normal' | 'high';
export type TaskStatus = 'queued' | 'running' | 'done' | 'failed' | 'cancelled';
export type TraceKind = 'thought' | 'tool' | 'observation' | 'approval' | 'decision';
export type TraceOutcome = 'ok' | 'error' | 'pending' | 'waiting';

export interface Message {
  id: string;
  role: 'user' | 'agent';
  /** The whole message. Agent messages stream in: only the first `revealed` characters are shown. */
  text: string;
  revealed: number;
  /** The run that produced an agent message (selecting it shows that run's trace). */
  runId?: string;
  at: number;
}

export interface TraceStep {
  id: string;
  runId: string;
  kind: TraceKind;
  title: string;
  detail?: string;
  outcome: TraceOutcome;
  at: number;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  /** Progress is derived (see taskProgress), never stored twice. */
  ticksDone: number;
  ticksTotal: number;
  runId?: string;
  /** Why a failed task failed. */
  error?: string;
  createdAt: number;
  /**
   * When the task became done or cancelled (ms since the epoch). The queue
   * sorts finished work by this, so a task that just finished lands at the top
   * of the finished group, and shows it as the detail line. Cleared by a retry.
   * Absent on a task that never finished, and on a failed one (its `error` is
   * its detail).
   */
  finishedAt?: number;
}

/** One step of a scripted scenario. A scenario is plain data; the engine in simulation.ts runs it. */
export type Step =
  | { type: 'think'; title: string; detail: string; ticks: number }
  | {
      type: 'tool';
      tool: string;
      input: string;
      output: string;
      ticks: number;
      /** If set, the first attempt fails with this text and the engine retries once. */
      failFirst?: string;
    }
  | { type: 'task'; title: string; ticks: number; priority?: Priority }
  | { type: 'approval'; prompt: string; approve: Step[]; reject: Step[] }
  | { type: 'reply'; text: string };

export interface Scenario {
  id: string;
  /** Lower-case words that select this scenario when the user's message contains one. */
  keywords: string[];
  steps: Step[];
}

export interface Approval {
  id: string;
  prompt: string;
  approve: Step[];
  reject: Step[];
  /** The trace step that shows this approval as waiting. */
  traceId: string;
}

/** The step a run is working on right now. */
export interface Current {
  step: Step;
  ticksLeft: number;
  traceId: string | null;
  taskId: string | null;
  /** The agent message a `reply` step is streaming into. */
  messageId: string | null;
}

export interface Run {
  id: string;
  scenarioId: string;
  remaining: Step[];
  current: Current | null;
  approval: Approval | null;
  ended: 'done' | 'cancelled' | null;
}

/**
 * The whole state of the panel as one plain, serialisable object. Two things
 * you might expect to find here are deliberately not stored: the agent's
 * status (`deriveStatus` computes it from the active run, so it cannot
 * disagree with what the agent is doing) and a task's progress percentage
 * (`taskProgress` derives it from `ticksDone / ticksTotal`). To use a real
 * backend, produce this shape from your server's events and the screens do not
 * change.
 */
export interface AgentState {
  paused: boolean;
  messages: Message[];
  trace: TraceStep[];
  tasks: Task[];
  runs: Run[];
  /** Simulated, not measured: grows as the conversation does. */
  contextTokens: number;
  toolCalls: number;
  startedAt: number;
  /** Counter behind every id, so the engine needs no randomness for them. */
  nextId: number;
}
