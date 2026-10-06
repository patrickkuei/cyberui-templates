import { Card } from 'cyberui-2045';
import { contextLevel } from '../data/limits';
import { SUGGESTED_PROMPTS } from '../data/scenarios';
import { activeRun } from '../data/simulation';
import { useStickToBottom } from '../hooks/useStickToBottom';
import { ApprovalCard } from './ApprovalCard';
import { Composer } from './Composer';
import { MessageBubble } from './MessageBubble';
import type { AgentState } from '../data/types';

export interface ConversationPanelProps {
  state: AgentState;
  /** The run whose trace is on screen because the person picked its message; null follows the latest. */
  selectedRunId: string | null;
  /** Called with the run to show, or null to follow the latest again. */
  onSelectRun: (runId: string | null) => void;
  onSend: (text: string) => void;
  onResolveApproval: (approvalId: string, approved: boolean) => void;
}

/**
 * Why the composer cannot be used right now, or null. Computed here, in one
 * place and in priority order, so the box and the sentence explaining it never
 * disagree. The engine ignores a send in each of these states too
 * (simulation.ts sendMessage); this is the same rule shown to the person.
 */
function composerDisabledReason(state: AgentState): string | null {
  if (state.paused) return 'The agent is paused. Resume it to send a message.';
  const run = activeRun(state);
  if (run?.approval) return 'Approve or reject above to continue.';
  if (run) return 'Vesper is working…';
  if (contextLevel(state.contextTokens) === 'full') return 'Context full. Reset to start again.';
  return null;
}

export function ConversationPanel({ state, selectedRunId, onSelectRun, onSend, onResolveApproval }: ConversationPanelProps) {
  const approval = activeRun(state)?.approval ?? null;
  const last = state.messages.at(-1);
  // Changes when a message arrives and as the last one streams, which is when to keep up with the bottom.
  const scrollRef = useStickToBottom<HTMLDivElement>(`${state.messages.length}:${last?.revealed ?? 0}:${approval?.id ?? ''}`);

  return (
    <section aria-label="Conversation" className="panel-fill">
      <Card title="Conversation" className="panel-surface">
        {/* aria-relevant="additions": a reply is meant to be announced as a new
            message, not character by character as it grows. Whether screen
            readers behave that way is unchecked (see the spec's findings). */}
        <div ref={scrollRef} className="conversation-scroll" role="log" aria-label="Messages" aria-live="polite" aria-relevant="additions">
          {state.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              selected={message.runId !== undefined && message.runId === selectedRunId}
              // Picking the message that is already picked un-picks it, so the way
              // back is the same control that got you here, not a button in another pane.
              onSelect={(runId) => onSelectRun(runId === selectedRunId ? null : runId)}
            />
          ))}
          {approval && (
            <ApprovalCard
              key={approval.id}
              prompt={approval.prompt}
              onApprove={() => onResolveApproval(approval.id, true)}
              onReject={() => onResolveApproval(approval.id, false)}
            />
          )}
        </div>
        <Composer onSend={onSend} disabledReason={composerDisabledReason(state)} suggested={SUGGESTED_PROMPTS} />
      </Card>
    </section>
  );
}
