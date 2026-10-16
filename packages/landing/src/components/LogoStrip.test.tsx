import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { LOGOS } from '../data/product';
import { LogoStrip } from './LogoStrip';

describe('LogoStrip', () => {
  it('lists the five invented wordmarks under a caption', () => {
    render(<LogoStrip />);
    const section = screen.getByRole('region', { name: 'Teams who ship on Tessera' });
    expect(within(section).getAllByRole('listitem').map((item) => item.textContent)).toEqual([...LOGOS]);
  });
});
