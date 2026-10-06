const pad = (n: number) => String(n).padStart(2, '0');

/** HH:MM:SS in 24-hour local time, for trace entries. */
export function formatClock(timestampMs: number): string {
  const d = new Date(timestampMs);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** 5400 -> "5,400". */
export function formatTokens(tokens: number): string {
  return new Intl.NumberFormat('en-US').format(tokens);
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
