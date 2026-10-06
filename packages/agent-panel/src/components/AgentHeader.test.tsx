import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentHeader, type AgentHeaderProps } from './AgentHeader';

function renderHeader(overrides: Partial<AgentHeaderProps> = {}) {
  const props: AgentHeaderProps = {
    status: 'idle',
    paused: false,
    running: false,
    onPause: vi.fn(),
    onResume: vi.fn(),
    onStop: vi.fn(),
    ...overrides,
  };
  render(<AgentHeader {...props} />);
  return props;
}

describe('AgentHeader', () => {
  it('names the agent and always carries the "Simulated" badge (Review Focus #8)', () => {
    renderHeader();
    expect(screen.getByRole('heading', { level: 1, name: 'Vesper' })).toBeInTheDocument();
    expect(screen.getByText('Simulated')).toBeInTheDocument();
  });

  it('keeps the "Simulated" badge in every state', () => {
    renderHeader({ status: 'waiting', paused: true, running: true });
    expect(screen.getByText('Simulated')).toBeInTheDocument();
  });

  it('gives the avatar the accessible name "Vesper"', () => {
    renderHeader();
    expect(screen.getByRole('img', { name: 'Vesper' })).toBeInTheDocument();
  });

  it('shows the status label', () => {
    renderHeader({ status: 'waiting' });
    expect(screen.getByText('Waiting for approval')).toBeInTheDocument();
  });

  it('shows Pause while running and Resume while paused', async () => {
    const props = renderHeader();
    expect(screen.queryByRole('button', { name: 'Resume' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(props.onPause).toHaveBeenCalledTimes(1);
  });

  it('swaps to Resume when paused', async () => {
    const props = renderHeader({ paused: true, status: 'paused' });
    expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(props.onResume).toHaveBeenCalledTimes(1);
  });

  it('enables Stop run only while a run is active', async () => {
    const idle = renderHeader({ running: false });
    expect(screen.getByRole('button', { name: 'Stop run' })).toBeDisabled();
    expect(idle.onStop).not.toHaveBeenCalled();
  });

  it('calls onStop when a run is active', async () => {
    const props = renderHeader({ running: true });
    await userEvent.click(screen.getByRole('button', { name: 'Stop run' }));
    expect(props.onStop).toHaveBeenCalledTimes(1);
  });
});
