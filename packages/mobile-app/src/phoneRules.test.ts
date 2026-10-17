import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

// The phone rules are written in CSS and one HTML tag, where a tidy-up can
// delete them without a single behavioural test noticing (happy-dom has no
// layout). These checks read the files from disk, like noHexColors.test.ts
// (import.meta.glob(..., '?raw') returns empty strings for CSS under Vitest),
// and fail when a rule goes missing. They prove a rule is still written down,
// not that it works: layout, safe-area insets and touch sizes are the browser
// check in the README's Phone checklist.
const SRC = __dirname;
const css = readFileSync(join(SRC, 'App.css'), 'utf8');
const html = readFileSync(join(SRC, '..', 'index.html'), 'utf8');

const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '');

/** The css with every `@media (hover: hover) { ... }` block removed (brace-matched). */
export function withoutHoverBlocks(source: string): string {
  let out = '';
  let rest = source;
  for (;;) {
    const start = rest.search(/@media\s*\(\s*hover:\s*hover\s*\)\s*\{/);
    if (start === -1) return out + rest;
    out += rest.slice(0, start);
    let depth = 0;
    let end = rest.indexOf('{', start);
    for (; end < rest.length; end++) {
      if (rest[end] === '{') depth++;
      if (rest[end] === '}' && --depth === 0) break;
    }
    rest = rest.slice(end + 1);
  }
}

describe('withoutHoverBlocks', () => {
  it('removes a hover block, nested braces and all, and keeps the rest', () => {
    const source = 'a:hover{x:1}@media (hover: hover){.b:hover{y:2}.c:hover{z:3}}.d{w:4}';
    expect(withoutHoverBlocks(source)).toBe('a:hover{x:1}.d{w:4}');
  });
});

describe('phone rules', () => {
  const code = stripComments(css);

  it('puts every :hover inside @media (hover: hover), so a tap never leaves one stuck', () => {
    expect(withoutHoverBlocks(code)).not.toMatch(/:hover/);
    expect(code).toMatch(/@media \(hover: hover\)/);
  });

  it('keeps the 44px touch-target token and uses it on each wrapper', () => {
    expect(code).toMatch(/--touch:\s*2\.75rem/);
    expect(code).toMatch(/\.touch-switch label\s*\{[^}]*min-height:\s*var\(--touch\)/);
    expect(code).toMatch(/\.touch-radios label\s*\{[^}]*min-height:\s*var\(--touch\)/);
    expect(code).toMatch(/\.touch-slider\s*\{[^}]*touch-action:\s*none/);
    expect(code).toMatch(/\.app-bar-back\s*\{[^}]*min-height:\s*var\(--touch\)/);
  });

  it('draws the keyboard focus ring on a switch, which the library does not', () => {
    expect(code).toMatch(/\.touch-switch input:focus-visible \+ div\s*\{[^}]*outline:\s*2px solid/);
  });

  it('sizes the shell with dvh, after a vh fallback', () => {
    expect(code).toMatch(/min-height:\s*100vh;\s*min-height:\s*100dvh;/);
  });

  it('pads the app bar, the bottom nav, the Save row and the device sheet for the safe areas', () => {
    expect(code).toMatch(/\.app-bar\s*\{[^}]*env\(safe-area-inset-top\)/);
    expect(code).toMatch(/\.bottom-nav\s*\{[^}]*env\(safe-area-inset-bottom\)/);
    expect(code).toMatch(/\.form-actions\s*\{[^}]*env\(safe-area-inset-bottom\)/);
    expect(code).toMatch(/\.device-sheet\s*\{[^}]*env\(safe-area-inset-bottom\)/);
    expect(code).toMatch(/\.app\s*\{[^}]*env\(safe-area-inset-left\)[^}]*env\(safe-area-inset-right\)/);
  });

  it('turns the Drawer glow animation off', () => {
    expect(code).toMatch(/\.device-sheet\s*\{[^}]*animation:\s*none/);
  });

  it('only animates under prefers-reduced-motion: no-preference', () => {
    const outside = code.replace(/@media \(prefers-reduced-motion: no-preference\)\s*\{[\s\S]*?\n\}/, '');
    expect(outside).not.toMatch(/\btransition\s*:/);
    expect(outside).not.toMatch(/@keyframes|\banimation\s*:(?!\s*none\b)/);
  });

  it('lets the page draw under the notch (viewport-fit=cover) and names its theme colour', () => {
    expect(html).toMatch(/<meta name="viewport"[^>]*viewport-fit=cover/);
    expect(html).toMatch(/<meta name="theme-color"/);
  });
});
