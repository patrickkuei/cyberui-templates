import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

// The phone rules are written in CSS and one HTML tag, where a tidy-up can
// delete them without a single behavioural test noticing (happy-dom has no
// layout). These checks read the files from disk, like noHexColors.test.ts
// (import.meta.glob(..., '?raw') returns empty strings for CSS under Vitest),
// and fail when a rule goes missing. They prove a rule is still written down,
// not that it works: layout, safe-area insets, touch sizes and where a switch's
// knob lands are the browser check in the README's Phone checklist.
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

  it('keeps the 44px touch-target token and uses it on each wrapper and each control the library does not size', () => {
    expect(code).toMatch(/--touch:\s*2\.75rem/);
    expect(code).toMatch(/\.touch-switch label\s*\{[^}]*min-height:\s*var\(--touch\)/);
    expect(code).toMatch(/\.touch-radios label\s*\{[^}]*min-height:\s*var\(--touch\)/);
    expect(code).toMatch(/\.touch-slider\s*\{[^}]*touch-action:\s*none/);
    expect(code).toMatch(/\.app-bar-back\s*\{[^}]*min-height:\s*var\(--touch\)/);
    expect(code).toMatch(/\.chip\s*\{[^}]*min-height:\s*var\(--touch\)/);
    expect(code).toMatch(/\.text-link,\s*\.text-button\s*\{[^}]*min-height:\s*var\(--touch\)/);
    expect(code).toMatch(/\.chevron-button\s*\{[^}]*width:\s*var\(--touch\);[^}]*height:\s*var\(--touch\)/);
  });

  it('gives the rows and buttons that are 48px or 64px their size in CSS, since a layout test cannot see it', () => {
    expect(code).toMatch(/\.glyph-button\s*\{[^}]*width:\s*3rem;[^}]*height:\s*3rem/);
    expect(code).toMatch(/\.stepper\s*\{[^}]*width:\s*3rem;[^}]*height:\s*3rem/);
    expect(code).toMatch(/\.device-link\s*\{[^}]*min-height:\s*3\.5rem/);
    expect(code).toMatch(/\.nearby-row\s*\{[^}]*min-height:\s*4rem/);
    expect(code).toMatch(/\.preset\s*\{[^}]*min-height:\s*3\.5rem/);
    expect(code).toMatch(/\.nav-tab\s*\{[^}]*min-height:\s*3\.5rem/);
  });

  // The Settings switches were drawn with the knob 6px above the track. The
  // library puts the knob (the track's ::after) at `top: 2px` of the nearest
  // positioned ancestor, which it makes the <label>, and the 44px min-height
  // above stretches that label past the 32px track. The track has to be the
  // positioned ancestor. Deleting this rule brings the bug back with every
  // other test green: only the browser check (README, Phone checklist) sees it.
  it('makes the switch track the knob’s positioned ancestor, so a 44px label cannot lift the knob out of it', () => {
    expect(code).toMatch(/\.touch-switch input \+ div\s*\{[^}]*position:\s*relative/);
  });

  it('draws the keyboard focus ring on a switch, which the library does not', () => {
    expect(code).toMatch(/\.touch-switch input:focus-visible \+ div\s*\{[^}]*outline:\s*2px solid/);
  });

  it('sizes the shell with dvh, after a vh fallback', () => {
    expect(code).toMatch(/min-height:\s*100vh;\s*min-height:\s*100dvh;/);
  });

  it('pads the app bar, the bottom nav and the form’s button row for the safe areas, and the shell for the sides', () => {
    expect(code).toMatch(/\.app-bar\s*\{[^}]*env\(safe-area-inset-top\)/);
    expect(code).toMatch(/\.bottom-nav\s*\{[^}]*env\(safe-area-inset-bottom\)/);
    expect(code).toMatch(/\.form-actions\s*\{[^}]*env\(safe-area-inset-bottom\)/);
    expect(code).toMatch(/\.app\s*\{[^}]*env\(safe-area-inset-left\)[^}]*env\(safe-area-inset-right\)/);
  });

  it('turns every transition and animation under .app off for reduced motion, the library’s own included', () => {
    expect(code).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.app,\s*\.app \*,\s*\.app \*::before,\s*\.app \*::after\s*\{[^}]*transition-duration:\s*0s !important;[^}]*animation-duration:\s*0s !important/,
    );
  });

  it('moves only under prefers-reduced-motion: no-preference: every transition, animation and keyframe is inside it', () => {
    const outside = code
      .replace(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/, '')
      .replace(/@media \(prefers-reduced-motion: no-preference\)\s*\{[\s\S]*?\n\}/, '');
    expect(outside).not.toMatch(/\btransition\s*:/);
    expect(outside).not.toMatch(/@keyframes/);
    expect(outside).not.toMatch(/\banimation(-delay)?\s*:/);
    expect(code).toMatch(/@media \(prefers-reduced-motion: no-preference\)\s*\{[\s\S]*@keyframes pulse/);
    expect(code).toMatch(/@media \(prefers-reduced-motion: no-preference\)\s*\{[\s\S]*\.pulse span\s*\{[^}]*animation:/);
  });

  it('draws one still ring for the scan’s pulse when motion is off', () => {
    expect(code).toMatch(/\.pulse span:first-child\s*\{[^}]*opacity:\s*0\.6/);
  });

  // A device name can be 30 characters with no place to break (the Add form allows it).
  // Every place that prints one must be allowed to wrap anywhere, or the page scrolls
  // sideways at 320px.
  it.each(['.device-name', '.notice-text', '.step-title', '.screen-title', '.room-title', '.room-card-title'])('lets %s wrap an unbroken device name', (selector) => {
    const escaped = selector.replace('.', '\\.');
    expect(code).toMatch(new RegExp(`${escaped}\\s*\\{[^}]*overflow-wrap:\\s*anywhere`));
  });

  it('clips the glow’s sideways overflow on the device page, where it reaches past the glyph', () => {
    expect(code).toMatch(/\.hero\s*\{[^}]*overflow-x:\s*clip/);
  });

  it('keeps the widened slider hit areas on the track and the thumb', () => {
    expect(code).toMatch(/\.slider-control > div:last-child::before\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*-1rem 0/);
    expect(code).toMatch(/\.slider-control \[role='slider'\]::before\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*-0\.75rem/);
  });

  it('fills the slider with the accent alone, not the library’s accent-to-magenta gradient', () => {
    expect(code).toMatch(/\.slider-control > div:last-child > div:first-child\s*\{[^}]*background-image:\s*none;[^}]*background-color:\s*var\(--color-accent\)/);
  });

  // Lit lines are drawn over the accent glow, and a graphic needs 3:1. The text colour
  // is 2.45:1 on the brightest glow; white is 3.23:1 (README, Re-theming).
  it('draws a lit glyph’s lines in white, because the text colour is too dim against the glow', () => {
    expect(code).toMatch(/\.glyph--lit\s*\{[^}]*color:\s*var\(--color-white\)/);
  });

  it('draws a keyboard focus ring on every kind of control that is not a library component', () => {
    expect(code).toMatch(
      /:where\([^)]*\.app-bar-back[^)]*\.device-link[^)]*\.glyph-button[^)]*\.nav-tab[^)]*\.chip[^)]*\.preset[^)]*\.nearby-row[^)]*\.chevron-button[^)]*\.text-button[^)]*\.text-link[^)]*\):focus-visible\s*\{[^}]*outline:\s*2px solid/,
    );
  });

  it('gives every control the no-double-tap-zoom rule, in a place that reaches all of them', () => {
    expect(code).toMatch(/\.app :is\(a, button, label, select\)\s*\{[^}]*touch-action:\s*manipulation/);
  });

  it('makes the skip link a 44px target when it is shown', () => {
    expect(code).toMatch(/\.skip-link\s*\{[^}]*min-height:\s*var\(--touch\)/);
  });

  it('writes in sentence case: no uppercase text transform anywhere, and the library’s buttons are set back to none', () => {
    expect(code).not.toMatch(/text-transform:\s*uppercase/);
    expect(code).toMatch(/\.app button\s*\{[^}]*text-transform:\s*none/);
  });

  it('keeps buttons flat, since the glow belongs to the devices: the library’s resting shadow is zeroed and its focus ring is not', () => {
    expect(code).toMatch(/\.app button\s*\{[^}]*--tw-shadow:\s*0 0 transparent/);
    expect(code).not.toMatch(/--tw-ring/);
  });

  it('lets the page draw under the notch (viewport-fit=cover) and names its theme colour', () => {
    expect(html).toMatch(/<meta name="viewport"[^>]*viewport-fit=cover/);
    expect(html).toMatch(/<meta name="theme-color"/);
  });
});
