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
