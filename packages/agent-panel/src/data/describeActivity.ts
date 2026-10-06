import { activeRun } from './simulation';
import type { AgentState } from './types';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * One sentence for the Live status panel: what the agent is doing right now.
 * Derived from the state (never stored), like the status badge, so the two
 * cannot disagree.
 */
export function describeActivity(state: AgentState): string {
  if (state.paused) return 'Paused. Nothing will move until you resume.';
  const run = activeRun(state);
  if (!run) {
    const running = state.tasks.filter((t) => t.status === 'running').length;
    const queued = state.tasks.filter((t) => t.status === 'queued').length;
    const parts = [running > 0 ? `${plural(running, 'task')} running` : '', queued > 0 ? `${queued} queued` : ''].filter(Boolean);
    return parts.length > 0 ? `Idle. ${parts.join(', ')}.` : 'Idle. Nothing in progress.';
  }
  if (run.approval) return `Asking you before going on: ${run.approval.prompt}`;
  const step = run.current?.step;
  if (!step) return 'Getting started.';
  switch (step.type) {
    case 'think':
      return `Thinking: ${step.title}.`;
    case 'tool':
      return `Calling ${step.tool}(${step.input}).`;
    case 'task':
      return `Waiting for the task "${step.title}" to finish.`;
    case 'reply':
      return 'Writing a reply.';
    case 'approval':
      return 'Asking you before going on.'; // never current (see simulation.ts); here so the switch stays exhaustive
  }
}
