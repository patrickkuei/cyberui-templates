import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskTable } from './TaskTable';
import type { Task } from '../data/types';

const make = (overrides: Partial<Task> & Pick<Task, 'id' | 'status'>): Task => ({
  title: overrides.id,
  priority: 'normal',
  ticksDone: 0,
  ticksTotal: 10,
  createdAt: 0,
  ...overrides,
});

const TASKS: Task[] = [
  make({ id: 'a', title: 'Archive chats', status: 'done', priority: 'low', ticksDone: 10, createdAt: 1 }),
  make({ id: 'b', title: 'Sync CRM', status: 'failed', error: 'Timed out after 30 s', createdAt: 2 }),
  make({ id: 'c', title: 'Weekly digest', status: 'queued', createdAt: 3 }),
  make({ id: 'd', title: 'Index refresh', status: 'running', priority: 'high', ticksDone: 5, ticksTotal: 10, createdAt: 4 }),
];

function renderTable() {
  const onCancel = vi.fn();
  const onRetry = vi.fn();
  render(<TaskTable tasks={TASKS} onCancel={onCancel} onRetry={onRetry} />);
  return { onCancel, onRetry, table: within(screen.getByRole('table', { name: 'Tasks' })) };
}

describe('TaskTable', () => {
  it('has the columns Task, Priority, Status, Progress and Actions', () => {
    const { table } = renderTable();
    for (const header of ['Task', 'Priority', 'Status', 'Progress', 'Actions']) {
      expect(table.getByRole('columnheader', { name: header })).toBeInTheDocument();
    }
  });

  it('shows a row per task with priority, status words and progress', () => {
    const { table } = renderTable();
    const row = within(table.getByText('Index refresh').closest('tr')!);
    expect(row.getByText('high')).toBeInTheDocument();
    expect(row.getByText('running')).toBeInTheDocument();
    expect(row.getByText('50%')).toBeInTheDocument();
  });

  it('offers Cancel only on queued and running tasks', async () => {
    const { table, onCancel } = renderTable();
    expect(table.getAllByRole('button', { name: /^Cancel / }).map((b) => b.getAttribute('aria-label'))).toEqual([
      'Cancel Index refresh',
      'Cancel Weekly digest',
    ]);
    await userEvent.click(table.getByRole('button', { name: 'Cancel Index refresh' }));
    expect(onCancel).toHaveBeenCalledWith('d');
  });

  it('offers Retry only on failed tasks here (nothing is cancelled), and shows the error', async () => {
    const { table, onRetry } = renderTable();
    expect(table.getAllByRole('button', { name: /^Retry / })).toHaveLength(1);
    expect(table.getByText('Timed out after 30 s')).toBeInTheDocument();
    await userEvent.click(table.getByRole('button', { name: 'Retry Sync CRM' }));
    expect(onRetry).toHaveBeenCalledWith('b');
  });

  it('does not own the filter: it shows whatever tasks it is given', () => {
    const onCancel = vi.fn();
    render(<TaskTable tasks={[]} onCancel={onCancel} onRetry={vi.fn()} />);
    expect(screen.getByText('No tasks match.')).toBeInTheDocument();
  });
});
