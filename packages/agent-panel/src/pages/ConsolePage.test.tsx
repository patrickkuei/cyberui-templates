import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConsolePage } from './ConsolePage';
import { activeRun, createInitialState, sendMessage, setPaused, tick } from '../data/simulation';
import type { AgentActions, AgentController } from '../data/useSimulatedAgent';
import type { AgentState } from '../data/types';

const NOW = 1_000_000;

function makeActions(): AgentActions {
  return {
    send: vi.fn(),
    resolveApproval: vi.fn(),
    stopRun: vi.fn(),
    cancelTask: vi.fn(),
    retryTask: vi.fn(),
    setPaused: vi.fn(),
    reset: vi.fn(),
  };
}

/** A finished refund-less run, so there is a second run's trace beside the seeded one. */
function afterOneRun(): AgentState {
  let s = sendMessage(createInitialState(NOW), 'what is the weather', NOW);
  for (let i = 0; i < 100 && activeRun(s); i++) s = tick(s, NOW + i, Infinity);
  return s;
}

// The page owns no selection state (App does, so it survives leaving the page),
// so tests stand in for App with a harness.
function Harness({ agent, initial = null }: { agent: AgentController; initial?: string | null }) {
  const [selected, setSelected] = useState<string | null>(initial);
  return <ConsolePage agent={agent} selectedRunId={selected} onSelectRun={setSelected} />;
}

function renderConsole(state: AgentState, initial: string | null = null) {
  const actions = makeActions();
  render(<Harness agent={{ state, actions }} initial={initial} />);
  const region = (name: string) => within(screen.getByRole('region', { name }));
  return { actions, region };
}

describe('ConsolePage', () => {
  it('renders the four named panels', () => {
    renderConsole(createInitialState(NOW));
    for (const name of ['Task queue', 'Conversation', 'Live status', 'Reasoning trace']) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
  });

  it('offers a pane switch for phones with a tab per pane (all panes stay in the DOM)', () => {
    renderConsole(createInitialState(NOW));
    const tabs = within(screen.getByRole('tablist'));
    expect(tabs.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Conversation', 'Tasks', 'Trace']);
    // CSS hides the other panes below 720px; the DOM keeps them all, because tests and
    // screen readers on wide screens need them, and happy-dom has no media queries.
    expect(screen.getByRole('region', { name: 'Task queue' })).toBeInTheDocument();
  });

  it('keeps the "Simulated" badge and the "Scripted demo" line on the page (Review Focus #8)', () => {
    const { region } = renderConsole(createInitialState(NOW));
    expect(screen.getByText('Simulated')).toBeInTheDocument();
    expect(
      region('Conversation').getByText('Scripted demo: no model, nothing sent.'),
    ).toBeInTheDocument();
  });

  it('follows the latest run by default', () => {
    const { region } = renderConsole(afterOneRun());
    const trace = region('Reasoning trace');
    expect(trace.getByText('Thought: Look for something I can do')).toBeInTheDocument();
    expect(trace.queryByText('Thought: Check the queue')).not.toBeInTheDocument();
    expect(trace.queryByText('Showing the run for the message you picked')).not.toBeInTheDocument();
  });

  it('shows the run of a message you pick, says so, and goes back to latest', async () => {
    const { region } = renderConsole(afterOneRun());
    await userEvent.click(region('Conversation').getByRole('button', { name: /^Four items/ }));
    const trace = region('Reasoning trace');
    expect(trace.getByText('Showing the run for the message you picked')).toBeInTheDocument();
    expect(trace.getByText('Thought: Check the queue')).toBeInTheDocument();
    expect(trace.queryByText('Thought: Look for something I can do')).not.toBeInTheDocument();

    await userEvent.click(trace.getByRole('button', { name: 'Back to latest' }));
    expect(region('Reasoning trace').getByText('Thought: Look for something I can do')).toBeInTheDocument();
  });

  it('wires the header: Pause, Reset, and Stop run only while a run is active', async () => {
    const idle = renderConsole(createInitialState(NOW));
    expect(screen.getByRole('button', { name: 'Stop run' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(idle.actions.setPaused).toHaveBeenCalledWith(true);
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(idle.actions.reset).toHaveBeenCalledTimes(1);
  });

  it('enables Stop run mid-run and calls stopRun', async () => {
    const { actions } = renderConsole(sendMessage(createInitialState(NOW), 'hello', NOW));
    await userEvent.click(screen.getByRole('button', { name: 'Stop run' }));
    expect(actions.stopRun).toHaveBeenCalledTimes(1);
  });

  it('offers Resume when paused', async () => {
    const { actions } = renderConsole(setPaused(createInitialState(NOW), true));
    await userEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(actions.setPaused).toHaveBeenCalledWith(false);
  });

  it('lets the queue cancel and retry tasks', async () => {
    const { actions, region } = renderConsole(createInitialState(NOW));
    await userEvent.click(region('Task queue').getByRole('button', { name: 'Retry Sync CRM contacts' }));
    expect(actions.retryTask).toHaveBeenCalledWith('seed-t3');
    await userEvent.click(region('Task queue').getByRole('button', { name: 'Cancel Weekly digest draft' }));
    expect(actions.cancelTask).toHaveBeenCalledWith('seed-t2');
  });
});
