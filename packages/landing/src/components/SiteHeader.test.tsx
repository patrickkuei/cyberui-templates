import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
  const goTo = vi.fn();

  beforeEach(() => {
    goTo.mockClear();
    window.location.hash = '';
  });

  it('shows the wordmark and a link for every nav entry, in page order', () => {
    render(<SiteHeader goTo={goTo} />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getAllByRole('link').map((link) => link.textContent)).toEqual(['Features', 'How it works', 'Pricing', 'FAQ']);
    expect(screen.getByRole('link', { name: 'Tessera' })).toBeInTheDocument();
  });

  it('scrolls to the section on a nav click and leaves location.hash alone', async () => {
    render(<SiteHeader goTo={goTo} />);
    await userEvent.click(within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('link', { name: 'Pricing' }));
    expect(goTo).toHaveBeenCalledExactlyOnceWith('pricing');
    expect(window.location.hash).toBe('');
  });

  it('sends the header button to the signup form', async () => {
    render(<SiteHeader goTo={goTo} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start free trial' }));
    expect(goTo).toHaveBeenCalledExactlyOnceWith('signup');
  });

  describe('the menu below md', () => {
    it('opens a dialog with the same links, and says so on the button', async () => {
      render(<SiteHeader goTo={goTo} />);
      const menuButton = screen.getByRole('button', { name: 'Menu' });
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      await userEvent.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      // The links now exist twice (header nav and menu), so scope to the dialog.
      const dialog = screen.getByRole('dialog', { name: 'Menu' });
      expect(within(dialog).getAllByRole('link').map((link) => link.textContent)).toEqual(['Features', 'How it works', 'Pricing', 'FAQ']);
    });

    it('closes on a link click and scrolls only after it has closed', async () => {
      render(<SiteHeader goTo={goTo} />);
      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
      await userEvent.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'FAQ' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(goTo).toHaveBeenCalledExactlyOnceWith('faq');
      expect(window.location.hash).toBe('');
    });

    it('lets the menu start the trial too', async () => {
      render(<SiteHeader goTo={goTo} />);
      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
      await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Start free trial' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(goTo).toHaveBeenCalledExactlyOnceWith('signup');
    });

    it('closes on Escape without scrolling anywhere', async () => {
      render(<SiteHeader goTo={goTo} />);
      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
      await userEvent.keyboard('{Escape}');
      // The library closes with a short animation, then calls onClose.
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(goTo).not.toHaveBeenCalled();
    });
  });
});
