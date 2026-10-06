import { useEffect, useRef } from 'react';
import { Button, Card, Timeline } from 'cyberui-2045';
import type { TimelineEvent } from 'cyberui-2045';
import { TRACE_KIND_LABEL, TRACE_STATUS } from '../theme/tones';
import { formatClock } from '../utils/format';
import type { TraceStep } from '../data/types';

export interface ReasoningTraceProps {
  steps: TraceStep[];
  /** 'selected' when the person picked an earlier message; 'latest' when following the newest run. */
  runLabel: 'latest' | 'selected';
  onFollowLatest: () => void;
}

// A trace is the agent's steps as they happened. Here every step is scripted
// (see data/scenarios.ts), so the panel says so in its title: it illustrates
// the shape of an agent's trace, it is not a model's real reasoning.
export function ReasoningTrace({ steps, runLabel, onFollowLatest }: ReasoningTraceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest step in view as the trace grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [steps.length]);

  // Timeline events carry a plain title string, so the kind goes in the title
  // text ("Thought: ...") rather than only in the marker colour.
  const events: TimelineEvent[] = steps.map((step) => {
    const event: TimelineEvent = {
      title: `${TRACE_KIND_LABEL[step.kind]}: ${step.title}`,
      time: formatClock(step.at),
      status: TRACE_STATUS[step.outcome],
    };
    if (step.detail !== undefined) event.description = step.detail;
    return event;
  });

  return (
    <section aria-label="Reasoning trace">
      <Card title="Reasoning trace (scripted)" className="panel-surface">
        {runLabel === 'selected' && (
          <div className="trace-picked">
            <span>Showing the run for the message you picked</span>
            <Button variant="ghost" size="sm" onClick={onFollowLatest}>
              Back to latest
            </Button>
          </div>
        )}
        <div ref={scrollRef} className="trace-scroll">
          {events.length === 0 ? (
            <p className="empty-note">Nothing yet. Send a message to see the agent&apos;s steps.</p>
          ) : (
            <Timeline events={events} size="sm" />
          )}
        </div>
      </Card>
    </section>
  );
}
