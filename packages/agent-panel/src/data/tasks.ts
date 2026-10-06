import type { Task, TaskStatus } from './types';

// Where each status sorts: what needs attention or is moving comes first,
// finished work sinks to the bottom. Done and cancelled share a group.
const GROUP: Record<TaskStatus, number> = { running: 0, queued: 1, failed: 2, done: 3, cancelled: 3 };

/** Running, queued, failed, then finished; newest first within each group. Returns a new array. */
export function sortTasks(tasks: readonly Task[]): Task[] {
  return [...tasks].sort((a, b) => GROUP[a.status] - GROUP[b.status] || b.createdAt - a.createdAt);
}
