import { Card, LinearProgress } from 'cyberui-2045';
import { CONTEXT_WINDOW_TOKENS, contextLevel, contextPct } from '../data/limits';
import { describeActivity } from '../data/describeActivity';
import { CONTEXT_LABEL, CONTEXT_TONE, TONE_CLASS } from '../theme/tones';
import { formatTokens } from '../utils/format';
import { deriveStatus } from '../data/simulation';
import { StatusBadge } from './StatusBadge';
import type { AgentState } from '../data/types';

export interface LiveStatusProps {
  state: AgentState;
}

export function LiveStatus({ state }: LiveStatusProps) {
  const level = contextLevel(state.contextTokens);
  const pct = contextPct(state.contextTokens);
  const label = CONTEXT_LABEL[level];
  const running = state.tasks.filter((t) => t.status === 'running').length;
  const queued = state.tasks.filter((t) => t.status === 'queued').length;

  return (
    <section aria-label="Live status">
      <Card title="Live status" className="panel-surface">
        <StatusBadge status={deriveStatus(state)} />
        <p className="live-activity">{describeActivity(state)}</p>

        {/* LinearProgress takes no colour prop (its bar is always the accent-to-primary
            gradient), so the meter's tone shows on the figures and the word beside it,
            via this wrapper's tone class, not on the bar itself. */}
        <div role="group" aria-label="Context window" className={`context-meter ${TONE_CLASS[CONTEXT_TONE[level]]}`}>
          <div className="context-meter-head">
            <span>Context</span>
            <span className="context-meter-pct">{pct}%</span>
          </div>
          <LinearProgress progress={pct} size="sm" className="meter-bar" />
          <div className="context-meter-foot">
            <span>
              {formatTokens(state.contextTokens)} / {formatTokens(CONTEXT_WINDOW_TOKENS)} tokens
            </span>
            {label && <span className="context-meter-level">{label}</span>}
          </div>
        </div>
        <p className="live-note">Token counts are simulated.</p>

        <dl className="live-stats">
          <div>
            <dt>Tool calls</dt>
            <dd>{state.toolCalls}</dd>
          </div>
          <div>
            <dt>Tasks</dt>
            <dd>
              {running} running · {queued} queued
            </dd>
          </div>
        </dl>
      </Card>
    </section>
  );
}
