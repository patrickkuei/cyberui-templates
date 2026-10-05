import { useEffect, useRef } from 'react';

// The site routes on the URL hash, so changing page never reloads and the
// browser keeps the old scroll position: scroll down on Home, click
// "Templates", and the new page opens already scrolled. Pass something that
// changes only when the *page* changes (the route name), not when state within
// a page changes (the Templates page's open preview is also a hash change and
// must not scroll).
//
// It compares against the previous key instead of skipping the first run, so
// React StrictMode's double-run of effects in development cannot scroll on
// the initial mount. `instant` overrides any `scroll-behavior: smooth`.
export function useScrollToTopOnChange(key: string) {
  const previous = useRef(key);

  useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [key]);
}
