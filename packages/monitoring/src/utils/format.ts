// Every number and amount on screen is formatted here. Change these two to
// show another locale or currency; nothing else hardcodes a "$".
const LOCALE = 'en-US';
const CURRENCY = 'USD';

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY }).format(value);
}

export function formatMs(value: number): string {
  return `${Math.round(value)} ms`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatCurrencyPerHour(value: number): string {
  return `${formatCurrency(value)}/hr`;
}

export function formatRelativeTime(timestampMs: number, nowMs: number): string {
  const diffSec = Math.max(0, Math.round((nowMs - timestampMs) / 1000));
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  return `${diffHr}h ago`;
}
