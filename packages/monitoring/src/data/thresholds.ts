// The one place the alarm thresholds live (single source of truth). The
// simulation raises alerts from them, the trend labels read them, and the
// stat tiles and action panel colour from them, so changing a limit here
// changes all of those together. Do not write a literal 2 or 500 elsewhere.
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
