// Every number that decides how the simulation behaves or when the UI warns.
// The engine, the hook and the Live status panel all import from here, so
// "how full is too full" is answered in exactly one place.

export const TICK_MS = 250;
/** Streaming speed: characters of an agent reply revealed per tick (about 24 per second). */
export const CHARS_PER_TICK = 6;
/** How many tasks the worker pool runs at once. */
export const TASK_CONCURRENCY = 3;

// Caps, so a tab left open does not grow without bound.
export const MAX_MESSAGES = 200;
export const MAX_TRACE_STEPS = 300;
export const MAX_FINISHED_TASKS = 20;
export const MAX_RUNS = 50;

export const CONTEXT_WINDOW_TOKENS = 32000;
export const CONTEXT_HIGH_PCT = 70;
export const CONTEXT_FULL_PCT = 90;

/** Tokens the simulation adds to the context for each kind of thing. Made-up numbers. */
export const TOKENS = { user: 90, think: 380, tool: 520, reply: 260 } as const;

export type ContextLevel = 'ok' | 'high' | 'full';

export function contextPct(tokens: number): number {
  return Math.min(100, Math.round((tokens / CONTEXT_WINDOW_TOKENS) * 100));
}

export function contextLevel(tokens: number): ContextLevel {
  const pct = contextPct(tokens);
  if (pct >= CONTEXT_FULL_PCT) return 'full';
  if (pct >= CONTEXT_HIGH_PCT) return 'high';
  return 'ok';
}
