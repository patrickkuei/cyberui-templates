import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppBar } from './AppBar';

describe('AppBar', () => {
  it('is the page banner, with the app name and the Demo badge', () => {
    render(<AppBar />);
    const banner = screen.getByRole('banner');
    expect(banner).toHaveTextContent('Kestrel');
    expect(banner).toHaveTextContent('Demo');
  });

  it('has no Back button unless the screen was pushed', () => {
    render(<AppBar />);
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('calls onBack from its Back button', async () => {
    const onBack = vi.fn();
    render(<AppBar onBack={onBack} />);
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
