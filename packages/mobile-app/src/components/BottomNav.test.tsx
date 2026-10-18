import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  it('is the Main navigation, with a link to each tab in order', () => {
    render(<BottomNav route="devices" />);
    const links = screen.getAllByRole('link');
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(links.map((link) => link.textContent)).toEqual(['Devices', 'Scenes', 'Settings']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#/devices', '#/scenes', '#/settings']);
  });

  it('marks only the current tab', () => {
    render(<BottomNav route="scenes" />);
    expect(screen.getByRole('link', { name: 'Scenes' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Devices' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Settings' })).not.toHaveAttribute('aria-current');
  });

  it('marks no tab on a pushed screen', () => {
    render(<BottomNav route="add" />);
    expect(document.querySelector('[aria-current]')).toBeNull();
  });
});
