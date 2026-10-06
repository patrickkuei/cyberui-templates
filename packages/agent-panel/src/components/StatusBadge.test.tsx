import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';
import { STATUS_VIEW } from '../theme/tones';
import type { AgentStatus } from '../data/types';

describe('StatusBadge', () => {
  it('shows the label for every status, so state is never carried by colour alone', () => {
    const statuses = Object.keys(STATUS_VIEW) as AgentStatus[];
    for (const status of statuses) {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(STATUS_VIEW[status].label)).toBeInTheDocument();
      unmount();
    }
  });

  it('says "Waiting for approval" for the waiting status', () => {
    render(<StatusBadge status="waiting" />);
    expect(screen.getByText('Waiting for approval')).toBeInTheDocument();
  });

  it('gives the waiting badge the warning variant (asserted on the view map, not the library classes)', () => {
    expect(STATUS_VIEW.waiting.badge).toBe('warning');
    expect(STATUS_VIEW.working.badge).toBe('success');
  });
});
