import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { LiveStatus } from './LiveStatus';
import { createInitialState } from '../data/simulation';
import { CONTEXT_WINDOW_TOKENS } from '../data/limits';
import type { AgentState } from '../data/types';

const NOW = 1_000_000;
const withTokens = (contextTokens: number): AgentState => ({ ...createInitialState(NOW), contextTokens });
const atPct = (pct: number) => Math.ceil((CONTEXT_WINDOW_TOKENS * pct) / 100);

function renderPanel(state: AgentState) {
  render(<LiveStatus state={state} />);
  return within(screen.getByRole('region', { name: 'Live status' }));
}

describe('LiveStatus', () => {
  it('is a named panel with the status badge and the activity sentence', () => {
    const panel = renderPanel(createInitialState(NOW));
    expect(panel.getByText('Idle')).toBeInTheDocument();
    expect(panel.getByText('Idle. 1 task running, 1 queued.')).toBeInTheDocument();
  });

  it('shows the context meter as a percentage and as tokens', () => {
    const panel = renderPanel(withTokens(5400));
    expect(panel.getByText('17%')).toBeInTheDocument();
    expect(panel.getByText('5,400 / 32,000 tokens')).toBeInTheDocument();
    expect(panel.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '17');
  });

  it('labels the meter as simulated, since the token counts are made up', () => {
    const panel = renderPanel(withTokens(5400));
    expect(panel.getByText(/simulated/i)).toBeInTheDocument();
  });

  it('carries the default tone below 70%, warning from 70% and error from 90%', () => {
    for (const [tokens, tone] of [
      [atPct(69), 'tone-default'],
      [atPct(70), 'tone-warning'],
      [atPct(89), 'tone-warning'],
      [atPct(90), 'tone-error'],
    ] as const) {
      const { unmount } = render(<LiveStatus state={withTokens(tokens)} />);
      const meter = within(screen.getByRole('region', { name: 'Live status' })).getByRole('group', { name: 'Context window' });
      expect(meter, `at ${tokens} tokens`).toHaveClass(tone);
      unmount();
    }
  });

  it('says in words when the context is high or full, not just in colour', () => {
    const high = renderPanel(withTokens(atPct(75)));
    expect(high.getByText('Getting full')).toBeInTheDocument();
  });

  it('says in words when the context is full', () => {
    const full = renderPanel(withTokens(atPct(95)));
    expect(full.getByText('Full')).toBeInTheDocument();
  });

  it('counts tool calls and tasks', () => {
    const state = { ...createInitialState(NOW), toolCalls: 7 };
    const panel = renderPanel(state);
    expect(panel.getByText('Tool calls')).toBeInTheDocument();
    expect(panel.getByText('7')).toBeInTheDocument();
    expect(panel.getByText('1 running · 1 queued')).toBeInTheDocument();
  });
});
