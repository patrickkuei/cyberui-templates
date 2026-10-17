import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

describe('usePrefersReducedMotion', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reflects the media query', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    expect(renderHook(() => usePrefersReducedMotion()).result.current).toBe(true);
  });

  it('is false when matchMedia is missing', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(renderHook(() => usePrefersReducedMotion()).result.current).toBe(false);
  });
});
