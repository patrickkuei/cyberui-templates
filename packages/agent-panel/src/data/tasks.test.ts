import { describe, it, expect } from 'vitest';
import { sortTasks } from './tasks';
import type { Task, TaskStatus } from './types';

const task = (id: string, status: TaskStatus, createdAt: number): Task => ({
  id, title: id, status, priority: 'normal', ticksDone: 0, ticksTotal: 10, createdAt,
});

describe('sortTasks', () => {
  it('orders running, queued, failed, then finished, newest first within a group', () => {
    const sorted = sortTasks([
      task('done-old', 'done', 1),
      task('queued-old', 'queued', 2),
      task('failed', 'failed', 3),
      task('running-old', 'running', 4),
      task('done-new', 'done', 9),
      task('cancelled', 'cancelled', 5),
      task('running-new', 'running', 8),
      task('queued-new', 'queued', 7),
    ]).map((t) => t.id);
    expect(sorted).toEqual([
      'running-new', 'running-old',
      'queued-new', 'queued-old',
      'failed',
      'done-new', 'cancelled', 'done-old',
    ]);
  });

  it('does not change the array it is given', () => {
    const input = [task('a', 'done', 1), task('b', 'running', 2)];
    sortTasks(input);
    expect(input.map((t) => t.id)).toEqual(['a', 'b']);
  });
});
