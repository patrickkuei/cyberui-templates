import { describe, it, expect, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHashRoute } from './useHashRoute';

describe('useHashRoute', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('parses the empty hash as home', () => {
    window.location.hash = '';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toEqual({ name: 'home' });
  });

  it('parses #/templates as the templates page with nothing open', () => {
    window.location.hash = '#/templates';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toEqual({ name: 'templates' });
  });

  it('parses #/templates/monitoring as the templates page with that preview open', () => {
    window.location.hash = '#/templates/monitoring';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toEqual({ name: 'templates', openSlug: 'monitoring' });
  });

  it('treats a trailing slash with no slug as nothing open', () => {
    window.location.hash = '#/templates/';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toEqual({ name: 'templates' });
  });

  it('parses #/process as the process route', () => {
    window.location.hash = '#/process';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toEqual({ name: 'process' });
  });

  it('parses an unknown hash as not-found', () => {
    window.location.hash = '#/nonsense';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toEqual({ name: 'not-found' });
  });
});
