import type { ReactNode } from 'react';
import type { TabRoute } from '../router/useHashRoute';

// Inline SVG, so the package has no image files to license or lose. Decorative:
// aria-hidden, because the text beside each icon says what it means. Colour is
// currentColor, so CSS (never the SVG) decides it. The device drawings, which
// glow, are not here: they are components/Glyph.tsx.
function Svg({ children, size = 24 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function BackIcon() {
  return (
    <Svg>
      <path d="M15 5 8 12l7 7" />
    </Svg>
  );
}

export function ChevronIcon() {
  return (
    <Svg>
      <path d="m9 5 7 7-7 7" />
    </Svg>
  );
}

export function PlusIcon() {
  return (
    <Svg>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function MinusIcon() {
  return (
    <Svg>
      <path d="M5 12h14" />
    </Svg>
  );
}

/** The small amber marks on a row. The row's own text says what they mean; these only catch the eye. */
export function BatteryLowIcon() {
  return (
    <Svg size={16}>
      <rect x="3" y="7" width="15" height="10" rx="2" />
      <path d="M21 10.5v3" />
      <path d="M6.5 10.5v3" />
    </Svg>
  );
}

export function WeakSignalIcon() {
  return (
    <Svg size={16}>
      <path d="M5 19v-3M10 19v-6M15 19V9M20 19V5" opacity="0.35" />
      <path d="M5 19v-3" />
    </Svg>
  );
}

export function CheckIcon() {
  return (
    <Svg size={20}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Svg>
  );
}

export function CrossIcon() {
  return (
    <Svg size={20}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Svg>
  );
}

// Record<TabRoute, ...> rather than a switch: a tab with no drawing is a
// compile error instead of a blank square.
export const TAB_ICONS: Record<TabRoute, () => ReactNode> = {
  devices: () => (
    <Svg>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v10h12V10" />
      <path d="M10 20v-5h4v5" />
    </Svg>
  ),
  rooms: () => (
    <Svg>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </Svg>
  ),
  settings: () => (
    <Svg>
      <path d="M5 7h9M18 7h1M5 17h1M10 17h9" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </Svg>
  ),
};
