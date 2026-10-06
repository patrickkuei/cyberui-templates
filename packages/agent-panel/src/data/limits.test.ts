import { describe, it, expect } from 'vitest';
import { CONTEXT_FULL_PCT, CONTEXT_HIGH_PCT, CONTEXT_WINDOW_TOKENS, contextLevel, contextPct } from './limits';

describe('context window', () => {
  const at = (pct: number) => Math.ceil((CONTEXT_WINDOW_TOKENS * pct) / 100);

  it('turns percentages into levels at the documented thresholds', () => {
    expect(contextLevel(at(CONTEXT_HIGH_PCT) - 400)).toBe('ok');
    expect(contextLevel(at(CONTEXT_HIGH_PCT))).toBe('high');
    expect(contextLevel(at(CONTEXT_FULL_PCT) - 400)).toBe('high');
    expect(contextLevel(at(CONTEXT_FULL_PCT))).toBe('full');
  });

  it('never reports more than 100%', () => {
    expect(contextPct(CONTEXT_WINDOW_TOKENS * 3)).toBe(100);
  });
});
