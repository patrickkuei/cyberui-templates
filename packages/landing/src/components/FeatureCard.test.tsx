import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FEATURES } from '../data/features';
import { FeatureCard } from './FeatureCard';

describe('FeatureCard', () => {
  it('renders its title as an h3 and its text, with a decorative icon', () => {
    const feature = FEATURES[0]!;
    const { container } = render(<FeatureCard feature={feature} />);
    expect(screen.getByRole('heading', { level: 3, name: feature.title })).toBeInTheDocument();
    expect(screen.getByText(feature.body)).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
