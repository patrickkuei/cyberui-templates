import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../data/types';

const agent: Message = { id: 'm1', role: 'agent', text: 'Hello there', revealed: 5, runId: 'run-1', at: 0 };
const user: Message = { id: 'm2', role: 'user', text: 'Hi Vesper', revealed: 9, at: 0 };

describe('MessageBubble', () => {
  it('shows only the revealed part of a streaming message', () => {
    render(<MessageBubble message={agent} selected={false} onSelect={vi.fn()} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByText(/Hello there/)).not.toBeInTheDocument();
  });

  it('shows the whole message once it is fully revealed', () => {
    render(<MessageBubble message={{ ...agent, revealed: agent.text.length }} selected={false} onSelect={vi.fn()} />);
    expect(screen.getByText('Hello there')).toBeInTheDocument();
  });

  it('makes an agent message with a run a real button named by its text, and selects that run', async () => {
    const onSelect = vi.fn();
    render(<MessageBubble message={agent} selected={false} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Hello' }));
    expect(onSelect).toHaveBeenCalledWith('run-1');
  });

  it('is reachable and operable from the keyboard', async () => {
    const onSelect = vi.fn();
    render(<MessageBubble message={agent} selected={false} onSelect={onSelect} />);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Hello' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('run-1');
  });

  it('does not make a user message a button', () => {
    render(<MessageBubble message={user} selected={false} onSelect={vi.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Hi Vesper')).toBeInTheDocument();
  });

  it('does not make an agent message without a run a button (the run is what it would select)', () => {
    const { runId: _runId, ...noRun } = agent;
    render(<MessageBubble message={noRun} selected={false} onSelect={vi.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('marks the selected message with aria-pressed', () => {
    const { rerender } = render(<MessageBubble message={agent} selected={false} onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Hello' })).toHaveAttribute('aria-pressed', 'false');
    rerender(<MessageBubble message={agent} selected onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Hello' })).toHaveAttribute('aria-pressed', 'true');
  });
});
