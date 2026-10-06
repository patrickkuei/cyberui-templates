import { useRef } from 'react';
import { Card, LinearProgress } from 'cyberui-2045';
import { SECTION_LABEL, groupTasks } from '../data/tasks';
import { taskProgress } from '../data/simulation';
import { TaskActions } from './TaskActions';
import { TaskFinished } from './TaskFinished';
import { TaskStatusBadge } from './TaskStatusBadge';
import type { Task } from '../data/types';

export interface TaskListProps {
  tasks: Task[];
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
}

const isFinished = (task: Task) => task.status === 'done' || task.status === 'cancelled';

/**
 * The Console's compact queue. The full table with a filter is TaskTable on the
 * Tasks page.
 *
 * Tasks are grouped under Active / Failed / Finished headings, so a task that
 * completes visibly moves from one section to another instead of just
 * disappearing from the top. The row that just arrived in Finished is
 * highlighted for a moment (see .task-row--arrived).
 */
export function TaskList({ tasks, onCancel, onRetry }: TaskListProps) {
  // Which finished tasks were already finished when this list first rendered,
  // so only a task that finishes while you watch gets the arrival highlight
  // (not every row on page load). Kept in a ref and updated during render, the
  // same way useStickToBottom reads the DOM during render: it is idempotent, so
  // a repeated render changes nothing. A task that leaves Finished (a retry) is
  // dropped from the set, so finishing again highlights it again.
  const settled = useRef<Set<string> | null>(null);
  const finishedIds = new Set(tasks.filter(isFinished).map((task) => task.id));
  if (settled.current === null) {
    settled.current = finishedIds;
  } else {
    for (const id of settled.current) if (!finishedIds.has(id)) settled.current.delete(id);
  }
  const arrived = (task: Task) => isFinished(task) && !settled.current?.has(task.id);

  const groups = groupTasks(tasks);
  return (
    <section aria-label="Task queue" className="panel-fill">
      <Card title="Task queue" className="panel-surface">
        {groups.length === 0 ? (
          <p className="empty-note">No tasks.</p>
        ) : (
          <div className="task-scroll">
            {groups.map(({ section, tasks: sectionTasks }) => (
              <div key={section} className="task-section">
                <h4 className="task-section-title">
                  {SECTION_LABEL[section]} <span className="task-section-count">({sectionTasks.length})</span>
                </h4>
                <ul className="task-list">
                  {sectionTasks.map((task) => (
                    <li key={task.id} className={arrived(task) ? 'task-row task-row--arrived' : 'task-row'}>
                      <div className="task-row-head">
                        <span className="task-title">{task.title}</span>
                        <TaskStatusBadge status={task.status} />
                      </div>
                      {/* One line under the title: the detail (progress, error or finish time) with the
                          action beside it, not under it. A task is two lines tall instead of three, so
                          the queue fits without a scrollbar in the default state. */}
                      <div className="task-row-foot">
                        <div className="task-row-detail">
                          {task.status === 'running' && (
                            <div className="task-progress">
                              <LinearProgress progress={taskProgress(task)} size="sm" className="meter-bar" />
                              <span className="task-progress-pct">{taskProgress(task)}%</span>
                            </div>
                          )}
                          {task.status === 'failed' && task.error && <p className="task-error">{task.error}</p>}
                          <TaskFinished task={task} />
                        </div>
                        <TaskActions task={task} onCancel={onCancel} onRetry={onRetry} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}
