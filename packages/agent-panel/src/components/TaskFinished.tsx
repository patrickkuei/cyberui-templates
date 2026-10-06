import { formatClock } from '../utils/format';
import type { Task } from '../data/types';

export interface TaskFinishedProps {
  task: Task;
}

/**
 * "Finished at 12:03:41" under a done task, "Cancelled at ..." under a
 * cancelled one. Without it a finished row says nothing beyond its badge, and
 * the reader cannot tell when it ended. Renders nothing for a task that is not
 * finished, or a fixture that has no finish time. A failed task shows its
 * `error` instead.
 */
export function TaskFinished({ task }: TaskFinishedProps) {
  if (task.finishedAt === undefined || (task.status !== 'done' && task.status !== 'cancelled')) return null;
  return (
    <span className="task-finished">
      {task.status === 'done' ? 'Finished' : 'Cancelled'} at {formatClock(task.finishedAt)}
    </span>
  );
}
