import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { FEATURES } from '../data/features';
import { FeaturesSection } from './FeaturesSection';

describe('FeaturesSection', () => {
  it('renders one card per feature, in order, in a labelled region', () => {
    render(<FeaturesSection />);
    const section = screen.getByRole('region', { name: 'Features' });
    expect(within(section).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual(
      FEATURES.map((feature) => feature.title),
    );
  });
});
