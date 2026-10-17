import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ROUTES, TAB_ROUTES, useHashRoute } from './useHashRoute';

function goTo(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event('hashchange'));
  });
}

describe('useHashRoute', () => {
  afterEach(() => {
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  it('lists the screens, and the tabs are all of them except Add device', () => {
    expect([...ROUTES]).toEqual(['devices', 'scenes', 'settings', 'add']);
    expect([...TAB_ROUTES]).toEqual(['devices', 'scenes', 'settings']);
  });

  it('defaults to devices when there is no hash', () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toBe('devices');
  });

  it('reads a known route from the initial hash', () => {
    window.location.hash = '#/scenes';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toBe('scenes');
  });

  it('falls back to devices for an unknown hash', () => {
    window.location.hash = '#/nope';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toBe('devices');
  });

  it('updates when the hash changes', () => {
    const { result } = renderHook(() => useHashRoute());
    goTo('#/settings');
    expect(result.current.route).toBe('settings');
  });

  it('removes its hashchange listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useHashRoute());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
  });

  describe('leaveAdd', () => {
    it('goes Back when Add device was reached from inside the app', () => {
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      const { result } = renderHook(() => useHashRoute());
      goTo('#/add');
      act(() => result.current.leaveAdd());
      expect(back).toHaveBeenCalledTimes(1);
    });

    it('replaces the entry with Devices when #/add was opened directly, because Back would leave the app', () => {
      window.location.hash = '#/add';
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      const { result } = renderHook(() => useHashRoute());
      expect(result.current.route).toBe('add');
      act(() => result.current.leaveAdd());
      expect(back).not.toHaveBeenCalled();
      expect(window.location.hash).toBe('#/devices');
    });
  });
});
