import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('has the page’s one h1, with the highlighted phrase inside it', () => {
    render(<HeroSection goTo={vi.fn()} />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('From git push to live in seconds');
    expect(screen.getByRole('region', { name: 'From git push to live in seconds' })).toBeInTheDocument();
  });

  it('sends the primary button to the signup form and the secondary one to pricing', async () => {
    const goTo = vi.fn();
    render(<HeroSection goTo={goTo} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start free trial' }));
    await userEvent.click(screen.getByRole('button', { name: 'See pricing' }));
    expect(goTo.mock.calls).toEqual([['signup'], ['pricing']]);
  });

  it('shows the terminal snippet with a caption, and the three illustrative figures', () => {
    render(<HeroSection goTo={vi.fn()} />);
    const terminal = screen.getByRole('figure');
    expect(within(terminal).getByText('Example terminal session')).toBeInTheDocument();
    expect(terminal).toHaveTextContent('Live at https://my-app.tessera.example');
    expect(screen.getByText('median build')).toBeInTheDocument();
    expect(screen.getByText('99.99%')).toBeInTheDocument();
  });
});
