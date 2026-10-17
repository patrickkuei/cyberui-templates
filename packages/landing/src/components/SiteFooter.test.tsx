import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('is the page’s contentinfo landmark', () => {
    render(<SiteFooter />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('says once, in the agreed words, that this is a demo', () => {
    render(<SiteFooter />);
    expect(screen.getAllByText('Template demo: Tessera is fictional and the form sends nothing.')).toHaveLength(1);
  });

  it('lists the link columns under their headings', () => {
    render(<SiteFooter />);
    const nav = screen.getByRole('navigation', { name: 'Footer' });
    expect(within(nav).getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Product', 'Company', 'Legal']);
    expect(within(nav).getByRole('link', { name: 'Privacy' })).toBeInTheDocument();
  });

  it('has mock links: clicking one is cancelled and does not touch location.hash', () => {
    render(<SiteFooter />);
    const link = screen.getByRole('link', { name: 'Privacy' });
    // fireEvent.click returns false when a handler called preventDefault.
    expect(fireEvent.click(link)).toBe(false);
    expect(window.location.hash).toBe('');
  });
});
