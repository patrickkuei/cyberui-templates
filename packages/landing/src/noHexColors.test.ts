import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, it, expect } from 'vitest';

// The accent is a token override in theme/orange.css. Everything else must
// read tokens (var(--color-*)), so a fork re-themes by editing that one file.
// A hex literal anywhere else would silently keep its colour when it does.
//
// The stylesheets are read from disk on purpose. The obvious
// import.meta.glob('./**/*.css', { query: '?raw' }) returns every stylesheet as
// an empty string under Vitest (it does not process CSS), so a check built on
// it passes whatever the CSS contains. The 'real content' test below is there
// so that can never happen unnoticed here.
const SRC = __dirname;

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return cssFiles(path);
    return entry.name.endsWith('.css') ? [path] : [];
  });
}

// Keys are paths under src/ with forward slashes, on every OS.
const sheets = Object.fromEntries(
  cssFiles(SRC).map((file) => [relative(SRC, file).split('\\').join('/'), readFileSync(file, 'utf8')]),
);

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const hasHexColor = (css: string) => /#[0-9a-fA-F]{3,8}\b/.test(stripComments(css));

describe('hasHexColor', () => {
  it('finds 3, 6 and 8 digit hex colours, and ignores comments', () => {
    expect(hasHexColor('a { color: #fff; }')).toBe(true);
    expect(hasHexColor('a { color: #ff8a3d; }')).toBe(true);
    expect(hasHexColor('a { color: #ff8a3d80; }')).toBe(true);
    expect(hasHexColor('/* was #ff8a3d */ a { color: var(--color-accent); }')).toBe(false);
  });
});

describe('colours come from tokens', () => {
  it('finds the stylesheets it is meant to scan, with real content in them', () => {
    expect(Object.keys(sheets)).toEqual(expect.arrayContaining(['App.css', 'theme/orange.css']));
    for (const [file, css] of Object.entries(sheets)) {
      expect(css.length, `${file} was read as empty`).toBeGreaterThan(0);
    }
  });

  it('has no hex colour literal outside theme/orange.css', () => {
    const offenders = Object.entries(sheets)
      .filter(([file]) => file !== 'theme/orange.css')
      .filter(([, css]) => hasHexColor(css))
      .map(([file]) => file);
    expect(offenders).toEqual([]);
  });

  // Not an assertion about which orange: a fork changes the hue and this must still pass.
  it('moves --color-secondary and --color-accent together and leaves --color-primary alone', () => {
    const css = stripComments(sheets['theme/orange.css']!);
    const secondary = /--color-secondary:\s*(#[0-9a-fA-F]{6})\s*;/.exec(css)?.[1];
    const accent = /--color-accent:\s*(#[0-9a-fA-F]{6})\s*;/.exec(css)?.[1];
    expect(secondary).toBeDefined();
    expect(accent).toBe(secondary);
    expect(css).not.toMatch(/--color-primary/);
  });
});
