import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NEARBY } from '../data/nearby';
import { createScriptedConnection } from './scripted';
import { LINK_STEPS, LinkError, isAbort, type LinkProgress } from './types';

// The scripted connection only waits on timers, so the tests drive them with
// fake ones: no test here takes real time.
describe('the scripted connection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('scan', () => {
    it('reports progress from 0 to 100 and then resolves with the fixed list', async () => {
      const connection = createScriptedConnection({ scanMs: 800 });
      const progress: number[] = [];
      const done = connection.scan((percent) => progress.push(percent));
      await vi.advanceTimersByTimeAsync(800);
      expect(await done).toEqual([...NEARBY]);
      expect(progress[0]).toBe(0);
      expect(progress.at(-1)).toBe(100);
      expect(progress).toEqual([...progress].sort((a, b) => a - b));
      expect(progress.length).toBeGreaterThan(3);
    });

    it('has not finished before its time', async () => {
      const connection = createScriptedConnection({ scanMs: 800 });
      let resolved = false;
      void connection.scan(() => {}).then(() => (resolved = true));
      await vi.advanceTimersByTimeAsync(700);
      expect(resolved).toBe(false);
      await vi.advanceTimersByTimeAsync(100);
      expect(resolved).toBe(true);
    });

    it('stops when aborted: it rejects with an AbortError, reports nothing more and leaves no timer behind', async () => {
      const connection = createScriptedConnection({ scanMs: 800 });
      const controller = new AbortController();
      const progress: number[] = [];
      const done = connection.scan((percent) => progress.push(percent), controller.signal);
      const outcome = done.catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(250);
      const seen = progress.length;
      controller.abort();
      // Straight away, before any timer could fire by itself: the pending one was cleared by the abort.
      expect(vi.getTimerCount()).toBe(0);
      expect(isAbort(await outcome)).toBe(true);
      await vi.advanceTimersByTimeAsync(2000);
      expect(progress).toHaveLength(seen);
    });

    it('rejects at once when it is already aborted', async () => {
      const connection = createScriptedConnection();
      const controller = new AbortController();
      controller.abort();
      await expect(connection.scan(() => {}, controller.signal)).rejects.toSatisfy(isAbort);
    });
  });

  describe('link', () => {
    it('runs the four steps in order, then reports 100 for ready and resolves', async () => {
      const connection = createScriptedConnection({ stepMs: 100 });
      const seen: LinkProgress[] = [];
      const done = connection.link('shelf-lamp', (progress) => seen.push(progress));
      await vi.advanceTimersByTimeAsync(400);
      await done;
      expect(seen.map((progress) => progress.step)).toEqual([...LINK_STEPS, 'ready']);
      expect(seen.map((progress) => progress.percent)).toEqual([0, 25, 50, 75, 100]);
    });

    it('links a typed pairing code as readily as a nearby id: nothing can tell them apart', async () => {
      const connection = createScriptedConnection({ stepMs: 10 });
      const done = connection.link('AB12CD', () => {});
      await vi.advanceTimersByTimeAsync(40);
      await expect(done).resolves.toBeUndefined();
    });

    it('fails for the device that is scripted to, at its step, with its message, and goes no further', async () => {
      const connection = createScriptedConnection({ stepMs: 100 });
      const seen: LinkProgress[] = [];
      const outcome = connection.link('hall-light', (progress) => seen.push(progress)).catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(1000);
      const error = await outcome;
      expect(error).toBeInstanceOf(LinkError);
      expect(error).toMatchObject({ message: 'No response from the hub', step: 'securing' });
      expect(seen.map((progress) => progress.step)).toEqual(['found', 'pairing', 'securing']);
    });

    it('stops when aborted part-way and clears its timer', async () => {
      const connection = createScriptedConnection({ stepMs: 100 });
      const controller = new AbortController();
      const seen: LinkProgress[] = [];
      const outcome = connection.link('shelf-lamp', (progress) => seen.push(progress), controller.signal).catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(150);
      controller.abort();
      expect(vi.getTimerCount()).toBe(0);
      expect(isAbort(await outcome)).toBe(true);
      await vi.advanceTimersByTimeAsync(1000);
      expect(seen.map((progress) => progress.step)).toEqual(['found', 'pairing']);
    });
  });
});
