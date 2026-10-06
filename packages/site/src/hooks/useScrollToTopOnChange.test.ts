import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { useScrollToTopOnChange } from './useScrollToTopOnChange';

describe('useScrollToTopOnChange', () => {
  afterEach(() => vi.restoreAllMocks());

  it('does not scroll on the first render, even under StrictMode', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    renderHook(() => useScrollToTopOnChange('home'), { wrapper: StrictMode });
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('scrolls to the top, instantly, when the key changes', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const { rerender } = renderHook(({ key }) => useScrollToTopOnChange(key), { initialProps: { key: 'home' } });
    rerender({ key: 'templates' });
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
  });

  it('does not scroll when the key stays the same', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const { rerender } = renderHook(({ key }) => useScrollToTopOnChange(key), { initialProps: { key: 'templates' } });
    rerender({ key: 'templates' });
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
