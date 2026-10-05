// The one place the alarm thresholds live (single source of truth). The
// simulation raises alerts from them, the trend labels read them, and the
// Dashboard and Endpoints pages and the header badge in App.tsx test against
// them to choose a tone or an incident (the stat tiles and the action panel
// only receive that tone as a prop and never see a limit). Changing a limit
// here changes all of those together. Do not write a literal 2 or 500 elsewhere,
// tests included.
//
// Both comparisons are strictly "above": a value exactly on the limit is
// still healthy.
export const ERROR_RATE_THRESHOLD_PCT = 2;
export const P95_LATENCY_THRESHOLD_MS = 500;

export function isErrorRateHigh(errorRatePct: number): boolean {
  return errorRatePct > ERROR_RATE_THRESHOLD_PCT;
}

export function isLatencyHigh(p95LatencyMs: number): boolean {
  return p95LatencyMs > P95_LATENCY_THRESHOLD_MS;
}
