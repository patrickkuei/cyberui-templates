import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SignalBars } from './SignalBars';

describe('SignalBars', () => {
  it('draws four bars and lights as many as the signal', () => {
    const { container } = render(<SignalBars signal={3} />);
    expect(container.querySelectorAll('.signal-bar')).toHaveLength(4);
    expect(container.querySelectorAll('.signal-bar--lit')).toHaveLength(3);
  });

  it('is one image with a label that says the count', () => {
    render(<SignalBars signal={2} />);
    expect(screen.getByRole('img', { name: 'Signal 2 of 4' })).toBeInTheDocument();
  });

  it('keeps the count between none and all four, in the bars and in the label', () => {
    const high = render(<SignalBars signal={9} />);
    expect(high.container.querySelectorAll('.signal-bar--lit')).toHaveLength(4);
    expect(screen.getByRole('img')).toHaveAccessibleName('Signal 4 of 4');
    high.unmount();
    const low = render(<SignalBars signal={-1} />);
    expect(low.container.querySelectorAll('.signal-bar--lit')).toHaveLength(0);
    expect(screen.getByRole('img')).toHaveAccessibleName('Signal 0 of 4');
  });

  it('takes a label of its own', () => {
    render(<SignalBars signal={0} label="No signal" />);
    expect(screen.getByRole('img', { name: 'No signal' })).toBeInTheDocument();
  });

  it('makes each bar taller than the one before', () => {
    const { container } = render(<SignalBars signal={4} />);
    const heights = [...container.querySelectorAll('.signal-bar')].map((bar) => Number(bar.getAttribute('height')));
    expect(heights).toEqual([...heights].sort((a, b) => a - b));
    expect(new Set(heights).size).toBe(4);
  });
});
