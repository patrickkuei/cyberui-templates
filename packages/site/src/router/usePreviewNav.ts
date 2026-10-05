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
export function usePreviewNav(openSlug: string | undefined) {
  const openedHere = useRef(false);
  const lengthAfterOpen = useRef(0);

  // Once nothing is open the flag is stale (the user may have used Back).
  useEffect(() => {
    if (!openSlug) openedHere.current = false;
  }, [openSlug]);

  const open = useCallback((slug: string) => {
    openedHere.current = true;
    window.location.hash = `#/templates/${slug}`;
    lengthAfterOpen.current = window.history.length;
  }, []);

  const close = useCallback(() => {
    const untouched = openedHere.current && window.history.length === lengthAfterOpen.current;
    openedHere.current = false;
    if (untouched) {
      window.history.back();
    } else {
      window.location.replace('#/templates');
    }
  }, []);

  return { open, close };
}
