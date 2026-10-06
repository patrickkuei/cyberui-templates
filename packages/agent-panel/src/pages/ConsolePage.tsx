import { useState } from 'react';
import { TabNavigation } from 'cyberui-2045';
import { activeRun, deriveStatus } from '../data/simulation';
import type { AgentController } from '../data/useSimulatedAgent';
import { AgentHeader } from '../components/AgentHeader';
import { ConversationPanel } from '../components/ConversationPanel';
import { LiveStatus } from '../components/LiveStatus';
import { ReasoningTrace } from '../components/ReasoningTrace';
import { TaskList } from '../components/TaskList';

export interface ConsolePageProps {
  agent: AgentController;
  /** The run whose trace is shown because the person picked its message; null follows the latest run. */
  selectedRunId: string | null;
  onSelectRun: (runId: string | null) => void;
}

// Below 720px there is room for one pane at a time, chosen with these tabs.
// TabNavigation takes labels, so the active pane is stored as a label from
// this tuple; the Record gives each pane its grid-area class and makes a pane
// without one a type error. CSS only hides the inactive panes: all three are
// always in the DOM, so nothing remounts (or loses its scroll) when you switch.
const PANES = ['Conversation', 'Tasks', 'Trace'] as const;
type Pane = (typeof PANES)[number];
const PANE_CLASS: Record<Pane, string> = {
  Conversation: 'pane-conversation',
  Tasks: 'pane-queue',
  Trace: 'pane-trace',
};
const isPane = (value: string): value is Pane => (PANES as readonly string[]).includes(value);

export function ConsolePage({ agent, selectedRunId, onSelectRun }: ConsolePageProps) {
  const { state, actions } = agent;
  const [pane, setPane] = useState<Pane>('Conversation');

  const status = deriveStatus(state);
  const running = activeRun(state) !== undefined;
  // The run shown in the trace: the one the person picked, else the newest.
  const shownRunId = selectedRunId ?? state.runs.at(-1)?.id ?? null;
  const steps = state.trace.filter((step) => step.runId === shownRunId);

  const paneClass = (name: Pane) => (name === pane ? `console-pane ${PANE_CLASS[name]} console-pane--active` : `console-pane ${PANE_CLASS[name]}`);

  return (
    <>
      <AgentHeader
        status={status}
        paused={state.paused}
        running={running}
        onPause={() => actions.setPaused(true)}
        onResume={() => actions.setPaused(false)}
        onStop={actions.stopRun}
      />

      <div className="pane-tabs">
        <TabNavigation
          tabs={PANES}
          activeTab={pane}
          onTabChange={(next) => {
            if (isPane(next)) setPane(next);
          }}
        />
      </div>

      <div className="console-grid">
        <div className={paneClass('Tasks')}>
          <TaskList tasks={state.tasks} onCancel={actions.cancelTask} onRetry={actions.retryTask} />
        </div>
        <div className={paneClass('Conversation')}>
          <ConversationPanel
            state={state}
            selectedRunId={selectedRunId}
            onSelectRun={onSelectRun}
            onSend={actions.send}
            onResolveApproval={actions.resolveApproval}
          />
        </div>
        <div className={paneClass('Trace')}>
          <div className="console-side">
            <LiveStatus state={state} />
            <ReasoningTrace
              steps={steps}
              runLabel={selectedRunId === null ? 'latest' : 'selected'}
              onFollowLatest={() => onSelectRun(null)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
