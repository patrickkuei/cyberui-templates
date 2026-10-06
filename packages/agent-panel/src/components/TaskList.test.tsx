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

  it('groups the tasks under Active, Failed and Finished headings with counts', () => {
    const { panel } = renderList();
    const headings = panel.getAllByRole('heading', { level: 4 }).map((h) => h.textContent);
    expect(headings).toEqual(['Active (2)', 'Failed (1)', 'Finished (2)']);
    const finished = within(panel.getByRole('heading', { name: /^Finished/ }).parentElement!);
    expect(finished.getAllByRole('listitem')).toHaveLength(2);
  });

  it('says when a finished task finished, so a done row is not a dead end', () => {
    const finishedAt = new Date(2026, 9, 6, 12, 3, 41).getTime();
    const { panel } = renderList([make({ id: 'a', title: 'Archive chats', status: 'done', finishedAt })]);
    expect(panel.getByText('Finished at 12:03:41')).toBeInTheDocument();
    // Done has nothing to retry or cancel; the detail line is what the row offers.
    expect(panel.queryByRole('button')).not.toBeInTheDocument();
  });

  it('highlights a task that finishes while you watch, and not the ones already finished', () => {
    const running = make({ id: 'r', title: 'Index refresh', status: 'running', ticksDone: 7, ticksTotal: 8, createdAt: 5 });
    const before = [make({ id: 'old', title: 'Archive chats', status: 'done', createdAt: 1, finishedAt: 10 }), running];
    const { rerender } = render(<TaskList tasks={before} onCancel={vi.fn()} onRetry={vi.fn()} />);
    const row = (title: string) => screen.getByText(title).closest('li')!;
    expect(row('Archive chats')).not.toHaveClass('task-row--arrived');

    rerender(<TaskList tasks={[before[0]!, { ...running, status: 'done', ticksDone: 8, finishedAt: 20 }]} onCancel={vi.fn()} onRetry={vi.fn()} />);
    expect(row('Index refresh')).toHaveClass('task-row--arrived');
    expect(row('Archive chats')).not.toHaveClass('task-row--arrived');
    // It moved to the top of Finished, above the one that finished earlier.
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      expect.stringContaining('Index refresh'),
      expect.stringContaining('Archive chats'),
    ]);
  });

  it('says so when there are no tasks', () => {
    const { panel } = renderList([]);
    expect(panel.getByText('No tasks.')).toBeInTheDocument();
  });
});
