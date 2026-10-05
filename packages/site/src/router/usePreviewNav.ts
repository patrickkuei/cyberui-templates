import { useCallback, useEffect, useRef } from 'react';

// The preview dialog's open state is the URL hash (#/templates/:slug), so
// Back closes it. Opening pushes a history entry. Closing has two cases:
// - the dialog was opened from this page: go Back, popping the entry we
//   pushed (otherwise Back after closing would reopen the dialog);
// - the page was reached by a link straight to #/templates/:slug: there is
//   nothing to go Back to on this page, so replace the hash instead.
export function usePreviewNav(openSlug: string | undefined) {
  const openedHere = useRef(false);

  // Once nothing is open the flag is stale (the user may have used Back).
  useEffect(() => {
    if (!openSlug) openedHere.current = false;
  }, [openSlug]);

  const open = useCallback((slug: string) => {
    openedHere.current = true;
    window.location.hash = `#/templates/${slug}`;
  }, []);

  const close = useCallback(() => {
    if (openedHere.current) {
      openedHere.current = false;
      window.history.back();
    } else {
      window.location.replace('#/templates');
    }
  }, []);

  return { open, close };
}
