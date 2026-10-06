import { useEffect, useMemo, useState } from 'react';
import { CHARS_PER_TICK, TICK_MS } from './limits';
import {
  cancelRun,
  cancelTask,
  createInitialState,
  resetState,
  resolveApproval,
  retryTask,
  sendMessage,
  setPaused,
  tick,
} from './simulation';
import type { AgentState } from './types';

export interface AgentActions {
  send: (text: string) => void;
  resolveApproval: (approvalId: string, approved: boolean) => void;
  stopRun: () => void;
  cancelTask: (taskId: string) => void;
  retryTask: (taskId: string) => void;
  setPaused: (paused: boolean) => void;
  /** Back to the first state (a paused agent stays paused). The only way out of a full context window. */
  reset: () => void;
}

export interface AgentController {
  state: AgentState;
  actions: AgentActions;
}

export interface SimulatedAgentOptions {
  tickMs?: number;
  /** Characters of a reply shown per tick. Infinity shows replies at once (reduced motion). */
  charsPerTick?: number;
}

// The seam to replace with a real agent. Everything on screen reads `state`
// and calls `actions`, and nothing below this hook knows the data is
// simulated: to connect your own agent, return `state` built from your
// server's events (keep the AgentState shape) and make each action call your
// API. This is also the only timer and the only caller of Date.now() in the
// template; the engine in simulation.ts is pure.
export function useSimulatedAgent({ tickMs = TICK_MS, charsPerTick = CHARS_PER_TICK }: SimulatedAgentOptions = {}): AgentController {
  const [state, setState] = useState<AgentState>(() => createInitialState(Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      // An idle tick returns the same state object, so React skips the render.
      setState((prev) => tick(prev, Date.now(), charsPerTick));
    }, tickMs);
    return () => clearInterval(id);
  }, [tickMs, charsPerTick]);

  // Stable across renders, so memoised children are not re-rendered by a new
  // `actions` object on every tick.
  const actions = useMemo<AgentActions>(
    () => ({
      send: (text) => setState((prev) => sendMessage(prev, text, Date.now())),
      resolveApproval: (approvalId, approved) => setState((prev) => resolveApproval(prev, approvalId, approved, Date.now())),
      stopRun: () => setState((prev) => cancelRun(prev, Date.now())),
      cancelTask: (taskId) => setState((prev) => cancelTask(prev, taskId, Date.now())),
      retryTask: (taskId) => setState((prev) => retryTask(prev, taskId)),
      setPaused: (paused) => setState((prev) => setPaused(prev, paused)),
      reset: () => setState((prev) => resetState(prev, Date.now())),
    }),
    [],
  );

  return { state, actions };
}
