import { describe, it, expect } from 'vitest';

// The accent is a token override in theme/violet.css. Everything else must
// read tokens (var(--color-*)), so a fork re-themes by editing that one file.
// A hex literal anywhere else would silently keep its colour when it does.
const sheets = import.meta.glob('./**/*.css', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('colours come from tokens', () => {
  it('finds the stylesheets it is meant to scan', () => {
    expect(Object.keys(sheets).length).toBeGreaterThanOrEqual(2);
  });

  it('has no hex colour literal outside theme/violet.css', () => {
    const offenders = Object.entries(sheets)
      .filter(([file]) => !file.endsWith('theme/violet.css'))
      .filter(([, css]) => /#[0-9a-fA-F]{3,8}\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, '')))
      .map(([file]) => file);
    expect(offenders).toEqual([]);
  });
});
