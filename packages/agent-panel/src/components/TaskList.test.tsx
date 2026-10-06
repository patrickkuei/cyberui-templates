import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from './TaskList';
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
  make({ id: 'done-task', title: 'Archive chats', status: 'done', ticksDone: 10, createdAt: 1 }),
  make({ id: 'failed-task', title: 'Sync CRM', status: 'failed', error: 'Timed out after 30 s', createdAt: 2 }),
  make({ id: 'queued-task', title: 'Weekly digest', status: 'queued', createdAt: 3 }),
  make({ id: 'running-task', title: 'Index refresh', status: 'running', ticksDone: 2, ticksTotal: 8, createdAt: 4 }),
  make({ id: 'cancelled-task', title: 'Old export', status: 'cancelled', createdAt: 0 }),
];

function renderList(tasks: Task[] = TASKS) {
  const onCancel = vi.fn();
  const onRetry = vi.fn();
  render(<TaskList tasks={tasks} onCancel={onCancel} onRetry={onRetry} />);
  // The same task title also shows up in the trace ("Task: ...") and on the
  // Tasks page, so each test reads this panel through its named region.
  return { onCancel, onRetry, panel: within(screen.getByRole('region', { name: 'Task queue' })) };
}

describe('TaskList', () => {
  it('lists a row per task with its status in words', () => {
    const { panel } = renderList();
    for (const title of ['Archive chats', 'Sync CRM', 'Weekly digest', 'Index refresh', 'Old export']) {
      expect(panel.getByText(title)).toBeInTheDocument();
    }
    expect(panel.getByText('running')).toBeInTheDocument();
    expect(panel.getByText('failed')).toBeInTheDocument();
  });

  it('orders running, queued, failed, then the finished ones', () => {
    const { panel } = renderList();
    const order = panel.getAllByRole('listitem').map((row) => within(row).getAllByText(/./)[0]!.textContent);
    expect(order).toEqual(['Index refresh', 'Weekly digest', 'Sync CRM', 'Archive chats', 'Old export']);
  });

  it('shows progress for a running task', () => {
    const { panel } = renderList();
    expect(panel.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    expect(panel.getByText('25%')).toBeInTheDocument();
  });

  it('offers Cancel only on queued and running tasks, and calls back with the id', async () => {
    const { panel, onCancel } = renderList();
    expect(panel.getAllByRole('button', { name: /^Cancel / }).map((b) => b.getAttribute('aria-label'))).toEqual([
      'Cancel Index refresh',
      'Cancel Weekly digest',
    ]);
    await userEvent.click(panel.getByRole('button', { name: 'Cancel Weekly digest' }));
    expect(onCancel).toHaveBeenCalledWith('queued-task');
  });

  it('offers Retry only on failed and cancelled tasks, and calls back with the id', async () => {
    const { panel, onRetry } = renderList();
    expect(panel.getAllByRole('button', { name: /^Retry / }).map((b) => b.getAttribute('aria-label'))).toEqual([
      'Retry Sync CRM',
      'Retry Old export',
    ]);
    await userEvent.click(panel.getByRole('button', { name: 'Retry Sync CRM' }));
    expect(onRetry).toHaveBeenCalledWith('failed-task');
  });

  it('shows why a failed task failed', () => {
    const { panel } = renderList();
    expect(panel.getByText('Timed out after 30 s')).toBeInTheDocument();
  });

  it('says so when there are no tasks', () => {
    const { panel } = renderList([]);
    expect(panel.getByText('No tasks.')).toBeInTheDocument();
  });
});
