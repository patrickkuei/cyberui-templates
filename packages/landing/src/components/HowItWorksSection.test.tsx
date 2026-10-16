import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { STEPS } from '../data/product';
import { HowItWorksSection } from './HowItWorksSection';

describe('HowItWorksSection', () => {
  it('shows the three steps with their captions', () => {
    render(<HowItWorksSection />);
    const section = screen.getByRole('region', { name: 'How it works' });
    for (const step of STEPS) {
      expect(within(section).getByText(step.title)).toBeInTheDocument();
      expect(within(section).getByText(step.description)).toBeInTheDocument();
    }
  });
});
