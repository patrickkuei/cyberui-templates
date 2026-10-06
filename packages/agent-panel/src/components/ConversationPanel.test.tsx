import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversationPanel } from './ConversationPanel';
import { activeRun, createInitialState, sendMessage, setPaused, tick } from '../data/simulation';
import { CONTEXT_WINDOW_TOKENS } from '../data/limits';
import type { AgentState } from '../data/types';

const NOW = 1_000_000;
const fresh = () => createInitialState(NOW);

function untilApproval(state: AgentState): AgentState {
  let s = state;
  for (let i = 0; i < 200 && !activeRun(s)?.approval; i++) s = tick(s, NOW + i, Infinity);
  return s;
}

function renderPanel(state: AgentState, selectedRunId: string | null = null) {
  const props = { onSelectRun: vi.fn(), onSend: vi.fn(), onResolveApproval: vi.fn() };
  const { unmount } = render(<ConversationPanel state={state} selectedRunId={selectedRunId} {...props} />);
  return { ...props, unmount, panel: within(screen.getByRole('region', { name: 'Conversation' })) };
}

describe('ConversationPanel', () => {
  it('shows the messages in order, with only the revealed part of a streaming reply', () => {
    const state = fresh();
    state.messages[1] = { ...state.messages[1]!, revealed: 4 };
    const { panel } = renderPanel(state);
    const log = panel.getByRole('log', { name: 'Messages' });
    expect(within(log).getByText("What's on the queue today?")).toBeInTheDocument();
    expect(within(log).getByText('Four')).toBeInTheDocument();
  });

  it('marks the message list as a polite live region that announces additions', () => {
    const { panel } = renderPanel(fresh());
    const log = panel.getByRole('log', { name: 'Messages' });
    expect(log).toHaveAttribute('aria-live', 'polite');
    expect(log).toHaveAttribute('aria-relevant', 'additions');
  });

  it('selecting an agent message reports its run', async () => {
    const { panel, onSelectRun } = renderPanel(fresh());
    await userEvent.click(panel.getByRole('button', { name: /^Four items/ }));
    expect(onSelectRun).toHaveBeenCalledWith('seed-run');
  });

  it('marks the message of the selected run as pressed', () => {
    const { panel } = renderPanel(fresh(), 'seed-run');
    expect(panel.getByRole('button', { name: /^Four items/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows the approval card only while the active run waits, and reports the decision with its id', async () => {
    const quiet = renderPanel(fresh());
    expect(quiet.panel.queryByRole('group')).not.toBeInTheDocument();
    quiet.unmount();

    const waiting = untilApproval(sendMessage(fresh(), 'refund order #4821', NOW));
    const approvalId = activeRun(waiting)!.approval!.id;
    const { panel, onResolveApproval } = renderPanel(waiting);
    // The composer's reason also mentions approving, so the card is found by its named group.
    const card = within(panel.getByRole('group', { name: 'Refund $42.00 to the customer for order #4821?' }));
    await userEvent.click(card.getByRole('button', { name: 'Approve' }));
    expect(onResolveApproval).toHaveBeenLastCalledWith(approvalId, true);
    await userEvent.click(card.getByRole('button', { name: 'Reject' }));
    expect(onResolveApproval).toHaveBeenLastCalledWith(approvalId, false);
  });

  describe('the composer says why it is disabled (Review Focus #5)', () => {
    it('is enabled and silent when the agent is idle', () => {
      const { panel } = renderPanel(fresh());
      expect(panel.getByRole('textbox', { name: 'Message Vesper' })).toBeEnabled();
    });

    it('paused', () => {
      const { panel } = renderPanel(setPaused(fresh(), true));
      expect(panel.getByRole('textbox', { name: 'Message Vesper' })).toBeDisabled();
      expect(panel.getByText('The agent is paused. Resume it to send a message.')).toBeInTheDocument();
    });

    it('working', () => {
      const { panel } = renderPanel(sendMessage(fresh(), 'hello', NOW));
      expect(panel.getByRole('textbox', { name: 'Message Vesper' })).toBeDisabled();
      expect(panel.getByText('Vesper is working…')).toBeInTheDocument();
    });

    it('waiting for an approval', () => {
      const { panel } = renderPanel(untilApproval(sendMessage(fresh(), 'refund order #4821', NOW)));
      expect(panel.getByRole('textbox', { name: 'Message Vesper' })).toBeDisabled();
      expect(panel.getByText('Approve or reject above to continue.')).toBeInTheDocument();
    });

    it('context full', () => {
      const { panel } = renderPanel({ ...fresh(), contextTokens: CONTEXT_WINDOW_TOKENS });
      expect(panel.getByRole('textbox', { name: 'Message Vesper' })).toBeDisabled();
      expect(panel.getByText('Context full. Reset to start again.')).toBeInTheDocument();
    });
  });

  it('sends what is typed', async () => {
    const { panel, onSend } = renderPanel(fresh());
    await userEvent.type(panel.getByRole('textbox', { name: 'Message Vesper' }), 'hello{enter}');
    expect(onSend).toHaveBeenCalledWith('hello');
  });

  it('keeps the "Scripted demo" helper line in view (Review Focus #8)', () => {
    const { panel } = renderPanel(fresh());
    expect(
      panel.getByText('Scripted demo: replies are pre-written. Nothing is sent to a model or leaves your browser.'),
    ).toBeInTheDocument();
  });
});
