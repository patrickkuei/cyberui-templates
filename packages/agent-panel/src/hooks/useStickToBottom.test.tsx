import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { useStickToBottom } from './useStickToBottom';

function Scroller({ dep }: { dep: number }) {
  const ref = useStickToBottom<HTMLDivElement>(dep);
  return <div ref={ref} data-testid="scroller" />;
}

// happy-dom has no layout engine, so give the element a geometry to scroll in.
function giveGeometry(el: HTMLElement, { scrollHeight, clientHeight }: { scrollHeight: number; clientHeight: number }) {
  Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => scrollHeight });
  Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => clientHeight });
}

describe('useStickToBottom', () => {
  it('stays pinned to the bottom when the reader was at the bottom', () => {
    const { getByTestId, rerender } = render(<Scroller dep={1} />);
    const el = getByTestId('scroller');
    giveGeometry(el, { scrollHeight: 1000, clientHeight: 200 });
    el.scrollTop = 800; // exactly at the bottom
    rerender(<Scroller dep={2} />);
    expect(el.scrollTop).toBe(1000);
  });

  it('counts a few pixels short of the bottom as still at the bottom', () => {
    const { getByTestId, rerender } = render(<Scroller dep={1} />);
    const el = getByTestId('scroller');
    giveGeometry(el, { scrollHeight: 1000, clientHeight: 200 });
    el.scrollTop = 790; // 10px up
    rerender(<Scroller dep={2} />);
    expect(el.scrollTop).toBe(1000);
  });

  it('does not move a reader who scrolled up to re-read (Review Focus #4)', () => {
    const { getByTestId, rerender } = render(<Scroller dep={1} />);
    const el = getByTestId('scroller');
    giveGeometry(el, { scrollHeight: 1000, clientHeight: 200 });
    el.scrollTop = 100;
    rerender(<Scroller dep={2} />);
    expect(el.scrollTop).toBe(100);
  });

  it('does nothing when the dependency has not changed', () => {
    const { getByTestId, rerender } = render(<Scroller dep={1} />);
    const el = getByTestId('scroller');
    giveGeometry(el, { scrollHeight: 1000, clientHeight: 200 });
    el.scrollTop = 800;
    rerender(<Scroller dep={1} />);
    expect(el.scrollTop).toBe(800);
  });
});
