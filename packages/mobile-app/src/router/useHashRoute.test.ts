import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ROUTES, TAB_ROUTES, isTab, parseHash, useHashRoute } from './useHashRoute';

function goTo(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event('hashchange'));
  });
}

describe('parseHash', () => {
  it('reads a route, and the second segment for a device', () => {
    expect(parseHash('#/rooms')).toEqual({ route: 'rooms', param: undefined });
    expect(parseHash('#/device/desk-lamp')).toEqual({ route: 'device', param: 'desk-lamp' });
    expect(parseHash('#/device/a%20b')).toEqual({ route: 'device', param: 'a b' });
    expect(parseHash('#/add-room')).toEqual({ route: 'add-room', param: undefined });
  });

  it('keeps a parameter for the one route that takes it and drops it elsewhere', () => {
    expect(parseHash('#/rooms/anything').param).toBeUndefined();
    expect(parseHash('#/device').param).toBeUndefined();
  });

  it('falls back to Home for nothing and for an unknown route', () => {
    expect(parseHash('')).toEqual({ route: 'devices', param: undefined });
    expect(parseHash('#/nope')).toEqual({ route: 'devices', param: undefined });
  });
});

describe('useHashRoute', () => {
  afterEach(() => {
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  it('lists the screens, and the tabs are the three that are not pushed', () => {
    expect([...ROUTES]).toEqual(['devices', 'device', 'rooms', 'settings', 'add', 'add-room']);
    expect([...TAB_ROUTES]).toEqual(['devices', 'rooms', 'settings']);
    expect(ROUTES.filter((route) => !isTab(route))).toEqual(['device', 'add', 'add-room']);
  });

  it('defaults to Home when there is no hash', () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toBe('devices');
  });

  it('reads a known route from the initial hash', () => {
    window.location.hash = '#/rooms';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toBe('rooms');
  });

  it('reads a device id from the initial hash', () => {
    window.location.hash = '#/device/tv-plug';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toMatchObject({ route: 'device', param: 'tv-plug' });
  });

  it('falls back to Home for an unknown hash', () => {
    window.location.hash = '#/nope';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toBe('devices');
  });

  it('updates when the hash changes, including to another device', () => {
    const { result } = renderHook(() => useHashRoute());
    goTo('#/settings');
    expect(result.current.route).toBe('settings');
    goTo('#/device/desk-lamp');
    expect(result.current.param).toBe('desk-lamp');
    goTo('#/device/tv-plug');
    expect(result.current.param).toBe('tv-plug');
  });

  it('removes its hashchange listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useHashRoute());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
  });

  describe('leave', () => {
    it('goes Back when a pushed screen was reached from inside the app', () => {
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      const { result } = renderHook(() => useHashRoute());
      goTo('#/device/desk-lamp');
      act(() => result.current.leave());
      expect(back).toHaveBeenCalledTimes(1);
    });

    it('replaces the entry with Home when #/add was opened directly, because Back would leave the app', () => {
      window.location.hash = '#/add';
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      const { result } = renderHook(() => useHashRoute());
      act(() => result.current.leave());
      expect(back).not.toHaveBeenCalled();
      expect(window.location.hash).toBe('#/devices');
    });

    it('replaces the history entry rather than adding one, so Back from Home does not return to the page that was just left', () => {
      window.location.hash = '#/add';
      // happy-dom's own replace() grows history.length like an assignment does, so
      // the spy stubs it: what matters is that leave() asks for a replace.
      const replace = vi.spyOn(window.location, 'replace').mockImplementation(() => {});
      const assign = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
      const { result } = renderHook(() => useHashRoute());
      act(() => result.current.leave());
      expect(replace).toHaveBeenCalledWith('#/devices');
      expect(assign).not.toHaveBeenCalled();
    });

    it('replaces a device page opened directly with Home, and Add room with Rooms', () => {
      window.location.hash = '#/device/desk-lamp';
      const first = renderHook(() => useHashRoute());
      act(() => first.result.current.leave());
      expect(window.location.hash).toBe('#/devices');
      first.unmount();

      window.location.hash = '#/add-room';
      const second = renderHook(() => useHashRoute());
      act(() => second.result.current.leave());
      expect(window.location.hash).toBe('#/rooms');
    });
  });
});
