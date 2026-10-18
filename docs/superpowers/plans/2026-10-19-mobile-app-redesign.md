# Mobile App Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `packages/mobile-app` (the Kestrel home device controller, shipped in PRs #67, #68 and #69) in place, as the owner decided on 2026-10-18 after looking at the running app: place before device (rooms are navigation), two depths (Home to glance, one full page per device to control), light is state (a device's hand-drawn SVG glyph glows in proportion to its level; status shows only by exception), numbers as the typography, motion only in answer to a tap. Fix the `Toggle` knob that sits 6px too high on Settings, with a guard and a browser measurement. Then bring the site's copy, Code tab, screenshot and the two role-play examples up to date, because the published examples describe an app that no longer exists.

**Architecture:** Six hash routes from one `ROUTES` tuple (`#/devices` Home, `#/device/:id`, `#/rooms`, `#/settings`, `#/add`, `#/add-room`), three of them tabs in the hand-built bottom nav (Home, Rooms, Settings) and three pushed with their own Back (the device page, Add device, Add room). All app state is still one `useReducer` in `App.tsx`; `src/state/reducer.ts` is still the only place it changes, through a discriminated `Action` union. Content is typed data in `src/data/`: rooms and devices (a link state, a signal, a latency, a wattage), presets, the scripted "nearby" list and the one scripted failure, product words, settings. Everything shown about several devices (how many are on, a room's watts, the sentence at the top of Home, which devices need attention) is derived in `src/utils/summary.ts`, never stored. A device's glow is one pure number from `src/utils/glow.ts`, drawn by `src/components/Glyph.tsx` as SVG attributes (no inline styles). Scanning and linking go through a small `Connection` interface in `src/connection/` (`scan()` and `link(id)`, promises with progress callbacks and an `AbortSignal`) with a scripted implementation: the seam where a real Web Bluetooth, MQTT or WebSocket client would go. The phone rules (44px touch targets, the switch knob, safe-area insets, `dvh`, no sticky hover, sentence case, flat buttons, reduced motion) are written once in `src/App.css` and guarded by tests that read the CSS from disk. The accent is unchanged (`src/theme/blue.css`). The site publishes the change by updating data (a Code tab in PR C; a new tagline, section copy, a screenshot and two new examples in PR D) and nothing else: the phone-sized preview frame, the sync script, the deploy workflow and the `fork-install` matrix entry already exist.

**Tech Stack:** React 19, TypeScript (strict), Vite 7, Vitest 4 with happy-dom and Testing Library, cyberui-2045 ^2.8.0 (`Badge`, `Button`, `Input`, `RadioGroup`, `Select`, `Slider`, `Toggle`; no `Drawer`, `Card`, `Divider` or `SectionTitle` any more). No router, no chart library, no new runtime dependency, no image. Node built-ins for the site-side scripts.

**Spec:** [docs/superpowers/specs/2026-10-17-mobile-app-design.md](../specs/2026-10-17-mobile-app-design.md), section "Redesign, 2026-10-18". It is **decided**: do not reopen the principles, the screens, the data, the connect flow, the accent, the switch fix or the Drawer's removal. The places where the plan found a real gap or had to read a decision are listed under "Found while planning" in that section and under "Deviations and readings" in the Self-review at the end; none changes a decision. Issue: [#48](https://github.com/patrickkuei/cyberui-templates/issues/48), item 4 of the tracking issue #1.

**Model to follow:** [2026-10-18-mobile-app.md](2026-10-18-mobile-app.md), the plan that built the first version: its structure, conventions, review focus and the way it gives code in full. Read the shipped `packages/mobile-app` (its `README.md`, `src/App.tsx`, `src/App.css`, `src/phoneRules.test.ts`) before Task 1.

> **How much code this plan shows, and how it was checked.** Every file of the package that changes or is new is shown in full below, because a plan that says "implement the screen" is useless to an implementer with no memory of this conversation. The code blocks were pasted into this document **by a script from the files that were built and tested while writing it**, so they are the tested code and not a retyping of it. While writing this plan the whole redesigned package was built in a scratch directory **outside the repository** (a short path, `C:\mk`, on Windows, Node 20.20.2, npm 10.8.2, pnpm 10.34.2) and exercised there: `tsc --noEmit` clean, `vite build` clean, **316 tests in 28 files** passing three times in a row with no warnings, **87 hand-made mutations** of the code each caught by a test (every survivor of the first run was a weak test, which was strengthened until it caught the mutation; two were equivalent and were dropped, see Task 13), a clean-room `npm install` with no warnings followed by a build and the tests, and the running app looked at and measured in a real browser, headless Microsoft Edge 155 driven by `puppeteer-core` with device emulation (touch, 320, 390 and 800px, reduced motion): no sideways scroll on any screen at any width, **every control 44px or more** (the slider's touch zone included), **the knob concentric with the track to 0.0px** on both switches, on and off, at all three widths (and, before the fix, 6.0px high: the bug was reproduced, not assumed), a visible focus ring on every Tab stop of every screen, reduced motion switching off every transition and the scan's pulse, and the glyph's glow growing monotonically with the level. The measured numbers in Tasks 1, 14 and 15 come from those runs, and their scripts are in this plan so you can repeat them. The Code tab's JSON and PR D were prototyped in a **scratch copy of the whole repository** with the new package dropped in: the site's tests (183 before, **186 after**, in 30 files), `tsc`, `vite build`, the root scripts (`check:code-tab`, `check:license`, `check:templates-readme`, `check:template-builds`, `test:scripts`), `sync-templates` for all four real builds, the Templates page at 1440 and 390px, and the preview dialog in Edge with the new app (the frame, a device's page pushed inside the iframe, Back, adding a device through the scripted scan inside the dialog, Esc, the dialog's own close, no reload on tab switch). **Your run is the real one**, and what was not or could not be checked is listed in the Self-review: a real phone, WebKit and Firefox, a screen reader, the on-screen keyboard, the two persona interviews (they are run in Task 16, so the example copy in this plan is a placeholder and the examples that are on the site today are *stale*), real CI, the real deploy and `tiged` against the published repo. If a test and the code here disagree, the test is the intent. Do not rewrite the in-app copy (headings, device names, presets, messages) or the site copy: it is part of what the owner approved.

## Conventions for every task

- **Two pull requests.** PR C: Tasks 1-15 on branch `feat/mobile-app-redesign`: the package `packages/mobile-app`, the findings appended to the spec, and **one data file outside the package, `packages/site/src/content/codeTabs.json`** (`package.json` and the lockfile do not change because the dependencies do not). The Code tab's JSON is in PR C and not in PR D **because CI's `code-tab` job checks it on every pull request, and four of the first version's six excerpts no longer match the redesigned package** (checked while writing this plan; they are the reducer's header comment, the `ROUTES` tuple, the Add device test and the starting devices): a package-only PR C would be red. PR D: Tasks 16-19 on branch `feat/site-mobile-app-redesign`, started after PR C is merged: the tagline and copy, the screenshot, the two new examples and the live-site check. Between the two merges the live site shows the new app under the old tagline and the old examples, so open PR D as soon as PR C is merged. Neither PR merges itself; the owner merges. Before PR C: the docs PR that carries the spec amendment and this plan must be on `main` (the spec gets findings appended in Task 15), so start with `git checkout main && git pull`.
- Work in `packages/mobile-app` unless a step says otherwise. Run package tests as `npx vitest run <path>` from the package, or `pnpm --filter mobile-app-template test` from the repo root.
- **The package does not compile in the middle of PR C.** Tasks 3 to 9 delete the first version's screens, sheet and scenes and write their replacements one layer at a time, and the old `App.tsx` still imports what is going away until Task 10. So `npx tsc --noEmit` and the whole-package test run are expected to fail until Task 10; **in Tasks 3 to 9 run only the test files named in the task**. Each task commits when its own tests pass. From Task 10 on, `tsc` and every test must pass before every commit. (CI only looks at the head of the PR.)
- Commit with two `-m` flags, the second being exactly: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Conventional commit prefixes as in the log (`feat(mobile-app):`, `test(mobile-app):`, `fix(mobile-app):`, `docs:`, `feat(site):`, `fix(site):`).
- Pull request bodies end with the line `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. Both PRs say `Refs #48` (the issue is closed; the redesign refines what it asked for). The tracking issue #1 needs no new tick.
- `pnpm` is the package manager. No `workspace:` ranges, and nothing in `packages/mobile-app` imports outside its own folder. `npm install` is only ever run in a copy outside the repo (Task 13); never commit an npm `package-lock.json`.
- **Test first where a task has tests:** write the test files, run them and see them fail for the stated reason (the module they import does not exist yet, so Vitest says `Failed to resolve import`), write the implementation, see them pass.
- **Use the Write/Edit tools to create the files in this plan, not shell heredocs and not `node -e "..."` with template literals.** Several files contain backticks, `${…}`, backslashes and quotes that a shell silently changes. This happened again while writing this plan: a `` `${device.id}` `` inside a double-quoted `node -e` was expanded by the shell to nothing and a test file was quietly corrupted.
- Do not add a `CLAUDE.md`, a skill or any process file to `packages/mobile-app`: a forker would get dead weight (repo `CLAUDE.md`). Its documentation is its README and its code comments, which is why the comments in the code below are part of the deliverable: **the forker-facing comments the redesign adds** are on the `Connection` seam, the glow, the knob rule, the flat buttons, the reduced-motion block, the sentence-case rule, `useHashRoute`'s pushed screens, the `LinkRun` contract, and every mock boundary. Do not delete them as noise.
- **Windows and pitfalls the previous plan and this one hit.**
  - A Windows checkout here has CRLF working-copy line endings (`core.autocrlf=true`; git stores LF). The Edit tool copes; a script that matches multi-line text must normalise (the scripts in this plan do), and `check:code-tab` already does.
  - Run Vitest from the real path of the package: running it from a `subst` drive letter made Vite fail to find `src/test/setup.ts`. If you use a git worktree under `.claude/worktrees/`, its `node_modules` paths are long enough to hit "Filename too long" on removal: delete leftovers from File Explorer.
  - Start dev servers with `pnpm --filter mobile-app-template dev --port 5199 --strictPort`, so a port that is already taken fails loudly instead of quietly serving something else.
  - **Git Bash rewrites arguments.** `node script.mjs url '#/settings'` arrives as `#C:/Program Files/Git/settings`: set `MSYS_NO_PATHCONV=1` for the command, or pass hashes without the leading slash. And a Node script given `/c/mk/out` writes to `C:\c\mk\out` (it resolves against the current drive): pass `C:/mk/out`.
  - The `vitest` range is `^4.1.12` (npm 10 crashes on 4.1.11 or earlier); the hex test reads CSS from disk because `import.meta.glob(..., '?raw')` returns empty strings for CSS under Vitest; every `Toggle` needs an `id` (CyberUI#120).
  - **`userEvent` hangs under Vitest's fake timers**: Testing Library waits on a real timer between its steps and a fake clock never fires it. Tests on fake timers press with `fireEvent`. **happy-dom delivers `hashchange` on a real timer** too, so a test that clicks a navigation button and then advances a fake clock sees the new screen only sometimes (a flaky test, found while writing this plan): navigate on the real clock, `await` the new heading, then switch to fake timers only around the waits.
  - happy-dom computes the accessible name of a heading that ends in an inline `<span>` with a space before the span ("Living room : 3 of 3 on"); a browser does not. Tests normalise it.
  - **The library's Buttons draw their focus ring through a 300ms transition.** A script that reads a button's focus ring right after Tab reads a ring of 0px: switch transitions off in the page, or wait 350ms. (The first run of the keyboard check in this plan reported every library button as having no focus indicator for exactly this reason.)

## Global Constraints

- **Standalone.** `packages/mobile-app` installs and builds under plain `npm install` outside the monorepo (Task 13 proves it). `cyberui-2045` is `^2.8.0` from npm (never 2.7.x: responsive props have no effect above `base` before 2.8.0). **`vitest` is `^4.1.12`.** No `workspace:` range, no import outside the package, a complete `tsconfig.json` (not `extends`), `vite.config.ts` with `base: './'`, a `LICENSE` identical to the root one, `"license": "MIT"`. None of these files changes in this redesign.
- **Honest about what is mock.** There are no devices; nothing is discovered, paired, controlled, sent or saved. The app says so with **three signals and the README**: a "Demo" badge in the app bar, the sentence `Template demo: Kestrel is fictional and controls nothing.` in the Settings About block, and the line `This scan is scripted: nothing is discovered. It shows a fixed list.` on the Scan screen. No banner, no "(demo)" or "(simulated)" on buttons, no Reset button, no demo sentence in the notice after adding a device. Comments at each mock boundary (the reducer, `data/devices.ts`, `data/presets.ts`, `data/nearby.ts`, `connection/scripted.ts`, `AddDeviceScreen`'s code form and name step, the Settings switches) say so for a forker. Tests assert the badge, the Settings sentence, the Scan line, and that `fetch`, `navigator.bluetooth` and `Notification` are never touched; a static test fails if the source gains any network, Bluetooth, notification or storage call.
- **Colour only through tokens.** The accent is `src/theme/blue.css`, which sets `--color-secondary` and `--color-accent` together to `#5b9cff` and leaves `--color-primary` alone (the values do not change in this redesign; the comment is reworded). No hex colour literal anywhere else in `src/**/*.css`; no JSX `style` attribute anywhere, so everything that varies with a level (the halo's opacity and radius, the body's fill, a level bar's width) is an SVG **attribute**. Components read `var(--color-*)` only, never cyberui-2045's internal Tailwind class names.
- **Exhaustive by type.** Anything keyed by a union (`Route`, `DeviceKind`, `LinkState`, `LinkStep`, the reducer's `Action`) is a `Record<Union, …>` or a `switch` the compiler checks, never an `if/else` chain or a template string.
- **One `h1` per screen, headings in order, landmarks** (`header`, `main`, `nav`), a skip link, every control keyboard-operable and named. Every `Toggle` gets an `id` and an accessible name.
- **The principles are rules, not decoration.** No "Online" badge or status word anywhere on a healthy device; the glyph is the one bold thing; the numbers are tabular; every label is sentence case (no `text-transform: uppercase` in the stylesheet, and the library's uppercase buttons are set back); buttons are flat at rest; everything that moves is inside `prefers-reduced-motion: no-preference`, and under `reduce` every transition and animation under `.app` is 0s, the library's included.
- **The phone rules** (each is written down once in `App.css`, with its reason, and `phoneRules.test.ts` fails when one is deleted): touch targets of at least 44 by 44 CSS pixels for every control (Button and Input are already that at size `md`; Toggle, Slider and RadioGroup go through `TouchRow`; rows, chips, presets, nearby rows and the glyph button are sized in CSS); **the switch track is the knob's positioned ancestor**; `viewport-fit=cover` and `env(safe-area-inset-*)` on the app bar, bottom nav and the forms' button row; `min-height: 100vh` then `100dvh`; every `:hover` inside `@media (hover: hover)`; 16px form text; no sideways scroll at 320, 390 or 800px (only the room chips scroll sideways, inside their own row); one centred column (`max-width: 30rem`) with the same bottom nav at 800px and above. No swipe gestures; every action is a visible control.
- **No `location.hash` surprises.** The skip link calls `preventDefault` (an unknown hash falls back to Home). A pushed screen is left with Back when it was reached from inside the app and with a replace to its parent tab when it was opened directly (`useHashRoute`'s `leave`).
- **Forker-facing comments** (repo `CLAUDE.md`): the `ROUTES` tuple pattern and the `Record<Route, …>` maps, the `Action` union and the reducer as the mock backend, the `Connection` seam, the glow and why its lines are white, `TouchRow` and the knob rule, the safe-area/`dvh`/hover/motion rules in `App.css`, route-change and step-change focus, each mock boundary, the `within()` scoping note once per test file at its first collision, the theme file, and every library behaviour that is not obvious from its types (`Toggle` needs an `id`, draws no focus ring and positions its knob against the label; `Slider` sets no `touch-action` and fills toward magenta; `Input` errors are not announced and it forwards no ref; `Select`'s default variant glows magenta; the library's `Button` is uppercase, glows at rest and animates under reduced motion), each citing patrickkuei/CyberUI issue numbers (#120 to #134). Comment WHY, once, where a reader would be surprised; do not narrate.
- **No dependencies beyond what is there.** Any change to cyberui-2045's version is out of scope; anything found in it goes to patrickkuei/CyberUI as an issue (Task 15, filed only by the owner's say-so), never silently worked around: each workaround has a comment and an issue number, or a "not yet filed" in the README.
- Node `>=20.19`.

## Review Focus

The spec implies these; each has an owning task.

1. **The knob must sit inside its track, and a test cannot see it.** The 44px rule that fixed the switch's hit area is what broke its knob. `phoneRules.test.ts` keeps the rule; only a real-browser measurement of the knob against the track (from the CSS and from the pixels of a screenshot, on and off, at 320, 390 and 800px) sees the bug. Any other place where a wrapper or a `min-height` changes a library control's own layout needs the same look. Tasks 1, 11, 14.
2. **The glow is proportional, and legible.** Level 0 is dark (no halo at all), a lit glyph's halo grows brighter and wider with the level, the lines are white because `--color-default` is 2.45:1 on the brightest glow and a graphic needs 3:1, two glyphs on one screen never share a gradient id, and the halo's overflow on the device page is clipped so it can never make the page scroll sideways at 320px. Tasks 3, 6, 11, 14.
3. **Two sibling controls, never nested.** A row's glyph button and its link are siblings; a switch inside a link, or a link inside a button, is invalid and breaks both for assistive technology. Tasks 7, 8.
4. **Status only by exception.** No "Online" anywhere; a healthy device shows no mark, a low battery and a weak signal show one small amber mark that is also in words for assistive technology, a link that is down is a dashed row with the word "Lost" or "Offline". "Needs attention" is derived (weak or lost link, or low battery) and counted in one sentence. Tasks 3, 7, 8.
5. **Duplicate text breaks queries.** A room's name is a chip, a heading and a card; a device's name is a row link and a page title; "Turn off" is on every room (the buttons carry the room in their names); "Add device" is a button, a heading and a submit; "Add room" the same; "Home" is a tab and a heading. Scope with `within(...)` or query by role and name, never rename. Tasks 7 to 10.
6. **Timers.** The scan, the link and Reconnect run on timers: tests use fake timers and `fireEvent` (not `userEvent`), assert `vi.getTimerCount()` is 0 after a cancel or an unmount, and navigate on the real clock. The scripted connection clears its timer on abort. Tasks 4, 7, 9, 10.
7. **A scan starts only after a tap**, shows a progress bar, a pulse that exists only under `no-preference`, and the words "Scanning…" for everyone. Tasks 9, 11, 14.
8. **The `Connection` seam stays a seam.** Screens call only `scan()` and `link()` and draw what the callbacks report; an aborted link must not overwrite a newer one (a `LinkRun` whose id changes mid-link); the one scripted failure is the lost device so the failed state is visible. Tasks 4, 7.
9. **Rooms.** Names are required and unique ignoring case and spaces (the form shows it, the reducer enforces it); a room can be removed only when empty, with a plain message; removing the room Home is filtered to clears the filter; the chevron sets the filter and opens Home. Tasks 5, 8.
10. **Hash routes and Back.** `leave()` must not call `history.back()` when the page was opened at a pushed route (it would leave the app, or in the site's dialog undo the dialog opening) and must return Add room to Rooms, not Home; the skip link must not write the hash; a change of device inside `#/device/:id` is a route change (focus, title). Tasks 5, 10, 19.
11. **The notice.** It persists until Dismiss or until the person moves to another tab; it is always in the page so the live region exists before its text changes. Task 10.
12. **The library fights three principles and the stylesheet overrides it, with comments:** uppercase and resting glow on `Button`, magenta in the `Slider`'s fill, and transitions under reduced motion. Each override has a guard in `phoneRules.test.ts` and a measurement in Task 14. Tasks 11, 14.
13. **Touch targets.** Every control is 44px or more, measured, on every screen at 320 and 390px, and on every step of Add device; the slider's track band and thumb zone are widened with `::before` and measured from the computed offsets. Tasks 11, 14.
14. **Contrast.** Every text pair is 4.5:1 or better on base and surface (amber and red marks, accent values, muted counts); the one library failure is the `danger` Button (CyberUI#128); the lit glyph's lines are 3:1 or better. Tasks 11, 14.
15. **The README is true.** The Known limits for CyberUI#123, #124, #125 and #130 say the template no longer depends on `Drawer`; every cited number is the issue it claims (`gh issue view`); nothing mentions scenes, the sheet or a status badge. Tasks 12, 15.
16. **Not standalone:** a `workspace:` range, an import outside the package, an install that fails for a forker. Tasks 13 and, in CI, the `fork-install` job (already in the matrix).
17. **Dead code.** The first version's `DeviceSheet`, `StatusBadge`, `ScenesScreen`, `DevicesScreen`, `scenes.ts`, the `Drawer` comments and `DeviceStatus` are gone, and so is every import of them. Tasks 3 to 10, checked by `tsc` and by `grep` in Task 10.
18. **Code tab claims go stale.** Every excerpt is copied verbatim from the package by a script and `check:code-tab` verifies it in CI, which is why the JSON is in PR C: a package PR that leaves the first version's excerpts is red. Tasks 12, 15.
19. **The examples are the owner's rules, not ours.** Verbatim only, ellipses allowed, never invented; "Where they'd get stuck" lists only obstacles the library and the template did not cause; no remarks about the template or the demo; labels say "they"; if nothing qualifies, stop and report. The two published examples are stale and are replaced, not kept. Task 16.
20. **The screenshot must fit the site's window frame** (a 1440x900 landscape image; a portrait capture would be stretched), and must show the redesigned app, not the first one. Task 17.
21. **Published but not deployed:** the wiring (sync script, `deploy.yml`, README row) already exists, so the risk now is a stale artifact: the live preview serving a build that predates the redesign. Task 19.
22. **The preview dialog still works with the new routes.** The device page pushes `#/device/x` inside the iframe; Esc forwarding, the dialog's own Back and the phone frame must behave as they did. Task 19.

---

## PR C: the package

Branch: `git checkout main && git pull && git checkout -b feat/mobile-app-redesign`. The shipped package is the starting point: read it before changing it.

### Task 1: Reproduce the switch bug in the shipped app, and put the tools outside the repo

The owner's screenshot says the `Toggle`'s knob sits 6px too high and pokes out of the track. The fix is one CSS rule and a guard test, but the thing that proves the fix is a **measurement**, so this task makes the measurement fail on the shipped build first. If it passes there, you are not measuring what the owner saw: stop and report. It writes nothing in the repo.

**Files:** none in the repo (the scripts live in a folder outside it).

- [ ] **Step 1: Set up the tools outside the repo**

```bash
mkdir -p ~/mobile-app-checks && cd ~/mobile-app-checks && npm init -y && npm install puppeteer-core@24 pngjs@7
```

`puppeteer-core` drives a Chromium you already have: Microsoft Edge on Windows (`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`, the default in the scripts), Chrome on macOS or Linux (set the `CHROMIUM` environment variable to its path). `pngjs` reads screenshots so a script can look at real pixels. Write every script in this plan into `~/mobile-app-checks/` with the Write tool, not a shell heredoc. Note which browser and version you used: say so in the findings.

- [ ] **Step 2: Save the knob check**

The script measures every switch on a screen twice. From the CSS it works out where the knob (the track's `::after`, `position: absolute; top: 2px`) is drawn: against the nearest positioned ancestor of the track. From the pixels it takes a screenshot of the switch, finds the white knob and takes the middle of it. A switch passes only if both are within 1px of the middle of the track.

```js
// Measures, from real pixels, whether the knob of every Toggle is centred on its track.
// Usage: node knob-check.mjs <app url, no hash> <hash, e.g. #/settings> [width]
// For each switch it (1) computes where the knob (the label's ::after) is from the CSS,
// (2) takes a screenshot of the switch and finds the near-white knob pixels, and compares the knob's
// vertical centre with the track's. A difference over 1px fails.
import puppeteer from 'puppeteer-core';
import { PNG } from 'pngjs';

const [url = 'http://localhost:5199/', hash = '#/settings', widthArg = '390'] = process.argv.slice(2);
const exe = process.env.CHROMIUM ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const scale = 2;
await page.setViewport({ width: Number(widthArg), height: 844, deviceScaleFactor: scale, isMobile: true, hasTouch: true });
await page.goto(url + hash, { waitUntil: 'networkidle0' });
// No transitions while measuring: the knob slides for 150ms when a switch changes.
await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });

const switches = await page.evaluate(() =>
  [...document.querySelectorAll('input[type=checkbox]')].map((input) => {
    const track = input.nextElementSibling;
    // The knob is the track's ::after. Its containing block is the nearest positioned ancestor of the track, or the track itself if that is positioned.
    let knobHolder = track;
    while (knobHolder && getComputedStyle(knobHolder).position === 'static') knobHolder = knobHolder.parentElement;
    knobHolder ??= document.body;
    const knob = getComputedStyle(track, '::after');
    const cb = knobHolder.getBoundingClientRect();
    const t = track.getBoundingClientRect();
    scrollTo(0, 0);
    return {
      id: input.id, checked: input.checked,
      track: { x: t.x, y: t.y + scrollY, w: t.width, h: t.height },
      knobHolderIs: knobHolder === track ? 'track' : knobHolder.tagName.toLowerCase(),
      knobTopCss: knob.top, knobH: parseFloat(knob.height),
      knobCentreFromCss: cb.top + parseFloat(knob.top) + parseFloat(knob.height) / 2,
      trackCentre: t.top + t.height / 2,
    };
  }),
);

const out = [];
for (const s of switches) {
  const clip = { x: Math.max(0, s.track.x - 6), y: Math.max(0, s.track.y - 10), width: s.track.w + 12, height: s.track.h + 20 };
  const png = PNG.sync.read(await page.screenshot({ clip, type: 'png' }));
  let minY = 1e9, maxY = -1;
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
    const i = (y * png.width + x) * 4;
    if (png.data[i] > 235 && png.data[i + 1] > 235 && png.data[i + 2] > 235) { if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  const knobCentrePx = maxY < 0 ? null : clip.y + (minY + maxY + 1) / 2 / scale;
  const trackCentre = s.track.y + s.track.h / 2;
  out.push({
    id: s.id, checked: s.checked, knobHolder: s.knobHolderIs,
    trackCentre: +trackCentre.toFixed(1), knobCentreFromPixels: knobCentrePx === null ? 'no white pixels' : +knobCentrePx.toFixed(1),
    offsetPx: knobCentrePx === null ? null : +(knobCentrePx - trackCentre).toFixed(1),
    css: { knobCentreFromCss: +s.knobCentreFromCss.toFixed(1), trackCentre: +s.trackCentre.toFixed(1) },
    verdict: knobCentrePx !== null && Math.abs(knobCentrePx - trackCentre) <= 1 && Math.abs(s.knobCentreFromCss - s.trackCentre) <= 1 ? 'concentric' : 'NOT concentric',
  });
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
if (out.length === 0 || out.some((o) => o.verdict !== 'concentric')) process.exit(1);
```

- [ ] **Step 3: Run it against the shipped app**

```bash
pnpm install                                                 # from the repo root, once
pnpm --filter mobile-app-template dev --port 5199 --strictPort   # leave it running
cd ~/mobile-app-checks && MSYS_NO_PATHCONV=1 node knob-check.mjs http://localhost:5199/ '#/settings'
```

Expected: **it fails** (exit code 1), with the knob 6.0px above the middle of the track on both switches, measured two ways. This is what the owner saw (the numbers are from the run while writing this plan, headless Edge 155, a 390px touch viewport, device scale 2):

```text
[
 {
  "id": "setting-alert-offline",
  "checked": true,
  "knobHolder": "label",
  "trackCentre": 343.8,
  "knobCentreFromPixels": 337.8,
  "offsetPx": -6,
  "css": {
   "knobCentreFromCss": 337.8,
   "trackCentre": 343.8
  },
  "verdict": "NOT concentric"
 },
 {
  "id": "setting-remote-access",
  "checked": false,
  "knobHolder": "label",
  "trackCentre": 395.8,
  "knobCentreFromPixels": 389.8,
  "offsetPx": -6,
  "css": {
   "knobCentreFromCss": 389.8,
   "trackCentre": 395.8
  },
  "verdict": "NOT concentric"
 }
]
```

`knobHolder: "label"` is the cause, in one word: the knob is positioned against the `<label>`. The same run on `#/devices` (the shipped rows used the same switch) reports five switches at -6.0 too (the sixth, the disabled Hall light's, has no white knob to find, so the script reports it as not measurable and fails it).

- [ ] **Step 4: Understand it, so the fix is not a guess**

The library's `Toggle` renders `div > [label] + label.relative > input.sr-only.peer + div.track`, and gives the track `after:absolute after:top-[2px] after:left-[2px]` (read `node_modules/cyberui-2045/dist/components/Toggle.js`; Task 2's script checks both facts). The `<label>` is `relative`, the track is not, so the knob is placed against the label. The shipped `.touch-switch label { min-height: var(--touch) }` (the 44px hit area) stretched the label to 44px around a 32px track, so the knob's `top: 2px` is the label's top: (44 - 32) / 2 = 6px above where it belongs. Any consumer that sizes or pads that label meets this; the plan's **Task 15** records a bare-page reproduction, without this template's CSS at all, for the owner to decide whether to file it.

- [ ] **Step 5: Check the library's issue list for it, and note the answer**

```bash
gh issue list --repo patrickkuei/CyberUI --state all --search "knob"
gh issue list --repo patrickkuei/CyberUI --state all --search "Toggle"
```

When this plan was written the first printed nothing and the second showed #120 (no accessible name), #126 (no focus ring) and #133 (the touch-size request), none about the knob. **Do not file anything now.** Task 15 holds the "to file" item and the owner decides.

Nothing to commit in this task. Leave the dev server running for Task 3's comparison, or stop it.

### Task 2: Re-confirm the library facts the redesign relies on

The first version's plan confirmed its components against the published 2.8.0 (its Task 1). The redesign uses fewer of them and leans on different behaviours, so this task re-checks exactly those. It writes no code in the repo.

**Files:** none in the repo.

- [ ] **Step 1: Save the script and run it on the installed package**

It only reads files under `node_modules/cyberui-2045/`; it never runs anything from the package. It checks that every component, prop and prop value the redesign uses is in the typings, and prints the facts about the compiled components and the stylesheet that the template's comments and CSS depend on.

```js
// Usage: node check-props.mjs <path to cyberui-2045 inside node_modules, the folder that holds dist/>
// Confirms that every cyberui-2045 component, prop and prop value the REDESIGNED mobile-app template uses is in the
// published typings, and prints the facts about the compiled components and the stylesheet that the template's
// comments and CSS rely on. It only READS files; it never runs anything from the package. Keep it outside the repo.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const pkg = path.resolve(process.argv[2]);
const read = (...parts) => readFileSync(path.join(pkg, ...parts), 'utf8');
const problems = [];

const manifest = JSON.parse(read('dist', 'component-manifest.json'));
if (!/^2\.8\./.test(manifest.packageVersion)) problems.push(`package version is ${manifest.packageVersion}, not 2.8.x`);
const names = manifest.components.map((component) => component.name);

// The components the redesign uses. Drawer, Card, Divider and SectionTitle are NOT here any more: the redesign does not use them.
const USED = {
  Badge: { props: ['variant', 'size', 'shape', 'shadow', 'children'], values: ["'neutral'", "'rounded'"] },
  Button: { props: ['variant', 'size', 'children'], values: ["'secondary'", "'danger'"], html: ['type', 'onClick', 'disabled', 'aria-label', 'className'] },
  Input: { props: ['label', 'helperText', 'error', 'size', 'variant'], html: ['name', 'value', 'onChange', 'placeholder', 'maxLength'] },
  RadioGroup: { props: ['options', 'value', 'onValueChange', 'label', 'orientation', 'size'], values: ["'horizontal'"] },
  Select: { props: ['label', 'options', 'onValueChange', 'variant', 'size', 'placeholder', 'error'], values: ["'secondary'"], html: ['name', 'value'] },
  Slider: { props: ['variant', 'size', 'min', 'max', 'step', 'value', 'onValueChange', 'disabled', 'className', 'ariaLabel'], values: ["'accent'", "'lg'"] },
  Toggle: { props: ['label', 'variant', 'size', 'checked', 'onChange', 'className'], values: ["'accent'", "'lg'"], html: ['id', 'disabled', 'role', 'aria-label'] },
};

for (const [component, { props, values = [], html = [] }] of Object.entries(USED)) {
  if (!names.includes(component)) problems.push(`${component} is not in the manifest`);
  const types = read('dist', 'components', `${component}.d.ts`);
  for (const prop of props) {
    if (!new RegExp(`(^|\\s)${prop}\\??\\s*:`, 'm').test(types) && !new RegExp(`[{,]\\s*${prop}\\s*[,}]`).test(types)) problems.push(`${component}: no prop "${prop}" in ${component}.d.ts`);
  }
  for (const value of values) {
    const bare = value.slice(1, -1);
    if (!types.includes(`'${bare}'`) && !types.includes(`"${bare}"`)) problems.push(`${component}: "${bare}" does not appear in ${component}.d.ts`);
  }
  if (html.length > 0 && !/extends\s+(Omit<)?React\.(ButtonHTMLAttributes|InputHTMLAttributes|SelectHTMLAttributes|HTMLAttributes)/.test(types)) {
    problems.push(`${component}: expected its props to extend a React HTML attributes type (needed for ${html.join(', ')})`);
  }
}

// Behaviour that is not visible in the types, read from the compiled files. Each is something a comment or a CSS rule in the template depends on.
const toggle = read('dist', 'components', 'Toggle.js');
const slider = read('dist', 'components', 'Slider.js');
const button = read('dist', 'components', 'Button.js');
const radio = read('dist', 'components', 'RadioGroup.js');
const claims = [
  ['Toggle: the knob is the track\'s ::after, absolutely positioned at top-[2px]', toggle.includes('after:absolute') && toggle.includes('after:top-[2px]')],
  ['Toggle: the <label> around the switch is `relative` and the track (the div after the input) is not', /"relative inline-flex items-center"/.test(toggle) && !/"relative[^"]*peer"/.test(toggle)],
  ['Toggle: extra props spread onto the <input> and the visible label is tied by htmlFor={id}', toggle.includes('htmlFor') && toggle.includes('...')],
  ['Toggle: the track sizes are w-10/w-14/w-16 by h-5/h-7/h-8', /w-10 h-5/.test(toggle) && /w-14 h-7/.test(toggle) && /w-16 h-8/.test(toggle)],
  ['Slider: no touch-action, drags are pointer events', slider.includes('onPointerDown') && !/touch-action|touch-none/.test(slider)],
  ['Slider: the accent variant fills with a gradient to the primary colour (bg-gradient-to-r from-accent to-primary)', slider.includes('from-accent to-primary')],
  ['Button: bold, uppercase, wide-tracked, with a resting shadow and a 300ms transition', ['font-bold', 'uppercase', 'tracking-wider', 'shadow-primary', 'duration-300'].every((token) => button.includes(token))],
  ['Button: a 2px focus ring through focus-visible:ring-2 (so the ring is a transition target too)', button.includes('focus-visible:ring-2')],
  ['RadioGroup: draws its own focus ring on the svg after the input (peer-focus-visible:ring-2)', radio.includes('peer-focus-visible:ring-2')],
];
for (const [label, ok] of claims) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`);
  if (!ok) problems.push(label);
}

const css = read('dist', 'cyberui-2045.css');
const count = (needle) => css.split(needle).length - 1;
console.log('stylesheet: env( x%d, dvh x%d, svh x%d, touch-action x%d, "@media (hover:hover)" x%d', count('env('), count('dvh'), count('svh'), count('touch-action'), count('@media (hover:hover)'));
console.log('tokens: ' + ['white', 'muted', 'surface', 'base', 'inverse', 'warning', 'error'].map((name) => `--color-${name}:${(css.match(new RegExp(`--color-${name}:(#[0-9a-fA-F]+)`)) ?? [])[1]}`).join('  '));

if (problems.length > 0) {
  console.error('\nPROBLEMS:\n' + problems.join('\n'));
  process.exit(1);
}
console.log('\nprops check OK: every component, prop and value the redesign uses is in the 2.8.x typings');
```

```bash
node check-props.mjs <repo>/packages/mobile-app/node_modules/cyberui-2045
```

Expected, from the run while writing this plan (against 2.8.0, the version `^2.8.0` resolves to today):

```text
ok   Toggle: the knob is the track's ::after, absolutely positioned at top-[2px]
ok   Toggle: the <label> around the switch is `relative` and the track (the div after the input) is not
ok   Toggle: extra props spread onto the <input> and the visible label is tied by htmlFor={id}
ok   Toggle: the track sizes are w-10/w-14/w-16 by h-5/h-7/h-8
ok   Slider: no touch-action, drags are pointer events
ok   Slider: the accent variant fills with a gradient to the primary colour (bg-gradient-to-r from-accent to-primary)
ok   Button: bold, uppercase, wide-tracked, with a resting shadow and a 300ms transition
ok   Button: a 2px focus ring through focus-visible:ring-2 (so the ring is a transition target too)
ok   RadioGroup: draws its own focus ring on the svg after the input (peer-focus-visible:ring-2)
stylesheet: env( x0, dvh x0, svh x0, touch-action x0, "@media (hover:hover)" x5
tokens: --color-white:#fff  --color-muted:#9797b5  --color-surface:#2d2d44  --color-base:#1a1a2e  --color-inverse:#1a1a2e  --color-warning:#fa0  --color-error:#ff4f4f

props check OK: every component, prop and value the redesign uses is in the 2.8.x typings
```

If a line says `FAIL`, or the version is not 2.8.x, **stop and report**: later tasks use these names and behaviours. Do not invent a prop.

- [ ] **Step 2: What this changes from the first version's table**

| Component | Used by the redesign | What to know (the part that is not in the types) |
|---|---|---|
| `Button` | `variant` (`primary`, `secondary`, `danger`, `ghost`), `className`, `aria-label`, `disabled`, `type`, `onClick` | At size `md` it is 44px high for `primary` and 48px for the bordered variants (measured). It is **bold, uppercase and wide-tracked**, has a **resting shadow** in `--color-primary` (magenta for the primary variant, whatever the accent is), and **animates for 300ms** (`transition-all duration-300`), including the 2px focus ring: a script that reads the ring right after Tab reads 0px. App.css sets it back to sentence case, flat and, under reduced motion, still. `danger` is `--color-error` on `--color-surface`, 4.13:1 (CyberUI#128). |
| `Toggle` | `id`, `label`, `role="switch"`, `variant="accent"`, `size="lg"` (a 64x32 track), `checked`, `onChange(boolean)` | The DOM is `div > [label] + label.relative > input.sr-only.peer + div.track`; **the knob is the track's `::after`, positioned against the `<label>`** (Task 1). It draws no keyboard focus ring (CyberUI#126) and needs an `id` for its visible label to name it (CyberUI#120). |
| `Slider` | `ariaLabel`, `variant="accent"`, `size="lg"`, `min`, `max`, `step`, `value`, `onValueChange`, `className` | The DOM is `div(className) > [label row?] + div.track > div.fill + div[role=slider]`; with no `label` and no `showValue` the track is the first and only child. Track 12px, thumb 24px at `lg`. It sets no `touch-action` (CyberUI#127) and **its accent fill is a gradient that ends in magenta**. |
| `RadioGroup` | `label`, `orientation="horizontal"`, `options`, `value`, `onValueChange` | Options are `<label>` rows 20px high; it draws its own focus ring on the svg after the input. |
| `Input`, `Select` | as in the first version | `Input` takes no `ref` and does not announce a new error (CyberUI#121); `Select` is a native `<select>`, does not tie its `error` to the field (CyberUI#129) and glows magenta in its default variant. |
| `Badge` | the "Demo" label only (`variant="neutral"`, `size="sm"`, `shape="rounded"`, `shadow={false}`) | Not clickable here. |
| **Not used any more** | `Drawer`, `Card`, `Divider`, `SectionTitle` | The README's Known limits for CyberUI#123, #124, #125 and #130 (all `Drawer`) become a note for a forker who adds one. `Notification` and `TabNavigation` were never used. |

- [ ] **Step 3: Read the library facts that matter on a phone, again**

The stylesheet has no `env(`, `dvh`, `svh` or `touch-action` anywhere and five `@media (hover:hover)` blocks (the script prints the counts). Under `prefers-reduced-motion: reduce` the library still animates (Task 14 measures: Button 0.3s, Toggle track 0.3s and knob 0.15s, Slider 0.1 to 0.15s, RadioGroup 0.2s, Input 0.3s, Badge 0.15s); the redesign switches all of it off with one rule.

Nothing to commit in this task.

### Task 3: The data layer and the helpers

Delete what is going away, and write the types, the data and the pure helpers (a room's figures, the glow, the unit) with their tests. After this task the old screens, sheet and scenes are gone and **the package does not compile until Task 10**; run only the test files named in each task.

**Files:**
- Delete (`git rm`): `src/components/DeviceSheet.tsx`, `src/components/DeviceSheet.test.tsx`, `src/components/StatusBadge.tsx`, `src/components/StatusBadge.test.tsx`, `src/data/scenes.ts`, `src/data/scenes.test.ts`, `src/screens/DevicesScreen.tsx`, `src/screens/DevicesScreen.test.tsx`, `src/screens/ScenesScreen.tsx`, `src/screens/ScenesScreen.test.tsx`
- Replace: `src/data/types.ts`, `src/data/devices.ts`, `src/data/devices.test.ts`, `src/data/product.ts`, `src/utils/units.ts`, `src/utils/units.test.ts`, `src/utils/describeDevice.ts`, `src/utils/describeDevice.test.ts`
- Create: `src/data/presets.ts`, `src/data/nearby.ts`, `src/utils/summary.ts`, `src/utils/summary.test.ts`, `src/utils/glow.ts`, `src/utils/glow.test.ts`
- Unchanged: `src/data/settings.ts`, `src/test/setup.ts`, `src/main.tsx`

- [ ] **Step 1: Delete the first version's sheet, status badge, scenes and screens**

```bash
git rm src/components/DeviceSheet.tsx src/components/DeviceSheet.test.tsx src/components/StatusBadge.tsx src/components/StatusBadge.test.tsx src/data/scenes.ts src/data/scenes.test.ts src/screens/DevicesScreen.tsx src/screens/DevicesScreen.test.tsx src/screens/ScenesScreen.tsx src/screens/ScenesScreen.test.tsx
```

- [ ] **Step 2: Write the tests**

The data test is the contract for the starting data: at least one of every kind, a connected and a lost device, every reason to look at a device (lost, weak, low battery), lights at different levels and one that is off (so the glow differs without interaction), exactly one scripted failure and it is the lost device. The summary test covers every figure Home and Rooms print; the glow test covers every kind and the halo's three numbers; the unit test adds `formatDegrees` and `nudge`.

`src/data/devices.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { LINK_FAILURES, NEARBY } from './nearby';
import { STARTING_DEVICES, STARTING_ROOMS } from './devices';
import { DEVICE_KINDS, LINK_STATES } from './types';
import { KIND_LABELS } from './product';
import { attentionOf } from '../utils/summary';

describe('starting devices', () => {
  it('include every kind of device, so each one is visible without interaction', () => {
    expect(new Set(STARTING_DEVICES.map((device) => device.kind))).toEqual(new Set(DEVICE_KINDS));
  });

  it('include a connected device and a lost one, and every reason to look at a device', () => {
    expect(new Set(STARTING_DEVICES.map((device) => device.link))).toEqual(new Set(['connected', 'lost']));
    expect(LINK_STATES).toContain('offline'); // reached by pressing Disconnect, not present at the start
    const reasons = new Set(STARTING_DEVICES.flatMap(attentionOf));
    expect(reasons).toEqual(new Set(['lost', 'weak', 'battery']));
  });

  it('include lights that are at different levels and a light that is off, so the glow differs', () => {
    const lights = STARTING_DEVICES.flatMap((device) => (device.kind === 'light' ? [device] : []));
    expect(new Set(lights.filter((light) => light.on).map((light) => light.level)).size).toBeGreaterThanOrEqual(2);
    expect(lights.some((light) => !light.on)).toBe(true);
  });

  it('use distinct ids and distinct names, in rooms that exist', () => {
    expect(new Set(STARTING_DEVICES.map((device) => device.id)).size).toBe(STARTING_DEVICES.length);
    expect(new Set(STARTING_DEVICES.map((device) => device.name)).size).toBe(STARTING_DEVICES.length);
    const roomIds = STARTING_ROOMS.map((room) => room.id);
    for (const device of STARTING_DEVICES) expect(roomIds).toContain(device.roomId);
  });

  it('have rooms with distinct ids and names, and every room has a device to show', () => {
    expect(new Set(STARTING_ROOMS.map((room) => room.id)).size).toBe(STARTING_ROOMS.length);
    expect(new Set(STARTING_ROOMS.map((room) => room.name.toLowerCase())).size).toBe(STARTING_ROOMS.length);
    for (const room of STARTING_ROOMS) expect(STARTING_DEVICES.some((device) => device.roomId === room.id)).toBe(true);
  });

  it('keep the kind list and the kind labels in step, so a new kind needs a label', () => {
    expect(Object.keys(KIND_LABELS).sort()).toEqual([...DEVICE_KINDS].sort());
  });

  it('keep signals, latencies and temperatures in sane ranges', () => {
    for (const device of STARTING_DEVICES) {
      expect(device.signal).toBeGreaterThanOrEqual(0);
      expect(device.signal).toBeLessThanOrEqual(4);
      expect(device.latencyMs).toBeGreaterThan(0);
      if (device.kind === 'thermostat') expect([device.targetC, device.currentC].every((c) => c >= 5 && c <= 35)).toBe(true);
      if (device.kind === 'sensor') expect(device.readingC).toBeGreaterThanOrEqual(5);
    }
  });
});

describe('the scripted data', () => {
  it('fails exactly one link on purpose, and it is the lost device, so the failure is visible', () => {
    const failing = Object.keys(LINK_FAILURES);
    expect(failing).toHaveLength(1);
    const device = STARTING_DEVICES.find((candidate) => candidate.id === failing[0]);
    expect(device?.link).toBe('lost');
    expect(LINK_FAILURES[failing[0]!]?.message).toBe('No response from the hub');
  });

  it('lists nearby devices whose ids do not collide with the starting devices', () => {
    expect(NEARBY.length).toBeGreaterThanOrEqual(3);
    const taken = new Set(STARTING_DEVICES.map((device) => device.id));
    for (const nearby of NEARBY) expect(taken.has(nearby.id), nearby.id).toBe(false);
    expect(new Set(NEARBY.map((nearby) => nearby.id)).size).toBe(NEARBY.length);
  });
});
```

`src/utils/summary.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { STARTING_DEVICES, STARTING_ROOMS } from '../data/devices';
import type { Device } from '../data/types';
import { attentionOf, homeSummary, isOn, needsAttention, roomName, roomNameProblem, roomOnText, roomStats, wattsOf } from './summary';

const byId = (id: string): Device => STARTING_DEVICES.find((device) => device.id === id)!;
const with_ = (id: string, change: Record<string, unknown>): Device => ({ ...byId(id), ...change }) as Device;

describe('attentionOf', () => {
  it('is empty for a healthy device', () => {
    expect(attentionOf(byId('desk-lamp'))).toEqual([]);
    expect(needsAttention(byId('desk-lamp'))).toBe(false);
  });

  it('names a lost link, a disconnected one, a weak signal and a low battery', () => {
    expect(attentionOf(byId('hall-light'))).toEqual(['lost']);
    expect(attentionOf(with_('desk-lamp', { link: 'offline' }))).toEqual(['offline']);
    expect(attentionOf(byId('fan-plug'))).toEqual(['weak']);
    expect(attentionOf(byId('bedroom-sensor'))).toEqual(['battery']);
  });

  it('does not call a signal weak when the link is down: there is no signal to be weak', () => {
    expect(attentionOf(with_('fan-plug', { link: 'lost' }))).toEqual(['lost']);
  });

  it('counts a signal of one bar as weak and two as fine', () => {
    expect(attentionOf(with_('desk-lamp', { signal: 1 }))).toEqual(['weak']);
    expect(attentionOf(with_('desk-lamp', { signal: 2 }))).toEqual([]);
  });
});

describe('isOn and wattsOf', () => {
  it('counts a device as on only when it is switched on and reachable', () => {
    expect(isOn(byId('desk-lamp'))).toBe(true);
    expect(isOn(byId('bedside-lamp'))).toBe(false);
    expect(isOn(with_('desk-lamp', { link: 'lost' }))).toBe(false);
    expect(isOn(byId('living-sensor'))).toBe(false);
  });

  it('draws a plug at its wattage while it is on, and nothing while it is off', () => {
    expect(wattsOf(byId('tv-plug'))).toBe(85);
    expect(wattsOf(byId('fan-plug'))).toBe(0);
  });

  it('draws a light in proportion to its level, so dimming it lowers the figure', () => {
    expect(wattsOf(with_('desk-lamp', { level: 100 }))).toBe(10);
    expect(wattsOf(with_('desk-lamp', { level: 50 }))).toBe(5);
    expect(wattsOf(with_('desk-lamp', { level: 5 }))).toBe(1);
    expect(wattsOf(with_('desk-lamp', { on: false }))).toBe(0);
  });

  it('draws nothing for a thermostat, a sensor or a device that cannot be reached', () => {
    expect(wattsOf(byId('hall-thermostat'))).toBe(0);
    expect(wattsOf(byId('living-sensor'))).toBe(0);
    expect(wattsOf(with_('tv-plug', { link: 'offline' }))).toBe(0);
  });
});

describe('roomStats and roomOnText', () => {
  it('counts the devices, the ones that can be switched, the ones on and the watts', () => {
    expect(roomStats(STARTING_DEVICES, 'living-room')).toEqual({ devices: 4, switchable: 3, on: 3, watts: 4 + 7 + 85 });
    expect(roomStats(STARTING_DEVICES, 'bedroom')).toEqual({ devices: 3, switchable: 2, on: 0, watts: 0 });
    expect(roomStats(STARTING_DEVICES, 'hall')).toEqual({ devices: 2, switchable: 2, on: 1, watts: 0 });
  });

  it('derives the total from the devices: the same list gives the same figure and a changed one changes it', () => {
    const before = roomStats(STARTING_DEVICES, 'living-room').watts;
    const after = roomStats(
      STARTING_DEVICES.map((device) => (device.id === 'tv-plug' ? ({ ...device, on: false } as Device) : device)),
      'living-room',
    ).watts;
    expect(before - after).toBe(85);
  });

  it('says how many are on, and nothing for a room with nothing to switch', () => {
    expect(roomOnText({ devices: 4, switchable: 3, on: 2, watts: 0 })).toBe('2 of 3 on');
    expect(roomOnText({ devices: 1, switchable: 0, on: 0, watts: 0 })).toBe('');
  });

  it('has no devices for a room id that does not exist', () => {
    expect(roomStats(STARTING_DEVICES, 'nowhere')).toEqual({ devices: 0, switchable: 0, on: 0, watts: 0 });
  });
});

describe('homeSummary', () => {
  it('says how many are on and how many need attention', () => {
    expect(homeSummary(STARTING_DEVICES)).toBe('4 on, 3 need attention');
  });

  it('says "needs" for one', () => {
    const one = STARTING_DEVICES.filter((device) => device.id !== 'fan-plug' && device.id !== 'hall-light');
    expect(homeSummary(one)).toBe('4 on, 1 needs attention');
  });

  it('leaves attention out when there is none', () => {
    expect(homeSummary(STARTING_DEVICES.filter((device) => !needsAttention(device)))).toBe('4 on');
  });

  it('says when nothing is on', () => {
    expect(homeSummary([byId('bedside-lamp')])).toBe('Nothing is on');
    expect(homeSummary([byId('bedside-lamp'), byId('hall-light')])).toBe('Nothing is on, 1 needs attention');
  });
});

describe('roomName and roomNameProblem', () => {
  it('finds a room by id', () => {
    expect(roomName(STARTING_ROOMS, 'hall')).toBe('Hall');
    expect(roomName(STARTING_ROOMS, 'nowhere')).toBe('');
  });

  it('requires a name, ignoring spaces', () => {
    expect(roomNameProblem('', STARTING_ROOMS)).toBe('required');
    expect(roomNameProblem('   ', STARTING_ROOMS)).toBe('required');
  });

  it('refuses a name that is taken, ignoring case and surrounding space', () => {
    expect(roomNameProblem('hall', STARTING_ROOMS)).toBe('duplicate');
    expect(roomNameProblem('  LIVING ROOM ', STARTING_ROOMS)).toBe('duplicate');
  });

  it('accepts a new name', () => {
    expect(roomNameProblem('Kitchen', STARTING_ROOMS)).toBeNull();
  });
});
```

`src/utils/glow.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { STARTING_DEVICES } from '../data/devices';
import type { Device } from '../data/types';
import { TARGET_C } from './units';
import { bodyOpacity, glowLevel, haloOpacity, haloRadius } from './glow';

const byId = (id: string): Device => STARTING_DEVICES.find((device) => device.id === id)!;
const with_ = (id: string, change: Record<string, unknown>): Device => ({ ...byId(id), ...change }) as Device;

describe('glowLevel', () => {
  it('lights a light in proportion to its level while it is on, and not at all while it is off', () => {
    expect(glowLevel(with_('desk-lamp', { level: 70 }))).toBe(70);
    expect(glowLevel(with_('desk-lamp', { level: 20 }))).toBe(20);
    expect(glowLevel(with_('desk-lamp', { on: false }))).toBe(0);
  });

  it('lights a plug at one fixed brightness while it is on', () => {
    expect(glowLevel(byId('tv-plug'))).toBe(70);
    expect(glowLevel(byId('fan-plug'))).toBe(0);
  });

  it('lights a thermostat from cool to warm across its range, and not at all while it is off', () => {
    const cool = glowLevel(with_('hall-thermostat', { targetC: TARGET_C.min }));
    const warm = glowLevel(with_('hall-thermostat', { targetC: TARGET_C.max }));
    expect(cool).toBe(20);
    expect(warm).toBe(100);
    expect(glowLevel(byId('hall-thermostat'))).toBeGreaterThan(cool);
    expect(glowLevel(byId('hall-thermostat'))).toBeLessThan(warm);
    expect(glowLevel(with_('hall-thermostat', { on: false }))).toBe(0);
  });

  it('keeps a sensor faintly lit while it is reachable', () => {
    expect(glowLevel(byId('living-sensor'))).toBe(35);
  });

  it('puts out anything whose link is down, whatever it was doing', () => {
    for (const link of ['lost', 'offline']) {
      for (const id of ['desk-lamp', 'tv-plug', 'hall-thermostat', 'living-sensor']) expect(glowLevel(with_(id, { link })), `${id} ${link}`).toBe(0);
    }
  });
});

describe('the halo drawn for a level', () => {
  it('is absent at 0 and grows brighter and wider with the level', () => {
    expect(haloOpacity(0)).toBe(0);
    expect(haloRadius(0)).toBe(0);
    expect(bodyOpacity(0)).toBe(0);
    const levels = [5, 25, 50, 75, 100];
    for (const draw of [haloOpacity, haloRadius, bodyOpacity]) {
      const values = levels.map(draw);
      expect(values, draw.name).toEqual([...values].sort((a, b) => a - b));
      expect(new Set(values).size, draw.name).toBe(values.length);
    }
  });

  it('never makes a lit glyph invisible: the lowest level still has a halo', () => {
    expect(haloOpacity(5)).toBeGreaterThanOrEqual(0.15);
    expect(haloRadius(5)).toBeGreaterThan(14);
  });

  it('stays inside what the drawing allows at full level', () => {
    expect(haloOpacity(100)).toBe(1);
    expect(haloRadius(100)).toBe(48);
    expect(bodyOpacity(100)).toBeLessThanOrEqual(0.5);
  });
});
```

`src/utils/units.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { TARGET_C, formatDegrees, formatTemp, fromDisplay, nudge, sliderScale, toDisplay } from './units';

describe('units', () => {
  it('converts Celsius to Fahrenheit for display', () => {
    expect(toDisplay(0, 'F')).toBe(32);
    expect(toDisplay(21, 'F')).toBeCloseTo(69.8);
    expect(toDisplay(21, 'C')).toBe(21);
  });

  it('formats half degrees in Celsius and whole degrees in Fahrenheit', () => {
    expect(formatTemp(21, 'C')).toBe('21 °C');
    expect(formatTemp(19.5, 'C')).toBe('19.5 °C');
    expect(formatTemp(21, 'F')).toBe('70 °F');
    expect(formatTemp(19.5, 'F')).toBe('67 °F');
  });

  it('formats the big numerals as the number and a degree sign, in either unit', () => {
    expect(formatDegrees(21, 'C')).toBe('21°');
    expect(formatDegrees(19.5, 'C')).toBe('19.5°');
    expect(formatDegrees(21, 'F')).toBe('70°');
  });

  it('scales the slider to the same range in either unit', () => {
    expect(sliderScale('C')).toEqual({ min: 10, max: 30, step: 0.5 });
    expect(sliderScale('F')).toEqual({ min: 50, max: 86, step: 1 });
  });

  it('snaps a picked value to half a degree Celsius, inside the allowed range', () => {
    expect(fromDisplay(21.3, 'C')).toBe(21.5);
    expect(fromDisplay(5, 'C')).toBe(TARGET_C.min);
    expect(fromDisplay(99, 'C')).toBe(TARGET_C.max);
    expect(fromDisplay(70, 'F')).toBe(21);
  });

  it('gives back the same whole Fahrenheit degree after storing it as Celsius, for every degree on the slider', () => {
    const { min, max } = sliderScale('F');
    for (let fahrenheit = min; fahrenheit <= max; fahrenheit++) {
      const stored = fromDisplay(fahrenheit, 'F');
      expect(Math.round(toDisplay(stored, 'F')), `${fahrenheit} °F`).toBe(fahrenheit);
    }
  });

  describe('nudge, one press of plus or minus', () => {
    it('moves half a degree in Celsius', () => {
      expect(nudge(20, 1, 'C')).toBe(20.5);
      expect(nudge(20, -1, 'C')).toBe(19.5);
    });

    it('moves a whole degree in Fahrenheit, so the shown number changes by exactly one', () => {
      expect(Math.round(toDisplay(nudge(20, 1, 'F'), 'F'))).toBe(69);
      expect(Math.round(toDisplay(nudge(20, -1, 'F'), 'F'))).toBe(67);
    });

    it('stops at the ends of the range', () => {
      expect(nudge(TARGET_C.max, 1, 'C')).toBe(TARGET_C.max);
      expect(nudge(TARGET_C.min, -1, 'C')).toBe(TARGET_C.min);
    });
  });
});
```

`src/utils/describeDevice.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { STARTING_DEVICES } from '../data/devices';
import type { Device } from '../data/types';
import { describeDevice } from './describeDevice';

const byId = (id: string): Device => STARTING_DEVICES.find((device) => device.id === id)!;
const with_ = (id: string, change: Record<string, unknown>): Device => ({ ...byId(id), ...change }) as Device;

describe('describeDevice', () => {
  it('shows a light as its level when on and Off when off', () => {
    expect(describeDevice(byId('desk-lamp'), 'C')).toBe('70%');
    expect(describeDevice(byId('bedside-lamp'), 'C')).toBe('Off');
  });

  it('shows a plug as On or Off', () => {
    expect(describeDevice(byId('tv-plug'), 'C')).toBe('On');
    expect(describeDevice(byId('fan-plug'), 'C')).toBe('Off');
  });

  it('shows a thermostat target as degrees in the chosen unit, and Off when it is off', () => {
    expect(describeDevice(byId('hall-thermostat'), 'C')).toBe('20°');
    expect(describeDevice(byId('hall-thermostat'), 'F')).toBe('68°');
    expect(describeDevice(with_('hall-thermostat', { on: false }), 'C')).toBe('Off');
  });

  it('shows a sensor as its reading in the chosen unit', () => {
    expect(describeDevice(byId('living-sensor'), 'C')).toBe('21.5°');
    expect(describeDevice(byId('living-sensor'), 'F')).toBe('71°');
  });

  it('shows the word for a link that is down instead of a state it may no longer be in', () => {
    expect(describeDevice(byId('hall-light'), 'C')).toBe('Lost');
    expect(describeDevice(with_('desk-lamp', { link: 'offline' }), 'C')).toBe('Offline');
    expect(describeDevice(with_('living-sensor', { link: 'lost' }), 'C')).toBe('Lost');
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

Run (from `packages/mobile-app`): `npx vitest run src/data/devices.test.ts src/utils`
Expected: FAIL (`Failed to resolve import` for `./summary`, `./glow`, `./nearby` and the others that do not exist yet).

- [ ] **Step 4: Write the types and the data**

`src/data/types.ts`, the shapes everything else is typed against. A device is `DeviceBase & KindFields[kind]`, so a kind cannot exist without its fields, and everything keyed by a kind (the drawings, the labels) is a compile error until a new kind is handled. `link` is `connected`, `lost` or `offline`; `signal` is 0 to 4 and is kept while the link is down so a successful Reconnect brings it back; `watts` is invented and a room's total is derived from it, never stored.

```ts
// The shapes everything else is typed against. No behaviour lives here.

/** A room. The id is what devices point at, so renaming a room never touches a device. */
export interface Room {
  id: string;
  name: string;
}

export type TemperatureUnit = 'C' | 'F';

/**
 * How a device is reached. 'lost' is a link that dropped by itself and
 * 'offline' is one the person disconnected on purpose; both mean the controls
 * are unavailable until Reconnect works. Nothing in the app detects or changes
 * this by itself: it is fixed in the starting data until someone presses
 * Disconnect or Reconnect (and both are mock, see state/reducer.ts).
 */
export const LINK_STATES = ['connected', 'lost', 'offline'] as const;
export type LinkState = (typeof LINK_STATES)[number];

/** Signal is drawn as this many bars, so a device's `signal` runs from 0 to SIGNAL_BARS. */
export const SIGNAL_BARS = 4;

interface DeviceBase {
  id: string;
  name: string;
  roomId: string;
  link: LinkState;
  /** 0 to SIGNAL_BARS. Kept while the link is down so a successful Reconnect brings it back. */
  signal: number;
  /** Round-trip time in milliseconds. Invented. */
  latencyMs: number;
}

/**
 * What each kind of device carries besides the fields every device has.
 * DeviceKind and Device are both derived from this one interface, so a kind
 * cannot exist without its fields, and a Record<DeviceKind, ...> elsewhere
 * (drawings, labels) is a compile error until a new kind is handled in every
 * one of them.
 *
 * Temperatures are always degrees Celsius. units.ts converts for display.
 * `watts` is an invented draw while the device is on: nothing measures
 * anything, and a room's total is derived from it (utils/summary.ts), never
 * stored.
 */
interface KindFields {
  light: { on: boolean; level: number; watts: number };
  plug: { on: boolean; watts: number };
  thermostat: { on: boolean; targetC: number; currentC: number };
  /** Sensors have no power control: they only report. */
  sensor: { readingC: number; batteryLow: boolean };
}

export type DeviceKind = keyof KindFields;
export type Device = { [K in DeviceKind]: DeviceBase & { kind: K } & KindFields[K] }[DeviceKind];

/** The kinds, in the order the manual Add device form lists them. */
export const DEVICE_KINDS: readonly DeviceKind[] = ['light', 'plug', 'thermostat', 'sensor'];

/** A device the person has linked and named. The pairing code is checked and then dropped. */
export interface DeviceDraft {
  /** Set when the device came from the scan (its nearby id); otherwise the reducer numbers it. */
  id?: string;
  name: string;
  roomId: string;
  kind: DeviceKind;
  signal?: number;
}

/** A device the scripted scan "finds". See data/nearby.ts. */
export interface NearbyDevice {
  id: string;
  name: string;
  kind: DeviceKind;
  signal: number;
}

export interface Settings {
  unit: TemperatureUnit;
  /** MOCK: stored in memory only. Nothing is ever scheduled, requested or shown. */
  alertOffline: boolean;
  /** MOCK: stored in memory only. There is no remote access. */
  remoteAccess: boolean;
}
```

`src/data/devices.ts`. The starting data has to show every state without a tap: three lights at different levels, one off, a plug, a thermostat, two sensors (one with a low battery), a plug with a weak signal and one device that is lost. The Hall light is the lost one, and its reconnect is the one scripted to fail.

```ts
import type { Device, Room } from './types';

/** What a light's level allows, in percent. The reducer clamps to the same range. */
export const LEVEL = { min: 5, max: 100, step: 5 } as const;

// MOCK: these rooms and devices do not exist. Switching one, moving a slider or
// pressing a preset changes this in-memory list and nothing else; no message
// is sent to anything, and a reload puts the list back as it is here
// (state/reducer.ts). The link (connected, lost, offline), the signal, the
// latency, the battery and the wattage are fixed here, not measured: a device
// never drops by itself. Names are generic on purpose. Replace the lists with
// whatever your hub or backend returns; keep at least one of every kind and
// one device that is lost, weak and low on battery while you work so each state
// is visible without interaction (devices.test.ts checks that).
export const STARTING_ROOMS: Room[] = [
  { id: 'living-room', name: 'Living room' },
  { id: 'bedroom', name: 'Bedroom' },
  { id: 'hall', name: 'Hall' },
];

export const STARTING_DEVICES: Device[] = [
  { id: 'floor-lamp', name: 'Floor lamp', roomId: 'living-room', kind: 'light', link: 'connected', signal: 4, latencyMs: 14, on: true, level: 35, watts: 12 },
  { id: 'desk-lamp', name: 'Desk lamp', roomId: 'living-room', kind: 'light', link: 'connected', signal: 4, latencyMs: 12, on: true, level: 70, watts: 10 },
  { id: 'tv-plug', name: 'TV plug', roomId: 'living-room', kind: 'plug', link: 'connected', signal: 3, latencyMs: 22, on: true, watts: 85 },
  { id: 'living-sensor', name: 'Living room sensor', roomId: 'living-room', kind: 'sensor', link: 'connected', signal: 3, latencyMs: 31, readingC: 21.5, batteryLow: false },
  { id: 'bedside-lamp', name: 'Bedside lamp', roomId: 'bedroom', kind: 'light', link: 'connected', signal: 4, latencyMs: 16, on: false, level: 40, watts: 8 },
  { id: 'fan-plug', name: 'Fan plug', roomId: 'bedroom', kind: 'plug', link: 'connected', signal: 1, latencyMs: 96, on: false, watts: 35 },
  { id: 'bedroom-sensor', name: 'Bedroom sensor', roomId: 'bedroom', kind: 'sensor', link: 'connected', signal: 2, latencyMs: 44, readingC: 19, batteryLow: true },
  { id: 'hall-thermostat', name: 'Hall thermostat', roomId: 'hall', kind: 'thermostat', link: 'connected', signal: 4, latencyMs: 18, on: true, targetC: 20, currentC: 19.5 },
  { id: 'hall-light', name: 'Hall light', roomId: 'hall', kind: 'light', link: 'lost', signal: 2, latencyMs: 60, on: false, level: 50, watts: 9 },
];
```

`src/data/presets.ts`:

```ts
// Fixed one-tap presets for the two kinds of device that have a level to set.
// They are data, not settings: nothing lets the person edit them, and a preset
// only ever changes the device whose page it is on (state/reducer.ts,
// 'device/preset'). MOCK, like everything that changes a device here.

export interface LightPreset {
  id: string;
  label: string;
  /** Percent. A light preset also turns the light on: pressing "Night" on a light that is off lights it. */
  level: number;
}

export interface ThermostatPreset {
  id: string;
  label: string;
  on: boolean;
  /** Degrees Celsius. Left out where the preset only switches the thermostat off (the target is kept). */
  targetC?: number;
}

export const LIGHT_PRESETS: readonly LightPreset[] = [
  { id: 'reading', label: 'Reading', level: 80 },
  { id: 'movie', label: 'Movie', level: 25 },
  { id: 'night', label: 'Night', level: 5 },
];

export const THERMOSTAT_PRESETS: readonly ThermostatPreset[] = [
  { id: 'heat', label: 'Heat', on: true, targetC: 22 },
  { id: 'eco', label: 'Eco', on: true, targetC: 18 },
  { id: 'off', label: 'Off', on: false },
];
```

`src/data/nearby.ts`. `LINK_FAILURES` is where "exactly one device fails, on purpose" lives. The type-only import of `LinkStep` is erased at build time, so this file is usable before Task 4.

```ts
import type { LinkStep } from '../connection/types';
import type { NearbyDevice } from './types';

// MOCK: nothing is discovered. This is the fixed list the scripted scan
// (connection/scripted.ts) hands back after its progress bar, in this order.
// Each id doubles as the new device's id once it is added, so a device that is
// already in the list is left out of the next scan. Replace it by writing a
// real Connection (connection/types.ts).
export const NEARBY: readonly NearbyDevice[] = [
  { id: 'shelf-lamp', name: 'Shelf lamp', kind: 'light', signal: 4 },
  { id: 'kettle-plug', name: 'Kettle plug', kind: 'plug', signal: 3 },
  { id: 'porch-thermostat', name: 'Porch thermostat', kind: 'thermostat', signal: 2 },
  { id: 'garage-sensor', name: 'Garage sensor', kind: 'sensor', signal: 1 },
];

/**
 * Which devices the scripted link refuses, and where. ONE device is scripted to
 * fail on purpose, so the failure state (the step that failed, the message, a
 * Try again button) is visible without anyone breaking anything. It is the
 * Hall light, which is also the one lost device in the starting data: press
 * Reconnect on its page. Every other device links.
 */
export const LINK_FAILURES: Readonly<Record<string, { step: LinkStep; message: string }>> = {
  'hall-light': { step: 'securing', message: 'No response from the hub' },
};
```

`src/data/product.ts`, the app's own words. Every screen reads its copy from here, so "swap Kestrel for your product" is a data edit. (`product.test.ts` is written in Task 5, when the router and the connection exist.)

```ts
// The app's own words, apart from the devices and presets. Everything here is
// fiction: Kestrel is not a real product, and nothing it shows is connected to
// anything. "Swap Kestrel for your product" is a data edit, not a hunt through JSX.
import type { Route } from '../router/useHashRoute';
import type { DeviceKind, LinkState } from './types';
import type { LinkStep } from '../connection/types';

export const PRODUCT_NAME = 'Kestrel';

/** The app bar's small label. The full sentence is DEMO_NOTE. */
export const DEMO_BADGE = 'Demo';

/**
 * The app says what is mock in three places and the README: the badge in the
 * app bar, this sentence in Settings, and a line on the Scan screen
 * (CONNECT_COPY.scripted). Delete them, and the mock parts they describe, when you
 * make the app real.
 */
export const DEMO_NOTE = `Template demo: ${PRODUCT_NAME} is fictional and controls nothing.`;

/**
 * Record<Route, ...>: a route without a title is a compile error. The title is
 * the document title and, for the three tabs, the bottom nav label and the
 * screen's <h1>. The device page's <h1> is the device's own name instead.
 */
export const ROUTE_TITLES: Record<Route, string> = {
  devices: 'Home',
  device: 'Device',
  rooms: 'Rooms',
  settings: 'Settings',
  add: 'Add device',
  'add-room': 'Add room',
};

export const KIND_LABELS: Record<DeviceKind, string> = {
  light: 'Light',
  plug: 'Plug',
  thermostat: 'Thermostat',
  sensor: 'Sensor',
};

/** What a row and a device page say instead of a value when the device cannot be reached. */
export const LINK_WORDS: Record<Exclude<LinkState, 'connected'>, string> = {
  lost: 'Lost',
  offline: 'Offline',
};

export const HOME_COPY = {
  filterLabel: 'Show devices in',
  all: 'All',
  turnOffRoom: 'Turn off',
  add: 'Add device',
  empty: 'No devices yet. Add one to get started.',
  emptyFilter: 'Nothing in this room yet.',
} as const;

export const DEVICE_COPY = {
  turnOn: 'Turn on',
  turnOff: 'Turn off',
  lightPresets: 'Scenes',
  thermostatPresets: 'Modes',
  lightLevel: 'Brightness',
  target: 'Target temperature',
  now: 'Now',
  sensorNote: 'Nothing to control here: this sensor only reports.',
  linkTitle: 'Link',
  disconnect: 'Disconnect',
  reconnect: 'Reconnect',
  remove: 'Remove device',
  notFound: 'That device is not here any more.',
  notFoundBack: 'Back to Home',
  batteryLow: 'Battery is low.',
} as const;

export const ROOMS_COPY = {
  add: 'Add room',
  turnOff: 'Turn off',
  remove: 'Remove room',
  open: 'Show devices',
} as const;

export const ADD_ROOM = {
  nameLabel: 'Room name',
  namePlaceholder: 'Kitchen',
  save: 'Add room',
  cancel: 'Cancel',
  maxLength: 24,
  errors: {
    required: 'Enter a name for the room.',
    duplicate: 'There is already a room with that name.',
  },
} as const;

export const CONNECT_COPY = {
  scanTitle: 'Find a device nearby',
  scanIntro: 'Put the device in pairing mode, then scan.',
  scanStart: 'Start scan',
  // The one place the Scan screen says what is mock (README: "Honest about what is mock").
  scripted: 'This scan is scripted: nothing is discovered. It shows a fixed list.',
  scanning: 'Scanning…',
  stopScan: 'Cancel',
  scanAgain: 'Scan again',
  found: (count: number) => (count === 1 ? '1 device nearby' : `${count} devices nearby`),
  noneLeft: 'Everything the scan can find is already added.',
  enterCode: 'Enter a code instead',
  codeTitle: 'Enter the pairing code',
  codeLabel: 'Pairing code',
  codeHelp: '6 letters or numbers.',
  codeError: 'Enter the 6-character pairing code: letters and numbers only.',
  codeSubmit: 'Link device',
  backToScan: 'Back to scan',
  linkTitle: 'Linking',
  linkFailed: 'The link failed',
  tryAgain: 'Try again',
  cancel: 'Cancel',
  detailsTitle: 'Name the device',
  nameLabel: 'Device name',
  nameError: 'Enter a name for the device.',
  nameMaxLength: 30,
  roomLabel: 'Room',
  kindLabel: 'Type',
  save: 'Add device',
  codeLength: 6,
} as const;

export const LINK_STEP_LABELS: Record<LinkStep, string> = {
  found: 'Device found',
  pairing: 'Pairing code accepted',
  securing: 'Securing the link',
  ready: 'Ready',
};

export const SETTINGS_COPY = {
  temperatureTitle: 'Temperature',
  unitLabel: 'Temperature unit',
  alertsTitle: 'Alerts and access',
  alertOffline: 'Alert me when a device goes offline',
  remoteAccess: 'Remote access',
  aboutTitle: 'About',
  version: `${PRODUCT_NAME} 1.0, a template`,
} as const;
```

- [ ] **Step 5: Write the helpers**

`src/utils/units.ts`: temperatures are stored in °C, and `formatDegrees` ("19.5°") is the big numeral while `formatTemp` ("19.5 °C") is for labels and speech. `nudge` is one press of plus or minus, in the displayed unit.

```ts
import type { TemperatureUnit } from '../data/types';

// Temperatures are stored in degrees Celsius, always. The unit setting only
// changes how they are shown and how the target slider and the plus and minus
// buttons are scaled, so switching unit never loses precision and the state
// never holds two truths.

/** The thermostat's allowed target, in Celsius, and the step the stored value snaps to. */
export const TARGET_C = { min: 10, max: 30, step: 0.5 } as const;

export function toDisplay(celsius: number, unit: TemperatureUnit): number {
  return unit === 'C' ? celsius : (celsius * 9) / 5 + 32;
}

/** "21 °C", "19.5 °C", "70 °F": Celsius keeps its half degrees, Fahrenheit is whole degrees. For labels and speech. */
export function formatTemp(celsius: number, unit: TemperatureUnit): string {
  if (unit === 'F') return `${Math.round(toDisplay(celsius, 'F'))} °F`;
  return `${Number.isInteger(celsius) ? celsius : celsius.toFixed(1)} °C`;
}

/** "21°", "19.5°", "70°": the number and a degree sign, for the big numerals. The unit is in Settings and in the accessible name. */
export function formatDegrees(celsius: number, unit: TemperatureUnit): string {
  return formatTemp(celsius, unit).replace(/ °[CF]$/, '°');
}

/** The slider's scale in the unit being shown: the same range as TARGET_C, in whole degrees for Fahrenheit. */
export function sliderScale(unit: TemperatureUnit): { min: number; max: number; step: number } {
  return unit === 'C'
    ? { ...TARGET_C }
    : { min: toDisplay(TARGET_C.min, 'F'), max: toDisplay(TARGET_C.max, 'F'), step: 1 };
}

/**
 * Turns a value in the displayed unit back into the stored Celsius, snapped to
 * TARGET_C.step. A whole Fahrenheit degree is 0.56 °C, so snapping to half a
 * degree moves the value by at most 0.25 °C (0.45 °F): converting it back and
 * rounding to a whole degree returns the number that was picked
 * (units.test.ts checks every one).
 */
export function fromDisplay(value: number, unit: TemperatureUnit): number {
  const celsius = unit === 'C' ? value : ((value - 32) * 5) / 9;
  const snapped = Math.round(celsius / TARGET_C.step) * TARGET_C.step;
  return Math.min(TARGET_C.max, Math.max(TARGET_C.min, snapped));
}

/** One plus or minus press, in the displayed unit: half a degree Celsius, a whole degree Fahrenheit. */
export function nudge(celsius: number, direction: 1 | -1, unit: TemperatureUnit): number {
  const shown = Math.round(toDisplay(celsius, unit) / sliderScale(unit).step) * sliderScale(unit).step;
  return fromDisplay(shown + direction * sliderScale(unit).step, unit);
}
```

`src/utils/summary.ts` is the one place that decides what is on, what needs attention, what a room draws and what the sentence at the top of Home says. Nothing it returns is stored.

```ts
import type { Device, Room } from '../data/types';

// What the app says about a set of devices, derived from the devices themselves
// and never stored: a total kept in state is a total that can disagree with the
// devices it sums. Everything here is a pure function of the device list, so
// Home, Rooms and the device page cannot drift apart.

export type Attention = 'lost' | 'offline' | 'weak' | 'battery';

/** A signal of this many bars or fewer counts as weak. */
export const WEAK_SIGNAL = 1;

export const isReachable = (device: Device): boolean => device.link === 'connected';

/** Lights, plugs and thermostats have a power state; sensors only report. */
export type Switchable = Exclude<Device, { kind: 'sensor' }>;
export const isSwitchable = (device: Device): device is Switchable => device.kind !== 'sensor';

/** On means switched on and reachable. A device whose link is down has no state we can trust, so it is not counted as on. */
export const isOn = (device: Device): boolean => isSwitchable(device) && isReachable(device) && device.on;

/** Why a device needs a look, in the order a person should read them. Empty when nothing is wrong. */
export function attentionOf(device: Device): Attention[] {
  const reasons: Attention[] = [];
  if (device.link === 'lost') reasons.push('lost');
  if (device.link === 'offline') reasons.push('offline');
  if (isReachable(device) && device.signal <= WEAK_SIGNAL) reasons.push('weak');
  if (device.kind === 'sensor' && device.batteryLow) reasons.push('battery');
  return reasons;
}

export const needsAttention = (device: Device): boolean => attentionOf(device).length > 0;

/**
 * The invented draw of one device in watts. A plug draws its wattage while it
 * is on; a light draws its wattage in proportion to its level, so dimming it
 * lowers the room's figure. Thermostats and sensors are not metered.
 */
export function wattsOf(device: Device): number {
  if (!isOn(device)) return 0;
  if (device.kind === 'light') return Math.round((device.watts * device.level) / 100);
  if (device.kind === 'plug') return device.watts;
  return 0;
}

export interface RoomStats {
  devices: number;
  /** Devices that have a power state (everything except sensors). */
  switchable: number;
  on: number;
  watts: number;
}

export function roomStats(devices: readonly Device[], roomId: string): RoomStats {
  const inRoom = devices.filter((device) => device.roomId === roomId);
  return {
    devices: inRoom.length,
    switchable: inRoom.filter(isSwitchable).length,
    on: inRoom.filter(isOn).length,
    watts: inRoom.reduce((sum, device) => sum + wattsOf(device), 0),
  };
}

/** "3 of 3 on", or nothing for a room that has nothing to switch. */
export function roomOnText(stats: RoomStats): string {
  return stats.switchable === 0 ? '' : `${stats.on} of ${stats.switchable} on`;
}

/**
 * The one sentence at the top of Home: "4 on, 2 need attention". Attention is
 * only mentioned when there is some, so a quiet home is a short sentence.
 */
export function homeSummary(devices: readonly Device[]): string {
  const on = devices.filter(isOn).length;
  const attention = devices.filter(needsAttention).length;
  const onText = on === 0 ? 'Nothing is on' : `${on} on`;
  if (attention === 0) return onText;
  return `${onText}, ${attention} ${attention === 1 ? 'needs' : 'need'} attention`;
}

export function roomName(rooms: readonly Room[], roomId: string): string {
  return rooms.find((room) => room.id === roomId)?.name ?? '';
}

/**
 * Checks a new room's name against the rules: required, and unique ignoring
 * case and surrounding space. Returns the problem, or null when it is fine. The
 * form shows it and the reducer enforces it, so a dispatch that skips the form
 * still cannot create a duplicate.
 */
export function roomNameProblem(name: string, rooms: readonly Room[]): 'required' | 'duplicate' | null {
  const wanted = name.trim().toLowerCase();
  if (wanted === '') return 'required';
  return rooms.some((room) => room.name.trim().toLowerCase() === wanted) ? 'duplicate' : null;
}
```

`src/utils/glow.ts` is the app's one bold idea as numbers: how lit a glyph is (0 to 100) and how that becomes a halo.

```ts
import { isReachable } from './summary';
import { TARGET_C } from './units';
import type { Device } from '../data/types';

// How lit a device's glyph is. This is the app's one bold idea (README,
// "Light is state"): a device that is on glows in the accent in proportion to
// its level, a device that is off is dark. Everything here is a plain number,
// so the drawing (components/Glyph.tsx) stays dumb and the rule is testable
// without a browser.

/**
 * 0 (dark) to 100 (as bright as it gets).
 *  - a light glows with its level while it is on;
 *  - a plug has no level, so it glows at a fixed brightness while it is on;
 *  - a thermostat glows with its target, from cool to warm across TARGET_C;
 *  - a sensor is always on, so it keeps a faint steady glow while it is reachable;
 *  - anything whose link is down is dark, whatever its last state was.
 */
export function glowLevel(device: Device): number {
  if (!isReachable(device)) return 0;
  switch (device.kind) {
    case 'light':
      return device.on ? device.level : 0;
    case 'plug':
      return device.on ? 70 : 0;
    case 'thermostat':
      return device.on ? Math.round(20 + (80 * (device.targetC - TARGET_C.min)) / (TARGET_C.max - TARGET_C.min)) : 0;
    case 'sensor':
      return 35;
  }
}

/** The halo's opacity: never invisible while something is lit, brighter in proportion to the level. */
export const haloOpacity = (level: number): number => (level <= 0 ? 0 : Math.round((0.15 + 0.85 * (level / 100)) * 100) / 100);

/** The halo's radius in the glyph's 64-unit box: it grows with the level. */
export const haloRadius = (level: number): number => (level <= 0 ? 0 : Math.round(14 + (34 * level) / 100));

/** How much the glyph's body fills with the accent: faint at low levels, 40% at full. */
export const bodyOpacity = (level: number): number => (level <= 0 ? 0 : Math.round(level * 0.4) / 100);
```

`src/utils/describeDevice.ts`:

```ts
import { LINK_WORDS } from '../data/product';
import type { Device, TemperatureUnit } from '../data/types';
import { formatDegrees } from './units';

/**
 * The one value a device shows at the right of its row ("70%", "On", "21.5°",
 * "Lost"). A device that cannot be reached shows the word for that instead of
 * a state it may no longer be in. The switch is on the kind rather than a
 * Record<DeviceKind, ...> because each kind reads different fields; TypeScript
 * fails the build if a new kind is added without a case (the function would not
 * return).
 */
export function describeDevice(device: Device, unit: TemperatureUnit): string {
  if (device.link !== 'connected') return LINK_WORDS[device.link];
  switch (device.kind) {
    case 'light':
      return device.on ? `${device.level}%` : 'Off';
    case 'plug':
      return device.on ? 'On' : 'Off';
    case 'thermostat':
      return device.on ? formatDegrees(device.targetC, unit) : 'Off';
    case 'sensor':
      return formatDegrees(device.readingC, unit);
  }
}
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/data/devices.test.ts src/utils`
Expected: PASS, 51 tests in 5 files (devices 9, units 9, summary 20, glow 8, describeDevice 5).

- [ ] **Step 7: Commit**

```bash
git add -A packages/mobile-app
git commit -m "feat(mobile-app): rooms, links and presets as data, and the helpers that derive what Home says" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: The connection seam

Scanning and linking go through one interface, with a scripted implementation that the tests run on a fake clock. This is a **pattern meant to be copied** (repo `CLAUDE.md`), so its comments are part of the task.

**Files:**
- Create: `src/connection/types.ts`, `src/connection/scripted.ts`, `src/connection/index.ts`, `src/connection/scripted.test.ts`

- [ ] **Step 1: Write the test**

The scripted connection only waits on timers, so every test drives fake ones. It covers: progress from 0 to 100 and then the fixed list; not finishing early; an abort that rejects with an `AbortError`, reports nothing more and **leaves no timer behind** (checked right after the abort, before any timer could fire by itself); the four steps in order and `ready` at 100; a typed code linking as readily as a nearby id; the one scripted failure at its step with its message and nothing after it.

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NEARBY } from '../data/nearby';
import { createScriptedConnection } from './scripted';
import { LINK_STEPS, LinkError, isAbort, type LinkProgress } from './types';

// The scripted connection only waits on timers, so the tests drive them with
// fake ones: no test here takes real time.
describe('the scripted connection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('scan', () => {
    it('reports progress from 0 to 100 and then resolves with the fixed list', async () => {
      const connection = createScriptedConnection({ scanMs: 800 });
      const progress: number[] = [];
      const done = connection.scan((percent) => progress.push(percent));
      await vi.advanceTimersByTimeAsync(800);
      expect(await done).toEqual([...NEARBY]);
      expect(progress[0]).toBe(0);
      expect(progress.at(-1)).toBe(100);
      expect(progress).toEqual([...progress].sort((a, b) => a - b));
      expect(progress.length).toBeGreaterThan(3);
    });

    it('has not finished before its time', async () => {
      const connection = createScriptedConnection({ scanMs: 800 });
      let resolved = false;
      void connection.scan(() => {}).then(() => (resolved = true));
      await vi.advanceTimersByTimeAsync(700);
      expect(resolved).toBe(false);
      await vi.advanceTimersByTimeAsync(100);
      expect(resolved).toBe(true);
    });

    it('stops when aborted: it rejects with an AbortError, reports nothing more and leaves no timer behind', async () => {
      const connection = createScriptedConnection({ scanMs: 800 });
      const controller = new AbortController();
      const progress: number[] = [];
      const done = connection.scan((percent) => progress.push(percent), controller.signal);
      const outcome = done.catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(250);
      const seen = progress.length;
      controller.abort();
      // Straight away, before any timer could fire by itself: the pending one was cleared by the abort.
      expect(vi.getTimerCount()).toBe(0);
      expect(isAbort(await outcome)).toBe(true);
      await vi.advanceTimersByTimeAsync(2000);
      expect(progress).toHaveLength(seen);
    });

    it('rejects at once when it is already aborted', async () => {
      const connection = createScriptedConnection();
      const controller = new AbortController();
      controller.abort();
      await expect(connection.scan(() => {}, controller.signal)).rejects.toSatisfy(isAbort);
    });
  });

  describe('link', () => {
    it('runs the four steps in order, then reports 100 for ready and resolves', async () => {
      const connection = createScriptedConnection({ stepMs: 100 });
      const seen: LinkProgress[] = [];
      const done = connection.link('shelf-lamp', (progress) => seen.push(progress));
      await vi.advanceTimersByTimeAsync(400);
      await done;
      expect(seen.map((progress) => progress.step)).toEqual([...LINK_STEPS, 'ready']);
      expect(seen.map((progress) => progress.percent)).toEqual([0, 25, 50, 75, 100]);
    });

    it('links a typed pairing code as readily as a nearby id: nothing can tell them apart', async () => {
      const connection = createScriptedConnection({ stepMs: 10 });
      const done = connection.link('AB12CD', () => {});
      await vi.advanceTimersByTimeAsync(40);
      await expect(done).resolves.toBeUndefined();
    });

    it('fails for the device that is scripted to, at its step, with its message, and goes no further', async () => {
      const connection = createScriptedConnection({ stepMs: 100 });
      const seen: LinkProgress[] = [];
      const outcome = connection.link('hall-light', (progress) => seen.push(progress)).catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(1000);
      const error = await outcome;
      expect(error).toBeInstanceOf(LinkError);
      expect(error).toMatchObject({ message: 'No response from the hub', step: 'securing' });
      expect(seen.map((progress) => progress.step)).toEqual(['found', 'pairing', 'securing']);
    });

    it('stops when aborted part-way and clears its timer', async () => {
      const connection = createScriptedConnection({ stepMs: 100 });
      const controller = new AbortController();
      const seen: LinkProgress[] = [];
      const outcome = connection.link('shelf-lamp', (progress) => seen.push(progress), controller.signal).catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(150);
      controller.abort();
      expect(vi.getTimerCount()).toBe(0);
      expect(isAbort(await outcome)).toBe(true);
      await vi.advanceTimersByTimeAsync(1000);
      expect(seen.map((progress) => progress.step)).toEqual(['found', 'pairing']);
    });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/connection`
Expected: FAIL (`Failed to resolve import "./scripted"`).

- [ ] **Step 3: Write the seam**

`src/connection/types.ts`. The comment at the top is for a forker: it says this is the seam, what a real implementation is (Web Bluetooth, MQTT, WebSocket, your own backend), where to pass it (`<App connection={...} />`), and that `noNetworkOrStorage.test.ts` has to be told. `LinkError` carries the step that failed so the checklist can mark that row.

```ts
import type { NearbyDevice } from '../data/types';

// THE SEAM. Everything the app does to "find" or "link" a device goes through
// the Connection below, and nothing else in src/ knows how. The shipped
// implementation (scripted.ts) only waits on timers and returns what is in
// data/nearby.ts, so nothing is discovered and nothing is sent. To make the
// app real, write another Connection that talks to your hub (the browser's
// Web Bluetooth API, an MQTT or WebSocket client, your own backend) and pass
// it to <App connection={...} /> in main.tsx; the screens keep working
// because they only call scan() and link() and read their progress callbacks.
// Do it somewhere src/noNetworkOrStorage.test.ts does not look, or remove the
// names you now need from its list on purpose.

/** The handshake, in order. The Link checklist draws one row per step. */
export const LINK_STEPS = ['found', 'pairing', 'securing', 'ready'] as const;
export type LinkStep = (typeof LINK_STEPS)[number];

export interface LinkProgress {
  /** The step being worked on. */
  step: LinkStep;
  /** 0 to 100, how much of the handshake is done. 100 means every step is. */
  percent: number;
}

/** Why a link failed, and at which step, so the checklist can mark that row. */
export class LinkError extends Error {
  readonly step: LinkStep;

  constructor(message: string, step: LinkStep) {
    super(message);
    this.name = 'LinkError';
    this.step = step;
  }
}

export interface Connection {
  /**
   * Looks for devices nearby. Calls onProgress with 0 to 100 while it works
   * and resolves with what it found. Rejects with an AbortError when `signal`
   * is aborted (the screen was left).
   */
  scan(onProgress: (percent: number) => void, signal?: AbortSignal): Promise<NearbyDevice[]>;
  /**
   * Links to one device: a nearby id for a new device, an existing device's id
   * for Reconnect, or the pairing code someone typed. Calls onProgress as the
   * steps run, resolves when the link is ready, rejects with a LinkError when
   * it fails, and with an AbortError when `signal` is aborted.
   */
  link(id: string, onProgress: (progress: LinkProgress) => void, signal?: AbortSignal): Promise<void>;
}

export function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
```

`src/connection/scripted.ts`. `wait()` rejects with an `AbortError` the moment the signal aborts **and clears its timer**; without that an abandoned scan keeps a timer alive after the screen is gone.

```ts
import { LINK_FAILURES, NEARBY } from '../data/nearby';
import { LINK_STEPS, LinkError, type Connection } from './types';

interface ScriptedOptions {
  /** How long the scan takes, in milliseconds. */
  scanMs?: number;
  /** How long each handshake step takes. */
  stepMs?: number;
}

/** Resolves after `ms`, or rejects with an AbortError the moment `signal` aborts (and clears its timer). */
function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * MOCK: a Connection that discovers and links nothing. It waits on timers,
 * reports progress as it goes, and then returns the fixed list in
 * data/nearby.ts. Which links fail is scripted per device in the same file
 * (LINK_FAILURES). The timings are the only thing it owns; tests pass tiny ones
 * or use fake timers.
 */
export function createScriptedConnection({ scanMs = 2400, stepMs = 600 }: ScriptedOptions = {}): Connection {
  return {
    async scan(onProgress, signal) {
      const ticks = 8;
      onProgress(0);
      for (let tick = 1; tick <= ticks; tick++) {
        await wait(scanMs / ticks, signal);
        onProgress(Math.round((tick / ticks) * 100));
      }
      return [...NEARBY];
    },

    async link(id, onProgress, signal) {
      const failure = LINK_FAILURES[id];
      for (const [index, step] of LINK_STEPS.entries()) {
        onProgress({ step, percent: Math.round((index / LINK_STEPS.length) * 100) });
        await wait(stepMs, signal);
        if (failure?.step === step) throw new LinkError(failure.message, step);
      }
      onProgress({ step: 'ready', percent: 100 });
    },
  };
}
```

`src/connection/index.ts`:

```ts
import { createScriptedConnection } from './scripted';

export { createScriptedConnection } from './scripted';
export { LINK_STEPS, LinkError, isAbort } from './types';
export type { Connection, LinkProgress, LinkStep } from './types';

/** The connection the app uses unless <App connection={...} /> is given another. */
export const scriptedConnection = createScriptedConnection();
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/connection`
Expected: PASS, 8 tests in 1 file.

- [ ] **Step 5: Commit**

```bash
git add -A packages/mobile-app
git commit -m "feat(mobile-app): a Connection seam for scanning and linking, with a scripted implementation" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: The reducer, the routes and the product data test

**Files:**
- Replace: `src/state/reducer.ts`, `src/state/reducer.test.ts`, `src/router/useHashRoute.ts`, `src/router/useHashRoute.test.ts`, `src/data/product.test.ts`

- [ ] **Step 1: Write the tests**

The reducer test is the app's behaviour in one file: every action, what it refuses (a device whose link is down, a sensor with no power, a duplicate room, a room that still has devices), what it says in the notice, and that it never mutates its input. Two of its tests exist because a mutation survived without them: picking a thermostat's Off preset after setting a target keeps that target, and removing the room Home is filtered to clears the filter.

`src/state/reducer.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { STARTING_DEVICES } from '../data/devices';
import type { Device } from '../data/types';
import { createInitialState, reducer, type Action, type AppState } from './reducer';

const start = (): AppState => createInitialState();
const device = (state: AppState, id: string): Device => state.devices.find((candidate) => candidate.id === id)!;
const run = (state: AppState, ...actions: Action[]): AppState => actions.reduce(reducer, state);

describe('reducer', () => {
  it('starts from the starting data, with no filter and no notice', () => {
    const state = start();
    expect(state.devices).toBe(STARTING_DEVICES);
    expect(state.roomFilter).toBeNull();
    expect(state.notice).toBeNull();
  });

  describe('device/toggle', () => {
    it('flips only that device', () => {
      const next = reducer(start(), { type: 'device/toggle', id: 'desk-lamp' });
      expect(device(next, 'desk-lamp')).toMatchObject({ on: false });
      expect(device(next, 'tv-plug')).toMatchObject({ on: true });
      expect(device(next, 'bedside-lamp')).toMatchObject({ on: false });
    });

    it('does nothing for a device that is lost or offline, or one that does not exist', () => {
      const state = start();
      expect(reducer(state, { type: 'device/toggle', id: 'hall-light' })).toBe(state);
      expect(reducer(state, { type: 'device/toggle', id: 'nope' })).toBe(state);
      const offline = run(state, { type: 'device/disconnect', id: 'desk-lamp' });
      expect(reducer(offline, { type: 'device/toggle', id: 'desk-lamp' })).toBe(offline);
    });

    it('does nothing for a sensor, which has no power', () => {
      const state = start();
      expect(reducer(state, { type: 'device/toggle', id: 'living-sensor' })).toBe(state);
    });
  });

  describe('device/set-level', () => {
    it('sets the level and switches the light on, so the slider never leaves a dark light at 80%', () => {
      const next = reducer(start(), { type: 'device/set-level', id: 'bedside-lamp', value: 80 });
      expect(device(next, 'bedside-lamp')).toMatchObject({ on: true, level: 80 });
    });

    it('keeps the level inside what a light allows', () => {
      expect(device(reducer(start(), { type: 'device/set-level', id: 'desk-lamp', value: 500 }), 'desk-lamp')).toMatchObject({ level: 100 });
      expect(device(reducer(start(), { type: 'device/set-level', id: 'desk-lamp', value: 0 }), 'desk-lamp')).toMatchObject({ level: 5 });
    });

    it('ignores a device that is not a light, and one that cannot be reached', () => {
      const state = start();
      expect(reducer(state, { type: 'device/set-level', id: 'tv-plug', value: 50 })).toBe(state);
      expect(reducer(state, { type: 'device/set-level', id: 'hall-light', value: 50 })).toBe(state);
    });
  });

  describe('device/set-target', () => {
    it('sets the target in Celsius, inside the allowed range, and switches the thermostat on', () => {
      const off = run(start(), { type: 'device/preset', id: 'hall-thermostat', presetId: 'off' });
      expect(device(off, 'hall-thermostat')).toMatchObject({ on: false });
      const next = reducer(off, { type: 'device/set-target', id: 'hall-thermostat', valueC: 21.5 });
      expect(device(next, 'hall-thermostat')).toMatchObject({ on: true, targetC: 21.5 });
      expect(device(reducer(start(), { type: 'device/set-target', id: 'hall-thermostat', valueC: 99 }), 'hall-thermostat')).toMatchObject({ targetC: 30 });
      expect(device(reducer(start(), { type: 'device/set-target', id: 'hall-thermostat', valueC: 1 }), 'hall-thermostat')).toMatchObject({ targetC: 10 });
    });

    it('ignores anything that is not a thermostat', () => {
      const state = start();
      expect(reducer(state, { type: 'device/set-target', id: 'desk-lamp', valueC: 21 })).toBe(state);
    });
  });

  describe('device/preset', () => {
    it('sets a light to the level of the preset and switches it on', () => {
      const night = reducer(start(), { type: 'device/preset', id: 'bedside-lamp', presetId: 'night' });
      expect(device(night, 'bedside-lamp')).toMatchObject({ on: true, level: 5 });
      const reading = reducer(start(), { type: 'device/preset', id: 'desk-lamp', presetId: 'reading' });
      expect(device(reading, 'desk-lamp')).toMatchObject({ on: true, level: 80 });
      const movie = reducer(start(), { type: 'device/preset', id: 'desk-lamp', presetId: 'movie' });
      expect(device(movie, 'desk-lamp')).toMatchObject({ level: 25 });
    });

    it('sets a thermostat to Heat or Eco, or switches it off and keeps its target', () => {
      expect(device(reducer(start(), { type: 'device/preset', id: 'hall-thermostat', presetId: 'heat' }), 'hall-thermostat')).toMatchObject({ on: true, targetC: 22 });
      expect(device(reducer(start(), { type: 'device/preset', id: 'hall-thermostat', presetId: 'eco' }), 'hall-thermostat')).toMatchObject({ on: true, targetC: 18 });
      expect(device(reducer(start(), { type: 'device/preset', id: 'hall-thermostat', presetId: 'off' }), 'hall-thermostat')).toMatchObject({ on: false, targetC: 20 });
      // Off keeps whatever the target was, so switching it on again brings that back.
      const warm = run(start(), { type: 'device/set-target', id: 'hall-thermostat', valueC: 24 }, { type: 'device/preset', id: 'hall-thermostat', presetId: 'off' });
      expect(device(warm, 'hall-thermostat')).toMatchObject({ on: false, targetC: 24 });
    });

    it('ignores a preset the device does not have, and a device that has none', () => {
      const state = start();
      expect(reducer(state, { type: 'device/preset', id: 'desk-lamp', presetId: 'heat' })).toBe(state);
      expect(reducer(state, { type: 'device/preset', id: 'tv-plug', presetId: 'night' })).toBe(state);
      expect(reducer(state, { type: 'device/preset', id: 'hall-light', presetId: 'night' })).toBe(state);
    });
  });

  describe('device/disconnect and device/reconnected', () => {
    it('marks a connected device offline, and keeps its signal for later', () => {
      const next = reducer(start(), { type: 'device/disconnect', id: 'desk-lamp' });
      expect(device(next, 'desk-lamp')).toMatchObject({ link: 'offline', signal: 4, latencyMs: 12 });
    });

    it('leaves a device that is already down as it is', () => {
      const state = start();
      expect(device(reducer(state, { type: 'device/disconnect', id: 'hall-light' }), 'hall-light').link).toBe('lost');
    });

    it('brings a lost or offline device back, with the state it had', () => {
      const back = reducer(start(), { type: 'device/reconnected', id: 'hall-light' });
      expect(device(back, 'hall-light')).toMatchObject({ link: 'connected', on: false, level: 50 });
      const round = run(start(), { type: 'device/disconnect', id: 'desk-lamp' }, { type: 'device/reconnected', id: 'desk-lamp' });
      expect(device(round, 'desk-lamp')).toMatchObject({ link: 'connected', on: true, level: 70 });
    });

    it('does nothing for an unknown id', () => {
      const state = start();
      expect(reducer(state, { type: 'device/disconnect', id: 'nope' })).toBe(state);
      expect(reducer(state, { type: 'device/reconnected', id: 'nope' })).toBe(state);
    });
  });

  describe('device/add', () => {
    it('adds a scanned device under its own id, in the room chosen, and says so', () => {
      const next = reducer(start(), { type: 'device/add', draft: { id: 'shelf-lamp', name: 'Shelf lamp', roomId: 'bedroom', kind: 'light', signal: 4 } });
      expect(device(next, 'shelf-lamp')).toMatchObject({ kind: 'light', roomId: 'bedroom', link: 'connected', on: false, signal: 4 });
      expect(next.notice).toBe('Added Shelf lamp to Bedroom.');
      expect(next.nextDeviceNumber).toBe(1);
    });

    it('numbers a device added by code, and starts it off where it has a switch', () => {
      const next = run(
        start(),
        { type: 'device/add', draft: { name: 'A', roomId: 'hall', kind: 'plug' } },
        { type: 'device/add', draft: { name: 'B', roomId: 'hall', kind: 'sensor' } },
      );
      expect(device(next, 'new-1')).toMatchObject({ kind: 'plug', on: false });
      expect(device(next, 'new-2')).toMatchObject({ kind: 'sensor', batteryLow: false });
      expect(next.nextDeviceNumber).toBe(3);
    });

    it('starts a thermostat on and a light off, whatever the kind says about the rest', () => {
      const next = run(
        start(),
        { type: 'device/add', draft: { name: 'T', roomId: 'hall', kind: 'thermostat' } },
        { type: 'device/add', draft: { name: 'L', roomId: 'hall', kind: 'light' } },
      );
      expect(device(next, 'new-1')).toMatchObject({ kind: 'thermostat', on: true });
      expect(device(next, 'new-2')).toMatchObject({ kind: 'light', on: false });
    });

    it('refuses an id that is taken and a room that does not exist', () => {
      const state = start();
      expect(reducer(state, { type: 'device/add', draft: { id: 'desk-lamp', name: 'X', roomId: 'hall', kind: 'light' } })).toBe(state);
      expect(reducer(state, { type: 'device/add', draft: { name: 'X', roomId: 'nowhere', kind: 'light' } })).toBe(state);
    });
  });

  describe('device/remove', () => {
    it('removes the device and says so', () => {
      const next = reducer(start(), { type: 'device/remove', id: 'desk-lamp' });
      expect(next.devices.map((d) => d.id)).not.toContain('desk-lamp');
      expect(next.devices).toHaveLength(STARTING_DEVICES.length - 1);
      expect(next.notice).toBe('Removed Desk lamp.');
    });

    it('does nothing for an unknown id', () => {
      const state = start();
      expect(reducer(state, { type: 'device/remove', id: 'nope' })).toBe(state);
    });
  });

  describe('room/turn-off', () => {
    it('switches off what is on in that room only', () => {
      const next = reducer(start(), { type: 'room/turn-off', id: 'living-room' });
      expect(device(next, 'desk-lamp')).toMatchObject({ on: false });
      expect(device(next, 'floor-lamp')).toMatchObject({ on: false });
      expect(device(next, 'tv-plug')).toMatchObject({ on: false });
      expect(device(next, 'hall-thermostat')).toMatchObject({ on: true });
    });

    it('does not touch a device that cannot be reached, whose state is not known', () => {
      const lostOn = { ...device(start(), 'hall-light'), on: true } as Device;
      const state = { ...start(), devices: start().devices.map((d) => (d.id === 'hall-light' ? lostOn : d)) };
      const next = reducer(state, { type: 'room/turn-off', id: 'hall' });
      expect(device(next, 'hall-light')).toMatchObject({ on: true });
      expect(device(next, 'hall-thermostat')).toMatchObject({ on: false });
    });
  });

  describe('room/add', () => {
    it('adds a room with a numbered id, trimmed, and says so', () => {
      const next = reducer(start(), { type: 'room/add', name: '  Kitchen ' });
      expect(next.rooms.at(-1)).toEqual({ id: 'room-1', name: 'Kitchen' });
      expect(next.notice).toBe('Added the room Kitchen.');
      expect(next.nextRoomNumber).toBe(2);
    });

    it('refuses an empty name and a name that is taken, whatever its case', () => {
      const state = start();
      expect(reducer(state, { type: 'room/add', name: '   ' })).toBe(state);
      expect(reducer(state, { type: 'room/add', name: 'hall' })).toBe(state);
      expect(reducer(state, { type: 'room/add', name: 'LIVING ROOM' })).toBe(state);
    });
  });

  describe('room/remove', () => {
    it('removes a room that is empty', () => {
      const next = run(start(), { type: 'room/add', name: 'Kitchen' }, { type: 'room/remove', id: 'room-1' });
      expect(next.rooms.map((room) => room.id)).toEqual(['living-room', 'bedroom', 'hall']);
      expect(next.notice).toBe('Removed the room Kitchen.');
    });

    it('refuses a room that still has devices, and says how many, in the singular and the plural', () => {
      const state = start();
      const blocked = reducer(state, { type: 'room/remove', id: 'living-room' });
      expect(blocked.rooms).toBe(state.rooms);
      expect(blocked.notice).toBe('Living room still has 4 devices. Remove them first.');
      const one = run(
        start(),
        { type: 'device/remove', id: 'hall-light' },
        { type: 'room/remove', id: 'hall' },
      );
      expect(one.rooms.map((room) => room.id)).toContain('hall');
      expect(one.notice).toBe('Hall still has 1 device. Remove it first.');
    });

    it('clears the home filter if it pointed at the room that went', () => {
      const next = run(start(), { type: 'room/add', name: 'Kitchen' }, { type: 'filter/set', roomId: 'room-1' }, { type: 'room/remove', id: 'room-1' });
      expect(next.roomFilter).toBeNull();
      const other = run(start(), { type: 'room/add', name: 'Kitchen' }, { type: 'filter/set', roomId: 'hall' }, { type: 'room/remove', id: 'room-1' });
      expect(other.roomFilter).toBe('hall');
    });

    it('does nothing for an unknown id', () => {
      const state = start();
      expect(reducer(state, { type: 'room/remove', id: 'nope' })).toBe(state);
    });
  });

  it('sets and clears the room filter', () => {
    const next = reducer(start(), { type: 'filter/set', roomId: 'hall' });
    expect(next.roomFilter).toBe('hall');
    expect(reducer(next, { type: 'filter/set', roomId: null }).roomFilter).toBeNull();
  });

  it('sets the unit and the two flags, each on its own', () => {
    const unit = reducer(start(), { type: 'settings/set-unit', unit: 'F' });
    expect(unit.settings).toEqual({ unit: 'F', alertOffline: true, remoteAccess: false });
    const alerts = reducer(start(), { type: 'settings/set-flag', flag: 'alertOffline', value: false });
    expect(alerts.settings).toEqual({ unit: 'C', alertOffline: false, remoteAccess: false });
    const remote = reducer(start(), { type: 'settings/set-flag', flag: 'remoteAccess', value: true });
    expect(remote.settings).toEqual({ unit: 'C', alertOffline: true, remoteAccess: true });
  });

  it('dismisses the notice', () => {
    const noticed = reducer(start(), { type: 'device/remove', id: 'desk-lamp' });
    expect(noticed.notice).not.toBeNull();
    expect(reducer(noticed, { type: 'notice/dismiss' }).notice).toBeNull();
  });

  it('throws on an action it does not know, instead of ignoring it', () => {
    expect(() => reducer(start(), { type: 'nope' } as unknown as Action)).toThrow(/Unhandled action/);
  });

  it('never mutates the state it was given', () => {
    const state = start();
    const frozen = JSON.stringify(state);
    run(
      state,
      { type: 'device/toggle', id: 'desk-lamp' },
      { type: 'room/turn-off', id: 'hall' },
      { type: 'room/add', name: 'Kitchen' },
      { type: 'device/remove', id: 'tv-plug' },
    );
    expect(JSON.stringify(state)).toBe(frozen);
  });
});
```

`src/router/useHashRoute.test.ts` covers the parsing (the device id is the second path segment, decoded; only `device` takes one) and `leave()` in all three of its cases (Back when the page was reached from inside the app, a replace when it was opened directly, and Add room returning to Rooms, not Home):

```ts
import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ROUTES, TAB_ROUTES, isTab, parseHash, useHashRoute } from './useHashRoute';

function goTo(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event('hashchange'));
  });
}

describe('parseHash', () => {
  it('reads a route, and the second segment for a device', () => {
    expect(parseHash('#/rooms')).toEqual({ route: 'rooms', param: undefined });
    expect(parseHash('#/device/desk-lamp')).toEqual({ route: 'device', param: 'desk-lamp' });
    expect(parseHash('#/device/a%20b')).toEqual({ route: 'device', param: 'a b' });
    expect(parseHash('#/add-room')).toEqual({ route: 'add-room', param: undefined });
  });

  it('keeps a parameter for the one route that takes it and drops it elsewhere', () => {
    expect(parseHash('#/rooms/anything').param).toBeUndefined();
    expect(parseHash('#/device').param).toBeUndefined();
  });

  it('falls back to Home for nothing and for an unknown route', () => {
    expect(parseHash('')).toEqual({ route: 'devices', param: undefined });
    expect(parseHash('#/nope')).toEqual({ route: 'devices', param: undefined });
  });
});

describe('useHashRoute', () => {
  afterEach(() => {
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  it('lists the screens, and the tabs are the three that are not pushed', () => {
    expect([...ROUTES]).toEqual(['devices', 'device', 'rooms', 'settings', 'add', 'add-room']);
    expect([...TAB_ROUTES]).toEqual(['devices', 'rooms', 'settings']);
    expect(ROUTES.filter((route) => !isTab(route))).toEqual(['device', 'add', 'add-room']);
  });

  it('defaults to Home when there is no hash', () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toBe('devices');
  });

  it('reads a known route from the initial hash', () => {
    window.location.hash = '#/rooms';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toBe('rooms');
  });

  it('reads a device id from the initial hash', () => {
    window.location.hash = '#/device/tv-plug';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toMatchObject({ route: 'device', param: 'tv-plug' });
  });

  it('falls back to Home for an unknown hash', () => {
    window.location.hash = '#/nope';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toBe('devices');
  });

  it('updates when the hash changes, including to another device', () => {
    const { result } = renderHook(() => useHashRoute());
    goTo('#/settings');
    expect(result.current.route).toBe('settings');
    goTo('#/device/desk-lamp');
    expect(result.current.param).toBe('desk-lamp');
    goTo('#/device/tv-plug');
    expect(result.current.param).toBe('tv-plug');
  });

  it('removes its hashchange listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useHashRoute());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
  });

  describe('leave', () => {
    it('goes Back when a pushed screen was reached from inside the app', () => {
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      const { result } = renderHook(() => useHashRoute());
      goTo('#/device/desk-lamp');
      act(() => result.current.leave());
      expect(back).toHaveBeenCalledTimes(1);
    });

    it('replaces the entry with Home when #/add was opened directly, because Back would leave the app', () => {
      window.location.hash = '#/add';
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      const { result } = renderHook(() => useHashRoute());
      act(() => result.current.leave());
      expect(back).not.toHaveBeenCalled();
      expect(window.location.hash).toBe('#/devices');
    });

    it('replaces a device page opened directly with Home, and Add room with Rooms', () => {
      window.location.hash = '#/device/desk-lamp';
      const first = renderHook(() => useHashRoute());
      act(() => first.result.current.leave());
      expect(window.location.hash).toBe('#/devices');
      first.unmount();

      window.location.hash = '#/add-room';
      const second = renderHook(() => useHashRoute());
      act(() => second.result.current.leave());
      expect(window.location.hash).toBe('#/rooms');
    });
  });
});
```

`src/data/product.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { LINK_STEPS } from '../connection';
import { ROUTES } from '../router/useHashRoute';
import { CONNECT_COPY, DEMO_NOTE, LINK_STEP_LABELS, LINK_WORDS, ROUTE_TITLES } from './product';

describe('product data', () => {
  it('has a title for every route', () => {
    expect(Object.keys(ROUTE_TITLES).sort()).toEqual([...ROUTES].sort());
  });

  it('words the demo sentence exactly', () => {
    expect(DEMO_NOTE).toBe('Template demo: Kestrel is fictional and controls nothing.');
  });

  it('says on the Scan screen that the scan is scripted and nothing is discovered', () => {
    expect(CONNECT_COPY.scripted).toMatch(/scripted/);
    expect(CONNECT_COPY.scripted).toMatch(/nothing is discovered/);
  });

  it('has a label for every step of the link, and a word for every link that is down', () => {
    expect(Object.keys(LINK_STEP_LABELS).sort()).toEqual([...LINK_STEPS].sort());
    expect(LINK_WORDS).toEqual({ lost: 'Lost', offline: 'Offline' });
  });

  it('counts the devices a scan found, in the singular and the plural', () => {
    expect(CONNECT_COPY.found(1)).toBe('1 device nearby');
    expect(CONNECT_COPY.found(4)).toBe('4 devices nearby');
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/state src/router src/data/product.test.ts`
Expected: FAIL (the old reducer has no rooms, `parseHash` and `isTab` do not exist, `LINK_WORDS` is not exported).

- [ ] **Step 3: Write the reducer**

`src/state/reducer.ts`. It is still the mock backend and its header says so. Picking a level or a target also switches the device on, so a light dragged to 80% cannot stay dark. The room actions enforce what the forms show: `room/add` runs the same `roomNameProblem` the form does, and `room/remove` refuses a room that still has devices with a plain sentence in the notice.

```ts
import { LEVEL, STARTING_DEVICES, STARTING_ROOMS } from '../data/devices';
import { LIGHT_PRESETS, THERMOSTAT_PRESETS } from '../data/presets';
import { DEFAULT_SETTINGS } from '../data/settings';
import type { Device, DeviceDraft, Room, Settings, TemperatureUnit } from '../data/types';
import { isReachable, isSwitchable, roomName, roomNameProblem } from '../utils/summary';
import { TARGET_C } from '../utils/units';

// The one place state changes. Every screen reads from AppState and describes a
// change as an Action; nothing else holds app data (the form fields, the scan
// and the open step of Add device are screen state, not app state).
//
// MOCK BOUNDARY: this reducer is the whole backend. Switching a device,
// pressing a preset, linking or removing one only edits the in-memory state
// below; a reload restores the starting data, and nothing is sent to anything.
// To connect a real hub, send the request where the action is dispatched (or in
// an effect that watches state) and keep this reducer for the instant update,
// so the screens do not change. Linking itself goes through a Connection
// (connection/types.ts), which is where a real protocol plugs in.

export interface AppState {
  rooms: Room[];
  devices: Device[];
  settings: Settings;
  /** Which room Home shows, or null for all of them. Kept here because Rooms sets it and Home reads it. */
  roomFilter: string | null;
  /** The line shown under the app bar until it is dismissed (a device or room was added or removed, or a room could not be). */
  notice: string | null;
  /** Number the ids of devices and rooms added in this session (new-1, room-1, ...). */
  nextDeviceNumber: number;
  nextRoomNumber: number;
}

/**
 * Every way state can change. A discriminated union, so the switch in
 * reducer() is checked for completeness (assertNever): an action added here
 * without a case is a compile error, not a click that silently does nothing.
 */
export type Action =
  | { type: 'device/toggle'; id: string }
  | { type: 'device/set-level'; id: string; value: number }
  | { type: 'device/set-target'; id: string; valueC: number }
  | { type: 'device/preset'; id: string; presetId: string }
  | { type: 'device/disconnect'; id: string }
  | { type: 'device/reconnected'; id: string }
  | { type: 'device/add'; draft: DeviceDraft }
  | { type: 'device/remove'; id: string }
  | { type: 'room/turn-off'; id: string }
  | { type: 'room/add'; name: string }
  | { type: 'room/remove'; id: string }
  | { type: 'filter/set'; roomId: string | null }
  | { type: 'settings/set-unit'; unit: TemperatureUnit }
  | { type: 'settings/set-flag'; flag: 'alertOffline' | 'remoteAccess'; value: boolean }
  | { type: 'notice/dismiss' };

export function createInitialState(): AppState {
  return {
    rooms: STARTING_ROOMS,
    devices: STARTING_DEVICES,
    settings: DEFAULT_SETTINGS,
    roomFilter: null,
    notice: null,
    nextDeviceNumber: 1,
    nextRoomNumber: 1,
  };
}

function assertNever(value: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(value)}`);
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** A new device starts connected, and off where it has a power state. The numbers are plain defaults. */
function createDevice(draft: DeviceDraft, id: string): Device {
  const base = { id, name: draft.name, roomId: draft.roomId, link: 'connected', signal: draft.signal ?? 3, latencyMs: 25 } as const;
  switch (draft.kind) {
    case 'light':
      return { ...base, kind: 'light', on: false, level: 70, watts: 10 };
    case 'plug':
      return { ...base, kind: 'plug', on: false, watts: 40 };
    case 'thermostat':
      return { ...base, kind: 'thermostat', on: true, targetC: 20, currentC: 20 };
    case 'sensor':
      return { ...base, kind: 'sensor', readingC: 20, batteryLow: false };
  }
}

/** Replaces one device, but only if it exists and can be reached: a lost or offline device cannot be controlled. */
function updateControllable(state: AppState, id: string, change: (device: Device) => Device): AppState {
  const target = state.devices.find((device) => device.id === id);
  if (!target || !isReachable(target)) return state;
  const next = change(target);
  if (next === target) return state;
  return { ...state, devices: state.devices.map((device) => (device.id === id ? next : device)) };
}

/** Replaces one device whatever its link, for the two actions that are about the link itself. */
function updateAny(state: AppState, id: string, change: (device: Device) => Device): AppState {
  if (!state.devices.some((device) => device.id === id)) return state;
  return { ...state, devices: state.devices.map((device) => (device.id === id ? change(device) : device)) };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'device/toggle':
      return updateControllable(state, action.id, (device) => (isSwitchable(device) ? { ...device, on: !device.on } : device));
    case 'device/set-level':
      // Picking a level also switches the light on. Otherwise a light dragged
      // to 80% would still be off: a level on the slider, a dark glyph and an
      // "Off" on its row, all at once.
      return updateControllable(state, action.id, (device) =>
        device.kind === 'light' ? { ...device, on: true, level: clamp(action.value, LEVEL.min, LEVEL.max) } : device,
      );
    case 'device/set-target':
      // Like a light's level, picking a target also switches the thermostat on.
      return updateControllable(state, action.id, (device) =>
        device.kind === 'thermostat' ? { ...device, on: true, targetC: clamp(action.valueC, TARGET_C.min, TARGET_C.max) } : device,
      );
    case 'device/preset':
      return updateControllable(state, action.id, (device) => {
        if (device.kind === 'light') {
          const preset = LIGHT_PRESETS.find((candidate) => candidate.id === action.presetId);
          return preset ? { ...device, on: true, level: preset.level } : device;
        }
        if (device.kind === 'thermostat') {
          const preset = THERMOSTAT_PRESETS.find((candidate) => candidate.id === action.presetId);
          return preset ? { ...device, on: preset.on, targetC: preset.targetC ?? device.targetC } : device;
        }
        return device;
      });
    case 'device/disconnect':
      // MOCK: nothing is disconnected. The device is only marked offline here.
      return updateAny(state, action.id, (device) => (device.link === 'connected' ? { ...device, link: 'offline' } : device));
    case 'device/reconnected':
      // Dispatched once the Connection's link() has resolved (components/LinkRun.tsx).
      return updateAny(state, action.id, (device) => (device.link === 'connected' ? device : { ...device, link: 'connected' }));
    case 'device/add': {
      // MOCK: nothing is paired. The pairing code was checked by the form and dropped.
      const id = action.draft.id ?? `new-${state.nextDeviceNumber}`;
      if (state.devices.some((device) => device.id === id) || !state.rooms.some((room) => room.id === action.draft.roomId)) return state;
      const device = createDevice(action.draft, id);
      return {
        ...state,
        devices: [...state.devices, device],
        nextDeviceNumber: action.draft.id ? state.nextDeviceNumber : state.nextDeviceNumber + 1,
        notice: `Added ${device.name} to ${roomName(state.rooms, device.roomId)}.`,
      };
    }
    case 'device/remove': {
      const removed = state.devices.find((device) => device.id === action.id);
      if (!removed) return state;
      return { ...state, devices: state.devices.filter((device) => device.id !== action.id), notice: `Removed ${removed.name}.` };
    }
    case 'room/turn-off':
      return {
        ...state,
        devices: state.devices.map((device) =>
          device.roomId === action.id && isReachable(device) && isSwitchable(device) && device.on ? { ...device, on: false } : device,
        ),
      };
    case 'room/add': {
      if (roomNameProblem(action.name, state.rooms) !== null) return state;
      const name = action.name.trim();
      return {
        ...state,
        rooms: [...state.rooms, { id: `room-${state.nextRoomNumber}`, name }],
        nextRoomNumber: state.nextRoomNumber + 1,
        notice: `Added the room ${name}.`,
      };
    }
    case 'room/remove': {
      const room = state.rooms.find((candidate) => candidate.id === action.id);
      if (!room) return state;
      const count = state.devices.filter((device) => device.roomId === room.id).length;
      // A room can only go when it is empty: its devices would have nowhere to be.
      if (count > 0) {
        return { ...state, notice: `${room.name} still has ${count} ${count === 1 ? 'device' : 'devices'}. Remove ${count === 1 ? 'it' : 'them'} first.` };
      }
      return {
        ...state,
        rooms: state.rooms.filter((candidate) => candidate.id !== room.id),
        roomFilter: state.roomFilter === room.id ? null : state.roomFilter,
        notice: `Removed the room ${room.name}.`,
      };
    }
    case 'filter/set':
      return { ...state, roomFilter: action.roomId };
    case 'settings/set-unit':
      return { ...state, settings: { ...state.settings, unit: action.unit } };
    case 'settings/set-flag':
      // MOCK: remembered in memory so the switch responds. No notification is ever scheduled or requested.
      return { ...state, settings: { ...state.settings, [action.flag]: action.value } };
    case 'notice/dismiss':
      return { ...state, notice: null };
    default:
      return assertNever(action);
  }
}
```

- [ ] **Step 4: Write the router**

`src/router/useHashRoute.ts`. `ROUTES` is the tuple pattern, `TAB_ROUTES` says which are tabs, `PARENT_TAB` (a `Record<PushedRoute, TabRoute>`) says where each pushed screen goes when it is left without Back. Adding a route without saying which of the two it is, is a compile error.

```ts
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The single source of truth for routes; Route is derived from it so the two
 * can't drift. To add a screen, start here: App.tsx keeps its screens in a
 * Record<Route, ...>, data/product.ts keeps its title in another and PARENT_TAB
 * below says where a pushed screen returns to, so the compiler then lists what
 * is still missing.
 *
 * 'devices' is Home and 'device' is one device's page (#/device/desk-lamp): the
 * second path segment is that route's parameter.
 */
export const ROUTES = ['devices', 'device', 'rooms', 'settings', 'add', 'add-room'] as const;
export type Route = (typeof ROUTES)[number];

/** The routes that get a tab in the bottom nav. A new route is not a tab until you list it here. */
export const TAB_ROUTES = ['devices', 'rooms', 'settings'] as const satisfies readonly Route[];
export type TabRoute = (typeof TAB_ROUTES)[number];

/** Pushed screens have their own Back and no bottom nav. Each says which tab it belongs to. */
export type PushedRoute = Exclude<Route, TabRoute>;
const PARENT_TAB: Record<PushedRoute, TabRoute> = {
  device: 'devices',
  add: 'devices',
  'add-room': 'rooms',
};

export const isTab = (route: Route): route is TabRoute => (TAB_ROUTES as readonly string[]).includes(route);

const DEFAULT_ROUTE: Route = 'devices';

export interface ParsedRoute {
  route: Route;
  /** The second path segment, for the one route that has a parameter (the device's id). */
  param: string | undefined;
}

export function parseHash(hash: string): ParsedRoute {
  const [name = '', param] = hash.replace(/^#\/?/, '').split('/');
  const route = (ROUTES as readonly string[]).includes(name) ? (name as Route) : DEFAULT_ROUTE;
  return { route, param: route === 'device' && param ? decodeURIComponent(param) : undefined };
}

// Hash routing (#/rooms) rather than the History API, so the app works on a
// static host such as GitHub Pages, and inside an iframe, with no server
// config. Each screen is a history entry, so the phone's Back button closes a
// pushed screen instead of leaving the app.
export function useHashRoute(): ParsedRoute & { leave: () => void } {
  const [parsed, setParsed] = useState<ParsedRoute>(() => parseHash(window.location.hash));
  const current = useRef<Route>(parsed.route);
  // True once a pushed screen was reached by moving around inside this page.
  // Back is only a safe way out of it then: when someone opens a link straight
  // to #/add, history.back() would leave the app (or, in the site's preview
  // dialog, undo the dialog opening).
  const arrivedFromApp = useRef(false);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash(window.location.hash);
      if (!isTab(next.route) && current.current !== next.route) arrivedFromApp.current = true;
      current.current = next.route;
      setParsed((previous) => (previous.route === next.route && previous.param === next.param ? previous : next));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  /** Closes a pushed screen: Back when that is safe, otherwise replaces the entry with its parent tab. */
  const leave = useCallback(() => {
    if (arrivedFromApp.current) {
      window.history.back();
      return;
    }
    const route = current.current;
    window.location.replace(`#/${isTab(route) ? route : PARENT_TAB[route]}`);
  }, []);

  return { ...parsed, leave };
}
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/state src/router src/data/product.test.ts`
Expected: PASS, 53 tests in 3 files (reducer 35, router 13, product 5).

- [ ] **Step 6: Commit**

```bash
git add -A packages/mobile-app
git commit -m "feat(mobile-app): a reducer for rooms, presets and links, and hash routes for a device's page" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 6: Icons, the glowing glyph, signal bars, the app bar and the bottom nav

**Files:**
- Replace: `src/icons/index.tsx`, `src/icons/index.test.tsx`, `src/components/AppBar.tsx`, `src/components/BottomNav.tsx`, `src/components/BottomNav.test.tsx`, `src/components/TouchRow.tsx`
- Create: `src/components/Glyph.tsx`, `src/components/Glyph.test.tsx`, `src/components/SignalBars.tsx`, `src/components/SignalBars.test.tsx`
- Unchanged: `src/components/AppBar.test.tsx`, `src/components/TouchRow.test.tsx`, `src/components/ScreenTitle.tsx`

- [ ] **Step 1: Write the tests**

`src/components/Glyph.test.tsx`. The glyph is the one bold thing, so its tests are about proportion: dark at level 0 (no halo at all), a halo that grows brighter and wider with the level, a gradient id of its own per glyph (two on one screen must not share one), and colour only through classes (no inline style, no colour attribute), which is how the accent token reaches the glow. `gradientId` is exported and tested because the id `useId` returns depends on the React 19 minor (`:r1:`, `«r1»` or `_r_1_`), and a test that only ran on the installed version could not tell a working sanitiser from none.

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DEVICE_KINDS } from '../data/types';
import { haloOpacity, haloRadius } from '../utils/glow';
import { Glyph, gradientId } from './Glyph';

const svgOf = (container: HTMLElement) => container.querySelector('svg')!;

describe('Glyph', () => {
  it('draws something decorative for every kind of device', () => {
    for (const kind of DEVICE_KINDS) {
      const { container, unmount } = render(<Glyph kind={kind} level={50} />);
      expect(svgOf(container), kind).toHaveAttribute('aria-hidden', 'true');
      expect(container.querySelectorAll('path, circle').length, `${kind} draws nothing`).toBeGreaterThan(1);
      unmount();
    }
  });

  it('is dark at level 0: no halo at all, and no lit class', () => {
    const { container } = render(<Glyph kind="light" level={0} />);
    expect(container.querySelector('.glyph-halo')).toBeNull();
    expect(svgOf(container)).not.toHaveClass('glyph--lit');
    expect(container.querySelector('.glyph-body')).toHaveAttribute('fill-opacity', '0');
  });

  it('glows in proportion to its level: the halo grows brighter and wider, and the body fills more', () => {
    const read = (level: number) => {
      const { container, unmount } = render(<Glyph kind="light" level={level} />);
      const halo = container.querySelector('.glyph-halo')!;
      const result = {
        opacity: Number(halo.getAttribute('opacity')),
        radius: Number(halo.getAttribute('r')),
        body: Number(container.querySelector('.glyph-body')!.getAttribute('fill-opacity')),
        lit: svgOf(container).classList.contains('glyph--lit'),
      };
      unmount();
      return result;
    };
    const dim = read(10);
    const medium = read(50);
    const bright = read(100);
    expect([dim.lit, medium.lit, bright.lit]).toEqual([true, true, true]);
    expect(dim.opacity).toBeLessThan(medium.opacity);
    expect(medium.opacity).toBeLessThan(bright.opacity);
    expect(dim.radius).toBeLessThan(medium.radius);
    expect(medium.radius).toBeLessThan(bright.radius);
    expect(dim.body).toBeLessThan(bright.body);
    expect(medium).toMatchObject({ opacity: haloOpacity(50), radius: haloRadius(50) });
  });

  it('gives each glyph its own gradient id, so two on one screen never share a halo', () => {
    const { container } = render(
      <>
        <Glyph kind="light" level={40} />
        <Glyph kind="light" level={90} />
      </>,
    );
    const ids = [...container.querySelectorAll('radialGradient')].map((gradient) => gradient.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(id).not.toMatch(/[:\s]/);
    const fills = [...container.querySelectorAll('.glyph-halo')].map((halo) => halo.getAttribute('fill'));
    expect(fills).toEqual(ids.map((id) => `url(#${id})`));
  });

  it('turns whatever useId returns into an id that is safe inside url(#...), in every React 19 format', () => {
    expect(gradientId(':r1:')).toBe('halo-r1');
    expect(gradientId('«r1»')).toBe('halo-r1');
    expect(gradientId('_r_1_')).toBe('halo-_r_1_');
    expect(gradientId('a b:c«d»e')).toBe('halo-abcde');
  });

  it('colours the glow with classes, never inline styles or colour literals, so the accent token reaches it', () => {
    const { container } = render(<Glyph kind="thermostat" level={80} />);
    expect(container.querySelector('[style]')).toBeNull();
    for (const node of container.querySelectorAll('stop, .glyph-body')) expect(node.getAttribute('fill') ?? node.getAttribute('stop-color')).toBeNull();
    expect(container.querySelectorAll('.glyph-stop')).toHaveLength(2);
  });
});
```

`src/components/SignalBars.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SignalBars } from './SignalBars';

describe('SignalBars', () => {
  it('draws four bars and lights as many as the signal', () => {
    const { container } = render(<SignalBars signal={3} />);
    expect(container.querySelectorAll('.signal-bar')).toHaveLength(4);
    expect(container.querySelectorAll('.signal-bar--lit')).toHaveLength(3);
  });

  it('is one image with a label that says the count', () => {
    render(<SignalBars signal={2} />);
    expect(screen.getByRole('img', { name: 'Signal 2 of 4' })).toBeInTheDocument();
  });

  it('keeps the count between none and all four, in the bars and in the label', () => {
    const high = render(<SignalBars signal={9} />);
    expect(high.container.querySelectorAll('.signal-bar--lit')).toHaveLength(4);
    expect(screen.getByRole('img')).toHaveAccessibleName('Signal 4 of 4');
    high.unmount();
    const low = render(<SignalBars signal={-1} />);
    expect(low.container.querySelectorAll('.signal-bar--lit')).toHaveLength(0);
    expect(screen.getByRole('img')).toHaveAccessibleName('Signal 0 of 4');
  });

  it('takes a label of its own', () => {
    render(<SignalBars signal={0} label="No signal" />);
    expect(screen.getByRole('img', { name: 'No signal' })).toBeInTheDocument();
  });

  it('makes each bar taller than the one before', () => {
    const { container } = render(<SignalBars signal={4} />);
    const heights = [...container.querySelectorAll('.signal-bar')].map((bar) => Number(bar.getAttribute('height')));
    expect(heights).toEqual([...heights].sort((a, b) => a - b));
    expect(new Set(heights).size).toBe(4);
  });
});
```

`src/icons/index.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TAB_ROUTES } from '../router/useHashRoute';
import { BackIcon, BatteryLowIcon, CheckIcon, ChevronIcon, CrossIcon, MinusIcon, PlusIcon, TAB_ICONS, WeakSignalIcon } from './index';

describe('icons', () => {
  it('draws an aria-hidden svg for each single icon', () => {
    for (const Icon of [BackIcon, ChevronIcon, PlusIcon, MinusIcon, BatteryLowIcon, WeakSignalIcon, CheckIcon, CrossIcon]) {
      const { container, unmount } = render(<Icon />);
      expect(container.querySelector('svg'), Icon.name).toHaveAttribute('aria-hidden', 'true');
      unmount();
    }
  });

  it('draws an aria-hidden svg for every tab', () => {
    expect(Object.keys(TAB_ICONS).sort()).toEqual([...TAB_ROUTES].sort());
    for (const route of TAB_ROUTES) {
      const Icon = TAB_ICONS[route];
      const { container, unmount } = render(<Icon />);
      expect(container.querySelector('svg'), `${route} draws nothing`).toHaveAttribute('aria-hidden', 'true');
      unmount();
    }
  });
});
```

`src/components/BottomNav.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  it('is the Main navigation, with a link to each tab in order', () => {
    render(<BottomNav route="devices" />);
    const links = screen.getAllByRole('link');
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(links.map((link) => link.textContent)).toEqual(['Home', 'Rooms', 'Settings']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#/devices', '#/rooms', '#/settings']);
  });

  it('marks only the current tab', () => {
    render(<BottomNav route="rooms" />);
    expect(screen.getByRole('link', { name: 'Rooms' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Settings' })).not.toHaveAttribute('aria-current');
  });

  it('marks no tab on a pushed screen', () => {
    render(<BottomNav route="add" />);
    expect(document.querySelector('[aria-current]')).toBeNull();
  });

  it('tells its owner when a tab is pressed', async () => {
    const onNavigate = vi.fn();
    render(<BottomNav route="devices" onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole('link', { name: 'Settings' }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
```

(`AppBar.test.tsx` and `TouchRow.test.tsx` do not change: run them anyway.)

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/components/Glyph.test.tsx src/components/SignalBars.test.tsx src/components/BottomNav.test.tsx src/icons`
Expected: FAIL (no `Glyph`, no `SignalBars`, the icons and the nav still describe the first version).

- [ ] **Step 3: Write the components**

`src/icons/index.tsx`: UI icons only. The device drawings, which glow, are `Glyph`.

```tsx
import type { ReactNode } from 'react';
import type { TabRoute } from '../router/useHashRoute';

// Inline SVG, so the package has no image files to license or lose. Decorative:
// aria-hidden, because the text beside each icon says what it means. Colour is
// currentColor, so CSS (never the SVG) decides it. The device drawings, which
// glow, are not here: they are components/Glyph.tsx.
function Svg({ children, size = 24 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function BackIcon() {
  return (
    <Svg>
      <path d="M15 5 8 12l7 7" />
    </Svg>
  );
}

export function ChevronIcon() {
  return (
    <Svg>
      <path d="m9 5 7 7-7 7" />
    </Svg>
  );
}

export function PlusIcon() {
  return (
    <Svg>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function MinusIcon() {
  return (
    <Svg>
      <path d="M5 12h14" />
    </Svg>
  );
}

/** The small amber marks on a row. The row's own text says what they mean; these only catch the eye. */
export function BatteryLowIcon() {
  return (
    <Svg size={16}>
      <rect x="3" y="7" width="15" height="10" rx="2" />
      <path d="M21 10.5v3" />
      <path d="M6.5 10.5v3" />
    </Svg>
  );
}

export function WeakSignalIcon() {
  return (
    <Svg size={16}>
      <path d="M5 19v-3M10 19v-6M15 19V9M20 19V5" opacity="0.35" />
      <path d="M5 19v-3" />
    </Svg>
  );
}

export function CheckIcon() {
  return (
    <Svg size={20}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Svg>
  );
}

export function CrossIcon() {
  return (
    <Svg size={20}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Svg>
  );
}

// Record<TabRoute, ...> rather than a switch: a tab with no drawing is a
// compile error instead of a blank square.
export const TAB_ICONS: Record<TabRoute, () => ReactNode> = {
  devices: () => (
    <Svg>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v10h12V10" />
      <path d="M10 20v-5h4v5" />
    </Svg>
  ),
  rooms: () => (
    <Svg>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </Svg>
  ),
  settings: () => (
    <Svg>
      <path d="M5 7h9M18 7h1M5 17h1M10 17h9" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </Svg>
  ),
};
```

`src/components/Glyph.tsx`. Each kind is drawn by hand in a 64-unit box as a body (which fills with the accent as the level rises) and lines (drawn white on top). `DRAWINGS` is a `Record<DeviceKind, …>`: a kind without a drawing is a compile error, not a blank square. The halo is a radial gradient circle whose `r` and `opacity` are attributes; the accent is the `.glyph-stop` and `.glyph-body` classes in App.css (Task 11).

```tsx
import { useId, type ReactNode } from 'react';
import type { DeviceKind } from '../data/types';
import { bodyOpacity, haloOpacity, haloRadius } from '../utils/glow';

// The app's one bold idea: each device's drawing really glows, in proportion to
// its level (utils/glow.ts decides the number, this draws it). It is plain inline
// SVG, so there is no image to license or lose, and every value that varies with
// the level is an SVG *attribute* (opacity, r, fill-opacity), never a style
// attribute: noInlineStyles.test.ts stays true, and the colour comes from the
// accent token in App.css (.glyph-stop, .glyph-body), so re-theming reaches it.
//
// Pass level 0 for a dark glyph (the device is off, or its link is down).

interface Drawing {
  /** The part of the drawing that fills with the accent as the level rises. */
  body: ReactNode;
  /** Strokes only: they are drawn in the text colour on top of the glow. */
  lines: ReactNode;
}

// Record<DeviceKind, ...>: a kind without a drawing is a compile error, not a
// blank square. All four are drawn in a 64 by 64 box.
const DRAWINGS: Record<DeviceKind, (fillOpacity: number) => Drawing> = {
  light: (fillOpacity) => ({
    body: (
      <path
        className="glyph-body"
        fillOpacity={fillOpacity}
        d="M32 9C22.6 9 15 16.4 15 25.6c0 5.8 3 10.9 7.6 13.9 1.4.9 2.2 2.4 2.2 4V45h14.4v-1.5c0-1.6.8-3.1 2.2-4C46 36.5 49 31.4 49 25.6 49 16.4 41.4 9 32 9Z"
      />
    ),
    lines: <path d="M26 51h12M28 56h8" />,
  }),
  plug: (fillOpacity) => ({
    body: <path className="glyph-body" fillOpacity={fillOpacity} d="M16 20h32v10a16 16 0 0 1-32 0V20Z" />,
    lines: <path d="M24 8v12M40 8v12M32 46v10" />,
  }),
  thermostat: (fillOpacity) => ({
    body: <circle className="glyph-body" fillOpacity={fillOpacity} cx="32" cy="32" r="22" />,
    lines: <path d="M21 41a14 14 0 1 1 22 0M32 17v6" />,
  }),
  sensor: (fillOpacity) => ({
    body: <circle className="glyph-body" fillOpacity={fillOpacity} cx="32" cy="32" r="5" />,
    lines: <path d="M24.9 24.9a10 10 0 0 0 0 14.2M39.1 24.9a10 10 0 0 1 0 14.2M19.2 19.2a18 18 0 0 0 0 25.6M44.8 19.2a18 18 0 0 1 0 25.6" />,
  }),
};

interface GlyphProps {
  kind: DeviceKind;
  /** 0 (dark) to 100 (brightest), from glowLevel(device). */
  level: number;
}

/**
 * An id for one glyph's gradient, made from React's useId. What useId returns
 * depends on the React version (":r1:" in 19.0, "«r1»" in 19.1, "_r_1_" in
 * 19.2), and not every character is safe inside a url(#...) that CSS reads, so
 * everything but letters, digits, "_" and "-" is dropped.
 */
export const gradientId = (reactId: string): string => `halo-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

export function Glyph({ kind, level }: GlyphProps) {
  const haloId = gradientId(useId());
  const lit = level > 0;
  const { body, lines } = DRAWINGS[kind](bodyOpacity(level));
  return (
    <svg className={lit ? 'glyph glyph--lit' : 'glyph'} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {lit && (
        <>
          <defs>
            <radialGradient id={haloId}>
              <stop className="glyph-stop" offset="0" stopOpacity="0.8" />
              <stop className="glyph-stop" offset="1" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle className="glyph-halo" cx="32" cy="32" r={haloRadius(level)} opacity={haloOpacity(level)} fill={`url(#${haloId})`} />
        </>
      )}
      {body}
      {lines}
    </svg>
  );
}
```

`src/components/SignalBars.tsx`:

```tsx
import { SIGNAL_BARS } from '../data/types';

/**
 * Four bars, the first `signal` of them lit. The drawing says nothing a
 * screen reader needs beyond the count, so it is one image with a label; the
 * bars are the SVG's own rectangles, lit or dim by class (App.css), and their
 * heights are attributes, so no inline style is needed.
 */
export function SignalBars({ signal, label }: { signal: number; label?: string }) {
  const lit = Math.max(0, Math.min(SIGNAL_BARS, signal));
  return (
    <svg
      className="signal-bars"
      viewBox="0 0 24 20"
      width="24"
      height="20"
      role="img"
      aria-label={label ?? `Signal ${lit} of ${SIGNAL_BARS}`}
    >
      {Array.from({ length: SIGNAL_BARS }, (_, index) => {
        const height = 5 + index * 4.5;
        return <rect key={index} className={index < lit ? 'signal-bar signal-bar--lit' : 'signal-bar'} x={index * 6.2} y={20 - height} width="4.2" height={height} rx="1" />;
      })}
    </svg>
  );
}
```

`src/components/AppBar.tsx`:

```tsx
import { Badge } from 'cyberui-2045';
import { DEMO_BADGE, PRODUCT_NAME } from '../data/product';
import { BackIcon } from '../icons';

/**
 * The bar at the top of every screen: the app's name and the "Demo" badge, the
 * one signal that stays on screen to say nothing here is real (Settings, the
 * Scan screen and the README say the rest). Pass onBack on a screen that was
 * pushed on top of another, and a Back button appears.
 */
export function AppBar({ onBack }: { onBack?: () => void }) {
  return (
    <header className="app-bar">
      {onBack && (
        <button type="button" className="app-bar-back" onClick={onBack}>
          <BackIcon />
          <span>Back</span>
        </button>
      )}
      <span className="app-bar-name">{PRODUCT_NAME}</span>
      <Badge variant="neutral" size="sm" shape="rounded" shadow={false}>
        {DEMO_BADGE}
      </Badge>
    </header>
  );
}
```

`src/components/BottomNav.tsx`: three tabs, and an `onNavigate` so moving to another tab can clear the notice.

```tsx
import { ROUTE_TITLES } from '../data/product';
import { TAB_ICONS } from '../icons';
import { TAB_ROUTES, type Route } from '../router/useHashRoute';

// cyberui-2045 has no bottom navigation (its TabNavigation is a strip along the
// top; a bottom bar is an open feature request, patrickkuei/CyberUI#131), so
// this is hand-built from plain links and
// App.css. They are real <a href="#/..."> links, so the browser's Back and
// Forward buttons, a long-press and "copy link" all work, and the current tab
// is marked with aria-current for screen readers. Three tabs, not five: more
// than that stops fitting a 320px screen with 44px targets and readable labels.
// A pushed screen (a device's page, Add device) marks none and hides the bar.
export function BottomNav({ route, onNavigate }: { route: Route; onNavigate?: () => void }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TAB_ROUTES.map((tab) => {
        const Icon = TAB_ICONS[tab];
        return (
          <a key={tab} href={`#/${tab}`} className="nav-tab" aria-current={route === tab ? 'page' : undefined} onClick={onNavigate}>
            <Icon />
            <span>{ROUTE_TITLES[tab]}</span>
          </a>
        );
      })}
    </nav>
  );
}
```

`src/components/TouchRow.tsx`: only its comment changes, to say the lesson of the knob (a wrapper that stretches a library control's markup has side effects, so look at it in a browser).

```tsx
import type { ReactNode } from 'react';

type Control = 'switch' | 'slider' | 'radios';

// Class names live in App.css ("Touch targets"), where the 44px rule is
// written down once. A Record over Control, so a new control type has to say
// which rule it gets.
const CLASS_NAMES: Record<Control, string> = {
  switch: 'touch-switch',
  slider: 'touch-slider',
  radios: 'touch-radios',
};

/**
 * Wrap every cyberui-2045 control that is smaller than 44 by 44 CSS pixels in
 * this, because on a phone a thumb needs about that much to hit it. In 2.8.0
 * that is Toggle (a 28 or 32px track), Checkbox (20 or 24px), RadioGroup
 * (20px rows) and Slider (a 20 or 24px thumb on an 8 or 12px track). Making
 * the control itself bigger is not an option the library offers (a touch-size
 * option is an open feature request, patrickkuei/CyberUI#133), so the rule
 * is a class here that stretches the part
 * of the control that takes the tap, without changing how it looks. App.css
 * has the rules and says which part of the library's markup each one relies
 * on; re-check them when you upgrade cyberui-2045 (the README's Phone
 * checklist).
 *
 * Stretching a part of the library's markup has side effects, and the switch
 * is the example: its label grows to 44px, and the knob, which the library
 * positions against that label, slides out of the 32px track unless App.css
 * also makes the track the positioned element. Whenever you resize or pad
 * something around a library control, look at it in a browser.
 *
 * Do not "clean this up" as an extra wrapper: removing it brings back
 * switches and sliders that are hard to hit. Button and Input are already 44px
 * or more at size md, so they do not need it.
 */
export function TouchRow({ control, children }: { control: Control; children: ReactNode }) {
  return <div className={CLASS_NAMES[control]}>{children}</div>;
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/components/Glyph.test.tsx src/components/SignalBars.test.tsx src/components/AppBar.test.tsx src/components/BottomNav.test.tsx src/components/TouchRow.test.tsx src/icons`
Expected: PASS, 21 tests in 6 files (icons 2, Glyph 6, SignalBars 5, TouchRow 1, AppBar 3, BottomNav 4).

- [ ] **Step 5: Commit**

```bash
git add -A packages/mobile-app
git commit -m "feat(mobile-app): a glyph that glows in proportion to its level, signal bars, and a three-tab nav" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 7: The device row and the link steps

**Files:**
- Replace: `src/components/DeviceRow.tsx`, `src/components/DeviceRow.test.tsx`
- Create: `src/components/LinkRun.tsx`, `src/components/LinkRun.test.tsx`

- [ ] **Step 1: Write the tests**

`src/components/DeviceRow.test.tsx` is Review Focus 3 and 4 in one file: two sibling controls and neither inside the other; no mark and no badge on a healthy device; a small amber mark that is also in words for a low battery and for a weak signal; a dashed row, the word for the link and a disabled button for a device that is down; a sensor with no power button; and the level bar under a light only (empty while it is off).

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STARTING_DEVICES } from '../data/devices';
import type { Device } from '../data/types';
import { DeviceRow, devicePath } from './DeviceRow';

const byId = (id: string): Device => STARTING_DEVICES.find((device) => device.id === id)!;
const with_ = (id: string, change: Record<string, unknown>): Device => ({ ...byId(id), ...change }) as Device;

function renderRow(device: Device, onToggle = vi.fn(), unit: 'C' | 'F' = 'C') {
  render(
    <ul>
      <DeviceRow device={device} unit={unit} onToggle={onToggle} />
    </ul>,
  );
  return { onToggle, row: screen.getByRole('listitem') };
}

describe('DeviceRow', () => {
  it('has two sibling controls: a power switch and a link to the device page, never one inside the other', () => {
    const { row } = renderRow(byId('desk-lamp'));
    const power = within(row).getByRole('switch', { name: 'Desk lamp power' });
    const link = within(row).getByRole('link', { name: /Desk lamp/ });
    expect(link).toHaveAttribute('href', '#/device/desk-lamp');
    expect(power.contains(link)).toBe(false);
    expect(link.contains(power)).toBe(false);
    expect(power.parentElement).toBe(link.parentElement);
  });

  it('shows its name and one value at the right', () => {
    const { row } = renderRow(byId('desk-lamp'));
    expect(within(row).getByText('Desk lamp')).toBeInTheDocument();
    expect(within(row).getByText('70%')).toBeInTheDocument();
  });

  it('is checked while the device is on, unchecked while it is off, and the glyph button is what flips it', async () => {
    const { onToggle } = renderRow(byId('desk-lamp'));
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(screen.getByRole('switch'));
    expect(onToggle).toHaveBeenCalledWith('desk-lamp');
  });

  it('is unchecked for a light that is off, and says Off', () => {
    const { row } = renderRow(byId('bedside-lamp'));
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(within(row).getByText('Off')).toBeInTheDocument();
  });

  it('does not toggle when the link is pressed', async () => {
    const { onToggle } = renderRow(byId('tv-plug'));
    await userEvent.click(screen.getByRole('link', { name: /TV plug/ }));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('draws a level bar under a light, filled to its level, and empty while it is off', () => {
    const on = render(
      <ul>
        <DeviceRow device={byId('desk-lamp')} unit="C" onToggle={vi.fn()} />
      </ul>,
    );
    expect(on.container.querySelector('.level-bar-fill')).toHaveAttribute('width', '70');
    on.unmount();
    const off = render(
      <ul>
        <DeviceRow device={byId('bedside-lamp')} unit="C" onToggle={vi.fn()} />
      </ul>,
    );
    expect(off.container.querySelector('.level-bar-fill')).toHaveAttribute('width', '0');
  });

  it('draws no level bar for anything but a light', () => {
    for (const id of ['tv-plug', 'hall-thermostat', 'living-sensor']) {
      const { container, unmount } = render(
        <ul>
          <DeviceRow device={byId(id)} unit="C" onToggle={vi.fn()} />
        </ul>,
      );
      expect(container.querySelector('.level-bar'), id).toBeNull();
      unmount();
    }
  });

  describe('a sensor', () => {
    it('shows its reading as the value and has no power button', () => {
      const { row } = renderRow(byId('living-sensor'));
      expect(within(row).getByText('21.5°')).toBeInTheDocument();
      expect(within(row).queryByRole('switch')).not.toBeInTheDocument();
      expect(within(row).getByRole('link', { name: /Living room sensor/ })).toBeInTheDocument();
    });

    it('shows the reading in Fahrenheit when that is the unit', () => {
      const { row } = renderRow(byId('living-sensor'), vi.fn(), 'F');
      expect(within(row).getByText('71°')).toBeInTheDocument();
    });
  });

  describe('status only by exception', () => {
    it('shows no mark and no badge for a healthy device', () => {
      const { row } = renderRow(byId('desk-lamp'));
      expect(row.querySelector('.mark')).toBeNull();
      expect(row).not.toHaveTextContent(/online|battery|weak|lost|offline/i);
    });

    it('marks a low battery with a small amber mark that is also in words for assistive technology', () => {
      const { row } = renderRow(byId('bedroom-sensor'));
      expect(row.querySelectorAll('.mark')).toHaveLength(1);
      expect(within(row).getByRole('link')).toHaveAccessibleName(/Bedroom sensor Low battery/);
    });

    it('marks a weak signal the same way', () => {
      const { row } = renderRow(byId('fan-plug'));
      expect(row.querySelectorAll('.mark')).toHaveLength(1);
      expect(within(row).getByRole('link')).toHaveAccessibleName(/Fan plug Weak signal/);
    });

    it('is dashed and muted with the word Lost for a lost device, and its power button is disabled', () => {
      const { row } = renderRow(byId('hall-light'));
      expect(row).toHaveClass('device-row--down');
      expect(within(row).getByText('Lost')).toBeInTheDocument();
      expect(within(row).getByRole('switch')).toBeDisabled();
      expect(within(row).getByRole('switch')).toHaveAttribute('aria-checked', 'false');
      expect(row.querySelector('.level-bar')).toBeNull();
      expect(row.querySelector('.mark')).toBeNull();
    });

    it('says Offline for a device that was disconnected', () => {
      const { row } = renderRow(with_('desk-lamp', { link: 'offline' }));
      expect(row).toHaveClass('device-row--down');
      expect(within(row).getByText('Offline')).toBeInTheDocument();
      expect(within(row).getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    });

    it('does not call a sensor on: a lost sensor is down and has no power button either', () => {
      const { row } = renderRow(with_('living-sensor', { link: 'lost' }));
      expect(row).toHaveClass('device-row--down');
      expect(within(row).getByText('Lost')).toBeInTheDocument();
      expect(within(row).queryByRole('switch')).not.toBeInTheDocument();
    });
  });

  it('colours the value as lit only while the device is on', () => {
    const on = render(
      <ul>
        <DeviceRow device={byId('tv-plug')} unit="C" onToggle={vi.fn()} />
      </ul>,
    );
    expect(on.container.querySelector('.device-value')).toHaveClass('device-value--on');
    on.unmount();
    const off = render(
      <ul>
        <DeviceRow device={byId('fan-plug')} unit="C" onToggle={vi.fn()} />
      </ul>,
    );
    expect(off.container.querySelector('.device-value')).not.toHaveClass('device-value--on');
  });

  it('builds the link to a device page from its id, encoded', () => {
    expect(devicePath('desk-lamp')).toBe('#/device/desk-lamp');
    expect(devicePath('a b')).toBe('#/device/a%20b');
  });
});
```

`src/components/LinkRun.test.tsx` runs on fake timers and presses with `fireEvent` (the comment at the top says why). It covers the checklist as the connection reports it, the bar, `Linked.`, `onLinked` once after the settle time, the failed step with its reason and Try again and Cancel, starting over, no timer left after Cancel or an unmount, and the case a mutation found: **a link that was replaced** (the id changes mid-link) must not be reported as a failure of the new one.

```tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createScriptedConnection } from '../connection';
import { LinkRun } from './LinkRun';

// Everything here runs on fake timers: the scripted connection takes
// 4 steps x 100ms, and no test waits for real time. userEvent waits on real
// timers between its steps, which a fake clock never fires, so presses here are
// fireEvent (synchronous), not userEvent.
const connection = createScriptedConnection({ stepMs: 100 });
const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const steps = () => within(screen.getByRole('list')).getAllByRole('listitem');

describe('LinkRun', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at the first step with an empty progress bar and a Cancel button', () => {
    render(<LinkRun connection={connection} id="shelf-lamp" onLinked={vi.fn()} onCancel={vi.fn()} />);
    expect(steps().map((step) => step.textContent)).toEqual([
      'Device found: in progress',
      'Pairing code accepted: waiting',
      'Securing the link: waiting',
      'Ready: waiting',
    ]);
    expect(screen.getByRole('progressbar', { name: 'Link progress' })).toHaveAttribute('value', '0');
    expect(screen.getByRole('status')).toHaveTextContent('Linking…');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('ticks the steps off as the connection reports them, and moves the bar', async () => {
    render(<LinkRun connection={connection} id="shelf-lamp" onLinked={vi.fn()} onCancel={vi.fn()} />);
    await advance(100);
    expect(steps()[0]).toHaveTextContent('Device found: done');
    expect(steps()[1]).toHaveTextContent('Pairing code accepted: in progress');
    expect(steps()[1]).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '25');
    await advance(200);
    expect(steps()[2]).toHaveTextContent('Securing the link: done');
    expect(steps()[3]).toHaveTextContent('Ready: in progress');
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '75');
  });

  it('shows every step done and says Linked, then calls onLinked once after the settle time', async () => {
    const onLinked = vi.fn();
    render(<LinkRun connection={connection} id="shelf-lamp" onLinked={onLinked} onCancel={vi.fn()} settleMs={300} />);
    await advance(400);
    expect(steps().map((step) => step.textContent?.split(': ')[1])).toEqual(['done', 'done', 'done', 'done']);
    expect(screen.getByRole('status')).toHaveTextContent('Linked.');
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '100');
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    expect(onLinked).not.toHaveBeenCalled();
    await advance(300);
    expect(onLinked).toHaveBeenCalledTimes(1);
    await advance(2000);
    expect(onLinked).toHaveBeenCalledTimes(1);
  });

  it('marks the step that failed, shows the reason, and offers Try again and Cancel', async () => {
    const onLinked = vi.fn();
    render(<LinkRun connection={connection} id="hall-light" onLinked={onLinked} onCancel={vi.fn()} />);
    await advance(1000);
    expect(steps().map((step) => step.textContent?.split(': ')[1])).toEqual(['done', 'done', 'failed', 'waiting']);
    expect(screen.getByRole('status')).toHaveTextContent('The link failed: No response from the hub');
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '50');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(onLinked).not.toHaveBeenCalled();
  });

  it('starts over from the first step on Try again, and fails the same way, since the script says it does', async () => {
    render(<LinkRun connection={connection} id="hall-light" onLinked={vi.fn()} onCancel={vi.fn()} />);
    await advance(1000);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(steps()[0]).toHaveTextContent('Device found: in progress');
    expect(screen.getByRole('status')).toHaveTextContent('Linking…');
    await advance(1000);
    expect(screen.getByRole('status')).toHaveTextContent('The link failed: No response from the hub');
  });

  it('calls onCancel from Cancel, and stops: nothing more is reported', async () => {
    const onCancel = vi.fn();
    const onLinked = vi.fn();
    const { unmount } = render(<LinkRun connection={connection} id="shelf-lamp" onLinked={onLinked} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    unmount();
    await advance(5000);
    expect(onLinked).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('aborts the link when it is unmounted part-way, so no timer is left behind', async () => {
    const { unmount } = render(<LinkRun connection={connection} id="shelf-lamp" onLinked={vi.fn()} onCancel={vi.fn()} />);
    await advance(150);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('is not told it failed by a link it replaced: when the id changes mid-link the old one is aborted and the new one runs on', async () => {
    const onLinked = vi.fn();
    const { rerender } = render(<LinkRun connection={connection} id="shelf-lamp" onLinked={onLinked} onCancel={vi.fn()} settleMs={0} />);
    await advance(150);
    rerender(<LinkRun connection={connection} id="kettle-plug" onLinked={onLinked} onCancel={vi.fn()} settleMs={0} />);
    // Let the old link's rejection arrive: it must not be mistaken for a failure of the new one.
    await advance(1);
    expect(steps()[0]).toHaveTextContent('Device found: in progress');
    expect(screen.getByRole('status')).toHaveTextContent('Linking…');
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
    await advance(500);
    expect(screen.getByRole('status')).toHaveTextContent('Linked.');
    expect(onLinked).toHaveBeenCalledTimes(1);
  });

  it('does not restart the link when its owner passes a new onLinked', async () => {
    const link = vi.fn(connection.link);
    const counting = { ...connection, link };
    const { rerender } = render(<LinkRun connection={counting} id="shelf-lamp" onLinked={vi.fn()} onCancel={vi.fn()} />);
    rerender(<LinkRun connection={counting} id="shelf-lamp" onLinked={vi.fn()} onCancel={vi.fn()} />);
    expect(link).toHaveBeenCalledTimes(1);
  });

  it('uses the latest onLinked when the link finishes', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<LinkRun connection={connection} id="shelf-lamp" onLinked={first} onCancel={vi.fn()} settleMs={0} />);
    rerender(<LinkRun connection={connection} id="shelf-lamp" onLinked={second} onCancel={vi.fn()} settleMs={0} />);
    await advance(500);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/components/DeviceRow.test.tsx src/components/LinkRun.test.tsx`
Expected: FAIL (the old row has a status badge and a `Toggle`; `LinkRun` does not exist).

- [ ] **Step 3: Write the components**

`src/components/DeviceRow.tsx`. The glyph is the power button (`role="switch"`, `aria-checked`, named "Desk lamp power"), the rest of the row is a link to the device's page. The comment says why they are siblings.

```tsx
import type { Device, TemperatureUnit } from '../data/types';
import { BatteryLowIcon, WeakSignalIcon } from '../icons';
import { describeDevice } from '../utils/describeDevice';
import { glowLevel } from '../utils/glow';
import { attentionOf, isOn, isReachable, isSwitchable } from '../utils/summary';
import { Glyph } from './Glyph';

interface DeviceRowProps {
  device: Device;
  unit: TemperatureUnit;
  onToggle: (id: string) => void;
}

/** The link to a device's own page. Rows and the Rooms screen both build it here. */
export const devicePath = (deviceId: string) => `#/device/${encodeURIComponent(deviceId)}`;

/**
 * One device on Home. Two sibling controls, never one inside the other (a
 * switch nested in a link is invalid and breaks both for assistive technology):
 *  - the glyph is the quick power button, and is lit when the device is on;
 *  - the rest of the row is a link to the device's page, where the full
 *    controls live. That is the app's "two depths": glance and flip a switch
 *    here, go one tap deeper to do anything else.
 * A sensor has no power state, so its glyph is not a button and its reading is
 * the row's value. A device that cannot be reached shows the word for it
 * ("Lost", "Offline") in a dashed, muted row, and its button is disabled.
 */
export function DeviceRow({ device, unit, onToggle }: DeviceRowProps) {
  const reachable = isReachable(device);
  const reasons = attentionOf(device);
  const classes = ['device-row', reachable ? '' : 'device-row--down', device.kind === 'sensor' ? 'device-row--sensor' : ''].filter(Boolean).join(' ');
  return (
    <li className={classes}>
      {isSwitchable(device) ? (
        // role="switch" and aria-checked: it is a button that sets a state. The
        // glyph inside is decorative, the state is in aria-checked, and the
        // name says what it switches ("Desk lamp power").
        <button
          type="button"
          role="switch"
          aria-checked={reachable && device.on}
          aria-label={`${device.name} power`}
          className="glyph-button"
          disabled={!reachable}
          onClick={() => onToggle(device.id)}
        >
          <Glyph kind={device.kind} level={glowLevel(device)} />
        </button>
      ) : (
        <span className="glyph-button glyph-button--static">
          <Glyph kind={device.kind} level={glowLevel(device)} />
        </span>
      )}
      <a className="device-link" href={devicePath(device.id)}>
        <span className="device-text">
          <span className="device-name">{device.name}</span>
          {/* Status only by exception: a small amber mark, and words for assistive technology. */}
          {reasons.includes('battery') && (
            <span className="mark">
              <BatteryLowIcon />
              <span className="sr-only">Low battery</span>
            </span>
          )}
          {reasons.includes('weak') && (
            <span className="mark">
              <WeakSignalIcon />
              <span className="sr-only">Weak signal</span>
            </span>
          )}
        </span>
        <span className={isOn(device) ? 'device-value device-value--on' : 'device-value'}>{describeDevice(device, unit)}</span>
      </a>
      {device.kind === 'light' && reachable && (
        // A thin bar under the row: its fill is the light's level, and empty while the light is off.
        <svg className="level-bar" viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <rect className="level-bar-fill" width={device.on ? device.level : 0} height="2" />
        </svg>
      )}
    </li>
  );
}
```

`src/components/LinkRun.tsx`. It asks the `Connection` to link and only draws what it reports. Its effect aborts the link on cleanup and **ignores the abort's own rejection**, otherwise a replaced link would overwrite the new one with "failed". `onLinked` is read from a ref so a parent re-rendering with a new function does not restart the link.

```tsx
import { useEffect, useRef, useState } from 'react';
import { Button } from 'cyberui-2045';
import { LINK_STEPS, LinkError, isAbort, type Connection, type LinkStep } from '../connection';
import { CONNECT_COPY, LINK_STEP_LABELS } from '../data/product';
import { CheckIcon, CrossIcon } from '../icons';

interface RunState {
  status: 'running' | 'done' | 'failed';
  step: LinkStep;
  percent: number;
  message?: string;
}

interface LinkRunProps {
  connection: Connection;
  /** What to link: a nearby id, an existing device's id (Reconnect) or a typed pairing code. */
  id: string;
  /** Called once the link is ready and its checklist has been on screen for a moment. */
  onLinked: () => void;
  onCancel: () => void;
  /** How long the finished checklist stays before onLinked. Tests pass 0. */
  settleMs?: number;
}

type RowState = 'done' | 'active' | 'failed' | 'pending';

function rowState(index: number, run: RunState): RowState {
  if (run.status === 'done') return 'done';
  const current = LINK_STEPS.indexOf(run.step);
  if (index < current) return 'done';
  if (index > current) return 'pending';
  return run.status === 'failed' ? 'failed' : 'active';
}

const ROW_WORDS: Record<RowState, string> = { done: 'done', active: 'in progress', failed: 'failed', pending: 'waiting' };

/**
 * The handshake as a checklist with a progress bar: Add device uses it after a
 * device is picked and the device page uses it for Reconnect, so the two look
 * and fail the same way. It asks the Connection (connection/types.ts) to link
 * and only draws what the Connection reports; whether the link works is the
 * Connection's business, and the scripted one fails for exactly one device
 * (data/nearby.ts) so the failed state can be seen. Leaving the screen aborts
 * the link and its timers.
 */
export function LinkRun({ connection, id, onLinked, onCancel, settleMs = 600 }: LinkRunProps) {
  const [attempt, setAttempt] = useState(0);
  const [run, setRun] = useState<RunState>({ status: 'running', step: LINK_STEPS[0], percent: 0 });
  // The latest callback, read when the link finishes, so a parent re-rendering
  // with a new function does not restart the link.
  const linked = useRef(onLinked);
  useEffect(() => {
    linked.current = onLinked;
  }, [onLinked]);

  useEffect(() => {
    const controller = new AbortController();
    let settle: ReturnType<typeof setTimeout> | undefined;
    setRun({ status: 'running', step: LINK_STEPS[0], percent: 0 });
    connection
      .link(id, ({ step, percent }) => setRun({ status: 'running', step, percent }), controller.signal)
      .then(() => {
        setRun((previous) => ({ status: 'done', step: previous.step, percent: 100 }));
        settle = setTimeout(() => linked.current(), settleMs);
      })
      .catch((error: unknown) => {
        if (isAbort(error)) return;
        const message = error instanceof Error ? error.message : 'Something went wrong';
        setRun((previous) => ({ status: 'failed', step: error instanceof LinkError ? error.step : previous.step, percent: previous.percent, message }));
      });
    return () => {
      controller.abort();
      clearTimeout(settle);
    };
  }, [connection, id, attempt, settleMs]);

  const statusText = run.status === 'failed' ? `${CONNECT_COPY.linkFailed}: ${run.message}` : run.status === 'done' ? 'Linked.' : 'Linking…';

  return (
    <div className="link-run">
      <ol className="link-steps">
        {LINK_STEPS.map((step, index) => {
          const state = rowState(index, run);
          return (
            <li key={step} className={`link-step link-step--${state}`} aria-current={state === 'active' ? 'step' : undefined}>
              <span className="link-step-mark" aria-hidden="true">
                {state === 'done' ? <CheckIcon /> : state === 'failed' ? <CrossIcon /> : null}
              </span>
              <span>{LINK_STEP_LABELS[step]}</span>
              <span className="sr-only">{`: ${ROW_WORDS[state]}`}</span>
            </li>
          );
        })}
      </ol>
      <progress className="progress" max={100} value={run.percent} aria-label="Link progress" />
      {/* role="status" is a polite live region; it is in the page from the start, before its text changes. */}
      <p role="status" className={run.status === 'failed' ? 'link-status link-status--failed' : 'link-status'}>
        {statusText}
      </p>
      <div className="stack">
        {run.status === 'failed' && <Button onClick={() => setAttempt((count) => count + 1)}>{CONNECT_COPY.tryAgain}</Button>}
        {run.status !== 'done' && (
          <Button variant="secondary" onClick={onCancel}>
            {CONNECT_COPY.cancel}
          </Button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/components/DeviceRow.test.tsx src/components/LinkRun.test.tsx`
Expected: PASS, 27 tests in 2 files (DeviceRow 17, LinkRun 10).

- [ ] **Step 5: Commit**

```bash
git add -A packages/mobile-app
git commit -m "feat(mobile-app): a device row with a glyph power button, and the link steps" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 8: Home, Rooms, Add room and Settings

**Files:**
- Create: `src/screens/HomeScreen.tsx`, `src/screens/HomeScreen.test.tsx`, `src/screens/RoomsScreen.tsx`, `src/screens/RoomsScreen.test.tsx`, `src/screens/AddRoomScreen.tsx`, `src/screens/AddRoomScreen.test.tsx`
- Replace: `src/screens/SettingsScreen.tsx`, `src/screens/SettingsScreen.test.tsx`

- [ ] **Step 1: Write the tests**

Reusing text across screens repeats it (a room's name is a chip and a heading; "Turn off" is on every room), so these tests scope with `within(...)` or query by the names the buttons carry ("Turn off Living room"), and the one place a happy-dom quirk shows (the heading's name has a space before the colon) is handled by a helper with a comment.

`src/screens/HomeScreen.test.tsx`:

```tsx
import { useReducer } from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STARTING_DEVICES } from '../data/devices';
import { createInitialState, reducer, type AppState } from '../state/reducer';
import { HomeScreen } from './HomeScreen';

function Harness({ initial = createInitialState() }: { initial?: AppState }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <HomeScreen state={state} dispatch={dispatch} />;
}

// Reusing a component across screens repeats visible text: a room's name is a
// chip and a heading, and a device's name is in its row. Scope queries with
// within(...) rather than renaming anything.
const room = (name: string) => within(screen.getByRole('region', { name: new RegExp(`^${name}`) }));
// happy-dom puts a space before the span's colon when it computes a heading's name ("Living room : 2 of 3 on"); a browser does not. Match either.
const roomHeading = (text: string) => screen.getByRole('heading', { name: (name) => name.replace(' :', ':') === text });
const chips = () => within(screen.getByRole('group', { name: 'Show devices in' }));

describe('HomeScreen', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('has one h1 and says in one sentence how the home is doing', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('4 on, 3 need attention')).toBeInTheDocument();
  });

  it('groups the devices under a heading per room, in room order, each saying how many are on', () => {
    render(<Harness />);
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'Living room: 3 of 3 on',
      'Bedroom: 0 of 2 on',
      'Hall: 1 of 2 on',
    ]);
    expect(room('Living room').getAllByRole('listitem')).toHaveLength(4);
    expect(room('Bedroom').getAllByRole('listitem')).toHaveLength(3);
    expect(room('Hall').getAllByRole('listitem')).toHaveLength(2);
  });

  it('shows no badge anywhere: status is only by exception', () => {
    render(<Harness />);
    expect(screen.queryByText('Online')).not.toBeInTheDocument();
    expect(screen.getByText('Lost')).toBeInTheDocument();
    expect(room('Bedroom').getByRole('link', { name: /Bedroom sensor Low battery/ })).toBeInTheDocument();
    expect(room('Bedroom').getByRole('link', { name: /Fan plug Weak signal/ })).toBeInTheDocument();
  });

  describe('room chips', () => {
    it('lists All and every room, each with its device count', () => {
      render(<Harness />);
      expect(chips().getAllByRole('button').map((chip) => chip.textContent)).toEqual(['All 9', 'Living room 4', 'Bedroom 3', 'Hall 2']);
      expect(chips().getByRole('button', { name: 'All 9' })).toHaveAttribute('aria-pressed', 'true');
      expect(chips().getByRole('button', { name: 'Hall 2' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('shows only that room when a chip is pressed, and everything again on All', async () => {
      render(<Harness />);
      await userEvent.click(chips().getByRole('button', { name: 'Bedroom 3' }));
      expect(chips().getByRole('button', { name: 'Bedroom 3' })).toHaveAttribute('aria-pressed', 'true');
      expect(chips().getByRole('button', { name: 'All 9' })).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Bedroom: 0 of 2 on']);
      await userEvent.click(chips().getByRole('button', { name: 'All 9' }));
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
    });

    it('keeps the sentence about the whole home while one room is shown', async () => {
      render(<Harness />);
      await userEvent.click(chips().getByRole('button', { name: 'Hall 2' }));
      expect(screen.getByText('4 on, 3 need attention')).toBeInTheDocument();
    });

    it('shows everything when the filter points at a room that is gone', () => {
      render(<Harness initial={{ ...createInitialState(), roomFilter: 'nowhere' }} />);
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
      expect(chips().getByRole('button', { name: 'All 9' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('starts on the room Rooms chose', () => {
      render(<Harness initial={{ ...createInitialState(), roomFilter: 'hall' }} />);
      expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Hall: 1 of 2 on']);
    });
  });

  describe('power', () => {
    it("flips only that row's switch, and the sentence and the room heading follow", async () => {
      render(<Harness />);
      const lamp = screen.getByRole('switch', { name: 'Desk lamp power' });
      expect(lamp).toHaveAttribute('aria-checked', 'true');
      await userEvent.click(lamp);
      expect(lamp).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByRole('switch', { name: 'TV plug power' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByText('3 on, 3 need attention')).toBeInTheDocument();
      expect(roomHeading('Living room: 2 of 3 on')).toBeInTheDocument();
      expect(within(room('Living room').getByRole('link', { name: /Desk lamp/ })).getByText('Off')).toBeInTheDocument();
    });

    it('disables the power button of a lost device and gives a sensor none', () => {
      render(<Harness />);
      expect(screen.getByRole('switch', { name: 'Hall light power' })).toBeDisabled();
      expect(room('Living room').getAllByRole('switch')).toHaveLength(3);
    });

    it('turns off a whole room from its heading, and only that room', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: 'Turn off Living room' }));
      expect(room('Living room').getAllByRole('switch').every((toggle) => toggle.getAttribute('aria-checked') === 'false')).toBe(true);
      expect(roomHeading('Living room: 0 of 3 on')).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: 'Hall thermostat power' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('button', { name: 'Turn off Living room' })).toBeDisabled();
    });

    it('disables Turn off for a room with nothing on', () => {
      render(<Harness />);
      expect(screen.getByRole('button', { name: 'Turn off Bedroom' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Turn off Hall' })).toBeEnabled();
    });
  });

  it('shows temperatures in Fahrenheit when the unit says so, without changing what is stored', () => {
    const initial = createInitialState();
    render(<Harness initial={{ ...initial, settings: { ...initial.settings, unit: 'F' } }} />);
    expect(within(room('Hall').getByRole('link', { name: /Hall thermostat/ })).getByText('68°')).toBeInTheDocument();
    expect(within(room('Living room').getByRole('link', { name: /Living room sensor/ })).getByText('71°')).toBeInTheDocument();
  });

  it('goes to Add device from the Add device button, by changing the hash like a link', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
    expect(window.location.hash).toBe('#/add');
  });

  describe('when there is little to show', () => {
    it('says so when there are no devices, and offers the way to add one', () => {
      render(<Harness initial={{ ...createInitialState(), devices: [] }} />);
      expect(screen.getByText('No devices yet. Add one to get started.')).toBeInTheDocument();
      expect(screen.queryByText(/on, /)).not.toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Living room', 'Bedroom', 'Hall']);
      expect(screen.getByRole('button', { name: 'Add device' })).toBeInTheDocument();
    });

    it('says a room is empty, and gives it no Turn off', () => {
      const initial = createInitialState();
      const empty = { ...initial, devices: STARTING_DEVICES.filter((device) => device.roomId !== 'hall') };
      render(<Harness initial={empty} />);
      expect(room('Hall').getByText('Nothing in this room yet.')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Turn off Hall' })).not.toBeInTheDocument();
    });
  });
});
```

`src/screens/RoomsScreen.test.tsx`:

```tsx
import { useReducer } from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInitialState, reducer, type AppState } from '../state/reducer';
import { RoomsScreen } from './RoomsScreen';

function Harness({ initial = createInitialState() }: { initial?: AppState }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <>
      <RoomsScreen state={state} dispatch={dispatch} />
      <p data-testid="notice">{state.notice}</p>
      <p data-testid="filter">{state.roomFilter ?? 'all'}</p>
    </>
  );
}

// Each card repeats "Turn off", "Remove room" and a room's name; the buttons
// carry the room in their names, and queries here use those names.
const card = (name: string) => within(screen.getByRole('heading', { level: 2, name }).closest('li')!);

describe('RoomsScreen', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('has one h1 and a card per room, in order', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { level: 1, name: 'Rooms' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Living room', 'Bedroom', 'Hall']);
  });

  it('shows how many are on and a power figure derived from the devices that are', () => {
    render(<Harness />);
    expect(card('Living room').getByText('96')).toBeInTheDocument();
    expect(card('Living room').getByText('3 of 3 on')).toBeInTheDocument();
    expect(card('Bedroom').getByText('0')).toBeInTheDocument();
    expect(card('Bedroom').getByText('0 of 2 on')).toBeInTheDocument();
  });

  it('lowers the figure when a device in the room is switched off', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Turn off Living room' }));
    expect(card('Living room').getByText('0')).toBeInTheDocument();
    expect(card('Living room').getByText('0 of 3 on')).toBeInTheDocument();
    expect(card('Hall').getByText('1 of 2 on')).toBeInTheDocument();
  });

  it('disables Turn off for a room with nothing on', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Turn off Bedroom' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Turn off Hall' })).toBeEnabled();
  });

  it('opens Home filtered to the room from its chevron', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Show devices in Hall' }));
    expect(screen.getByTestId('filter')).toHaveTextContent('hall');
    expect(window.location.hash).toBe('#/devices');
  });

  it('goes to Add room from the Add room button, by changing the hash like a link', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Add room' }));
    expect(window.location.hash).toBe('#/add-room');
  });

  describe('Remove room', () => {
    it('says plainly why a room that still has devices stays', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: 'Remove room Hall' }));
      expect(screen.getByTestId('notice')).toHaveTextContent('Hall still has 2 devices. Remove them first.');
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
    });

    it('removes a room that is empty', async () => {
      const initial = reducer(createInitialState(), { type: 'room/add', name: 'Kitchen' });
      render(<Harness initial={{ ...initial, notice: null }} />);
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(4);
      await userEvent.click(screen.getByRole('button', { name: 'Remove room Kitchen' }));
      expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Living room', 'Bedroom', 'Hall']);
      expect(screen.getByTestId('notice')).toHaveTextContent('Removed the room Kitchen.');
    });

    it('shows a room with no devices as such, and gives it no Turn off', () => {
      const initial = reducer(createInitialState(), { type: 'room/add', name: 'Kitchen' });
      render(<Harness initial={initial} />);
      expect(card('Kitchen').getByText('0 devices')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Turn off Kitchen' })).not.toBeInTheDocument();
    });
  });
});
```

`src/screens/AddRoomScreen.test.tsx`:

```tsx
import { useReducer } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInitialState, reducer } from '../state/reducer';
import { AddRoomScreen } from './AddRoomScreen';

function Harness({ leave = vi.fn() }: { leave?: () => void }) {
  const [state, dispatch] = useReducer(reducer, createInitialState());
  return (
    <>
      <AddRoomScreen rooms={state.rooms} dispatch={dispatch} leave={leave} />
      <ul aria-label="rooms">
        {state.rooms.map((room) => (
          <li key={room.id}>{room.name}</li>
        ))}
      </ul>
    </>
  );
}

const name = () => screen.getByLabelText('Room name');
const save = () => screen.getByRole('button', { name: 'Add room' });

describe('AddRoomScreen', () => {
  it('has one h1 and one field: a name, with no icon picker and no other control', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { level: 1, name: 'Add room' })).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['Add room', 'Cancel']);
  });

  it('adds the room and leaves the screen', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(name(), 'Kitchen');
    await userEvent.click(save());
    expect(screen.getByRole('list', { name: 'rooms' })).toHaveTextContent('Kitchen');
    expect(leave).toHaveBeenCalledTimes(1);
  });

  it('adds a room from the keyboard with Enter', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(name(), 'Study{Enter}');
    expect(screen.getByRole('list', { name: 'rooms' })).toHaveTextContent('Study');
    expect(leave).toHaveBeenCalled();
  });

  it('requires a name: shows the error, links it to the field, keeps focus there and adds nothing', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(name(), '   ');
    await userEvent.click(save());
    expect(name()).toHaveAttribute('aria-invalid', 'true');
    expect(name()).toHaveAccessibleDescription('Enter a name for the room.');
    expect(name()).toHaveFocus();
    expect(leave).not.toHaveBeenCalled();
    expect(screen.getByRole('list', { name: 'rooms' }).children).toHaveLength(3);
  });

  it('refuses a name that is taken, ignoring case and spaces', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(name(), ' living ROOM ');
    await userEvent.click(save());
    expect(name()).toHaveAccessibleDescription('There is already a room with that name.');
    expect(leave).not.toHaveBeenCalled();
  });

  it('clears the error once the person types again', async () => {
    render(<Harness />);
    await userEvent.click(save());
    expect(name()).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(name(), 'K');
    expect(name()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('caps the length of a name', () => {
    render(<Harness />);
    expect(name()).toHaveAttribute('maxlength', '24');
  });

  it('leaves from Cancel without adding anything, even with a name typed', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(name(), 'Kitchen');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(leave).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('list', { name: 'rooms' })).not.toHaveTextContent('Kitchen');
  });

  it('turns the browser’s own validation bubble off, so the message above is the one that shows', () => {
    const { container } = render(<Harness />);
    expect(container.querySelector('form')).toHaveAttribute('novalidate');
  });
});
```

`src/screens/SettingsScreen.test.tsx`:

```tsx
import { useReducer } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEMO_NOTE } from '../data/product';
import { createInitialState, reducer } from '../state/reducer';
import { SettingsScreen } from './SettingsScreen';

function Harness() {
  const [state, dispatch] = useReducer(reducer, createInitialState());
  return (
    <>
      <SettingsScreen state={state} dispatch={dispatch} />
      <p data-testid="settings">{JSON.stringify(state.settings)}</p>
    </>
  );
}

const stored = () => JSON.parse(screen.getByTestId('settings').textContent!) as { unit: string; alertOffline: boolean; remoteAccess: boolean };

describe('SettingsScreen', () => {
  it('has one h1 and its sections in order', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Temperature', 'Alerts and access', 'About']);
  });

  it('changes the unit, and only the unit', async () => {
    render(<Harness />);
    expect(screen.getByRole('radio', { name: '°C' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: '°F' }));
    expect(screen.getByRole('radio', { name: '°F' })).toBeChecked();
    expect(stored()).toEqual({ unit: 'F', alertOffline: true, remoteAccess: false });
  });

  it('names each switch by its label and flips each on its own', async () => {
    render(<Harness />);
    const alerts = screen.getByRole('switch', { name: 'Alert me when a device goes offline' });
    const remote = screen.getByRole('switch', { name: 'Remote access' });
    expect(alerts).toBeChecked();
    expect(remote).not.toBeChecked();
    await userEvent.click(alerts);
    expect(stored()).toEqual({ unit: 'C', alertOffline: false, remoteAccess: false });
    await userEvent.click(remote);
    expect(stored()).toEqual({ unit: 'C', alertOffline: false, remoteAccess: true });
  });

  it('flips a switch when its label is pressed, which is what the 44px hit area is for', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText('Remote access'));
    expect(screen.getByRole('switch', { name: 'Remote access' })).toBeChecked();
  });

  it('says in the About block that the app is a demo', () => {
    render(<Harness />);
    expect(screen.getByText(DEMO_NOTE)).toBeInTheDocument();
    expect(screen.getByText('Kestrel 1.0, a template')).toBeInTheDocument();
  });

  it('wraps the switches and the radios in the rows that give them a 44px target', () => {
    const { container } = render(<Harness />);
    expect(container.querySelectorAll('.touch-switch')).toHaveLength(2);
    expect(container.querySelectorAll('.touch-radios')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/screens/HomeScreen.test.tsx src/screens/RoomsScreen.test.tsx src/screens/AddRoomScreen.test.tsx src/screens/SettingsScreen.test.tsx`
Expected: FAIL (`HomeScreen`, `RoomsScreen` and `AddRoomScreen` do not exist; the old Settings imports what was removed).

- [ ] **Step 3: Write the screens**

`src/screens/HomeScreen.tsx`: one sentence, a chip per room with its count, rooms as headings with "Turn off", the rows, and Add device. The filter lives in app state because Rooms sets it and Home reads it; a filter that points at a room that no longer exists shows everything.

```tsx
import type { Dispatch } from 'react';
import { Button } from 'cyberui-2045';
import { DeviceRow } from '../components/DeviceRow';
import { ScreenTitle } from '../components/ScreenTitle';
import { HOME_COPY, ROUTE_TITLES } from '../data/product';
import type { Action, AppState } from '../state/reducer';
import { homeSummary, roomOnText, roomStats } from '../utils/summary';

interface HomeScreenProps {
  state: AppState;
  dispatch: Dispatch<Action>;
}

/**
 * Home is for glancing: one sentence about the whole home, a chip per room, and
 * the devices under their room, each row a glyph that is lit when the device is
 * on. "Place before device": rooms are how you navigate, so they come first as
 * chips (with counts) and again as headings. Anything beyond flipping a switch
 * is one tap deeper, on the device's page.
 */
export function HomeScreen({ state, dispatch }: HomeScreenProps) {
  const { rooms, devices, roomFilter, settings } = state;
  // A filter that points at a room that no longer exists shows everything (the reducer also clears it).
  const filter = rooms.some((room) => room.id === roomFilter) ? roomFilter : null;
  const visibleRooms = rooms.filter((room) => filter === null || room.id === filter);

  return (
    <>
      <ScreenTitle>{ROUTE_TITLES.devices}</ScreenTitle>
      {devices.length === 0 ? (
        <p className="empty">{HOME_COPY.empty}</p>
      ) : (
        <p className="summary">{homeSummary(devices)}</p>
      )}

      <div className="chips" role="group" aria-label={HOME_COPY.filterLabel}>
        <button type="button" className="chip" aria-pressed={filter === null} onClick={() => dispatch({ type: 'filter/set', roomId: null })}>
          {HOME_COPY.all} <span className="chip-count">{devices.length}</span>
        </button>
        {rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            className="chip"
            aria-pressed={filter === room.id}
            onClick={() => dispatch({ type: 'filter/set', roomId: room.id })}
          >
            {room.name} <span className="chip-count">{roomStats(devices, room.id).devices}</span>
          </button>
        ))}
      </div>

      {visibleRooms.map((room) => {
        const inRoom = devices.filter((device) => device.roomId === room.id);
        const stats = roomStats(devices, room.id);
        const onText = roomOnText(stats);
        return (
          <section key={room.id} className="room" aria-labelledby={`room-${room.id}`}>
            <div className="room-head">
              <h2 id={`room-${room.id}`} className="room-title">
                {room.name}
                {onText && <span className="room-count">: {onText}</span>}
              </h2>
              {stats.switchable > 0 && (
                <Button
                  variant="secondary"
                  className="room-off"
                  aria-label={`${HOME_COPY.turnOffRoom} ${room.name}`}
                  disabled={stats.on === 0}
                  onClick={() => dispatch({ type: 'room/turn-off', id: room.id })}
                >
                  {HOME_COPY.turnOffRoom}
                </Button>
              )}
            </div>
            {inRoom.length === 0 ? (
              <p className="empty">{HOME_COPY.emptyFilter}</p>
            ) : (
              <ul className="device-list">
                {inRoom.map((device) => (
                  <DeviceRow key={device.id} device={device} unit={settings.unit} onToggle={(id) => dispatch({ type: 'device/toggle', id })} />
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {/* A button that navigates: the library has no link-styled Button. It sets the hash like a link would, so Back returns here. */}
      <Button
        className="full-width"
        onClick={() => {
          window.location.hash = '#/add';
        }}
      >
        {HOME_COPY.add}
      </Button>
    </>
  );
}
```

`src/screens/RoomsScreen.tsx`:

```tsx
import type { Dispatch } from 'react';
import { Button } from 'cyberui-2045';
import { ScreenTitle } from '../components/ScreenTitle';
import { ROOMS_COPY, ROUTE_TITLES } from '../data/product';
import { ChevronIcon } from '../icons';
import type { Action, AppState } from '../state/reducer';
import { roomOnText, roomStats } from '../utils/summary';

interface RoomsScreenProps {
  state: AppState;
  dispatch: Dispatch<Action>;
}

/**
 * A card per room: how many devices are on, a power figure, Turn off for the
 * whole room, and a chevron that opens Home filtered to the room. The figure is
 * derived from the devices (utils/summary.ts) and is invented, like every
 * number here: nothing measures anything. A room can only be removed while it
 * is empty; the reducer says why when it is not.
 */
export function RoomsScreen({ state, dispatch }: RoomsScreenProps) {
  return (
    <>
      <ScreenTitle>{ROUTE_TITLES.rooms}</ScreenTitle>
      <ul className="room-list">
        {state.rooms.map((room) => {
          const stats = roomStats(state.devices, room.id);
          return (
            <li key={room.id} className="room-card">
              <div className="room-card-head">
                <h2 className="room-card-title">{room.name}</h2>
                {/* Sets the filter, then goes to Home like a link would, so Back returns here. */}
                <button
                  type="button"
                  className="chevron-button"
                  aria-label={`${ROOMS_COPY.open} in ${room.name}`}
                  onClick={() => {
                    dispatch({ type: 'filter/set', roomId: room.id });
                    window.location.hash = '#/devices';
                  }}
                >
                  <ChevronIcon />
                </button>
              </div>
              <p className="room-card-watts">
                <span className="numeral numeral--card">{stats.watts}</span>
                <span className="numeral-unit">W</span>
              </p>
              <p className="room-card-on">{roomOnText(stats) || `${stats.devices} ${stats.devices === 1 ? 'device' : 'devices'}`}</p>
              <div className="room-card-actions">
                {stats.switchable > 0 && (
                  <Button
                    variant="secondary"
                    aria-label={`${ROOMS_COPY.turnOff} ${room.name}`}
                    disabled={stats.on === 0}
                    onClick={() => dispatch({ type: 'room/turn-off', id: room.id })}
                  >
                    {ROOMS_COPY.turnOff}
                  </Button>
                )}
                <button
                  type="button"
                  className="text-button text-button--quiet"
                  aria-label={`${ROOMS_COPY.remove} ${room.name}`}
                  onClick={() => dispatch({ type: 'room/remove', id: room.id })}
                >
                  {ROOMS_COPY.remove}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <Button
        className="full-width"
        onClick={() => {
          window.location.hash = '#/add-room';
        }}
      >
        {ROOMS_COPY.add}
      </Button>
    </>
  );
}
```

`src/screens/AddRoomScreen.tsx`: one field. Focus goes to it on an error because `Input` announces nothing and takes no ref (CyberUI#121).

```tsx
import { useState, type ChangeEvent, type Dispatch, type FormEvent } from 'react';
import { Button, Input } from 'cyberui-2045';
import { ScreenTitle } from '../components/ScreenTitle';
import { ADD_ROOM, ROUTE_TITLES } from '../data/product';
import type { Room } from '../data/types';
import type { Action } from '../state/reducer';
import { roomNameProblem } from '../utils/summary';

interface AddRoomScreenProps {
  rooms: readonly Room[];
  dispatch: Dispatch<Action>;
  /** Closes this screen: Back when that is safe, otherwise Rooms (router/useHashRoute.ts). */
  leave: () => void;
}

/** One field, no icon picker: a room is a name. The rules (required, unique ignoring case, a length cap) are roomNameProblem and the input's maxLength. */
export function AddRoomScreen({ rooms, dispatch, leave }: AddRoomScreenProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();

  const onName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    if (error) setError(undefined);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const problem = roomNameProblem(name, rooms);
    if (problem) {
      setError(ADD_ROOM.errors[problem]);
      // Input does not announce a new error by itself (patrickkuei/CyberUI#121)
      // and takes no ref, so focus goes to the field by name: a screen reader
      // then reads its label and the linked error together.
      (event.currentTarget.elements.namedItem('name') as HTMLInputElement | null)?.focus();
      return;
    }
    dispatch({ type: 'room/add', name });
    leave();
  };

  return (
    <>
      <ScreenTitle>{ROUTE_TITLES['add-room']}</ScreenTitle>
      {/* noValidate: the browser's own validation bubble would pre-empt the message below, which is the one this template words and links to the field. */}
      <form className="add-form" onSubmit={onSubmit} noValidate>
        <Input
          label={ADD_ROOM.nameLabel}
          name="name"
          type="text"
          placeholder={ADD_ROOM.namePlaceholder}
          autoComplete="off"
          enterKeyHint="done"
          maxLength={ADD_ROOM.maxLength}
          aria-required="true"
          value={name}
          onChange={onName}
          error={error}
        />
        <div className="form-actions">
          <Button type="submit">{ADD_ROOM.save}</Button>
          <Button type="button" variant="secondary" onClick={leave}>
            {ADD_ROOM.cancel}
          </Button>
        </div>
      </form>
    </>
  );
}
```

`src/screens/SettingsScreen.tsx`: the same content as before without `Card`, `Divider` and `SectionTitle`, with the same standard-size labelled switches.

```tsx
import type { Dispatch } from 'react';
import { RadioGroup, Toggle } from 'cyberui-2045';
import { ScreenTitle } from '../components/ScreenTitle';
import { TouchRow } from '../components/TouchRow';
import { DEMO_NOTE, ROUTE_TITLES, SETTINGS_COPY } from '../data/product';
import type { TemperatureUnit } from '../data/types';
import type { Action, AppState } from '../state/reducer';

interface SettingsScreenProps {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const UNIT_OPTIONS = [
  { value: 'C', label: '°C' },
  { value: 'F', label: '°F' },
];

export function SettingsScreen({ state, dispatch }: SettingsScreenProps) {
  const { settings } = state;
  return (
    <>
      <ScreenTitle>{ROUTE_TITLES.settings}</ScreenTitle>

      <section className="settings-section" aria-labelledby="settings-temperature">
        <h2 id="settings-temperature" className="section-title">
          {SETTINGS_COPY.temperatureTitle}
        </h2>
        <TouchRow control="radios">
          <RadioGroup
            label={SETTINGS_COPY.unitLabel}
            orientation="horizontal"
            options={UNIT_OPTIONS}
            value={settings.unit}
            onValueChange={(unit) => dispatch({ type: 'settings/set-unit', unit: unit as TemperatureUnit })}
          />
        </TouchRow>
      </section>

      <section className="settings-section" aria-labelledby="settings-alerts">
        <h2 id="settings-alerts" className="section-title">
          {SETTINGS_COPY.alertsTitle}
        </h2>
        {/*
          MOCK: both switches are remembered in memory so they respond, and that
          is all. The template never asks for notification permission and never
          shows a notification; there is no remote access.
          Toggle needs an id for its visible label to name the switch
          (patrickkuei/CyberUI#120). size="lg" is the library's biggest switch:
          these are standard-size labelled switches, not the glyph buttons Home
          uses for power.
        */}
        <TouchRow control="switch">
          <Toggle
            id="setting-alert-offline"
            label={SETTINGS_COPY.alertOffline}
            role="switch"
            variant="accent"
            size="lg"
            checked={settings.alertOffline}
            onChange={(value) => dispatch({ type: 'settings/set-flag', flag: 'alertOffline', value })}
          />
        </TouchRow>
        <TouchRow control="switch">
          <Toggle
            id="setting-remote-access"
            label={SETTINGS_COPY.remoteAccess}
            role="switch"
            variant="accent"
            size="lg"
            checked={settings.remoteAccess}
            onChange={(value) => dispatch({ type: 'settings/set-flag', flag: 'remoteAccess', value })}
          />
        </TouchRow>
      </section>

      <section className="settings-section" aria-labelledby="settings-about">
        <h2 id="settings-about" className="section-title">
          {SETTINGS_COPY.aboutTitle}
        </h2>
        <p className="about-version">{SETTINGS_COPY.version}</p>
        <p className="about-demo">{DEMO_NOTE}</p>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/screens/HomeScreen.test.tsx src/screens/RoomsScreen.test.tsx src/screens/AddRoomScreen.test.tsx src/screens/SettingsScreen.test.tsx`
Expected: PASS, 40 tests in 4 files (Home 16, Rooms 9, Add room 9, Settings 6).

- [ ] **Step 5: Commit**

```bash
git add -A packages/mobile-app
git commit -m "feat(mobile-app): Home with room chips, Rooms with a power figure, and Add room" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 9: A device's page, and Add device (scan, pick, link, name)

**Files:**
- Create: `src/screens/DeviceScreen.tsx`, `src/screens/DeviceScreen.test.tsx`
- Replace: `src/screens/AddDeviceScreen.tsx`, `src/screens/AddDeviceScreen.test.tsx`

- [ ] **Step 1: Write the tests**

`src/screens/DeviceScreen.test.tsx`: one `describe` per kind (light, plug, thermostat, sensor), then a device that cannot be reached, the Link panel, Remove device, and a missing device. Reconnect runs on fake timers in its own `describe`, including the Hall light, which fails because the script says so.

```tsx
import { useReducer } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createScriptedConnection } from '../connection';
import { createInitialState, reducer, type AppState } from '../state/reducer';
import { DeviceScreen } from './DeviceScreen';

const connection = createScriptedConnection({ stepMs: 100 });

function Harness({ id, leave = vi.fn(), initial = createInitialState() }: { id: string; leave?: () => void; initial?: AppState }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <>
      <DeviceScreen state={state} dispatch={dispatch} connection={connection} deviceId={id} leave={leave} />
      <p data-testid="notice">{state.notice}</p>
    </>
  );
}

// "Power" is the name of a button and of the Link panel's neighbours, and the
// numeral repeats what the slider says: scope with within(...) or query by role
// and name rather than renaming anything.
const numeral = () => document.querySelector('.numeral') as HTMLElement;
const preset = (name: RegExp | string) => screen.getByRole('button', { name });
const link = () => within(screen.getByRole('region', { name: 'Link' }));

describe('DeviceScreen', () => {
  describe('a light', () => {
    it('shows a glowing glyph, its name as the one h1, its room, and its level as the big numeral', () => {
      render(<Harness id="desk-lamp" />);
      expect(screen.getByRole('heading', { level: 1, name: 'Desk lamp' })).toBeInTheDocument();
      expect(screen.getByText('Living room')).toBeInTheDocument();
      expect(numeral()).toHaveTextContent('70%');
      expect(document.querySelector('.glyph--lit')).not.toBeNull();
      expect(document.querySelector('.glyph-halo')).toHaveAttribute('opacity', '0.75');
    });

    it('changes the level with the wide slider, and the numeral and the glow follow', async () => {
      render(<Harness id="desk-lamp" />);
      const slider = screen.getByRole('slider', { name: 'Brightness' });
      expect(slider).toHaveAttribute('aria-valuenow', '70');
      slider.focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(slider).toHaveAttribute('aria-valuenow', '75');
      expect(numeral()).toHaveTextContent('75%');
      expect(document.querySelector('.glyph-halo')).toHaveAttribute('opacity', '0.79');
    });

    it('turns off and on from the full-width Power button, and the glyph goes dark', async () => {
      render(<Harness id="desk-lamp" />);
      await userEvent.click(screen.getByRole('button', { name: 'Turn off' }));
      expect(numeral()).toHaveTextContent('Off');
      expect(document.querySelector('.glyph-halo')).toBeNull();
      await userEvent.click(screen.getByRole('button', { name: 'Turn on' }));
      expect(numeral()).toHaveTextContent('70%');
    });

    it('lists the Scenes presets with their levels, and sets the level in one tap', async () => {
      render(<Harness id="desk-lamp" />);
      const scenes = within(screen.getByRole('region', { name: 'Scenes' }));
      expect(scenes.getAllByRole('button').map((button) => button.textContent)).toEqual(['Reading80', 'Movie25', 'Night5']);
      await userEvent.click(preset('Movie 25'));
      expect(screen.getByRole('slider', { name: 'Brightness' })).toHaveAttribute('aria-valuenow', '25');
      expect(numeral()).toHaveTextContent('25%');
    });

    it('marks the preset that matches as pressed, and none when the level is something else', async () => {
      render(<Harness id="desk-lamp" />);
      expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0);
      await userEvent.click(preset('Reading 80'));
      expect(preset('Reading 80')).toHaveAttribute('aria-pressed', 'true');
      expect(preset('Movie 25')).toHaveAttribute('aria-pressed', 'false');
      await userEvent.click(screen.getByRole('button', { name: 'Turn off' }));
      expect(preset('Reading 80')).toHaveAttribute('aria-pressed', 'false');
    });

    it('lights a light that is off when a scene is pressed', async () => {
      render(<Harness id="bedside-lamp" />);
      expect(numeral()).toHaveTextContent('Off');
      await userEvent.click(preset('Night 5'));
      expect(numeral()).toHaveTextContent('5%');
      expect(screen.getByRole('button', { name: 'Turn off' })).toBeInTheDocument();
    });
  });

  describe('a plug', () => {
    it('shows its draw while on, and a Power button and nothing else to control', async () => {
      render(<Harness id="tv-plug" />);
      expect(numeral()).toHaveTextContent('85W');
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
      expect(screen.queryByRole('region', { name: 'Scenes' })).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Turn off' }));
      expect(numeral()).toHaveTextContent('Off');
      expect(screen.getByRole('button', { name: 'Turn on' })).toBeInTheDocument();
    });
  });

  describe('a thermostat', () => {
    it('shows its target as the big numeral with the temperature now, a slider and 48px minus and plus buttons', () => {
      render(<Harness id="hall-thermostat" />);
      expect(numeral()).toHaveTextContent('20°');
      expect(screen.getByText('Now 19.5°')).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: 'Target temperature' })).toHaveAttribute('aria-valuenow', '20');
      expect(screen.getByRole('button', { name: 'Raise target temperature' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Lower target temperature' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Turn (on|off)$/ })).not.toBeInTheDocument();
    });

    it('moves half a degree for each press, and the slider follows', async () => {
      render(<Harness id="hall-thermostat" />);
      await userEvent.click(screen.getByRole('button', { name: 'Raise target temperature' }));
      expect(numeral()).toHaveTextContent('20.5°');
      await userEvent.click(screen.getByRole('button', { name: 'Lower target temperature' }));
      await userEvent.click(screen.getByRole('button', { name: 'Lower target temperature' }));
      expect(numeral()).toHaveTextContent('19.5°');
      expect(screen.getByRole('slider', { name: 'Target temperature' })).toHaveAttribute('aria-valuenow', '19.5');
    });

    it('announces its numeral politely, since the buttons have nothing else to say what changed', () => {
      render(<Harness id="hall-thermostat" />);
      expect(numeral()).toHaveAttribute('aria-live', 'polite');
      expect(numeral()).toHaveAccessibleName('Target temperature 20 °C');
    });

    it('follows the unit setting while storing Celsius: 68° in Fahrenheit, and one press is one whole degree', async () => {
      const initial = createInitialState();
      render(<Harness id="hall-thermostat" initial={{ ...initial, settings: { ...initial.settings, unit: 'F' } }} />);
      expect(numeral()).toHaveTextContent('68°');
      expect(screen.getByText('Now 67°')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Raise target temperature' }));
      expect(numeral()).toHaveTextContent('69°');
      expect(screen.getByRole('slider', { name: 'Target temperature' })).toHaveAttribute('aria-valuenow', '69');
    });

    it('offers Heat, Eco and Off as fixed modes, and Off darkens the glyph and dims the numeral', async () => {
      render(<Harness id="hall-thermostat" />);
      const modes = within(screen.getByRole('region', { name: 'Modes' }));
      expect(modes.getAllByRole('button').map((button) => button.textContent)).toEqual(['Heat22°', 'Eco18°', 'Off']);
      await userEvent.click(preset('Heat 22°'));
      expect(numeral()).toHaveTextContent('22°');
      expect(preset('Heat 22°')).toHaveAttribute('aria-pressed', 'true');
      await userEvent.click(preset('Off'));
      expect(preset('Off')).toHaveAttribute('aria-pressed', 'true');
      expect(numeral()).toHaveClass('numeral--dim');
      expect(screen.getByText('Off, now 19.5°')).toBeInTheDocument();
      expect(document.querySelector('.glyph-halo')).toBeNull();
    });

    it('switches back on when a target is picked after Off', async () => {
      render(<Harness id="hall-thermostat" />);
      await userEvent.click(preset('Off'));
      await userEvent.click(screen.getByRole('button', { name: 'Raise target temperature' }));
      expect(numeral()).not.toHaveClass('numeral--dim');
      expect(document.querySelector('.glyph-halo')).not.toBeNull();
    });
  });

  describe('a sensor', () => {
    it('shows its reading and a plain note that there is nothing to control', () => {
      render(<Harness id="living-sensor" />);
      expect(numeral()).toHaveTextContent('21.5°');
      expect(screen.getByText('Nothing to control here: this sensor only reports.')).toBeInTheDocument();
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
      expect(screen.queryByRole('region', { name: 'Scenes' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Turn (on|off)$/ })).not.toBeInTheDocument();
    });

    it('says when its battery is low', () => {
      render(<Harness id="bedroom-sensor" />);
      expect(screen.getByText('Battery is low.')).toBeInTheDocument();
    });

    it('says nothing about the battery when it is fine', () => {
      render(<Harness id="living-sensor" />);
      expect(screen.queryByText('Battery is low.')).not.toBeInTheDocument();
    });
  });

  describe('a device that cannot be reached', () => {
    it('shows a dark dashed glyph, says it is lost, and offers only Reconnect and Remove', () => {
      render(<Harness id="hall-light" />);
      expect(screen.getByRole('heading', { level: 1, name: 'Hall light' })).toBeInTheDocument();
      expect(screen.getByText('Lost. Controls are unavailable.')).toBeInTheDocument();
      expect(document.querySelector('.glyph--lit')).toBeNull();
      expect(document.querySelector('.hero--down')).not.toBeNull();
      expect(document.querySelector('.numeral')).toBeNull();
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
      expect(screen.queryByRole('region', { name: 'Scenes' })).not.toBeInTheDocument();
      expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['Reconnect', 'Remove device']);
    });

    it('says offline for a device that was disconnected, and shows no signal and no latency', async () => {
      render(<Harness id="desk-lamp" />);
      await userEvent.click(link().getByRole('button', { name: 'Disconnect' }));
      expect(screen.getByText('Offline. Controls are unavailable.')).toBeInTheDocument();
      expect(link().getByText('No link')).toBeInTheDocument();
      expect(link().getByRole('img', { name: 'Signal 0 of 4' })).toBeInTheDocument();
      expect(link().getByRole('button', { name: 'Reconnect' })).toBeInTheDocument();
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    });
  });

  describe('the Link panel', () => {
    it('shows signal bars and latency in milliseconds, and Disconnect, on every kind of device', () => {
      for (const [id, signal, latency] of [['desk-lamp', 4, 12], ['tv-plug', 3, 22], ['hall-thermostat', 4, 18], ['living-sensor', 3, 31]] as const) {
        const { unmount } = render(<Harness id={id} />);
        expect(link().getByRole('img', { name: `Signal ${signal} of 4` }), id).toBeInTheDocument();
        expect(link().getByText(`${latency} ms`), id).toBeInTheDocument();
        expect(link().getByRole('button', { name: 'Disconnect' }), id).toBeInTheDocument();
        unmount();
      }
    });

    it('says Weak, in amber, when the signal is a single bar', () => {
      render(<Harness id="fan-plug" />);
      expect(link().getByText('Weak, 96 ms')).toHaveClass('link-text--weak');
    });
  });

  describe('Remove device', () => {
    it('removes the device, says so, and leaves the page', async () => {
      const leave = vi.fn();
      render(<Harness id="tv-plug" leave={leave} />);
      await userEvent.click(screen.getByRole('button', { name: 'Remove device' }));
      expect(screen.getByTestId('notice')).toHaveTextContent('Removed TV plug.');
      expect(leave).toHaveBeenCalledTimes(1);
    });

    it('is offered on a device that is lost too', async () => {
      const leave = vi.fn();
      render(<Harness id="hall-light" leave={leave} />);
      await userEvent.click(screen.getByRole('button', { name: 'Remove device' }));
      expect(leave).toHaveBeenCalledTimes(1);
    });
  });

  it('says so, with a way back, when the device does not exist', () => {
    render(<Harness id="nope" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Device' })).toBeInTheDocument();
    expect(screen.getByText('That device is not here any more.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute('href', '#/devices');
  });
});

describe('Reconnect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
  // userEvent waits on real timers, which a fake clock never fires: these presses are fireEvent.

  it('shows the link steps in place of the Link panel, and brings the controls back when it works', async () => {
    render(<Harness id="desk-lamp" />);
    fireEvent.click(link().getByRole('button', { name: 'Disconnect' }));
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    fireEvent.click(link().getByRole('button', { name: 'Reconnect' }));
    expect(link().getByRole('list')).toBeInTheDocument();
    expect(link().queryByRole('button', { name: 'Reconnect' })).not.toBeInTheDocument();
    await advance(400 + 600);
    expect(link().queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Brightness' })).toHaveAttribute('aria-valuenow', '70');
    expect(link().getByRole('button', { name: 'Disconnect' })).toBeInTheDocument();
  });

  it('fails for the Hall light, scripted to, and says why, with Try again and Cancel', async () => {
    render(<Harness id="hall-light" />);
    fireEvent.click(link().getByRole('button', { name: 'Reconnect' }));
    await advance(1000);
    expect(link().getByRole('status')).toHaveTextContent('The link failed: No response from the hub');
    expect(screen.getByText('Lost. Controls are unavailable.')).toBeInTheDocument();
    expect(link().getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    fireEvent.click(link().getByRole('button', { name: 'Cancel' }));
    expect(link().getByRole('button', { name: 'Reconnect' })).toBeInTheDocument();
    expect(link().queryByRole('list')).not.toBeInTheDocument();
  });

  it('leaves no timer running when the page is left mid-link', async () => {
    const { unmount } = render(<Harness id="hall-light" />);
    fireEvent.click(link().getByRole('button', { name: 'Reconnect' }));
    await advance(150);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
```

`src/screens/AddDeviceScreen.test.tsx` walks the whole flow on fake timers: nothing runs until Start scan is pressed (not even after a minute), the bar and the words "Scanning…", Cancel, the results with their signal bars, what is already in the home is left out, pick and link, the name and room step (a scanned device keeps its kind and its own id; a device added by code asks for a type and is numbered), validation with focus on the field, no rooms, focus moving to each step's heading, and **no timer left** when the screen is left mid-scan or mid-link.

```tsx
import { useReducer } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createScriptedConnection } from '../connection';
import { createInitialState, reducer, type AppState } from '../state/reducer';
import { AddDeviceScreen } from './AddDeviceScreen';

// The scan and the link run on timers, so every test here drives fake ones and
// presses with fireEvent: userEvent waits on real timers between its steps,
// which a fake clock never fires. Times: the scan takes 800ms, each of the four
// link steps 100ms, and the finished checklist stays 600ms.
const connection = createScriptedConnection({ scanMs: 800, stepMs: 100 });
const SCAN = 800;
const LINK = 400 + 600;

function Harness({ leave = vi.fn(), initial = createInitialState() }: { leave?: () => void; initial?: AppState }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <>
      <AddDeviceScreen devices={state.devices} rooms={state.rooms} connection={connection} dispatch={dispatch} leave={leave} />
      <div role="group" aria-label="devices">
        {state.devices.map((device) => (
          <span key={device.id}>{`${device.id}|${device.name}|${device.roomId}|${device.kind}`}</span>
        ))}
      </div>
    </>
  );
}

const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const press = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const devices = () => within(screen.getByRole('group', { name: 'devices' }));
const stepTitle = () => screen.getByRole('heading', { level: 2 });

async function scanAndPick(name: string) {
  press('Start scan');
  await advance(SCAN);
  press(new RegExp(name));
  await advance(LINK);
}

describe('AddDeviceScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Scan', () => {
    it('opens on one h1, a Start scan button and the line that says the scan is scripted', () => {
      render(<Harness />);
      expect(screen.getByRole('heading', { level: 1, name: 'Add device' })).toBeInTheDocument();
      expect(stepTitle()).toHaveTextContent('Find a device nearby');
      expect(screen.getByRole('button', { name: 'Start scan' })).toBeInTheDocument();
      expect(screen.getByText('This scan is scripted: nothing is discovered. It shows a fixed list.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Enter a code instead' })).toBeInTheDocument();
    });

    it('starts only when the button is pressed: nothing runs, however long the screen is open', async () => {
      render(<Harness />);
      await advance(60_000);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('shows a progress bar that moves, a pulse for the eye and the words "Scanning…" for everyone', async () => {
      render(<Harness />);
      press('Start scan');
      expect(screen.getByRole('progressbar', { name: 'Scan progress' })).toHaveAttribute('value', '0');
      expect(screen.getByRole('status')).toHaveTextContent('Scanning…');
      expect(document.querySelector('.pulse')).toHaveAttribute('aria-hidden', 'true');
      await advance(400);
      expect(Number(screen.getByRole('progressbar').getAttribute('value'))).toBeGreaterThanOrEqual(50);
    });

    it('stops from Cancel and goes back to the start, with no timer left', async () => {
      render(<Harness />);
      press('Start scan');
      await advance(300);
      press('Cancel');
      expect(screen.getByRole('button', { name: 'Start scan' })).toBeInTheDocument();
      expect(vi.getTimerCount()).toBe(0);
      await advance(5000);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('lists what the script finds when it is done, with a signal for each', async () => {
      render(<Harness />);
      press('Start scan');
      await advance(SCAN);
      expect(stepTitle()).toHaveTextContent('4 devices nearby');
      const rows = within(screen.getByRole('list')).getAllByRole('button');
      expect(rows.map((row) => row.textContent)).toEqual(['Shelf lampLight', 'Kettle plugPlug', 'Porch thermostatThermostat', 'Garage sensorSensor']);
      expect(within(rows[0]!).getByRole('img', { name: 'Signal 4 of 4' })).toBeInTheDocument();
      expect(within(rows[3]!).getByRole('img', { name: 'Signal 1 of 4' })).toBeInTheDocument();
    });

    it('can scan again, and leaves out what is already in the home', async () => {
      render(<Harness />);
      await scanAndPick('Shelf lamp');
      type('Device name', 'Shelf lamp');
      press('Add device');
      // Same screen mounted again, as navigating back to it would.
      document.body.innerHTML = '';
      const added = reducer(createInitialState(), { type: 'device/add', draft: { id: 'shelf-lamp', name: 'Shelf lamp', roomId: 'hall', kind: 'light' } });
      render(<Harness initial={added} />);
      press('Start scan');
      await advance(SCAN);
      expect(stepTitle()).toHaveTextContent('3 devices nearby');
      expect(screen.queryByRole('button', { name: /Shelf lamp/ })).not.toBeInTheDocument();
      press('Scan again');
      expect(screen.getByRole('status')).toHaveTextContent('Scanning…');
    });

    it('says so when there is nothing left to find', async () => {
      const all = createInitialState();
      const full = { ...all, devices: [...all.devices, ...['shelf-lamp', 'kettle-plug', 'porch-thermostat', 'garage-sensor'].map((id) => ({ ...all.devices[0]!, id }))] };
      render(<Harness initial={full} />);
      press('Start scan');
      await advance(SCAN);
      expect(stepTitle()).toHaveTextContent('Everything the scan can find is already added.');
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  describe('Pick and Link', () => {
    it('links the device that was tapped, with a checklist and a bar, and no other control', async () => {
      render(<Harness />);
      press('Start scan');
      await advance(SCAN);
      press(/Kettle plug/);
      expect(stepTitle()).toHaveTextContent('Linking Kettle plug');
      expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(4);
      expect(screen.getByRole('progressbar', { name: 'Link progress' })).toBeInTheDocument();
      await advance(150);
      expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Device found: done');
    });

    it('goes on to the name and room once the link is ready', async () => {
      render(<Harness />);
      await scanAndPick('Kettle plug');
      expect(stepTitle()).toHaveTextContent('Name the device');
      expect(screen.getByLabelText('Device name')).toHaveValue('Kettle plug');
    });

    it('goes back to the start from Cancel while linking, with no timer left', async () => {
      render(<Harness />);
      press('Start scan');
      await advance(SCAN);
      press(/Shelf lamp/);
      await advance(150);
      press('Cancel');
      expect(screen.getByRole('button', { name: 'Start scan' })).toBeInTheDocument();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('Name and room', () => {
    it('adds a scanned device under its own id, as its own kind, in the room chosen, then leaves', async () => {
      const leave = vi.fn();
      render(<Harness leave={leave} />);
      await scanAndPick('Porch thermostat');
      expect(screen.queryByLabelText('Type')).not.toBeInTheDocument();
      fireEvent.change(screen.getByLabelText('Room'), { target: { value: 'bedroom' } });
      type('Device name', '  Porch heater ');
      press('Add device');
      expect(devices().getByText('porch-thermostat|Porch heater|bedroom|thermostat')).toBeInTheDocument();
      expect(leave).toHaveBeenCalledTimes(1);
    });

    it('offers every room, in order', async () => {
      render(<Harness />);
      await scanAndPick('Shelf lamp');
      const options = within(screen.getByLabelText('Room')).getAllByRole('option');
      expect(options.map((option) => option.textContent)).toEqual(['Living room', 'Bedroom', 'Hall']);
    });

    it('requires a name: shows the error, links it to the field, keeps focus there and adds nothing', async () => {
      const leave = vi.fn();
      render(<Harness leave={leave} />);
      await scanAndPick('Shelf lamp');
      type('Device name', '   ');
      press('Add device');
      const name = screen.getByLabelText('Device name');
      expect(name).toHaveAttribute('aria-invalid', 'true');
      expect(name).toHaveAccessibleDescription('Enter a name for the device.');
      expect(name).toHaveFocus();
      expect(leave).not.toHaveBeenCalled();
      expect(devices().queryByText(/shelf-lamp/)).not.toBeInTheDocument();
    });

    it('leaves from Cancel without adding anything, even with everything filled in', async () => {
      const leave = vi.fn();
      render(<Harness leave={leave} />);
      await scanAndPick('Shelf lamp');
      press('Cancel');
      expect(leave).toHaveBeenCalledTimes(1);
      expect(devices().queryByText(/shelf-lamp/)).not.toBeInTheDocument();
    });

    it('turns the browser’s own validation bubble off', async () => {
      const { container } = render(<Harness />);
      await scanAndPick('Shelf lamp');
      expect(container.querySelector('form')).toHaveAttribute('novalidate');
    });

    it('says there are no rooms, and will not add, when every room has been removed', async () => {
      const bare = { ...createInitialState(), rooms: [], devices: [] };
      render(<Harness initial={bare} />);
      await scanAndPick('Shelf lamp');
      expect(screen.getByText(/There are no rooms yet/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Add a room' })).toHaveAttribute('href', '#/add-room');
      expect(screen.getByRole('button', { name: 'Add device' })).toBeDisabled();
    });
  });

  describe('Enter a code instead', () => {
    it('opens the code form from the start and from the results, and goes back to the scan', async () => {
      render(<Harness />);
      press('Enter a code instead');
      expect(stepTitle()).toHaveTextContent('Enter the pairing code');
      press('Back to scan');
      expect(screen.getByRole('button', { name: 'Start scan' })).toBeInTheDocument();
      press('Start scan');
      await advance(SCAN);
      press('Enter a code instead');
      expect(stepTitle()).toHaveTextContent('Enter the pairing code');
    });

    it('rejects a code that is not six letters or numbers: shows the error, links it, keeps focus there', async () => {
      render(<Harness />);
      press('Enter a code instead');
      type('Pairing code', 'ab12');
      press('Link device');
      const code = screen.getByLabelText('Pairing code');
      expect(code).toHaveAttribute('aria-invalid', 'true');
      expect(code).toHaveAccessibleDescription('Enter the 6-character pairing code: letters and numbers only.');
      expect(code).toHaveFocus();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('rejects six characters that are not all letters and numbers', () => {
      render(<Harness />);
      press('Enter a code instead');
      type('Pairing code', 'ab-2cd');
      press('Link device');
      expect(screen.getByLabelText('Pairing code')).toHaveAttribute('aria-invalid', 'true');
    });

    it('writes the code in capitals and takes at most six characters', () => {
      render(<Harness />);
      press('Enter a code instead');
      type('Pairing code', 'ab12cd');
      expect(screen.getByLabelText('Pairing code')).toHaveValue('AB12CD');
      expect(screen.getByLabelText('Pairing code')).toHaveAttribute('maxlength', '6');
      expect(screen.getByLabelText('Pairing code')).toHaveAttribute('autocapitalize', 'characters');
    });

    it('links a valid code, then asks for a name, a room and a type, and adds a numbered device', async () => {
      const leave = vi.fn();
      render(<Harness leave={leave} />);
      press('Enter a code instead');
      type('Pairing code', 'ab12cd');
      press('Link device');
      expect(stepTitle()).toHaveTextContent('Linking');
      await advance(LINK);
      expect(stepTitle()).toHaveTextContent('Name the device');
      expect(screen.getByLabelText('Device name')).toHaveValue('');
      type('Device name', 'Workshop plug');
      fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'plug' } });
      press('Add device');
      expect(devices().getByText('new-1|Workshop plug|living-room|plug')).toBeInTheDocument();
      expect(leave).toHaveBeenCalledTimes(1);
    });
  });

  it('moves focus to the heading of each new step, but not on first load', async () => {
    render(<Harness />);
    expect(stepTitle()).not.toHaveFocus();
    press('Start scan');
    expect(stepTitle()).toHaveFocus();
    await advance(SCAN);
    expect(stepTitle()).toHaveFocus();
    press(/Shelf lamp/);
    expect(stepTitle()).toHaveFocus();
    await advance(LINK);
    expect(stepTitle()).toHaveFocus();
  });

  it('makes each step’s heading programmatically focusable', () => {
    render(<Harness />);
    expect(stepTitle()).toHaveAttribute('tabindex', '-1');
  });

  it('leaves no timer running when the screen is left mid-scan or mid-link', async () => {
    const first = render(<Harness />);
    press('Start scan');
    await advance(200);
    first.unmount();
    expect(vi.getTimerCount()).toBe(0);
    const second = render(<Harness />);
    press('Start scan');
    await advance(SCAN);
    press(/Shelf lamp/);
    await advance(150);
    second.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/screens/DeviceScreen.test.tsx src/screens/AddDeviceScreen.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write the screens**

`src/screens/DeviceScreen.tsx`: the second depth. A switch over the kind (not a `Record<DeviceKind, Component>`: each kind reads different fields, and the return type excludes `undefined`, so a new kind without a case is a compile error). A device that cannot be reached shows a dim dashed glyph, one sentence, Reconnect and Remove, and no controls.

```tsx
import { useState, type Dispatch, type ReactElement } from 'react';
import { Button, Slider } from 'cyberui-2045';
import type { Connection } from '../connection';
import { Glyph } from '../components/Glyph';
import { LinkRun } from '../components/LinkRun';
import { ScreenTitle } from '../components/ScreenTitle';
import { SignalBars } from '../components/SignalBars';
import { TouchRow } from '../components/TouchRow';
import { LEVEL } from '../data/devices';
import { LIGHT_PRESETS, THERMOSTAT_PRESETS } from '../data/presets';
import { DEVICE_COPY, LINK_WORDS, ROUTE_TITLES } from '../data/product';
import type { Device, TemperatureUnit } from '../data/types';
import { MinusIcon, PlusIcon } from '../icons';
import type { Action, AppState } from '../state/reducer';
import { glowLevel } from '../utils/glow';
import { WEAK_SIGNAL, isReachable, roomName } from '../utils/summary';
import { formatDegrees, formatTemp, fromDisplay, nudge, sliderScale, toDisplay } from '../utils/units';

interface DeviceScreenProps {
  state: AppState;
  dispatch: Dispatch<Action>;
  connection: Connection;
  /** The id from the hash, #/device/:id. */
  deviceId: string | undefined;
  /** Closes this pushed screen (router/useHashRoute.ts). */
  leave: () => void;
}

function PowerButton({ device, dispatch }: { device: Device & { on: boolean }; dispatch: Dispatch<Action> }) {
  return (
    <Button
      className="full-width"
      variant={device.on ? 'secondary' : 'primary'}
      onClick={() => dispatch({ type: 'device/toggle', id: device.id })}
    >
      {device.on ? DEVICE_COPY.turnOff : DEVICE_COPY.turnOn}
    </Button>
  );
}

/** A row of fixed presets. A preset is a button that sets a state, so the one that matches the device now is aria-pressed. */
function Presets({ title, children }: { title: string; children: ReactElement[] }) {
  return (
    <section className="presets" aria-label={title}>
      <h2 className="section-title">{title}</h2>
      <div className="preset-row">{children}</div>
    </section>
  );
}

function Preset({ label, value, active, onPress }: { label: string; value?: string; active: boolean; onPress: () => void }) {
  return (
    <button type="button" className="preset" aria-pressed={active} onClick={onPress}>
      <span>{label}</span>
      {value && <span className="preset-num">{value}</span>}
    </button>
  );
}

/**
 * The big numeral and what goes with it. A switch over the kind rather than a
 * Record<DeviceKind, ...> because each kind reads different fields; the return
 * type excludes undefined on purpose, so a new DeviceKind without a case is a
 * compile error here.
 */
function hero(device: Device, unit: TemperatureUnit): { value: string; unit?: string; caption?: string; dim?: boolean } {
  switch (device.kind) {
    case 'light':
      return device.on ? { value: String(device.level), unit: '%' } : { value: 'Off', dim: true };
    case 'plug':
      return device.on ? { value: String(device.watts), unit: 'W' } : { value: 'Off', dim: true };
    case 'thermostat':
      return {
        value: formatDegrees(device.targetC, unit),
        caption: `${device.on ? DEVICE_COPY.now : 'Off, now'} ${formatDegrees(device.currentC, unit)}`,
        dim: !device.on,
      };
    case 'sensor':
      return { value: formatDegrees(device.readingC, unit), caption: device.batteryLow ? DEVICE_COPY.batteryLow : undefined };
  }
}

function Controls({ device, unit, dispatch }: { device: Device; unit: TemperatureUnit; dispatch: Dispatch<Action> }): ReactElement | null {
  switch (device.kind) {
    case 'light':
      return (
        <>
          <TouchRow control="slider">
            <Slider
              className="slider-control"
              ariaLabel={DEVICE_COPY.lightLevel}
              variant="accent"
              size="lg"
              min={LEVEL.min}
              max={LEVEL.max}
              step={LEVEL.step}
              value={device.level}
              onValueChange={(value) => dispatch({ type: 'device/set-level', id: device.id, value })}
            />
          </TouchRow>
          <PowerButton device={device} dispatch={dispatch} />
          <Presets title={DEVICE_COPY.lightPresets}>
            {LIGHT_PRESETS.map((preset) => (
              <Preset
                key={preset.id}
                label={preset.label}
                value={String(preset.level)}
                active={device.on && device.level === preset.level}
                onPress={() => dispatch({ type: 'device/preset', id: device.id, presetId: preset.id })}
              />
            ))}
          </Presets>
        </>
      );
    case 'plug':
      return <PowerButton device={device} dispatch={dispatch} />;
    case 'thermostat': {
      const scale = sliderScale(unit);
      return (
        <>
          <TouchRow control="slider">
            <Slider
              className="slider-control"
              ariaLabel={DEVICE_COPY.target}
              variant="accent"
              size="lg"
              min={scale.min}
              max={scale.max}
              step={scale.step}
              // Stored in Celsius; the slider works in the displayed unit (utils/units.ts).
              value={unit === 'C' ? device.targetC : Math.round(toDisplay(device.targetC, unit))}
              onValueChange={(value) => dispatch({ type: 'device/set-target', id: device.id, valueC: fromDisplay(value, unit) })}
            />
          </TouchRow>
          <Presets title={DEVICE_COPY.thermostatPresets}>
            {THERMOSTAT_PRESETS.map((preset) => (
              <Preset
                key={preset.id}
                label={preset.label}
                value={preset.targetC === undefined ? undefined : formatDegrees(preset.targetC, unit)}
                active={preset.on ? device.on && device.targetC === preset.targetC : !device.on}
                onPress={() => dispatch({ type: 'device/preset', id: device.id, presetId: preset.id })}
              />
            ))}
          </Presets>
        </>
      );
    }
    case 'sensor':
      return <p className="note">{DEVICE_COPY.sensorNote}</p>;
  }
}

/**
 * One device, full page: the second depth. A big glyph that glows with the
 * device's level, its name and room, one big numeral, then whatever that kind
 * of device can be told to do, then the link. A device that cannot be reached
 * shows a dark glyph, one sentence, Reconnect and Remove, and nothing else: its
 * state is not trustworthy, so no control is offered for it.
 */
export function DeviceScreen({ state, dispatch, connection, deviceId, leave }: DeviceScreenProps) {
  const [reconnecting, setReconnecting] = useState(false);
  const device = state.devices.find((candidate) => candidate.id === deviceId);
  const { unit } = state.settings;

  if (!device) {
    return (
      <>
        <ScreenTitle>{ROUTE_TITLES.device}</ScreenTitle>
        <p className="note">{DEVICE_COPY.notFound}</p>
        <a className="text-link" href="#/devices">
          {DEVICE_COPY.notFoundBack}
        </a>
      </>
    );
  }

  const reachable = isReachable(device);
  const big = hero(device, unit);
  const weak = reachable && device.signal <= WEAK_SIGNAL;

  return (
    <>
      <div className={reachable ? 'hero' : 'hero hero--down'}>
        <div className="hero-glyph">
          <Glyph kind={device.kind} level={glowLevel(device)} />
        </div>
        <ScreenTitle>{device.name}</ScreenTitle>
        <p className="hero-room">{roomName(state.rooms, device.roomId)}</p>
        {device.link === 'connected' ? (
          <div className="hero-value">
            {device.kind === 'thermostat' && (
              <Button
                variant="secondary"
                className="stepper"
                aria-label={`Lower ${DEVICE_COPY.target.toLowerCase()}`}
                onClick={() => dispatch({ type: 'device/set-target', id: device.id, valueC: nudge(device.targetC, -1, unit) })}
              >
                <MinusIcon />
              </Button>
            )}
            <p
              className={big.dim ? 'numeral numeral--dim' : 'numeral'}
              // The thermostat has no slider-style announcement for the plus and
              // minus buttons, so its numeral is a polite live region.
              aria-live={device.kind === 'thermostat' ? 'polite' : undefined}
              aria-label={device.kind === 'thermostat' ? `${DEVICE_COPY.target} ${formatTemp(device.targetC, unit)}${device.on ? '' : ', off'}` : undefined}
            >
              {big.value}
              {big.unit && <span className="numeral-unit">{big.unit}</span>}
            </p>
            {device.kind === 'thermostat' && (
              <Button
                variant="secondary"
                className="stepper"
                aria-label={`Raise ${DEVICE_COPY.target.toLowerCase()}`}
                onClick={() => dispatch({ type: 'device/set-target', id: device.id, valueC: nudge(device.targetC, 1, unit) })}
              >
                <PlusIcon />
              </Button>
            )}
          </div>
        ) : (
          <p className="down-note">{`${LINK_WORDS[device.link]}. Controls are unavailable.`}</p>
        )}
        {reachable && big.caption && <p className="hero-caption">{big.caption}</p>}
      </div>

      {reachable && <Controls device={device} unit={unit} dispatch={dispatch} />}

      <section className="link-panel" aria-label={DEVICE_COPY.linkTitle}>
        <h2 className="section-title">{DEVICE_COPY.linkTitle}</h2>
        {reconnecting ? (
          <LinkRun
            connection={connection}
            id={device.id}
            onLinked={() => {
              dispatch({ type: 'device/reconnected', id: device.id });
              setReconnecting(false);
            }}
            onCancel={() => setReconnecting(false)}
          />
        ) : (
          <>
            <div className="link-facts">
              <SignalBars signal={reachable ? device.signal : 0} />
              <span className={weak ? 'link-text link-text--weak' : 'link-text'}>{reachable ? `${weak ? 'Weak, ' : ''}${device.latencyMs} ms` : 'No link'}</span>
            </div>
            {reachable ? (
              <Button variant="secondary" onClick={() => dispatch({ type: 'device/disconnect', id: device.id })}>
                {DEVICE_COPY.disconnect}
              </Button>
            ) : (
              <Button onClick={() => setReconnecting(true)}>{DEVICE_COPY.reconnect}</Button>
            )}
          </>
        )}
      </section>

      {/* The library's danger variant is 4.13:1 on its own surface (patrickkuei/CyberUI#128). It is kept rather than restyled, so a fix upstream reaches this button. */}
      <Button
        className="full-width"
        variant="danger"
        onClick={() => {
          dispatch({ type: 'device/remove', id: device.id });
          leave();
        }}
      >
        {DEVICE_COPY.remove}
      </Button>
    </>
  );
}
```

`src/screens/AddDeviceScreen.tsx`: the steps are screen state (a union), the scan runs in an effect that aborts on cleanup, and focus moves to each step's heading (`tabIndex={-1}`: only code can focus it).

```tsx
import { useEffect, useRef, useState, type ChangeEvent, type Dispatch, type FormEvent, type RefObject } from 'react';
import { Button, Input, Select } from 'cyberui-2045';
import { isAbort, type Connection } from '../connection';
import { Glyph } from '../components/Glyph';
import { LinkRun } from '../components/LinkRun';
import { ScreenTitle } from '../components/ScreenTitle';
import { SignalBars } from '../components/SignalBars';
import { CONNECT_COPY, KIND_LABELS, ROUTE_TITLES } from '../data/product';
import { DEVICE_KINDS, type Device, type DeviceKind, type NearbyDevice, type Room } from '../data/types';
import type { Action } from '../state/reducer';

interface AddDeviceScreenProps {
  devices: readonly Device[];
  rooms: readonly Room[];
  connection: Connection;
  dispatch: Dispatch<Action>;
  /** Closes this screen: Back when that is safe, otherwise Home (router/useHashRoute.ts). */
  leave: () => void;
}

/** What is being linked: a device the scan found, or a typed code (then nothing is known about it). */
interface Target {
  linkId: string;
  nearby: NearbyDevice | null;
}

// The steps of Connect, in order. Which one is showing is screen state, not app
// state: it is gone when the screen is left, and means nothing to the reducer.
type Step =
  | { name: 'start' }
  | { name: 'scanning' }
  | { name: 'results'; found: NearbyDevice[] }
  | { name: 'code' }
  | { name: 'link'; target: Target }
  | { name: 'details'; target: Target };

// Exactly six letters or numbers. Deliberately the only rule: nothing here can
// tell a real code from a made-up one, because nothing is paired (see LinkRun
// and connection/scripted.ts).
const CODE_PATTERN = /^[A-Za-z0-9]{6}$/;

/**
 * Connect: Scan, Pick, Link, then name and room. Every step that needs the
 * outside world goes through the Connection (connection/types.ts), which here
 * is scripted: the scan lists a fixed set of "nearby" devices after a progress
 * bar, and nothing is discovered. A scan starts only when the person taps Start
 * scan, never by itself. "Enter a code instead" is the way in when the device
 * is not listed.
 */
export function AddDeviceScreen({ devices, rooms, connection, dispatch, leave }: AddDeviceScreenProps) {
  const [step, setStep] = useState<Step>({ name: 'start' });
  const [percent, setPercent] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);

  // When the step changes, focus moves to its heading (tabIndex -1: only code
  // can focus it), so a keyboard or screen-reader user is not left on a button
  // that has just disappeared. Not on first load: the browser's own focus is right there.
  const shown = useRef(step.name);
  useEffect(() => {
    if (shown.current === step.name) return;
    shown.current = step.name;
    heading.current?.focus({ preventScroll: true });
  }, [step.name]);

  // The scan runs while this step is showing. Leaving the step (Cancel, or the
  // screen) aborts it, which also clears its timers.
  const scanning = step.name === 'scanning';
  useEffect(() => {
    if (!scanning) return;
    const controller = new AbortController();
    setPercent(0);
    connection
      .scan(setPercent, controller.signal)
      .then((found) => setStep({ name: 'results', found }))
      .catch((error: unknown) => {
        if (!isAbort(error)) throw error;
      });
    return () => controller.abort();
  }, [scanning, connection]);

  const toStart = () => setStep({ name: 'start' });
  const toCode = () => setStep({ name: 'code' });

  switch (step.name) {
    case 'start':
      return (
        <>
          <ScreenTitle>{ROUTE_TITLES.add}</ScreenTitle>
          <section className="step" aria-labelledby="step-title">
            <h2 id="step-title" className="step-title" tabIndex={-1} ref={heading}>
              {CONNECT_COPY.scanTitle}
            </h2>
            <p>{CONNECT_COPY.scanIntro}</p>
            <Button className="full-width" onClick={() => setStep({ name: 'scanning' })}>
              {CONNECT_COPY.scanStart}
            </Button>
            <p className="note">{CONNECT_COPY.scripted}</p>
            <button type="button" className="text-button" onClick={toCode}>
              {CONNECT_COPY.enterCode}
            </button>
          </section>
        </>
      );

    case 'scanning':
      return (
        <>
          <ScreenTitle>{ROUTE_TITLES.add}</ScreenTitle>
          <section className="step" aria-labelledby="step-title">
            <h2 id="step-title" className="step-title" tabIndex={-1} ref={heading}>
              {CONNECT_COPY.scanTitle}
            </h2>
            {/* Motion only while scanning and only if the person has not asked for less (App.css). The words below say the same. */}
            <span className="pulse" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <progress className="progress" max={100} value={percent} aria-label="Scan progress" />
            <p role="status" className="scan-status">
              {CONNECT_COPY.scanning}
            </p>
            <Button variant="secondary" onClick={toStart}>
              {CONNECT_COPY.stopScan}
            </Button>
          </section>
        </>
      );

    case 'results': {
      // A device that is already in the home is not offered again.
      const left = step.found.filter((nearby) => !devices.some((device) => device.id === nearby.id));
      return (
        <>
          <ScreenTitle>{ROUTE_TITLES.add}</ScreenTitle>
          <section className="step" aria-labelledby="step-title">
            <h2 id="step-title" className="step-title" tabIndex={-1} ref={heading}>
              {left.length === 0 ? CONNECT_COPY.noneLeft : CONNECT_COPY.found(left.length)}
            </h2>
            {left.length > 0 && (
              <ul className="nearby-list">
                {left.map((nearby) => (
                  <li key={nearby.id}>
                    {/* One tap picks it and starts the link. The whole row is the target, 64px high. */}
                    <button type="button" className="nearby-row" onClick={() => setStep({ name: 'link', target: { linkId: nearby.id, nearby } })}>
                      <span className="glyph-button glyph-button--static">
                        <Glyph kind={nearby.kind} level={0} />
                      </span>
                      <span className="device-text">
                        <span className="device-name">{nearby.name}</span>
                        <span className="device-meta">{KIND_LABELS[nearby.kind]}</span>
                      </span>
                      <SignalBars signal={nearby.signal} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="secondary" onClick={() => setStep({ name: 'scanning' })}>
              {CONNECT_COPY.scanAgain}
            </Button>
            <button type="button" className="text-button" onClick={toCode}>
              {CONNECT_COPY.enterCode}
            </button>
          </section>
        </>
      );
    }

    case 'code':
      return (
        <>
          <ScreenTitle>{ROUTE_TITLES.add}</ScreenTitle>
          <CodeStep heading={heading} onBack={toStart} onCode={(code) => setStep({ name: 'link', target: { linkId: code, nearby: null } })} />
        </>
      );

    case 'link':
      return (
        <>
          <ScreenTitle>{ROUTE_TITLES.add}</ScreenTitle>
          <section className="step" aria-labelledby="step-title">
            <h2 id="step-title" className="step-title" tabIndex={-1} ref={heading}>
              {CONNECT_COPY.linkTitle}
              {step.target.nearby ? ` ${step.target.nearby.name}` : ''}
            </h2>
            <LinkRun connection={connection} id={step.target.linkId} onLinked={() => setStep({ name: 'details', target: step.target })} onCancel={toStart} />
          </section>
        </>
      );

    case 'details':
      return (
        <>
          <ScreenTitle>{ROUTE_TITLES.add}</ScreenTitle>
          <DetailsStep heading={heading} target={step.target} rooms={rooms} dispatch={dispatch} leave={leave} />
        </>
      );
  }
}

function CodeStep({ heading, onBack, onCode }: { heading: RefObject<HTMLHeadingElement | null>; onBack: () => void; onCode: (code: string) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value.toUpperCase());
    if (error) setError(undefined);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!CODE_PATTERN.test(code)) {
      setError(CONNECT_COPY.codeError);
      // Input does not announce a new error (patrickkuei/CyberUI#121) and takes
      // no ref, so focus goes to the field by name.
      (event.currentTarget.elements.namedItem('code') as HTMLInputElement | null)?.focus();
      return;
    }
    // MOCK: the six characters were checked for shape and are handed to the
    // Connection as the thing to link. Nothing can tell a real code from a
    // made-up one here; a real Connection would.
    onCode(code);
  };

  return (
    <section className="step" aria-labelledby="step-title">
      <h2 id="step-title" className="step-title" tabIndex={-1} ref={heading}>
        {CONNECT_COPY.codeTitle}
      </h2>
      <form className="add-form" onSubmit={onSubmit} noValidate>
        <Input
          label={CONNECT_COPY.codeLabel}
          name="code"
          type="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          maxLength={CONNECT_COPY.codeLength}
          aria-required="true"
          helperText={CONNECT_COPY.codeHelp}
          value={code}
          onChange={onChange}
          error={error}
        />
        <div className="form-actions">
          <Button type="submit">{CONNECT_COPY.codeSubmit}</Button>
          <Button type="button" variant="secondary" onClick={onBack}>
            {CONNECT_COPY.backToScan}
          </Button>
        </div>
      </form>
    </section>
  );
}

function DetailsStep({
  heading,
  target,
  rooms,
  dispatch,
  leave,
}: {
  heading: RefObject<HTMLHeadingElement | null>;
  target: Target;
  rooms: readonly Room[];
  dispatch: Dispatch<Action>;
  leave: () => void;
}) {
  const [name, setName] = useState(target.nearby?.name ?? '');
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? '');
  const [kind, setKind] = useState<DeviceKind>(DEVICE_KINDS[0]!);
  const [error, setError] = useState<string | undefined>();

  const onName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    if (error) setError(undefined);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim() === '') {
      setError(CONNECT_COPY.nameError);
      (event.currentTarget.elements.namedItem('name') as HTMLInputElement | null)?.focus();
      return;
    }
    // MOCK: nothing was paired. A real app adds the device once the link
    // succeeded, and the Connection already said so.
    dispatch({
      type: 'device/add',
      draft: { id: target.nearby?.id, name: name.trim(), roomId, kind: target.nearby?.kind ?? kind, signal: target.nearby?.signal },
    });
    leave();
  };

  return (
    <section className="step" aria-labelledby="step-title">
      <h2 id="step-title" className="step-title" tabIndex={-1} ref={heading}>
        {CONNECT_COPY.detailsTitle}
      </h2>
      <form className="add-form" onSubmit={onSubmit} noValidate>
        <Input
          label={CONNECT_COPY.nameLabel}
          name="name"
          type="text"
          autoComplete="off"
          enterKeyHint="next"
          maxLength={CONNECT_COPY.nameMaxLength}
          aria-required="true"
          value={name}
          onChange={onName}
          error={error}
        />
        {rooms.length === 0 ? (
          <p className="note">
            There are no rooms yet. <a href="#/add-room">Add a room</a> first.
          </p>
        ) : (
          /*
            Select is the library's native <select>, so a phone opens its own
            picker, which is what a thumb wants. variant="secondary" because
            Select's default variant glows with --color-primary (magenta) where
            Input's default uses the accent. No Select is given an `error`:
            Select does not tie it to the field with aria-invalid or
            aria-describedby (patrickkuei/CyberUI#129), and every option is valid.
          */
          <Select
            label={CONNECT_COPY.roomLabel}
            name="room"
            variant="secondary"
            options={rooms.map((room) => ({ value: room.id, label: room.name }))}
            value={roomId}
            onValueChange={setRoomId}
          />
        )}
        {/* A scanned device already says what it is; one added by code does not. */}
        {target.nearby === null && (
          <Select
            label={CONNECT_COPY.kindLabel}
            name="kind"
            variant="secondary"
            options={DEVICE_KINDS.map((option) => ({ value: option, label: KIND_LABELS[option] }))}
            value={kind}
            onValueChange={(value) => setKind(value as DeviceKind)}
          />
        )}
        <div className="form-actions">
          <Button type="submit" disabled={rooms.length === 0}>
            {CONNECT_COPY.save}
          </Button>
          <Button type="button" variant="secondary" onClick={leave}>
            {CONNECT_COPY.cancel}
          </Button>
        </div>
      </form>
    </section>
  );
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/screens/DeviceScreen.test.tsx src/screens/AddDeviceScreen.test.tsx`
Expected: PASS, 50 tests in 2 files (Device 26, Add device 24).

- [ ] **Step 5: Commit**

```bash
git add -A packages/mobile-app
git commit -m "feat(mobile-app): a page for each device, and a scan, pick, link and name flow to add one" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 10: The app shell

The first task after which the whole package must compile and every test must pass.

**Files:**
- Replace: `src/App.tsx`, `src/App.test.tsx`

- [ ] **Step 1: Write the test**

`src/App.test.tsx`: the landmarks and the Demo badge on every screen, one `h1` per screen and headings that never skip a level (including a device that does not exist), the fallback, the tabs, the document title (a device's name on its page), focus on the title on a route change but not on first load (and when only the device changes), `tabindex="-1"`, scroll to the top, the skip link, the device page pushed on top of Home (no nav, a Back button, a `leave()` that does not leave the app, a clean page for another device), Rooms (the chevron, add and remove a room, the plain refusal), the notice (Dismiss, and moving to another tab clears it), state shared between screens, **Add device end to end** and the honesty tests (the sentence in Settings, the line on the Scan screen, and that `fetch`, `navigator.bluetooth` and `Notification` are never called while the app is used).

The two timer-driven tests use a helper, `onFakeClock`, whose comment explains the rule from Conventions: navigate on the real clock, switch to fake timers only around the waits.

```tsx
import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { DEMO_NOTE } from './data/product';

function goTo(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event('hashchange'));
  });
}

// The tab names are also headings and a few buttons' words ("Rooms", "Home"), so a
// bare getByText finds several. Query by role, inside the navigation.
const nav = () => within(screen.getByRole('navigation', { name: 'Main' }));
const h1 = (name: string) => screen.findByRole('heading', { level: 1, name });

describe('App', () => {
  afterEach(() => {
    window.location.hash = '';
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders Home by default, with the three landmarks', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeInTheDocument();
    expect(nav().getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows the Demo badge in the app bar on every screen', () => {
    render(<App />);
    for (const hash of ['#/devices', '#/device/desk-lamp', '#/rooms', '#/settings', '#/add', '#/add-room']) {
      goTo(hash);
      expect(within(screen.getByRole('banner')).getByText('Demo'), hash).toBeInTheDocument();
    }
  });

  it('has exactly one h1 on every screen, and headings never skip a level', () => {
    render(<App />);
    for (const hash of ['#/devices', '#/device/desk-lamp', '#/device/hall-light', '#/device/living-sensor', '#/rooms', '#/settings', '#/add', '#/add-room', '#/device/nope']) {
      goTo(hash);
      expect(screen.getAllByRole('heading', { level: 1 }), hash).toHaveLength(1);
      let previous = 0;
      for (const heading of screen.getAllByRole('heading')) {
        const level = Number(heading.tagName.slice(1));
        expect(level, `${hash}: "${heading.textContent}" jumps from h${previous} to h${level}`).toBeLessThanOrEqual(previous + 1);
        previous = level;
      }
    }
  });

  it('falls back to Home for an unknown hash', () => {
    window.location.hash = '#/nope';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeInTheDocument();
  });

  it('moves between the tabs through real links, marking the current one', async () => {
    render(<App />);
    await userEvent.click(nav().getByRole('link', { name: 'Rooms' }));
    expect(await h1('Rooms')).toBeInTheDocument();
    expect(nav().getByRole('link', { name: 'Rooms' })).toHaveAttribute('aria-current', 'page');
    expect(nav().getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    await userEvent.click(nav().getByRole('link', { name: 'Settings' }));
    expect(await h1('Settings')).toBeInTheDocument();
  });

  it('keeps the document title in step with the route, and names the device on its page', () => {
    render(<App />);
    expect(document.title).toBe('Home — Kestrel');
    goTo('#/rooms');
    expect(document.title).toBe('Rooms — Kestrel');
    goTo('#/device/desk-lamp');
    expect(document.title).toBe('Desk lamp — Kestrel');
    goTo('#/device/nope');
    expect(document.title).toBe('Device — Kestrel');
  });

  it('moves focus to the new screen’s title on a route change, but not on first load', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveFocus();
    goTo('#/settings');
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toHaveFocus();
  });

  it('moves focus to the title when only the device changes', () => {
    render(<App />);
    goTo('#/device/desk-lamp');
    goTo('#/device/tv-plug');
    expect(screen.getByRole('heading', { level: 1, name: 'TV plug' })).toHaveFocus();
  });

  // happy-dom focuses anything, so these would pass without the attribute while a
  // real browser would not focus an <h1> or <main>: route-change focus and the
  // skip link would silently stop working.
  it('makes the screen title and <main> programmatically focusable', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });

  it('scrolls to the top on a route change', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<App />);
    expect(scrollTo).not.toHaveBeenCalled();
    goTo('#/rooms');
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('skips to the main content without touching location.hash', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('link', { name: 'Skip to main content' }));
    expect(screen.getByRole('main')).toHaveFocus();
    expect(window.location.hash).toBe('');
  });

  describe('a device page, pushed on top of Home', () => {
    it('opens from a row, hides the bottom nav and shows a Back button', async () => {
      render(<App />);
      await userEvent.click(screen.getByRole('link', { name: /Desk lamp/ }));
      expect(await h1('Desk lamp')).toBeInTheDocument();
      expect(window.location.hash).toBe('#/device/desk-lamp');
      expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });

    it('goes Back to Home, with the room filter and the switches as they were left', async () => {
      // happy-dom does not run a real session history, so Back is done by hand.
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Hall 2' }));
      await userEvent.click(screen.getByRole('link', { name: /Hall thermostat/ }));
      await h1('Hall thermostat');
      await userEvent.click(screen.getByRole('button', { name: 'Lower target temperature' }));
      await userEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(await h1('Home')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Hall 2' })).toHaveAttribute('aria-pressed', 'true');
      expect(within(screen.getByRole('link', { name: /Hall thermostat/ })).getByText('19.5°')).toBeInTheDocument();
    });

    it('shows a change made on the page in the row, and the power button on Home follows the page', async () => {
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));
      render(<App />);
      await userEvent.click(screen.getByRole('link', { name: /TV plug/ }));
      await userEvent.click(await screen.findByRole('button', { name: 'Turn off' }));
      await userEvent.click(screen.getByRole('button', { name: 'Back' }));
      await h1('Home');
      expect(screen.getByRole('switch', { name: 'TV plug power' })).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByText('3 on, 3 need attention')).toBeInTheDocument();
    });

    it('removes a device from its page, goes back, and says so on Home', async () => {
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));
      render(<App />);
      await userEvent.click(screen.getByRole('link', { name: /Desk lamp/ }));
      await userEvent.click(await screen.findByRole('button', { name: 'Remove device' }));
      await h1('Home');
      expect(screen.queryByRole('link', { name: /Desk lamp/ })).not.toBeInTheDocument();
      expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Removed Desk lamp.');
    });

    it('starts another device’s page clean: a Reconnect in progress is not carried over to it', async () => {
      render(<App />);
      goTo('#/device/hall-light');
      await userEvent.click(screen.getByRole('button', { name: 'Reconnect' }));
      expect(screen.getByRole('list')).toBeInTheDocument();
      goTo('#/device/desk-lamp');
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Disconnect' })).toBeInTheDocument();
    });

    it('opened directly, Back replaces the entry with Home instead of leaving the app', async () => {
      window.location.hash = '#/device/desk-lamp';
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(back).not.toHaveBeenCalled();
      expect(await h1('Home')).toBeInTheDocument();
    });
  });

  describe('Rooms', () => {
    it('opens Home filtered to a room from its chevron', async () => {
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Rooms' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Show devices in Bedroom' }));
      expect(await h1('Home')).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Bedroom: 0 of 2 on']);
      expect(screen.getByRole('button', { name: 'Bedroom 3' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('adds a room: the new room is on Rooms, as a chip on Home and as a choice in Add device, and the notice says so', async () => {
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/rooms'));
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Rooms' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Add room' }));
      await h1('Add room');
      expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
      await userEvent.type(screen.getByLabelText('Room name'), 'Kitchen');
      await userEvent.click(screen.getByRole('button', { name: 'Add room' }));
      await h1('Rooms');
      expect(screen.getByRole('heading', { level: 2, name: 'Kitchen' })).toBeInTheDocument();
      expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Added the room Kitchen.');
      await userEvent.click(nav().getByRole('link', { name: 'Home' }));
      expect(await screen.findByRole('button', { name: 'Kitchen 0' })).toBeInTheDocument();
    });

    it('will not remove a room that still has devices, and says why', async () => {
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Rooms' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Remove room Bedroom' }));
      expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Bedroom still has 3 devices. Remove them first.');
      expect(screen.getByRole('heading', { level: 2, name: 'Bedroom' })).toBeInTheDocument();
    });
  });

  describe('the notice', () => {
    it('can be dismissed', async () => {
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Rooms' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Remove room Hall' }));
      await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(screen.getByRole('status', { name: '' })).toBeEmptyDOMElement();
    });

    it('goes when the person moves to another tab', async () => {
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Rooms' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Remove room Hall' }));
      expect(screen.getByRole('status', { name: '' })).not.toBeEmptyDOMElement();
      await userEvent.click(nav().getByRole('link', { name: 'Settings' }));
      expect(screen.getByRole('status', { name: '' })).toBeEmptyDOMElement();
    });
  });

  describe('state is shared between screens', () => {
    it('shows a unit change on Home and on a device page', async () => {
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Settings' }));
      await userEvent.click(await screen.findByRole('radio', { name: '°F' }));
      await userEvent.click(nav().getByRole('link', { name: 'Home' }));
      await h1('Home');
      expect(within(screen.getByRole('link', { name: /Hall thermostat/ })).getByText('68°')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('link', { name: /Hall thermostat/ }));
      await h1('Hall thermostat');
      expect(document.querySelector('.numeral')).toHaveTextContent('68°');
    });
  });

  // The scripted scan takes 2.4s and each of the four link steps 0.6s. A fake
  // clock runs them at once, but only around the waits: navigating changes the
  // hash, which happy-dom delivers on a real timer, so that part runs on the
  // real clock (and userEvent, which also waits on real timers, only works there).
  async function onFakeClock(run: (advance: (ms: number) => Promise<void>) => Promise<void>) {
    vi.useFakeTimers();
    try {
      await run((ms) => act(async () => { await vi.advanceTimersByTimeAsync(ms); }));
    } finally {
      vi.useRealTimers();
    }
  }

  describe('Add device, end to end', () => {
    it('scans, picks, links, names, and lands on Home with the device in its room and a notice', async () => {
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      await h1('Add device');
      expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
      await onFakeClock(async (advance) => {
        fireEvent.click(screen.getByRole('button', { name: 'Start scan' }));
        await advance(2400);
        fireEvent.click(screen.getByRole('button', { name: /Shelf lamp/ }));
        await advance(2400 + 600);
      });
      fireEvent.change(screen.getByLabelText('Room'), { target: { value: 'bedroom' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add device' }));
      expect(await h1('Home')).toBeInTheDocument();
      const bedroom = within(screen.getByRole('region', { name: /^Bedroom/ }));
      expect(bedroom.getByRole('link', { name: /Shelf lamp/ })).toBeInTheDocument();
      expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Added Shelf lamp to Bedroom.');
    });
  });

  describe('is a demo that controls nothing', () => {
    it('says so in Settings', () => {
      render(<App />);
      goTo('#/settings');
      expect(screen.getByText(DEMO_NOTE)).toBeInTheDocument();
    });

    it('says so on the Scan screen', () => {
      render(<App />);
      goTo('#/add');
      expect(screen.getByText(/This scan is scripted: nothing is discovered/)).toBeInTheDocument();
    });

    it('never calls fetch, Bluetooth or notifications while it is used', async () => {
      const fetchSpy = vi.fn();
      const bluetoothRead = vi.fn();
      const notificationSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      vi.stubGlobal('Notification', notificationSpy);
      Object.defineProperty(navigator, 'bluetooth', { configurable: true, get: bluetoothRead });
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));

      render(<App />);
      await userEvent.click(screen.getByRole('switch', { name: 'Desk lamp power' }));
      await userEvent.click(screen.getByRole('button', { name: 'Turn off Living room' }));
      await userEvent.click(screen.getByRole('link', { name: /Hall light/ }));
      const reconnect = await screen.findByRole('button', { name: 'Reconnect' });
      await onFakeClock(async (advance) => {
        fireEvent.click(reconnect);
        await advance(3000);
      });
      await userEvent.click(screen.getByRole('button', { name: 'Back' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Add device' }));
      await h1('Add device');
      await onFakeClock(async (advance) => {
        fireEvent.click(screen.getByRole('button', { name: 'Start scan' }));
        await advance(2400);
        fireEvent.click(screen.getByRole('button', { name: /Kettle plug/ }));
        await advance(3000);
      });
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      await h1('Home');
      await userEvent.click(nav().getByRole('link', { name: 'Settings' }));
      await userEvent.click(await screen.findByRole('switch', { name: 'Alert me when a device goes offline' }));
      await userEvent.click(screen.getByRole('switch', { name: 'Remote access' }));

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(notificationSpy).not.toHaveBeenCalled();
      expect(bluetoothRead).not.toHaveBeenCalled();
      Reflect.deleteProperty(navigator, 'bluetooth');
    });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL (the old `App.tsx` imports screens that are gone).

- [ ] **Step 3: Write the shell**

`src/App.tsx`. `connection` is a prop with the scripted one as the default, so a test or a forker passes another. The device page is keyed by the device id, so another device's page starts clean (a Reconnect in progress is not carried over). The bottom nav exists only on the three tabs, and a tab press clears the notice.

```tsx
import { useEffect, useReducer, useRef, type MouseEvent, type ReactNode } from 'react';
import { Button } from 'cyberui-2045';
import { AppBar } from './components/AppBar';
import { BottomNav } from './components/BottomNav';
import { SCREEN_TITLE_ID } from './components/ScreenTitle';
import { scriptedConnection, type Connection } from './connection';
import { PRODUCT_NAME, ROUTE_TITLES } from './data/product';
import { isTab, useHashRoute, type Route } from './router/useHashRoute';
import { AddDeviceScreen } from './screens/AddDeviceScreen';
import { AddRoomScreen } from './screens/AddRoomScreen';
import { DeviceScreen } from './screens/DeviceScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RoomsScreen } from './screens/RoomsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { createInitialState, reducer } from './state/reducer';
import './App.css';

interface AppProps {
  /**
   * How the app finds and links devices (connection/types.ts). The scripted one
   * discovers nothing; pass your own to make Add device and Reconnect real.
   */
  connection?: Connection;
}

export default function App({ connection = scriptedConnection }: AppProps) {
  // The only state in the app. Screens read it and describe changes as actions
  // (state/reducer.ts); a reload restores the starting data, nothing is saved.
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const { route, param, leave } = useHashRoute();
  const device = route === 'device' ? state.devices.find((candidate) => candidate.id === param) : undefined;
  const title = route === 'device' ? (device?.name ?? ROUTE_TITLES.device) : ROUTE_TITLES[route];

  // On a route change: keep the document title in step, scroll to the top (one
  // document holds every screen, so the old scroll position would carry over),
  // and move focus to the new screen's <h1>. Without that a keyboard or
  // screen-reader user is left on the tab they pressed, or on a Back button
  // that no longer exists. Not on first load, where the browser's own focus
  // handling is right (and StrictMode runs effects twice in development, which
  // the ref also absorbs). A change of device inside the device route is a
  // route change too.
  const shown = useRef(`${route}/${param ?? ''}`);
  useEffect(() => {
    document.title = `${title} — ${PRODUCT_NAME}`;
    const key = `${route}/${param ?? ''}`;
    if (shown.current === key) return;
    shown.current = key;
    window.scrollTo(0, 0);
    document.getElementById(SCREEN_TITLE_ID)?.focus({ preventScroll: true });
  }, [route, param, title]);

  // The skip link would normally be href="#main", but following it would write
  // location.hash, and every unknown hash falls back to Home. Focusing <main> does the same job.
  const skipToMain = (event: MouseEvent) => {
    event.preventDefault();
    document.getElementById('main')?.focus();
  };

  // Record<Route, ...> (like ROUTE_TITLES in data/product.ts) makes adding a
  // route without a screen a type error, instead of a blank <main>. ROUTES in
  // router/useHashRoute.ts is the one list to start from.
  const screens: Record<Route, () => ReactNode> = {
    devices: () => <HomeScreen state={state} dispatch={dispatch} />,
    // key: another device's page starts clean (a Reconnect in progress is not carried over to it).
    device: () => <DeviceScreen key={param} state={state} dispatch={dispatch} connection={connection} deviceId={param} leave={leave} />,
    rooms: () => <RoomsScreen state={state} dispatch={dispatch} />,
    settings: () => <SettingsScreen state={state} dispatch={dispatch} />,
    add: () => <AddDeviceScreen devices={state.devices} rooms={state.rooms} connection={connection} dispatch={dispatch} leave={leave} />,
    'add-room': () => <AddRoomScreen rooms={state.rooms} dispatch={dispatch} leave={leave} />,
  };

  const tab = isTab(route);

  return (
    <div className="app">
      <a className="skip-link" href="#main" onClick={skipToMain}>
        Skip to main content
      </a>
      <AppBar onBack={tab ? undefined : leave} />
      <div className={state.notice ? 'notice-region notice-region--open' : 'notice-region'}>
        {/* role="status" is a polite live region. It must be in the page before its text changes, so it is always rendered. */}
        <p role="status" className="notice-text">
          {state.notice ?? ''}
        </p>
        {state.notice && (
          <Button variant="ghost" onClick={() => dispatch({ type: 'notice/dismiss' })}>
            Dismiss
          </Button>
        )}
      </div>
      <main id="main" className="screen" tabIndex={-1}>
        {screens[route]()}
      </main>
      {/* Pushed screens (a device's page, Add device, Add room) hide the nav: they have their own Back, and a form with the on-screen keyboard open should not carry a bar under its fields. Moving to another tab also clears the notice. */}
      {tab && <BottomNav route={route} onNavigate={() => dispatch({ type: 'notice/dismiss' })} />}
    </div>
  );
}
```

- [ ] **Step 4: Run everything**

Run: `npx tsc --noEmit` (expected: no output) and `npx vitest run` (expected: PASS, **306 tests in 28 files**; the first version's `phoneRules.test.ts` (17 tests) still runs against the first version's stylesheet and passes, and Task 11 replaces both, which brings the total to 316).

Then look for leftovers of the first version, which must all be gone:

```bash
grep -rnE "DeviceSheet|StatusBadge|ScenesScreen|DevicesScreen|DeviceStatus|SCENES|Drawer" src | grep -v -e "^src/App.css" -e "^src/phoneRules.test.ts"
```

Expected: no output. (The first version's `App.css` and its test still name `.device-sheet` and the Drawer until Task 11; the search there is repeated with nothing excluded.)

- [ ] **Step 5: Commit**

```bash
git add -A packages/mobile-app
git commit -m "feat(mobile-app): the redesigned shell: six routes, a notice that clears, and a keyed device page" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 11: The stylesheet, the theme comment and the guards

The glow, the rows, the chips and the rest, and the rules a tidy-up could break, with the tests that read the CSS from disk. This is also where the switch bug is fixed.

**Files:**
- Replace: `src/App.css`, `src/phoneRules.test.ts`, `src/theme/blue.css` (its values do not change: only its comment, which still described the status badges)
- Unchanged and run again: `src/noHexColors.test.ts`, `src/noInlineStyles.test.ts`, `src/noNetworkOrStorage.test.ts`

- [ ] **Step 1: Write the guard test**

`src/phoneRules.test.ts` reads `App.css` and `index.html` from disk (the same reason as the hex test: `import.meta.glob(..., '?raw')` returns empty strings for CSS) and fails when a rule goes missing. What it adds to the first version's list: **the switch track as the knob's positioned ancestor** (the comment above it says why only a browser can see the bug), 48px and 64px sizes written in CSS, sentence case (no `text-transform: uppercase`, and the library's buttons set back), flat buttons (the library's resting shadow zeroed and its focus ring not touched), the reduced-motion block that sets every transition and animation under `.app` to 0s, the motion that is allowed only inside `no-preference`, one still ring for the scan's pulse, and the white lines of a lit glyph.

```ts
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/phoneRules.test.ts`
Expected: FAIL (the old stylesheet has no `.touch-switch input + div`, no glyph rules, no reduce block).

- [ ] **Step 3: Write the stylesheet**

`src/App.css`. Read its comments: each rule that exists because of the library says so, with the issue number where there is one. The sections are the shell, glyphs, Home, a device's page, Rooms, Add device and Add room, Settings, **Touch targets (where the knob rule lives)**, the bottom nav, and motion (a `reduce` block and a `no-preference` block).

```css
/* Kestrel styles. Colours come only from tokens (var(--color-*)); the one place
   a hex colour is allowed is theme/blue.css (noHexColors.test.ts). Class names
   are flat, not nested under .app. Nothing is rendered outside .app (no portal),
   so every rule here reaches every screen.

   The phone rules live in this file, each with its reason, and
   phoneRules.test.ts guards the ones a tidy-up would break:
     - Touch targets (44px)   see "Touch targets"
     - Safe areas and dvh     see ".app", ".app-bar", ".bottom-nav", ".form-actions"
     - No sticky hover        every :hover is inside @media (hover: hover)
     - Reduced motion         everything of ours that moves is under no-preference;
                              under reduce every transition and animation is 0s
     - The switch's knob      see "Touch targets"
   and the look's one bold idea, the glowing glyph, is in "Glyphs". */

:root {
  /* The one column. Below this width it is the whole screen; above it the app
     stays this wide and centred, with the same bottom nav. */
  --app-max: 30rem;
  /* The smallest comfortable touch target: 44 by 44 CSS pixels. */
  --touch: 2.75rem;
  --pad: 1rem;
}

/* The page background sits on <body> so it fills the window beyond the centred column. */
body {
  margin: 0;
  background: var(--color-base);
  color: var(--color-default);
}

/* ---- App shell ---- */

/* 100dvh, not 100vh: on a phone 100vh is the viewport with the browser's
   toolbar tucked away, so a bottom nav sized to it sits under the toolbar until
   the page is scrolled. cyberui-2045 2.8.0 uses no dvh/svh anywhere
   (patrickkuei/CyberUI#132). 100vh is
   written first as the fallback for browsers that do not know dvh (they drop
   the second line).
   The side padding is the notch in landscape. It needs viewport-fit=cover in
   index.html, or the insets are always 0. */
.app {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: var(--app-max);
  min-height: 100vh;
  min-height: 100dvh;
  margin-inline: auto;
  padding-inline: env(safe-area-inset-left) env(safe-area-inset-right);
  background: var(--color-base);
}

@media (min-width: 30.0625rem) {
  .app {
    border-inline: 1px solid var(--color-border-default);
  }
}

/* Sentence case everywhere. cyberui-2045's Button is bold, uppercase and
   letter-spaced; this app writes its labels like sentences and lets the
   numbers carry the weight, so the one rule here undoes that for every button. */
.app button {
  text-transform: none;
  letter-spacing: normal;
  /* The library's Buttons glow at rest (the primary one in magenta, whatever
     the accent is). Here the glow belongs to the devices, so a button is flat.
     --tw-shadow is the library's own glow; its focus ring is a separate
     variable and is left alone. */
  --tw-shadow: 0 0 transparent;
}

/* Visible to assistive technology only: a status that the picture shows and the words must also say. */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

/* Hidden until it takes focus, then the first thing a keyboard visitor sees.
   It is a control, so it gets the 44px target like the others. */
.skip-link {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 100;
  display: flex;
  align-items: center;
  min-height: var(--touch);
  padding: 0 1rem;
  color: var(--color-base);
  background: var(--color-secondary);
  border-radius: 0.25rem;
  transform: translateY(-200%);
}

.skip-link:focus {
  transform: none;
}

/* A double tap on a switch or a link would zoom the page on iOS. */
.app :is(a, button, label, select) {
  touch-action: manipulation;
}

/* The ring is for real controls. The things code focuses (the screen, its
   title, a step's heading) take focus without drawing one. */
:where(.app-bar-back, .device-link, .glyph-button, .nav-tab, .chip, .preset, .nearby-row, .chevron-button, .text-button, .text-link):focus-visible {
  outline: 2px solid var(--color-secondary);
  outline-offset: 2px;
}

.screen:focus,
.screen-title:focus,
.step-title:focus {
  outline: none;
}

/* ---- App bar ---- */

/* Sticky, not fixed: it stays in the column. The top padding is the status bar
   or notch when the page runs full screen. */
.app-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: calc(3.5rem + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) var(--pad) 0;
  background: var(--color-base);
  border-bottom: 1px solid var(--color-border-default);
}

.app-bar-name {
  margin-inline-end: auto;
  font-size: 1.125rem;
  font-weight: 700;
}

.app-bar-back {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-width: var(--touch);
  min-height: var(--touch);
  margin-inline-start: -0.5rem;
  padding: 0 0.75rem 0 0.25rem;
  font: inherit;
  font-weight: 600;
  color: var(--color-secondary);
  background: none;
  border: 0;
  border-radius: 0.5rem;
  cursor: pointer;
}

/* ---- Notice (a device or room was added or removed, or a room could not be) ---- */

.notice-region {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.notice-region--open {
  padding: 0.75rem var(--pad);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-default);
}

/* Empty (zero height) until there is something to say, but always in the page: a live region has to exist before its text changes. */
.notice-text {
  flex: 1 1 12rem;
  /* A device name can be 30 characters with no place to break. Every place that
     prints one (.device-name, this notice, .step-title) may wrap anywhere, or
     the page scrolls sideways at 320px. phoneRules.test.ts keeps each of them. */
  overflow-wrap: anywhere;
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.4;
}

/* ---- Screens ---- */

.screen {
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem var(--pad) 1.5rem;
}

.screen-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-default);
  overflow-wrap: anywhere;
}

.section-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-muted);
}

.empty,
.note {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.4;
}

.note {
  font-size: 0.9375rem;
}

.full-width {
  width: 100%;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* A link or a button that looks like text. Both are controls, so both get the 44px target. */
.text-link,
.text-button {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: var(--touch);
  padding: 0 0.25rem;
  font: inherit;
  font-weight: 600;
  color: var(--color-secondary);
  background: none;
  border: 0;
  border-radius: 0.5rem;
  cursor: pointer;
}

.text-link {
  text-decoration: none;
}

/* The quiet one: for an action that should be reachable but not inviting (Remove room). */
.text-button--quiet {
  color: var(--color-muted);
}

/* A progress bar for the scan and the link. <progress> is native, so it is
   announced with its value; only its colours are ours, and each browser needs
   its own pseudo-element for them. */
.progress {
  width: 100%;
  height: 0.5rem;
  appearance: none;
  background: var(--color-surface);
  border: 0;
  border-radius: 999px;
  overflow: hidden;
}

.progress::-webkit-progress-bar {
  background: var(--color-surface);
}

.progress::-webkit-progress-value {
  background: var(--color-accent);
}

.progress::-moz-progress-bar {
  background: var(--color-accent);
}

/* ---- Glyphs ----
   The app's one bold idea. A device's drawing glows in the accent in
   proportion to its level (utils/glow.ts decides the number, components/Glyph.tsx
   puts it in the SVG as attributes). Off is dark: muted lines and no glow. The
   colours are tokens, so re-theming reaches the glow too. */
.glyph {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  color: var(--color-muted);
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Lit lines are drawn in white on top of the glow, like a neon tube. White, not
   the text colour: against the brightest the glow gets (the accent at 80% under
   a 40% body) --color-default is 2.5:1 and --color-white is 3.2:1, and 3:1 is
   what a graphic needs. Re-check both if you change the accent or the glow
   (utils/glow.ts, components/Glyph.tsx). */
.glyph--lit {
  color: var(--color-white);
}

.glyph-halo {
  stroke: none;
}

.glyph-stop {
  stop-color: var(--color-accent);
}

.glyph-body {
  fill: var(--color-accent);
}

/* ---- Home ---- */

.summary {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* Room filter: one chip per room, with its device count. It scrolls sideways
   on its own (and only itself: the page never does), so five rooms still fit
   44px chips on a 320px screen. Full bleed, so the chips run to the screen edge. */
.chips {
  display: flex;
  gap: 0.5rem;
  margin-inline: calc(var(--pad) * -1);
  padding: 0.125rem var(--pad);
  overflow-x: auto;
  scroll-padding-inline: var(--pad);
  scrollbar-width: none;
}

.chips::-webkit-scrollbar {
  display: none;
}

.chip {
  flex: none;
  min-height: var(--touch);
  padding: 0 0.875rem;
  font: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  white-space: nowrap;
  color: var(--color-default);
  background: var(--color-surface);
  border: 1px solid var(--color-border-default);
  border-radius: 999px;
  cursor: pointer;
}

.chip-count {
  margin-inline-start: 0.25rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-muted);
}

/* Accent means on, and a chip that is pressed is the one thing selected. */
.chip[aria-pressed='true'] {
  color: var(--color-inverse);
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.chip[aria-pressed='true'] .chip-count {
  color: var(--color-inverse);
}

.room {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.room-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.room-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.room-count {
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  color: var(--color-muted);
}

.room-off {
  flex: none;
  padding-inline: 1rem;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* A row is two sibling controls (the glyph button, the link) and, for a
   light, a thin bar under them. The transparent border is there so that the
   dashed one of a row that is down does not shift anything. */
.device-row {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr);
  align-items: center;
  column-gap: 0.75rem;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: 0.875rem;
}

/* Lost or offline: dashed and muted. The words "Lost" and "Offline" are the row's value. */
.device-row--down {
  border-color: var(--color-muted);
  border-style: dashed;
}

.device-row--down .device-name,
.device-row--down .device-value {
  color: var(--color-muted);
}

.device-row--down .glyph,
.hero--down .glyph {
  stroke-dasharray: 3 4;
}

/* The glyph is the quick power button: 48px, a hairline tile, and the glow
   clipped to it. The sensor's is the same tile without a button. */
.glyph-button {
  box-sizing: border-box;
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  padding: 0;
  overflow: hidden;
  color: inherit;
  background: var(--color-surface);
  border: 1px solid var(--color-border-default);
  border-radius: 0.875rem;
  cursor: pointer;
}

.glyph-button:disabled {
  cursor: default;
}

.glyph-button--static {
  cursor: default;
}

.device-link {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.5rem;
  color: inherit;
  text-decoration: none;
  border-radius: 0.5rem;
}

.device-text {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.125rem 0.5rem;
  min-width: 0;
}

.device-name {
  font-weight: 600;
  overflow-wrap: anywhere;
}

.device-meta {
  font-size: 0.875rem;
  color: var(--color-muted);
}

/* Status only by exception: a small amber mark next to the name. */
.mark {
  display: inline-flex;
  color: var(--color-warning);
}

.device-value {
  font-size: 1.25rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.device-value--on {
  color: var(--color-accent);
}

/* The level of a light, as a thin bar under its row. */
.level-bar {
  grid-column: 1 / -1;
  display: block;
  width: 100%;
  height: 3px;
  margin-top: 0.5rem;
  background: var(--color-border-default);
  border-radius: 2px;
}

.level-bar-fill {
  fill: var(--color-accent);
}

/* ---- A device's page ---- */

/* The halo reaches past the glyph's own box; clipping the sideways overflow
   here keeps it from ever making the page scroll sideways at 320px. */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
  overflow-x: clip;
}

.hero-glyph {
  width: 10.5rem;
  height: 10.5rem;
  margin-block: 0.5rem 1rem;
}

.hero-room,
.hero-caption {
  margin: 0;
  color: var(--color-muted);
}

.hero-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

/* Numbers are the typography: one big tabular numeral per thing. */
.numeral {
  margin: 0;
  font-size: clamp(3.5rem, 18vw, 5rem);
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--color-default);
}

.numeral--dim {
  color: var(--color-muted);
}

.numeral--card {
  font-size: 2.25rem;
}

.numeral-unit {
  margin-inline-start: 0.15em;
  font-size: 0.4em;
  font-weight: 600;
  color: var(--color-muted);
}

.down-note {
  margin: 0.5rem 0 0;
  font-size: 1.125rem;
  color: var(--color-muted);
}

/* 48px round buttons either side of the thermostat's target. */
.stepper {
  display: inline-grid;
  place-items: center;
  width: 3rem;
  min-width: 3rem;
  height: 3rem;
  padding: 0;
  border-radius: 50%;
}

.presets,
.link-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preset-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.preset {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  min-height: 3.5rem;
  padding: 0.25rem 0.5rem;
  font: inherit;
  font-weight: 600;
  color: var(--color-default);
  background: var(--color-surface);
  border: 1px solid var(--color-border-default);
  border-radius: 0.75rem;
  cursor: pointer;
}

.preset-num {
  font-size: 0.8125rem;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  color: var(--color-muted);
}

.preset[aria-pressed='true'] {
  border-color: var(--color-accent);
  box-shadow: inset 0 0 0 1px var(--color-accent);
}

.link-panel {
  padding: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-default);
  border-radius: 0.75rem;
}

.link-facts {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.link-text {
  font-variant-numeric: tabular-nums;
}

.link-text--weak {
  color: var(--color-warning);
}

/* Four bars, lit from the left. Outlined when dim, so the scale is visible without colour. */
.signal-bar {
  fill: none;
  stroke: var(--color-muted);
  stroke-width: 1;
}

.signal-bar--lit {
  fill: var(--color-accent);
  stroke: var(--color-accent);
}

/* ---- Rooms ---- */

.room-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.room-card {
  display: grid;
  gap: 0.25rem;
  padding: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-default);
  border-radius: 1rem;
}

.room-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.room-card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.chevron-button {
  display: grid;
  place-items: center;
  flex: none;
  width: var(--touch);
  height: var(--touch);
  margin-inline-end: -0.5rem;
  color: var(--color-secondary);
  background: none;
  border: 0;
  border-radius: 0.5rem;
  cursor: pointer;
}

.room-card-watts {
  margin: 0;
}

.room-card-on {
  margin: 0 0 0.5rem;
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
}

.room-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

/* ---- Add device, Add room ---- */

.add-form {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1.25rem;
}

/* Sticky inside the form, not fixed over the page: with the on-screen keyboard
   open it stays reachable without covering a field. */
.form-actions {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
  padding: 0.75rem 0 calc(0.75rem + env(safe-area-inset-bottom));
  background: var(--color-base);
}

.step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

/* The scan's pulse: three rings that grow and fade, only while scanning and
   only for people who have not asked for less motion (see the end of this
   file). Without motion the rings are one still ring, and the words "Scanning…"
   below say what is happening. */
.pulse {
  position: relative;
  align-self: center;
  width: 7rem;
  height: 7rem;
}

.pulse span {
  position: absolute;
  inset: 0;
  border: 2px solid var(--color-accent);
  border-radius: 50%;
  opacity: 0;
}

.pulse span:first-child {
  opacity: 0.6;
}

.scan-status,
.link-status {
  margin: 0;
  font-weight: 600;
}

.link-status--failed {
  color: var(--color-error);
}

.nearby-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* One tap picks the device: the whole row is the target, 64px high. */
.nearby-row {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  box-sizing: border-box;
  width: 100%;
  min-height: 4rem;
  padding: 0.5rem 0.75rem 0.5rem 0.5rem;
  font: inherit;
  color: var(--color-default);
  text-align: left;
  background: var(--color-surface);
  border: 1px solid var(--color-border-default);
  border-radius: 0.875rem;
  cursor: pointer;
}

.link-run {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.link-steps {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.link-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.5rem;
  color: var(--color-muted);
}

.link-step--done,
.link-step--active {
  color: var(--color-default);
}

.link-step--active {
  font-weight: 600;
}

.link-step--failed {
  color: var(--color-error);
}

.link-step-mark {
  display: grid;
  place-items: center;
  flex: none;
  width: 1.5rem;
  height: 1.5rem;
  box-sizing: border-box;
  border: 2px solid var(--color-muted);
  border-radius: 50%;
}

.link-step--active .link-step-mark {
  border-color: var(--color-accent);
}

.link-step--done .link-step-mark {
  color: var(--color-inverse);
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.link-step--failed .link-step-mark {
  border-color: var(--color-error);
}

/* ---- Settings ---- */

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.about-version {
  margin: 0;
  font-weight: 600;
}

.about-demo {
  margin: 0;
  color: var(--color-muted);
}

/* ---- Touch targets ----
   A thumb needs about 44 by 44 CSS pixels. In cyberui-2045 2.8.0 Button and
   Input are already 44px or more at size md, but Toggle (a 28 or 32px track),
   Checkbox, RadioGroup (20px rows) and Slider (a 20 or 24px thumb on an 8 or
   12px track) are not, and the library has no option to make them bigger.
   TouchRow (components/TouchRow.tsx) puts a class on a wrapper, and these rules
   stretch the part of the control that takes the tap without changing how it
   looks. They name parts of the library's markup (a <label> around the switch,
   the radio <label>s, the slider's track as the last child and its
   role="slider" thumb), so re-check them when you upgrade the library
   (the README's Phone checklist). */

/* Toggle: the <label> around the switch is what the tap lands on, so give it the height. */
.touch-switch label {
  display: inline-flex;
  align-items: center;
  min-height: var(--touch);
}

/* ... and that is exactly what breaks the knob. The knob is the track's ::after,
   drawn `absolute; top: 2px` against the nearest positioned ancestor, and the
   library makes the <label> `relative` while the track stays static. A label
   stretched to 44px around a 32px track therefore puts the knob at the label's
   top: 6px above where it belongs, poking out of the track. Making the track the
   positioned ancestor puts the knob back inside it. This is the same
   div-after-the-input the focus ring below draws on. phoneRules.test.ts keeps
   the rule and the browser check measures the knob against the track. */
.touch-switch input + div {
  position: relative;
}

/* Toggle draws no focus indicator: its focus classes set a ring colour but never
   a ring width, so a keyboard user cannot see which switch has focus. The real
   <input> is visually hidden and the track is the element right after it, so the
   ring is drawn there (patrickkuei/CyberUI#126, and the README's Known limits). */
.touch-switch input:focus-visible + div {
  outline: 2px solid var(--color-secondary);
  outline-offset: 2px;
}

/* RadioGroup: each option is a <label>, 20px high as shipped. */
.touch-radios label {
  min-height: var(--touch);
}

/* Slider: the drag starts on the track or the thumb. Pseudo-elements on both
   widen what counts as the track or the thumb (a click on a pseudo-element is a
   click on its element) without changing what is drawn. touch-action: none
   stops a finger that starts on the slider from scrolling the page instead of
   dragging: the library sets no touch-action of its own, so it is the
   template's job (patrickkuei/CyberUI#127). The padding keeps the widened
   areas inside the wrapper. */
.touch-slider {
  padding-block: 0.75rem;
  touch-action: none;
}

.slider-control > div:last-child::before {
  content: '';
  position: absolute;
  inset: -1rem 0;
}

.slider-control [role='slider']::before {
  content: '';
  position: absolute;
  inset: -0.75rem;
}

/* The library's accent Slider fills from the accent to the primary colour
   (magenta), which makes a lit light look half-pink. The fill is the first
   child of the track; a solid accent keeps "blue means on" true. */
.slider-control > div:last-child > div:first-child {
  background-image: none;
  background-color: var(--color-accent);
}

/* ---- Bottom navigation ----
   Sticky at the foot of the app column, so it can never leave the column (a
   fixed bar would have to be re-centred by hand on wide screens). The bottom
   padding is the home indicator. */
.bottom-nav {
  position: sticky;
  bottom: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-default);
}

.nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  min-height: 3.5rem;
  padding: 0.5rem 0.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-muted);
  text-decoration: none;
}

.nav-tab[aria-current='page'] {
  color: var(--color-secondary);
  box-shadow: inset 0 2px 0 var(--color-secondary);
}

/* Pressed feedback for a finger. It is :active, which a touch ends, unlike :hover. */
.nav-tab:active,
.device-link:active,
.nearby-row:active,
.chip:active,
.preset:active {
  background-color: color-mix(in srgb, var(--color-accent) 16%, transparent);
}

/* Hover only where a pointer can hover: after a tap on a touch screen :hover
   sticks to the last thing touched. Hover never carries meaning here, it only
   decorates. */
@media (hover: hover) {
  .nav-tab:hover,
  .device-link:hover,
  .nearby-row:hover,
  .chip:hover,
  .preset:hover,
  .app-bar-back:hover,
  .chevron-button:hover,
  .glyph-button:hover {
    background-color: color-mix(in srgb, var(--color-accent) 10%, transparent);
  }
}

/* No animation at all for people who ask for none. Everything of this template's
   own that moves is in the second block. cyberui-2045 2.8.0 still animates its
   Button, Toggle, Slider, RadioGroup, Input and Badge under reduced motion
   (measured: 0.1s to 0.3s), so the first block turns every transition and
   animation under .app off, theirs included. !important is the point: it has
   to beat the library's own rules wherever they are. */
@media (prefers-reduced-motion: reduce) {
  .app,
  .app *,
  .app *::before,
  .app *::after {
    transition-duration: 0s !important;
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .nav-tab,
  .device-link,
  .app-bar-back,
  .chip,
  .preset,
  .nearby-row {
    transition: background-color 150ms ease-out, color 150ms ease-out;
  }

  .glyph-halo {
    transition: opacity 200ms ease-out;
  }

  .pulse span {
    animation: pulse 2.4s ease-out infinite;
  }

  .pulse span:nth-child(2) {
    animation-delay: 0.8s;
  }

  .pulse span:nth-child(3) {
    animation-delay: 1.6s;
  }

  @keyframes pulse {
    from {
      opacity: 0.7;
      transform: scale(0.3);
    }

    to {
      opacity: 0;
      transform: scale(1);
    }
  }
}
```

`src/theme/blue.css`: the two values are unchanged (`#5b9cff`, which `phoneRules.test.ts` and the hex test depend on); the comment now says what the accent means in this app and that the glow's white lines are checked against it.

```css
/* src/theme/blue.css
 *
 * This template's accent. cyberui-2045 declares every colour as a custom
 * property (inside `@layer theme`) and its components read them, so changing
 * two values re-themes everything, including the opacity variants it builds
 * with color-mix(). An unlayered :root rule beats the library's layered one,
 * but keep the import AFTER 'cyberui-2045/styles.css' (see main.tsx) anyway.
 *
 * secondary and accent move together: secondary is the text, link and active
 * colour, accent is the rule under card titles, focus glows and the other end
 * of the primary button's gradient. Overriding only one leaves a stray cyan or
 * yellow. --color-primary (magenta) is left alone on purpose: only the accent
 * hue varies per template.
 *
 * Why blue (hue 216): in this app the accent means "on" (a lit glyph, a lit
 * value, the selected chip), and the library's own colours mean "look at this":
 * --color-warning (amber) marks a low battery or a weak signal and
 * --color-error (red) a lost device or a failed step. They are not touched. An
 * amber, red or magenta accent would blur with one of them.
 *
 * Contrast of this blue: 6.21:1 on --color-base and 4.87:1 on --color-surface
 * (WCAG AA needs 4.5:1 for body text). If you pick another accent, check both,
 * and check the white lines of a lit glyph against the glow it makes (App.css,
 * .glyph--lit). Indigo #818cf8, for instance, is 4.48:1 on the surface and fails.
 *
 * Re-theme this template by changing these two values.
 */
:root {
  --color-secondary: #5b9cff;
  --color-accent: #5b9cff;
}
```

- [ ] **Step 4: Run the guards and everything**

Run: `npx vitest run src/phoneRules.test.ts src/noHexColors.test.ts src/noInlineStyles.test.ts src/noNetworkOrStorage.test.ts` (expected PASS, 39 tests in 4 files: phone rules 27, hex 4, inline styles 4, network and storage 4), then `npx tsc --noEmit` and `npx vitest run` (expected PASS, 316 tests in 28 files) and `npx vite build` (expected: built, no warnings). Then repeat the search for the first version's leftovers, this time over everything: `grep -rnE "DeviceSheet|StatusBadge|ScenesScreen|DevicesScreen|DeviceStatus|SCENES|Drawer|device-sheet" src` (expected: no output).

- [ ] **Step 5: Commit**

```bash
git add -A packages/mobile-app
git commit -m "feat(mobile-app): the redesigned look, and the rule that keeps a switch's knob in its track" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 12: The README (the forker's documentation), and the Code tab's data

**Files:**
- Replace: `packages/mobile-app/README.md`
- Modify: `packages/site/src/content/codeTabs.json` (the `mobile-app` entry only; data, not code, and the one file outside the package this PR touches: see Conventions for why it is here)

- [ ] **Step 1: Write it**

The README is the only documentation that travels with a fork (repo `CLAUDE.md`). What changes: the description and the three places the app says it is a demo; "The design in six lines"; "Making Add device and Reconnect real: the Connection"; the phone checklist with two new rows (the knob and keyboard operation) and the contrast row; **Known limits, with the four `Drawer` entries (CyberUI#123, #124, #125, #130) folded into one that says the template does not use `Drawer` any more and that the issues stay open and valid**, the entry for reduced motion rewritten for the one rule that now handles it, and a last entry for the knob that says "not yet filed upstream" (Task 15 decides; if the owner files it, replace that sentence with the issue number).

Every issue number cited is checked in Step 2.

````markdown
# Kestrel mobile app (template)

A phone-first home device controller built with [cyberui-2045](https://www.npmjs.com/package/cyberui-2045): a Home screen of rooms and devices where each device's drawing glows with how much it is on, a full page per device, rooms with a power figure, a connect flow (scan, pick, link, name) and settings. Kestrel is a fictional hub: swap in your own app by editing the files in `src/data/`.

**Nothing here is connected to anything: no device is controlled, nothing is discovered or paired, nothing is sent or saved.** The app says so in three places: a small "Demo" badge in the app bar, a sentence in Settings ("Template demo: Kestrel is fictional and controls nothing."), and a line on the Scan screen ("This scan is scripted: nothing is discovered."). Delete those when you make the app real.

- **Real:** the bottom navigation and the hash routes (Back closes a device's page, Add device and Add room), every switch, slider, preset and button (they change the in-memory state, and every screen follows), the room filter, rooms you add and remove (a room can only be removed while it is empty), the temperature unit (Celsius is stored, Fahrenheit is only how it is shown), and the forms' own validation (a room needs a unique name, a device needs a name, a pairing code is six letters or numbers).
- **Mock:** the devices and everything about them (their link, signal, latency, battery and wattage are fixed, nothing is measured, and a room's power figure is derived from the invented wattages), the scan and the link (they wait on timers and return a fixed list, see `src/connection/`; the Hall light is scripted to fail so the failure state can be seen), the two settings switches ("Alert me when a device goes offline" and "Remote access" are remembered in memory; no notification is ever scheduled or requested), and all the names and readings. A reload puts the starting data back.
- **Images:** none. The visuals are cyberui-2045 components, CSS and inline SVG, so the package has no image files to replace or license.

```bash
npm install && npm run dev   # start the dev server
npm run build                # type-check and build to dist/
npm test                     # run the test suite
```

Requires Node 20.19 or newer. On a phone, open the dev server's address (`npm run dev -- --host`) or the built page; a desktop browser with its device toolbar is fine for the layout.

## The design in six lines

- **Place before device.** Rooms are how you move around: a chip per room with its count, rooms as headings, and a Rooms screen.
- **Two depths.** Home is for glancing and flipping a switch; a device's own page (`#/device/desk-lamp`) is for everything else.
- **Light is state.** A device that is on is lit in the accent, in proportion to its level; a device that is off is dark. There is no "Online" badge anywhere: status shows only by exception (a small amber mark, a dashed row).
- **Numbers are the typography.** One big tabular numeral per thing, sentence case, no all-caps labels.
- **Boldness in one place.** The glyphs glow ([src/components/Glyph.tsx](src/components/Glyph.tsx), [src/utils/glow.ts](src/utils/glow.ts)); the buttons are flat.
- **Motion only answers a tap,** and is off under `prefers-reduced-motion`.

## Re-theming

The blue accent is two color tokens in [src/theme/blue.css](src/theme/blue.css), imported right after the library's stylesheet in [src/main.tsx](src/main.tsx). cyberui-2045's components read those tokens, so changing the two values re-themes the whole app, the glow included. `--color-primary` (magenta) is left alone on purpose. In this app the accent means "on" (a lit glyph, a lit value, the selected chip) and the library's own amber and red mean "look at this" (a low battery, a weak signal, a lost device), so keep your accent clear of those; the file's comment has the contrast numbers for this blue. Check 4.5:1 for text on both `--color-base` and `--color-surface` when you pick another, and 3:1 for the white lines of a lit glyph on the brightest the glow gets (the accent at 80% under a 40% body: the comment above `.glyph--lit` in [src/App.css](src/App.css) has the figure, 3.2:1 for this blue). Two library quirks to know when you add components: `Select`'s default variant glows magenta where `Input`'s uses the accent (this app uses `variant="secondary"` on `Select`), and the library's `Slider` fills with a gradient that ends in magenta (App.css sets a solid accent).

## Where your data goes

Everything the app says that is not a device comes from files you can edit without touching a component:

- [src/data/devices.ts](src/data/devices.ts): the starting rooms and devices, each with a room, a kind (`light`, `plug`, `thermostat` or `sensor`), a link state, a signal and a latency. A light or plug carries a wattage; a room's total is derived from them ([src/utils/summary.ts](src/utils/summary.ts)) and never stored.
- [src/data/presets.ts](src/data/presets.ts): the fixed presets (Reading, Movie and Night for lights; Heat, Eco and Off for the thermostat).
- [src/data/nearby.ts](src/data/nearby.ts): the devices the scripted scan "finds", and which link is scripted to fail.
- [src/data/settings.ts](src/data/settings.ts): the settings' defaults.
- [src/data/product.ts](src/data/product.ts): the app's name, the screen titles, and the words on every screen.

State is one `useReducer` in [src/App.tsx](src/App.tsx), and [src/state/reducer.ts](src/state/reducer.ts) is the only place it changes: every change is an `Action` in a union, so an action without a case is a compile error. That reducer is the whole mock backend. To connect a real hub, send the request where the action is dispatched (or in an effect that watches the state) and keep the reducer for the instant update. To add a screen, add its id to `ROUTES` in [src/router/useHashRoute.ts](src/router/useHashRoute.ts): the compiler then lists what is still missing (a screen in `src/App.tsx`, a title in `src/data/product.ts` and, for a pushed screen, the tab it returns to). A new device kind is the same: add it to `KindFields` in [src/data/types.ts](src/data/types.ts) and the compiler lists its drawing, label and controls.

Before you publish, replace the title, description and theme colour in [index.html](index.html). They describe the fictional product, and link previews read them, not your React code.

### Making Add device and Reconnect real: the Connection

Scanning and linking go through one small interface, `Connection` in [src/connection/types.ts](src/connection/types.ts): `scan()` and `link(id)`, each a promise with a progress callback and an `AbortSignal`. [src/connection/scripted.ts](src/connection/scripted.ts) is the shipped implementation: it waits on timers and returns the fixed list. It is the seam where a real implementation goes (the browser's Web Bluetooth API, an MQTT or WebSocket client, your own backend): write another `Connection`, pass it as `<App connection={...} />` in `src/main.tsx`, and the Scan, Link and Reconnect screens keep working because they only call those two methods and draw what the callbacks report. Put that code somewhere [src/noNetworkOrStorage.test.ts](src/noNetworkOrStorage.test.ts) does not look, or remove the names you now need from its list on purpose.

Two things that are deliberate and easy to trip over. Routes are hash routes (`#/rooms`), so the app works on any static host and inside an iframe, and the browser's Back button closes a pushed screen instead of leaving the app. And a scan only starts when someone presses Start scan.

## Phone checklist

The rules this template follows, where each lives, and how to check it. Layout cannot be tested without a browser, so most of these are checked by looking.

| Rule | Where it is | How to check it |
|---|---|---|
| Touch targets of at least 44 by 44 CSS pixels | `--touch` and the `.touch-*` rules in [src/App.css](src/App.css); [src/components/TouchRow.tsx](src/components/TouchRow.tsx) explains why (cyberui-2045's `Toggle`, `Checkbox`, `RadioGroup` rows and `Slider` are smaller than 44px as shipped). Rows, chips, presets and the glyph power button (48px) are sized in the same file | In the browser's inspector, hover each control and read its size; [src/phoneRules.test.ts](src/phoneRules.test.ts) fails if a rule is deleted |
| A switch's knob sits inside its track | `.touch-switch input + div { position: relative }` in [src/App.css](src/App.css): the library draws the knob against the nearest positioned element, which is the `<label>`, and the 44px label would otherwise lift the knob 6px out of the 32px track | Open Settings and look at both switches, on and off; the knob must be centred on the track. A test cannot see this: [src/phoneRules.test.ts](src/phoneRules.test.ts) only checks the rule is still there |
| Safe-area insets | `viewport-fit=cover` in [index.html](index.html); `env(safe-area-inset-*)` on the app bar, bottom nav and the forms' button row in [src/App.css](src/App.css). The library adds none | A phone with a notch or home indicator, or your browser's device emulation with safe areas; a desktop window always reads 0 |
| `dvh`, not `vh` | `.app` in [src/App.css](src/App.css), with a `vh` fallback written first | Scroll a phone's browser so its toolbar collapses; the bottom nav must stay on screen |
| No hover-only controls, no sticky hover | Every `:hover` in [src/App.css](src/App.css) is inside `@media (hover: hover)`; every action is a visible control | Emulate touch and tap a row; nothing may stay highlighted |
| Reduced motion | One block at the end of [src/App.css](src/App.css) sets every transition and animation under `.app` to 0s, the library's included; this template's own transitions and the scan's pulse are inside `no-preference`. The scan keeps its progress bar and its "Scanning…" line | Turn on "reduce motion" in the system or the browser's rendering tools and start a scan |
| The on-screen keyboard | The forms' fields are 16px (iOS does not zoom them), use `autoCapitalize`/`autoComplete` and `enterKeyHint`, and the button row is sticky inside the form rather than a fixed bar | Focus a field on a real phone and check Add device and Add room stay reachable |
| No sideways scroll | One column, `max-width: 30rem`, centred on wide screens; every place that prints a device name (up to 30 characters with no break) may wrap anywhere; the room chips scroll sideways inside their own row, and nothing else does; the glow's overflow is clipped on a device's page | Add a device named with 30 `W`s, then compare `document.documentElement.scrollWidth` with the window width at 320, 390 and 800px |
| Keyboard operation | Every control is a native element or a library component; the ones that are not the library's draw their own focus ring (one rule in [src/App.css](src/App.css)) | Tab through every screen: each stop must show a ring; Space flips a glyph power button, Enter opens a row |
| Contrast | Text is 4.5:1 or better on `--color-base` and `--color-surface`; the lit glyph's white lines are 3.2:1 on the brightest glow | The figures are in the comments of [src/theme/blue.css](src/theme/blue.css) and [src/App.css](src/App.css) |

It was measured in desktop Chromium (Microsoft Edge) with device emulation: viewports of 320, 390 and 800px, touch input and reduced motion, and by pressing Tab through every screen. **Not checked:** a real phone, iOS Safari and other WebKit or Firefox browsers, real safe-area insets, the on-screen keyboard resizing the page, a screen reader. Do those before you rely on them.

## Known limits (cyberui-2045 2.8.0)

These are in the library, not in this template, and the template does not work around them silently. Where one is filed upstream it is listed with its issue on [patrickkuei/CyberUI](https://github.com/patrickkuei/CyberUI/issues).

- **This template does not use `Drawer`.** An earlier version had a bottom sheet and met four open problems with it, which are still open and still valid, so if you add a `Drawer` you will meet them too: it does not trap Tab although it is `aria-modal` (CyberUI#123), its border animation cycles through hard-coded colors and ignores the accent (CyberUI#124), its own title is 3.45:1 on its surface (CyberUI#125), and setting its `isOpen` to false yourself restores no focus (CyberUI#130).
- **`Toggle` has no accessible name unless it has an `aria-label`, or an `id` that its visible `label` can point at.** The Settings switches have a visible `label` and its `id`. (CyberUI#120)
- **`Input` does not announce a new error**, so a failed Save moves focus to the first field with a problem. (CyberUI#121)
- **`Toggle` draws no keyboard focus indicator** (its focus classes set a ring color but never a width), so `.touch-switch input:focus-visible + div` in [src/App.css](src/App.css) draws one. (CyberUI#126)
- **`Slider` sets no `touch-action`**, so a touch drag that drifts a little up or down inside something that can scroll is cancelled by the browser part-way; the `.touch-slider` wrapper in [src/App.css](src/App.css) sets `touch-action: none`. (CyberUI#127)
- **`Select` does not tie its `error` to the field** (no `aria-invalid`, no `aria-describedby`), so no form here gives a `Select` an error. (CyberUI#129)
- **There is no bottom navigation, no safe-area or `dvh` support, no way to make `Toggle`, `Checkbox` or `Slider` touch-sized, and no swipeable row**, so this template hand-builds the first, writes the safe-area and `dvh` rules itself, wraps the small controls in `TouchRow`, and has no swipe. These are filed upstream as feature requests. (CyberUI#131 bottom navigation, #132 safe-area and `dvh`, #133 touch-size, #134 swipe and action sheet)
- **The `Remove device` button is the library's `danger` variant**, whose red text is 4.13:1 on its own surface (it is 18px bold, which is not "large text" for the WCAG 3:1 allowance). (CyberUI#128)
- **The library animates its Buttons, `Toggle`, `Slider`, `RadioGroup`, `Input` and `Badge` under `prefers-reduced-motion`** (measured: 0.1s to 0.3s), so this template's stylesheet switches every transition and animation under `.app` off for people who ask for less motion.
- **A `Toggle` is only as tall as its track,** and the knob is positioned against the `<label>` around it, not the track. Anything that stretches the label (this template's 44px touch rule) lifts the knob out of the track; App.css makes the track the positioned element to put it back. Not yet filed upstream.

## Principles this code follows

| Principle | Where to see it |
|---|---|
| **Single source of truth** | The list of screens is `ROUTES` in [src/router/useHashRoute.ts](src/router/useHashRoute.ts), and all app state changes in one reducer, [src/state/reducer.ts](src/state/reducer.ts). The devices, rooms, presets and words live in [src/data/](src/data/), and every figure the screens show about several devices (how many are on, a room's watts, the sentence at the top of Home) is derived from the devices in [src/utils/summary.ts](src/utils/summary.ts). |
| **Typed and exhaustive** | `Route` is derived from `ROUTES`, and `Record<Route, …>` maps in [src/App.tsx](src/App.tsx) and [src/data/product.ts](src/data/product.ts) turn "added a screen but forgot its page or title" into a compile error. The reducer's `Action` union is checked with `assertNever`, and drawings and labels are `Record<DeviceKind, …>`. |
| **No inline styles, no stray colors** | All styling is in CSS classes, and even the glow's brightness is an SVG attribute. [src/noInlineStyles.test.ts](src/noInlineStyles.test.ts) fails if a `style={...}` prop appears, and [src/noHexColors.test.ts](src/noHexColors.test.ts) fails if any stylesheet other than `blue.css` contains a hex color. |
| **Nothing sent, nothing saved** | [src/noNetworkOrStorage.test.ts](src/noNetworkOrStorage.test.ts) fails if the source gains a network, Bluetooth, notification or storage call, and [src/App.test.tsx](src/App.test.tsx) checks that using the app never reaches `fetch`, Bluetooth or notifications. |
| **A seam where the real thing goes** | Scanning and linking sit behind the `Connection` in [src/connection/types.ts](src/connection/types.ts), with a scripted implementation in [src/connection/scripted.ts](src/connection/scripted.ts) that the tests run on a fake clock. |
| **Phone rules in one place** | The touch-target, switch-knob, safe-area, `dvh`, hover and motion rules are in [src/App.css](src/App.css), each with its reason, and [src/phoneRules.test.ts](src/phoneRules.test.ts) fails when one is deleted. |
| **Tested** | A test file sits next to each screen, component, icon set, data file with logic and helper, covering behavior (the room filter, presets, the scan and link steps, the failed link, adding and removing rooms, the unit change, the routes and focus) rather than markup. The exceptions are `src/main.tsx`, the stylesheets, the type-only `src/data/types.ts` and `src/connection/index.ts`, and `ScreenTitle` and `src/data/settings.ts`, which `src/App.test.tsx` and the Settings tests exercise. |
````

- [ ] **Step 2: Check every issue number it cites against the issue it names**

```bash
grep -rno "CyberUI#[0-9]*" README.md src | sed 's/.*CyberUI#//' | sort -un
for n in 120 121 123 124 125 126 127 128 129 130 131 132 133 134; do gh issue view $n --repo patrickkuei/CyberUI --json number,title,state; done
```

Expected: the `grep` prints 120, 121 and 123 to 133 (#134 is cited in the sentence about the feature requests as a bare `#134`, after `CyberUI#131`, so the pattern does not see it; read that sentence), and each of the fourteen is open and is the issue the sentence beside it describes (#120 `Toggle` accessible name, #121 `Input` error not announced, #123 `Drawer` focus trap, #124 `Drawer` hard-coded glow, #125 `Drawer` title 3.45:1, #126 `Toggle` focus ring, #127 `Slider` `touch-action`, #128 `Button` danger 4.13:1, #129 `Select` error, #130 `Drawer` `isOpen` focus, #131 bottom navigation, #132 safe-area and `dvh`, #133 touch-size, #134 swipeable row and action sheet). The only numbers in `src` are in comments next to the workaround they explain. If one is wrong, fix the README or the comment, not the issue.

Also check that the README's links resolve (every `src/...` path it names exists) and that it says nothing about scenes, a sheet, a status badge or the Add device form:

```bash
grep -noE "\]\((src/[^)#]+|index\.html)\)" README.md | sed -E 's/.*\]\(([^)]+)\)/\1/' | while read p; do [ -e "$p" ] || echo "MISSING $p"; done
grep -niE "scene|sheet|badge|drawer" README.md
```

Expected: no `MISSING` line; the second command prints only the lines of the Known limits that deliberately talk about `Drawer`, the "Demo" badge, and "no swipeable row or action sheet" (read each one).

- [ ] **Step 3: Commit the README**

```bash
git add -A packages/mobile-app
git commit -m "docs(mobile-app): rewrite the README for the redesign, and say the template no longer uses Drawer" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 4: See what CI would say about the first version's Code tab**

`scripts/check-code-tab.mjs` (the `code-tab` job) compares every excerpt in `codeTabs.json` with the file it names. Run it now:

```bash
npm run check:code-tab
```

Expected: **it fails**, naming four principles of the first version's `mobile-app` entry ("Single source of truth", "Typed and exhaustive", "Tested", "Content as data"), because the reducer's header comment, the `ROUTES` tuple, the Add device test and the starting devices all changed. That is why this task exists in PR C. (The other two, "No inline styles" and "Phone rules in one place", still match, because `noInlineStyles.test.ts` and the `.touch-switch label` rule did not change.)

- [ ] **Step 5: Regenerate the entry from the real files**

Excerpts are copied by a script that slices the real package files, so each is verbatim by construction, and checks each slice starts at the line it is anchored to (it fails loudly if a file moved). It writes only the `mobile-app` entry. The principles are the first version's with two new ones, **Light is state** (the one function that turns a device into a glow) and **A seam for the real thing** (the `Connection` interface), and without "Content as data" (the README's table still has it); "Phone rules in one place" now excerpts the knob rule. The folder map gains `src/connection`.

```js
// Usage: node make-code-tab.mjs <repo root> [--write]
// Builds the "mobile-app" entry of packages/site/src/content/codeTabs.json by slicing the REAL package files
// (so every excerpt is verbatim by construction), checks that each slice starts at the line it is anchored to,
// and with --write replaces the entry in the JSON. Run scripts/check-code-tab.mjs afterwards: it is the judge.
// Kept OUTSIDE the repo.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2]);
const write = process.argv.includes('--write');
const pkg = path.join(root, 'packages', 'mobile-app');
const jsonPath = path.join(root, 'packages', 'site', 'src', 'content', 'codeTabs.json');

// [name, detail, file, the line the excerpt starts at (exactly, after trimming the end), how many lines]
const PRINCIPLES = [
  ['Single source of truth', 'All app state changes in one reducer, and every total is derived from the devices.', 'src/state/reducer.ts', '// The one place state changes. Every screen reads from AppState and describes a', 3],
  ['Typed and exhaustive', 'Screens are one tuple, and a missing case fails to compile.', 'src/router/useHashRoute.ts', "export const ROUTES = ['devices', 'device', 'rooms', 'settings', 'add', 'add-room'] as const;", 2],
  ['Light is state', "A device's glow is one pure number, and the drawing only reads it.", 'src/utils/glow.ts', 'export function glowLevel(device: Device): number {', 5],
  ['A seam for the real thing', 'Scanning and linking sit behind one interface; swap the script for your hub.', 'src/connection/types.ts', 'export interface Connection {', 7],
  ['No inline styles', 'Styling is in CSS, and a test enforces it.', 'src/noInlineStyles.test.ts', '  const visit = (node: ts.Node) => {', 3],
  ['Tested', 'Tests check what a person can do, next to the code.', 'src/screens/AddRoomScreen.test.tsx', "  it('requires a name: shows the error, links it to the field, keeps focus there and adds nothing', async () => {", 9],
  ['Phone rules in one place', "Touch targets, safe areas, dvh and the switch's knob live in one stylesheet.", 'src/App.css', '.touch-switch input + div {', 3],
];

const FOLDERS = [
  ['src/screens', 'Home, a device page, Rooms, Add room, Add device and Settings.'],
  ['src/components', 'The app bar, bottom nav, device row, glowing glyph, link steps and the touch-target wrapper.'],
  ['src/connection', 'The scan and link interface, and the scripted version of it. Your hub goes here.'],
  ['src/state', 'The reducer: the one place state changes.'],
  ['src/data', 'The rooms, devices, presets, nearby list and words. Your product goes here.'],
  ['src/router', 'Hash routes and the list of screens.'],
  ['src/theme', 'The accent override.'],
  ['src/utils', 'The summary figures, the glow level and temperature units.'],
  ['src/icons', 'Inline SVG icons.'],
];

const problems = [];
const principles = PRINCIPLES.map(([name, detail, file, anchor, count]) => {
  const lines = readFileSync(path.join(pkg, file), 'utf8').replace(/\r\n/g, '\n').split('\n');
  const start = lines.findIndex((line) => line === anchor);
  if (start === -1) {
    problems.push(`${name}: the anchor line is not in ${file}: ${anchor}`);
    return { name, detail, file, excerpt: [] };
  }
  return { name, detail, file, excerpt: lines.slice(start, start + count) };
});
const entry = { principles, folders: FOLDERS.map(([folder, purpose]) => ({ path: folder, purpose })) };

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
if (write) {
  const json = JSON.parse(readFileSync(jsonPath, 'utf8'));
  json['mobile-app'] = entry;
  writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n');
  console.log('wrote the mobile-app entry to', jsonPath);
} else {
  console.log(JSON.stringify(entry, null, 2));
}
```

```bash
node make-code-tab.mjs . --write          # from the repo root
npm run check:code-tab
```

Expected: `wrote the mobile-app entry to …/codeTabs.json`, then `code tab OK (4 templates checked)`. The entry it writes is:

```json
{
  "principles": [
    {
      "name": "Single source of truth",
      "detail": "All app state changes in one reducer, and every total is derived from the devices.",
      "file": "src/state/reducer.ts",
      "excerpt": [
        "// The one place state changes. Every screen reads from AppState and describes a",
        "// change as an Action; nothing else holds app data (the form fields, the scan",
        "// and the open step of Add device are screen state, not app state)."
      ]
    },
    {
      "name": "Typed and exhaustive",
      "detail": "Screens are one tuple, and a missing case fails to compile.",
      "file": "src/router/useHashRoute.ts",
      "excerpt": [
        "export const ROUTES = ['devices', 'device', 'rooms', 'settings', 'add', 'add-room'] as const;",
        "export type Route = (typeof ROUTES)[number];"
      ]
    },
    {
      "name": "Light is state",
      "detail": "A device's glow is one pure number, and the drawing only reads it.",
      "file": "src/utils/glow.ts",
      "excerpt": [
        "export function glowLevel(device: Device): number {",
        "  if (!isReachable(device)) return 0;",
        "  switch (device.kind) {",
        "    case 'light':",
        "      return device.on ? device.level : 0;"
      ]
    },
    {
      "name": "A seam for the real thing",
      "detail": "Scanning and linking sit behind one interface; swap the script for your hub.",
      "file": "src/connection/types.ts",
      "excerpt": [
        "export interface Connection {",
        "  /**",
        "   * Looks for devices nearby. Calls onProgress with 0 to 100 while it works",
        "   * and resolves with what it found. Rejects with an AbortError when `signal`",
        "   * is aborted (the screen was left).",
        "   */",
        "  scan(onProgress: (percent: number) => void, signal?: AbortSignal): Promise<NearbyDevice[]>;"
      ]
    },
    {
      "name": "No inline styles",
      "detail": "Styling is in CSS, and a test enforces it.",
      "file": "src/noInlineStyles.test.ts",
      "excerpt": [
        "  const visit = (node: ts.Node) => {",
        "    if (ts.isJsxAttribute(node) && node.name.getText(sourceFile) === 'style') found = true;",
        "    ts.forEachChild(node, visit);"
      ]
    },
    {
      "name": "Tested",
      "detail": "Tests check what a person can do, next to the code.",
      "file": "src/screens/AddRoomScreen.test.tsx",
      "excerpt": [
        "  it('requires a name: shows the error, links it to the field, keeps focus there and adds nothing', async () => {",
        "    const leave = vi.fn();",
        "    render(<Harness leave={leave} />);",
        "    await userEvent.type(name(), '   ');",
        "    await userEvent.click(save());",
        "    expect(name()).toHaveAttribute('aria-invalid', 'true');",
        "    expect(name()).toHaveAccessibleDescription('Enter a name for the room.');",
        "    expect(name()).toHaveFocus();",
        "    expect(leave).not.toHaveBeenCalled();"
      ]
    },
    {
      "name": "Phone rules in one place",
      "detail": "Touch targets, safe areas, dvh and the switch's knob live in one stylesheet.",
      "file": "src/App.css",
      "excerpt": [
        ".touch-switch input + div {",
        "  position: relative;",
        "}"
      ]
    }
  ],
  "folders": [
    {
      "path": "src/screens",
      "purpose": "Home, a device page, Rooms, Add room, Add device and Settings."
    },
    {
      "path": "src/components",
      "purpose": "The app bar, bottom nav, device row, glowing glyph, link steps and the touch-target wrapper."
    },
    {
      "path": "src/connection",
      "purpose": "The scan and link interface, and the scripted version of it. Your hub goes here."
    },
    {
      "path": "src/state",
      "purpose": "The reducer: the one place state changes."
    },
    {
      "path": "src/data",
      "purpose": "The rooms, devices, presets, nearby list and words. Your product goes here."
    },
    {
      "path": "src/router",
      "purpose": "Hash routes and the list of screens."
    },
    {
      "path": "src/theme",
      "purpose": "The accent override."
    },
    {
      "path": "src/utils",
      "purpose": "The summary figures, the glow level and temperature units."
    },
    {
      "path": "src/icons",
      "purpose": "Inline SVG icons."
    }
  ]
}
```

Then the site's own tests still pass (the Code tab is data, but a test reads it): `pnpm --filter cyberui-templates-site test` (expected PASS, 183 tests in 30 files) and `pnpm --filter cyberui-templates-site run build`.

- [ ] **Step 6: Commit the Code tab**

```bash
git add packages/site/src/content/codeTabs.json
git commit -m "docs(site): re-copy the Mobile App's Code tab excerpts from the redesigned package" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 13: The standalone check (clean room), and mutation-testing the tests

Prove a fork works with nothing from the monorepo, on the npm a forker is likely to have, and prove the tests can fail.

**Files:** none (all work in a temporary directory outside the repo; keep the helper scripts outside the package).

- [ ] **Step 1: Copy the package out of the workspace and install there**

```bash
# from the repo root
CLEAN=$(mktemp -d)
tar --exclude=node_modules --exclude=dist -cf - -C packages/mobile-app . | tar -xf - -C "$CLEAN"
cd "$CLEAN" && node --version && npm --version && npm install && npm run build && npm test
```

Expected: `npm install` ends with `added N packages` and prints **no `npm error` and no `npm warn`** (the funding notice is not a warning); the build and all 316 tests pass. While writing this plan: Node 20.20.2, npm 10.8.2, 128 packages, no warnings. Record the Node and npm versions in the PR. With npm 11 you may see an `npm warn install-scripts` notice about the postinstall scripts of `cyberui-2045` and `esbuild`; that comes from those dependencies, not from this package: record it and carry on. A `Cannot read properties of null (reading 'edgesOut')` crash means `vitest` in `package.json` is below `^4.1.12`; do not paper over it with `--legacy-peer-deps`.

- [ ] **Step 2: Check it is self-contained**

```js
// Usage: node check-standalone.mjs <path to a template package folder>
// Fails if package.json has a workspace: range, or any source file imports a
// relative path that resolves outside the package folder. Keep this script
// OUTSIDE the package: it is a check, not part of the template.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const pkgDir = path.resolve(process.argv[2]);
const problems = [];

const manifest = readFileSync(path.join(pkgDir, 'package.json'), 'utf8');
if (manifest.includes('workspace:')) problems.push('package.json contains a workspace: range');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'node_modules' || entry.name === 'dist') return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const importPattern = /(?:from|import)\s*\(?\s*['"](\.{1,2}\/[^'"]*)['"]/g;
for (const file of walk(pkgDir).filter((f) => /\.(ts|tsx|mjs|css)$/.test(f))) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(importPattern)) {
    const target = path.resolve(path.dirname(file), match[1]);
    if (!target.startsWith(pkgDir + path.sep)) problems.push(`${path.relative(pkgDir, file)} imports ${match[1]}, outside the package`);
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('standalone check OK: no workspace: ranges, no imports leaving the package');
```

```bash
node check-standalone.mjs packages/mobile-app
```

Expected: `standalone check OK: no workspace: ranges, no imports leaving the package`. Also confirm `diff LICENSE packages/mobile-app/LICENSE` prints nothing, `packages/mobile-app/package.json` still has `"license": "MIT"`, and `ls -A packages/mobile-app` shows no `CLAUDE.md`, no `package-lock.json` and no process or skill files. (`package.json` and the lockfile must be unchanged: `git diff --stat main -- pnpm-lock.yaml packages/mobile-app/package.json` prints nothing.)

- [ ] **Step 3: Run it from the copy**

In the clean copy, run `npm run dev`, open the printed address (or `curl -s -o /dev/null -w '%{http_code}' http://localhost:5173/` and expect `200`), then stop it.

- [ ] **Step 4: Mutation-test the tests**

A test suite that cannot fail proves nothing. This script, kept outside the package, applies one small change at a time to the source, runs the test file that should notice, expects it to fail, and restores the file. It matches on LF text, so a CRLF checkout does not hide a multi-line pattern. **Run it on a second copy of the clean room from Step 1 (which has a real `node_modules` from `npm install`), not on the working tree**: it takes about half an hour, rewrites files as it goes, and an interrupted run on the real tree leaves a mutated file behind. (A copy of `packages/mobile-app` itself would not work: under pnpm its `node_modules` is symlinks into the workspace.)

```js
// Usage: node mutate.mjs <package dir>. Applies one change at a time to a source file, runs the named test file,
// expects it to FAIL, and restores the file. Lives outside the package.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
const pkg = path.resolve(process.argv[2]);
const MUTATIONS = [
  // state
  ['src/state/reducer.ts', 'if (!target || !isReachable(target)) return state;', 'if (!target) return state;', 'src/state/reducer.test.ts'],
  ['src/state/reducer.ts', 'device.kind === \'light\' ? { ...device, on: true, level: clamp(action.value, LEVEL.min, LEVEL.max) } : device', 'device.kind === \'light\' ? { ...device, level: clamp(action.value, LEVEL.min, LEVEL.max) } : device', 'src/state/reducer.test.ts'],
  ['src/state/reducer.ts', 'if (count > 0) {', 'if (count > 1000) {', 'src/state/reducer.test.ts'],
  ['src/state/reducer.ts', 'if (roomNameProblem(action.name, state.rooms) !== null) return state;', '', 'src/state/reducer.test.ts'],
  ['src/state/reducer.ts', 'device.roomId === action.id && isReachable(device) && isSwitchable(device) && device.on', 'device.roomId === action.id && isSwitchable(device) && device.on', 'src/state/reducer.test.ts'],
  ['src/state/reducer.ts', 'nextDeviceNumber: action.draft.id ? state.nextDeviceNumber : state.nextDeviceNumber + 1,', 'nextDeviceNumber: state.nextDeviceNumber,', 'src/state/reducer.test.ts'],
  ['src/state/reducer.ts', 'roomFilter: state.roomFilter === room.id ? null : state.roomFilter,', 'roomFilter: state.roomFilter,', 'src/state/reducer.test.ts'],
  ['src/state/reducer.ts', "if (state.devices.some((device) => device.id === id) || !state.rooms.some((room) => room.id === action.draft.roomId)) return state;", '', 'src/state/reducer.test.ts'],
  ['src/state/reducer.ts', 'return preset ? { ...device, on: preset.on, targetC: preset.targetC ?? device.targetC } : device;', 'return preset ? { ...device, on: preset.on, targetC: preset.targetC ?? 20 } : device;', 'src/state/reducer.test.ts'],
  // utils
  ['src/utils/summary.ts', 'export const WEAK_SIGNAL = 1;', 'export const WEAK_SIGNAL = 2;', 'src/utils/summary.test.ts'],
  ['src/utils/summary.ts', "if (device.kind === 'light') return Math.round((device.watts * device.level) / 100);", "if (device.kind === 'light') return device.watts;", 'src/utils/summary.test.ts'],
  ['src/utils/summary.ts', 'if (isReachable(device) && device.signal <= WEAK_SIGNAL) reasons.push(\'weak\');', 'if (device.signal <= WEAK_SIGNAL) reasons.push(\'weak\');', 'src/utils/summary.test.ts'],
  ['src/utils/summary.ts', 'room.name.trim().toLowerCase() === wanted', 'room.name.trim() === wanted', 'src/utils/summary.test.ts'],
  ['src/utils/summary.ts', "return `${onText}, ${attention} ${attention === 1 ? 'needs' : 'need'} attention`;", "return `${onText}, ${attention} needs attention`;", 'src/utils/summary.test.ts'],
  ['src/utils/glow.ts', 'return device.on ? 70 : 0;', 'return 70;', 'src/utils/glow.test.ts'],
  ['src/utils/glow.ts', 'Math.round(14 + (34 * level) / 100)', '14', 'src/utils/glow.test.ts'],
  ['src/utils/glow.ts', 'if (!isReachable(device)) return 0;', '', 'src/utils/glow.test.ts'],
  ['src/utils/units.ts', 'direction * sliderScale(unit).step', 'direction * 2', 'src/utils/units.test.ts'],
  ['src/utils/units.ts', "return formatTemp(celsius, unit).replace(/ °[CF]$/, '°');", "return formatTemp(celsius, unit);", 'src/utils/units.test.ts'],
  ['src/utils/describeDevice.ts', "if (device.link !== 'connected') return LINK_WORDS[device.link];", '', 'src/utils/describeDevice.test.ts'],
  // router
  ['src/router/useHashRoute.ts', "if (!isTab(next.route) && current.current !== next.route) arrivedFromApp.current = true;", '', 'src/router/useHashRoute.test.ts'],
  ['src/router/useHashRoute.ts', 'decodeURIComponent(param)', 'param', 'src/router/useHashRoute.test.ts'],
  ['src/router/useHashRoute.ts', "'add-room': 'rooms',", "'add-room': 'devices',", 'src/router/useHashRoute.test.ts'],
  // app
  ['src/App.tsx', 'key={param} ', '', 'src/App.test.tsx'],
  ['src/App.tsx', '{tab && <BottomNav', '{true && <BottomNav', 'src/App.test.tsx'],
  ['src/App.tsx', "onNavigate={() => dispatch({ type: 'notice/dismiss' })}", 'onNavigate={undefined}', 'src/App.test.tsx'],
  ['src/App.tsx', 'window.scrollTo(0, 0);', '', 'src/App.test.tsx'],
  ['src/App.tsx', "document.getElementById(SCREEN_TITLE_ID)?.focus({ preventScroll: true });", '', 'src/App.test.tsx'],
  ['src/App.tsx', "const key = `${route}/${param ?? ''}`;", 'const key = route;', 'src/App.test.tsx'],
  ['src/App.tsx', "const title = route === 'device' ? (device?.name ?? ROUTE_TITLES.device) : ROUTE_TITLES[route];", 'const title = ROUTE_TITLES[route];', 'src/App.test.tsx'],
  ['src/App.tsx', '<p role="status" className="notice-text">', '<p className="notice-text">', 'src/App.test.tsx'],
  // components
  ['src/components/DeviceRow.tsx', 'disabled={!reachable}', '', 'src/components/DeviceRow.test.tsx'],
  ['src/components/DeviceRow.tsx', 'aria-checked={reachable && device.on}', 'aria-checked={device.on}', 'src/components/DeviceRow.test.tsx'],
  ['src/components/DeviceRow.tsx', "{reasons.includes('battery') && (", '{false && (', 'src/components/DeviceRow.test.tsx'],
  ['src/components/DeviceRow.tsx', 'width={device.on ? device.level : 0}', 'width={device.level}', 'src/components/DeviceRow.test.tsx'],
  ['src/components/DeviceRow.tsx', '\n          role="switch"\n', '\n', 'src/components/DeviceRow.test.tsx'],
  ['src/components/Glyph.tsx', '{lit && (', '{true && (', 'src/components/Glyph.test.tsx'],
  ['src/components/Glyph.tsx', ".replace(/[^a-zA-Z0-9_-]/g, '')", '', 'src/components/Glyph.test.tsx'],
  ['src/components/SignalBars.tsx', 'Math.max(0, Math.min(SIGNAL_BARS, signal))', 'signal', 'src/components/SignalBars.test.tsx'],
  ['src/components/LinkRun.tsx', 'settle = setTimeout(() => linked.current(), settleMs);', 'linked.current();', 'src/components/LinkRun.test.tsx'],
  ['src/components/LinkRun.tsx', 'controller.abort();\n      clearTimeout(settle);', 'clearTimeout(settle);', 'src/components/LinkRun.test.tsx'],
  ['src/components/LinkRun.tsx', 'setAttempt((count) => count + 1)', 'setAttempt((count) => count)', 'src/components/LinkRun.test.tsx'],
  ['src/components/LinkRun.tsx', "if (isAbort(error)) return;", '', 'src/components/LinkRun.test.tsx'],
  ['src/components/AppBar.tsx', '{DEMO_BADGE}', '', 'src/components/AppBar.test.tsx'],
  ['src/components/BottomNav.tsx', "aria-current={route === tab ? 'page' : undefined}", '', 'src/components/BottomNav.test.tsx'],
  // connection
  ['src/connection/scripted.ts', 'if (failure?.step === step) throw new LinkError(failure.message, step);', '', 'src/connection/scripted.test.ts'],
  ['src/connection/scripted.ts', 'return [...NEARBY];', 'return [];', 'src/connection/scripted.test.ts'],
  ['src/connection/scripted.ts', 'clearTimeout(timer);\n      reject(', 'reject(', 'src/connection/scripted.test.ts'],
  // screens
  ['src/screens/HomeScreen.tsx', 'disabled={stats.on === 0}', '', 'src/screens/HomeScreen.test.tsx'],
  ['src/screens/HomeScreen.tsx', 'aria-pressed={filter === null}', 'aria-pressed={false}', 'src/screens/HomeScreen.test.tsx'],
  ['src/screens/HomeScreen.tsx', 'rooms.some((room) => room.id === roomFilter) ? roomFilter : null', 'roomFilter', 'src/screens/HomeScreen.test.tsx'],
  ['src/screens/HomeScreen.tsx', '{stats.switchable > 0 && (', '{true && (', 'src/screens/HomeScreen.test.tsx'],
  ['src/screens/DeviceScreen.tsx', '{reachable && <Controls', '{<Controls', 'src/screens/DeviceScreen.test.tsx'],
  ['src/screens/DeviceScreen.tsx', 'active={device.on && device.level === preset.level}', 'active={device.level === preset.level}', 'src/screens/DeviceScreen.test.tsx'],
  ['src/screens/DeviceScreen.tsx', "aria-live={device.kind === 'thermostat' ? 'polite' : undefined}", '', 'src/screens/DeviceScreen.test.tsx'],
  ['src/screens/DeviceScreen.tsx', "dispatch({ type: 'device/remove', id: device.id });\n          leave();", "dispatch({ type: 'device/remove', id: device.id });", 'src/screens/DeviceScreen.test.tsx'],
  ['src/screens/DeviceScreen.tsx', "reachable ? 'hero' : 'hero hero--down'", "'hero'", 'src/screens/DeviceScreen.test.tsx'],
  ['src/screens/DeviceScreen.tsx', "{weak ? 'Weak, ' : ''}", '', 'src/screens/DeviceScreen.test.tsx'],
  ['src/screens/RoomsScreen.tsx', "window.location.hash = '#/devices';", '', 'src/screens/RoomsScreen.test.tsx'],
  ['src/screens/RoomsScreen.tsx', "dispatch({ type: 'filter/set', roomId: room.id });", '', 'src/screens/RoomsScreen.test.tsx'],
  ['src/screens/AddRoomScreen.tsx', "(event.currentTarget.elements.namedItem('name') as HTMLInputElement | null)?.focus();", '', 'src/screens/AddRoomScreen.test.tsx'],
  ['src/screens/AddRoomScreen.tsx', 'if (error) setError(undefined);', '', 'src/screens/AddRoomScreen.test.tsx'],
  ['src/screens/AddDeviceScreen.tsx', 'heading.current?.focus({ preventScroll: true });', '', 'src/screens/AddDeviceScreen.test.tsx'],
  ['src/screens/AddDeviceScreen.tsx', 'return () => controller.abort();', 'return undefined;', 'src/screens/AddDeviceScreen.test.tsx'],
  ['src/screens/AddDeviceScreen.tsx', 'const left = step.found.filter((nearby) => !devices.some((device) => device.id === nearby.id));', 'const left = step.found;', 'src/screens/AddDeviceScreen.test.tsx'],
  ['src/screens/AddDeviceScreen.tsx', '{target.nearby === null && (', '{true && (', 'src/screens/AddDeviceScreen.test.tsx'],
  ['src/screens/AddDeviceScreen.tsx', '<Button type="submit" disabled={rooms.length === 0}>', '<Button type="submit">', 'src/screens/AddDeviceScreen.test.tsx'],
  ['src/screens/AddDeviceScreen.tsx', 'if (!CODE_PATTERN.test(code)) {', "if (code === '') {", 'src/screens/AddDeviceScreen.test.tsx'],
  ['src/screens/SettingsScreen.tsx', '{DEMO_NOTE}', '', 'src/screens/SettingsScreen.test.tsx'],
  // css and guards
  ['src/App.css', '.touch-switch input + div {\n  position: relative;\n}', '.touch-switch input + div {\n}', 'src/phoneRules.test.ts'],
  ['src/App.css', '  touch-action: none;\n}', '}', 'src/phoneRules.test.ts'],
  ['src/App.css', 'min-height: 100vh;\n  min-height: 100dvh;', 'min-height: 100vh;', 'src/phoneRules.test.ts'],
  ['src/App.css', '@media (hover: hover) {\n  .nav-tab:hover,', '.nav-tab:hover {}\n@media (hover: hover) {\n  .nav-tab:hover,', 'src/phoneRules.test.ts'],
  ['src/App.css', '  text-transform: none;\n', '', 'src/phoneRules.test.ts'],
  ['src/App.css', '  --tw-shadow: 0 0 transparent;\n', '', 'src/phoneRules.test.ts'],
  ['src/App.css', '  color: var(--color-base);\n  background: var(--color-secondary);', '  color: #123456;\n  background: var(--color-secondary);', 'src/noHexColors.test.ts'],
  ['src/App.css', '    transition-duration: 0s !important;\n', '', 'src/phoneRules.test.ts'],
  ['src/App.css', '.glyph--lit {\n  color: var(--color-white);', '.glyph--lit {\n  color: var(--color-default);', 'src/phoneRules.test.ts'],
  ['src/App.css', '.hero {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0.25rem;\n  text-align: center;\n  overflow-x: clip;', '.hero {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0.25rem;\n  text-align: center;', 'src/phoneRules.test.ts'],
  ['src/App.css', '  min-height: 4rem;\n  padding: 0.5rem 0.75rem 0.5rem 0.5rem;', '  min-height: 2rem;\n  padding: 0.5rem 0.75rem 0.5rem 0.5rem;', 'src/phoneRules.test.ts'],
  ['src/App.css', '.touch-switch input:focus-visible + div {', '.touch-switch input:focus + div {', 'src/phoneRules.test.ts'],
  ['src/data/settings.ts', 'export const DEFAULT_SETTINGS', "export const leak = () => fetch('/x');\nexport const DEFAULT_SETTINGS", 'src/noNetworkOrStorage.test.ts'],
  ['src/data/settings.ts', 'export const DEFAULT_SETTINGS', "export const leak = () => localStorage.setItem('a', 'b');\nexport const DEFAULT_SETTINGS", 'src/noNetworkOrStorage.test.ts'],
  ['src/data/product.ts', 'export const DEMO_NOTE = `Template demo: ${PRODUCT_NAME} is fictional and controls nothing.`;', 'export const DEMO_NOTE = `Template demo.`;', 'src/data/product.test.ts'],
  ['src/data/product.ts', "scripted: 'This scan is scripted: nothing is discovered. It shows a fixed list.',", "scripted: 'Scanning.',", 'src/data/product.test.ts'],
  ['src/data/devices.ts', "link: 'lost', signal: 2", "link: 'connected', signal: 2", 'src/data/devices.test.ts'],
  ['src/data/nearby.ts', "'hall-light': { step: 'securing', message: 'No response from the hub' },", '', 'src/data/devices.test.ts'],
];
let problems = 0;
let caught = 0;
for (const [file, from, to, test, note] of MUTATIONS) {
  const full = path.join(pkg, file);
  const original = readFileSync(full, 'utf8');
  // Match on LF text, so a CRLF checkout does not hide a pattern that spans lines.
  const lf = original.replace(/\r\n/g, '\n');
  if (!lf.includes(from)) { console.log(`SKIP (pattern not found) ${file}: ${from.slice(0, 60).replace(/\n/g, ' ')}`); problems++; continue; }
  writeFileSync(full, lf.replace(from, () => to));
  let failed = false;
  try { execSync(`npx vitest run ${test}`, { cwd: pkg, stdio: 'pipe' }); } catch { failed = true; }
  writeFileSync(full, original);
  console.log(`${failed ? 'caught  ' : 'SURVIVED'} ${file}: ${from.slice(0, 64).replace(/\n/g, ' ')}`);
  if (failed) caught++; else problems++;
}
console.log(problems === 0 ? `all ${caught} mutations caught` : `${problems} problem(s), ${caught} caught`);
```

```bash
cp -r "$CLEAN" /tmp/mobile-app-mut     # on Windows use a short path such as C:/mk/app-mut
node mutate.mjs /tmp/mobile-app-mut
```

Expected: every line `caught`, and `all 87 mutations caught` at the end (the run while writing this plan, on a copy taken before a comment-only change to App.css's header comment). The list was grown in two rounds: the first run caught 78 of 86, and each survivor was a **weak test**, which was strengthened until it caught the mutation: a thermostat's Off preset kept its target only because the target happened to be the default; a sensor's signal bars were clamped in the drawing but not in the label; an aborted link overwrote its replacement with a failure; an abandoned scan's timer was not checked right after the abort; a gradient id was only tested on the React version installed; and the lit lines' colour had no test. Two of the eight were the script's fault and are corrected in the list above: one pattern hit a comment and not the attribute, and `direction * 0.5` is an equivalent mutant (in Fahrenheit the display rounds a half degree to the same whole degree), so it became `direction * 2`.

If one survives, the test is weaker than its name: strengthen the test (not the code) until the mutation is caught, and commit it as `test(mobile-app): …`. If a pattern is "not found", the code moved: update the script, not the code.

- [ ] **Step 5: After PR C is merged, the real fork path**

```bash
npx --yes tiged patrickkuei/cyberui-templates/packages/mobile-app /tmp/mobile-app-tiged
cd /tmp/mobile-app-tiged && npm install && npm run build && npm test
```

Record the result in PR D's description. If it cannot be run yet, say so. Nothing to commit in this task.

### Task 14: The real-browser check at 320, 390 and 800px

Layout, touch sizes, focus rings, the glow, the knob and the motion rules cannot be tested under happy-dom (spec §8), so this is a task with a checklist and scripts, as issue #48 requires: **320, 390 and 800px**, checked in a real browser, fixing what fails in the file it belongs to (each fix its own commit). The numbers below are what the code in this plan produced; yours are the real ones.

**Files:**
- Modify: whatever the checks say; `docs/superpowers/specs/2026-10-17-mobile-app-design.md` (append "Findings from the redesign", Task 15)

- [ ] **Step 1: Start the app**

```bash
pnpm --filter mobile-app-template dev --port 5199 --strictPort     # leave it running
```

- [ ] **Step 2: Contrast, from the real tokens**

```js
// Usage: node contrast.mjs <path to cyberui-2045.css> <path to src/theme/blue.css>
// Prints WCAG contrast ratios for the pairs the redesigned app actually uses, from the real tokens,
// including the colours the glow produces (a glyph's lines over its lit halo and body).
// Kept OUTSIDE the package: it is a check, not part of the template.
import { readFileSync } from 'node:fs';

const [libraryCss, themeCss] = process.argv.slice(2).map((file) => readFileSync(file, 'utf8'));
const hex = (css, name) => css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{3,6})`))?.[1];
const full = (value) => (value.length === 4 ? '#' + [1, 2, 3].map((i) => value[i] + value[i]).join('') : value);
const color = Object.fromEntries(
  ['base', 'surface', 'muted', 'default', 'primary', 'success', 'warning', 'error', 'inverse', 'border-default', 'white'].map((name) => [name, full(hex(libraryCss, name))]),
);
color.accent = full(hex(themeCss, 'accent'));

const rgb = (value) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
const toHex = (channels) => '#' + channels.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const mix = (top, bottom, alpha) => toHex(rgb(top).map((v, i) => v * alpha + rgb(bottom)[i] * (1 - alpha)));
const luminance = (value) => {
  const [r, g, b] = rgb(value).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// What a glyph's lines sit on when lit at full level: the halo's centre is the accent at stop-opacity 0.9 (opacity 1),
// and the body fills with the accent at 45%. Worst case is the brightest background, i.e. full level.
const tile = color.surface;
const haloCentre = mix(color.accent, tile, 0.8);
const bodyOnHalo = mix(color.accent, haloCentre, 0.4);
// Mid level: halo opacity 0.58, body 23%
const haloMid = mix(color.accent, tile, 0.8 * 0.58);
const bodyMid = mix(color.accent, haloMid, 0.23);
// Row sits on base, halo is clipped to the tile, so the tile (surface) is the base layer.

const pairs = [
  ['default on base (body text, names)', 'default', 'base', 4.5],
  ['default on surface (names on cards, presets)', 'default', 'surface', 4.5],
  ['muted on base (room counts, notes, headings)', 'muted', 'base', 4.5],
  ['muted on surface (chip counts, preset numbers, Remove room)', 'muted', 'surface', 4.5],
  ['accent on base (lit values 70%, On, 20°; links; Back)', 'accent', 'base', 4.5],
  ['accent on surface (Turn off outline text, Disconnect text, chevron)', 'accent', 'surface', 4.5],
  ['inverse on accent (pressed chip, primary Button, done check)', 'inverse', 'accent', 4.5],
  ['warning on base (low battery and weak signal marks, "Weak, 96 ms")', 'warning', 'base', 4.5],
  ['warning on surface (the weak text sits in the Link panel)', 'warning', 'surface', 4.5],
  ['error on base (failed step and message)', 'error', 'base', 4.5],
  ['error on surface (Remove device, the library danger Button: CyberUI#128)', 'error', 'surface', 4.5],
];
let failures = 0;
for (const [label, fg, bg, need] of pairs) {
  const value = ratio(color[fg], color[bg]);
  const ok = value >= need;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${value.toFixed(2)}:1 (needs ${need})  ${label}`);
}
console.log('--- the glow (graphics need 3:1; the glyph is decorative, its state is also in text and aria-checked)');
for (const [label, a, b, need] of [
  ['white lines on the lit body at full level (worst case)', color.white, bodyOnHalo, 3],
  ['white lines on the halo centre at full level', color.white, haloCentre, 3],
  ['white lines on the lit body at mid level', color.white, bodyMid, 3],
  ['(for comparison) default lines on the lit body at full level', color.default, bodyOnHalo, 3],
  ['muted lines (dark glyph) on surface', color.muted, tile, 3],
  ['accent halo edge (lit tile) against base, the tile border', color.accent, color.base, 3],
  ['border-default on base (the unlit signal bars use muted instead)', color['border-default'], color.base, 1],
  ['muted outline of an unlit signal bar on surface', color.muted, color.surface, 3],
  ['accent fill of a lit signal bar on surface', color.accent, color.surface, 3],
  ['muted dashed row border on base (lost row)', color.muted, color.base, 3],
]) {
  const value = ratio(a, b);
  console.log(`${value >= need ? 'ok  ' : 'NOTE'} ${value.toFixed(2)}:1 (graphics ${need})  ${label}   [${toHex(rgb(a))} on ${toHex(rgb(b))}]`);
}
if (failures > 0) console.log(`\n${failures} text pair(s) below 4.5:1`);
```

```bash
node contrast.mjs <package>/node_modules/cyberui-2045/dist/cyberui-2045.css <package>/src/theme/blue.css
```

Expected (computed while writing the plan). The one `FAIL` is a **library** finding already filed (CyberUI#128: the red text of the library's `danger` Button on its own surface), not a template bug. The glow lines show why a lit glyph is drawn in white: the text colour is 2.45:1 on the brightest glow and a graphic needs 3:1. The `NOTE` line is that comparison and is expected:

```text
ok   12.92:1 (needs 4.5)  default on base (body text, names)
ok   10.13:1 (needs 4.5)  default on surface (names on cards, presets)
ok   6.02:1 (needs 4.5)  muted on base (room counts, notes, headings)
ok   4.72:1 (needs 4.5)  muted on surface (chip counts, preset numbers, Remove room)
ok   6.21:1 (needs 4.5)  accent on base (lit values 70%, On, 20°; links; Back)
ok   4.87:1 (needs 4.5)  accent on surface (Turn off outline text, Disconnect text, chevron)
ok   6.21:1 (needs 4.5)  inverse on accent (pressed chip, primary Button, done check)
ok   8.94:1 (needs 4.5)  warning on base (low battery and weak signal marks, "Weak, 96 ms")
ok   7.01:1 (needs 4.5)  warning on surface (the weak text sits in the Link panel)
ok   5.27:1 (needs 4.5)  error on base (failed step and message)
FAIL 4.13:1 (needs 4.5)  error on surface (Remove device, the library danger Button: CyberUI#128)
--- the glow (graphics need 3:1; the glyph is decorative, its state is also in text and aria-checked)
ok   3.23:1 (graphics 3)  white lines on the lit body at full level (worst case)   [#ffffff on #568fe9]
ok   3.63:1 (graphics 3)  white lines on the halo centre at full level   [#ffffff on #5286da]
ok   5.01:1 (graphics 3)  white lines on the lit body at mid level   [#ffffff on #486fb2]
NOTE 2.45:1 (graphics 3)  (for comparison) default lines on the lit body at full level   [#e0e0e0 on #568fe9]
ok   4.72:1 (graphics 3)  muted lines (dark glyph) on surface   [#9797b5 on #2d2d44]
ok   6.21:1 (graphics 3)  accent halo edge (lit tile) against base, the tile border   [#5b9cff on #1a1a2e]
ok   1.62:1 (graphics 1)  border-default on base (the unlit signal bars use muted instead)   [#3c3c5e on #1a1a2e]
ok   4.72:1 (graphics 3)  muted outline of an unlit signal bar on surface   [#9797b5 on #2d2d44]
ok   4.87:1 (graphics 3)  accent fill of a lit signal bar on surface   [#5b9cff on #2d2d44]
ok   6.02:1 (graphics 3)  muted dashed row border on base (lost row)   [#9797b5 on #1a1a2e]

1 text pair(s) below 4.5:1
```

- [ ] **Step 3: Measure it in a real browser**

`browser-check.mjs` does, in one run: sideways scroll on every screen at 320, 390 and 800px (the chips' own row is excluded, nothing else may stick out); a 30-character unbroken device name at 320px on Home and on its own page; **every control at least 44 by 44 on every screen at 390 and 320px and on every step of Add device** (links, buttons, selects, inputs, the label that is the hit area of each switch and radio, the slider's track band and thumb zone read from the computed `::before` offsets); the skip link's size when it is shown; **the knob against the track on both Settings switches, on and off, at all three widths, from the CSS and from the pixels of a screenshot**; reduced motion both ways (the chips' and nav tabs' transitions, the glow's, the scan's pulse and the still ring, the "Scanning…" line); and the look (no resting shadow on the Add device button, no uppercase text on Home). It exits with code 1 and lists what failed.

```js
// A throwaway browser check for the redesigned mobile-app template, kept OUTSIDE the repo.
// Usage: node browser-check.mjs <url of the dev server or preview, no hash> [path to a Chromium or Edge executable]
// It drives a real Chromium (Edge here) through puppeteer-core with device emulation: touch, mobile viewports,
// safe-area insets and prefers-reduced-motion. It measures and prints; it fixes nothing. Exit code 1 if a hard check fails.
import puppeteer from 'puppeteer-core';
import { PNG } from 'pngjs';

const url = process.argv[2] ?? 'http://localhost:5199/';
const exe = process.argv[3] ?? process.env.CHROMIUM ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const out = {};
const failures = [];
const fail = (message) => failures.push(message);

const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const client = await page.createCDPSession();

async function phone(width, height, extra = {}) {
  await page.setViewport({ width, height, deviceScaleFactor: 2, isMobile: width < 800, hasTouch: width < 800, ...extra });
}
// about:blank first: going from one hash to the same hash is not a reload.
const open = async (hash = '#/devices') => { await page.goto('about:blank'); await page.goto(url + hash, { waitUntil: 'networkidle0' }); await sleep(250); };
const ROUTES = ['#/devices', '#/device/desk-lamp', '#/device/tv-plug', '#/device/hall-thermostat', '#/device/living-sensor', '#/device/hall-light', '#/rooms', '#/settings', '#/add', '#/add-room'];
const press = async (text) => { const handle = await page.evaluateHandle((t) => [...document.querySelectorAll('button, a')].find((b) => b.textContent.trim().startsWith(t) || b.getAttribute('aria-label') === t), text); const el = handle.asElement(); if (!el) throw new Error('no control: ' + text); await el.click(); await sleep(150); };

// ---------------------------------------------------------------------------------------------
// 1. No sideways scroll, at the three widths, on every screen (and on each step of Add device at 320)
// ---------------------------------------------------------------------------------------------
const overflow = () => page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth, innerW: innerWidth,
  // The chips scroll sideways on their own, on purpose; nothing else may stick out.
  overflowing: [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest('.skip-link, .chips')).map((e) => e.tagName + '.' + String(e.className?.baseVal ?? e.className).slice(0, 24)).slice(0, 5),
}));
out.widths = {};
for (const [w, h] of [[320, 568], [390, 844], [800, 900]]) {
  await phone(w, h);
  for (const hash of ROUTES) {
    await open(hash);
    const r = await overflow();
    const ok = r.scrollW <= r.innerW && r.overflowing.length === 0;
    out.widths[`${w} ${hash}`] = ok ? 'ok' : r;
    if (!ok) fail(`sideways scroll at ${w} on ${hash}`);
  }
}
// A long unbroken name must not push anything sideways at 320.
await phone(320, 568);
await open('#/add');
await press('Enter a code instead');
await page.type('input[name=code]', 'abc123');
await press('Link device');
await sleep(3300);
await page.type('input[name=name]', 'Wwwwwwwwwwwwwwwwwwwwwwwwwwwwww');
await press('Add device');
await sleep(400);
out.longName = {};
for (const hash of ['#/devices']) {
  const r = await overflow();
  out.longName[hash] = r.scrollW <= r.innerW && r.overflowing.length === 0 ? 'ok' : r;
  if (out.longName[hash] !== 'ok') fail('long device name overflows Home at 320');
}
await page.evaluate(() => [...document.querySelectorAll('a.device-link')].find((a) => a.textContent.startsWith('Wwww')).click());
await sleep(300);
{
  const r = await overflow();
  out.longName.devicePage = r.scrollW <= r.innerW && r.overflowing.length === 0 ? 'ok' : r;
  if (out.longName.devicePage !== 'ok') fail('long device name overflows its page at 320');
}

// ---------------------------------------------------------------------------------------------
// 2. Every control is at least 44 by 44 CSS pixels, on every screen, at 320 and 390
// ---------------------------------------------------------------------------------------------
const targets = () => page.evaluate(() => {
  const small = [];
  let count = 0;
  const visible = (el) => { const cs = getComputedStyle(el); const b = el.getBoundingClientRect(); return cs.visibility !== 'hidden' && cs.display !== 'none' && b.width > 0 && b.height > 0 && !el.closest('.skip-link'); };
  const describe = (el) => (el.getAttribute('aria-label') || el.textContent.trim() || el.name || el.getAttribute('role') || el.tagName).slice(0, 28);
  // Native controls and links
  for (const el of document.querySelectorAll('a[href], button, select, input:not([type=checkbox]):not([type=radio]), progress')) {
    if (el.tagName === 'PROGRESS' || !visible(el) || el.disabled) continue;
    count++;
    const b = el.getBoundingClientRect();
    if (b.width < 43.9 || b.height < 43.9) small.push(`${el.tagName.toLowerCase()} "${describe(el)}" ${b.width.toFixed(1)}x${b.height.toFixed(1)}`);
  }
  // Hidden checkbox and radio inputs: the hit area is the label that wraps the control
  for (const input of document.querySelectorAll('input[type=checkbox], input[type=radio]')) {
    const label = input.closest('label');
    count++;
    const b = (label ?? input).getBoundingClientRect();
    if (b.height < 43.9 || b.width < 43.9) small.push(`${input.type} "${input.id || input.value}" label ${b.width.toFixed(1)}x${b.height.toFixed(1)}`);
  }
  // Sliders: what a finger can hit is the track plus its widened ::before band, and the thumb plus its band.
  for (const slider of document.querySelectorAll('[role=slider]')) {
    count++;
    const thumb = slider.getBoundingClientRect();
    const track = slider.parentElement.getBoundingClientRect();
    const band = (el, pseudo) => { const cs = getComputedStyle(el, pseudo); return [parseFloat(cs.top), parseFloat(cs.bottom), parseFloat(cs.left), parseFloat(cs.right)]; };
    const [tt, tb] = band(slider.parentElement, '::before');
    const [pt, pb, pl, pr] = band(slider, '::before');
    const trackHit = track.height - tt - tb; // top and bottom are negative offsets, so subtracting adds
    const thumbHit = [thumb.width - pl - pr, thumb.height - pt - pb];
    if (trackHit < 43.9) small.push(`slider track hit band ${trackHit.toFixed(1)}px high`);
    if (thumbHit[0] < 43.9 || thumbHit[1] < 43.9) small.push(`slider thumb hit zone ${thumbHit.map((n) => n.toFixed(1)).join('x')}`);
  }
  return { count, small };
});
out.targets = {};
for (const [w, h] of [[390, 844], [320, 568]]) {
  await phone(w, h);
  for (const hash of ROUTES) {
    await open(hash);
    const r = await targets();
    out.targets[`${w} ${hash}`] = r.small.length === 0 ? `ok (${r.count} controls)` : r.small;
    if (r.small.length) fail(`touch targets under 44px at ${w} on ${hash}: ${r.small.join('; ')}`);
  }
}
// Add device, step by step
await phone(390, 844);
await open('#/add');
out.targets['390 add: start'] = await targets().then((r) => (r.small.length ? r.small : `ok (${r.count})`));
await press('Start scan');
out.targets['390 add: scanning'] = await targets().then((r) => (r.small.length ? r.small : `ok (${r.count})`));
await sleep(2700);
out.targets['390 add: results'] = await targets().then((r) => (r.small.length ? r.small : `ok (${r.count})`));
await press('Kettle plug');
out.targets['390 add: link'] = await targets().then((r) => (r.small.length ? r.small : `ok (${r.count})`));
await sleep(3300);
out.targets['390 add: details'] = await targets().then((r) => (r.small.length ? r.small : `ok (${r.count})`));
await open('#/add'); await press('Enter a code instead');
out.targets['390 add: code'] = await targets().then((r) => (r.small.length ? r.small : `ok (${r.count})`));
for (const [k, v] of Object.entries(out.targets)) if (k.includes('add:') && typeof v !== 'string') fail(`touch targets ${k}: ${v.join('; ')}`);
// The skip link, when it is shown
await open('#/devices');
await page.keyboard.press('Tab');
out.skipLink = await page.evaluate(() => { const b = document.activeElement.getBoundingClientRect(); return [b.width, b.height].map((n) => Math.round(n * 10) / 10); });
if (out.skipLink[1] < 43.9) fail('skip link under 44px');

// ---------------------------------------------------------------------------------------------
// 3. The switch bug: is the knob concentric with the track? (measured from the CSS and from the pixels)
// ---------------------------------------------------------------------------------------------
async function knobs(w) {
  await phone(w, 844);
  await open('#/settings');
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
  const results = [];
  for (let pass = 0; pass < 2; pass++) { // pass 1 flips each switch, so both states are measured
    const info = await page.evaluate(() => {
      scrollTo(0, 0);
      return [...document.querySelectorAll('input[type=checkbox]')].map((input) => {
        const track = input.nextElementSibling;
        let holder = track;
        while (holder && getComputedStyle(holder).position === 'static') holder = holder.parentElement;
        const knob = getComputedStyle(track, '::after');
        const t = track.getBoundingClientRect();
        const c = (holder ?? document.body).getBoundingClientRect();
        return { id: input.id, checked: input.checked, holder: holder === track ? 'track' : holder?.tagName.toLowerCase(), x: t.x, y: t.y + scrollY, w: t.width, h: t.height, knobCentre: c.top + scrollY + parseFloat(knob.top) + parseFloat(knob.height) / 2, trackCentre: t.top + scrollY + t.height / 2 };
      });
    });
    for (const s of info) {
      const clip = { x: Math.max(0, s.x - 6), y: Math.max(0, s.y - 10), width: s.w + 12, height: s.h + 20 };
      const png = PNG.sync.read(await page.screenshot({ clip, type: 'png' }));
      let minY = 1e9; let maxY = -1;
      for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) { const i = (y * png.width + x) * 4; if (png.data[i] > 235 && png.data[i + 1] > 235 && png.data[i + 2] > 235) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); } }
      const px = maxY < 0 ? null : clip.y + (minY + maxY + 1) / 2 / 2;
      const offset = px === null ? null : +(px - s.trackCentre).toFixed(1);
      const ok = px !== null && Math.abs(offset) <= 1 && Math.abs(s.knobCentre - s.trackCentre) <= 1 && s.holder === 'track';
      results.push({ id: s.id, checked: s.checked, positionedAncestor: s.holder, offsetFromPixels: offset, offsetFromCss: +(s.knobCentre - s.trackCentre).toFixed(1), verdict: ok ? 'concentric' : 'NOT concentric' });
      if (!ok) fail(`knob not concentric at ${w}: ${s.id}`);
    }
    if (pass === 0) { await page.evaluate(() => document.querySelectorAll('input[type=checkbox]').forEach((i) => i.closest('label').click())); await sleep(100); }
  }
  return results;
}
out.knob = { 320: await knobs(320), 390: await knobs(390), 800: await knobs(800) };

// ---------------------------------------------------------------------------------------------
// 4. Reduced motion, both ways
// ---------------------------------------------------------------------------------------------
await phone(390, 844);
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await open('#/devices');
out.reducedMotion = await page.evaluate(() => ({
  chipTransition: getComputedStyle(document.querySelector('.chip')).transitionDuration,
  navTabTransition: getComputedStyle(document.querySelector('.nav-tab')).transitionDuration,
  haloTransition: getComputedStyle(document.querySelector('.glyph-halo')).transitionDuration,
}));
await open('#/add');
await press('Start scan');
out.reducedMotion.scan = await page.evaluate(() => ({ pulseAnimation: getComputedStyle(document.querySelector('.pulse span:nth-child(2)')).animationName, statusLine: document.querySelector('.scan-status')?.textContent, progressValueShown: document.querySelector('progress') !== null, stillRingOpacity: getComputedStyle(document.querySelector('.pulse span:first-child')).opacity }));
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await open('#/devices');
out.motionAllowed = await page.evaluate(() => ({ chipTransition: getComputedStyle(document.querySelector('.chip')).transitionDuration, haloTransition: getComputedStyle(document.querySelector('.glyph-halo')).transitionDuration }));
await open('#/add');
await press('Start scan');
out.motionAllowed.scan = await page.evaluate(() => ({ pulseAnimation: getComputedStyle(document.querySelector('.pulse span:nth-child(2)')).animationName, statusLine: document.querySelector('.scan-status')?.textContent }));
if (out.reducedMotion.chipTransition !== '0s' || out.reducedMotion.scan.pulseAnimation !== 'none') fail('motion under reduced motion');
if (out.motionAllowed.scan.pulseAnimation === 'none') fail('no pulse when motion is allowed');

// ---------------------------------------------------------------------------------------------
// 5. Hover under touch emulation, button shadows, sentence case
// ---------------------------------------------------------------------------------------------
await open('#/devices');
out.look = await page.evaluate(() => {
  const btn = document.querySelector('main > button:last-of-type');
  const cs = getComputedStyle(btn);
  const upper = [...document.querySelectorAll('body *')].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && getComputedStyle(el).textTransform === 'uppercase').map((el) => el.textContent.trim().slice(0, 20));
  return { hoverHover: matchMedia('(hover: hover)').matches, addButtonShadow: cs.boxShadow, uppercaseTextOnHome: upper };
});
if (out.look.uppercaseTextOnHome.length) fail('uppercase text on Home: ' + out.look.uppercaseTextOnHome.join(','));

console.log(JSON.stringify(out, null, 1));
await browser.close();
if (failures.length) { console.error('\nFAILED:\n' + failures.join('\n')); process.exit(1); }
console.log('\nbrowser-check: all hard checks passed');
```

```bash
node browser-check.mjs http://localhost:5199/
```

Expected, from the run while writing the plan (every line is a hard check; the program ends `browser-check: all hard checks passed`). Shortened here to make it readable: the script prints the same facts as JSON, one entry per screen and width.

```text
widths: 30 of 30 screen-and-width pairs "ok" (320, 390 and 800px; #/devices, #/device/desk-lamp, #/device/tv-plug, #/device/hall-thermostat, #/device/living-sensor, #/device/hall-light, #/rooms, #/settings, #/add, #/add-room)
longName: {"#/devices":"ok","devicePage":"ok"}
targets  390 #/devices: ok (25 controls)
targets  390 #/device/desk-lamp: ok (8 controls)
targets  390 #/device/tv-plug: ok (4 controls)
targets  390 #/device/hall-thermostat: ok (9 controls)
targets  390 #/device/living-sensor: ok (3 controls)
targets  390 #/device/hall-light: ok (3 controls)
targets  390 #/rooms: ok (12 controls)
targets  390 #/settings: ok (7 controls)
targets  390 #/add: ok (3 controls)
targets  390 #/add-room: ok (4 controls)
targets  320 #/devices: ok (25 controls)
targets  320 #/device/desk-lamp: ok (8 controls)
targets  320 #/device/tv-plug: ok (4 controls)
targets  320 #/device/hall-thermostat: ok (9 controls)
targets  320 #/device/living-sensor: ok (3 controls)
targets  320 #/device/hall-light: ok (3 controls)
targets  320 #/rooms: ok (12 controls)
targets  320 #/settings: ok (7 controls)
targets  320 #/add: ok (3 controls)
targets  320 #/add-room: ok (4 controls)
targets  390 add: start: ok (3)
targets  390 add: scanning: ok (2)
targets  390 add: results: ok (7)
targets  390 add: link: ok (2)
targets  390 add: details: ok (5)
targets  390 add: code: ok (4)
skipLink: [187.2,44]
knob 320px  setting-alert-offline  checked=true  positioned ancestor=track  offset from pixels 0  from css 0  concentric
knob 320px  setting-remote-access  checked=false positioned ancestor=track  offset from pixels 0  from css 0  concentric
knob 320px  setting-alert-offline  checked=false positioned ancestor=track  offset from pixels 0  from css 0  concentric
knob 320px  setting-remote-access  checked=true  positioned ancestor=track  offset from pixels 0  from css 0  concentric
knob 390px  setting-alert-offline  checked=true  positioned ancestor=track  offset from pixels 0  from css 0  concentric
knob 390px  setting-remote-access  checked=false positioned ancestor=track  offset from pixels 0  from css 0  concentric
knob 390px  setting-alert-offline  checked=false positioned ancestor=track  offset from pixels 0  from css 0  concentric
knob 390px  setting-remote-access  checked=true  positioned ancestor=track  offset from pixels 0  from css 0  concentric
knob 800px  setting-alert-offline  checked=true  positioned ancestor=track  offset from pixels 0  from css 0  concentric
knob 800px  setting-remote-access  checked=false positioned ancestor=track  offset from pixels 0  from css 0  concentric
knob 800px  setting-alert-offline  checked=false positioned ancestor=track  offset from pixels 0  from css 0  concentric
knob 800px  setting-remote-access  checked=true  positioned ancestor=track  offset from pixels 0  from css 0  concentric
reducedMotion: {"chipTransition":"0s","navTabTransition":"0s","haloTransition":"0s","scan":{"pulseAnimation":"none","statusLine":"Scanning…","progressValueShown":true,"stillRingOpacity":"0.6"}}
motionAllowed: {"chipTransition":"0.15s, 0.15s","haloTransition":"0.2s","scan":{"pulseAnimation":"pulse","statusLine":"Scanning…"}}
look: {"hoverHover":false,"addButtonShadowIsNone":true,"uppercaseTextOnHome":[]}
```

Two checks have been shown to fail: with the chips' `min-height` changed to `2rem` it reports `button "All 9" 65.7x32.0` and three more at 390 and 320, and run against the shipped build the knob check reports -6.0 (Task 1).

- [ ] **Step 4: Keyboard**

`keyboard-check.mjs` presses Tab through every screen and through each step of Add device (scanning, results, link, name and room, code; real timers, a few seconds) and reads, at each stop, whether a focus indicator is visible (an outline, or a ring drawn as a shadow; for a hidden checkbox or radio the element drawn after it), with the library's 300ms transitions switched off so a ring is read at full size. It then operates things with the keyboard alone: Space on a glyph power button, Enter on a row link and on a form, the arrows and End on a slider, Space on a Settings switch, an arrow on the radios.

```js
// Tabs through every screen with a real keyboard and reports, for each stop, whether a focus indicator is visible.
// Usage: node keyboard-check.mjs <url, no hash>. Kept OUTSIDE the repo. Exit 1 if a stop has no indicator.
import puppeteer from 'puppeteer-core';

const url = process.argv[2] ?? 'http://localhost:5199/';
const exe = process.env.CHROMIUM ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 800, height: 900 });
const failures = [];
const report = {};

const describeFocus = () =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const visibleRing = (node) => {
      const cs = getComputedStyle(node);
      const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
      // A ring is a shadow with no blur and a spread of 1px or more and some alpha (computed colours may be rgb() or oklab()).
      const ring = [...cs.boxShadow.matchAll(/((?:rgba?|oklab|oklch|color)\([^)]*\))\s+0px\s+0px\s+0px\s+([\d.]+)px/g)].some(
        ([, colour, spread]) => Number(spread) >= 1 && !/\/\s*0\)|rgba\(0, 0, 0, 0\)/.test(colour),
      );
      return outline ? `outline ${cs.outlineWidth} ${cs.outlineColor}` : ring ? 'box-shadow ring' : null;
    };
    // The real checkbox and radio inputs are visually hidden (their own outline is not seen): the element right after the input draws the ring.
    const hidden = el.type === 'checkbox' || el.type === 'radio';
    const indicator = hidden ? visibleRing(el.nextElementSibling) : visibleRing(el);
    // The slider thumb is the role=slider element itself.
    const name = el.getAttribute('aria-label') || el.textContent.trim().slice(0, 24) || el.name || el.id || el.getAttribute('role') || el.tagName;
    return { tag: el.tagName.toLowerCase() + (el.getAttribute('role') ? `[${el.getAttribute('role')}]` : ''), name: String(name).slice(0, 26), indicator };
  });

const ROUTES = ['#/devices', '#/device/desk-lamp', '#/device/hall-thermostat', '#/device/hall-light', '#/device/living-sensor', '#/rooms', '#/settings', '#/add', '#/add-room'];
for (const hash of ROUTES) {
  await page.goto('about:blank');
  await page.goto(url + hash, { waitUntil: 'networkidle0' });
  // The library's Buttons draw their focus ring through a 300ms transition; read it once it has finished, not while it is at 0.
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
  await sleep(200);
  const stops = [];
  const seen = new Set();
  for (let i = 0; i < 45; i++) {
    await page.keyboard.press('Tab');
    const info = await describeFocus();
    if (!info) break;
    const key = `${info.tag}|${info.name}`;
    if (seen.has(key + i % 1000) && stops.length > 3 && stops[0].name === info.name && stops[0].tag === info.tag) break;
    seen.add(key + i % 1000);
    stops.push(info);
    if (!info.indicator) failures.push(`${hash}: no visible focus on ${info.tag} "${info.name}"`);
  }
  report[hash] = stops.map((s) => `${s.tag} "${s.name}" => ${s.indicator ?? 'NONE'}`);
}

// The steps of Add device, with the keyboard alone: Enter on Start scan, then Tab through each step's controls (real timers).
async function tabThrough(label) {
  const stops = [];
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    const info = await describeFocus();
    if (!info) break;
    stops.push(info);
    if (!info.indicator) failures.push(`${label}: no visible focus on ${info.tag} "${info.name}"`);
    if (stops.length > 2 && info.name === stops[0].name && info.tag === stops[0].tag) break;
  }
  report[label] = stops.map((s) => `${s.tag} "${s.name}" => ${s.indicator ?? 'NONE'}`);
}
await page.goto('about:blank');
await page.goto(url + '#/add', { waitUntil: 'networkidle0' });
await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
await page.focus('main button');
await page.keyboard.press('Enter'); // Start scan
await sleep(300);
await tabThrough('add: scanning');
await sleep(2700);
await tabThrough('add: results');
await page.focus('.nearby-row');
await page.keyboard.press('Enter'); // pick the first nearby device
await sleep(300);
await tabThrough('add: link');
await sleep(3400);
await tabThrough('add: details');
await page.goto('about:blank');
await page.goto(url + '#/add', { waitUntil: 'networkidle0' });
await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
await page.focus('.text-button');
await page.keyboard.press('Enter'); // Enter a code instead
await sleep(300);
await tabThrough('add: code');

// Operate things with the keyboard alone: Enter on a link, Space on a switch, arrows on a slider, Enter in a form.
const ops = {};
await page.goto('about:blank');
await page.goto(url + '#/devices', { waitUntil: 'networkidle0' });
await page.focus('[role=switch][aria-label="Desk lamp power"]');
await page.keyboard.press('Space');
ops.spaceOnPower = await page.$eval('[role=switch][aria-label="Desk lamp power"]', (el) => el.getAttribute('aria-checked'));
await page.keyboard.press('Enter');
ops.enterOnPower = await page.$eval('[role=switch][aria-label="Desk lamp power"]', (el) => el.getAttribute('aria-checked'));
await page.focus('a.device-link');
await page.keyboard.press('Enter');
await sleep(200);
ops.enterOnRowLink = await page.evaluate(() => ({ hash: location.hash, focusedIsTitle: document.activeElement.tagName === 'H1' }));
await page.focus('[role=slider]');
await page.keyboard.press('ArrowRight');
await page.keyboard.press('ArrowRight');
ops.sliderArrows = await page.$eval('[role=slider]', (el) => el.getAttribute('aria-valuenow'));
await page.keyboard.press('End');
ops.sliderEnd = await page.$eval('[role=slider]', (el) => el.getAttribute('aria-valuenow'));
await page.goto('about:blank');
await page.goto(url + '#/settings', { waitUntil: 'networkidle0' });
await page.focus('#setting-remote-access');
await page.keyboard.press('Space');
ops.spaceOnSettingsSwitch = await page.$eval('#setting-remote-access', (el) => el.checked);
await page.focus('input[type=radio]');
await page.keyboard.press('ArrowRight');
ops.radioArrow = await page.$$eval('input[type=radio]', (els) => els.map((e) => e.checked));
await page.goto('about:blank');
await page.goto(url + '#/add-room', { waitUntil: 'networkidle0' });
await page.type('input[name=name]', 'Study');
await page.keyboard.press('Enter');
await sleep(300);
ops.enterInAddRoom = await page.evaluate(() => ({ hash: location.hash, notice: document.querySelector('.notice-text').textContent }));
report.operations = ops;

console.log(JSON.stringify(report, null, 1));
await browser.close();
if (failures.length) { console.error('\nFAILED:\n' + failures.join('\n')); process.exit(1); }
console.log('\nkeyboard-check: every stop has a visible focus indicator');
```

```bash
node keyboard-check.mjs http://localhost:5199/
```

Expected: `keyboard-check: every stop has a visible focus indicator`, with (shortened):

```text
#/devices: 26 Tab stops, 0 without a visible indicator
#/device/desk-lamp: 9 Tab stops, 0 without a visible indicator
#/device/hall-thermostat: 10 Tab stops, 0 without a visible indicator
#/device/hall-light: 4 Tab stops, 0 without a visible indicator
#/device/living-sensor: 4 Tab stops, 0 without a visible indicator
#/rooms: 13 Tab stops, 0 without a visible indicator
#/settings: 7 Tab stops, 0 without a visible indicator
#/add: 4 Tab stops, 0 without a visible indicator
#/add-room: 5 Tab stops, 0 without a visible indicator
add: scanning: 1 Tab stops, 0 without a visible indicator
add: results: 6 Tab stops, 0 without a visible indicator
add: link: 1 Tab stops, 0 without a visible indicator
add: details: 4 Tab stops, 0 without a visible indicator
add: code: 3 Tab stops, 0 without a visible indicator
operations: {"spaceOnPower":"false","enterOnPower":"true","enterOnRowLink":{"hash":"#/device/floor-lamp","focusedIsTitle":true},"sliderArrows":"45","sliderEnd":"100","spaceOnSettingsSwitch":true,"radioArrow":[false,true],"enterInAddRoom":{"hash":"#/rooms","notice":"Added the room Study."}}
```

(The Settings radios and switches show a ring because the checks look at the element drawn after the hidden input; a bare `input` outline would have been invisible.)

- [ ] **Step 5: The glow, at several levels**

`glow-sheet.mjs` puts a light at 5, 25, 50, 75 and 100%, a light that is off, a plug, a thermostat, a sensor and a lost light side by side in one picture, and measures the halo's brightness from the pixels. It fails if the glow does not grow with the level. **Open `shots/glow.png` and look at it.**

```js
// Takes the glyph of a light at several levels (and one of each other state) and puts them side by side in one image,
// and prints how bright the glow is at each (mean blue-channel brightness of the halo's ring), to show it grows with the level.
// Usage: node glow-sheet.mjs <url, no hash> [out.png, default ./shots/glow.png]. Kept OUTSIDE the repo.
import puppeteer from 'puppeteer-core';
import { PNG } from 'pngjs';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const url = process.argv[2] ?? 'http://localhost:5199/';
const out = process.argv[3] ?? './shots/glow.png';
const exe = process.env.CHROMIUM ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
mkdirSync(path.dirname(out), { recursive: true });
const shots = [];
const numbers = [];

async function grab(label, hash, prepare) {
  await page.goto('about:blank');
  await page.goto(url + hash, { waitUntil: 'networkidle0' });
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
  if (prepare) await prepare();
  await sleep(150);
  const box = await page.$eval('.hero-glyph', (el) => { const r = el.getBoundingClientRect(); return { x: Math.max(0, r.x - 60), y: Math.max(0, r.y - 50), width: Math.min(390, r.width + 120), height: r.height + 100 }; });
  const png = await page.screenshot({ clip: box, type: 'png' });
  shots.push({ label, data: png.toString('base64') });
  // mean blue-channel value in a ring around the glyph's centre (radius 55..80 px), where only the halo is
  const image = PNG.sync.read(png);
  const cx = image.width / 2; const cy = image.height / 2;
  let sum = 0; let n = 0;
  for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
    const d = Math.hypot(x - cx, y - cy);
    if (d >= 55 && d <= 80) { sum += image.data[(y * image.width + x) * 4 + 2]; n++; }
  }
  numbers.push({ label, ringBlueMean: n ? +(sum / n).toFixed(1) : null });
}

const setLevel = (steps) => async () => {
  await page.focus('[role=slider]');
  await page.keyboard.press('Home');
  for (let i = 0; i < steps; i++) await page.keyboard.press('ArrowRight');
};
await grab('light 5%', '#/device/desk-lamp', setLevel(0));
await grab('light 25%', '#/device/desk-lamp', setLevel(4));
await grab('light 50%', '#/device/desk-lamp', setLevel(9));
await grab('light 75%', '#/device/desk-lamp', setLevel(14));
await grab('light 100%', '#/device/desk-lamp', setLevel(19));
await grab('light off', '#/device/bedside-lamp');
await grab('plug on', '#/device/tv-plug');
await grab('thermostat 20', '#/device/hall-thermostat');
await grab('sensor', '#/device/living-sensor');
await grab('lost', '#/device/hall-light');

await page.setViewport({ width: 1400, height: 600, deviceScaleFactor: 1 });
await page.setContent(`<body style="margin:0;background:#1a1a2e;color:#e0e0e0;font:14px sans-serif;display:flex;flex-wrap:wrap;gap:4px;padding:4px">${shots.map((s) => `<figure style="margin:0;width:268px"><img src="data:image/png;base64,${s.data}" style="width:268px;display:block"><figcaption style="text-align:center">${s.label}</figcaption></figure>`).join('')}</body>`);
await page.screenshot({ path: out, fullPage: true });
console.log(JSON.stringify(numbers, null, 1));
await browser.close();

// The glow must grow with the level: each light level at least as bright as the one before it, 50% to 100% strictly brighter,
// and a light at 5% brighter than the same kind of light switched off.
const ring = Object.fromEntries(numbers.map((n) => [n.label, n.ringBlueMean]));
const levels = ['light 5%', 'light 25%', 'light 50%', 'light 75%', 'light 100%'].map((label) => ring[label]);
const problems = [];
for (let i = 1; i < levels.length; i++) if (levels[i] < levels[i - 1]) problems.push(`level ${i} is dimmer than level ${i - 1}`);
if (!(levels[2] < levels[3] && levels[3] < levels[4])) problems.push('50% < 75% < 100% does not hold');
if (!(levels[0] > ring['light off'])) problems.push('a light at 5% is not brighter than a light that is off');
if (problems.length) {
  console.error('GLOW PROBLEM: ' + problems.join('; '));
  process.exit(1);
}
console.log('glow grows with the level');
```

```bash
node glow-sheet.mjs http://localhost:5199/ shots/glow.png
```

Expected (the ring's mean blue value rises with the level, and a light at 5% is brighter than one that is off): `glow grows with the level`.

```text
[
 {
  "label": "light 5%",
  "ringBlueMean": 61.2
 },
 {
  "label": "light 25%",
  "ringBlueMean": 61.8
 },
 {
  "label": "light 50%",
  "ringBlueMean": 75
 },
 {
  "label": "light 75%",
  "ringBlueMean": 103.6
 },
 {
  "label": "light 100%",
  "ringBlueMean": 131.8
 },
 {
  "label": "light off",
  "ringBlueMean": 55.8
 },
 {
  "label": "plug on",
  "ringBlueMean": 89.7
 },
 {
  "label": "thermostat 20",
  "ringBlueMean": 107.4
 },
 {
  "label": "sensor",
  "ringBlueMean": 49.4
 },
 {
  "label": "lost",
  "ringBlueMean": 53.1
 }
]
glow grows with the level
```

- [ ] **Step 6: Every screen and every step of Add device, by eye**

```bash
MSYS_NO_PATHCONV=1 node shots.mjs shots 390 '#/devices,#/device/desk-lamp,#/device/hall-thermostat,#/device/hall-light,#/device/living-sensor,#/rooms,#/settings,#/add,#/add-room'
MSYS_NO_PATHCONV=1 node shots.mjs shots 320 '#/devices,#/device/desk-lamp,#/device/hall-thermostat,#/rooms'
MSYS_NO_PATHCONV=1 node shots.mjs shots 800 '#/devices,#/device/desk-lamp'
node flow-shots.mjs shots 390
```

with these two helpers (`sheet.mjs` puts several pictures side by side so you can read them in one look: `node sheet.mjs shots/a.png shots/devices-390.png shots/rooms-390.png ...`):

```js
// Takes screenshots of screens. Usage: node shots.mjs <outdir> <width> <hash,hash,...> [url]
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const [outdir, widthArg = '390', hashes = '#/devices', url = 'http://localhost:5199/'] = process.argv.slice(2);
const exe = process.env.CHROMIUM ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
mkdirSync(outdir, { recursive: true });
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const w = Number(widthArg);
await page.setViewport({ width: w, height: w >= 800 ? 900 : 844, deviceScaleFactor: 1, isMobile: w < 800, hasTouch: w < 800 });
for (const hash of hashes.split(',')) {
  await page.goto('about:blank');
  await page.goto(url + hash, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 300));
  const name = hash.replace(/[#/]+/g, '_').replace(/^_/, '') || 'root';
  await page.screenshot({ path: `${outdir}/${name}-${w}.png`, fullPage: true });
  console.log('saved', name);
}
await browser.close();
```

```js
// Screenshots of every step of Add device and of Reconnect, with real timers. Usage: node flow-shots.mjs <outdir> [width]
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
const [outdir = './shots', widthArg = '390', url = 'http://localhost:5199/'] = process.argv.slice(2);
const exe = process.env.CHROMIUM ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(outdir, { recursive: true });
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const w = Number(widthArg);
await page.setViewport({ width: w, height: 760, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const shot = (name) => page.screenshot({ path: `${outdir}/flow-${name}-${w}.png` });
const press = async (text) => { const h = await page.evaluateHandle((t) => [...document.querySelectorAll('button, a')].find((b) => b.textContent.trim().startsWith(t) || b.getAttribute('aria-label') === t), text); await h.asElement().click(); await sleep(120); };

await page.goto(url + '#/add', { waitUntil: 'networkidle0' });
await shot('1-start');
await press('Start scan'); await sleep(900); await shot('2-scanning');
await sleep(1800); await shot('3-results');
await press('Shelf lamp'); await sleep(1500); await shot('4-link');
await sleep(1900); await shot('5-details');
await page.goto('about:blank'); await page.goto(url + '#/add', { waitUntil: 'networkidle0' });
await press('Enter a code instead'); await press('Link device'); await shot('6-code-error');
await page.goto('about:blank'); await page.goto(url + '#/device/hall-light', { waitUntil: 'networkidle0' });
await press('Reconnect'); await sleep(1700); await shot('7-reconnect-failed');
await page.goto('about:blank'); await page.goto(url + '#/add-room', { waitUntil: 'networkidle0' });
await page.type('input[name=name]', 'hall'); await press('Add room'); await shot('8-add-room-error');
await browser.close();
console.log('done');
```

```js
// Usage: node sheet.mjs <out.png> <png> <png> ... : puts the images side by side in one picture.
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
const [out, ...files] = process.argv.slice(2);
const exe = process.env.CHROMIUM ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 400 * files.length, height: 800 });
await page.setContent(`<body style="margin:0;background:#000;display:flex;gap:6px">${files.map((f) => `<img src="data:image/png;base64,${readFileSync(f).toString('base64')}" style="height:790px;width:auto">`).join('')}</body>`);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
```

Check by eye and write down anything that is off:

- **Home at 390 and 320:** "Home", the sentence ("4 on, 3 need attention"), chips that scroll sideways (the last one is cut off on purpose), three room headings with "Turn off" (greyed for the Bedroom, which has nothing on), rows with a glyph tile, a name and one value. The three lit lamps and the plug glow; the bedside lamp and the fan are dark; the Bedroom sensor has a small amber battery and the Fan plug an amber signal mark; the Hall light is dashed with "Lost". **No green "Online" anywhere.** No pink glow under "Add device".
- **A device's page:** the glyph at 10.5rem with its halo, the name, the room, the numeral ("70%" with a small %, "Off" dim, "85 W" for the plug, "20°" between a minus and a plus for the thermostat), a solid blue slider fill (no pink end), a full-width Turn off, three presets, the Link panel, a red Remove device. The lost light: a dashed dark glyph, "Lost. Controls are unavailable.", Reconnect and Remove, nothing else. No bottom nav on a pushed page.
- **The glyph's lines are white** on the glow and the glow stays inside the tile on Home (clipped) and fades out well before the screen's edge on a page at 320px.
- **Add device:** the start (the scripted line is visible), the scan (a ring and a bar and "Scanning…"), the results (four rows with signal bars), the link (a checklist with ticks and a bar), the name and room step, the pairing code form with its error, **the failed link of the Hall light** (the third row red with a cross, "The link failed: No response from the hub", Try again and Cancel), and Add room with its duplicate error.
- **Rooms:** a card per room with a big figure and a small W, "3 of 3 on", Turn off and a quiet "Remove room".
- **800:** one centred column 480px wide with a border at each side, the same bottom nav at its foot.

- [ ] **Step 7: Reduced motion, as the library behaves**

```bash
node motion-scan.mjs http://localhost:5199/
```

```js
// Under prefers-reduced-motion: reduce, which elements still animate or transition? Usage: node motion-scan.mjs [url]
import puppeteer from 'puppeteer-core';
const url = process.argv[2] ?? 'http://localhost:5199/';
const exe = process.env.CHROMIUM ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
const seen = {};
for (const hash of ['#/devices', '#/device/desk-lamp', '#/device/hall-thermostat', '#/device/hall-light', '#/rooms', '#/settings', '#/add', '#/add-room']) {
  await page.goto('about:blank');
  await page.goto(url + hash, { waitUntil: 'networkidle0' });
  const found = await page.evaluate(() => {
    const rows = [];
    for (const el of document.querySelectorAll('body *')) {
      for (const pseudo of [null, '::after', '::before']) {
        const cs = getComputedStyle(el, pseudo);
        const t = cs.transitionDuration.split(',').some((d) => parseFloat(d) > 0);
        const a = cs.animationName !== 'none' && parseFloat(cs.animationDuration) > 0;
        if (t || a) rows.push(`${el.tagName.toLowerCase()}${pseudo ?? ''}.${String(el.className?.baseVal ?? el.className).split(' ').filter((c) => /^(group|bg-|peer|transition|duration|chip|nav|glyph|rounded-full|sr-only|device|preset)/.test(c)).slice(0, 2).join('.')} ${t ? 'transition ' + cs.transitionDuration + ' (' + cs.transitionProperty.slice(0, 24) + ')' : ''}${a ? 'animation ' + cs.animationName : ''}`);
      }
    }
    return rows;
  });
  for (const row of found) (seen[row] ??= new Set()).add(hash);
}
for (const [row, hashes] of Object.entries(seen)) console.log(row, '<-', [...hashes].join(' '));
await browser.close();
```

It lists every element, pseudo-element included, that still has a transition or an animation longer than 0 with `prefers-reduced-motion: reduce` on every screen. Expected: **no output** (without the block at the end of `App.css`, the run while writing this plan listed the library's `Button` at 0.3s, the `Toggle` track at 0.3s and its knob at 0.15s, the `Slider` fill and thumb at 0.1 and 0.15s, the `RadioGroup` circle at 0.2s, `Input` at 0.3s and `Badge` at 0.15s).

- [ ] **Step 8: What you cannot check this way, and say so**

Write these in the findings as **not checked** unless you actually did them: a real phone and real touch (the emulation sends touch events, but a finger is not a simulated pointer); real safe-area insets on a notched device (the redesign has no sheet, but the app bar, the bottom nav and the forms' button row pad themselves with them and a desktop window always reads 0); the on-screen keyboard resizing the page (the button row is sticky inside the form and cannot be confirmed above a real keyboard); iOS Safari and its collapsing toolbars (so `dvh` and the sticky nav against a moving toolbar), and any other WebKit or Firefox (the glow's `overflow-x: clip` and an SVG radial gradient in a clipped tile are the layouts most at risk); a screen reader (VoiceOver, TalkBack, NVDA); `:has()` is not used, on purpose.

- [ ] **Step 9: Fix what failed**

Fix each failure in the file it belongs to (its own commit each, message `fix(mobile-app): <what>`), re-running the affected script. If your run contradicts a sentence in the README's "measured in … Not checked …", change the README, not the findings.

### Task 15: Library findings, the findings in the spec, and PR C

Spec §7.1 and the repo's rule apply: **file nothing upstream without reproducing it and checking the existing issues, and here not at all without the owner's say-so.** The knob is the one new library finding of the redesign; the other measurements either match an issue that is already filed or are this template's own.

**Files:**
- Modify: `docs/superpowers/specs/2026-10-17-mobile-app-design.md` (append "Findings from the redesign"), `packages/mobile-app/README.md` (only if a statement in it was found untrue)

- [ ] **Step 1: Reproduce the knob problem without this template, in a bare page**

`bare-toggle.html` has only the library's stylesheet, the markup its `Toggle` renders (copied from `dist/components/Toggle.js`) and one consumer rule, `label { min-height: 44px }`. `bare-toggle.mjs` measures where the knob is drawn.

```html
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<!-- Only cyberui-2045 2.8.0's own stylesheet; the only CSS of the consumer is the one rule in the style element below. -->
<link rel="stylesheet" href="file:///C:/mk/app/node_modules/cyberui-2045/dist/cyberui-2045.css">
<style>
  /* what a consumer writes to get a 44px hit area around the 32px switch */
  .tall label { min-height: 44px; }
</style>
</head>
<body style="background:#1a1a2e;padding:20px">
<!-- The markup <Toggle size="lg" variant="accent" label="..." /> renders in 2.8.0 (dist/components/Toggle.js), written out. -->
<div id="plain" class="flex items-center justify-between space-x-3">
  <label for="a" class="text-default font-medium cursor-pointer">Plain</label>
  <label class="relative inline-flex items-center cursor-pointer">
    <input id="a" type="checkbox" class="sr-only peer" checked>
    <div class="w-16 h-8 after:h-7 after:w-7 bg-gray-600 peer-checked:bg-accent peer-focus:ring-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:transition-all motion-reduce:after:transition-none transition-colors duration-300"></div>
  </label>
</div>
<div id="tall" class="tall">
  <div class="flex items-center justify-between space-x-3">
    <label for="b" class="text-default font-medium cursor-pointer">With a 44px label</label>
    <label class="relative inline-flex items-center cursor-pointer">
      <input id="b" type="checkbox" class="sr-only peer" checked>
      <div class="w-16 h-8 after:h-7 after:w-7 bg-gray-600 peer-checked:bg-accent peer-focus:ring-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:transition-all motion-reduce:after:transition-none transition-colors duration-300"></div>
    </label>
  </div>
</div>
</body>
</html>
```

```js
// Reproduces the Toggle knob problem with NOTHING of this template on the page: the library's stylesheet, the markup its
// Toggle renders, and one consumer rule (label { min-height: 44px }). Usage: node bare-toggle.mjs <path to bare-toggle.html>
import puppeteer from 'puppeteer-core';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const exe = process.env.CHROMIUM ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const file = pathToFileURL(path.resolve(process.argv[2] ?? 'bare-toggle.html')).href;
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 600, height: 300 });
await page.goto(file);
const result = await page.evaluate(() =>
  ['a', 'b'].map((id) => {
    const input = document.getElementById(id);
    const label = input.closest('label');
    const track = input.nextElementSibling;
    const knob = getComputedStyle(track, '::after');
    const l = label.getBoundingClientRect();
    const t = track.getBoundingClientRect();
    // the knob is absolute; its containing block is the nearest positioned ancestor (the label, `relative`)
    const containing = getComputedStyle(track).position === 'static' ? l : t;
    return {
      case: id === 'a' ? 'library as shipped' : 'consumer sets label { min-height: 44px }',
      labelHeight: l.height, trackHeight: t.height,
      labelPosition: getComputedStyle(label).position, trackPosition: getComputedStyle(track).position,
      knobTop: knob.top,
      knobCentreMinusTrackCentre: +((containing.top + parseFloat(knob.top) + parseFloat(knob.height) / 2) - (t.top + t.height / 2)).toFixed(1),
    };
  }),
);
console.log(JSON.stringify(result, null, 1));
await browser.close();
```

```bash
node bare-toggle.mjs bare-toggle.html
```

(The page links the stylesheet by an absolute `file:///` path: edit the `href` to `node_modules/cyberui-2045/dist/cyberui-2045.css` in your checkout.) Expected, from the run while writing this plan:

```text
[
 {
  "case": "library as shipped",
  "labelHeight": 32,
  "trackHeight": 32,
  "labelPosition": "relative",
  "trackPosition": "static",
  "knobTop": "2px",
  "knobCentreMinusTrackCentre": 0
 },
 {
  "case": "consumer sets label { min-height: 44px }",
  "labelHeight": 44,
  "trackHeight": 32,
  "labelPosition": "relative",
  "trackPosition": "static",
  "knobTop": "2px",
  "knobCentreMinusTrackCentre": -6
 }
]
```

So **the library as shipped is right (0), and any consumer that gives the `<label>` more height, or padding, displaces the knob** (-6.0px at `min-height: 44px`). It is not caused by this template's other CSS, and nothing in `src` could have prevented it except looking.

- [ ] **Step 2: What to file, to be filed only on the owner's say-so**

**to file:** one defect on patrickkuei/CyberUI, after checking `gh issue list --repo patrickkuei/CyberUI --state all` once more for anything new about the Toggle:

- Title: `Toggle: the knob is positioned against the <label>, so a taller or padded label displaces it out of the track`.
- Body: version 2.8.0; the bare-page repro and its two numbers above (0 as shipped, -6.0 with `label { min-height: 44px }`); the cause (`label.relative`, track static, `after:absolute after:top-[2px]` on the track); the one-line fix to suggest (make the track `relative` instead of the label, which leaves the shipped layout identical: the track is the label's only visible child) and the alternative (document that the label must not be sized); the workaround in this template (`.touch-switch input + div { position: relative }`) and the browser check that found it; the note that this affects anyone who follows #133's own advice (a 44px hit area on the label). Ends with the line `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- And a **comment on #133** (the touch-size request) pointing at it: "a touch-size option must keep the knob on the track".

Nothing else is a new library finding: the Button's uppercase, resting glow and 300ms ring, and the library's animations under reduced motion, are design choices of the library that this template overrides (one line each in the README's Known limits), and the `Slider`'s magenta-ended fill is the `accent` variant doing what its name says. If the owner wants any of them filed, they are feature requests, not defects.

When the knob issue is filed, put its number in the README's last Known limit (replace "Not yet filed upstream.") and in the comment above `.touch-switch input + div` in `App.css`, run `grep -rn "CyberUI#" src README.md` and check each number again (Review Focus 15), and commit as `docs(mobile-app): point the knob workaround at the CyberUI issue filed for it`.

- [ ] **Step 3: Record what you found in the spec**

Append a **"Findings from the redesign"** section to the end of `docs/superpowers/specs/2026-10-17-mobile-app-design.md`, in the format of the earlier findings sections: the tool and browser (headless Microsoft Edge, its version, `puppeteer-core`, the emulation used); what needed a fix; what was checked and held, **with the numbers** (the knob before and after, the sideways scroll at three widths, the smallest control found, the contrast figures, the glow's brightness series, the Tab stops counted, the transitions under reduced motion before and after the block); the library findings and the "to file" item above with its status; the clean-room install (Node, npm, packages, test count); the mutation run (how many, how many survived the first time and what was done); and what you could **not** check (Task 14 Step 8, stated plainly).

- [ ] **Step 4: Run everything once more, then push and open PR C**

From the repo root: `pnpm --filter mobile-app-template run build`, `pnpm --filter mobile-app-template test` (28 files, 316 tests), `pnpm --filter cyberui-templates-site test` (30 files, 183 tests) and its `build`, `pnpm install --frozen-lockfile` (succeeds: nothing in `package.json` changed), `npm run test:scripts`, `npm run check:license`, `npm run check:templates-readme`, `npm run check:code-tab`, `npm run check:process-excerpts`, `npm run check:template-builds` (all pass; the last prints `template builds OK (4 templates checked)`). Then:

```bash
git add docs/superpowers/specs/2026-10-17-mobile-app-design.md
git commit -m "docs: record the findings from the redesign of the mobile app" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git push -u origin feat/mobile-app-redesign
gh pr create --base main --title "feat(mobile-app): redesign the template: rooms, a glowing glyph per device, a page per device and a scripted connect flow" --body "<summary: what changed and why (the owner's reasons); the principles; why the Code tab's JSON is in this PR and the site's copy and examples are in PR D; the switch fix and how it was measured (-6.0px before, 0.0px after, at 320, 390 and 800px); what was removed (the sheet, scenes, the status badge, Drawer); the README's reworded known limits; what was and was not checked (Task 14's list: not a real phone, not WebKit or Firefox, not a screen reader, not the on-screen keyboard); the clean-room install (Node, npm); the mutation run; the 'to file' item for CyberUI and that nothing was filed; the site's stale copy and examples are PR D; Refs #48>"
```

The PR body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)` and says, in plain words, that the template was measured in desktop Chromium with device emulation and **not** on a real phone, in WebKit, in Firefox, with a screen reader or against a real on-screen keyboard. Do not merge.

---

## PR D: the site

Start after PR C is merged: `git checkout main && git pull && git checkout -b feat/site-mobile-app-redesign`. Everything the site shows is derived from `TEMPLATES` and needs no edit (Home's "4 templates ready", the Templates page, the section component, the preview dialog and its phone frame, the start prompt and fork command, the router, `llms.ts`, the `<noscript>` list in `staticHtml.ts`); the sync script, `deploy.yml`, the `fork-install` matrix entry and the README row's existence were all added by the first version's PR B, and the Code tab's JSON by PR C. What is left is **copy** (a tagline, the use-if lines, "Probably not for you"), **the screenshot**, and **the two examples**, which are stale and must be replaced. Read `packages/site/src/data/templates.ts`, `src/content/templateContent.ts` and `src/content/templateContent.test.ts` first.

**Why the examples are stale, concretely.** The two examples on the page today were written for the first version: the hobbyist asks for "the one-tap scenes" to "really switch the right group of plugs" and for "the Add device form" to save; the designer asks to "change that sheet" (the bottom sheet) for thermostats and describes "the sheet sliding up". None of those exist any more. Task 18 adds a test that fails on exactly that vocabulary (`bottom sheet`, `pairing form`, `Scenes tab`, `one-tap scenes`, `Add device form`), and it **fails with the examples that are on the page now** (the run while writing this plan: `describes the redesigned mobile app everywhere, not the first one` fails, everything else passes). The redesigned app does have "Scenes", but as the presets on a light's own page, so the word alone is not on the list.

Checks that must pass before the PR is opened (Task 19 runs them): `npm run test:scripts`, `npm run check:process-excerpts`, `npm run check:templates-readme`, `npm run check:code-tab`, `npm run check:license`, `npm run check:template-builds`, and the full `pnpm -r --workspace-concurrency=1 run test` (serial: run in parallel, the Vitest processes compete for CPU and a few monitoring tests time out on a loaded machine).

### Task 16: The examples: two new role-play interviews, kept verbatim

The Examples on the Templates page are **never invented** (spec 2026-10-05 §2 and §4; the mobile-app spec §11 and its Redesign section). They are two subagents playing a person, asked what they would type to their AI, in order, where they would get stuck, and how they would know it worked. They are language-model role-plays, not users, and the page says so. **If you cannot run subagents, stop and ask the owner; do not write the examples yourself.** The owner's rules for this section are part of this task, not suggestions:

1. **Verbatim only.** The person's own words, never reworded, tidied or invented. Long fields are cut with an ellipsis (`…`), as the other entries do.
2. **"Where they'd get stuck" lists only obstacles that the library and the template did not cause**: connecting their real system (a device protocol, an account, a hub's address), who gets access, hosting, an app store, real notifications, secrets. **Drop** any passage that is a comment on the template or the demo itself ("it is all fake", "the README says", "for real life I'd say not yet", "the scan is scripted", "the sheet is made up"): those read as feedback, not as how someone uses it.
3. **No remarks about the template or the demo anywhere in the example.**
4. **The labels say "they"**: the fold's title names the person ("A home-lab hobbyist", "A designer"), the section's own text speaks about people, never "you".
5. **If an interview gives nothing that qualifies** for one of the three fields, **do not write something: stop and report to the owner.** (The owner also has an "Open to input" area on the How we design tab if visitors want more of this kind of material.)

**Files:** none in the repo yet (the interviews are saved **outside** it; Task 18 puts the chosen pieces into `templateContent.ts`).

- [ ] **Step 1: Run two interviews, one subagent each**

Use this brief for both, changing only the persona. It is written for the **redesigned** app; it says what the app does and what is mock, and says nothing about what the template lacks or what will go wrong. Save each reply **whole and unedited** to its own file outside the repo (`interview-1.txt`, `interview-2.txt`).

> You are \<persona\>. You have just downloaded the Mobile App template from the CyberUI templates site: a phone-first web app for a fictional home device controller called Kestrel, built with React and a cyberpunk-styled component library. Home shows your rooms and, in each, the devices as rows with a glowing icon you tap to switch them on or off, plus one sentence about how the home is doing; a row opens a page for that device (a light has a brightness slider, a Turn off button and three one-tap scenes; a thermostat has a target temperature with plus and minus; every device shows its signal and has Disconnect or Reconnect and Remove device); Rooms lists the rooms with a power figure and lets you add one; adding a device is a scan, pick, link and name flow; Settings has the temperature unit and two switches. It is a demo: the hub, the devices, the readings and the scan are made up, and nothing is controlled, discovered, paired, sent or saved. You will tell your AI coding assistant what to change. Reply with: (1) what you would type to your AI, in order, 4 to 6 messages; (2) where you would get stuck; (3) how you would know it worked.

Personas (spec §11): (a) a hobbyist who wants a phone controller for their own home lab or a handful of smart plugs; (b) a designer who is prototyping a device app to show a client. Add one or two sentences of detail to each persona if you like, but do not tell them what to say, what will go wrong or what the template lacks.

- [ ] **Step 2: Choose what goes on the page, by the rules above**

Examples should read like monitoring's: what the person asks for, the real wall they hit (connecting their own system), and how they would know it worked. Messages go in order in `requests` (4 to 6). Put the chosen pieces in a JSON array in the `ExampleCase` shape (`{ "title", "requests": [...], "stuck", "worked" }`), in the same order as the interview files.

- [ ] **Step 3: Verify they are verbatim, and read the warnings**

The script splits every piece at its ellipses and requires each part to be found word for word (whitespace aside) in that person's interview. It also **prints a warning** when `stuck` mentions the template or the demo itself, which the owner's rule leaves out. A warning is a prompt to look, not a verdict: judge each one and cut the passage if it is a remark about the template. It fails when a title does not name a person or the number of requests is outside 4 to 6.

```js
// Usage: node check-verbatim.mjs examples.json interview-1.txt interview-2.txt
// examples.json is an array of { title, requests[], stuck, worked } (the ExampleCase shape), in the same order
// as the interview files. It fails if any piece of an example, split at its ellipses, is not found word for word
// (whitespace differences ignored) in that person's saved interview. It also PRINTS a warning, for a human to
// judge, when "stuck" mentions the template or the demo itself (the owner's rule: "Where they'd get stuck" lists only
// obstacles the library and the template did not cause) or when a label would not read "they". The warning is a
// prompt to look, not a verdict. Keep the script and the files outside the repo.
import { readFileSync } from 'node:fs';

const [examplesFile, ...interviewFiles] = process.argv.slice(2);
const examples = JSON.parse(readFileSync(examplesFile, 'utf8'));
const squash = (text) => text.replace(/\s+/g, ' ').trim();
const problems = [];
const warnings = [];

if (examples.length !== interviewFiles.length) problems.push(`${examples.length} examples but ${interviewFiles.length} interview files`);

examples.forEach((example, index) => {
  const source = squash(readFileSync(interviewFiles[index] ?? '', 'utf8'));
  const pieces = [...example.requests, example.stuck, example.worked];
  for (const piece of pieces) {
    for (const part of piece.split(/…|\.\.\./).map(squash).filter(Boolean)) {
      if (!source.includes(part)) problems.push(`${example.title}: not in the saved interview: "${part.slice(0, 80)}"`);
    }
  }
  if (!/^An? /.test(example.title)) problems.push(`${example.title}: the title should name the person ("A designer", "An ...")`);
  if (example.requests.length < 4 || example.requests.length > 6) problems.push(`${example.title}: ${example.requests.length} requests, the brief asked for 4 to 6`);
  // The rule for "stuck": obstacles the library and the template did not cause. These phrases usually mean a remark about the template or the demo.
  const aboutTheTemplate = /\b(the template|this template|the demo|the README|it is (all )?(fake|made up|pretend)|it'?s (all )?(fake|made up|pretend)|Kestrel (is|has|does)|the scripted|the app (does not|doesn't) (have|do|show)|there is no (real )?(hub|device))\b/i;
  if (aboutTheTemplate.test(example.stuck)) warnings.push(`${example.title}: "stuck" mentions the template or the demo, which the owner's rule leaves out: ${example.stuck.match(aboutTheTemplate)[0]}`);
});

for (const warning of warnings) console.warn('WARNING (judge it, do not just delete it): ' + warning);
if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`verbatim check OK (${examples.length} example${examples.length === 1 ? '' : 's'})${warnings.length ? `, ${warnings.length} warning(s) to judge` : ''}`);
```

```bash
node check-verbatim.mjs examples.json interview-1.txt interview-2.txt
```

Expected: `verbatim check OK (2 examples)` and no warning you cannot defend. (Tried while writing this plan on sample files only: a partial sentence written without its ellipsis fails with the offending words, a "stuck" that says "The demo is all fake" prints the warning, and a title that does not start with "A" or "An" fails. **The two real interviews have not been run**; the example copy in this plan is a placeholder.) Nothing to commit in this task.

### Task 17: The screenshot

**Files:**
- Replace: `packages/site/public/screenshots/mobile-app.png`

The site's screenshot frame draws every image at the width of the section, so a portrait phone capture would be stretched to about 2000px tall. The first version therefore captured the running app in a 390 x 740 frame, centred near the top of a 1440 x 900 canvas, with the bottom left clear for the site's gradient and its "Run the live demo" button. The redesign keeps that shape and **changes what is in the frame: a device's page** (`#/device/desk-lamp`), not Home. It is the one screen that shows the redesign's one bold idea at full size (a glyph that glows with its level), and it still reads as a phone app. (Home's first fold was tried too; its glyphs are 48px tiles and the glow is hard to see at the size the site draws the picture.)

- [ ] **Step 1: Take it**

Run `pnpm --filter mobile-app-template dev --port 5199 --strictPort` and, outside the repo, this script with the same `puppeteer-core` setup as Task 1 (`MSYS_NO_PATHCONV=1 node screenshot.mjs http://localhost:5199/ <repo>/packages/site/public/screenshots/mobile-app.png`; the optional third argument is the hash, default `#/device/desk-lamp`):

```js
// Takes the Templates-page screenshot of the mobile-app template: the running app in a
// 390 x 740 frame, centred near the top of a 1440 x 900 canvas, with room underneath for the
// site's gradient and "Run the live demo" button. Kept OUTSIDE the repo.
// Usage: node screenshot.mjs <url of the running app, e.g. http://localhost:5199/> <output .png> [hash, default #/device/desk-lamp]
import puppeteer from 'puppeteer-core';

const [url, output, hash = "#/device/desk-lamp"] = process.argv.slice(2);
const exe = process.env.CHROMIUM ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
// #1a1a2e is --color-base and #3c3c5e is --color-border-default (this file is not part of the package, so a hex literal is fine here).
await page.setContent(`<!doctype html><body style="margin:0;height:100vh;background:#1a1a2e;display:flex;justify-content:center;align-items:flex-start;padding-top:40px;box-sizing:border-box">
  <iframe src="${url}${hash}" width="390" height="740" style="border:1px solid #3c3c5e;border-radius:6px;background:#1a1a2e"></iframe></body>`);
await sleep(2500);
await page.screenshot({ path: output, type: 'png' });
await browser.close();
console.log('saved', output);
```

If you have no tool that can capture it, leave the file for the owner and say so in the PR (Task 18's screenshot test fails until it exists, so do not merge).

- [ ] **Step 2: Check it**

`ls -l packages/site/public/screenshots/mobile-app.png` (expected 1440x900, about 40 to 50 KB; the others are 76 to 134 KB; keep it under about 200 KB) and **open it**: the app bar with "Back" and the Demo badge, the glowing bulb, "Desk lamp", "Living room", "70%", a solid blue slider, "Turn off", the three presets and the top of the Link panel; centred, with empty space below it; no cyan, no yellow, no pink glow. The shipped first-version image shows a Devices list with a status badge on every row: it must not.

### Task 18: Site copy, the examples and their tests

**Files (all under `packages/site/` unless noted):**
- Modify: `src/data/templates.ts`, `src/data/templates.test.ts`, `src/content/templateContent.ts`, `src/content/templateContent.test.ts`, `README.md` (repo root)
- Not touched: `src/content/staticHtml.ts` (its description already says "and a mobile app"), `src/content/codeTabs.json` (PR C), the sync script, `deploy.yml`, `checks.yml`

- [ ] **Step 1: Write the failing tests**

In `src/data/templates.test.ts`, inside `describe('templates', …)`, before the phone-frame test:

```ts
  // The first version of the Mobile App had bottom navigation with a Scenes tab, a bottom sheet
  // and a pairing form; the redesign has none of them, so a tagline that still says so is stale.
  it('describes the redesigned mobile app, not the first one', () => {
    const tagline = getTemplate('mobile-app')!.tagline;
    expect(tagline).toMatch(/rooms/);
    expect(tagline).not.toMatch(/one-tap scenes|pairing form|bottom sheet|bottom navigation/i);
  });
```

In `src/content/templateContent.test.ts`, replace the body of the mobile app's test (it asserted the two old titles) and add two tests after it; and change the `notFor` line:

```ts
  it('gives the mobile app fit copy that says plainly nothing is controlled or sent, and two examples', () => {
    const content = TEMPLATE_CONTENT['mobile-app']!;
    expect(content.useIf).toHaveLength(3);
    expect(content.headsUp).toMatch(/nothing is controlled or sent/);
    expect(content.headsUp).toMatch(/screens, not the hub/);
    expect(content.examples).toHaveLength(2);
    for (const example of content.examples) {
      expect(example.requests.length, example.title).toBeGreaterThanOrEqual(4);
      expect(example.requests.length, example.title).toBeLessThanOrEqual(6);
      expect(example.title, 'the title names the person').toMatch(/^An? /);
    }
  });

  // The first version of the Mobile App had a bottom sheet, a pairing form and a Scenes tab. The
  // two examples written for it said so, and the redesign has none of them: copy that still mentions
  // them is stale. (The redesigned app does have "Scenes", but as the presets on a light's own page,
  // so that word is not on this list.)
  it('describes the redesigned mobile app everywhere, not the first one', () => {
    const content = TEMPLATE_CONTENT['mobile-app']!;
    const words = [...content.useIf, content.headsUp, content.notFor ?? '', ...content.examples.flatMap((e) => [e.title, ...e.requests, e.stuck, e.worked])].join('\n');
    expect(words).not.toMatch(/bottom sheet|pairing form|Scenes tab|one-tap scenes|Add device form/i);
  });

  it("keeps the mobile app's examples to the owner's rules: no remark about the template or the demo in where they would get stuck, and labels that say they", () => {
    for (const example of TEMPLATE_CONTENT['mobile-app']!.examples) {
      expect(example.stuck, example.title).not.toMatch(/\b(the template|the demo|this template|the README|it is (all )?fake|it'?s (all )?fake|pretend)\b/i);
    }
  });
```

```ts
    expect(TEMPLATE_CONTENT['mobile-app']!.notFor).toMatch(/find or talk to real devices, or install it on a phone/);
```

(The existing `notFor` test already forbids a `notFor` that names another kind of app, `/landing page|dashboard|mobile app/i`; the mobile app's own passes it because it describes this template's limits only. The second new test is a backstop for the owner's rule, not the rule: Task 16's script and your own reading are the rule.)

- [ ] **Step 2: Run them to verify they fail**

Run (from `packages/site`): `npx vitest run src/data src/content`
Expected: FAIL: the tagline test, the new notFor line, and `describes the redesigned mobile app everywhere` (it finds "bottom sheet" and "Add device form" in the examples on the page now: the proof they are stale).

- [ ] **Step 3: Write the copy**

In `src/data/templates.ts`, the `mobile-app` entry's `tagline` (a plain single-line quoted string with no quote inside: `scripts/check-templates-readme.mjs` reads this file as text). Before:

```ts
    tagline: 'A home device controller built for a phone: bottom navigation, on/off switches and sliders in a list, one-tap scenes and a pairing form.',
```

After:

```ts
    tagline: 'A home device controller built for a phone: rooms, a glowing glyph for every device, a full page to control each one and a scan-and-link flow to add more.',
```

In `src/content/templateContent.ts`, the `'mobile-app'` entry. The first and second use-if lines and the heads-up stay (they are still true); change the third use-if and `notFor` (which now names the scan), and **replace the whole `examples` array** with the two chosen in Task 16, verbatim, in the interview order. Before:

```ts
      'something with a list, switches, a form and a few settings',
```

```ts
    notFor: "if you need to talk to real devices or install it on a phone. The devices are made up, and it's a web page with no saved data.",
```

After:

```ts
      'something with rooms, things you switch and dim, a connect flow and a few settings',
```

```ts
    notFor: "if you need to find or talk to real devices, or install it on a phone. The devices and the scan are made up, and it's a web page with no saved data.",
```

```ts
    examples: [
      /* the two chosen examples from Task 16, verbatim, in the interview order: { title, requests, stuck, worked } */
    ],
```

The comment above `TEMPLATE_CONTENT` (examples are role-plays, never reworded; `notFor` states this template's own limits and never names another kind of app) already covers the entry; add no comment of your own unless something differs from the other entries. Do not name another template in any of the copy (the owner's rule).

In the root `README.md`, the Mobile App row in the `## Templates` table, the same new tagline as in `templates.ts`. Before:

```markdown
| [Mobile App](packages/mobile-app) | A home device controller built for a phone: bottom navigation, on/off switches and sliders in a list, one-tap scenes and a pairing form. |
```

After:

```markdown
| [Mobile App](packages/mobile-app) | A home device controller built for a phone: rooms, a glowing glyph for every device, a full page to control each one and a scan-and-link flow to add more. |
```

- [ ] **Step 4: Run the checks**

Run (`packages/site`): `npx vitest run` (expected all PASS: **186 tests in 30 files**, the 183 of the first version plus these three) and `pnpm run build` (expected clean). From the repo root: `npm run check:templates-readme` and `npm run check:code-tab` (both pass).

Also search for any other place that still describes the first version (the plan's own list: `grep -rniE "one-tap scenes|pairing form|bottom sheet|Scenes tab" README.md packages --include=*.ts --include=*.tsx --include=*.json --include=*.md --include=*.mjs --include=*.yml -l | grep -v node_modules`, expected: nothing outside `docs/`).

- [ ] **Step 5: Commit**

```bash
git add packages/site README.md
git commit -m "feat(site): the Mobile App's new tagline and copy, a new screenshot, and two new examples for the redesigned app" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 19: Look at the published page, verify everything, open PR D

**Files:** none (fixes go in the file they belong to, each its own commit); the spec gets a findings section.

- [ ] **Step 1: Run the whole suite and the production builds**

Run: `pnpm -r run build` and `pnpm -r --workspace-concurrency=1 run test` (monitoring, agent-panel, landing, mobile-app and the site; expected all PASS; the site has 186 tests in 30 files and the mobile app 316 in 28), then from the repo root `npm run test:scripts` (33 pass) and the five checks (`check:process-excerpts`, `check:templates-readme`, `check:code-tab`, `check:license`, `check:template-builds`).

- [ ] **Step 2: Start the site with all four real builds**

Run: `pnpm --filter cyberui-templates-site run sync-templates` (builds and copies all four) then `pnpm --filter cyberui-templates-site run dev --port 5201 --strictPort`; open `#/templates`.

- [ ] **Step 3: Check each item and fix what fails**

Desktop (about 1440px), by eye and, where it says so, with the scripts:

- [ ] Four sections in order (monitoring, agent-panel, landing, mobile-app), one h1 "Templates"; each hero shows its own accent only on its badge, "Run the live demo" and Copy start prompt; no blue in the folds, the Heads-up or the dialog chrome.
- [ ] The Mobile App screenshot shows the **device page** (a glowing bulb, "70%", the presets) in the phone frame near the top, with the dark gradient and the visible "Run the live demo" button below it. The tagline reads "A home device controller built for a phone: rooms, …".
- [ ] "Use this if you're building…" has the three lines (the third mentions rooms); the Heads-up reads "This is a demo: the home and its devices are made up, and nothing is controlled or sent…"; "Probably not for you" reads "…if you need to find or talk to real devices, or install it on a phone. The devices and the scan are made up, and it's a web page with no saved data."
- [ ] The two example folds are the new ones, with their titles from Task 16, and **mention no scenes tab, bottom sheet or Add device form**.
- [ ] The dialog opens at `#/templates/mobile-app` with the preview 390px wide and centred; the **Code tab shows seven principles with excerpts** (Single source of truth, Typed and exhaustive, Light is state, A seam for the real thing, No inline styles, Tested, Phone rules in one place) and the folder tree (ten lines: the root and nine folders, `src/connection` among them); tabs switch without reloading the preview.
- [ ] Esc, the close button and a backdrop click close the dialog; Back closes it and stays on Templates; reloading with the dialog open reopens it.
- [ ] Copy start prompt puts a prompt naming `packages/mobile-app` on the clipboard; the terminal fold shows `npx --yes tiged patrickkuei/cyberui-templates/packages/mobile-app my-app`.
- [ ] Home says "4 templates ready." and does not list templates by name.

**Inside the preview (Review Focus 22; the plan's scratch run did these with `site-check.mjs`):** the frame is 390 wide; a row opens the device's page **inside the iframe** (the iframe's hash is `#/device/desk-lamp`, the site's hash is unchanged) with no bottom nav; Back in the app returns to Home with the dialog still open; adding a device through the scripted scan and link (about six seconds, real timers) returns to Home inside the iframe with the notice and the new row; with the iframe's history changed the dialog's close button still closes it; Esc pressed inside the app closes the dialog, on Home and on a device's page; a switch left off before the Code tab is still off after Live preview (not reloaded); the Code tab has seven principles and ten tree lines.

```js
// Checks the live preview dialog of the site with the REDESIGNED mobile-app template, in a real Chromium. Kept OUTSIDE the repo.
// Usage: node site-check.mjs <site url, e.g. http://localhost:5201/> [path to a Chromium or Edge executable]
import puppeteer from 'puppeteer-core';

const base = process.argv[2] ?? 'http://localhost:5201/';
const exe = process.argv[3] ?? process.env.CHROMIUM ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const out = {};

const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const frameOf = async () => (await (await page.waitForSelector('dialog[open] iframe')).contentFrame());
const state = () => page.evaluate(() => ({ hash: location.hash, dialogOpen: !!document.querySelector('dialog[open]'), historyLength: history.length }));
const clickIn = async (frame, text) => { const handle = await frame.evaluateHandle((t) => [...document.querySelectorAll('button, a')].find((b) => b.textContent.trim().startsWith(t) || b.getAttribute('aria-label') === t), text); await handle.asElement().click(); };
const openFresh = async () => { await page.goto('about:blank'); await page.goto(base + '#/templates/mobile-app', { waitUntil: 'networkidle0' }); const frame = await frameOf(); await sleep(900); return frame; };

// A: the frame is 390px wide and centred; a row opens the device page INSIDE the iframe, not on the site; Back (in the app) returns to Home with the dialog still open
let frame = await openFresh();
out.frame = await page.evaluate(() => { const r = document.querySelector('dialog[open] iframe').getBoundingClientRect(); const body = document.querySelector('dialog[open] .template-preview-body').getBoundingClientRect(); return { width: r.width, leftGap: Math.round(r.left - body.left), rightGap: Math.round(body.right - r.right) }; });
await clickIn(frame, 'Desk lamp');
await sleep(400);
out.afterOpeningADevice = { siteHash: (await state()).hash, frameHash: await frame.evaluate(() => location.hash), h1: await frame.evaluate(() => document.querySelector('h1').textContent), navHidden: await frame.evaluate(() => !document.querySelector('nav')) };
await clickIn(frame, 'Back');
await sleep(500);
out.afterBack = { ...(await state()), frameHash: await frame.evaluate(() => location.hash), h1: await frame.evaluate(() => document.querySelector('h1').textContent) };

// B: add a device through the scripted scan and link, inside the dialog (real timers, about 6 seconds)
await clickIn(frame, 'Add device');
await sleep(400);
out.addOpened = { siteHash: (await state()).hash, frameHash: await frame.evaluate(() => location.hash) };
await clickIn(frame, 'Start scan');
await sleep(2800);
await clickIn(frame, 'Shelf lamp');
await sleep(3300);
await clickIn(frame, 'Add device');
await sleep(600);
out.afterAdding = { ...(await state()), frameHash: await frame.evaluate(() => location.hash), h1: await frame.evaluate(() => document.querySelector('h1').textContent), notice: await frame.evaluate(() => document.querySelector('.notice-text').textContent), shelfLampRow: await frame.evaluate(() => !![...document.querySelectorAll('a.device-link')].find((a) => a.textContent.startsWith('Shelf lamp'))) };

// C: with the iframe's history changed, the dialog's close button must still close it (usePreviewNav replaces)
await page.click('dialog[open] .preview-dialog-header button');
await sleep(700);
out.afterCloseButton = await state();

// D: Escape pressed inside the running app closes the dialog (the site forwards it), also on a device's page
frame = await openFresh();
await frame.focus('a.device-link');
await page.keyboard.press('Escape');
await sleep(700);
out.escapeOnHome = await state();
frame = await openFresh();
await clickIn(frame, 'Desk lamp');
await sleep(400);
await frame.focus('button');
await page.keyboard.press('Escape');
await sleep(700);
out.escapeOnDevicePage = await state();

// E: tab switching does not reload the preview (a state change inside it survives)
frame = await openFresh();
await frame.click('button[role=switch]');
await sleep(200);
const before = await frame.evaluate(() => document.querySelector('button[role=switch]').getAttribute('aria-checked'));
await page.evaluate(() => [...document.querySelectorAll('dialog[open] [role=tab]')].find((t) => t.textContent === 'Code').click());
await sleep(300);
await page.evaluate(() => [...document.querySelectorAll('dialog[open] [role=tab]')].find((t) => t.textContent === 'Live preview').click());
await sleep(300);
out.noReloadOnTabSwitch = { afterClick: before, afterTabsSwitched: await frame.evaluate(() => document.querySelector('button[role=switch]').getAttribute('aria-checked')), note: 'the first power button starts on, so "false" on both means the preview was not reloaded' };

// F: the Code tab lists seven principles and nine folders (ten tree lines with the root)
await page.evaluate(() => [...document.querySelectorAll('dialog[open] [role=tab]')].find((t) => t.textContent === 'Code').click());
await sleep(300);
out.codeTab = await page.evaluate(() => ({ principles: document.querySelectorAll('dialog[open] .code-tab-principle').length, folderTreeLines: document.querySelector('dialog[open] .terminal-pre-tree').textContent.trim().split(String.fromCharCode(10)).length }));

console.log(JSON.stringify(out, null, 1));
await browser.close();
```

```bash
node site-check.mjs http://localhost:5201/
```

Expected, from the run while writing the plan:

```text
{
 "frame": {
  "width": 390,
  "leftGap": 436,
  "rightGap": 436
 },
 "afterOpeningADevice": {
  "siteHash": "#/templates/mobile-app",
  "frameHash": "#/device/desk-lamp",
  "h1": "Desk lamp",
  "navHidden": true
 },
 "afterBack": {
  "hash": "#/templates/mobile-app",
  "dialogOpen": true,
  "historyLength": 3,
  "frameHash": "",
  "h1": "Home"
 },
 "addOpened": {
  "siteHash": "#/templates/mobile-app",
  "frameHash": "#/add"
 },
 "afterAdding": {
  "hash": "#/templates/mobile-app",
  "dialogOpen": true,
  "historyLength": 3,
  "frameHash": "",
  "h1": "Home",
  "notice": "Added Shelf lamp to Living room.",
  "shelfLampRow": true
 },
 "afterCloseButton": {
  "hash": "#/templates",
  "dialogOpen": false,
  "historyLength": 3
 },
 "escapeOnHome": {
  "hash": "#/templates",
  "dialogOpen": false,
  "historyLength": 4
 },
 "escapeOnDevicePage": {
  "hash": "#/templates",
  "dialogOpen": false,
  "historyLength": 7
 },
 "noReloadOnTabSwitch": {
  "afterClick": "false",
  "afterTabsSwitched": "false",
  "note": "the first power button starts on, so \"false\" on both means the preview was not reloaded"
 },
 "codeTab": {
  "principles": 7,
  "folderTreeLines": 10
 }
}
```

If any of these fail, the likely cause is `leave` (Review Focus 10), the frame's breakpoint or the Escape forwarding; fix it in the file it belongs to.

**The Templates page at the two widths** (no sideways scroll, the screenshot loads at its natural 1440x900):

```js
// The Templates page with the redesigned Mobile App: no sideways scroll at 1440 and 390, the screenshot loads, and a picture of the section.
// Usage: node layout-check.mjs <site url> <out dir>. Kept OUTSIDE the repo.
import puppeteer from 'puppeteer-core';
const [base = 'http://localhost:5201/', outdir = './shots'] = process.argv.slice(2);
import { mkdirSync } from 'node:fs';
mkdirSync(outdir, { recursive: true });
const exe = process.env.CHROMIUM ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const out = {};
for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  await page.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile });
  await page.goto('about:blank');
  await page.goto(base + '#/templates', { waitUntil: 'networkidle0' });
  await sleep(500);
  out[w] = await page.evaluate(() => {
    const sections = [...document.querySelectorAll('section')].filter((s) => s.textContent.includes('Mobile App'));
    const img = [...document.querySelectorAll('img')].find((i) => i.src.includes('mobile-app'));
    return { scrollW: document.documentElement.scrollWidth, innerW: innerWidth, sections: sections.length, screenshotLoaded: !!img && img.complete && img.naturalWidth > 0, screenshotNatural: img ? [img.naturalWidth, img.naturalHeight] : null };
  });
  const section = await page.evaluateHandle(() => [...document.querySelectorAll('section')].find((s) => s.textContent.includes('Mobile App') && s.querySelector('img')));
  const el = section.asElement();
  if (el) { await el.scrollIntoView(); await sleep(300); await el.screenshot({ path: `${outdir}/templates-mobile-app-${w}.png` }); }
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
```

```bash
node layout-check.mjs http://localhost:5201/ shots
```

Expected: `scrollW` 1425 at 1440 (the scrollbar) and 390 at 390, one section, `screenshotLoaded: true`, natural size `[1440, 900]`. Open `shots/templates-mobile-app-1440.png` and look at it.

Phone (390px): no sideways scroll on `/templates`; the dialog is full-screen; the preview inside it is the Mobile App at the visitor's real width, not a 390px frame inside a 358px box (the frame rule is off at 640px and below).

Reduced motion: the dialog appears with no fade; inside the preview there are no transitions (the app switches them all off).

- [ ] **Step 4: Record what you found** in a short "Findings from checking the published page after the redesign" section at the end of `docs/superpowers/specs/2026-10-17-mobile-app-design.md`, stating plainly what was not checked (the real production deploy, which only happens after merge; `npx tiged …/packages/mobile-app` against the published repo, unless Task 13 Step 5 has now been run; Firefox, WebKit, a real phone and a screen reader; the Copy button's clipboard if the browser refuses it), and **that the two interviews were role-plays by subagents, kept whole outside the repo, and which passages were left out because of the owner's rule**.

- [ ] **Step 5: Commit, push, open PR D**

```bash
git add docs/superpowers/specs/2026-10-17-mobile-app-design.md
git commit -m "docs: record findings from checking the redesigned Mobile App on the site" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git push -u origin feat/site-mobile-app-redesign
gh pr create --base main --title "feat(site): bring the Mobile App's copy, screenshot and examples up to date with the redesign" --body "<summary: the new tagline and copy; the screenshot (the device page, why); the two new examples from two new interviews (role-plays by subagents, kept whole outside the repo, verbatim, which passages were left out under the owner's rule), replacing the two that described scenes, the sheet and the Add device form; the Code tab was updated in PR C and why; what was and was not checked; Refs #48>"
```

The PR body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. Do not merge.

- [ ] **Step 6: After the owner merges, look at the deployed site**

Watch the Deploy site run (`gh run watch`), then at `https://patrickkuei.github.io/cyberui-templates/`: `llms.txt` lists the Mobile App with the new tagline; `#/templates/mobile-app` opens the dialog with the live preview at 390px (**check that it is the redesigned build, not a cached first version**: Home shows room chips and no status badges); the screenshot loads and shows the device page; open a device's page and Add device inside it; and `npx --yes tiged patrickkuei/cyberui-templates/packages/mobile-app /tmp/check && cd /tmp/check && npm install && npm run build && npm test` passes. Record the result in a comment on PR D or in the spec. If anything is wrong, fix it in a follow-up PR; do not edit the merged ones.

---

## Self-review notes

**Spec coverage** (the spec's "Redesign, 2026-10-18" section): the principles (Tasks 3, 6, 7, 11, 14), Home (chips with counts, the sentence, room headings with "Turn off", rows with a glyph power button, a link and a level bar; marks only by exception; Add device) in Tasks 7, 8; the device page for each kind, with presets, the Link panel, Disconnect and Reconnect, Remove, and the lost layout in Task 9; Rooms and Add room (a derived power figure, Turn off, the chevron, removal only when empty) in Tasks 5 and 8; Connect (a scan that starts only on a tap, a progress bar and a pulse, a static "Scanning…" under reduced motion, nearby devices with signal bars, one tap to link, the handshake checklist, the code fallback, the scripted line, the adapter in `src/connection/`, one scripted failure, fake timers) in Tasks 4, 7, 9, 10, 14; Settings in Task 8; the accent and the glow through tokens in Tasks 6, 11 and the hex guard; the switch bug (reproduced in Task 1, fixed and guarded in Task 11, measured in Task 14, a bare-page repro and the "to file" item in Task 15); the Drawer's removal and the README's Known limits for #123, #124, #125 and #130 in Task 12; every cited issue number verified in Task 12; the spec amendment (done in the docs PR this plan ships with) and its findings sections (Tasks 15 and 19); the site: tagline, use-if, heads-up reviewed, `notFor` about its own limits with no sibling template named, the Code tab, the screenshot, the README row, the stale examples replaced by two new interviews, and the live-site check (Tasks 12, 16 to 19).

**Not covered, by design:** talking to real devices, accounts, notifications, a PWA manifest, persistence, i18n, a light theme, swipe gestures, a side rail at wide widths, charts, photographs or illustrations, a profile screen, moving a device between rooms, a library `BottomNav`/`SwipeableRow`/`BottomSheet` in this repo, the community template (#49), any change to cyberui-2045, and **any issue filed on CyberUI** (Task 15 only writes it down).

**Names used consistently across tasks:** `ROUTES`, `Route`, `TabRoute`, `PushedRoute`, `TAB_ROUTES`, `PARENT_TAB`, `isTab`, `parseHash`, `useHashRoute`, `leave`, `AppState`, `Action`, `reducer`, `createInitialState`, `Room`, `Device`, `DeviceKind`, `DeviceDraft`, `NearbyDevice`, `LinkState`, `SIGNAL_BARS`, `STARTING_ROOMS`, `STARTING_DEVICES`, `LEVEL`, `LIGHT_PRESETS`, `THERMOSTAT_PRESETS`, `NEARBY`, `LINK_FAILURES`, `DEFAULT_SETTINGS`, `PRODUCT_NAME`, `DEMO_BADGE`, `DEMO_NOTE`, `ROUTE_TITLES`, `KIND_LABELS`, `LINK_WORDS`, `HOME_COPY`, `DEVICE_COPY`, `ROOMS_COPY`, `ADD_ROOM`, `CONNECT_COPY`, `LINK_STEP_LABELS`, `SETTINGS_COPY`, `Connection`, `LINK_STEPS`, `LinkStep`, `LinkProgress`, `LinkError`, `isAbort`, `createScriptedConnection`, `scriptedConnection`, `LinkRun`, `Glyph`, `gradientId`, `SignalBars`, `DeviceRow`, `devicePath`, `TouchRow`, `glowLevel`, `haloOpacity`, `haloRadius`, `bodyOpacity`, `isReachable`, `isSwitchable`, `isOn`, `attentionOf`, `needsAttention`, `wattsOf`, `roomStats`, `roomOnText`, `homeSummary`, `roomName`, `roomNameProblem`, `formatDegrees`, `formatTemp`, `nudge`, `describeDevice`; the class names `touch-switch`, `touch-slider`, `touch-radios`, `slider-control`, `glyph`, `glyph--lit`, `glyph-halo`, `glyph-body`, `glyph-stop`, `glyph-button`, `device-row`, `device-link`, `chips`, `chip`, `hero`, `numeral`, `preset`, `link-panel`, `nearby-row`, `link-steps`, `pulse` (App.css, `phoneRules.test.ts` and the components agree on them). Regions and names the tests scope with: the room headings ("Living room: 3 of 3 on"), the switches "Desk lamp power", the buttons "Turn off Living room" and "Remove room Hall", the regions "Scenes", "Modes" and "Link", the navigation "Main".

**Deviations and readings** (also in the final report; none is silent, none reopens a decision):
1. **The Code tab's JSON is in PR C, not PR D**, because CI's `code-tab` job would fail a package-only PR C (four of six first-version excerpts no longer match, checked). The owner's split was "PR D = the site (… Code tab excerpts …)": this is a contradiction between that split and CI, resolved by moving one data file. Between the merges the live site shows the new app with the old copy.
2. **"Lost" and "Offline" are two link states** (dropped by itself, and disconnected on purpose); both are "needs attention" and both give the same dashed row; the page says "Lost. Controls are unavailable." or "Offline. Controls are unavailable."
3. **Every kind has a glow level**: a light by its level; a plug at one fixed brightness while on; a thermostat from its target across its range; a sensor a faint steady glow while reachable; anything whose link is down dark. A light's draw in watts scales with its level, so dimming it lowers the room's figure (the owner said only that the total is derived). A plug's numeral on its page is its draw in watts.
4. **The device page hides the bottom nav** (the owner's call): it is the second depth, with its own Back and a full-width Power button; same as the forms; gives back 56px at 320.
5. **The room filter is app state** (the reducer), so Rooms' chevron can set it and Home reads it, and the Home tab keeps the last filter (the "All" chip is one tap).
6. **The notice** (a device or room was added or removed, or a room could not be removed) persists until Dismiss or until the person moves to another tab; it no longer carries the demo sentence (the three signals are the badge, Settings and the Scan line). The first version's reviewer noted the notice persisting; this narrows it.
7. **A room that still has devices can only be emptied by removing them** (there is no way to move a device between rooms; not asked for), so its plain message says "Remove them first".
8. **Picking a level or a target also switches a light or a thermostat on**, and a light preset switches the light on; otherwise a slider would show a level on a dark glyph.
9. **Row values read "70%", not "70 %"** (the owner's examples have a space).
10. **The library fights three of the principles and the stylesheet overrides it** (uppercase and resting glow on `Button`, the `Slider`'s magenta-ended fill, transitions under reduced motion). Each override is one rule with a comment and a guard test. The glow override sets the library's own `--tw-shadow` variable (its focus ring is a separate variable and is left alone) and the `Slider`'s fill override is a structural selector (`.slider-control > div:last-child > div:first-child`) on the library's markup, which Task 14 and the README's checklist say to re-check on an upgrade.
11. **The reduced-motion block** (`transition-duration: 0s !important` under `.app`) is broader than "this template's own motion", on purpose: the owner's principle is that motion is off under `reduce`, and the library's own animations were measured to run (0.1s to 0.3s).
12. **`gradientId` sanitises `useId`** because its format changed between React 19 minors (`:r1:`, `«r1»`, `_r_1_`); the installed one gives `_r_1_`, so a test that only ran on it could not have told.
13. **Add device's last step asks for a Type only for a device added by code** (a scanned device already has a kind), and the room is a native `Select`.
14. **The screenshot is the device page**, not Home, because the glow is the redesign's one bold idea and Home's glyphs are 48px.
15. **`:has()` is not used**, and `overflow-x: clip` is used on the device page's hero to stop the glow's overflow from ever scrolling the page sideways: the one rule whose behaviour in WebKit was not checked.
16. **PR C is not green in the middle** (Tasks 3 to 9 delete and rewrite one layer at a time, so `tsc` and the whole-package tests fail until Task 10); each task still runs its own tests and commits.
17. **The first mutation list had two faulty mutants** (a pattern that hit a comment, and an equivalent one); both are corrected in `mutate.mjs`, and the survivors were weak tests that were strengthened.

**Verified by running a command or a browser (while writing this plan, in scratch directories outside the repo, on Windows, Node 20.20.2, npm 10.8.2, pnpm 10.34.2, Vitest 4.1.12, Microsoft Edge 155):**
- Every component, prop and behaviour in Task 2: `check-props.mjs` against the installed 2.8.0.
- The package: `tsc --noEmit` clean, `vite build` clean, **316 tests in 28 files** passing three runs in a row with no warnings, **87 mutations all caught**, a clean-room `npm install` (128 packages, no warnings) with a build and the tests, `check-standalone.mjs`, the README's issue numbers (`gh issue view` for #120, #121, #123 to #134) and links.
- In the real browser: the switch bug reproduced on the shipped build (-6.0px, from the CSS and from pixels) and gone after the fix (0.0px, at 320, 390 and 800px, both states); a bare-page reproduction with no template CSS (0 as shipped, -6.0 with a 44px label); no sideways scroll on 10 screens at three widths and on a 30-character name; every control 44px or more on every screen at 390 and 320px and on every step of Add device, slider zones included; a visible focus ring on every Tab stop of nine screens and keyboard operation of the glyph button, the row link, the slider, the Settings switch and the radios and the Add room form; reduced motion both ways (and nothing still animating under `reduce`); the glow growing with the level (a measured series); the contrast figures; and every screen and every step of Add device and Reconnect looked at in screenshots.
- PR D in a scratch copy of the repository: the site's tests (183 to 186), `tsc`, `vite build`, `check:code-tab`, `check:license`, `check:templates-readme`, `check:template-builds`, `check:process-excerpts` and `test:scripts`, `sync-templates` for all four real builds, the Templates page at 1440 and 390px (no sideways scroll, the screenshot at 1440x900), and `site-check.mjs` in the preview dialog.
- The first version's Code tab against the new package: four of six excerpts fail (`old-code-tab.mjs`), which is why PR C carries the JSON.

**Assumed, not verified:**
- Everything that needs a real device or another engine: touch on a real phone, WebKit (iOS Safari, `overflow-x: clip` and an SVG radial gradient inside a clipped tile, the collapsing toolbars and `dvh`) and Firefox, the on-screen keyboard resizing the page, real safe-area insets, a screen reader. The README says so.
- **The two persona interviews were not run**, and so the example copy in this plan is a placeholder (in the scratch copy, two neutral placeholders stood in so the rest of PR D could be tested); `check-verbatim.mjs` was tried only on sample files. The examples on the site today are stale (a test shows it).
- The real repository's CI, `pnpm install` in the real repo with its own `node_modules`, the real `deploy.yml` run and `npx tiged` against the published repo (Tasks 13 and 19 do these).
- That the invented names (Kestrel and the device names, "Shelf lamp", "Kettle plug", "Porch thermostat", "Garage sensor") are not someone's trademark; they were chosen to be unremarkable and generic, not searched.
- That the owner agrees with the readings in the list above, in particular 1, 3, 5 and 10.
- That `gh` can reach patrickkuei/CyberUI when Task 12's `gh issue view` loop runs (it could while writing this plan).
