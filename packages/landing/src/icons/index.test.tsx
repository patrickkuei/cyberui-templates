import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FEATURES } from '../data/features';
import { CheckIcon, FEATURE_ICONS } from './index';

describe('icons', () => {
  it('draws an aria-hidden svg for the check mark', () => {
    const { container } = render(<CheckIcon />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws an aria-hidden svg for the icon of every feature', () => {
    for (const feature of FEATURES) {
      const Icon = FEATURE_ICONS[feature.icon];
      const { container, unmount } = render(<Icon />);
      expect(container.querySelector('svg'), `${feature.icon} draws nothing`).toHaveAttribute('aria-hidden', 'true');
      unmount();
    }
  });
});
