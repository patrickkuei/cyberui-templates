import { useLayoutEffect, useRef, type RefObject } from 'react';

/** How close to the bottom still counts as "at the bottom", in pixels. */
const BOTTOM_SLACK_PX = 24;

/**
 * Keeps a scroll container pinned to its bottom as `dep` changes (a message
 * arriving, a reply growing), but only if the reader was already at the bottom.
 * Someone who scrolled up to re-read is never yanked back down by a streaming
 * reply.
 *
 * Whether the reader was at the bottom is measured during render, which runs
 * before React commits the new content: at that moment the DOM still has the
 * old height. Measured after the commit it would always say "not at the
 * bottom", because the new content has just pushed the bottom away. Plain
 * `scrollTop` rather than `scrollIntoView` (happy-dom has no `scrollIntoView`),
 * and rather than the library's `useCyberScrollbar`, which wraps the container
 * in its own DOM and so fights a ref we need to measure.
 */
export function useStickToBottom<T extends HTMLElement>(dep: unknown): RefObject<T | null> {
  const ref = useRef<T>(null);
  const wasAtBottom = useRef(true);

  const el = ref.current;
  if (el) wasAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_SLACK_PX;

  useLayoutEffect(() => {
    const node = ref.current;
    if (node && wasAtBottom.current) node.scrollTop = node.scrollHeight;
  }, [dep]);

  return ref;
}
