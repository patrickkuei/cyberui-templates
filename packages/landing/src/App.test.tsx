import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { SECTIONS } from './sections';

describe('App', () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    // happy-dom has no layout, so record the call instead of scrolling.
    Element.prototype.scrollIntoView = scrollIntoView;
    scrollIntoView.mockClear();
    window.location.hash = '';
  });
  afterEach(() => vi.unstubAllGlobals());

  it('renders the three landmarks and both navigation regions', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeInTheDocument();
  });

  it('has exactly one h1, and headings never skip a level', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    let previous = 0;
    for (const heading of screen.getAllByRole('heading')) {
      const level = Number(heading.tagName.slice(1));
      expect(level, `"${heading.textContent}" jumps from h${previous} to h${level}`).toBeLessThanOrEqual(previous + 1);
      previous = level;
    }
  });

  it('renders every section in SECTIONS order, each a labelled region that code can focus', () => {
    render(<App />);
    const rendered = Array.from(document.querySelectorAll('main > section')).map((section) => section.id);
    expect(rendered).toEqual([...SECTIONS]);
    for (const section of document.querySelectorAll('main > section')) {
      expect(section).toHaveAttribute('aria-labelledby', `${section.id}-heading`);
      expect(section).toHaveAttribute('tabindex', '-1');
      expect(document.getElementById(`${section.id}-heading`), `${section.id} has no heading`).not.toBeNull();
    }
  });

  it('skips to the main content without touching location.hash', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('link', { name: 'Skip to main content' }));
    expect(screen.getByRole('main')).toHaveFocus();
    expect(window.location.hash).toBe('');
  });

  // "Start free trial" is in the header, the hero, the Pro plan and the signup
  // form, so queries here are scoped to the region they mean (the same fix as
  // everywhere in this repo: scope with within(), never rename the text).
  it('scrolls to a section, smoothly, when a nav link is clicked, and moves focus there', async () => {
    render(<App />);
    await userEvent.click(within(screen.getByRole('banner')).getByRole('link', { name: 'Pricing' }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('pricing'));
    expect(document.getElementById('pricing')).toHaveFocus();
    expect(window.location.hash).toBe('');
  });

  it('jumps instead of animating when the visitor prefers reduced motion', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    render(<App />);
    await userEvent.click(within(screen.getByRole('banner')).getByRole('button', { name: 'Start free trial' }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('signup'));
  });

  it('takes a visitor from the pricing toggle to the confirmation, the whole page working together', async () => {
    render(<App />);
    const pricing = screen.getByRole('region', { name: 'Pricing' });
    await userEvent.click(within(pricing).getByRole('switch', { name: 'Bill yearly' }));
    expect(within(pricing).getByText('billed $240 yearly')).toBeInTheDocument();

    const signup = screen.getByRole('region', { name: 'Get started' });
    await userEvent.type(within(signup).getByLabelText('Email address'), 'ada@example.com');
    await userEvent.click(within(signup).getByRole('button', { name: 'Start free trial' }));
    expect(within(signup).getByRole('status')).toHaveTextContent('on the list');
  });
});
