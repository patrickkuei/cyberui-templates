import { Button } from 'cyberui-2045';
import type { Task } from '../data/types';

export interface TaskActionsProps {
  task: Task;
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
}

// Shared by the compact queue and the full table so the two cannot disagree on
// when a task may be cancelled or retried. The accessible name carries the
// task title because a page of identical "Cancel" buttons is unusable by ear.
// Both only change the in-browser simulation (see data/simulation.ts).
export function TaskActions({ task, onCancel, onRetry }: TaskActionsProps) {
  if (task.status === 'queued' || task.status === 'running') {
    return (
      <Button variant="ghost" size="sm" aria-label={`Cancel ${task.title}`} onClick={() => onCancel(task.id)}>
        Cancel
      </Button>
    );
  }
  if (task.status === 'failed' || task.status === 'cancelled') {
    return (
      <Button variant="secondary" size="sm" aria-label={`Retry ${task.title}`} onClick={() => onRetry(task.id)}>
        Retry
      </Button>
    );
  }
  return null;
}
