import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TasksPage } from './TasksPage';
import { createInitialState } from '../data/simulation';
import type { Task } from '../data/types';

const NOW = 1_000_000;
const SEEDED = createInitialState(NOW).tasks;
// Seed: Index refresh (running), Weekly digest draft (queued), Sync CRM contacts (failed), Archive resolved chats (done).

function renderPage(tasks: Task[] = SEEDED) {
  const onCancel = vi.fn();
  const onRetry = vi.fn();
  render(<TasksPage tasks={tasks} onCancel={onCancel} onRetry={onRetry} />);
  return { onCancel, onRetry, table: () => within(screen.getByRole('table', { name: 'Tasks' })) };
}

describe('TasksPage', () => {
  it('has a title and says the tasks are simulated', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Tasks' })).toBeInTheDocument();
    expect(screen.getByText('Simulated tasks. Cancel and Retry change the simulation only.')).toBeInTheDocument();
  });

  it('shows every task under All', () => {
    const { table } = renderPage();
    expect(table().getAllByRole('row')).toHaveLength(5); // header + 4
  });

  it('narrows to Active (queued and running), Done and Failed with the filter tabs', async () => {
    const { table } = renderPage();
    await userEvent.click(screen.getByRole('tab', { name: 'Active' }));
    expect(table().getByText('Index refresh: help-center articles')).toBeInTheDocument();
    expect(table().getByText('Weekly digest draft')).toBeInTheDocument();
    expect(table().queryByText('Sync CRM contacts')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Done' }));
    expect(table().getByText('Archive resolved chats')).toBeInTheDocument();
    expect(table().queryByText('Weekly digest draft')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Failed' }));
    expect(table().getByText('Sync CRM contacts')).toBeInTheDocument();
    expect(table().queryByText('Archive resolved chats')).not.toBeInTheDocument();
  });

  it('says so when a filter has nothing in it', async () => {
    renderPage(SEEDED.filter((t) => t.status !== 'failed'));
    await userEvent.click(screen.getByRole('tab', { name: 'Failed' }));
    expect(screen.getByText('No tasks match.')).toBeInTheDocument();
  });

  it('passes Cancel and Retry through to the callbacks', async () => {
    const { table, onCancel, onRetry } = renderPage();
    await userEvent.click(table().getByRole('button', { name: 'Retry Sync CRM contacts' }));
    expect(onRetry).toHaveBeenCalledWith('seed-t3');
    await userEvent.click(table().getByRole('button', { name: 'Cancel Weekly digest draft' }));
    expect(onCancel).toHaveBeenCalledWith('seed-t2');
  });
});
