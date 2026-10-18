import { SIGNAL_BARS } from '../data/types';

/**
 * Four bars, the first `signal` of them lit. The drawing says nothing a
 * screen reader needs beyond the count, so it is one image with a label; the
 * bars are the SVG's own rectangles, lit or dim by class (App.css), and their
 * heights are attributes, so no inline style is needed.
 */
export function SignalBars({ signal, label }: { signal: number; label?: string }) {
  const lit = Math.max(0, Math.min(SIGNAL_BARS, signal));
  return (
    <svg
      className="signal-bars"
      viewBox="0 0 24 20"
      width="24"
      height="20"
      role="img"
      aria-label={label ?? `Signal ${lit} of ${SIGNAL_BARS}`}
    >
      {Array.from({ length: SIGNAL_BARS }, (_, index) => {
        const height = 5 + index * 4.5;
        return <rect key={index} className={index < lit ? 'signal-bar signal-bar--lit' : 'signal-bar'} x={index * 6.2} y={20 - height} width="4.2" height={height} rx="1" />;
      })}
    </svg>
  );
}
