import { describe, it, expect } from 'vitest';

// This template keeps all styling in CSS classes (App.css). The check exists
// so that stays true: it reads every component's source and fails if a React
// `style={...}` prop appears. Recharts props that happen to be objects
// (margin, tick, contentStyle) are not React `style` props and are not matched.
const sources = import.meta.glob('./**/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('no inline styles', () => {
  it('finds the source files it is meant to scan', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(10);
  });

  it('has no style={...} prop in any component or page', () => {
    const offenders = Object.entries(sources)
      .filter(([file]) => !/\.test\.tsx$/.test(file))
      .filter(([, code]) => /\bstyle=\{/.test(code))
      .map(([file]) => file);
    expect(offenders).toEqual([]);
  });
});
