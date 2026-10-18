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

/**
 * The left and right padding that the rules for exactly `selector` leave in
 * effect, as the CSS wrote them (read in source order, so a later declaration
 * wins; left-to-right, so start is left). '0' when nothing sets it.
 */
function horizontalPaddingOf(source: string, selector: string): { start: string; end: string } {
  let start = '0';
  let end = '0';
  // Comments are already gone, and no rule here nests, so [^{}] is the rule body. A
  // rule inside @media still matches: the at-rule's own prelude cannot, it has a { in its body.
  for (const [, selectors = '', body = ''] of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selectors.split(',').some((candidate) => candidate.trim() === selector)) continue;
    for (const [, property = '', value = ''] of body.matchAll(/([\w-]+)\s*:\s*([^;]+)/g)) {
      const parts = value.trim().split(/\s+/);
      const first = parts[0] ?? '0';
      if (property === 'padding') {
        // One to four values, like every box shorthand: top, right, bottom, left.
        end = parts[1] ?? first;
        start = parts[3] ?? end;
      } else if (property === 'padding-inline') {
        start = first;
        end = parts[1] ?? first;
      } else if (property === 'padding-inline-start' || property === 'padding-left') {
        start = first;
      } else if (property === 'padding-inline-end' || property === 'padding-right') {
        end = first;
      }
    }
  }
  return { start, end };
}

const isZero = (length: string) => /^0(\.0+)?[a-z%]*$/.test(length);

describe('horizontalPaddingOf', () => {
  it('reads the shorthand, the logical properties and the later declaration, and sees only the exact selector', () => {
    expect(horizontalPaddingOf('.a{padding:0 1rem}', '.a')).toEqual({ start: '1rem', end: '1rem' });
    expect(horizontalPaddingOf('.a{padding:0 0.75rem 0 0.25rem}', '.a')).toEqual({ start: '0.25rem', end: '0.75rem' });
    expect(horizontalPaddingOf('.a{padding:0.5rem}', '.a')).toEqual({ start: '0.5rem', end: '0.5rem' });
    expect(horizontalPaddingOf('.a{padding:1rem 2rem 3rem}', '.a')).toEqual({ start: '2rem', end: '2rem' });
    expect(horizontalPaddingOf('.a{padding:0;padding-inline:0.75rem}', '.a')).toEqual({ start: '0.75rem', end: '0.75rem' });
    expect(horizontalPaddingOf('.a,.b{padding-left:1rem;padding-right:2rem}', '.b')).toEqual({ start: '1rem', end: '2rem' });
    expect(horizontalPaddingOf('@media (x){.a{padding-inline:1rem}}', '.a')).toEqual({ start: '1rem', end: '1rem' });
    expect(horizontalPaddingOf('.a b{padding-inline:1rem}.ab{padding-inline:1rem}', '.a')).toEqual({ start: '0', end: '0' });
    expect(isZero('0')).toBe(true);
    expect(isZero('0px')).toBe(true);
    expect(isZero('0.25rem')).toBe(false);
    expect(isZero('var(--pad)')).toBe(false);
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

  // The page is the scroller and the app bar and bottom nav stick over it, so a
  // focused control can sit under one of them with the browser none the wiser
  // (WCAG 2.4.11). Only a browser sees it: Tab to "Add room" on Rooms at 390x844.
  it('keeps a focused control clear of the sticky app bar and bottom nav, with scroll-padding on the scroller', () => {
    expect(code).toMatch(/html\s*\{[^}]*scroll-padding-top:\s*calc\([^)]*env\(safe-area-inset-top\)\)/);
    expect(code).toMatch(/html\s*\{[^}]*scroll-padding-bottom:\s*calc\([^)]*env\(safe-area-inset-bottom\)\)/);
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
  it.each(['.device-name', '.notice-text', '.step-title', '.screen-title', '.room-title', '.room-card-title', '.hero-room', '.hero-caption', '.down-note'])('lets %s wrap an unbroken device name', (selector) => {
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

  it('gives the hover tint to the glyph power button only, not to the static glyph tile of a sensor or a nearby device', () => {
    expect(code).toMatch(/\.glyph-button:not\(\.glyph-button--static\):hover/);
    expect(code).not.toMatch(/\.glyph-button:hover/);
  });

  // The hover tint, the pressed tint and the focus ring are all painted on the
  // control's own box. A control whose text sets that box's size (a link, a
  // row, a chip) and that has no side padding puts the tint's edge right on its
  // text: the Home device row did ("Bedside lamp" flush left, "Off" flush right).
  // Nothing is painted at rest, so every rest-state check, screenshot and review
  // saw a row that looked fine; only moving the pointer onto it shows the bug.
  // The two icon-only controls are exempt: a fixed-size box with the icon
  // centred in it has no text to touch the edge, and padding would only fight
  // its width and height.
  const TINTED_WITH_TEXT = ['.nav-tab', '.device-link', '.nearby-row', '.chip', '.preset', '.app-bar-back'];
  const TINTED_ICON_ONLY = ['.chevron-button', '.glyph-button'];

  it.each(TINTED_WITH_TEXT)('keeps horizontal padding on %s, so its hover and pressed tint never touches its text', (selector) => {
    const { start, end } = horizontalPaddingOf(code, selector);
    expect(isZero(start), `${selector} has no left padding`).toBe(false);
    expect(isZero(end), `${selector} has no right padding`).toBe(false);
  });

  it('knows every control that gets a hover or pressed tint, so a new one cannot skip the padding check above', () => {
    // The first class of each selector that has :hover or :active ('.glyph-button:not(.glyph-button--static):hover' is the glyph button).
    const tinted = new Set([...code.matchAll(/(\.[\w-]+)[^,{}]*?:(?:hover|active)\b/g)].map((match) => match[1]));
    expect([...tinted].sort()).toEqual([...TINTED_WITH_TEXT, ...TINTED_ICON_ONLY].sort());
  });

  it('lets the page draw under the notch (viewport-fit=cover) and names its theme colour', () => {
    expect(html).toMatch(/<meta name="viewport"[^>]*viewport-fit=cover/);
    expect(html).toMatch(/<meta name="theme-color"/);
  });
});
