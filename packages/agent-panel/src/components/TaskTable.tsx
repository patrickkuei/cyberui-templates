import { Table } from 'cyberui-2045';
import type { TableColumn } from 'cyberui-2045';
import { sortTasks } from '../data/tasks';
import { taskProgress } from '../data/simulation';
import { TaskActions } from './TaskActions';
import { TaskStatusBadge } from './TaskStatusBadge';
import type { Task } from '../data/types';

export interface TaskTableProps {
  tasks: Task[];
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
}

// The page owns the filter (see TasksPage), so this shows whatever it is given.
export function TaskTable({ tasks, onCancel, onRetry }: TaskTableProps) {
  const columns: TableColumn<Task>[] = [
    {
      key: 'title',
      header: 'Task',
      render: (task) => (
        <>
          <span className="task-title">{task.title}</span>
          {task.status === 'failed' && task.error && <span className="task-error task-error--inline">{task.error}</span>}
        </>
      ),
    },
    { key: 'priority', header: 'Priority' },
    { key: 'status', header: 'Status', render: (task) => <TaskStatusBadge status={task.status} /> },
    { key: 'progress', header: 'Progress', align: 'right', render: (task) => `${taskProgress(task)}%` },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (task) => <TaskActions task={task} onCancel={onCancel} onRetry={onRetry} />,
    },
  ];

  return (
    <Table
      columns={columns}
      data={sortTasks(tasks)}
      getRowId={(task) => task.id}
      variant="striped"
      ariaLabel="Tasks"
      emptyMessage="No tasks match."
    />
  );
}
