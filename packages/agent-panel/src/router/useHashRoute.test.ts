import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHashRoute } from './useHashRoute';

describe('useHashRoute', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('defaults to console when there is no hash', () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toBe('console');
  });

  it('reads a known route from the initial hash', () => {
    window.location.hash = '#/tasks';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toBe('tasks');
  });

  it('falls back to console for an unknown hash', () => {
    window.location.hash = '#/nope';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toBe('console');
  });

  it('updates when the hash changes', () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toBe('console');

    act(() => {
      window.location.hash = '#/logs';
      window.dispatchEvent(new Event('hashchange'));
    });

    expect(result.current).toBe('logs');
  });

  it('removes its hashchange listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useHashRoute());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
    removeSpy.mockRestore();
  });
});
