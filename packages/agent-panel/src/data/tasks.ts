import type { Task, TaskStatus } from './types';

// Where each status sorts: what needs attention or is moving comes first,
// finished work sinks to the bottom. Done and cancelled share a group.
const GROUP: Record<TaskStatus, number> = { running: 0, queued: 1, failed: 2, done: 3, cancelled: 3 };

// What the compact queue shows as section headings. A task that finishes
// changes section, so the headings are what tell the reader it moved rather
// than vanished. Record<TaskStatus, ...> makes a new status without a section a
// compile error.
export type TaskSection = 'active' | 'failed' | 'finished';
const SECTION_OF: Record<TaskStatus, TaskSection> = {
  running: 'active',
  queued: 'active',
  failed: 'failed',
  done: 'finished',
  cancelled: 'finished',
};
const SECTION_ORDER: readonly TaskSection[] = ['active', 'failed', 'finished'];
export const SECTION_LABEL: Record<TaskSection, string> = { active: 'Active', failed: 'Failed', finished: 'Finished' };

/** Newest first: by when it finished for finished work (a fixture with no finish time falls back to creation), else by creation. */
const recency = (task: Task) => (SECTION_OF[task.status] === 'finished' ? (task.finishedAt ?? task.createdAt) : task.createdAt);

/** Running, queued, failed, then finished; newest first within each group. Returns a new array. */
export function sortTasks(tasks: readonly Task[]): Task[] {
  return [...tasks].sort((a, b) => GROUP[a.status] - GROUP[b.status] || recency(b) - recency(a));
}

/** The sorted tasks split into their sections, in order, leaving out empty ones. */
export function groupTasks(tasks: readonly Task[]): { section: TaskSection; tasks: Task[] }[] {
  const sorted = sortTasks(tasks);
  return SECTION_ORDER.map((section) => ({ section, tasks: sorted.filter((task) => SECTION_OF[task.status] === section) })).filter(
    (group) => group.tasks.length > 0,
  );
}
