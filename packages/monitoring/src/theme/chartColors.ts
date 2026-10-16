import { useMemo, type CSSProperties } from 'react';

export interface ChartColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  error: string;
  warning: string;
  muted: string;
  border: string;
}

// Used only when a --color-* token can't be read (no DOM, or the stylesheet isn't loaded).
// Keep these equal to cyberui-2045's current token values; when you bump the library, check
// its CHANGELOG for colour changes (2.8.0 lightened --color-muted from #8888aa to #9797b5).
const FALLBACK: ChartColors = {
  primary: '#ff005d',
  secondary: '#00fff9',
  accent: '#fffb00',
  success: '#00ff9e',
  error: '#ff4f4f',
  warning: '#ffaa00',
  muted: '#9797b5',
  border: '#3c3c5e',
};

function readCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function useChartColors(): ChartColors {
  return useMemo(
    () => ({
      primary: readCssVar('--color-primary', FALLBACK.primary),
      secondary: readCssVar('--color-secondary', FALLBACK.secondary),
      accent: readCssVar('--color-accent', FALLBACK.accent),
      success: readCssVar('--color-success', FALLBACK.success),
      error: readCssVar('--color-error', FALLBACK.error),
      warning: readCssVar('--color-warning', FALLBACK.warning),
      muted: readCssVar('--color-muted', FALLBACK.muted),
      border: readCssVar('--color-border-default', FALLBACK.border),
    }),
    [],
  );
}

export function chartTooltipProps(colors: ChartColors): {
  labelFormatter: () => string;
  contentStyle: CSSProperties;
  cursor: { fill: string; fillOpacity: number };
} {
  return {
    labelFormatter: () => '',
    contentStyle: { background: 'var(--color-surface)', border: `1px solid ${colors.border}` },
    // Recharts' BarChart tooltip defaults to an unstyled #ccc cursor rectangle spanning the
    // full category width and chart height; without this it reads as a stray light-grey box
    // against the dark theme.
    cursor: { fill: colors.border, fillOpacity: 0.3 },
  };
}
