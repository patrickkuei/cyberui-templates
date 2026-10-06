import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TASK_BADGE } from '../theme/tones';
import type { TaskStatus } from '../data/types';

describe('TaskStatusBadge', () => {
  it('says the status in words, for every status', () => {
    const statuses = Object.keys(TASK_BADGE) as TaskStatus[];
    expect(statuses.sort()).toEqual(['cancelled', 'done', 'failed', 'queued', 'running']);
    for (const status of statuses) {
      const { unmount } = render(<TaskStatusBadge status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
      unmount();
    }
  });

  it('colours failed as an error and done as a success', () => {
    expect(TASK_BADGE.failed).toBe('error');
    expect(TASK_BADGE.done).toBe('success');
  });
});
