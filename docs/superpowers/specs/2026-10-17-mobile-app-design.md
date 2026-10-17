# Mobile-First App Template (`packages/mobile-app`) — Design Spec

**Date:** 2026-10-17 (revised 2026-10-18)
**Status:** Approved by the owner on 2026-10-18. The owner chose a **home device controller** for Q1 (the first draft proposed a pantry tracker; the owner asked whether it suited cyberui and picked this instead), then answered Q2 to Q10 with "go your recommend", so every "proposed" decision below is now decided, including the placeholder name "Kestrel" and the site name "Mobile App". See "Owner answers" at the end.
**Plan:** [docs/superpowers/plans/2026-10-18-mobile-app.md](../plans/2026-10-18-mobile-app.md) (20 tasks: PR A is Tasks 1-14, PR B is Tasks 15-20).
**Issue:** [#48](https://github.com/patrickkuei/cyberui-templates/issues/48) (item 4 of tracking issue [#1](https://github.com/patrickkuei/cyberui-templates/issues/1)).
**Builds on:** [2026-09-27-cyberui-showcase-design.md](2026-09-27-cyberui-showcase-design.md) (self-contained packages, accent-hue theming, one combined deploy), [2026-10-05-templates-page-design.md](2026-10-05-templates-page-design.md) (the `/templates` page every template is published through), [2026-10-06-agent-panel-design.md](2026-10-06-agent-panel-design.md) (hash routes, the honesty standard, the phone fixes that came late) and [2026-10-16-landing-page-design.md](2026-10-16-landing-page-design.md), the closest model for this document's shape, its PR split and its publishing path (§10), which are reused here without being repeated in full.
**Baseline:** cyberui-2045 **2.8.0** (what the three shipped templates use; it is also the latest on npm). Everything about the library below was read from the published 2.8.0 package (`npm pack cyberui-2045@2.8.0`, its typings, compiled components and stylesheet), not from memory.

## Decisions I made, and what the owner must answer

Decided by the owner:

- **Fiction (Q1, 2026-10-18): a home device controller.** Reasons, so a later reader knows why: the neon look suits a control surface better than a household list; its core controls (`Toggle`, `Slider`, `Badge`) are exactly the ones that fall below 44px on a phone in 2.8.0, so the template stresses the library's small-screen gaps harder than any other candidate; its status colours (online, low battery, offline) are real and meaningful; and what is mock is easy to state (it controls nothing). [§2]
- **Upstream feature requests (2026-10-18):** the phone gaps this template exposes get filed on patrickkuei/CyberUI as feature requests. See §7.1 for the list and for when they are filed.

Proposed decisions (each cheap to reverse; the section with the reasoning is in brackets):

1. **Slug and package name:** `mobile-app` / `mobile-app-template`, site name "Mobile App". [§2]
2. **The device controller is called "Kestrel"** (a placeholder name, see §2). [§2]
3. **Four screens, three of them tabs:** Devices (a list with a switch on each row), Scenes (one-tap presets), Settings, plus **Add device** (a pairing form) pushed on top of Devices. The primary flow is Devices, then Add device, then back to Devices with the new device in the list. [§3.2]
4. **Hash routes, like monitoring and agent-panel:** `#/devices`, `#/scenes`, `#/settings`, `#/add`, built on the `ROUTES = [...] as const` tuple so a fifth screen cannot be added without its title and component. Back on a phone then closes Add device, which is what a phone user expects. [§3.1]
5. **Bottom navigation is hand-built** from native links and the template's own CSS. cyberui-2045 has no bottom bar; `TabNavigation` is a top tab strip. This is an upstream feature request (§7.1), not something to work around quietly. [§3.3, §7]
6. **Tap, not swipe.** A row's switch is on the row; tapping the row opens a bottom sheet (`Drawer side="bottom"`) with the device's controls. cyberui-2045 has no gesture support (2.8.0 is the latest release and has none), so swipe would mean template-owned pointer-event code. [§3.4, Q4]
7. **Nothing is saved, nothing is sent.** State lives in memory (one reducer); a reload restores the starting data. [§5, Q5]
8. **One persistent signal for what is mock:** a small "Demo" badge in the app bar, plus the README, plus the confirmation after pairing a device. No repeated "(simulated)" labels. [§3.6, Q6]
9. **No images, no new runtime dependency** beyond `react`, `react-dom` and `cyberui-2045`: inline SVG icons (the landing and agent-panel `icons/` pattern), no router library, no chart library, and no Bluetooth, camera or network code at all. [§9]
10. **Accent: blue `#5b9cff`**, a two-token override in one file, exactly as `orange.css` and `violet.css` do it. [§4, Q2]
11. **Two pull requests** as for landing: PR A is the package (with the browser check at 320, 390 and 800px), PR B is the site entry, copy, two verbatim role-play examples, Code tab, screenshot and wiring. [§10]
12. **`notFor` is written about this template's own limits** (owner rule, 2026-10-16), and may be omitted. [§11]
13. **The site gets one small new capability, an optional phone-sized frame for the live preview**, because the preview dialog is about 1260px wide and the template would otherwise be shown at its widest layout. This is new site behaviour, so it is a question, not a given. [§10.1, Q3]

Open questions: see the end of this document. Q-numbers are referenced from the sections above.

## 1. Goal

Ship the fourth template: a self-contained **app designed for a phone first**, with the things a phone app has and a dashboard or a landing page does not: bottom navigation, a screen you push and pop, a list you act on with a thumb, a form that has to work with an on-screen keyboard, and layout that respects the notch, the home indicator and the browser's collapsing toolbar. It is also, deliberately, the template that **shakes out the library's small-screen behaviour** (issue #48): the agent panel's phone bugs were found late and by hand, so here 320 to 390px is the main case and anything the library gets wrong there goes upstream to patrickkuei/CyberUI.

Success, in the repo's terms (spec 2026-10-05 §1):
1. A visitor can tell within one preview whether this is the shape of thing they want (a small control app used one-handed), and what is fake in it.
2. A forker gets a package that runs after `npx tiged … my-app && cd my-app && npm install && npm run dev` with no other setup, and whose code reads as patterns to copy (the route tuple, the reducer, the touch-target and safe-area rules).
3. It follows the same path to publication as the first three and adds as little new site machinery as possible (§10).
4. It holds at **320, 390 and 800px**, checked in a real browser at each width, not inferred from tests.

**Not in scope:** talking to real devices (no Bluetooth, no network, no MQTT or Matter), accounts, sync, push notifications, camera or QR scanning, offline support or a service worker, installing as a PWA (no manifest), localStorage persistence, i18n, a light theme, native-app packaging, any change to cyberui-2045 (findings go to patrickkuei/CyberUI as issues).

## 2. What the template is for

A person (a developer, a hobbyist, a designer) who wants to build the front end of a small control app that people will hold in one hand, and wants a starting point that already solves the phone-specific parts in this library's look. The template answers "what does a cyberui app feel like in a thumb's reach?" with a working app.

Fiction (decided, Q1): **"Kestrel"**, a hub that controls a household's devices: lights, plugs, a thermostat and sensors. Reasons it fits this library and this issue:
- A control surface is where cyberpunk styling reads naturally (state, glow, status), unlike a cosy household list.
- It is built from the controls that matter most on a phone: a `Toggle` on every row, a `Slider` for brightness and temperature, `Badge` for status. In 2.8.0 `Toggle` renders 28px high and `Slider` is a thin track, so the template exercises the library's weakest phone spots (§3.5).
- Real status colours: online (success green), low battery (warning amber), offline (error red), so the accent has to stay clear of them (§4).
- It does not overlap the monitoring (AI metrics), agent-panel (AI assistant) or landing (developer-tool marketing) fictions, though monitoring is also a "status" template; the difference is that here the user acts on devices with a thumb.
- What is mock is easy to say in one sentence: it controls nothing.

"Kestrel" is a placeholder, not checked against trademarks beyond the repo's rule that no real brand appears; a better name is welcome. Device names are generic ("Desk lamp", "Hall thermostat"), with no vendor, protocol or product names.

Alternatives considered: a **pantry tracker** (the first draft; its status colours are good, but it fits the neon look poorly and does not stress `Toggle` and `Slider`), a **habit tracker** (the most expected, but its "done" state is a green tick next to a lime accent and it has few states to show), a **delivery tracker** (a natural fit for `Steps`, but a live map is the most "looks real" thing and needs the most disclaimers).

Package folder `packages/mobile-app`, pnpm name `mobile-app-template`, site name "Mobile App" (the name is still open, Q1's second half).

## 3. The experience

### 3.1 Shape and routing

One app shell: an app bar at the top, the screen in the middle, bottom navigation at the foot. Routes are hash routes via a `useHashRoute` hook with `ROUTES = ['devices', 'scenes', 'settings', 'add'] as const` and `Route = (typeof ROUTES)[number]`, with `Record<Route, …>` maps for titles and screens, the same pattern monitoring and agent-panel document in their source (CLAUDE.md names it). The default route is `devices`. An unknown hash falls back to `devices`.

Why hash routes here, unlike landing: this is a multi-screen app, and the phone's Back must pop **Add device** rather than leave the page. The site's preview dialog already copes with an iframe that pushes hash entries (spec 2026-10-05, `usePreviewNav`), as monitoring and agent-panel prove.

Focus and announcements: on a route change focus moves to the screen's `h1` (the route title) so a keyboard or screen-reader user is not left on the link they pressed. This is the one place the template does more than the others, and gets a comment.

### 3.2 Screens (proposed, Q7)

| # | Screen | What it shows | cyberui-2045 pieces (to confirm in the plan against the 2.8.0 manifest) |
|---|---|---|---|
| 1 | **Devices** (tab) | Devices grouped by room (Living room, Bedroom, Hall). Each row: icon, name, a status `Badge` (Online, Low battery, Offline) and a `Toggle` for on/off; sensors have no toggle and show a reading instead. Offline devices show a disabled toggle. An "Add device" button reachable with the thumb. Tapping a row opens the device sheet. | `Card` or plain list rows, `Badge`, `Toggle`, `Drawer side="bottom"`, `Button` |
| 2 | **Add device** (pushed, not a tab) | A pairing form: name, room, type, and a 6-character pairing code. Save returns to Devices with the device added and a confirmation. Cancel and the system Back return without saving. | `Input`, `Select` or `RadioGroup`, `Button`, a status line or `Notification` |
| 3 | **Scenes** (tab) | Three presets ("Good night", "Morning", "Away"). Applying one changes several devices at once and says which ones changed. | `Card`, `Button`, `Badge` |
| 4 | **Settings** (tab) | A temperature unit choice (°C or °F, which really changes how thermostats display), two toggles ("Alert me when a device goes offline", "Remote access"), and an About block with the mock disclosure. | `Toggle`, `RadioGroup` or `Select`, `Divider` |

**The device sheet** (opened from a Devices row) is a bottom sheet with the device's controls: a `Slider` for brightness (lights) or target temperature (thermostat), the same on/off `Toggle`, and a visible **Remove device** button. This is the template's list-action pattern: every control is a visible, labelled element, so nothing depends on a gesture or on hover.

The bottom sheet is a `Drawer` with `side="bottom"`; the library's open Drawer findings matter here and are listed in §7.

### 3.3 Bottom navigation

A `<nav aria-label="Main">` with three links (Devices, Scenes, Settings), each an icon over a label, current page marked `aria-current="page"`. Built from native anchors styled with the template's CSS, because no library component fits (§7). It is fixed at the foot of the app shell, not of the document, and pads itself by `env(safe-area-inset-bottom)`. Each link is at least 44px high and a third of the width (§3.5). The Add button is not a fourth tab; it is a primary `Button` in the Devices screen, so the nav stays three items (more than five breaks at 320px; three leaves room).

The nav is hidden on the Add device screen (a form with the on-screen keyboard open should not carry a fixed bar over the fields); that screen has its own app-bar Back and a Save button.

### 3.4 Interactions that are real, and the one decision about gestures

Real in the app: switching tabs, flipping a device's switch, moving a slider (brightness, target temperature) in the sheet, applying a scene (it changes several devices in memory), changing the temperature unit, pairing a device (with validation: a name is required and the code must be six letters or digits), removing a device, and the Settings toggles changing their own state.

**Swipe is left out (Q4).** Swipe-to-reveal is the interaction people picture first in a phone list, and issue #48 lists "swipe or tap actions". Against it: cyberui-2045 has no gesture component (2.8.0 is the latest release; a search of its source finds none), so the template would carry its own pointer-event code (pointerdown/move/up with a threshold, scroll-vs-swipe disambiguation, `touch-action`), which happy-dom cannot exercise; a swipe is invisible, so every row would need the same actions as visible controls anyway for keyboard and switch users; and the on-row switch plus the sheet already give the thumb large targets. If the owner wants swipe, either it is added on top of the sheet as an enhancement (the sheet remains the accessible path), at the cost of one hook and a browser-only test, or a swipeable row is built upstream first (a new CyberUI feature and release, which would block this template on it; §7.1 files it as a request either way).

### 3.5 Phone rules the template follows, each with a way to check it

These are the issue's list, made concrete. The plan turns each into a task or a test.

- **Touch targets of at least 44 by 44 CSS pixels** for every control. Facts from the 2.8.0 class names (computed, not yet measured in a browser; the plan's first browser task measures them): `Button` `md` is `py-2` plus a `text-lg` line (1.75rem), so about **44px** for the borderless primary and **48px** for the outlined variants; `sm` is about **28/32px**, below the bar, so this template does not use `sm`. `Toggle` is a **28px**-high track at `md` and **32px** at `lg`, and `Checkbox` is **20px** at `md` and **24px** at `lg`: all below 44px, and `Toggle` is on every row of this template. So each is wrapped in a row whose whole label is the hit area and at least 44px high, and the template does not rely on the bare control. `Slider` sizes were not read; the plan measures its thumb and track and, if the thumb is under 44px, makes the surrounding row the touch target. A test cannot measure layout under happy-dom, so this is a browser check at 320 and 390px (and the CSS carries `min-height: 2.75rem` on the wrapping rows so the rule is greppable).
- **Safe-area insets.** `index.html` sets `viewport-fit=cover` and the app bar, bottom nav and sheet pad themselves with `env(safe-area-inset-*)`. Neither the library nor a desktop browser exercises this: **2.8.0's stylesheet contains no `env(safe-area-inset-*)` and no `dvh`/`svh`/`lvh`**, so a `Drawer` bottom sheet does not pad itself for the home indicator and the template pads the sheet's content. I cannot verify real inset values without a notched device or Chromium's safe-area emulation; the plan tries the latter and the spec's findings section records what was and was not verified (§12).
- **`dvh`, not `vh`.** The app shell is `min-height: 100dvh` (with a `100vh` fallback written first), so the browser's collapsing toolbar does not leave the nav under the fold. In 2.8.0 `100vh` appears only in `Image`'s utilities and in two decorative keyframes (`scan`, `signal-glitch-vertical-sweep`); `Drawer` and `Modal` use `fixed inset-0`, which is fine on phones.
- **Reduced motion.** The route change, the sheet and any list animation are off or instant under `prefers-reduced-motion` (copy `usePrefersReducedMotion` from landing/agent-panel). No scroll-triggered motion (owner rule).
- **No hover-only controls.** Every action is visible. Hover styles may enhance but never carry meaning. The library gates its `hover:` rules in `@media (hover: hover)` (that block appears in its stylesheet; I did not check every rule), so a touch tap should not leave sticky hover on buttons; the browser check at 390px with touch emulation looks for it.
- **The on-screen keyboard.** Inputs use the right `type` and `inputmode` (`autoCapitalize="characters"` and `autoComplete="off"` on the pairing code), and the Add screen's Save button must remain reachable with the keyboard open (a sticky footer inside the screen, not a fixed bar over the fields). Verified in the browser at 390px only as far as an emulated viewport can; a real keyboard is **not** checked.
- **Text and zoom.** Body text at least 16px so iOS Safari does not zoom on focus; layout survives 200% text zoom and 320px without sideways scroll (`scrollWidth` equals the viewport).
- **Landmarks and focus.** `header`, `main`, `nav`; one `h1` per screen; a skip link; visible focus on every control. `Toggle` variants are `primary` (magenta), `secondary` and `accent`: the template uses `accent` so "on" reads in the template's colour, not the library's magenta.

### 3.6 What is mock, and how the app says so

Real in the app: everything in §3.4. Mock:

- **The devices themselves.** There are none. Switching, sliding and applying a scene change in-memory state only; nothing is sent to anything. The template contains no Bluetooth, WebSocket, fetch or other network code, and a test asserts it does not call `fetch` or `navigator.bluetooth`.
- **Pairing.** Any six letters or digits are accepted as a pairing code; nothing is discovered or paired.
- **Status.** Online, low battery and offline are fixed in the starting data, not detected. A device never goes offline by itself.
- **Alerts and remote access.** "Alert me when a device goes offline" and "Remote access" are stored in memory; no notification is ever scheduled, requested or shown (the template never calls the Notification API or asks for permission), and there is no remote access.
- **Persistence.** Reloading restores the starting data; devices you pair are lost.
- **The data.** The devices, rooms and readings are invented.

How the app says it (proposed, Q6, following the agent-panel and landing decision that honesty is one persistent signal plus the README, not repeated labels): a small **"Demo" badge** in the app bar, always visible, with the full sentence ("Template demo: Kestrel is fictional and controls nothing.") in the Settings About block and in the confirmation shown after pairing a device (the moment a person has typed something). No banner and no "(demo)" suffixes on buttons. A comment at the reducer, the settings handlers and the pairing handler says the same for a forker.

## 4. Theming

Same mechanism as `orange.css` and `violet.css`: one small stylesheet imported after the library's, overriding `--color-secondary` and `--color-accent` together, leaving `--color-primary` alone, with the comment written for a forker. A test fails if any other CSS file under `src/` contains a hex literal (landing's test, which reads the CSS from disk; `import.meta.glob(..., '?raw')` returns empty strings under Vitest and would pass vacuously).

Hues already taken: cyan (monitoring `#00fff9`, hue 179), violet (agent-panel `#c084fc`, 270) and orange (landing `#ff8a3d`, 24). The library's own `primary` is hue 338. Contrast computed from the 2.8.0 tokens (`--color-base` `#1a1a2e`, `--color-surface` `#2d2d44`, `--color-inverse` `#1a1a2e`; the primary Button's fill is `--color-accent` to `--color-secondary` with `--color-inverse` text, which is the same figure as "on base" below). Text must reach 4.5:1 on both base and surface:

| Candidate | Hex | Hue | on base | on surface | Concern |
|---|---|---|---|---|---|
| Blue (proposed) | `#5b9cff` | 216 | 6.21 | 4.87 | Closest shipped hue is cyan (37 degrees away), and the library's `info` (`#0af`, hue 200) is near; this template has no info state |
| Lime | `#a3e635` | 83 | 11.31 | 8.87 | Between the library's yellow accent and `success` green (`#00ff9e`, hue 157): it would blur with the "Online" status here |
| Sky | `#38bdf8` | 198 | 7.96 | 6.24 | Almost the library's `info` colour and 19 degrees from cyan |
| Indigo | `#818cf8` | 234 | 5.72 | **4.48** | Fails 4.5:1 on surface |
| Rose red | `#ff6b6b` | 0 | 6.15 | 4.82 | 22 degrees from `primary` and next to `error`; would read as an "Offline" device |
| Pink | `#ff6b9d` | 340 | 6.37 | 4.99 | Same hue as `--color-primary`: merges with the primary colour |

Blue is proposed because it is the only candidate clear of all three status colours the template uses (success green, warning amber, error red) and of the magenta primary, with contrast above 4.5 on both surfaces; the price is that on the Templates page its badge sits nearer to monitoring's cyan than orange or violet do, which the page's own text labels ("Blue accent") soften. (Q2) If the owner prefers more distance from cyan, lime is the alternative, but it would be confused with the "Online" badge.

`packages/site/src/data/templates.test.ts` already enforces that `accentHex` values are distinct.

## 5. Data and mock-data strategy

State is a single `useReducer` in `App.tsx` (devices, settings), exposed through props, not a context library or a store; the reducer's action type is a discriminated union, so an unhandled action is a compile error. Starting data and the copy live in `src/data/`:

| File | Holds |
|---|---|
| `devices.ts` | the starting devices: id, name, room, `DeviceKind` (`light`, `plug`, `thermostat`, `sensor`), status, on/off, brightness or target temperature or reading |
| `scenes.ts` | the three scenes, each a list of device changes by id |
| `settings.ts` | the defaults |
| `product.ts` | the app name, route titles, tab labels, the disclosure sentence |

Everything keyed by a union is a `Record<…>`: `Record<DeviceStatus, …>` for badge label and tone, `Record<DeviceKind, …>` for icon and which controls the sheet shows, so adding a device kind without its controls is a compile error. Temperatures are stored in °C and converted for display by a small `units.ts` utility with tests. The starting data contains at least one device of every kind and every status (including one offline and one low-battery device) so every state is visible without interaction.

The README gets a "Where your data goes" section (as agent-panel's does) naming these files and the reducer as the place to put a real data layer or device protocol.

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
    screens/         (DevicesScreen, AddDeviceScreen, ScenesScreen, SettingsScreen)
    components/      (AppBar, BottomNav, DeviceRow, DeviceSheet, StatusBadge, TouchRow ...)
    state/           (reducer.ts and its action types)
    data/            (§5)
    utils/           (units.ts)
    hooks/           (usePrefersReducedMotion, copied)
    icons/           (inline SVG, as in landing)
    theme/           (the accent file)
    test/            (setup.ts, copied)
```

### 6.1 Patterns copied from the other templates

`useHashRoute` with the `ROUTES` tuple and `Record<Route, …>` maps (monitoring, agent-panel), `usePrefersReducedMotion`, `test/setup.ts`, the `noInlineStyles` and `noHexColors` tests, the `icons/` approach. Duplication across templates stays deliberate (a shared layer would break `tiged` extraction).

### 6.2 Patterns new to this template (each needs a forker-facing comment, per CLAUDE.md)

- **A touch-target wrapper** (the `TouchRow`-style component for `Toggle`, `Checkbox` and `Slider` rows): why the bare control is too small, and that the label row, not the control, is the hit area.
- **Safe-area and `dvh` rules in one place** (a small block in `App.css` or a utility class), explaining that the library does neither.
- **The reducer's action union** as the single place state changes, and where a real device protocol would plug in.
- **Route-change focus management**, and why.
- **Mock boundaries named in code** (the reducer, the scene application, the pairing handler, the settings toggles), matching the honesty rule in CLAUDE.md.
- **Duplicate visible text in tests:** device names appear in the list, the sheet and scene results, and tab labels appear in the nav and as screen titles; scope queries with `within(...)`, with one comment at the first collision in a file (CLAUDE.md's rule, never rename text to dodge it).

## 7. cyberui-2045 components used, and library issues that matter on a phone

Planned: `Button`, `Badge`, `Card`, `Drawer`, `Input`, `Select` or `RadioGroup`, `Toggle`, `Slider`, `Divider`, `SectionTitle`, and possibly `Notification`. All are in the 2.8.0 manifest (33 components). The plan's first task confirms each prop against the published typings; this spec has read `Drawer` (`side` accepts `left | right | top | bottom`; `size` `sm | md | lg | xl | full`; `variant` `default | danger`; `ariaLabel`, `className`, `overlayClassName`), `TabNavigation` (`mode` `scroll | wrap | dropdown | collapsible`, responsive `size`), `Toggle` (`variant` `primary | secondary | accent`, responsive `size`, spreads input attributes so `disabled` and `id` work), `Checkbox`, `Notification`, `DropdownMenu` and `Slider` (`min`, `max`, `step`, `value`, `onValueChange`, `variant`, responsive `size`, `label`, `showValue`, `formatValue`, `ariaLabel`). Responsive props work in the prebuilt stylesheet since 2.8.0 (CyberUI#108), so `size={{ base: 'md', lg: 'lg' }}` is usable.

Open library issues (patrickkuei/CyberUI, all open on 2026-10-17) and what they cost this template, since it leans on Drawer, Toggle and Input more than landing did:

| Issue | Effect on this template | Proposed handling |
|---|---|---|
| #123 Drawer has no focus trap although `aria-modal` | The device sheet is the template's main overlay; Tab can leave it into the page behind | Work around with a comment citing the issue (as landing does) only if a small, honest workaround exists; otherwise document it in the README's known limits (Q8) |
| #124 Drawer's `rgbGlow` border hard-codes colours | A **bottom sheet is large on a phone**, so a border cycling magenta, cyan, green and yellow on a blue-themed app is far more visible than landing's side menu was | The Drawer accepts `className` and `overlayClassName`; the plan tests whether a class can neutralise the animation (a steady `--color-accent` border) without hacking library internals. If it cannot, say so in a comment and in Q8 |
| #125 Drawer title is 3.45:1 on its surface | The sheet title | Pass no `title`; render our own heading in the sheet content with a token that passes, and set `ariaLabel` |
| #120 `Toggle` without `id` has no accessible name | Devices, Settings use it on most rows | Always pass an `id`; comment once (landing does) |
| #121 `Input` errors are not announced | The pairing form's validation | Move focus to the first invalid field on submit and keep an `aria-live` status line; comment once |
| #122 `Steps` glyphs not `aria-hidden` | Not used here | None |
| #116, #117 (DatePicker/Image contrast, clickable Badge without a disabled state) | Not used: there is no date field and no `Badge` is clickable | None |

Findings from reading 2.8.0 for this spec, **not yet reproduced in a browser and therefore not filed**: no bottom-navigation component exists (`TabNavigation` is a top strip); the stylesheet has no safe-area or `dvh`/`svh` support; `Toggle` and `Checkbox` render below 44px at every size; there is no gesture or swipe support. The template never silently works around a finding: it gets a comment, and an issue is filed on patrickkuei/CyberUI only after reproducing it and checking the existing list (the handoff's rule).

### 7.1 Upstream feature requests to file (owner request, 2026-10-18)

The owner asked that the phone features cyberui-2045 lacks be filed on patrickkuei/CyberUI. They are feature requests, so each is filed with the evidence this template produces, not as a guess:

| Request | Evidence this template should supply |
|---|---|
| A bottom navigation component (3 to 5 items, `aria-current`, safe-area padding) | The hand-built `BottomNav` and the problems it solved |
| Safe-area and `dvh` support (padding utilities or a prop on `Drawer`, app-shell helpers) | The measured behaviour of the bottom sheet against a notch or home indicator, with the emulation method and its limits (§12) |
| A touch-size option for `Toggle`, `Checkbox` and `Slider` (a 44px hit area without a bigger visual) | The measured sizes at 320 and 390px and the wrapper that had to be written |
| A swipeable row and/or a bottom-sheet action list (a gesture component with a keyboard alternative built in) | What the template does instead and what it costs, and the answer to Q4 |

**When:** during PR A, after the browser check has measured and reproduced the evidence, and after checking the open issue list (#116 to #125 today) for duplicates, in the same pass that files defects (spec 2026-10-16's "Library findings, reproduced and filed"). The filed issue numbers are recorded in this spec's findings section. They are not filed before then, so no issue is opened on a guess; if the owner wants them filed earlier, say so.

## 8. Testing strategy

Vitest + Testing Library + happy-dom, run in CI by the `package-tests` job. Tests assert behaviour, not markup:

- **Router:** the hash selects the screen; an unknown hash falls back to Devices; Back from Add device returns to Devices; the bottom nav marks the current page with `aria-current`.
- **Devices:** flipping a row's switch changes only that device; an offline device's switch is disabled; a sensor has no switch.
- **Device sheet:** the slider changes brightness or target temperature; "Remove device" removes it and closes the sheet; the sheet closes on Escape.
- **Add device:** an empty name shows the error and keeps focus on the field; a pairing code that is not six letters or digits is rejected; a valid submit adds the device to the list and shows the confirmation (which names the demo).
- **Scenes:** applying a scene changes exactly the devices it lists and reports them.
- **Settings:** the unit choice changes how a thermostat's temperature is displayed (and the stored value stays in °C); each toggle changes its own state only.
- **Mock honesty:** the "Demo" badge and the disclosure sentence are present; `fetch`, `navigator.bluetooth` and the Notification API are never called (spies).
- **Data:** every `DeviceKind` and every `DeviceStatus` appears in the starting data.
- **Headings and landmarks:** one `h1` per screen; `header`, `main`, `nav`.
- `noInlineStyles` and `noHexColors` (copied; the latter reads CSS from disk).

Not testable under happy-dom and therefore a **browser check, not a test**: layout and sideways scroll at 320, 390 and 800px, touch-target sizes, the fixed nav and sheet against safe areas and the collapsing toolbar, focus rings, the real accent contrast, hover behaviour under touch emulation, and the preview inside the site's dialog. The plan makes this a task with screenshots, as issue #48 requires, and the spec gets a "findings" section as landing's did.

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

- **Name / tagline.** "Mobile App" / "A home device controller built for a phone: bottom navigation, on/off switches and sliders in a list, one-tap scenes and a pairing form."
- **Use this if you're building…** a small control app people will use on their phone; the front end of an app you will later connect to real devices or a backend; something with a list, switches, a form and a few settings.
- **Heads-up.** One short friendly demo note in the agent-panel style (roughly 150 characters, no list of mock parts): the home and its devices are made up, and nothing is controlled or sent.
- **Probably not for you** (optional; own limits only, per the owner's rule): "if you need to talk to real devices or install it on a phone. The devices are made up, and it's a web page with no saved data." Leave out if the owner prefers no line.
- **Examples (two folds).** Not written here. Same method as the others: two persona role-plays by subagents, saved whole to a file and quoted verbatim with ellipses, never invented, checked by a script that every piece is found word for word; "Where they'd get stuck" lists only obstacles the library and templates did not cause (a device protocol such as MQTT or Matter, an account system, app-store or home-screen installation, real notifications), and no remarks about the template or demo themselves; labels say "they". Suggested personas: a hobbyist building a controller for their own home-lab or smart plugs; a designer prototyping a device app to show a client.
- **Code tab principles** (each claim must be true of the shipped code): Single source of truth (state in one reducer, content in `src/data/`), Typed and exhaustive (the `ROUTES` tuple, the action union, `Record<DeviceKind, …>`), No inline styles (the test), Tested (pairing, the sheet and scenes), Phone rules in one place (touch targets, safe areas, `dvh`). Folder map for `src/screens`, `src/components`, `src/state`, `src/data`, `src/theme`.

## 12. Risks and what is not verified

- **Nothing here has been built or run.** The measured facts are: the token contrast numbers in §4 (computed from the 2.8.0 stylesheet's token values, not rendered); that 2.8.0 is the latest published release and the CyberUI source has no swipe or gesture code; that 2.8.0's CSS has no `env(safe-area-inset-*)` and no `dvh`/`svh`/`lvh`, that `100vh` appears only in `Image`'s utilities and two decorative keyframes, and that `@media (hover:hover)` blocks exist (all by searching the published stylesheet); the `Drawer`, `TabNavigation`, `Toggle`, `Checkbox`, `Notification`, `DropdownMenu` and `Slider` props (read from the typings); and the `Button`, `Toggle` and `Checkbox` size classes (read from the compiled components). The 44px figures are arithmetic from those classes, not layout measurements, and `Slider`'s dimensions were not read.
- **Component fit is assumed.** `Drawer side="bottom"` has not been tried with a slider inside a safe-area-padded sheet; whether `className` can calm the glow animation (#124) is unknown; a `Slider` in a scrolling sheet on touch (does dragging fight with scrolling?) was not examined and could be a real finding; `Select` and `RadioGroup` on a phone (the native picker versus the library's listbox) were not read and decide how Add device is built.
- **A real phone is out of reach.** The checks are an emulated 320, 390 and 800px viewport in a desktop browser. Safe-area insets, the on-screen keyboard resizing the viewport, iOS Safari's collapsing toolbar and real touch behaviour are not verifiable that way; the findings section must say so (as landing's did) and the README must not claim them as tested.
- **The preview frame is new site behaviour** and carries the usual risk of scope creep on the site package (§10.1, Q3).
- **Gestures:** if Q4 is answered "include swipe", the risk moves to a hook that can only be checked in a browser.
- **Touch-target wrappers** can look like extra padding to a forker and be "cleaned up" later; the comment and a CSS-greppable `min-height` rule are the guard, not a test.
- **A control app invites fakery of its own:** vendor names, protocols, "connected" states and live readings. The data uses generic names and fixed readings, the template has no network code, and a test guards it.

## 13. Out of scope

Anything under "Not in scope" in §1; building a library `BottomNav`, `SwipeableRow` or `BottomSheet` component in this repo (they are CyberUI feature requests, §7.1); the community template (#49); changing issue #48's wording.

---

## Owner answers (2026-10-18)

The owner answered Q1 by choosing the device controller, and Q2 to Q10 with "go your recommend". The recommendation in each question below is therefore the decision:

| Q | Decided |
|---|---|
| Q1 | Home device controller. Name "Kestrel" and site name "Mobile App" as proposed. |
| Q2 | Blue `#5b9cff`. |
| Q3 | The optional `previewFrame: 'phone'` on `Template` (a 390px frame, no toggle); PR B touches the site's components for it. |
| Q4 | Tap and bottom sheet, no swipe; swipe is filed upstream as a feature request (§7.1). |
| Q5 | Nothing saved. |
| Q6 | A "Demo" badge in the app bar, the sentence in Settings and the pairing confirmation, and the README. |
| Q7 | Devices, Add device, Scenes, Settings. |
| Q8 | Comment citing the open Drawer issues plus a README "known limits" note; do not wait for a release. |
| Q9 | One centred content column with the same bottom nav at 800px and above. |
| Q10 | The landing path as written. The two role-play interviews for the site copy run just before PR B (the handoff method), with no further stop to ask unless an interview cannot be run. |

**Deviations found while planning.** Building the package for the plan showed that a few details in this spec do not hold or are better done differently (for example the bottom nav is `position: sticky` in the app column rather than fixed, `Notification` is not used because its close button is 20px, and the sheet's controls are an exhaustive `switch` over the device kind). They are listed one by one in the plan's "Self-review notes"; where the two differ, the plan is the later and more exact statement.

## Open questions for the owner (as asked)

Each has my recommendation first. "Fine as proposed" is a complete answer.

**Q1. (Decided 2026-10-18: a home device controller.)** Still open: the placeholder name "Kestrel", and whether "Mobile App" is the right site name or you want something like "Device Controller".

**Q2. The accent hue.** Blue `#5b9cff` (proposed: contrast 6.21 on base and 4.87 on surface, clear of the online, low-battery, offline and primary hues, but nearer to monitoring's cyan than orange or violet are), or lime `#a3e635` (more distinct from cyan, but it blurs with the "Online" status colour).

**Q3. A phone-sized frame in the site's preview dialog.** Add the optional `previewFrame: 'phone'` to `Template` so the live demo runs in a 390px-wide frame (proposed, §10.1), or leave the site alone and have the template cap itself to a phone-width column on wide screens, or add a phone/wide toggle to the preview? Also: is it fine that this makes PR B touch the site's own components, not only its data and copy?

**Q4. Swipe.** Tap the row's switch or open the bottom sheet, with no swipe gestures (proposed, §3.4), or also add swipe-to-reveal as an enhancement on top of the sheet (template-owned code), or wait for an upstream swipeable row (blocks this template on a CyberUI release)?

**Q5. Persistence.** Nothing saved; a reload restores the starting data (proposed, consistent with agent-panel and "nothing looks like a sync"), or keep devices in `localStorage` so the demo feels like an app (a small honesty cost: the template would then need to say what is saved where)?

**Q6. How the app says it is a demo.** A small "Demo" badge in the app bar, the full sentence in Settings and in the pairing confirmation, and the README (proposed), or only the Settings sentence and README, or a visible line on every screen?

**Q7. Screens.** Are Devices, Add device, Scenes and Settings the right four (proposed)? Cut candidates: Scenes (leaves Devices, Add device, Settings, with the cross-device behaviour dropped); add candidates: an Activity log screen (a list of recent changes, all generated by the user's own taps), a rooms screen.

**Q8. Known library gaps.** Where a library issue stays open at build time (the Drawer focus trap #123, its hard-coded glow colours #124), is a comment citing the issue plus a README "known limits" note acceptable (proposed, as landing did), or should the template wait for a cyberui-2045 release that fixes them before PR A?

**Q9. Wide screens.** At 800px and above, keep one centred content column of readable width with the same bottom nav (proposed, smallest scope), or switch to a side rail for navigation (a better tablet experience, more CSS and more to check)?

**Q10. Order of work and workflow.** Spec, then plan (written by a subagent that reads this spec, the landing plan and the real 2.8.0 typings), then PR A (an implementer subagent in its own worktree, then an independent read-only reviewer that mutation-tests the tests and checks the browser at 320, 390 and 800px; the upstream feature requests in §7.1 are filed from its evidence), merge when CI is green, then PR B, then a check of the live site (proposed, the path that worked for landing). Confirm this, and say whether I should run the two role-play interviews for the site copy before PR B or stop and ask when we get there.
