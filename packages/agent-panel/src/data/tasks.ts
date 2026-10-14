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

// What each status allows. Cancel and retry (the buttons and the engine), the
// cap on finished tasks and the Tasks page's Active filter all read these, so
// a new status is a compile error here until you decide both, instead of
// silently matching none of those checks.
const LIFECYCLE: Record<TaskStatus, { active: boolean; retryable: boolean }> = {
  queued: { active: true, retryable: false },
  running: { active: true, retryable: false },
  done: { active: false, retryable: false },
  failed: { active: false, retryable: true },
  cancelled: { active: false, retryable: true },
};
/** Still moving (can be cancelled; not yet counted as finished work). */
export const isActive = (status: TaskStatus) => LIFECYCLE[status].active;
/** Ended in a way a person can retry. */
export const isRetryable = (status: TaskStatus) => LIFECYCLE[status].retryable;
/** Sits under the queue's Finished heading. */
export const isFinished = (status: TaskStatus) => SECTION_OF[status] === 'finished';

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
