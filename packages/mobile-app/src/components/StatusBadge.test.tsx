import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DEVICE_STATUSES } from '../data/types';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('says the status in words, so colour is never the only signal', () => {
    const expected = { online: 'Online', 'low-battery': 'Low battery', offline: 'Offline' };
    for (const status of DEVICE_STATUSES) {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(expected[status])).toBeInTheDocument();
      unmount();
    }
  });
});
