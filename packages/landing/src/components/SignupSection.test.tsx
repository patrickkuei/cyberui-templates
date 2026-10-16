import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { SignupSection } from './SignupSection';

describe('SignupSection', () => {
  it('is the "Get started" region and holds the signup form', () => {
    render(<SignupSection />);
    const section = screen.getByRole('region', { name: 'Get started' });
    expect(section).toHaveAttribute('id', 'signup');
    expect(within(section).getByLabelText('Email address')).toBeInTheDocument();
    expect(within(section).getByRole('button', { name: 'Start free trial' })).toBeInTheDocument();
  });
});
