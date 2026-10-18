import type { NearbyDevice } from '../data/types';

// THE SEAM. Everything the app does to "find" or "link" a device goes through
// the Connection below, and nothing else in src/ knows how. The shipped
// implementation (scripted.ts) only waits on timers and returns what is in
// data/nearby.ts, so nothing is discovered and nothing is sent. To make the
// app real, write another Connection that talks to your hub (the browser's
// Web Bluetooth API, an MQTT or WebSocket client, your own backend) and pass
// it to <App connection={...} /> in main.tsx; the screens keep working
// because they only call scan() and link() and read their progress callbacks.
// Do it somewhere src/noNetworkOrStorage.test.ts does not look, or remove the
// names you now need from its list on purpose.

/** The handshake, in order. The Link checklist draws one row per step. */
export const LINK_STEPS = ['found', 'pairing', 'securing', 'ready'] as const;
export type LinkStep = (typeof LINK_STEPS)[number];

export interface LinkProgress {
  /** The step being worked on. */
  step: LinkStep;
  /** 0 to 100, how much of the handshake is done. 100 means every step is. */
  percent: number;
}

/** Why a link failed, and at which step, so the checklist can mark that row. */
export class LinkError extends Error {
  readonly step: LinkStep;

  constructor(message: string, step: LinkStep) {
    super(message);
    this.name = 'LinkError';
    this.step = step;
  }
}

export interface Connection {
  /**
   * Looks for devices nearby. Calls onProgress with 0 to 100 while it works
   * and resolves with what it found. Rejects with an AbortError when `signal`
   * is aborted (the screen was left).
   */
  scan(onProgress: (percent: number) => void, signal?: AbortSignal): Promise<NearbyDevice[]>;
  /**
   * Links to one device: a nearby id for a new device, an existing device's id
   * for Reconnect, or the pairing code someone typed. Calls onProgress as the
   * steps run, resolves when the link is ready, rejects with a LinkError when
   * it fails, and with an AbortError when `signal` is aborted.
   */
  link(id: string, onProgress: (progress: LinkProgress) => void, signal?: AbortSignal): Promise<void>;
}

export function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
