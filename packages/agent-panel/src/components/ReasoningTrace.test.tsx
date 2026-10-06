import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReasoningTrace } from './ReasoningTrace';
import { formatClock } from '../utils/format';
import type { TraceStep } from '../data/types';

const AT = new Date(2026, 9, 6, 9, 30, 15).getTime();

const STEPS: TraceStep[] = [
  { id: 's1', runId: 'r1', kind: 'thought', title: 'Plan the refund', detail: 'Find the order first.', outcome: 'ok', at: AT },
  { id: 's2', runId: 'r1', kind: 'tool', title: 'orders.lookup(order #4821)', outcome: 'ok', at: AT + 1000 },
  { id: 's3', runId: 'r1', kind: 'observation', title: 'Order #4821, $42.00', outcome: 'error', at: AT + 2000 },
  { id: 's4', runId: 'r1', kind: 'approval', title: 'Waiting for your approval', detail: 'Refund $42.00?', outcome: 'waiting', at: AT + 3000 },
];

function renderTrace(props: Partial<React.ComponentProps<typeof ReasoningTrace>> = {}) {
  const onFollowLatest = vi.fn();
  render(<ReasoningTrace steps={STEPS} runLabel="latest" onFollowLatest={onFollowLatest} {...props} />);
  return { onFollowLatest, panel: within(screen.getByRole('region', { name: 'Reasoning trace' })) };
}

describe('ReasoningTrace', () => {
  it('is titled as scripted, so nobody takes it for a real chain of thought (Review Focus #8)', () => {
    const { panel } = renderTrace();
    expect(panel.getByText('Reasoning trace (scripted)')).toBeInTheDocument();
  });

  it('puts the kind in each title, so meaning is not carried by the marker colour alone', () => {
    const { panel } = renderTrace();
    expect(panel.getByText('Thought: Plan the refund')).toBeInTheDocument();
    expect(panel.getByText('Tool: orders.lookup(order #4821)')).toBeInTheDocument();
    expect(panel.getByText('Result: Order #4821, $42.00')).toBeInTheDocument();
    expect(panel.getByText('Approval: Waiting for your approval')).toBeInTheDocument();
  });

  it('shows a step\'s detail and its clock time', () => {
    const { panel } = renderTrace();
    expect(panel.getByText('Find the order first.')).toBeInTheDocument();
    expect(panel.getByText(formatClock(AT))).toBeInTheDocument();
  });

  it('keeps steps in order, newest last', () => {
    const { panel } = renderTrace();
    const titles = panel.getAllByText(/^(Thought|Tool|Result|Approval): /).map((el) => el.textContent);
    expect(titles).toEqual([
      'Thought: Plan the refund',
      'Tool: orders.lookup(order #4821)',
      'Result: Order #4821, $42.00',
      'Approval: Waiting for your approval',
    ]);
  });

  it('scrolls inside its own container', () => {
    const { panel } = renderTrace();
    const scroll = panel.getByText('Thought: Plan the refund').closest('.trace-scroll');
    expect(scroll).not.toBeNull();
  });

  it('follows the latest run by default, with no banner and no way back to offer', () => {
    const { panel } = renderTrace({ runLabel: 'latest' });
    expect(panel.queryByText('Showing the run for the message you picked')).not.toBeInTheDocument();
    expect(panel.queryByRole('button', { name: 'Back to latest' })).not.toBeInTheDocument();
  });

  it('says when it is showing a picked run, and offers Back to latest', async () => {
    const { panel, onFollowLatest } = renderTrace({ runLabel: 'selected' });
    expect(panel.getByText('Showing the run for the message you picked')).toBeInTheDocument();
    await userEvent.click(panel.getByRole('button', { name: 'Back to latest' }));
    expect(onFollowLatest).toHaveBeenCalledTimes(1);
  });

  it('says what to do when there is nothing to show yet', () => {
    const { panel } = renderTrace({ steps: [] });
    expect(panel.getByText("Nothing yet. Send a message to see the agent's steps.")).toBeInTheDocument();
  });
});
