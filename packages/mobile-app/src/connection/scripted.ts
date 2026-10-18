import { LINK_FAILURES, NEARBY } from '../data/nearby';
import { LINK_STEPS, LinkError, type Connection } from './types';

interface ScriptedOptions {
  /** How long the scan takes, in milliseconds. */
  scanMs?: number;
  /** How long each handshake step takes. */
  stepMs?: number;
}

/** Resolves after `ms`, or rejects with an AbortError the moment `signal` aborts (and clears its timer). */
function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * MOCK: a Connection that discovers and links nothing. It waits on timers,
 * reports progress as it goes, and then returns the fixed list in
 * data/nearby.ts. Which links fail is scripted per device in the same file
 * (LINK_FAILURES). The timings are the only thing it owns; tests pass tiny ones
 * or use fake timers.
 */
export function createScriptedConnection({ scanMs = 2400, stepMs = 600 }: ScriptedOptions = {}): Connection {
  return {
    async scan(onProgress, signal) {
      const ticks = 8;
      onProgress(0);
      for (let tick = 1; tick <= ticks; tick++) {
        await wait(scanMs / ticks, signal);
        onProgress(Math.round((tick / ticks) * 100));
      }
      return [...NEARBY];
    },

    async link(id, onProgress, signal) {
      const failure = LINK_FAILURES[id];
      for (const [index, step] of LINK_STEPS.entries()) {
        onProgress({ step, percent: Math.round((index / LINK_STEPS.length) * 100) });
        await wait(stepMs, signal);
        if (failure?.step === step) throw new LinkError(failure.message, step);
      }
      onProgress({ step: 'ready', percent: 100 });
    },
  };
}
