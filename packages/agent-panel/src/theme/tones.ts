import type { AvatarStatus, BadgeProps } from 'cyberui-2045';
import type { ContextLevel } from '../data/limits';
import type { AgentStatus } from '../data/types';

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

/** The tone of the context meter; the thresholds that pick the level live in data/limits.ts. */
export const CONTEXT_TONE: Record<ContextLevel, Tone> = { ok: 'default', high: 'warning', full: 'error' };

/** What the meter says in words when it is not fine, so the warning is not only a colour. */
export const CONTEXT_LABEL: Record<ContextLevel, string | null> = { ok: null, high: 'Getting full', full: 'Full' };
