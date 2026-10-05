import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePreviewNav } from './usePreviewNav';

describe('usePreviewNav', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.location.hash = '';
  });

  it('opens a preview by pushing its hash', () => {
    window.location.hash = '#/templates';
    const { result } = renderHook(() => usePreviewNav(undefined));
    result.current.open('monitoring');
    expect(window.location.hash).toBe('#/templates/monitoring');
  });

  it('closes a preview it opened by going Back, so no history entry is left behind', () => {
    window.location.hash = '#/templates';
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const { result } = renderHook(() => usePreviewNav('monitoring'));
    result.current.open('monitoring');
    result.current.close();
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('does not go Back when something else was added to the history since opening (a click inside the live preview iframe)', () => {
    window.location.hash = '#/templates';
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const { result } = renderHook(() => usePreviewNav('monitoring'));
    result.current.open('monitoring');
    // The iframe's own hash router pushes an entry onto the shared history.
    // Here a second hash change stands in for it.
    window.location.hash = '#/templates/monitoring?inside-iframe';
    result.current.close();
    expect(back).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('#/templates');
  });

  it('goes Back only once when several things ask to close at the same time', () => {
    window.location.hash = '#/templates';
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const { result } = renderHook(() => usePreviewNav('monitoring'));
    result.current.open('monitoring');
    result.current.close();
    result.current.close();
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('is not stuck when Back did not close the dialog: after the settle window the next close replaces the hash', () => {
    vi.useFakeTimers();
    try {
      window.location.hash = '#/templates';
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      const { result } = renderHook(() => usePreviewNav('monitoring'));
      result.current.open('monitoring');
      result.current.close(); // goes Back, but the route never changes (it popped an iframe entry)
      expect(back).toHaveBeenCalledTimes(1);
      result.current.close(); // still inside the settle window: ignored
      expect(back).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(500);
      result.current.close(); // dialog is still open, so Back is no longer trusted
      expect(back).toHaveBeenCalledTimes(1);
      expect(window.location.hash).toBe('#/templates');
    } finally {
      vi.useRealTimers();
    }
  });

  it('can close again after the route has changed', () => {
    window.location.hash = '#/templates';
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const { result, rerender } = renderHook(({ slug }) => usePreviewNav(slug), {
      initialProps: { slug: undefined as string | undefined },
    });
    result.current.open('monitoring');
    rerender({ slug: 'monitoring' });
    result.current.close();
    rerender({ slug: undefined });
    result.current.open('monitoring');
    rerender({ slug: 'monitoring' });
    result.current.close();
    expect(back).toHaveBeenCalledTimes(2);
  });

  it('closes a preview reached by a direct link by replacing the hash, never by leaving the page', () => {
    window.location.hash = '#/templates/monitoring';
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const { result } = renderHook(() => usePreviewNav('monitoring'));
    result.current.close();
    expect(back).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('#/templates');
  });

  it('forgets it opened a preview once nothing is open (a later direct link must not trigger Back)', () => {
    window.location.hash = '#/templates';
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const { result, rerender } = renderHook(({ slug }) => usePreviewNav(slug), {
      initialProps: { slug: undefined as string | undefined },
    });
    result.current.open('monitoring');
    rerender({ slug: 'monitoring' });
    rerender({ slug: undefined });
    window.location.hash = '#/templates/monitoring';
    rerender({ slug: 'monitoring' });
    result.current.close();
    expect(back).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('#/templates');
  });
});
