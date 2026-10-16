import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHeading } from './SectionHeading';

describe('SectionHeading', () => {
  it('renders the section title as an h2 and its lead as a paragraph', () => {
    render(<SectionHeading id="pricing" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Pricing' })).toBeInTheDocument();
    expect(screen.getByText('Start free. Pay when you outgrow it.')).toBeInTheDocument();
  });

  it('puts the id that names the section on a wrapper around the heading', () => {
    const { container } = render(<SectionHeading id="faq" />);
    const wrapper = container.querySelector('#faq-heading');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toContainElement(screen.getByRole('heading', { name: 'FAQ' }));
  });

  it('renders no lead paragraph for a section that has none', () => {
    const { container } = render(<SectionHeading id="logos" quiet />);
    expect(container.querySelector('.section-lead')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Teams who ship on Tessera' })).toBeInTheDocument();
  });
});
