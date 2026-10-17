# Mobile-First App Template (`packages/mobile-app`) — Design Spec

**Date:** 2026-10-17
**Status:** Draft, waiting for the owner. Nothing below is decided until the owner answers the questions at the end; "Decisions I made" are proposals that are cheap to reverse. No plan and no code exist yet.
**Plan:** not written (it follows the owner's answers).
**Issue:** [#48](https://github.com/patrickkuei/cyberui-templates/issues/48) (item 4 of tracking issue [#1](https://github.com/patrickkuei/cyberui-templates/issues/1)).
**Builds on:** [2026-09-27-cyberui-showcase-design.md](2026-09-27-cyberui-showcase-design.md) (self-contained packages, accent-hue theming, one combined deploy), [2026-10-05-templates-page-design.md](2026-10-05-templates-page-design.md) (the `/templates` page every template is published through), [2026-10-06-agent-panel-design.md](2026-10-06-agent-panel-design.md) (hash routes, the honesty standard, the phone fixes that came late) and [2026-10-16-landing-page-design.md](2026-10-16-landing-page-design.md), the closest model for this document's shape, its PR split and its publishing path (§10), which are reused here without being repeated in full.
**Baseline:** cyberui-2045 **2.8.0** (what the three shipped templates use). Everything about the library below was read from the published 2.8.0 package (`npm pack cyberui-2045@2.8.0`, its typings, compiled components and stylesheet), not from memory.

## Decisions I made, and what the owner must answer

Proposed decisions (each cheap to reverse; the section with the reasoning is in brackets):

1. **Slug and package name:** `mobile-app` / `mobile-app-template`, site name "Mobile App". [§2]
2. **Fiction:** a household pantry tracker called **"Larder"** (a placeholder name, see §2). Chosen because its list has natural status colours (fresh, use soon, expired) that exercise the library's semantic tokens, which a habit tracker or a delivery tracker does not. [§2, Q1]
3. **Four screens, three of them tabs:** Pantry (a list), Shopping (a checklist), Settings, plus **Add item** (a form) pushed on top of Pantry. The primary flow is Pantry, then Add item, then back to Pantry with the item in the list. [§3.2]
4. **Hash routes, like monitoring and agent-panel:** `#/pantry`, `#/shopping`, `#/settings`, `#/add`, built on the `ROUTES = [...] as const` tuple so a fifth screen cannot be added without its title and component. Back on a phone then closes Add item, which is what a phone user expects. [§3.1]
5. **Bottom navigation is hand-built** from native links and the template's own CSS. cyberui-2045 has no bottom bar; `TabNavigation` is a top tab strip. This is a candidate library feature request (filed only after the template shows the need), not something to work around quietly. [§3.3, §7]
6. **Tap, not swipe.** A row opens a bottom sheet (`Drawer side="bottom"`) with its actions. Swipe-to-act has no library support, needs pointer-event code that happy-dom cannot test, and would need a non-gesture alternative anyway. [§3.4, Q4]
7. **Nothing is saved, nothing is sent.** State lives in memory (one reducer); a reload restores the starting data. Expiry dates in the starting data are stored as "days from today" and resolved at load, so the demo never goes stale. [§5, Q5]
8. **One persistent signal for what is mock:** a small "Demo" badge in the app bar, plus the README, plus the confirmation after saving an item. No repeated "(simulated)" labels. [§3.6, Q6]
9. **No images, no new runtime dependency** beyond `react`, `react-dom` and `cyberui-2045`: inline SVG icons (the landing and agent-panel `icons/` pattern), no router library, no chart library, no camera or barcode code. [§9]
10. **Accent: blue `#5b9cff`**, a two-token override in one file, exactly as `orange.css` and `violet.css` do it. [§4, Q2]
11. **Two pull requests** as for landing: PR A is the package (with the browser check at 320, 390 and 800px), PR B is the site entry, copy, two verbatim role-play examples, Code tab, screenshot and wiring. [§10]
12. **`notFor` is written about this template's own limits** (owner rule, 2026-10-16), and may be omitted. [§11]
13. **The site gets one small new capability, an optional phone-sized frame for the live preview**, because the preview dialog is about 1260px wide and the template would otherwise be shown at its widest layout. This is new site behaviour, so it is a question, not a given. [§10.1, Q3]

Open questions: see the end of this document. Q-numbers are referenced from the sections above.

## 1. Goal

Ship the fourth template: a self-contained **app designed for a phone first**, with the things a phone app has and a dashboard or a landing page does not: bottom navigation, a screen you push and pop, a list you act on with a thumb, a form that has to work with an on-screen keyboard, and layout that respects the notch, the home indicator and the browser's collapsing toolbar. It is also, deliberately, the template that **shakes out the library's small-screen behaviour** (issue #48): the agent panel's phone bugs were found late and by hand, so here 320 to 390px is the main case and anything the library gets wrong there goes upstream to patrickkuei/CyberUI.

Success, in the repo's terms (spec 2026-10-05 §1):
1. A visitor can tell within one preview whether this is the shape of thing they want (a small utility app used one-handed), and what is fake in it.
2. A forker gets a package that runs after `npx tiged … my-app && cd my-app && npm install && npm run dev` with no other setup, and whose code reads as patterns to copy (the route tuple, the reducer, the touch-target and safe-area rules).
3. It follows the same path to publication as the first three and adds as little new site machinery as possible (§10).
4. It holds at **320, 390 and 800px**, checked in a real browser at each width, not inferred from tests.

**Not in scope:** a real backend, accounts, sync, push notifications, camera or barcode scanning, offline support or a service worker, installing as a PWA (no manifest), localStorage persistence, i18n, a light theme, native-app packaging, any change to cyberui-2045 (findings go to patrickkuei/CyberUI as issues).

## 2. What the template is for

A person (a developer, a designer, a founder) who wants to build the front end of a small utility app that people will use on their phone, and wants a starting point that already solves the phone-specific parts in this library's look. The template answers "what does a cyberui app feel like in a thumb's reach?" with a working app.

Fiction (proposed, Q1): **"Larder"**, a pantry tracker: what is in the cupboard, what to use up soon, what to buy. Reasons: it is a genuinely phone-shaped task (checked in the kitchen, one-handed); the list has status colours with real meaning, so the template shows the library's `success`, `warning` and `error` tokens doing their job, which is also why the accent must stay out of that range (§4); and it does not overlap with the monitoring, agent-panel or landing fictions (all work or developer themed). "Larder" is a placeholder, not checked against trademarks beyond the repo's rule that no real brand appears; a better name is welcome.

Alternatives I considered and why they rank lower: a **habit tracker** (the most expected choice, but its "done" state is a green tick that sits right next to a lime accent, and it has fewer states to show); a **delivery tracker** (a natural fit for `Steps`, but a live map and live courier position are the most "this looks real" things in the app and would need the most mock disclaimers).

## 3. The experience

### 3.1 Shape and routing

One app shell: an app bar at the top, the screen in the middle, bottom navigation at the foot. Routes are hash routes via a `useHashRoute` hook with `ROUTES = ['pantry', 'shopping', 'settings', 'add'] as const` and `Route = (typeof ROUTES)[number]`, with `Record<Route, …>` maps for titles and screens, the same pattern monitoring and agent-panel document in their source (CLAUDE.md names it). The default route is `pantry`. An unknown hash falls back to `pantry`.

Why hash routes here, unlike landing: this is a multi-screen app, and the phone's Back must pop **Add item** rather than leave the page. The site's preview dialog already copes with an iframe that pushes hash entries (spec 2026-10-05, `usePreviewNav`), as monitoring and agent-panel prove.

Focus and announcements: on a route change focus moves to the screen's `h1` (the route title) so a keyboard or screen-reader user is not left on the link they pressed. This is the one place the template does more than the others, and gets a comment.

### 3.2 Screens (proposed, Q7)

| # | Screen | What it shows | cyberui-2045 pieces (to confirm in the plan against the 2.8.0 manifest) |
|---|---|---|---|
| 1 | **Pantry** (tab) | Items grouped "Use soon" and "Everything else", each row: name, quantity, where it lives, an expiry chip (fresh, soon, expired). A filter row (All, Fridge, Cupboard, Freezer). An "Add item" button reachable with the thumb. Tapping a row opens the item sheet. | `Card` (or plain list rows), `Badge`, `TabNavigation` or `Button` chips for the filter, `Drawer side="bottom"`, `Button` |
| 2 | **Add item** (pushed, not a tab) | A form: name, quantity (stepper), where (Fridge, Cupboard, Freezer), expires on (a native date input), "Remind me" toggle. Save returns to Pantry with the item added and a confirmation. Cancel and the system Back return without saving. | `Input`, `Select` or `RadioGroup`, `Toggle`, `Button`, `Notification` or a status line |
| 3 | **Shopping** (tab) | A checklist. Ticking moves nothing anywhere real; a "Move bought items to pantry" button adds the ticked items to the Pantry. | `Checkbox`, `Button`, `Badge` (count) |
| 4 | **Settings** (tab) | Reminder time and "Use soon" window (days), two toggles ("Expiry reminders", "Sync across devices"), an About block with the mock disclosure. | `Toggle`, `Slider` or `Select`, `Divider` |

**The item sheet** (opened from a Pantry row) is a bottom sheet with the item's details and three actions: "Use one" (quantity down by one, removed at zero), "Add to shopping list", "Remove". This is the template's list-action pattern: every action is a visible, labelled button, so nothing depends on a gesture or on hover.

The bottom sheet is a `Drawer` with `side="bottom"`; the library's open Drawer findings matter here and are listed in §7.

### 3.3 Bottom navigation

A `<nav aria-label="Main">` with three links (Pantry, Shopping, Settings), each an icon over a label, current page marked `aria-current="page"`. Built from native anchors styled with the template's CSS, because no library component fits (§7). It is `position: sticky`/fixed at the foot of the app shell, not of the document, and pads itself by `env(safe-area-inset-bottom)`. Each link is at least 44px high and a third of the width (§3.5). The Add button is not a fourth tab; it is a primary `Button` in the Pantry screen, so the nav stays three items (more than five breaks at 320px; three leaves room).

The nav is hidden on the Add item screen (a form with the on-screen keyboard open should not carry a fixed bar over the fields); that screen has its own app-bar Back and a Save button.

### 3.4 Interactions that are real, and the one decision about gestures

Real: switching tabs, filtering the pantry, opening the item sheet, "Use one" / "Remove" / "Add to shopping list" (they change in-memory state), adding an item (with validation: a name is required, the quantity is at least 1, the date cannot be before today), ticking the shopping list, moving bought items to the pantry, the Settings toggles changing their own state.

**Swipe is left out (Q4).** Swipe-to-reveal is the interaction people picture first in a phone list, and issue #48 lists "swipe or tap actions". Against it: cyberui-2045 has no gesture component, so the template would carry its own pointer-event code (pointerdown/move/up with a threshold, scroll-vs-swipe disambiguation, `touch-action`), which happy-dom cannot exercise; a swipe is invisible, so every row would need the same actions as visible buttons anyway for keyboard and switch users; and the bottom sheet already gives the thumb a large target. If the owner wants swipe, it is added on top of the sheet as an enhancement (the sheet remains the accessible path), at the cost of one hook and a browser-only test.

### 3.5 Phone rules the template follows, each with a way to check it

These are the issue's list, made concrete. The plan turns each into a task or a test.

- **Touch targets of at least 44 by 44 CSS pixels** for every control. Facts from the 2.8.0 class names (computed, not yet measured in a browser; the plan's first browser task measures them): `Button` `md` is `py-2` plus an `text-lg` line (1.75rem), so about **44px** for the borderless primary and **48px** for the outlined variants; `sm` is about **28/32px**, below the bar, so this template does not use `sm`. `Toggle` is a **28px**-high track at `md` and **32px** at `lg`, and `Checkbox` is **20px** at `md` and **24px** at `lg`: both are smaller than 44px, so each is wrapped in a row whose whole label is the hit area and at least 44px high, and the template does not rely on the bare control. A test cannot measure layout under happy-dom, so this is a browser check at 320 and 390px (and the CSS carries `min-height: 2.75rem` on the wrapping rows so the rule is greppable).
- **Safe-area insets.** `index.html` sets `viewport-fit=cover` and the app bar, bottom nav and sheet pad themselves with `env(safe-area-inset-*)`. Neither the library nor a desktop browser exercises this: **2.8.0's stylesheet contains no `env(safe-area-inset-*)` and no `dvh`/`svh`/`lvh`**, so a `Drawer` bottom sheet does not pad itself for the home indicator and the template pads the sheet's content. I cannot verify real inset values without a notched device or Chromium's safe-area emulation; the plan tries the latter and the spec's findings section records what was and was not verified (§12).
- **`dvh`, not `vh`.** The app shell is `min-height: 100dvh` (with a `100vh` fallback written first), so the browser's collapsing toolbar does not leave the nav under the fold. In 2.8.0 `100vh` appears only in `Image`'s utilities and in two decorative keyframes (`scan`, `signal-glitch-vertical-sweep`); `Drawer` and `Modal` use `fixed inset-0`, which is fine on phones.
- **Reduced motion.** The route change, the sheet and any list animation are off or instant under `prefers-reduced-motion` (copy `usePrefersReducedMotion` from landing/agent-panel). No scroll-triggered motion (owner rule).
- **No hover-only controls.** Every action is visible. Hover styles may enhance but never carry meaning. The library gates its `hover:` rules in `@media (hover: hover)` (that block appears in its stylesheet; I did not check every rule), so a touch tap should not leave sticky hover on buttons; the browser check at 390px with touch emulation looks for it.
- **The on-screen keyboard.** Inputs use the right `type` and `inputmode` (`inputMode="numeric"` for quantity, `type="date"` for expiry), `autoComplete="off"` on the name, and the Add screen's Save button must remain reachable with the keyboard open (a sticky footer inside the screen, not a fixed bar over the fields). Verified in the browser at 390px only as far as an emulated viewport can; a real keyboard is **not** checked.
- **Text and zoom.** Body text at least 16px so iOS Safari does not zoom on focus; layout survives 200% text zoom and 320px without sideways scroll (`scrollWidth` equals the viewport).
- **Landmarks and focus.** `header`, `main`, `nav`; one `h1` per screen; a skip link; visible focus on every control.

### 3.6 What is mock, and how the app says so

Real in the app: everything in §3.4. Mock:

- **Sync.** The Settings "Sync across devices" toggle changes only its own state; nothing syncs and there is no account.
- **Reminders and notifications.** "Expiry reminders" and the reminder time are stored in memory; no notification is ever scheduled, requested or shown, and the template never calls the Notification API or asks for permission.
- **Persistence.** Reloading restores the starting data; items you add are lost.
- **The data.** The pantry, the shopping list and the store names are invented; dates are relative to the day the page loads.
- **No payment, no scanning, no camera**: absent, not faked.

How the app says it (proposed, Q6, following the agent-panel and landing decision that honesty is one persistent signal plus the README, not repeated labels): a small **"Demo" badge** in the app bar, always visible, with the full sentence ("Template demo: Larder is fictional, nothing is saved or sent.") on the Settings screen's About block and in the confirmation shown after saving an item (the moment a person has typed something). No banner and no "(demo)" suffixes on buttons. A comment at the reducer, the settings handlers and the sync toggle says the same for a forker.

## 4. Theming

Same mechanism as `orange.css` and `violet.css`: one small stylesheet imported after the library's, overriding `--color-secondary` and `--color-accent` together, leaving `--color-primary` alone, with the comment written for a forker. A test fails if any other CSS file under `src/` contains a hex literal (landing's test, which reads the CSS from disk; `import.meta.glob(..., '?raw')` returns empty strings under Vitest and would pass vacuously).

Hues already taken: cyan (monitoring `#00fff9`, hue 179), violet (agent-panel `#c084fc`, 270) and orange (landing `#ff8a3d`, 24). The library's own `primary` is hue 338. Contrast computed from the 2.8.0 tokens (`--color-base` `#1a1a2e`, `--color-surface` `#2d2d44`, `--color-inverse` `#1a1a2e`; the primary Button's fill is `--color-accent` to `--color-secondary` with `--color-inverse` text, which is the same figure as "on base" below). Text must reach 4.5:1 on both base and surface:

| Candidate | Hex | Hue | on base | on surface | Concern |
|---|---|---|---|---|---|
| Blue (proposed) | `#5b9cff` | 216 | 6.21 | 4.87 | Closest shipped hue is cyan (37 degrees away), and the library's `info` (`#0af`, hue 200) is near; the pantry has no info state |
| Lime | `#a3e635` | 83 | 11.31 | 8.87 | Between the library's yellow accent and `success` green (`#00ff9e`, hue 157): it would blur with the "fresh" status here |
| Sky | `#38bdf8` | 198 | 7.96 | 6.24 | Almost the library's `info` colour and 19 degrees from cyan |
| Indigo | `#818cf8` | 234 | 5.72 | **4.48** | Fails 4.5:1 on surface |
| Rose red | `#ff6b6b` | 0 | 6.15 | 4.82 | 22 degrees from `primary` and next to `error`; would read as an expired item |
| Pink | `#ff6b9d` | 340 | 6.37 | 4.99 | Same hue as `--color-primary`: merges with the primary colour |

Blue is proposed because it is the only candidate clear of all three status colours the pantry uses (success green, warning amber, error red) and of the magenta primary, with contrast above 4.5 on both surfaces; the price is that on the Templates page its badge sits nearer to monitoring's cyan than orange or violet do, which the page's own text labels ("Blue accent") soften. (Q2) If the owner prefers more distance from cyan, lime is the alternative but then the fiction should move away from a fresh/expired list (a habit tracker would still collide on "done"), so Q1 and Q2 go together.

`packages/site/src/data/templates.test.ts` already enforces that `accentHex` values are distinct.

## 5. Data and mock-data strategy

State is a single `useReducer` in `App.tsx` (pantry items, shopping items, settings), exposed through props, not a context library or a store; the reducer's action type is a discriminated union, so an unhandled action is a compile error. Starting data and the copy live in `src/data/`:

| File | Holds |
|---|---|
| `pantry.ts` | the starting items, each with `daysLeft` (an offset from today) rather than a calendar date |
| `shopping.ts` | the starting shopping list |
| `settings.ts` | the defaults |
| `product.ts` | the app name, route titles, tab labels, the disclosure sentence |

`daysLeft` is resolved to a date once at load by a small `expiry.ts` utility with tests, so the "fresh / use soon / expired" statuses are always as designed whenever someone opens the demo. The status is a function of `daysLeft` and the user's "Use soon" window, and its labels map is a `Record<ExpiryStatus, …>`.

The README gets a "Where your data goes" section (as agent-panel's does) naming these files and the reducer as the place to put a real data layer.

## 6. Code structure and patterns to copy

```
packages/mobile-app/
  LICENSE            (identical to the root one)
  README.md          (the forker's documentation)
  index.html         (viewport-fit=cover, theme-color, a comment about both)
  package.json       (name mobile-app-template, license MIT, no workspace: ranges)
  tsconfig.json      (complete, not extended)
  vite.config.ts     (base: './')
  src/
    main.tsx  App.tsx  App.css
    router/          (useHashRoute.ts with the ROUTES tuple)
    screens/         (PantryScreen, AddItemScreen, ShoppingScreen, SettingsScreen)
    components/      (AppBar, BottomNav, ItemRow, ItemSheet, ExpiryChip, TouchRow ...)
    state/           (reducer.ts and its action types)
    data/            (§5)
    hooks/           (usePrefersReducedMotion, copied)
    icons/           (inline SVG, as in landing)
    theme/           (the accent file)
    test/            (setup.ts, copied)
```

### 6.1 Patterns copied from the other templates

`useHashRoute` with the `ROUTES` tuple and `Record<Route, …>` maps (monitoring, agent-panel), `usePrefersReducedMotion`, `test/setup.ts`, the `noInlineStyles` and `noHexColors` tests, the `icons/` approach. Duplication across templates stays deliberate (a shared layer would break `tiged` extraction).

### 6.2 Patterns new to this template (each needs a forker-facing comment, per CLAUDE.md)

- **A touch-target wrapper** (the `TouchRow`-style component for `Toggle` and `Checkbox`): why the bare control is too small, and that the label, not the control, is the hit area.
- **Safe-area and `dvh` rules in one place** (a small block in `App.css` or a utility class), explaining that the library does neither.
- **The reducer's action union** as the single place state changes, and where a real backend would plug in.
- **Route-change focus management**, and why.
- **Mock boundaries named in code** (the reducer, the settings handlers, the sync toggle), matching the honesty rule in CLAUDE.md.
- **Duplicate visible text in tests:** item names appear in the list, the sheet and the shopping list, and tab labels appear in the nav and as screen titles; scope queries with `within(...)`, with one comment at the first collision in a file (CLAUDE.md's rule, never rename text to dodge it).

## 7. cyberui-2045 components used, and library issues that matter on a phone

Planned: `Button`, `Badge`, `Card`, `Drawer`, `Input`, `Select` or `RadioGroup`, `Toggle`, `Checkbox`, `Slider` (possibly), `Notification` (possibly), `Divider`, `SectionTitle`. All are in the 2.8.0 manifest (33 components). The plan's first task confirms each prop against the published typings; this spec has read `Drawer` (`side` accepts `left | right | top | bottom`; `size` `sm | md | lg | xl | full`; `variant` `default | danger`; `ariaLabel`, `className`, `overlayClassName`), `TabNavigation` (`mode` `scroll | wrap | dropdown | collapsible`, responsive `size`), `Toggle`, `Checkbox`, `Notification`, `DropdownMenu` and `Slider`. Responsive props work in the prebuilt stylesheet since 2.8.0 (CyberUI#108), so `size={{ base: 'md', lg: 'lg' }}` is usable.

Open library issues (patrickkuei/CyberUI, all open on 2026-10-17) and what they cost this template, since it leans on Drawer, Toggle and Input more than landing did:

| Issue | Effect on this template | Proposed handling |
|---|---|---|
| #123 Drawer has no focus trap although `aria-modal` | The item sheet is the template's main overlay; Tab can leave it into the page behind | Work around with a comment citing the issue (as landing does) only if a small, honest workaround exists; otherwise document it in the README's known limits |
| #124 Drawer's `rgbGlow` border hard-codes colours | A **bottom sheet is large on a phone**, so a border cycling magenta, cyan, green and yellow on a blue-themed app is far more visible than landing's side menu was | The Drawer accepts `className` and `overlayClassName`; the plan tests whether a class can neutralise the animation (a steady `--color-accent` border) without hacking library internals. If it cannot, say so in a comment and in Q8 |
| #125 Drawer title is 3.45:1 on its surface | The sheet title | Pass no `title`; render our own heading in the sheet content with a token that passes, and set `ariaLabel` |
| #120 `Toggle` without `id` has no accessible name | Settings and Add item use it | Always pass an `id`; comment once (landing does) |
| #121 `Input` errors are not announced | The Add form's validation | Move focus to the first invalid field on submit and keep an `aria-live` status line; comment once |
| #122 `Steps` glyphs not `aria-hidden` | Not used here | None |
| #116, #117 (DatePicker/Image contrast, clickable Badge without a disabled state) | Not used: the date is a native input and no `Badge` is clickable | None |

Findings from reading 2.8.0 for this spec, **not yet reproduced in a browser and therefore not filed**: no bottom-navigation component exists (`TabNavigation` is a top strip); the stylesheet has no safe-area or `dvh`/`svh` support; `Toggle` and `Checkbox` render below 44px at every size. The template never silently works around a finding: it gets a comment, and an issue is filed on patrickkuei/CyberUI only after reproducing it and checking the existing list (the handoff's rule).

## 8. Testing strategy

Vitest + Testing Library + happy-dom, run in CI by the `package-tests` job. Tests assert behaviour, not markup:

- **Router:** the hash selects the screen; an unknown hash falls back to Pantry; Back from Add item returns to Pantry; the bottom nav marks the current page with `aria-current`.
- **Add item:** an empty name shows the error and keeps focus on the field; quantity below 1 and a past date are rejected; a valid submit adds the item to the Pantry list and shows the confirmation (which names the demo).
- **Item sheet:** "Use one" lowers the quantity and removes the item at zero; "Add to shopping list" adds it once; "Remove" removes it; the sheet closes on Escape.
- **Expiry status:** `daysLeft` maps to fresh, soon and expired per the window; the starting data contains at least one of each.
- **Shopping:** ticking and "Move bought items to pantry" move exactly the ticked items.
- **Settings:** each toggle changes its own state only; nothing calls the Notification API (a spy asserts it is never touched).
- **Mock honesty:** the "Demo" badge and the disclosure sentence are present.
- **Headings and landmarks:** one `h1` per screen; `header`, `main`, `nav`.
- `noInlineStyles` and `noHexColors` (copied; the latter reads CSS from disk).

Not testable under happy-dom and therefore a **browser check, not a test**: layout and sideways scroll at 320, 390 and 800px, touch-target sizes, the sticky nav and sheet against safe areas and the collapsing toolbar, focus rings, the real accent contrast, hover behaviour under touch emulation, and the preview inside the site's dialog. The plan makes this a task with screenshots, as issue #48 requires, and the spec gets a "findings" section as landing's did.

## 9. Self-containment and forkability

Identical rules to landing and agent-panel §9: own complete `package.json` (`license: MIT`, `cyberui-2045: ^2.8.0`, `vitest: ^4.1.12` or later, never `workspace:`), own `tsconfig.json`, own `vite.config.ts` with `base: './'`, no imports outside the package, a `LICENSE` identical to the root one, and a README that is the forker's documentation (what it is and what is mock, commands, "Where your data goes", "Principles this code follows" as on the Code tab, "Re-theming", and a short "Phone checklist" naming the rules in §3.5 and the library issues in §7). Verified by the clean-room method (copy the folder outside the workspace; plain `npm install` with zero warnings; build; test; run) and, once merged, `npx --yes tiged patrickkuei/cyberui-templates/packages/mobile-app my-app` for real. The package is **added to the `fork-install` matrix** in `.github/workflows/checks.yml`.

## 10. Integration points (PR B)

Same table as landing §10, with these values. The one new item is §10.1.

| File | Change |
|---|---|
| `packages/site/src/data/templates.ts` | Add the `mobile-app` entry: name "Mobile App", tagline, `accentLabel` "Blue" (pending Q2), `accentHex` (distinct from the other three), screenshot and live-preview paths. `slug:` then `name:` as plain single-line quoted strings (the README check reads the file as text). |
| `packages/site/src/content/templateContent.ts` | Add the `mobile-app` entry (`useIf`, `headsUp`, optional `notFor`, `examples`, `code`). |
| `packages/site/src/content/codeTabs.json` | Add `mobile-app`: principles with verbatim excerpts and the folder map (`check:code-tab` verifies each in CI). |
| `packages/site/public/screenshots/mobile-app.png` | Taken from the phone-sized frame or a 390px capture (Q3); it must look like a phone app, not a wide page. |
| `packages/site/scripts/sync-template-builds.mjs`, `.github/workflows/deploy.yml` | The build and copy entries; `check:template-builds` fails CI if either is forgotten. |
| `.github/workflows/checks.yml` | Add the package to the `fork-install` matrix. |
| `README.md` (root) | A row in the Templates table (`check:templates-readme`). |
| `pnpm-lock.yaml` | A `packages/mobile-app` importer; `deploy.yml` uses `--frozen-lockfile`. |
| site tests | `getTemplate('mobile-app')` resolves; its screenshot exists; copy assertions. |
| `packages/site/src/content/staticHtml.ts` | The hard-coded meta description names the templates; extend it and its test. `llms.ts`, the noscript list and the sitemap derive from `TEMPLATES`. |

`check:license`, `check:code-tab`, `check:templates-readme`, `check:template-builds`, `check:process-excerpts`, `test:scripts` and `pnpm -r --workspace-concurrency=1 run test` must pass. PR B says `Closes #48`; the tracking issue #1 gets its checkbox ticked by hand. PR A says `Refs #48`. PR B cannot pass `check:code-tab` until PR A is merged (its excerpts must exist in the package).

### 10.1 Showing a phone-first template in the preview dialog (new site behaviour, Q3)

Today the live preview is an `<iframe>` filling the dialog (about 1262 by 659px at a 1440px window; full screen at 390px). Its media queries respond to the **iframe's** width, so without a frame this template would show its widest layout in the one place most visitors look at it, which undersells the thing it exists to show.

Proposed: an optional field on `Template`, `previewFrame?: 'phone'`. When set, `TemplatePreview` renders the iframe in a centred box of 390 CSS pixels wide (height limited by the dialog, with its own scroll), with the tab strip and the Code tab unchanged; below 640px the dialog is already full screen, so the frame is dropped there and the template runs at the visitor's real width. Because the iframe really is 390px wide, the template's phone layout is what runs, not a simulation of it (no `transform`, no fake device chrome beyond a border). The existing iframe behaviour (Esc forwarding, no reload when switching tabs, the `usePreviewNav` hash handling) is untouched; the work is a field, one conditional class, ~15 lines of CSS and tests.

Alternatives: (a) no site change and let the template cap itself at a phone-width column when wide (`max-width: 30rem; margin-inline: auto`), which works with no new site behaviour but makes the template look like it ignores the 800px case issue #48 asks to be checked; (b) a toggle in the preview to flip between phone and wide, more flexible but more UI. The recommendation is the frame with no toggle.

## 11. Site copy for the Templates page (proposed wording, to be fixed after the answers)

- **Name / tagline.** "Mobile App" / "A pantry tracker built for a phone: bottom navigation, a list with a bottom sheet of actions, and a form that works with a thumb."
- **Use this if you're building…** a small utility app people will use on their phone; the front end of an app you will later connect to a backend; something with a list, a form and a few settings.
- **Heads-up.** One short friendly demo note in the agent-panel style (roughly 150 characters, no list of mock parts): the pantry is made up and nothing is saved or sent.
- **Probably not for you** (optional; own limits only, per the owner's rule): "if you need it to work offline or be installed on a phone. It's a web page, with no saved data and no push notifications." Leave out if the owner prefers no line.
- **Examples (two folds).** Not written here. Same method as the others: two persona role-plays by subagents, saved whole to a file and quoted verbatim with ellipses, never invented, checked by a script that every piece is found word for word; "Where they'd get stuck" lists only obstacles the library and templates did not cause (an account system, a backend, app-store or home-screen installation, real notifications), and no remarks about the template or demo themselves; labels say "they". Suggested personas: a developer building a household app for their family; a designer prototyping a phone app to show a client.
- **Code tab principles** (each claim must be true of the shipped code): Single source of truth (state in one reducer, content in `src/data/`), Typed and exhaustive (the `ROUTES` tuple, the action union, `Record<ExpiryStatus, …>`), No inline styles (the test), Tested (the add-item flow and the sheet), Phone rules in one place (touch targets, safe areas, `dvh`). Folder map for `src/screens`, `src/components`, `src/state`, `src/data`, `src/theme`.

## 12. Risks and what is not verified

- **Nothing here has been built or run.** The measured facts are: the token contrast numbers in §4 (computed from the 2.8.0 stylesheet's token values, not rendered); that 2.8.0's CSS has no `env(safe-area-inset-*)` and no `dvh`/`svh`/`lvh`, that `100vh` appears only in `Image`'s utilities and two decorative keyframes, and that `@media (hover:hover)` blocks exist (all by searching the published stylesheet); the `Drawer`, `TabNavigation`, `Toggle`, `Checkbox`, `Notification`, `DropdownMenu` and `Slider` props (read from the typings); and the `Button`, `Toggle` and `Checkbox` size classes (read from the compiled components). The 44px figures are arithmetic from those classes, not layout measurements.
- **Component fit is assumed.** `Drawer side="bottom"` has not been tried with a form-free action list inside a safe-area-padded sheet; whether `className` can calm the glow animation (#124) is unknown; `Select` and `RadioGroup` on a phone (the native picker versus the library's listbox) were not read and decide whether Add item uses them.
- **A real phone is out of reach.** The checks are an emulated 320, 390 and 800px viewport in a desktop browser. Safe-area insets, the on-screen keyboard resizing the viewport, iOS Safari's collapsing toolbar and real touch behaviour are not verifiable that way; the findings section must say so (as landing's did) and the README must not claim them as tested.
- **The preview frame is new site behaviour** and carries the usual risk of scope creep on the site package (§10.1, Q3).
- **Gestures:** if Q4 is answered "include swipe", the risk moves to a hook that can only be checked in a browser.
- **Touch-target wrappers** can look like extra padding to a forker and be "cleaned up" later; the comment and a CSS-greppable `min-height` rule are the guard, not a test.
- **A pantry app invites fakery of its own:** brand names on products, prices, barcodes. The data uses generic item names (rice, milk, tinned tomatoes) and no prices.

## 13. Out of scope

Anything under "Not in scope" in §1; a library `BottomNav`, `SwipeableRow` or `BottomSheet` component (separate CyberUI feature requests if the template makes the case); the community template (#49); changing issue #48's wording.

---

## Open questions for the owner

Each has my recommendation first. "Fine as proposed" is a complete answer.

**Q1. The fiction and the name.** A pantry tracker called "Larder" (proposed; package `mobile-app`, site name "Mobile App"). Alternatives: a habit tracker (more expected, collides with a green "done" tick), a delivery tracker (a good `Steps` fit but the most mock disclaimers), or something else you prefer. Is "Mobile App" the right site name, or do you want something like "Pantry App"?

**Q2. The accent hue.** Blue `#5b9cff` (proposed: contrast 6.21 on base and 4.87 on surface, clear of the success, warning, error and primary hues, but nearer to monitoring's cyan than orange or violet are), or lime `#a3e635` (more distinct from cyan, but it blurs with the "fresh" status colour in this fiction, so it would change Q1 too).

**Q3. A phone-sized frame in the site's preview dialog.** Add the optional `previewFrame: 'phone'` to `Template` so the live demo runs in a 390px-wide frame (proposed, §10.1), or leave the site alone and have the template cap itself to a phone-width column on wide screens, or add a phone/wide toggle to the preview? Also: is it fine that this makes PR B touch the site's own components, not only its data and copy?

**Q4. Swipe.** Tap a row to open a bottom sheet of actions and no swipe gestures (proposed, §3.4), or also add swipe-to-reveal as an enhancement on top of the sheet?

**Q5. Persistence.** Nothing saved; a reload restores the starting data (proposed, consistent with agent-panel and "nothing looks like a sync"), or keep items in `localStorage` so the demo feels like an app (a small honesty cost: the template would then need to say what is saved where)?

**Q6. How the app says it is a demo.** A small "Demo" badge in the app bar, the full sentence in Settings and in the add-item confirmation, and the README (proposed), or only the Settings sentence and README, or a visible line on every screen?

**Q7. Screens.** Are Pantry, Add item, Shopping and Settings the right four (proposed)? Cut candidates: Shopping (leaves Pantry, Add item, Settings and no cross-screen state); add candidates: a detail screen per item instead of the bottom sheet, a search box on Pantry.

**Q8. Known library gaps.** Where a library issue stays open at build time (the Drawer focus trap #123, its hard-coded glow colours #124), is a comment citing the issue plus a README "known limits" note acceptable (proposed, as landing did), or should the template wait for a cyberui-2045 release that fixes them before PR A?

**Q9. Wide screens.** At 800px and above, keep one centred content column of readable width with the same bottom nav (proposed, smallest scope), or switch to a side rail for navigation (a better tablet experience, more CSS and more to check)?

**Q10. Order of work and workflow.** Spec, then plan (written by a subagent that reads this spec, the landing plan and the real 2.8.0 typings), then PR A (an implementer subagent in its own worktree, then an independent read-only reviewer that mutation-tests the tests and checks the browser at 320, 390 and 800px), merge when CI is green, then PR B, then a check of the live site (proposed, the path that worked for landing). Confirm this, and say whether I should run the two role-play interviews for the site copy before PR B or stop and ask when we get there.
