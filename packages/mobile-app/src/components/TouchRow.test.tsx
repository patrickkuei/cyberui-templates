import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TouchRow } from './TouchRow';

describe('TouchRow', () => {
  it('renders its children inside the class that App.css gives each kind of control', () => {
    const { container } = render(
      <>
        <TouchRow control="switch">
          <span>a</span>
        </TouchRow>
        <TouchRow control="slider">
          <span>b</span>
        </TouchRow>
        <TouchRow control="radios">
          <span>c</span>
        </TouchRow>
      </>,
    );
    expect(screen.getByText('a').parentElement).toHaveClass('touch-switch');
    expect(screen.getByText('b').parentElement).toHaveClass('touch-slider');
    expect(screen.getByText('c').parentElement).toHaveClass('touch-radios');
    expect(container.querySelectorAll('[class^="touch-"]')).toHaveLength(3);
  });
});
