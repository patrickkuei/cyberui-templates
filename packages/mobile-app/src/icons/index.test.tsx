import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DEVICE_KINDS } from '../data/types';
import { TAB_ROUTES } from '../router/useHashRoute';
import { BackIcon, KIND_ICONS, TAB_ICONS } from './index';

describe('icons', () => {
  it('draws an aria-hidden svg for the back arrow', () => {
    const { container } = render(<BackIcon />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws an aria-hidden svg for every device kind', () => {
    expect(Object.keys(KIND_ICONS).sort()).toEqual([...DEVICE_KINDS].sort());
    for (const kind of DEVICE_KINDS) {
      const Icon = KIND_ICONS[kind];
      const { container, unmount } = render(<Icon />);
      expect(container.querySelector('svg'), `${kind} draws nothing`).toHaveAttribute('aria-hidden', 'true');
      unmount();
    }
  });

  it('draws an aria-hidden svg for every tab', () => {
    expect(Object.keys(TAB_ICONS).sort()).toEqual([...TAB_ROUTES].sort());
    for (const route of TAB_ROUTES) {
      const Icon = TAB_ICONS[route];
      const { container, unmount } = render(<Icon />);
      expect(container.querySelector('svg'), `${route} draws nothing`).toHaveAttribute('aria-hidden', 'true');
      unmount();
    }
  });
});
