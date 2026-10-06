import type { AvatarStatus, BadgeProps, TimelineEvent } from 'cyberui-2045';
import type { ContextLevel } from '../data/limits';
import type { SessionOutcome } from '../data/sessions';
import type { AgentStatus, TaskStatus, TraceKind, TraceOutcome } from '../data/types';

export type Tone = 'default' | 'success' | 'warning' | 'error';
type BadgeVariant = NonNullable<BadgeProps['variant']>;

// The CSS class that colours each tone (defined once, as `.tone-*` in App.css).
// A Record, not a template string like `tone-${tone}`, so adding a Tone without
// its class here is a compile error instead of text that silently has no
// colour. tones.test.ts checks that every class below has a rule in App.css.
export const TONE_CLASS: Record<Tone, string> = {
  default: 'tone-default',
  success: 'tone-success',
  warning: 'tone-warning',
  error: 'tone-error',
};

// Everything below is the same idea applied to the data model's unions: a
// Record keyed by the union, so adding a status, outcome or level forces you to
// decide what it looks like. Components read these maps and never pick a colour
// or a badge variant themselves (this file plays the role chartColors.ts plays
// in a template with charts).

/** How each agent status looks: its label (colour is never the only carrier), tone, badge variant and avatar presence dot. */
export const STATUS_VIEW: Record<AgentStatus, { label: string; tone: Tone; badge: BadgeVariant; avatar: AvatarStatus }> = {
  idle: { label: 'Idle', tone: 'default', badge: 'secondary', avatar: 'online' },
  thinking: { label: 'Thinking', tone: 'default', badge: 'secondary', avatar: 'online' },
  working: { label: 'Working', tone: 'success', badge: 'success', avatar: 'online' },
  waiting: { label: 'Waiting for approval', tone: 'warning', badge: 'warning', avatar: 'away' },
  paused: { label: 'Paused', tone: 'warning', badge: 'warning', avatar: 'offline' },
};

/**
 * Trace outcome -> the Timeline's marker status. Timeline has a fixed set of
 * four, and no "pending" of its own, so a step still in flight is `info`.
 */
export const TRACE_STATUS: Record<TraceOutcome, NonNullable<TimelineEvent['status']>> = {
  ok: 'success',
  error: 'error',
  waiting: 'warning',
  pending: 'info',
};

/** The word that starts each trace title ("Thought: ..."), so the kind is readable without relying on colour. */
export const TRACE_KIND_LABEL: Record<TraceKind, string> = {
  thought: 'Thought',
  tool: 'Tool',
  observation: 'Result',
  approval: 'Approval',
  decision: 'Decision',
};

/** Task status -> badge variant. The badge also says the status in words. */
export const TASK_BADGE: Record<TaskStatus, BadgeVariant> = {
  queued: 'secondary',
  running: 'accent',
  done: 'success',
  failed: 'error',
  cancelled: 'warning',
};

/** How a past session ended -> badge variant. The badge also says the outcome in words. */
export const OUTCOME_BADGE: Record<SessionOutcome, BadgeVariant> = {
  resolved: 'success',
  escalated: 'warning',
  abandoned: 'error',
};

/** The tone of the context meter; the thresholds that pick the level live in data/limits.ts. */
export const CONTEXT_TONE: Record<ContextLevel, Tone> = { ok: 'default', high: 'warning', full: 'error' };

/** What the meter says in words when it is not fine, so the warning is not only a colour. */
export const CONTEXT_LABEL: Record<ContextLevel, string | null> = { ok: null, high: 'Getting full', full: 'Full' };
