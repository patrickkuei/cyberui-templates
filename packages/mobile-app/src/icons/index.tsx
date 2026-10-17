import type { ReactNode } from 'react';
import type { DeviceKind } from '../data/types';
import type { TabRoute } from '../router/useHashRoute';

// Inline SVG, so the package has no image files to license or lose. Decorative:
// aria-hidden, because the text beside each icon says what it means. Colour is
// currentColor, so CSS (never the SVG) decides it.
function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
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

// Record<DeviceKind, ...> and Record<TabRoute, ...> rather than a switch: a
// kind or a tab with no drawing is a compile error instead of a blank square.
export const KIND_ICONS: Record<DeviceKind, () => ReactNode> = {
  light: () => (
    <Svg>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />
    </Svg>
  ),
  plug: () => (
    <Svg>
      <path d="M9 3v5M15 3v5" />
      <path d="M6 8h12v3a6 6 0 0 1-12 0V8Z" />
      <path d="M12 17v4" />
    </Svg>
  ),
  thermostat: () => (
    <Svg>
      <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z" />
      <path d="M12 9v7" />
    </Svg>
  ),
  sensor: () => (
    <Svg>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 7.5a6.4 6.4 0 0 1 0 9M4.5 4.5a10.6 10.6 0 0 0 0 15M19.5 4.5a10.6 10.6 0 0 1 0 15" />
    </Svg>
  ),
};

export const TAB_ICONS: Record<TabRoute, () => ReactNode> = {
  devices: () => (
    <Svg>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </Svg>
  ),
  scenes: () => (
    <Svg>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="M19 16v4M17 18h4" />
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
