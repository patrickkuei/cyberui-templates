import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskActions } from './TaskActions';
import type { Task, TaskStatus } from '../data/types';

const make = (status: TaskStatus): Task => ({
  id: 't1', title: 'Index refresh', status, priority: 'normal', ticksDone: 0, ticksTotal: 10, createdAt: 0,
});

describe('TaskActions', () => {
  it.each(['queued', 'running'] as const)('offers only Cancel for a %s task', async (status) => {
    const onCancel = vi.fn();
    render(<TaskActions task={make(status)} onCancel={onCancel} onRetry={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /^Retry/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel Index refresh' }));
    expect(onCancel).toHaveBeenCalledWith('t1');
  });

  it.each(['failed', 'cancelled'] as const)('offers only Retry for a %s task', async (status) => {
    const onRetry = vi.fn();
    render(<TaskActions task={make(status)} onCancel={vi.fn()} onRetry={onRetry} />);
    expect(screen.queryByRole('button', { name: /^Cancel/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry Index refresh' }));
    expect(onRetry).toHaveBeenCalledWith('t1');
  });

  it('offers nothing for a finished task', () => {
    const { container } = render(<TaskActions task={make('done')} onCancel={vi.fn()} onRetry={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
