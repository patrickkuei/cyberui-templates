import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomePage } from './HomePage';
import { TOTAL_STAGES } from '../content/processStages';
import { TEMPLATES } from '../data/templates';

describe('HomePage', () => {
  it('renders the hero headline and one CTA into the templates', () => {
    render(<HomePage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Built by AI.');
    expect(heading).toHaveTextContent('Ready for yours.');
    // Just the hero CTA now — the page is short enough that a second,
    // closing CTA was visible in the same glance as the first, reading as
    // duplication rather than reinforcement (dropped after visual review).
    expect(screen.getAllByRole('button', { name: 'Pick a starting point' })).toHaveLength(1);
  });

  it('points to How we design with one quiet link, and still has just one button', () => {
    render(<HomePage />);
    const link = screen.getByRole('link', { name: 'How we design' });
    expect(link).toHaveAttribute('href', '#/process');
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByText(new RegExp(`${TOTAL_STAGES} stages from discovery to handoff`))).toBeInTheDocument();
  });

  it("does not list individual templates on Home — that's Templates' job", () => {
    render(<HomePage />);
    expect(screen.queryByText('AI Product Monitoring')).not.toBeInTheDocument();
  });

  it('derives the template count from TEMPLATES instead of a hardcoded string', () => {
    render(<HomePage />);
    const count = TEMPLATES.length;
    expect(screen.getByText(`${count} template${count === 1 ? '' : 's'} ready.`)).toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });
});
