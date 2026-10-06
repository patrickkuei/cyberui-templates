import { describe, it, expect } from 'vitest';
import { groupTasks, sortTasks } from './tasks';
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

  it('sorts finished work by when it finished, not when it was created', () => {
    // A long-queued task that just finished belongs at the top of the finished group; one with no finish time (a fixture) falls back to its creation time.
    const justFinished = { ...task('just-finished', 'done', 1), finishedAt: 500 };
    const earlier = { ...task('earlier', 'done', 9), finishedAt: 100 };
    const noStamp = task('no-stamp', 'cancelled', 50);
    expect(sortTasks([earlier, noStamp, justFinished]).map((t) => t.id)).toEqual(['just-finished', 'earlier', 'no-stamp']);
  });

  it('does not change the array it is given', () => {
    const input = [task('a', 'done', 1), task('b', 'running', 2)];
    sortTasks(input);
    expect(input.map((t) => t.id)).toEqual(['a', 'b']);
  });
});

describe('groupTasks', () => {
  it('splits into Active, Failed and Finished in that order, leaving out empty sections', () => {
    const groups = groupTasks([task('d', 'done', 1), task('q', 'queued', 2), task('r', 'running', 3), task('c', 'cancelled', 4)]);
    expect(groups.map((g) => [g.section, g.tasks.map((t) => t.id)])).toEqual([
      ['active', ['r', 'q']],
      ['finished', ['c', 'd']],
    ]);
    expect(groupTasks([])).toEqual([]);
  });
});
