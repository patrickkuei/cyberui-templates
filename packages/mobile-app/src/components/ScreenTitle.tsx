/** The id App.tsx looks for to move focus after a route change. */
export const SCREEN_TITLE_ID = 'screen-title';

/**
 * The screen's <h1>. It takes focus (tabIndex -1: only code can focus it) when
 * the route changes, so a keyboard or screen-reader user starts at the top of
 * the new screen instead of on the link they pressed, which is no longer there
 * on Add device. See App.tsx.
 */
export function ScreenTitle({ children }: { children: string }) {
  return (
    <h1 id={SCREEN_TITLE_ID} className="screen-title" tabIndex={-1}>
      {children}
    </h1>
  );
}
