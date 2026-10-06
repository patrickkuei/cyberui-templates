import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSimulatedAgent } from './useSimulatedAgent';
import { activeRun } from './simulation';

describe('useSimulatedAgent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('advances on each interval tick once a message is sent', () => {
    const { result } = renderHook(() => useSimulatedAgent({ tickMs: 250 }));
    act(() => result.current.actions.send('hello there'));
    const before = result.current.state;
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current.state).not.toBe(before);
    expect(activeRun(result.current.state)).toBeDefined();
  });

  it('shows a whole reply in one tick when charsPerTick is Infinity (reduced motion)', () => {
    const { result } = renderHook(() => useSimulatedAgent({ tickMs: 250, charsPerTick: Infinity }));
    act(() => result.current.actions.send('hello there'));
    act(() => {
      vi.advanceTimersByTime(250 * 6);
    });
    const reply = result.current.state.messages.at(-1)!;
    expect(reply.revealed).toBe(reply.text.length);
    expect(activeRun(result.current.state)).toBeUndefined();
  });

  it('does not re-render on a tick when nothing is moving (Review Focus #3)', () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useSimulatedAgent({ tickMs: 250 });
    });
    act(() => {
      vi.advanceTimersByTime(250 * 200); // drain the seeded background tasks
    });
    const settled = renders;
    act(() => {
      vi.advanceTimersByTime(250 * 20);
    });
    // React may re-run the component once before it bails out of an unchanged
    // state; 20 idle ticks must not cost 20 renders.
    expect(renders).toBeLessThanOrEqual(settled + 1);
    expect(result.current.state.tasks.some((t) => t.status === 'running')).toBe(false);
  });

  it('clears its interval on unmount (Review Focus #3)', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = renderHook(() => useSimulatedAgent());
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('gives actions that stay the same function across renders, so memoised children do not re-render', () => {
    const { result } = renderHook(() => useSimulatedAgent());
    const first = result.current.actions;
    act(() => first.setPaused(true));
    expect(result.current.actions).toBe(first);
    expect(result.current.state.paused).toBe(true);
  });

  it('reset returns to the first state', () => {
    const { result } = renderHook(() => useSimulatedAgent());
    act(() => result.current.actions.send('hello'));
    act(() => result.current.actions.reset());
    expect(result.current.state.messages).toHaveLength(2);
  });

  it('reset keeps a paused agent paused, instead of quietly resuming it', () => {
    const { result } = renderHook(() => useSimulatedAgent());
    act(() => result.current.actions.setPaused(true));
    act(() => result.current.actions.reset());
    expect(result.current.state.paused).toBe(true);
    expect(result.current.state.messages).toHaveLength(2);
  });
});
