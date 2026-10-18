import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TAB_ROUTES } from '../router/useHashRoute';
import { BackIcon, BatteryLowIcon, CheckIcon, ChevronIcon, CrossIcon, MinusIcon, PlusIcon, TAB_ICONS, WeakSignalIcon } from './index';

describe('icons', () => {
  it('draws an aria-hidden svg for each single icon', () => {
    for (const Icon of [BackIcon, ChevronIcon, PlusIcon, MinusIcon, BatteryLowIcon, WeakSignalIcon, CheckIcon, CrossIcon]) {
      const { container, unmount } = render(<Icon />);
      expect(container.querySelector('svg'), Icon.name).toHaveAttribute('aria-hidden', 'true');
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
