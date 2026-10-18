import { useId, type ReactNode } from 'react';
import type { DeviceKind } from '../data/types';
import { bodyOpacity, haloOpacity, haloRadius } from '../utils/glow';

// The app's one bold idea: each device's drawing really glows, in proportion to
// its level (utils/glow.ts decides the number, this draws it). It is plain inline
// SVG, so there is no image to license or lose, and every value that varies with
// the level is an SVG *attribute* (opacity, r, fill-opacity), never a style
// attribute: noInlineStyles.test.ts stays true, and the colour comes from the
// accent token in App.css (.glyph-stop, .glyph-body), so re-theming reaches it.
//
// Pass level 0 for a dark glyph (the device is off, or its link is down).

interface Drawing {
  /** The part of the drawing that fills with the accent as the level rises. */
  body: ReactNode;
  /** Strokes only: they are drawn in the text colour on top of the glow. */
  lines: ReactNode;
}

// Record<DeviceKind, ...>: a kind without a drawing is a compile error, not a
// blank square. All four are drawn in a 64 by 64 box.
const DRAWINGS: Record<DeviceKind, (fillOpacity: number) => Drawing> = {
  light: (fillOpacity) => ({
    body: (
      <path
        className="glyph-body"
        fillOpacity={fillOpacity}
        d="M32 9C22.6 9 15 16.4 15 25.6c0 5.8 3 10.9 7.6 13.9 1.4.9 2.2 2.4 2.2 4V45h14.4v-1.5c0-1.6.8-3.1 2.2-4C46 36.5 49 31.4 49 25.6 49 16.4 41.4 9 32 9Z"
      />
    ),
    lines: <path d="M26 51h12M28 56h8" />,
  }),
  plug: (fillOpacity) => ({
    body: <path className="glyph-body" fillOpacity={fillOpacity} d="M16 20h32v10a16 16 0 0 1-32 0V20Z" />,
    lines: <path d="M24 8v12M40 8v12M32 46v10" />,
  }),
  thermostat: (fillOpacity) => ({
    body: <circle className="glyph-body" fillOpacity={fillOpacity} cx="32" cy="32" r="22" />,
    lines: <path d="M21 41a14 14 0 1 1 22 0M32 17v6" />,
  }),
  sensor: (fillOpacity) => ({
    body: <circle className="glyph-body" fillOpacity={fillOpacity} cx="32" cy="32" r="5" />,
    lines: <path d="M24.9 24.9a10 10 0 0 0 0 14.2M39.1 24.9a10 10 0 0 1 0 14.2M19.2 19.2a18 18 0 0 0 0 25.6M44.8 19.2a18 18 0 0 1 0 25.6" />,
  }),
};

interface GlyphProps {
  kind: DeviceKind;
  /** 0 (dark) to 100 (brightest), from glowLevel(device). */
  level: number;
}

/**
 * An id for one glyph's gradient, made from React's useId. What useId returns
 * depends on the React version (":r1:" in 19.0, "«r1»" in 19.1, "_r_1_" in
 * 19.2), and not every character is safe inside a url(#...) that CSS reads, so
 * everything but letters, digits, "_" and "-" is dropped.
 */
export const gradientId = (reactId: string): string => `halo-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

export function Glyph({ kind, level }: GlyphProps) {
  const haloId = gradientId(useId());
  const lit = level > 0;
  const { body, lines } = DRAWINGS[kind](bodyOpacity(level));
  return (
    <svg className={lit ? 'glyph glyph--lit' : 'glyph'} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {lit && (
        <>
          <defs>
            <radialGradient id={haloId}>
              <stop className="glyph-stop" offset="0" stopOpacity="0.8" />
              <stop className="glyph-stop" offset="1" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle className="glyph-halo" cx="32" cy="32" r={haloRadius(level)} opacity={haloOpacity(level)} fill={`url(#${haloId})`} />
        </>
      )}
      {body}
      {lines}
    </svg>
  );
}
