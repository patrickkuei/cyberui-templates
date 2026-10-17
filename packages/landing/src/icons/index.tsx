import type { ReactNode } from 'react';
import type { FeatureIcon } from '../data/features';

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

export function CheckIcon() {
  return (
    <Svg>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Svg>
  );
}

// A Record over FeatureIcon, not a switch: an icon name in data/features.ts
// with no drawing here is a compile error instead of a blank square.
export const FEATURE_ICONS: Record<FeatureIcon, () => ReactNode> = {
  bolt: () => (
    <Svg>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </Svg>
  ),
  branch: () => (
    <Svg>
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="8" r="2" />
      <path d="M6 7v10M18 10c0 4-6 3-12 7" />
    </Svg>
  ),
  globe: () => (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3.5 3.5 3.5 14.5 0 18M12 3c-3.5 3.5-3.5 14.5 0 18" />
    </Svg>
  ),
  undo: () => (
    <Svg>
      <path d="m9 14-5-5 5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </Svg>
  ),
  shield: () => (
    <Svg>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
    </Svg>
  ),
  chart: () => (
    <Svg>
      <path d="M4 20V10M10 20V4M16 20v-7M2 20h20" />
    </Svg>
  ),
};
