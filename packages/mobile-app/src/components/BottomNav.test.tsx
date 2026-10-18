import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  it('is the Main navigation, with a link to each tab in order', () => {
    render(<BottomNav route="devices" />);
    const links = screen.getAllByRole('link');
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(links.map((link) => link.textContent)).toEqual(['Home', 'Rooms', 'Settings']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#/devices', '#/rooms', '#/settings']);
  });

  it('marks only the current tab', () => {
    render(<BottomNav route="rooms" />);
    expect(screen.getByRole('link', { name: 'Rooms' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Settings' })).not.toHaveAttribute('aria-current');
  });

  it('marks no tab on a pushed screen', () => {
    render(<BottomNav route="add" />);
    expect(document.querySelector('[aria-current]')).toBeNull();
  });

  it('tells its owner when a tab is pressed', async () => {
    const onNavigate = vi.fn();
    render(<BottomNav route="devices" onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole('link', { name: 'Settings' }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
