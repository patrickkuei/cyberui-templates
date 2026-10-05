import { useCallback, useEffect, useRef } from 'react';

// The preview dialog's open state is the URL hash (#/templates/:slug), so
// Back closes it. Opening pushes a history entry. Closing has two cases:
// - nothing else has been added to the history since the dialog opened: go
//   Back, popping the entry we pushed (otherwise Back after closing would
//   reopen the dialog);
// - anything else: replace the hash instead.
//
// "Anything else" matters because the live preview is an iframe of a
// hash-routed app, and every click inside it that changes its own hash adds
// an entry to the same joint session history. A Back from the close button
// would then undo that click inside the iframe and leave the dialog open. We
// cannot tell how many entries the iframe added (or whether the user went
// back inside it), so a changed history.length means "do not trust Back".
// (A browser at its history cap stops growing history.length; that case
// falls back to Back, which is no worse than before.) A page reached by a
// link straight to #/templates/:slug has nothing of ours to go Back to, so
// it also replaces.
//
// Closing is asked for by several things at once (Esc, the close button, the
// backdrop, Esc inside the iframe), and history.back() is asynchronous. Until
// the route actually changes, further close requests are ignored: a second
// one would otherwise see a stale state and go Back a second time, or replace
// the entry the first Back is about to pop.
export function usePreviewNav(openSlug: string | undefined) {
  const openedHere = useRef(false);
  const lengthAfterOpen = useRef(0);
  const closing = useRef(false);

  // Whenever the open preview changes, the previous open/close has settled.
  // With nothing open the "opened here" flag is stale too (the user may have
  // used Back).
  useEffect(() => {
    closing.current = false;
    if (!openSlug) openedHere.current = false;
  }, [openSlug]);

  const open = useCallback((slug: string) => {
    openedHere.current = true;
    closing.current = false;
    window.location.hash = `#/templates/${slug}`;
    lengthAfterOpen.current = window.history.length;
  }, []);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const untouched = openedHere.current && window.history.length === lengthAfterOpen.current;
    if (untouched) {
      window.history.back();
    } else {
      window.location.replace('#/templates');
    }
  }, []);

  return { open, close };
}
