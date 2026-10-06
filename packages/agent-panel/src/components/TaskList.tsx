import { Card, LinearProgress } from 'cyberui-2045';
import { sortTasks } from '../data/tasks';
import { taskProgress } from '../data/simulation';
import { TaskActions } from './TaskActions';
import { TaskStatusBadge } from './TaskStatusBadge';
import type { Task } from '../data/types';

export interface TaskListProps {
  tasks: Task[];
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
}

/** The Console's compact queue. The full table with a filter is TaskTable on the Tasks page. */
export function TaskList({ tasks, onCancel, onRetry }: TaskListProps) {
  const sorted = sortTasks(tasks);
  return (
    <section aria-label="Task queue">
      <Card title="Task queue" className="panel-surface">
        {sorted.length === 0 ? (
          <p className="empty-note">No tasks.</p>
        ) : (
          <ul className="task-list">
            {sorted.map((task) => (
              <li key={task.id} className="task-row">
                <div className="task-row-head">
                  <span className="task-title">{task.title}</span>
                  <TaskStatusBadge status={task.status} />
                </div>
                {task.status === 'running' && (
                  <div className="task-progress">
                    <LinearProgress progress={taskProgress(task)} size="sm" />
                    <span className="task-progress-pct">{taskProgress(task)}%</span>
                  </div>
                )}
                {task.status === 'failed' && task.error && <p className="task-error">{task.error}</p>}
                <TaskActions task={task} onCancel={onCancel} onRetry={onRetry} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
