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

  // The colours are the library's own status colours (online green, low battery
  // amber, offline red). Badge turns its `variant` into a bg-<variant> class, so
  // that is what is checked; update it with the library if its class names change.
  it('colours online as success, low battery as warning and offline as error', () => {
    const expected = { online: 'bg-success', 'low-battery': 'bg-warning', offline: 'bg-error' };
    const label = { online: 'Online', 'low-battery': 'Low battery', offline: 'Offline' };
    for (const status of DEVICE_STATUSES) {
      const { container, unmount } = render(<StatusBadge status={status} />);
      expect(container).toHaveTextContent(label[status]);
      expect(container.firstElementChild, status).toHaveClass(expected[status]);
      unmount();
    }
  });
});
