# Mobile App Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `packages/mobile-app`, a self-contained blue-themed React + Vite template of a phone-first home device controller for a fictional hub called Kestrel (a device list with a switch on each row, a bottom sheet of controls, one-tap scenes, a pairing form, settings, bottom navigation), built with cyberui-2045 and extractable with `npx tiged`, then publish it on the site's `/templates` page through the same path the first three templates took, with one small new site capability: a phone-sized frame for the live preview.

**Architecture:** Four hash routes (`#/devices`, `#/scenes`, `#/settings`, `#/add`) from one `ROUTES` tuple, with the three tabs in a hand-built bottom nav and Add device pushed on top of Devices. All app state is one `useReducer` in `App.tsx`; `src/state/reducer.ts` is the only place it changes, through a discriminated `Action` union. Content is typed data in `src/data/` (`devices.ts`, `scenes.ts`, `settings.ts`, `product.ts`). Temperatures are stored in °C and converted for display by `utils/units.ts`. The device sheet is cyberui-2045's `Drawer side="bottom"`. The phone rules (44px touch targets, safe-area insets, `dvh`, no sticky hover, reduced motion) are written once in `src/App.css` and guarded by tests that read the CSS from disk. The accent is a two-token override of cyberui-2045 (`src/theme/blue.css`). The site publishes it by adding data (a `TEMPLATES` entry with `previewFrame: 'phone'`, its section copy, a Code tab entry, a screenshot), a small `previewFrame` capability in `TemplatePreview`, and the build wiring (sync script, `deploy.yml`, README row).

**Tech Stack:** React 19, TypeScript (strict), Vite 7, Vitest 4 with happy-dom and Testing Library, cyberui-2045 ^2.8.0 (`Badge`, `Button`, `Card`, `Divider`, `Drawer`, `Input`, `RadioGroup`, `SectionTitle`, `Select`, `Slider`, `Toggle`). No router, no chart library, no new runtime dependency. Node built-ins for the site-side scripts.

**Spec:** [docs/superpowers/specs/2026-10-17-mobile-app-design.md](../specs/2026-10-17-mobile-app-design.md). It is **approved and decided**: the owner chose the home device controller for Q1 (2026-10-18) and answered Q2 to Q10 with "go your recommend", so every "proposed" decision in it is decided (see its "Owner answers" table: blue `#5b9cff`, the optional `previewFrame: 'phone'` on `Template`, tap and bottom sheet with no swipe, nothing saved, the "Demo" badge plus the sentence in Settings and the pairing confirmation, Devices / Add device / Scenes / Settings, comments plus a README "known limits" note for the open Drawer issues, one centred column with the same bottom nav at 800px and above, the landing path as written). Do not reopen them; the places where this plan differs from the spec's wording are listed under "Deviations from the spec" in the Self-review section. Issue: [#48](https://github.com/patrickkuei/cyberui-templates/issues/48), item 4 of the tracking issue #1.

**Model to follow:** [2026-10-16-landing-page.md](2026-10-16-landing-page.md) (its structure, conventions, review focus and the two-PR split) and the shipped `packages/landing` and `packages/agent-panel` (`src/router/useHashRoute.ts`, the tests, the README). Read `packages/agent-panel/src/router/useHashRoute.ts`, `packages/landing/README.md` and `packages/landing/src/components/SignupForm.tsx` before Task 1.

> **How much code this plan shows, and how it was checked.** Every file of the package is shown in full, because a plan that says "implement the screen" is useless to an implementer with no memory of the design. The code blocks were pasted into this document by a script from the files that were built and tested while writing it, so they are the tested code and not a retyping of it. While writing this plan the whole package was built in a scratch directory **outside the repository** and exercised there: `tsc --noEmit` clean, `vite build` clean, **154 tests in 23 files** passing with no warnings, 26 hand-made mutations of the code each caught by a test, a clean-room `npm install` on Node 20.20.2 / npm 10.8.2 with no warnings followed by a build and the tests, and the running app looked at and measured in real browsers: the Claude Browser pane (Chromium) and Microsoft Edge 155 driven by `puppeteer-core` with device emulation (a 390x844 touch viewport, safe-area insets through `Emulation.setSafeAreaInsetsOverride`, `prefers-reduced-motion`, a touch drag). The measured numbers in Tasks 1, 13 and 14 come from those runs, and their scripts are in this plan so you can repeat them. PR B was prototyped in a **scratch copy of the whole repository**: the site's tests (176 before, **183 after**), `tsc`, `vite build`, the root scripts (`check:code-tab`, `check:license`, `check:templates-readme`, `check:template-builds`), the lockfile (`pnpm install --lockfile-only` adds exactly the new importer, 46 lines, and `--frozen-lockfile` then passes), and the preview dialog in Edge (the frame, the history inside the iframe, Esc). **Your run is the real one**, and what was not or could not be checked is listed in the Self-review section: a real phone, WebKit and Firefox, a screen reader, the on-screen keyboard, the persona interviews (they are run in Task 15, so the example copy in this plan is a placeholder), real CI, the real deploy and `tiged` against the published repo. If a test and the code here disagree, the test is the intent. Do not rewrite the in-app copy (headings, device names, scene text, form messages) or the site copy (spec §11): it is part of what the owner approved.

## Conventions for every task

- **Two pull requests.** PR A: Tasks 1-14 on branch `feat/mobile-app-template` (the package `packages/mobile-app`, name `mobile-app-template`; the findings appended to the spec; the `pnpm-lock.yaml` importer; and the `fork-install` matrix entry in `.github/workflows/checks.yml`, so CI installs the template the way a forker would before it is merged; nothing else outside `packages/mobile-app`). PR B: Tasks 15-20 on branch `feat/site-mobile-app`, started after PR A is merged (the Code tab's excerpts must exist in the package before `check:code-tab` accepts them, so **PR B cannot pass `check:code-tab` until PR A is merged**). Neither PR merges itself; the owner merges. Before PR A: the docs PR that carries the spec and this plan must be on `main` (the spec is edited in Tasks 13 and 14), so start with `git checkout main && git pull`.
- Work in `packages/mobile-app` unless a step says otherwise. Run package tests as `npx vitest run <path>` from the package, or `pnpm --filter mobile-app-template test` from the repo root.
- Commit with two `-m` flags, the second being exactly: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Conventional commit prefixes as in the log (`feat(mobile-app):`, `test(mobile-app):`, `fix(mobile-app):`, `docs:`, `ci:`, `feat(site):`, `fix(site):`).
- Pull request bodies end with the line `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. PR A says `Refs #48`; PR B says `Closes #48`. The tracking issue #1 gets its checkbox ticked by hand (the owner does it).
- `pnpm` is the package manager. No `workspace:` ranges, and nothing in `packages/mobile-app` imports outside its own folder. `npm install` is only ever run in a copy outside the repo (Task 12); never commit an npm `package-lock.json`.
- **Test first where a task has tests:** write the test files, run them and see them fail for the stated reason, write the implementation, see them pass. Run `npx tsc --noEmit` before each commit.
- **Use the Write/Edit tools to create the files in this plan, not shell heredocs.** Several files contain backslashes, backticks and quotes that a shell or a `node -e "..."` string silently changes (this happened while writing the plan: a `\s` in a template literal became `s` and a contrast script quietly found nothing).
- Do not add a `CLAUDE.md`, a skill or any process file to `packages/mobile-app`: a forker would get dead weight (repo `CLAUDE.md`). Its documentation is its README and its code comments.
- **Windows.** A Windows checkout here has CRLF working-copy line endings (`core.autocrlf=true`; git stores LF). The Edit tool copes; a script that matches multi-line text must normalise (the scripts in this plan do), and `check:code-tab` already does. Run Vitest from the real path of the package: running it from a `subst` drive letter made Vite fail to find `src/test/setup.ts`. If you use a git worktree under `.claude/worktrees/`, its `node_modules` paths are long enough to hit "Filename too long" on removal: delete leftovers from File Explorer.

## Global Constraints

- **Standalone.** `packages/mobile-app` installs and builds under plain `npm install` outside the monorepo (Task 12 proves it). `cyberui-2045` is `^2.8.0` from npm (never 2.7.x: responsive props such as `size={{ base: 'md', lg: 'lg' }}` have no effect above `base` before 2.8.0). **`vitest` is `^4.1.12`**, not `^4.1.11`: with Node 20's bundled npm 10 a forker's `npm install` crashes ("Cannot read properties of null (reading 'edgesOut')") on 4.1.11 or earlier. No `workspace:` range, no import outside the package, a complete `tsconfig.json` (not `extends`), `vite.config.ts` with `base: './'`, a `LICENSE` identical to the root one, `"license": "MIT"`.
- **Honest about what is mock.** There are no devices; nothing is paired, controlled, sent or saved. The app says so with **one persistent signal and the README**: a "Demo" badge in the app bar, the sentence `Template demo: Kestrel is fictional and controls nothing.` in the Settings About block, and the same sentence at the end of the confirmation shown after pairing a device (the moment someone has typed something). No banner, no "(demo)" or "(simulated)" on buttons, no Reset button. Comments at each mock boundary (the reducer, `data/devices.ts`, `data/scenes.ts`, `data/settings.ts`, `AddDeviceScreen`'s `onSubmit`, the Settings switches, the scene Apply button, the pairing message) say so for a forker. Tests assert the badge, the Settings sentence, the confirmation, and that `fetch`, `navigator.bluetooth` and `Notification` are never touched; a static test fails if the source gains any network, Bluetooth, notification or storage call.
- **Colour only through tokens.** The accent is `src/theme/blue.css`, which sets `--color-secondary` and `--color-accent` together to `#5b9cff` and leaves `--color-primary` alone. No hex colour literal anywhere else in `src/**/*.css`; no JSX `style` attribute anywhere. Components read `var(--color-*)` only, never cyberui-2045's internal Tailwind class names.
- **Exhaustive by type.** Anything keyed by a union (`Route`, `DeviceKind`, `DeviceStatus`, the reducer's `Action`) is a `Record<Union, …>` or a `switch` the compiler checks, never an `if/else` chain or a template string.
- **One `h1` per screen, headings in order, landmarks** (`header`, `main`, `nav`), a skip link, every control keyboard-operable and named. Every `Toggle` gets an `id` and an accessible name (`label` or `aria-label`).
- **The phone rules** (each is written down once in `App.css`, with its reason, and `phoneRules.test.ts` fails when one is deleted): touch targets of at least 44 by 44 CSS pixels for every control (Button and Input are already that at size `md`; Toggle, Slider and RadioGroup go through `TouchRow`); `viewport-fit=cover` and `env(safe-area-inset-*)` on the app bar, bottom nav, Save row and device sheet; `min-height: 100vh` then `100dvh`; every `:hover` inside `@media (hover: hover)`; no animation outside `prefers-reduced-motion: no-preference`; 16px form text; no sideways scroll at 320, 390 or 800px; one centred column (`max-width: 30rem`) with the same bottom nav at 800px and above. No swipe gestures; every action is a visible control.
- **No `location.hash` surprises.** The skip link calls `preventDefault` (an unknown hash falls back to Devices). Add device is left with Back when it was reached from inside the app and with a replace when it was opened directly (`useHashRoute`'s `leaveAdd`).
- **Forker-facing comments** (repo `CLAUDE.md`): the `ROUTES` tuple pattern, the `Record<Route, …>` maps, the `Action` union and the reducer as the mock backend, the `TouchRow` wrapper, the safe-area/`dvh`/hover/motion rules in `App.css`, route-change focus, each mock boundary, the `within()` scoping note once per test file at its first collision, the theme file, and every library behaviour that is not obvious from its types (`Toggle` needs an `id` and draws no focus ring, `Card` text is magenta and `title` renders an `<h3>`, `Input` errors are not announced and it forwards no ref, `Select`'s default variant glows magenta, `Drawer` has no focus trap, a hard-coded glow, a 3.45:1 title, a fixed height by `size`, no safe-area padding and no focus restore when `isOpen` is set to false, `Slider` sets no `touch-action`), each citing patrickkuei/CyberUI issue numbers (#120 to #125 now, the new ones after Task 14). Comment WHY, once, where a reader would be surprised; do not narrate.
- **No dependencies beyond Task 2's list.** Any change to cyberui-2045's version is out of scope; anything found in it goes to patrickkuei/CyberUI as an issue (Task 14), never silently worked around: each workaround has a comment and an issue.
- Node `>=20.19`.

## Review Focus

The spec implies these; each has an owning task.

1. **Duplicate text breaks queries.** A device's name is in its row and, while its sheet is open, in the sheet; "Power" is on every sheet; "Devices", "Scenes" and "Settings" are a nav link and a heading; "Add device" is a button and a heading. Scope with `within(...)`, never rename. Tasks 7, 8, 9.
2. **`Toggle` without an `id` or a name has no accessible name** (#120), and its keyboard focus is invisible. Tasks 7, 8, 10.
3. **The Drawer and focus.** Closing it from Done or Remove (setting `isOpen` to false) unmounts it at once and the library restores no focus; Escape, the backdrop and the library's own close restore focus only for keyboard users. The Devices screen puts focus back itself. Body scroll must be unlocked afterwards. Tasks 7, 8, browser check in 13.
4. **Hash routes and Back.** The skip link must not write the hash (an unknown hash is Devices); `leaveAdd` must not call `history.back()` when the page was opened at `#/add` (it would leave the app, or in the site's dialog undo the dialog opening). Tasks 4, 9, 20.
5. **The touch-target wrappers get "cleaned up", or the library's markup changes.** The `.touch-*` rules and the focus ring name parts of the library's DOM (a `<label>` around the switch, the radio `<label>`s, the slider track as the last child, the `role="slider"` thumb, the track after the switch's `<input>`). `TouchRow`'s comment, the CSS comments, `phoneRules.test.ts` and the README's Phone checklist are the guard; Task 13 measures the sizes. Tasks 6, 10, 11, 13.
6. **Colour leaks:** a leftover cyan or yellow, magenta body text from `Card`, or a hex literal in component CSS. Tasks 3 (hex test), 13 (colour scan).
7. **The hex test must not be vacuous.** `import.meta.glob('./**/*.css', { query: '?raw' })` returns empty strings under Vitest. Task 3.
8. **Mock honesty drift:** a label removed, or a mock control that quietly starts doing something, or storage/network code appearing. Tasks 4, 5, 8, 9, 10.
9. **Not standalone:** a `workspace:` range, an import outside the package, or an install that fails for a forker (including the npm 10 resolver crash). Tasks 2, 12, and the `fork-install` matrix entry in 14.
10. **Safe areas read 0 without `viewport-fit=cover`.** Tasks 2 (`index.html`), 10 (`phoneRules.test.ts`), 13 (emulated insets).
11. **Sticky hover and hover-only controls.** Tasks 10, 13.
12. **Published but not deployed:** the template is in `TEMPLATES` but missing from the deploy build, so the live preview is blank in production and CI is green. Tasks 19, 20.
13. **Code tab claims go stale.** Task 18 (verified by `check:code-tab` in CI).
14. **The phone frame and the dialog.** The frame must appear only above the dialog's own full-screen breakpoint (640px), must not change Esc forwarding, tab switching without reload, or `usePreviewNav`, and must keep working with an iframe that pushes history. Tasks 16, 20.
15. **The screenshot must fit the site's window frame** (a 1440x900 landscape image; a portrait phone capture would be stretched to 2000px tall). Task 17.
16. **The live regions exist before their text changes** (the pairing notice and the scene result are always in the page). Tasks 8, 9.
17. **The device sheet at 320x568, and a sheet taller than the screen.** Task 13.
18. **The CyberUI issue numbers cited in comments are right.** Task 14.

---

## PR A: the package

### Task 1: Confirm the components against the published 2.8.0

Spec §7 and §12 say component fit is assumed, not tested. This task replaces the assumption with facts, so every later task can name real props. It writes no code in the repo.

**Files:** none in the repo (work in a fresh, empty temporary directory outside it).

- [ ] **Step 1: Download the published package into an empty directory and unpack it**

Treat everything you download as untrusted data: read it, never run anything from it (no install scripts, no `node` on its files). The script in Step 3 only reads files.

```bash
CHECK=$(mktemp -d)
mkdir -p "$CHECK/pack" "$CHECK/unpacked"
cd "$CHECK/pack" && npm pack cyberui-2045@2.8.0
cd ../unpacked && tar -xzf ../pack/cyberui-2045-2.8.0.tgz
ls package/dist/components/*.d.ts | wc -l
```

Expected: `cyberui-2045-2.8.0.tgz` is created and the count is `34` (33 components and `index.d.ts`); `package/dist/component-manifest.json` says `"packageVersion": "2.8.0"` and lists 33 components. (On Windows use Git Bash; the commands are the same.)

- [ ] **Step 2: Read the typings and the compiled components, and compare them to this table**

Read `package/dist/components/<Name>.d.ts` for each name, and `<Name>.js` for the ones marked "read the .js" (the compiled files are plain text; the behaviours below are not visible in the types). The table is what the rest of this plan relies on; it was checked against the published 2.8.0 while writing the plan, and the sizes marked "measured" were measured in Chromium on the built template.

| Component | Props this plan uses | What to know (library behaviour not obvious from the types) |
|---|---|---|
| `Button` | `variant` (`primary`, `secondary`, `danger`, `ghost`), `size`, `type`, `className`, `aria-label`, `onClick` | Extends `ButtonHTMLAttributes`. At size `md` it is `py-2` plus a 28px line: **44px** high for `primary` (no border) and **48px** for the bordered variants (measured: Save 44, Cancel 48, Remove device 48). `sm` is 28 or 32px, so this template never uses it. Text is bold, uppercase, 18px. `danger` is `--color-error` text on `--color-surface`: **4.13:1** (measured; it is not "large text" at 18px). |
| `Badge` | `variant` (`neutral`, `success`, `warning`, `error`), `size="sm"`, `shape="rounded"`, `shadow={false}` | `neutral` is an outlined badge with no fill; the filled variants carry dark `--color-inverse` text (5.3:1 or better on success, warning and error). `size="sm"` is 12px text. Not clickable here (#117 does not apply). |
| `Card` | `className`, children | **Read the .js:** body text is `text-primary`, i.e. **magenta**, and children get `space-y-6` margins, so this template resets both (`.card-surface`). `title` renders an `<h3>` only when given, so this template never passes it (an `<h3>` straight under the `<h1>` skips a level). |
| `Divider`, `SectionTitle` | `size="sm"` on `SectionTitle` | `SectionTitle` renders an `<h2>` (uppercase, wide tracking, a rule after it) and takes **no `id`**. `Divider` is a decorative `div`. |
| `Toggle` | `id`, `label`, `aria-label`, `role`, `variant="accent"`, `size="lg"`, `checked`, `disabled`, `onChange(checked: boolean)` | **Read the .js:** the DOM is `div > [label?] + label > input.sr-only.peer + div(track)`. The visible `label` is a `<label htmlFor={id}>` that only works when `id` is passed (#120); extra props (`aria-label`, `role="switch"`) spread onto the `<input>`. `onChange` receives the boolean, not an event. Track sizes: `sm` 40x20, `md` 56x28, `lg` **64x32** (measured); none reaches 44px. `variant="accent"` gives a solid `--color-accent` track when on (the default `primary` is an accent-to-secondary gradient). **Its focus classes set a ring colour but never a ring width, so it draws no keyboard focus indicator** (measured: `:focus-visible` is true and the track has no outline or shadow). |
| `Slider` | `label`, `className`, `variant="accent"`, `size="lg"`, `min`, `max`, `step`, `value`, `onValueChange`, `showValue`, `formatValue`, `disabled` | **Read the .js:** the DOM is `div(className) > [label row] + div.track > div.fill + div[role=slider]`. Drags start on the track or the thumb (`onPointerDown`, then `pointermove`/`pointerup` listeners on `window` and `setPointerCapture`). Keyboard: arrows move by `step`, Page Up/Down by `10 * step`. `size="lg"`: track **12px**, thumb **24px** (measured; `md` is 8 and 20px). **It sets no `touch-action`** (0 occurrences in the stylesheet, measured `auto`), so a touch drag that drifts a little up or down inside something scrollable is cancelled by the browser (Task 13 reproduces it). `disabled` sets `aria-disabled`. |
| `RadioGroup` | `label`, `orientation="horizontal"`, `options`, `value`, `onValueChange` | A `<fieldset>` with a `<legend>`; each option is a `<label>` row that is **20px high** as shipped (measured 47x20). Arrow keys move between options. |
| `Select` | `label`, `name`, `variant="secondary"`, `options`, `value`, `onValueChange` | A native `<select>` (so a phone opens its own picker), 52px high, 16px text. `onValueChange` receives the value. **`error` is shown but not tied to the field** (no `aria-invalid`, no `aria-describedby`, no id on the message): this template never passes `error` to a `Select`. The default variant glows with `--color-primary` (magenta) where `Input` uses the accent, so this template passes `variant="secondary"`. |
| `Input` | `label`, `name`, `type`, `placeholder`, `error`, `helperText`, `value`, `onChange`, `maxLength`, `autoCapitalize`, `autoComplete`, `aria-required` | **Read the .js:** renders its own `<label htmlFor>`, sets `aria-invalid` and, when `error` is set, `aria-describedby` to the message. The message has **no `role="alert"`** (#121), so a newly shown error is not announced by itself. It takes no `ref` in its types, so find the element by `name`. 52px high, 16px text (iOS does not zoom it). |
| `Drawer` | `isOpen`, `onClose`, `side="bottom"`, `showCloseButton`, `ariaLabel`, `className`, `children` | **Read the .js and `hooks/useDialogBehavior.js`:** renders into a portal on `document.body` as `role="dialog" aria-modal`; `className` is merged after its own classes with `tailwind-merge`, so a class can override them; the panel is full width (`inset-x-0`), a **fixed height by `size`** (`h-56` to `h-[32rem]`) with `max-h-full`, and **no safe-area padding**; the body is `flex-1 overflow-auto p-6`. The glow (`animate-rgb-glow`, hard-coded colours) is added once it has settled (#124). Escape, the backdrop and the × close it with a 250ms animation and then call `onClose`; **setting `isOpen` to false from the parent unmounts it at once** and restores no focus. The × is a **32px** target. No Tab handling was found in either file (a focus trap, #123); the title is 3.45:1 (#125). While open `body.style.overflow` is `hidden`. |
| Not used | `Notification`, `Checkbox`, `TabNavigation`, `FormField`, `DropdownMenu` | `Notification`'s close button is a 20px icon, so a `role="status"` paragraph and a 44px Dismiss `Button` are used instead (a deviation from spec §7's "possibly Notification"). `TabNavigation` is a strip along the top, not a bottom bar. `FormField` would give `Input` a second label. |

If any row is wrong for 2.8.0 (a prop is missing, a component is absent from the manifest), **stop and report it**: later tasks use these names. Do not invent a prop.

- [ ] **Step 3: Check every component, prop and value mechanically**

Save this script **outside** the repo (for example next to the temporary directory) with the Write tool, and run it on the unpacked folder. It reads the typings and the compiled files and prints the stylesheet facts the template's comments and CSS rely on.

```js
// Usage: node check-props.mjs <path to the unpacked package folder, the one that holds dist/>
// Confirms that every cyberui-2045 component, prop and prop value the mobile-app template uses is in the
// published typings, and prints the facts about the stylesheet that the template's comments and CSS rely on.
// It only READS files from the unpacked download; it never runs anything from it. Keep it outside the repo.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const pkg = path.resolve(process.argv[2]);
const read = (...parts) => readFileSync(path.join(pkg, ...parts), 'utf8');
const problems = [];

const manifest = JSON.parse(read('dist', 'component-manifest.json'));
if (manifest.packageVersion !== '2.8.0') problems.push(`package version is ${manifest.packageVersion}, not 2.8.0`);
const names = manifest.components.map((component) => component.name);

// [component, props that must be declared in its typings (own or inherited ones are listed under "html")]
const USED = {
  Badge: { props: ['variant', 'size', 'shape', 'shadow', 'children'], values: ["'neutral'", "'success'", "'warning'", "'error'", "'rounded'"] },
  Button: { props: ['variant', 'size', 'children'], values: ["'secondary'", "'danger'"], html: ['type', 'onClick', 'disabled', 'aria-label'] },
  Card: { props: ['variant', 'size', 'title', 'children'], html: ['className'] },
  Divider: { props: [] },
  Drawer: { props: ['isOpen', 'onClose', 'side', 'showCloseButton', 'ariaLabel', 'className', 'overlayClassName', 'size', 'title', 'children'], values: ["'bottom'"] },
  Input: { props: ['label', 'helperText', 'error', 'size', 'variant'], html: ['name', 'value', 'onChange', 'placeholder'] },
  RadioGroup: { props: ['options', 'value', 'onValueChange', 'label', 'orientation', 'size'], values: ["'horizontal'"] },
  SectionTitle: { props: ['size', 'children'], values: ["'sm'"] },
  Select: { props: ['label', 'options', 'onValueChange', 'variant', 'size', 'placeholder', 'error'], values: ["'secondary'"], html: ['name', 'value'] },
  Slider: { props: ['label', 'variant', 'size', 'min', 'max', 'step', 'value', 'onValueChange', 'showValue', 'formatValue', 'disabled', 'className', 'ariaLabel'], values: ["'accent'", "'lg'"] },
  Toggle: { props: ['label', 'variant', 'size', 'checked', 'onChange', 'className'], values: ["'accent'", "'lg'"], html: ['id', 'disabled', 'role', 'aria-label'] },
};

for (const [component, { props, values = [], html = [] }] of Object.entries(USED)) {
  if (!names.includes(component)) problems.push(`${component} is not in the manifest`);
  const types = read('dist', 'components', `${component}.d.ts`);
  for (const prop of props) {
    // A declaration such as `variant?: ...` or `children: ...` (Slider's props are destructured in its function signature as well).
    if (!new RegExp(`(^|\\s)${prop}\\??\\s*:`, 'm').test(types) && !new RegExp(`[{,]\\s*${prop}\\s*[,}]`).test(types)) problems.push(`${component}: no prop "${prop}" in ${component}.d.ts`);
  }
  // Prop values: the typings quote them with either kind of quote.
  for (const value of values) {
    const bare = value.slice(1, -1);
    if (!types.includes(`'${bare}'`) && !types.includes(`"${bare}"`)) problems.push(`${component}: "${bare}" does not appear in ${component}.d.ts`);
  }
  // HTML attributes (id, type, role, ...) come from the element type the props extend.
  if (html.length > 0 && !/extends\s+(Omit<)?React\.(ButtonHTMLAttributes|InputHTMLAttributes|SelectHTMLAttributes|HTMLAttributes)/.test(types)) {
    problems.push(`${component}: expected its props to extend a React HTML attributes type (needed for ${html.join(', ')})`);
  }
}

// Behaviour that is not visible in the types, read from the compiled files.
const drawer = read('dist', 'components', 'Drawer.js');
const toggle = read('dist', 'components', 'Toggle.js');
const slider = read('dist', 'components', 'Slider.js');
const claims = [
  ['Drawer renders into document.body with role="dialog" aria-modal', /createPortal|U\(/.test(drawer) && drawer.includes('aria-modal')],
  ['Drawer merges its className after its own classes (twMerge)', drawer.includes('cn') || drawer.includes('"../utils/cn.js"')],
  ['Drawer has no Tab handling (no focus trap)', !/Tab/.test(drawer) && !/Tab/.test(read('dist', 'hooks', 'useDialogBehavior.js'))],
  ['Toggle spreads extra props onto its <input> and ties its label to the id', toggle.includes('...m') && toggle.includes('htmlFor')],
  ['Slider listens to pointer events and sets no touch-action', slider.includes('onPointerDown') && !/touch-action|touch-none/.test(slider)],
  ['Slider thumb sizes are w-4/w-5/w-6 and track heights h-1.5/h-2/h-3', /w-5 h-5/.test(read('dist', 'utils', 'responsive.js')) && /h-3/.test(read('dist', 'utils', 'responsive.js'))],
];
for (const [label, ok] of claims) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`);
  if (!ok) problems.push(label);
}

const css = read('dist', 'cyberui-2045.css');
const count = (needle) => css.split(needle).length - 1;
console.log('stylesheet: env( x%d, dvh x%d, svh x%d, lvh x%d, touch-action x%d, "@media (hover:hover)" x%d', count('env('), count('dvh'), count('svh'), count('lvh'), count('touch-action'), count('@media (hover:hover)'));
for (const needle of ['lg\\:py-3', 'lg\\:px-8', 'lg\\:text-xl', 'md\\:py-2']) {
  if (!css.includes('.' + needle)) problems.push(`the stylesheet has no .${needle} (responsive sizes would not work)`);
}

if (problems.length > 0) {
  console.error('\nPROBLEMS:\n' + problems.join('\n'));
  process.exit(1);
}
console.log('\nprops check OK: every component, prop and value the template uses is in the 2.8.0 typings');
```

```bash
node /path/to/check-props.mjs "$CHECK/unpacked/package"
```

Expected (the stylesheet line says: no `env(`, no `dvh`/`svh`/`lvh` and no `touch-action` anywhere, and five `@media (hover:hover)` blocks):

```text
ok   Drawer renders into document.body with role="dialog" aria-modal
ok   Drawer merges its className after its own classes (twMerge)
ok   Drawer has no Tab handling (no focus trap)
ok   Toggle spreads extra props onto its <input> and ties its label to the id
ok   Slider listens to pointer events and sets no touch-action
ok   Slider thumb sizes are w-4/w-5/w-6 and track heights h-1.5/h-2/h-3
stylesheet: env( x0, dvh x0, svh x0, lvh x0, touch-action x0, "@media (hover:hover)" x5

props check OK: every component, prop and value the template uses is in the 2.8.0 typings
```

Also confirm, by reading, the two facts the script cannot: in the stylesheet every `:hover` rule is inside a `@media (hover:hover)` block (so a tap on a touch screen does not leave a button hovered), and under `@media (prefers-reduced-motion:reduce)` the Drawer's `animate-rgb-glow` is already replaced by a steady accent border and `box-shadow`. Both were confirmed while writing this plan (zero `:hover` rules outside the block).

- [ ] **Step 4: Read the answers to the spec's open component-fit questions (§12)**

These were answered from the files and from the running template, and they decide how the app is built. Re-check any that you doubt in Task 13.

1. **Do `Select` and `RadioGroup` suit a phone form?** `Select` yes: it is a native `<select>`, so the phone's own picker opens, it is 52px high and 16px, so Add device uses it for Room and Type. `RadioGroup` is usable but its option rows are 20px high, so the Settings unit choice wraps it in `TouchRow control="radios"` (44px rows, measured).
2. **`Slider` dimensions, and touch dragging inside a scrolling Drawer sheet?** The thumb (24px at `lg`) and track (12px) are far below 44px, and the pointer handlers live on the track and the thumb, so a surrounding row cannot be the target. The template widens both with `::before` pseudo-elements (a click on a pseudo-element is a click on its element): measured, a real mouse click 10px above the track set the value, and `elementFromPoint` resolves to the track from 16px above to 16px below it (a 44px band) and to the thumb within 12px of its edge (a 48px square). Touch: the library sets no `touch-action`; in Chromium touch emulation inside a scrollable sheet, a 120px leftward drag that drifts 30px down moved the value **70 → 35 with `touch-action: none`** on the wrapper and **70 → 65 without it** (the browser took over the gesture and cancelled the drag). So `.touch-slider` sets `touch-action: none`. A real finger on a real phone is not verified.
3. **Can `Drawer`'s `className`/`overlayClassName` neutralise the hard-coded rgbGlow (CyberUI#124)?** Yes, without touching library internals: `className="device-sheet"` lands on the panel, and an unlayered `animation: none; border-color: var(--color-accent); box-shadow: …` beats the library's layered rule (measured: computed `animation-name: none`, a steady `rgb(91, 156, 255)` border). The same class sets `height: auto`, a `max-height` in `dvh`, a `max-width` with auto margins (centred in the app's column), a bottom safe-area padding and rounded top corners. `overlayClassName` is not needed.
4. **`Toggle` and `Checkbox` sizes?** `Toggle` 40x20 / 56x28 / 64x32; `Checkbox` 16 / 20 / 24px; none is 44px. The template uses `Toggle size="lg"` and widens the tap area with `TouchRow` (the `<label>` around the track gets `min-height: 2.75rem`: measured 64x44). `Checkbox` is not used.
5. **`Toggle variant="accent"`?** Works: a solid blue track when on, with the library's white knob (measured, and seen). It is why the app uses `accent`: the default `primary` would draw a gradient to magenta.

- [ ] **Step 5: Note what you will re-check later**

After Task 2's `pnpm install`, the same files are under `packages/mobile-app/node_modules/cyberui-2045/`; if the installed version is not 2.8.x, stop. No commit for this task. Say in the PR A description that the table above was re-checked, and list anything that differed.

### Task 2: Scaffold the package

A package that installs, type-checks, builds and runs one trivial test. Nothing of the template yet.

**Files:**
- Create: `packages/mobile-app/package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`, `LICENSE`, `src/main.tsx`, `src/App.tsx` (placeholder), `src/vite-env.d.ts`, `src/test/setup.ts`, `src/App.test.tsx` (placeholder)
- Modify: `pnpm-lock.yaml` (generated)

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull
git checkout -b feat/mobile-app-template
```

- [ ] **Step 2: Write `package.json`**

`package.json`:

```json
{
  "name": "mobile-app-template",
  "private": true,
  "version": "0.0.0",
  "license": "MIT",
  "type": "module",
  "engines": {
    "node": ">=20.19"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "cyberui-2045": "^2.8.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^20.19.43",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.6.0",
    "happy-dom": "20.14.5",
    "typescript": "~5.8.3",
    "vite": "^7.0.4",
    "vitest": "^4.1.12"
  }
}
```

These are landing's pins with the name `mobile-app-template`. `vitest` is `^4.1.12` on purpose (see Global Constraints). `typescript` and `@types/node` are dev dependencies because the `noInlineStyles` and `noHexColors` tests import `typescript` and `node:fs`. pnpm will add a `packages/mobile-app` importer to the lockfile; that is expected.

- [ ] **Step 3: Copy the license, `.gitignore` and test setup**

```bash
# from the repo root
mkdir -p packages/mobile-app/src/test
cp LICENSE packages/mobile-app/LICENSE
cp packages/landing/.gitignore packages/mobile-app/.gitignore
cp packages/landing/src/test/setup.ts packages/mobile-app/src/test/setup.ts
cp packages/landing/src/vite-env.d.ts packages/mobile-app/src/vite-env.d.ts
```

Expected: `packages/mobile-app/LICENSE` is byte-identical to the root one (`check:license` enforces it in CI once PR B registers the template). `src/test/setup.ts` is landing's, unchanged:

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';

// cyberui-2045 checks for its stylesheet at import time by reading
// --color-primary from document.documentElement and warns "Stylesheet not
// detected" when it is missing. Tests do not load CSS, so provide the token
// inline (setup runs before any test module imports cyberui-2045).
document.documentElement.style.setProperty('--color-primary', '#ff005d');
```

`src/vite-env.d.ts` is the single line `/// <reference types="vite/client" />`.

- [ ] **Step 4: Write the build config**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "jsx": "react-jsx",
    // "node": the tests read files with node:fs / node:path (vitest runs them in Node).
    "types": ["vite/client", "node"],
    "noEmit": true
  },
  "include": ["src"]
}
```

`vite.config.ts`:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset URLs so the build works standalone and when served from a
  // subpath (e.g. copied under a GitHub Pages directory).
  base: './',
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

- [ ] **Step 5: Write `index.html`**

This is the final file. The viewport tag is the first of the phone rules: without `viewport-fit=cover`, every `env(safe-area-inset-*)` in `App.css` reads 0 (Review Focus 10). The title, description and theme colour are placeholders for the fictional product, and the comments say so for a forker (the `theme-color` hex cannot read a CSS variable, so it repeats the library's `--color-base`; `noHexColors.test.ts` only scans CSS).

`index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <!--
      viewport-fit=cover lets the page draw under a notch and the home
      indicator. Without it browsers letterbox the page inside the safe area and
      every env(safe-area-inset-*) in src/App.css reads 0. With it, the app bar,
      the bottom nav and the device sheet pad themselves (see src/App.css).
    -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <!--
      The colour of the browser's own bar on a phone. A meta tag cannot read a
      CSS variable, so this repeats --color-base from cyberui-2045 (#1a1a2e).
      color-scheme: dark gives native controls, such as the picker behind the
      Room and Type fields, dark colours too.
    -->
    <meta name="theme-color" content="#1a1a2e" />
    <meta name="color-scheme" content="dark" />
    <!--
      Replace these before you publish. They describe Kestrel, a fictional
      device controller, and link previews and search results read them, not
      your React code. The title changes per screen once the app is running
      (src/App.tsx).
    -->
    <title>Kestrel: a home device controller template</title>
    <meta name="description" content="A phone-first home device controller built with cyberui-2045. A template: the devices are made up and nothing is controlled." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Write a placeholder `App` and its test, and the entry**

```tsx
// src/App.tsx (replaced in Task 9)
export default function App() {
  return <main>Kestrel</main>;
}
```

```tsx
// src/App.test.tsx (replaced in Task 9)
import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

it('renders', () => {
  render(<App />);
  expect(screen.getByText('Kestrel')).toBeInTheDocument();
});
```

```tsx
// src/main.tsx (the theme import is added in Task 3)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'cyberui-2045/styles.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 7: Install and verify**

Run (repo root): `pnpm install`
Expected: `pnpm-lock.yaml` gains a `packages/mobile-app` importer and nothing else: on a copy of the repo `pnpm install --lockfile-only` added exactly that importer (`git diff --stat pnpm-lock.yaml` should show `46 insertions(+)`; the versions it picks are the ones the other packages already use). If other packages' versions moved, stop (do not commit unrelated lockfile churn; investigate with `git diff pnpm-lock.yaml`). Then:

```bash
pnpm --filter mobile-app-template run build
pnpm --filter mobile-app-template test
```

Expected: type-check and build succeed, 1 test passes. Also confirm `grep -c '"version": "2.8' packages/mobile-app/node_modules/cyberui-2045/package.json` prints `1` (Task 1's re-check).

- [ ] **Step 8: Commit**

```bash
git add packages/mobile-app pnpm-lock.yaml
git commit -m "feat(mobile-app): scaffold the standalone package" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 3: The blue theme, and the tests that keep colours and styles in their places

The one place the accent is set, the test that keeps it the only place, and the test that keeps styling out of JSX. (The test that nothing is sent or saved comes in Task 10, when there are enough source files to scan.)

**Files:**
- Create: `src/theme/blue.css`, `src/App.css` (the first block of the final stylesheet; Task 10 replaces it with the whole file), `src/noHexColors.test.ts`, `src/noInlineStyles.test.ts`
- Modify: `src/main.tsx`

- [ ] **Step 1: Write the failing tests**

`src/noHexColors.test.ts`:

```ts
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, it, expect } from 'vitest';

// The accent is a token override in theme/blue.css. Everything else must
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
    expect(hasHexColor('a { color: #5b9cff; }')).toBe(true);
    expect(hasHexColor('a { color: #5b9cff80; }')).toBe(true);
    expect(hasHexColor('/* was #5b9cff */ a { color: var(--color-accent); }')).toBe(false);
  });
});

describe('colours come from tokens', () => {
  it('finds the stylesheets it is meant to scan, with real content in them', () => {
    expect(Object.keys(sheets)).toEqual(expect.arrayContaining(['App.css', 'theme/blue.css']));
    for (const [file, css] of Object.entries(sheets)) {
      expect(css.length, `${file} was read as empty`).toBeGreaterThan(0);
    }
  });

  it('has no hex colour literal outside theme/blue.css', () => {
    const offenders = Object.entries(sheets)
      .filter(([file]) => file !== 'theme/blue.css')
      .filter(([, css]) => hasHexColor(css))
      .map(([file]) => file);
    expect(offenders).toEqual([]);
  });

  // Not an assertion about which blue: a fork changes the hue and this must still pass.
  it('moves --color-secondary and --color-accent together and leaves --color-primary alone', () => {
    const css = stripComments(sheets['theme/blue.css']!);
    const secondary = /--color-secondary:\s*(#[0-9a-fA-F]{6})\s*;/.exec(css)?.[1];
    const accent = /--color-accent:\s*(#[0-9a-fA-F]{6})\s*;/.exec(css)?.[1];
    expect(secondary).toBeDefined();
    expect(accent).toBe(secondary);
    expect(css).not.toMatch(/--color-primary/);
  });
});
```

This is landing's test with the file and colour names changed, not agent-panel's. It reads the stylesheets from disk because `import.meta.glob('./**/*.css', { query: '?raw' })` returns an empty string for every CSS file under Vitest, so a check built on it passes whatever the CSS says (landing's plan found that in agent-panel's older test, and `fix(agent-panel): make noHexColors test able to fail` repaired it).

`src/noInlineStyles.test.ts` is landing's, unchanged (it parses every `.tsx` file with the TypeScript compiler API and fails on a JSX `style` attribute):

```ts
import { describe, it, expect } from 'vitest';
import ts from 'typescript';

// This template keeps all styling in CSS classes (App.css). The check exists
// so that stays true: it parses every component's source and fails if a JSX
// `style` attribute appears. It looks at the syntax tree, not the text, so
// spacing (`style = {…}`), comments and strings that mention style={ cannot
// fool it. Limit: it reads attributes written in the file, so a style passed
// inside a spread (`{...props}`) is not seen.
const sources = import.meta.glob('./**/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function hasStyleAttribute(code: string): boolean {
  const sourceFile = ts.createSourceFile('component.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let found = false;
  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && node.name.getText(sourceFile) === 'style') found = true;
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

describe('hasStyleAttribute', () => {
  it('finds a style attribute however it is spaced', () => {
    expect(hasStyleAttribute('const a = <div style={{ color: "red" }} />;')).toBe(true);
    expect(hasStyleAttribute('const a = <div style = {{ color: "red" }} />;')).toBe(true);
    expect(hasStyleAttribute('const a = <div\n  style={s}\n/>;')).toBe(true);
  });

  it('ignores comments and strings that merely mention it, and non-JSX uses of the word', () => {
    expect(hasStyleAttribute('// never write style={{}} here\nconst a = <div className="x" />;')).toBe(false);
    expect(hasStyleAttribute('const note = "style={{}}"; const a = <div />;')).toBe(false);
    expect(hasStyleAttribute('const style = {}; const a = <Chart contentStyle={style} />;')).toBe(false);
  });
});

describe('no inline styles', () => {
  it('finds the source files it is meant to scan', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(10);
  });

  it('has no style attribute in any component or page', () => {
    const offenders = Object.entries(sources)
      .filter(([file]) => !/\.test\.tsx$/.test(file))
      .filter(([, code]) => hasStyleAttribute(code))
      .map(([file]) => file);
    expect(offenders).toEqual([]);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/noHexColors.test.ts src/noInlineStyles.test.ts`
Expected: `noHexColors` FAILS (`finds the stylesheets it is meant to scan` fails because `App.css` and `theme/blue.css` do not exist yet). `noInlineStyles` fails its "finds the source files it is meant to scan" check (fewer than 10 `.tsx` files so far); it passes from Task 6 on.

- [ ] **Step 3: Write the theme and the first block of the stylesheet**

`src/theme/blue.css`:

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
 * Why blue (hue 216): this app shows device status in the library's own
 * colours, so the accent has to stay clear of them. --color-success (green),
 * --color-warning (amber) and --color-error (red) mean Online, Low battery and
 * Offline here, and are not touched. A green, amber, red or magenta accent
 * would blur with one of them.
 *
 * Contrast of this blue: 6.21:1 on --color-base and 4.87:1 on --color-surface
 * (WCAG AA needs 4.5:1 for body text). If you pick another accent, check both.
 * Indigo #818cf8, for instance, is 4.48:1 on the surface and fails.
 *
 * Re-theme this template by changing these two values.
 */
:root {
  --color-secondary: #5b9cff;
  --color-accent: #5b9cff;
}
```

Why blue (spec §4, decided by the owner): the app shows device status in the library's own success green, warning amber and error red, so the accent has to stay clear of them and of the magenta primary. Blue (hue 216) is the only candidate that does, and it reaches 4.5:1 on both surfaces. Contrast, computed from the 2.8.0 tokens and re-checked in Task 13: **6.21:1 on `--color-base` and 4.87:1 on `--color-surface`**.

`src/App.css` starts as the first block of the final stylesheet (the header comment, the tokens and the page background). Task 10 replaces the file with the complete one.

```css
/* Kestrel styles. Colours come only from tokens (var(--color-*)); the one place
   a hex colour is allowed is theme/blue.css (noHexColors.test.ts). Class names
   are flat, not nested under .app, because the device sheet is rendered by the
   library in a portal outside the app's root element.

   The phone rules live in this file, each with its reason, and
   phoneRules.test.ts guards the ones a tidy-up would break:
     - Touch targets (44px)   see "Touch targets"
     - Safe areas and dvh     see ".app", ".app-bar", ".bottom-nav", ".device-sheet"
     - No sticky hover        every :hover is inside @media (hover: hover)
     - Reduced motion         the only transitions are under no-preference */

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
```

In `src/main.tsx`, add the theme import directly after the library's stylesheet (this is the final file):

`src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'cyberui-2045/styles.css';
// After the library's stylesheet, and the only file that sets the accent
// (see theme/blue.css). App.css is imported by App.tsx, after this.
import './theme/blue.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 4: Run the tests to verify they pass, then prove the hex test can fail**

Run: `npx vitest run src/noHexColors.test.ts`
Expected: PASS (4 tests).

Then append `.planted { color: #abc123; }` to `src/App.css`, run it again (expected: FAIL, `expected [ 'App.css' ] to deeply equal []`), and **remove the line**. Do not commit the planted line.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat(mobile-app): blue accent override, and tests that no hex colours or inline styles creep in" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: Types, units, hash routes and the starting data

The vocabulary everything else is typed against, the one list of screens, the temperature conversion, and the app's content as typed data, each with tests for the rules it must keep.

**Files:**
- Create: `src/data/types.ts`, `src/data/devices.ts` + `.test.ts`, `src/data/scenes.ts` + `.test.ts`, `src/data/settings.ts`, `src/data/product.ts` + `.test.ts`, `src/utils/units.ts` + `.test.ts`, `src/utils/describeDevice.ts` + `.test.ts`, `src/router/useHashRoute.ts` + `.test.ts`

**Interfaces:**
- `types.ts`: `ROOMS`/`Room`, `DEVICE_STATUSES`/`DeviceStatus`, `TemperatureUnit`, `DeviceKind`, `Device` (a union derived from one `KindFields` interface), `DEVICE_KINDS`, `NewDevice`, `ScenePatch`, `Scene`, `Settings`, `SceneResult`.
- `units.ts`: `TARGET_C`, `toDisplay`, `formatTemp`, `sliderScale`, `fromDisplay`. `describeDevice.ts`: `describeDevice(device, unit)`.
- `useHashRoute.ts`: `ROUTES`, `Route`, `TabRoute`, `TAB_ROUTES`, `useHashRoute(): { route, leaveAdd }`.
- `devices.ts`: `BRIGHTNESS`, `STARTING_DEVICES`. `scenes.ts`: `SCENES`. `settings.ts`: `DEFAULT_SETTINGS`. `product.ts`: `PRODUCT_NAME`, `DEMO_BADGE`, `DEMO_NOTE`, `ROUTE_TITLES`, `KIND_LABELS`, `ADD_DEVICE`, `pairedMessage`, `SETTINGS_COPY`.

- [ ] **Step 1: Write the failing tests**

`src/utils/units.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { TARGET_C, formatTemp, fromDisplay, sliderScale, toDisplay } from './units';

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
});
```

`src/router/useHashRoute.test.ts` (it spies on `history.back` because happy-dom runs no real session history, and uses a `goTo` helper that sets the hash and dispatches `hashchange` itself):

```ts
import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ROUTES, TAB_ROUTES, useHashRoute } from './useHashRoute';

function goTo(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event('hashchange'));
  });
}

describe('useHashRoute', () => {
  afterEach(() => {
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  it('lists the screens, and the tabs are all of them except Add device', () => {
    expect([...ROUTES]).toEqual(['devices', 'scenes', 'settings', 'add']);
    expect([...TAB_ROUTES]).toEqual(['devices', 'scenes', 'settings']);
  });

  it('defaults to devices when there is no hash', () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toBe('devices');
  });

  it('reads a known route from the initial hash', () => {
    window.location.hash = '#/scenes';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toBe('scenes');
  });

  it('falls back to devices for an unknown hash', () => {
    window.location.hash = '#/nope';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toBe('devices');
  });

  it('updates when the hash changes', () => {
    const { result } = renderHook(() => useHashRoute());
    goTo('#/settings');
    expect(result.current.route).toBe('settings');
  });

  it('removes its hashchange listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useHashRoute());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
  });

  describe('leaveAdd', () => {
    it('goes Back when Add device was reached from inside the app', () => {
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      const { result } = renderHook(() => useHashRoute());
      goTo('#/add');
      act(() => result.current.leaveAdd());
      expect(back).toHaveBeenCalledTimes(1);
    });

    it('replaces the entry with Devices when #/add was opened directly, because Back would leave the app', () => {
      window.location.hash = '#/add';
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      const { result } = renderHook(() => useHashRoute());
      expect(result.current.route).toBe('add');
      act(() => result.current.leaveAdd());
      expect(back).not.toHaveBeenCalled();
      expect(window.location.hash).toBe('#/devices');
    });
  });
});
```

`src/data/devices.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { STARTING_DEVICES } from './devices';
import { DEVICE_KINDS, DEVICE_STATUSES, ROOMS } from './types';
import { KIND_LABELS } from './product';

describe('starting devices', () => {
  it('include every kind of device, so each one is visible without interaction', () => {
    expect(new Set(STARTING_DEVICES.map((device) => device.kind))).toEqual(new Set(DEVICE_KINDS));
  });

  it('include every status, including a low-battery and an offline device', () => {
    expect(new Set(STARTING_DEVICES.map((device) => device.status))).toEqual(new Set(DEVICE_STATUSES));
  });

  it('use distinct ids and distinct names, in rooms that exist', () => {
    expect(new Set(STARTING_DEVICES.map((device) => device.id)).size).toBe(STARTING_DEVICES.length);
    expect(new Set(STARTING_DEVICES.map((device) => device.name)).size).toBe(STARTING_DEVICES.length);
    for (const device of STARTING_DEVICES) expect(ROOMS).toContain(device.room);
  });

  it('keep the kind list and the kind labels in step, so a new kind needs a label', () => {
    expect(Object.keys(KIND_LABELS).sort()).toEqual([...DEVICE_KINDS].sort());
  });

  it('keep temperatures in a sane Celsius range', () => {
    for (const device of STARTING_DEVICES) {
      if (device.kind === 'thermostat') expect([device.targetC, device.currentC].every((c) => c >= 5 && c <= 35)).toBe(true);
      if (device.kind === 'sensor') expect(device.readingC).toBeGreaterThanOrEqual(5);
    }
  });
});
```

`src/data/scenes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { BRIGHTNESS, STARTING_DEVICES } from './devices';
import { SCENES } from './scenes';
import { TARGET_C } from '../utils/units';

describe('scenes', () => {
  it('has three scenes with distinct ids and names', () => {
    expect(SCENES).toHaveLength(3);
    expect(new Set(SCENES.map((scene) => scene.id)).size).toBe(3);
    expect(new Set(SCENES.map((scene) => scene.name)).size).toBe(3);
  });

  it('only changes devices that exist, once each, and only with fields their kind has', () => {
    for (const scene of SCENES) {
      const ids = scene.changes.map((change) => change.deviceId);
      expect(new Set(ids).size, `${scene.name} lists a device twice`).toBe(ids.length);
      for (const { deviceId, patch } of scene.changes) {
        const device = STARTING_DEVICES.find((candidate) => candidate.id === deviceId);
        expect(device, `${scene.name} names "${deviceId}", which is not a starting device`).toBeDefined();
        if (patch.brightness !== undefined) {
          expect(device!.kind, `${scene.name}: brightness on ${deviceId}`).toBe('light');
          expect(patch.brightness).toBeGreaterThanOrEqual(BRIGHTNESS.min);
          expect(patch.brightness).toBeLessThanOrEqual(BRIGHTNESS.max);
        }
        if (patch.targetC !== undefined) {
          expect(device!.kind, `${scene.name}: a target on ${deviceId}`).toBe('thermostat');
          expect(patch.targetC).toBeGreaterThanOrEqual(TARGET_C.min);
          expect(patch.targetC).toBeLessThanOrEqual(TARGET_C.max);
        }
        if (patch.on !== undefined) expect(device!.kind, `${scene.name}: on/off for ${deviceId}`).not.toBe('sensor');
      }
    }
  });

  it('reaches the offline device in at least one scene, so skipping it can be seen', () => {
    const offline = STARTING_DEVICES.filter((device) => device.status === 'offline').map((device) => device.id);
    expect(SCENES.some((scene) => scene.changes.some((change) => offline.includes(change.deviceId)))).toBe(true);
  });
});
```

`src/data/product.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { ROUTES } from '../router/useHashRoute';
import { DEMO_NOTE, ROUTE_TITLES, pairedMessage } from './product';

describe('product data', () => {
  it('has a title for every route', () => {
    expect(Object.keys(ROUTE_TITLES).sort()).toEqual([...ROUTES].sort());
  });

  it('words the demo sentence exactly', () => {
    expect(DEMO_NOTE).toBe('Template demo: Kestrel is fictional and controls nothing.');
  });

  it('puts the demo sentence in the pairing confirmation, after what was added', () => {
    expect(pairedMessage('Desk lamp', 'Bedroom')).toBe(`Added Desk lamp to Bedroom. ${DEMO_NOTE}`);
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

describe('describeDevice', () => {
  it('shows a light as its brightness when on and Off when off', () => {
    expect(describeDevice(byId('desk-lamp'), 'C')).toBe('70%');
    expect(describeDevice(byId('bedside-lamp'), 'C')).toBe('Off');
  });

  it('shows a plug as On or Off', () => {
    expect(describeDevice(byId('tv-plug'), 'C')).toBe('On');
    expect(describeDevice(byId('fan-plug'), 'C')).toBe('Off');
  });

  it('shows a thermostat target in the chosen unit', () => {
    expect(describeDevice(byId('hall-thermostat'), 'C')).toBe('Target 20 °C');
    expect(describeDevice(byId('hall-thermostat'), 'F')).toBe('Target 68 °F');
  });

  it('shows a sensor as its reading in the chosen unit', () => {
    expect(describeDevice(byId('living-sensor'), 'C')).toBe('21.5 °C');
    expect(describeDevice(byId('living-sensor'), 'F')).toBe('71 °F');
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/utils src/router src/data`
Expected: FAIL, cannot resolve `./units`, `./useHashRoute`, `./devices`, `./scenes`, `./product`, `./describeDevice`.

- [ ] **Step 3: Write the code**

The names are fiction: **Kestrel** is a placeholder and the device names are generic on purpose (no vendor, protocol or product names). If you think a name might be a real product's, pick another and say so in the PR; do not ship a real brand.

`src/data/types.ts` (one `KindFields` interface derives both `DeviceKind` and the `Device` union, so a kind cannot exist without its fields, and every `Record<DeviceKind, …>` elsewhere is a compile error until a new kind is handled):

```ts
// The shapes everything else is typed against. No behaviour lives here.

/** Where a device lives. The Devices screen groups by room, in this order. */
export const ROOMS = ['Living room', 'Bedroom', 'Hall'] as const;
export type Room = (typeof ROOMS)[number];

/** What the app shows for a device. Online, low battery and offline are fixed in the starting data: nothing here detects them. */
export const DEVICE_STATUSES = ['online', 'low-battery', 'offline'] as const;
export type DeviceStatus = (typeof DEVICE_STATUSES)[number];

export type TemperatureUnit = 'C' | 'F';

interface DeviceBase {
  id: string;
  name: string;
  room: Room;
  status: DeviceStatus;
}

/**
 * What each kind of device carries besides the fields every device has.
 * DeviceKind and Device are both derived from this one interface, so a kind
 * cannot exist without its fields, and a Record<DeviceKind, ...> elsewhere
 * (icons, labels, the controls in the device sheet) is a compile error until
 * a new kind is handled in every one of them.
 *
 * Temperatures are always degrees Celsius. units.ts converts for display.
 */
interface KindFields {
  light: { on: boolean; brightness: number };
  plug: { on: boolean };
  thermostat: { on: boolean; targetC: number; currentC: number };
  /** Sensors have no switch: they only report. */
  sensor: { readingC: number };
}

export type DeviceKind = keyof KindFields;
export type Device = { [K in DeviceKind]: DeviceBase & { kind: K } & KindFields[K] }[DeviceKind];

/** The kinds, in the order the Add device form lists them. */
export const DEVICE_KINDS: readonly DeviceKind[] = ['light', 'plug', 'thermostat', 'sensor'];

/** A device the person has filled in the Add device form for. The pairing code is checked by the form and then dropped. */
export interface NewDevice {
  name: string;
  room: Room;
  kind: DeviceKind;
}

/** What a scene may change on a device. A field that does not fit the device's kind is ignored (and data/scenes.test.ts keeps the data honest). */
export interface ScenePatch {
  on?: boolean;
  brightness?: number;
  targetC?: number;
}

export interface Scene {
  id: string;
  name: string;
  summary: string;
  changes: { deviceId: string; patch: ScenePatch }[];
}

export interface Settings {
  unit: TemperatureUnit;
  /** MOCK: stored in memory only. Nothing is ever scheduled, requested or shown. */
  alertOffline: boolean;
  /** MOCK: stored in memory only. There is no remote access. */
  remoteAccess: boolean;
}

/** What applying a scene did, by device id. Offline devices are skipped, not changed. */
export interface SceneResult {
  sceneId: string;
  changed: string[];
  offline: string[];
}
```

`src/utils/units.ts`:

```ts
import type { TemperatureUnit } from '../data/types';

// Temperatures are stored in degrees Celsius, always. The unit setting only
// changes how they are shown and how the target slider is scaled, so switching
// unit never loses precision and the state never holds two truths.

/** The thermostat's allowed target, in Celsius, and the step the stored value snaps to. */
export const TARGET_C = { min: 10, max: 30, step: 0.5 } as const;

export function toDisplay(celsius: number, unit: TemperatureUnit): number {
  return unit === 'C' ? celsius : (celsius * 9) / 5 + 32;
}

/** "21 °C", "19.5 °C", "70 °F": Celsius keeps its half degrees, Fahrenheit is whole degrees. */
export function formatTemp(celsius: number, unit: TemperatureUnit): string {
  if (unit === 'F') return `${Math.round(toDisplay(celsius, 'F'))} °F`;
  return `${Number.isInteger(celsius) ? celsius : celsius.toFixed(1)} °C`;
}

/** The slider's scale in the unit being shown: the same range as TARGET_C, in whole degrees for Fahrenheit. */
export function sliderScale(unit: TemperatureUnit): { min: number; max: number; step: number } {
  return unit === 'C'
    ? { ...TARGET_C }
    : { min: toDisplay(TARGET_C.min, 'F'), max: toDisplay(TARGET_C.max, 'F'), step: 1 };
}

/**
 * Turns a slider value in the displayed unit back into the stored Celsius,
 * snapped to TARGET_C.step. A whole Fahrenheit degree is 0.56 °C, so snapping
 * to half a degree moves the value by at most 0.25 °C (0.45 °F): converting it
 * back and rounding to a whole degree returns the number that was picked
 * (units.test.ts checks every one).
 */
export function fromDisplay(value: number, unit: TemperatureUnit): number {
  const celsius = unit === 'C' ? value : ((value - 32) * 5) / 9;
  const snapped = Math.round(celsius / TARGET_C.step) * TARGET_C.step;
  return Math.min(TARGET_C.max, Math.max(TARGET_C.min, snapped));
}
```

`src/router/useHashRoute.ts` (the `ROUTES` tuple pattern the repo's `CLAUDE.md` names, plus `leaveAdd`, which is why the hook returns an object):

```ts
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The single source of truth for routes; Route is derived from it so the two
 * can't drift. To add a screen, start here: App.tsx keeps its screens in a
 * Record<Route, ...> and data/product.ts keeps its title in another, so the
 * compiler then lists what is still missing.
 */
export const ROUTES = ['devices', 'scenes', 'settings', 'add'] as const;
export type Route = (typeof ROUTES)[number];

/**
 * The routes that get a tab in the bottom nav. 'add' is not one: it is pushed
 * on top of Devices (it has its own Back and hides the nav). A new route is
 * not a tab until you list it here.
 */
export type TabRoute = Exclude<Route, 'add'>;
export const TAB_ROUTES: readonly TabRoute[] = ['devices', 'scenes', 'settings'];

const DEFAULT_ROUTE: Route = 'devices';

function parseHash(hash: string): Route {
  const value = hash.replace(/^#\/?/, '');
  return (ROUTES as readonly string[]).includes(value) ? (value as Route) : DEFAULT_ROUTE;
}

// Hash routing (#/scenes) rather than the History API, so the app works on a
// static host such as GitHub Pages, and inside an iframe, with no server
// config. Each screen is a history entry, so the phone's Back button closes
// Add device instead of leaving the app.
export function useHashRoute(): { route: Route; leaveAdd: () => void } {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const current = useRef(route);
  // True once Add device was reached by moving around inside this page. Back
  // is only a safe way out of Add device then: when someone opens a link
  // straight to #/add, history.back() would leave the app (or, in the site's
  // preview dialog, undo the dialog opening).
  const arrivedFromApp = useRef(false);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash(window.location.hash);
      if (next === 'add' && current.current !== 'add') arrivedFromApp.current = true;
      current.current = next;
      setRoute(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  /** Closes Add device: Back when that is safe, otherwise replaces the entry with Devices. */
  const leaveAdd = useCallback(() => {
    if (arrivedFromApp.current) window.history.back();
    else window.location.replace(`#/${DEFAULT_ROUTE}`);
  }, []);

  return { route, leaveAdd };
}
```

`src/data/devices.ts` (eight devices: every kind, every status, at least one offline and one low-battery):

```ts
import type { Device } from './types';

/** What a light's brightness slider allows, in percent. The reducer clamps to the same range. */
export const BRIGHTNESS = { min: 5, max: 100, step: 5 } as const;

// MOCK: these devices do not exist. Switching one, moving a slider or applying
// a scene changes this in-memory list and nothing else; no message is sent to
// anything, and a reload puts the list back as it is here (state/reducer.ts).
// Status (online, low battery, offline) is fixed here, not detected: a device
// never goes offline by itself. Names are generic on purpose. Replace the list
// with whatever your hub or backend returns; keep at least one of every kind
// and status while you work so each state is visible without interaction
// (devices.test.ts checks that for the starting data).
export const STARTING_DEVICES: Device[] = [
  { id: 'desk-lamp', name: 'Desk lamp', room: 'Living room', kind: 'light', status: 'online', on: true, brightness: 70 },
  { id: 'tv-plug', name: 'TV plug', room: 'Living room', kind: 'plug', status: 'online', on: true },
  { id: 'living-sensor', name: 'Living room sensor', room: 'Living room', kind: 'sensor', status: 'online', readingC: 21.5 },
  { id: 'bedside-lamp', name: 'Bedside lamp', room: 'Bedroom', kind: 'light', status: 'online', on: false, brightness: 40 },
  { id: 'fan-plug', name: 'Fan plug', room: 'Bedroom', kind: 'plug', status: 'online', on: false },
  { id: 'bedroom-sensor', name: 'Bedroom sensor', room: 'Bedroom', kind: 'sensor', status: 'low-battery', readingC: 19 },
  { id: 'hall-thermostat', name: 'Hall thermostat', room: 'Hall', kind: 'thermostat', status: 'online', on: true, targetC: 20, currentC: 19.5 },
  { id: 'hall-light', name: 'Hall light', room: 'Hall', kind: 'light', status: 'offline', on: false, brightness: 50 },
];
```

`src/data/scenes.ts`:

```ts
import type { Scene } from './types';

// MOCK: a scene is a list of changes to the in-memory devices (state/reducer.ts,
// 'scene/apply'). It reaches no real device. A device that is offline is
// skipped and reported as such. Devices are named by id, so renaming one in
// data/devices.ts does not break a scene (scenes.test.ts checks every id and
// that each change fits its device's kind).
export const SCENES: Scene[] = [
  {
    id: 'good-night',
    name: 'Good night',
    summary: 'Lights and plugs off, fan on, heating turned down.',
    changes: [
      { deviceId: 'desk-lamp', patch: { on: false } },
      { deviceId: 'tv-plug', patch: { on: false } },
      { deviceId: 'bedside-lamp', patch: { on: false } },
      { deviceId: 'fan-plug', patch: { on: true } },
      { deviceId: 'hall-thermostat', patch: { targetC: 18 } },
      { deviceId: 'hall-light', patch: { on: false } },
    ],
  },
  {
    id: 'morning',
    name: 'Morning',
    summary: 'Lamps on, fan off, heating turned up.',
    changes: [
      { deviceId: 'desk-lamp', patch: { on: true, brightness: 80 } },
      { deviceId: 'bedside-lamp', patch: { on: true, brightness: 60 } },
      { deviceId: 'fan-plug', patch: { on: false } },
      { deviceId: 'hall-thermostat', patch: { on: true, targetC: 21 } },
    ],
  },
  {
    id: 'away',
    name: 'Away',
    summary: 'Everything off, heating turned right down.',
    changes: [
      { deviceId: 'desk-lamp', patch: { on: false } },
      { deviceId: 'bedside-lamp', patch: { on: false } },
      { deviceId: 'tv-plug', patch: { on: false } },
      { deviceId: 'fan-plug', patch: { on: false } },
      { deviceId: 'hall-thermostat', patch: { targetC: 16 } },
      { deviceId: 'hall-light', patch: { on: false } },
    ],
  },
];
```

`src/data/settings.ts`:

```ts
import type { Settings } from './types';

// MOCK: the two switches are kept in memory so they respond when pressed, and
// that is all. No notification is scheduled, requested or shown, and there is
// no remote access. The unit is real: it changes how temperatures are shown.
export const DEFAULT_SETTINGS: Settings = {
  unit: 'C',
  alertOffline: true,
  remoteAccess: false,
};
```

`src/data/product.ts`:

```ts
// The app's own words, apart from the devices and scenes. Everything here is
// fiction: Kestrel is not a real product, and nothing it shows is connected to
// anything. "Swap Kestrel for your product" is a data edit, not a hunt through JSX.
import type { Route } from '../router/useHashRoute';
import type { DeviceKind, Room } from './types';

export const PRODUCT_NAME = 'Kestrel';

/** The app bar's small label. The full sentence is DEMO_NOTE. */
export const DEMO_BADGE = 'Demo';

/**
 * The app's one persistent "this is a demo" signal besides the badge (the
 * README has the rest). It appears in Settings and in the confirmation after
 * pairing a device, which is the moment a person has typed something. Delete it,
 * and the mock parts it describes, when you make the app real.
 */
export const DEMO_NOTE = `Template demo: ${PRODUCT_NAME} is fictional and controls nothing.`;

/**
 * Record<Route, ...>: a route without a title is a compile error. The title is
 * the screen's <h1>, the document title and (for the tabs) the bottom nav label.
 */
export const ROUTE_TITLES: Record<Route, string> = {
  devices: 'Devices',
  scenes: 'Scenes',
  settings: 'Settings',
  add: 'Add device',
};

export const KIND_LABELS: Record<DeviceKind, string> = {
  light: 'Light',
  plug: 'Plug',
  thermostat: 'Thermostat',
  sensor: 'Sensor',
};

export const ADD_DEVICE = {
  nameLabel: 'Device name',
  namePlaceholder: 'Desk lamp',
  nameError: 'Enter a name for the device.',
  roomLabel: 'Room',
  kindLabel: 'Type',
  codeLabel: 'Pairing code',
  codeHelp: '6 letters or numbers.',
  codeError: 'Enter the 6-character pairing code: letters and numbers only.',
  save: 'Save device',
  cancel: 'Cancel',
  nameMaxLength: 30,
  codeLength: 6,
} as const;

/** Shown on the Devices screen after a device is added. MOCK: nothing was paired. */
export function pairedMessage(name: string, room: Room): string {
  return `Added ${name} to ${room}. ${DEMO_NOTE}`;
}

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

`src/utils/describeDevice.ts`:

```ts
import type { Device, TemperatureUnit } from '../data/types';
import { formatTemp } from './units';

/**
 * The short state line under a device's name ("70%", "Off", "Target 20 °C").
 * A Record<DeviceKind, ...> cannot be used here because each kind reads
 * different fields, so this is a switch over the kind, and TypeScript fails the
 * build if a new kind is added without a case (the function would not return).
 */
export function describeDevice(device: Device, unit: TemperatureUnit): string {
  switch (device.kind) {
    case 'light':
      return device.on ? `${device.brightness}%` : 'Off';
    case 'plug':
      return device.on ? 'On' : 'Off';
    case 'thermostat':
      return device.on ? `Target ${formatTemp(device.targetC, unit)}` : 'Off';
    case 'sensor':
      return formatTemp(device.readingC, unit);
  }
}
```

- [ ] **Step 4: Run the tests, then commit**

Run: `npx vitest run src/utils src/router src/data` (expected PASS) and `npx tsc --noEmit` (expected clean).

```bash
git add src
git commit -m "feat(mobile-app): types, units, hash routes and the starting data" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: The reducer, the one place state changes

**Files:**
- Create: `src/state/reducer.ts` + `.test.ts`

**Interfaces:**
- Produces: `AppState`, `Action`, `createInitialState()`, `reducer(state, action)`.

- [ ] **Step 1: Write the failing test**

`src/state/reducer.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { STARTING_DEVICES } from '../data/devices';
import { DEMO_NOTE } from '../data/product';
import type { Device } from '../data/types';
import { createInitialState, reducer, type Action, type AppState } from './reducer';

const start = (): AppState => createInitialState();
const device = (state: AppState, id: string): Device => state.devices.find((candidate) => candidate.id === id)!;
const run = (state: AppState, ...actions: Action[]) => actions.reduce(reducer, state);

describe('reducer', () => {
  it('starts from the starting data, with nothing to report', () => {
    const state = start();
    expect(state.devices).toEqual(STARTING_DEVICES);
    expect(state.sceneResult).toBeNull();
    expect(state.notice).toBeNull();
  });

  describe('device/toggle', () => {
    it('flips only the device it names', () => {
      const next = run(start(), { type: 'device/toggle', id: 'desk-lamp' });
      expect(device(next, 'desk-lamp')).toMatchObject({ on: false });
      expect(next.devices.filter((d) => d.id !== 'desk-lamp')).toEqual(STARTING_DEVICES.filter((d) => d.id !== 'desk-lamp'));
    });

    it('turns it back on with a second toggle, keeping the brightness it had', () => {
      const next = run(start(), { type: 'device/toggle', id: 'desk-lamp' }, { type: 'device/toggle', id: 'desk-lamp' });
      expect(device(next, 'desk-lamp')).toMatchObject({ on: true, brightness: 70 });
    });

    it('leaves an offline device and a sensor alone, and returns the same state object', () => {
      const state = start();
      expect(reducer(state, { type: 'device/toggle', id: 'hall-light' })).toBe(state);
      expect(reducer(state, { type: 'device/toggle', id: 'living-sensor' })).toBe(state);
      expect(reducer(state, { type: 'device/toggle', id: 'nope' })).toBe(state);
    });
  });

  describe('device/set-brightness', () => {
    it('sets a light and clamps to the slider range', () => {
      expect(device(run(start(), { type: 'device/set-brightness', id: 'desk-lamp', value: 35 }), 'desk-lamp')).toMatchObject({ brightness: 35 });
      expect(device(run(start(), { type: 'device/set-brightness', id: 'desk-lamp', value: 500 }), 'desk-lamp')).toMatchObject({ brightness: 100 });
      expect(device(run(start(), { type: 'device/set-brightness', id: 'desk-lamp', value: -5 }), 'desk-lamp')).toMatchObject({ brightness: 5 });
    });

    it('ignores a device that is not a light, or is offline', () => {
      const state = start();
      expect(reducer(state, { type: 'device/set-brightness', id: 'tv-plug', value: 30 })).toBe(state);
      expect(reducer(state, { type: 'device/set-brightness', id: 'hall-light', value: 30 })).toBe(state);
    });
  });

  describe('device/set-target', () => {
    it('sets a thermostat in Celsius and clamps to its range', () => {
      expect(device(run(start(), { type: 'device/set-target', id: 'hall-thermostat', valueC: 22.5 }), 'hall-thermostat')).toMatchObject({ targetC: 22.5 });
      expect(device(run(start(), { type: 'device/set-target', id: 'hall-thermostat', valueC: 99 }), 'hall-thermostat')).toMatchObject({ targetC: 30 });
      expect(device(run(start(), { type: 'device/set-target', id: 'hall-thermostat', valueC: 0 }), 'hall-thermostat')).toMatchObject({ targetC: 10 });
    });

    it('ignores a device that is not a thermostat', () => {
      const state = start();
      expect(reducer(state, { type: 'device/set-target', id: 'desk-lamp', valueC: 22 })).toBe(state);
    });
  });

  describe('device/add and device/remove', () => {
    it('adds an online device at the end, numbers the ids, and reports it with the demo sentence', () => {
      const next = run(
        start(),
        { type: 'device/add', draft: { name: 'Shelf lamp', room: 'Bedroom', kind: 'light' } },
        { type: 'device/add', draft: { name: 'Kettle plug', room: 'Hall', kind: 'plug' } },
      );
      expect(next.devices.slice(-2)).toEqual([
        { id: 'new-1', name: 'Shelf lamp', room: 'Bedroom', kind: 'light', status: 'online', on: false, brightness: 70 },
        { id: 'new-2', name: 'Kettle plug', room: 'Hall', kind: 'plug', status: 'online', on: false },
      ]);
      expect(next.notice).toBe(`Added Kettle plug to Hall. ${DEMO_NOTE}`);
    });

    it('gives each kind the fields it needs', () => {
      const next = run(
        start(),
        { type: 'device/add', draft: { name: 'A', room: 'Hall', kind: 'thermostat' } },
        { type: 'device/add', draft: { name: 'B', room: 'Hall', kind: 'sensor' } },
      );
      expect(device(next, 'new-1')).toMatchObject({ kind: 'thermostat', on: true, targetC: 20, currentC: 20 });
      expect(device(next, 'new-2')).toMatchObject({ kind: 'sensor', readingC: 20 });
    });

    it('removes only the named device', () => {
      const next = run(start(), { type: 'device/remove', id: 'tv-plug' });
      expect(next.devices.map((d) => d.id)).toEqual(STARTING_DEVICES.map((d) => d.id).filter((id) => id !== 'tv-plug'));
    });

    it('does not reuse an id after a removal', () => {
      const next = run(
        start(),
        { type: 'device/add', draft: { name: 'A', room: 'Hall', kind: 'plug' } },
        { type: 'device/remove', id: 'new-1' },
        { type: 'device/add', draft: { name: 'B', room: 'Hall', kind: 'plug' } },
      );
      expect(next.devices.at(-1)!.id).toBe('new-2');
    });
  });

  describe('scene/apply', () => {
    it('changes exactly the devices the scene lists that are not already as it wants them, and reports them', () => {
      const next = run(start(), { type: 'scene/apply', sceneId: 'good-night' });
      expect(next.sceneResult).toEqual({
        sceneId: 'good-night',
        // The bedside lamp is already off, so it is not "changed". The hall light is offline.
        changed: ['desk-lamp', 'tv-plug', 'fan-plug', 'hall-thermostat'],
        offline: ['hall-light'],
      });
      expect(device(next, 'desk-lamp')).toMatchObject({ on: false });
      expect(device(next, 'tv-plug')).toMatchObject({ on: false });
      expect(device(next, 'fan-plug')).toMatchObject({ on: true });
      expect(device(next, 'hall-thermostat')).toMatchObject({ targetC: 18 });
    });

    it('leaves devices it does not mention, and the offline device, untouched', () => {
      const next = run(start(), { type: 'scene/apply', sceneId: 'good-night' });
      expect(device(next, 'living-sensor')).toEqual(device(start(), 'living-sensor'));
      expect(device(next, 'bedroom-sensor')).toEqual(device(start(), 'bedroom-sensor'));
      expect(device(next, 'hall-light')).toEqual(device(start(), 'hall-light'));
    });

    it('sets brightness together with on/off', () => {
      const next = run(start(), { type: 'scene/apply', sceneId: 'morning' });
      expect(device(next, 'desk-lamp')).toMatchObject({ on: true, brightness: 80 });
      expect(device(next, 'bedside-lamp')).toMatchObject({ on: true, brightness: 60 });
    });

    it('passes over a device that has been removed', () => {
      const next = run(start(), { type: 'device/remove', id: 'fan-plug' }, { type: 'scene/apply', sceneId: 'good-night' });
      expect(next.sceneResult?.changed).not.toContain('fan-plug');
    });

    it('does nothing for a scene that does not exist', () => {
      const state = start();
      expect(reducer(state, { type: 'scene/apply', sceneId: 'nope' })).toBe(state);
    });
  });

  describe('settings', () => {
    it('changes the unit without touching any stored temperature', () => {
      const next = run(start(), { type: 'settings/set-unit', unit: 'F' });
      expect(next.settings.unit).toBe('F');
      expect(next.devices).toBe(start().devices);
      expect(device(next, 'hall-thermostat')).toMatchObject({ targetC: 20 });
    });

    it('changes each flag on its own', () => {
      const next = run(start(), { type: 'settings/set-flag', flag: 'remoteAccess', value: true });
      expect(next.settings).toEqual({ unit: 'C', alertOffline: true, remoteAccess: true });
      expect(run(next, { type: 'settings/set-flag', flag: 'alertOffline', value: false }).settings).toEqual({
        unit: 'C',
        alertOffline: false,
        remoteAccess: true,
      });
    });
  });

  it('dismisses the notice', () => {
    const added = run(start(), { type: 'device/add', draft: { name: 'A', room: 'Hall', kind: 'plug' } });
    expect(run(added, { type: 'notice/dismiss' }).notice).toBeNull();
  });

  it('throws for an action it does not know, instead of ignoring it', () => {
    expect(() => reducer(start(), { type: 'nope' } as unknown as Action)).toThrow(/Unhandled action/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/state`
Expected: FAIL, cannot resolve `./reducer`.

- [ ] **Step 3: Write the reducer**

`src/state/reducer.ts` (it is the mock backend, and says so; the `Action` union is checked with `assertNever`; an offline device cannot be controlled; applying a scene reports `changed` and `offline` devices and skips devices that are already as the scene wants them or no longer exist):

```ts
import { BRIGHTNESS, STARTING_DEVICES } from '../data/devices';
import { SCENES } from '../data/scenes';
import { DEFAULT_SETTINGS } from '../data/settings';
import { pairedMessage } from '../data/product';
import type { Device, NewDevice, SceneResult, ScenePatch, Settings, TemperatureUnit } from '../data/types';
import { TARGET_C } from '../utils/units';

// The one place state changes. Every screen reads from AppState and describes a
// change as an Action; nothing else holds app data (the form fields and which
// sheet is open are screen state, not app state).
//
// MOCK BOUNDARY: this reducer is the whole backend. Toggling a device,
// applying a scene or pairing one only edits the in-memory state below; a
// reload restores the starting data, and nothing is sent to anything. To
// connect a real hub, send the request where the action is dispatched (or in
// an effect that watches state) and keep this reducer for the optimistic
// update, so the screens do not change.

export interface AppState {
  devices: Device[];
  settings: Settings;
  /** What the last scene did, for the Scenes screen to report. */
  sceneResult: SceneResult | null;
  /** The confirmation after pairing a device, until it is dismissed. */
  notice: string | null;
  /** Numbers the ids of devices added in this session (new-1, new-2, ...). */
  nextDeviceNumber: number;
}

/**
 * Every way state can change. A discriminated union, so the switch in
 * reducer() is checked for completeness (assertNever): an action added here
 * without a case is a compile error, not a click that silently does nothing.
 */
export type Action =
  | { type: 'device/toggle'; id: string }
  | { type: 'device/set-brightness'; id: string; value: number }
  | { type: 'device/set-target'; id: string; valueC: number }
  | { type: 'device/add'; draft: NewDevice }
  | { type: 'device/remove'; id: string }
  | { type: 'scene/apply'; sceneId: string }
  | { type: 'settings/set-unit'; unit: TemperatureUnit }
  | { type: 'settings/set-flag'; flag: 'alertOffline' | 'remoteAccess'; value: boolean }
  | { type: 'notice/dismiss' };

export function createInitialState(): AppState {
  return {
    devices: STARTING_DEVICES,
    settings: DEFAULT_SETTINGS,
    sceneResult: null,
    notice: null,
    nextDeviceNumber: 1,
  };
}

function assertNever(value: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(value)}`);
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** A new device starts online, and off where it has a switch. The numbers are plain defaults. */
function createDevice(draft: NewDevice, id: string): Device {
  const base = { id, name: draft.name, room: draft.room, status: 'online' } as const;
  switch (draft.kind) {
    case 'light':
      return { ...base, kind: 'light', on: false, brightness: 70 };
    case 'plug':
      return { ...base, kind: 'plug', on: false };
    case 'thermostat':
      return { ...base, kind: 'thermostat', on: true, targetC: 20, currentC: 20 };
    case 'sensor':
      return { ...base, kind: 'sensor', readingC: 20 };
  }
}

/** Applies what a scene asks for to the fields the device's kind has. The rest of the patch is ignored. */
function applyPatch(device: Device, patch: ScenePatch): Device {
  switch (device.kind) {
    case 'light':
      return { ...device, on: patch.on ?? device.on, brightness: patch.brightness ?? device.brightness };
    case 'plug':
      return { ...device, on: patch.on ?? device.on };
    case 'thermostat':
      return { ...device, on: patch.on ?? device.on, targetC: patch.targetC ?? device.targetC };
    case 'sensor':
      return device;
  }
}

/** Devices are flat objects of primitives, so comparing every field is comparing the device. */
function sameDevice(a: Device, b: Device): boolean {
  const left: Record<string, unknown> = { ...a };
  const right: Record<string, unknown> = { ...b };
  return Object.keys(left).every((key) => left[key] === right[key]);
}

/** Replaces one device, but only if it exists and is online-ish: an offline device cannot be controlled. */
function updateControllable(state: AppState, id: string, change: (device: Device) => Device): AppState {
  const target = state.devices.find((device) => device.id === id);
  if (!target || target.status === 'offline') return state;
  const next = change(target);
  if (next === target) return state;
  return { ...state, devices: state.devices.map((device) => (device.id === id ? next : device)) };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'device/toggle':
      return updateControllable(state, action.id, (device) => (device.kind === 'sensor' ? device : { ...device, on: !device.on }));

    case 'device/set-brightness':
      return updateControllable(state, action.id, (device) =>
        device.kind === 'light' ? { ...device, brightness: clamp(action.value, BRIGHTNESS.min, BRIGHTNESS.max) } : device,
      );

    case 'device/set-target':
      return updateControllable(state, action.id, (device) =>
        device.kind === 'thermostat' ? { ...device, targetC: clamp(action.valueC, TARGET_C.min, TARGET_C.max) } : device,
      );

    case 'device/add': {
      // MOCK: nothing is paired. The form checked the pairing code and dropped it.
      const device = createDevice(action.draft, `new-${state.nextDeviceNumber}`);
      return {
        ...state,
        devices: [...state.devices, device],
        nextDeviceNumber: state.nextDeviceNumber + 1,
        notice: pairedMessage(device.name, device.room),
      };
    }

    case 'device/remove':
      return { ...state, devices: state.devices.filter((device) => device.id !== action.id) };

    case 'scene/apply': {
      // MOCK: edits the in-memory devices only. A device that no longer exists
      // is passed over; an offline one is reported, not changed.
      const scene = SCENES.find((candidate) => candidate.id === action.sceneId);
      if (!scene) return state;
      const changed: string[] = [];
      const offline: string[] = [];
      let devices = state.devices;
      for (const { deviceId, patch } of scene.changes) {
        const before = devices.find((device) => device.id === deviceId);
        if (!before) continue;
        if (before.status === 'offline') {
          offline.push(deviceId);
          continue;
        }
        const after = applyPatch(before, patch);
        if (sameDevice(before, after)) continue;
        changed.push(deviceId);
        devices = devices.map((device) => (device.id === deviceId ? after : device));
      }
      return { ...state, devices, sceneResult: { sceneId: scene.id, changed, offline } };
    }

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

- [ ] **Step 4: Run the tests, then commit**

Run: `npx vitest run src/state` (expected PASS) and `npx tsc --noEmit`.

```bash
git add src
git commit -m "feat(mobile-app): the reducer, the one place state changes" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 6: Icons, the touch-target wrapper, the status badge, the app bar and the bottom nav

**Files:**
- Create: `src/icons/index.tsx` + `.test.tsx`, `src/components/TouchRow.tsx` + `.test.tsx`, `src/components/StatusBadge.tsx` + `.test.tsx`, `src/components/AppBar.tsx` + `.test.tsx`, `src/components/BottomNav.tsx` + `.test.tsx`

- [ ] **Step 1: Write the failing tests**

`src/icons/index.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DEVICE_KINDS } from '../data/types';
import { TAB_ROUTES } from '../router/useHashRoute';
import { BackIcon, KIND_ICONS, TAB_ICONS } from './index';

describe('icons', () => {
  it('draws an aria-hidden svg for the back arrow', () => {
    const { container } = render(<BackIcon />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws an aria-hidden svg for every device kind', () => {
    expect(Object.keys(KIND_ICONS).sort()).toEqual([...DEVICE_KINDS].sort());
    for (const kind of DEVICE_KINDS) {
      const Icon = KIND_ICONS[kind];
      const { container, unmount } = render(<Icon />);
      expect(container.querySelector('svg'), `${kind} draws nothing`).toHaveAttribute('aria-hidden', 'true');
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

`src/components/TouchRow.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TouchRow } from './TouchRow';

describe('TouchRow', () => {
  it('renders its children inside the class that App.css gives each kind of control', () => {
    const { container } = render(
      <>
        <TouchRow control="switch">
          <span>a</span>
        </TouchRow>
        <TouchRow control="slider">
          <span>b</span>
        </TouchRow>
        <TouchRow control="radios">
          <span>c</span>
        </TouchRow>
      </>,
    );
    expect(screen.getByText('a').parentElement).toHaveClass('touch-switch');
    expect(screen.getByText('b').parentElement).toHaveClass('touch-slider');
    expect(screen.getByText('c').parentElement).toHaveClass('touch-radios');
    expect(container.querySelectorAll('[class^="touch-"]')).toHaveLength(3);
  });
});
```

`src/components/StatusBadge.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DEVICE_STATUSES } from '../data/types';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('says the status in words, so colour is never the only signal', () => {
    const expected = { online: 'Online', 'low-battery': 'Low battery', offline: 'Offline' };
    for (const status of DEVICE_STATUSES) {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(expected[status])).toBeInTheDocument();
      unmount();
    }
  });
});
```

`src/components/AppBar.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppBar } from './AppBar';

describe('AppBar', () => {
  it('is the page banner, with the app name and the Demo badge', () => {
    render(<AppBar />);
    const banner = screen.getByRole('banner');
    expect(banner).toHaveTextContent('Kestrel');
    expect(banner).toHaveTextContent('Demo');
  });

  it('has no Back button unless the screen was pushed', () => {
    render(<AppBar />);
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('calls onBack from its Back button', async () => {
    const onBack = vi.fn();
    render(<AppBar onBack={onBack} />);
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
```

`src/components/BottomNav.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  it('is the Main navigation, with a link to each tab in order', () => {
    render(<BottomNav route="devices" />);
    const links = screen.getAllByRole('link');
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(links.map((link) => link.textContent)).toEqual(['Devices', 'Scenes', 'Settings']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#/devices', '#/scenes', '#/settings']);
  });

  it('marks only the current tab', () => {
    render(<BottomNav route="scenes" />);
    expect(screen.getByRole('link', { name: 'Scenes' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Devices' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Settings' })).not.toHaveAttribute('aria-current');
  });

  it('marks no tab on a pushed screen', () => {
    render(<BottomNav route="add" />);
    expect(document.querySelector('[aria-current]')).toBeNull();
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/icons src/components`
Expected: FAIL, cannot resolve the components.

- [ ] **Step 3: Write the code**

`src/icons/index.tsx` (inline SVG, decorative, `Record<DeviceKind, …>` and `Record<TabRoute, …>` so a kind or a tab without a drawing is a compile error):

```tsx
import type { ReactNode } from 'react';
import type { DeviceKind } from '../data/types';
import type { TabRoute } from '../router/useHashRoute';

// Inline SVG, so the package has no image files to license or lose. Decorative:
// aria-hidden, because the text beside each icon says what it means. Colour is
// currentColor, so CSS (never the SVG) decides it.
function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
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

// Record<DeviceKind, ...> and Record<TabRoute, ...> rather than a switch: a
// kind or a tab with no drawing is a compile error instead of a blank square.
export const KIND_ICONS: Record<DeviceKind, () => ReactNode> = {
  light: () => (
    <Svg>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />
    </Svg>
  ),
  plug: () => (
    <Svg>
      <path d="M9 3v5M15 3v5" />
      <path d="M6 8h12v3a6 6 0 0 1-12 0V8Z" />
      <path d="M12 17v4" />
    </Svg>
  ),
  thermostat: () => (
    <Svg>
      <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z" />
      <path d="M12 9v7" />
    </Svg>
  ),
  sensor: () => (
    <Svg>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 7.5a6.4 6.4 0 0 1 0 9M4.5 4.5a10.6 10.6 0 0 0 0 15M19.5 4.5a10.6 10.6 0 0 1 0 15" />
    </Svg>
  ),
};

export const TAB_ICONS: Record<TabRoute, () => ReactNode> = {
  devices: () => (
    <Svg>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </Svg>
  ),
  scenes: () => (
    <Svg>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="M19 16v4M17 18h4" />
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

`src/components/TouchRow.tsx` (the touch-target wrapper: the comment is for a forker who is tempted to remove it):

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
 * option is an open feature request on patrickkuei/CyberUI, linked from the
 * README's Known limits), so the rule is a class here that stretches the part
 * of the control that takes the tap, without changing how it looks. App.css has the rules and says
 * which part of the library's markup each one relies on; re-check them when
 * you upgrade cyberui-2045 (the README's Phone checklist).
 *
 * Do not "clean this up" as an extra wrapper: removing it brings back
 * switches and sliders that are hard to hit. Button and Input are already 44px
 * or more at size md, so they do not need it.
 */
export function TouchRow({ control, children }: { control: Control; children: ReactNode }) {
  return <div className={CLASS_NAMES[control]}>{children}</div>;
}
```

`src/components/StatusBadge.tsx`:

```tsx
import { Badge } from 'cyberui-2045';
import type { DeviceStatus } from '../data/types';

// Record<DeviceStatus, ...>: a new status without a label and a colour is a
// compile error. The three colours are the library's own status colours, left
// alone by the blue accent (theme/blue.css), which is why blue was chosen.
const STATUS_VIEW: Record<DeviceStatus, { label: string; variant: 'success' | 'warning' | 'error' }> = {
  online: { label: 'Online', variant: 'success' },
  'low-battery': { label: 'Low battery', variant: 'warning' },
  offline: { label: 'Offline', variant: 'error' },
};

export function StatusBadge({ status }: { status: DeviceStatus }) {
  const { label, variant } = STATUS_VIEW[status];
  // Filled badges carry dark text (--color-inverse), 5.3:1 or better on all three.
  // shadow={false}: a flat badge is less noisy in a dense list.
  return (
    <Badge variant={variant} size="sm" shape="rounded" shadow={false}>
      {label}
    </Badge>
  );
}
```

`src/components/AppBar.tsx` (the "Demo" badge is the template's persistent signal):

```tsx
import { Badge } from 'cyberui-2045';
import { DEMO_BADGE, PRODUCT_NAME } from '../data/product';
import { BackIcon } from '../icons';

/**
 * The bar at the top of every screen: the app's name and the "Demo" badge, the
 * template's one persistent signal that nothing here is real (the full sentence
 * is in Settings and in the pairing confirmation). Pass onBack on a screen that
 * was pushed on top of another, and a Back button appears.
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

`src/components/BottomNav.tsx` (hand-built from plain links, because cyberui-2045 has no bottom navigation):

```tsx
import { ROUTE_TITLES } from '../data/product';
import { TAB_ICONS } from '../icons';
import { TAB_ROUTES, type Route } from '../router/useHashRoute';

// cyberui-2045 has no bottom navigation (its TabNavigation is a strip along the
// top; a bottom bar is an open feature request on patrickkuei/CyberUI, linked
// from the README's Known limits), so this is hand-built from plain links and
// App.css. They are real <a href="#/..."> links, so the browser's Back and
// Forward buttons, a long-press and "copy link" all work, and the current tab
// is marked with aria-current for screen readers. Three tabs, not five: more
// than that stops fitting a 320px screen with 44px targets and readable labels.
export function BottomNav({ route }: { route: Route }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TAB_ROUTES.map((tab) => {
        const Icon = TAB_ICONS[tab];
        return (
          <a key={tab} href={`#/${tab}`} className="nav-tab" aria-current={route === tab ? 'page' : undefined}>
            <Icon />
            <span>{ROUTE_TITLES[tab]}</span>
          </a>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: Run the tests, then commit**

Run: `npx vitest run src/icons src/components` (expected PASS) and `npx tsc --noEmit`.

```bash
git add src
git commit -m "feat(mobile-app): icons, the touch-target wrapper, status badge, app bar and bottom nav" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 7: The device row and the device sheet

The two components that use `Toggle`, `Slider` and `Drawer`, and so the ones that carry most of the library workarounds.

**Files:**
- Create: `src/components/DeviceRow.tsx` + `.test.tsx`, `src/components/DeviceSheet.tsx` + `.test.tsx`

- [ ] **Step 1: Write the failing tests**

`src/components/DeviceRow.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STARTING_DEVICES } from '../data/devices';
import type { Device } from '../data/types';
import { DeviceRow } from './DeviceRow';

const byId = (id: string): Device => STARTING_DEVICES.find((device) => device.id === id)!;

function setup(id: string, unit: 'C' | 'F' = 'C') {
  const onToggle = vi.fn();
  const onOpen = vi.fn();
  render(
    <ul>
      <DeviceRow device={byId(id)} unit={unit} onToggle={onToggle} onOpen={onOpen} />
    </ul>,
  );
  return { onToggle, onOpen };
}

describe('DeviceRow', () => {
  it('shows the name, the status in words and the state, with a named switch that reflects it', () => {
    setup('desk-lamp');
    const open = screen.getByRole('button', { name: /Desk lamp/ });
    expect(open).toHaveTextContent('Online');
    expect(open).toHaveTextContent('70%');
    expect(screen.getByRole('switch', { name: 'Desk lamp power' })).toBeChecked();
  });

  it('flips the switch without opening the sheet', async () => {
    const { onToggle, onOpen } = setup('desk-lamp');
    await userEvent.click(screen.getByRole('switch', { name: 'Desk lamp power' }));
    expect(onToggle).toHaveBeenCalledExactlyOnceWith('desk-lamp');
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('opens the sheet from the main button without flipping the switch', async () => {
    const { onToggle, onOpen } = setup('desk-lamp');
    await userEvent.click(screen.getByRole('button', { name: /Desk lamp/ }));
    expect(onOpen).toHaveBeenCalledExactlyOnceWith('desk-lamp');
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('disables the switch of an offline device, and says Offline', () => {
    setup('hall-light');
    expect(screen.getByRole('switch', { name: 'Hall light power' })).toBeDisabled();
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('shows a low-battery device as such', () => {
    setup('bedroom-sensor');
    expect(screen.getByText('Low battery')).toBeInTheDocument();
  });

  it('gives a sensor a reading and no switch', () => {
    setup('living-sensor');
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.getByText('21.5 °C')).toBeInTheDocument();
  });

  it('shows temperatures in the chosen unit', () => {
    setup('living-sensor', 'F');
    expect(screen.getByText('71 °F')).toBeInTheDocument();
  });
});
```

`src/components/DeviceSheet.test.tsx` (the sheet is a portal on `document.body`, found as a `dialog` named after the device; the slider is driven from the keyboard because happy-dom has no layout to drag on; Escape closes after the library's animation, so it waits):

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STARTING_DEVICES } from '../data/devices';
import type { Device, TemperatureUnit } from '../data/types';
import { DeviceSheet } from './DeviceSheet';

const byId = (id: string): Device => STARTING_DEVICES.find((device) => device.id === id)!;

function setup(id: string | undefined, unit: TemperatureUnit = 'C') {
  const dispatch = vi.fn();
  const onClose = vi.fn();
  render(<DeviceSheet device={id ? byId(id) : undefined} unit={unit} dispatch={dispatch} onClose={onClose} />);
  return { dispatch, onClose };
}

describe('DeviceSheet', () => {
  it('renders nothing while no device is open', () => {
    setup(undefined);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens as a dialog named after the device, with its own heading and no close button of the library’s', () => {
    setup('desk-lamp');
    const dialog = screen.getByRole('dialog', { name: 'Desk lamp controls' });
    expect(within(dialog).getByRole('heading', { level: 2, name: 'Desk lamp' })).toBeInTheDocument();
    expect(within(dialog).getByText('Living room')).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Close drawer' })).not.toBeInTheDocument();
  });

  it('gives a light a power switch and a brightness slider, and the slider moves by its step', async () => {
    const { dispatch } = setup('desk-lamp');
    expect(screen.getByRole('switch', { name: 'Power' })).toBeChecked();
    const slider = screen.getByRole('slider', { name: 'Brightness' });
    expect(slider).toHaveAttribute('aria-valuenow', '70');
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'device/set-brightness', id: 'desk-lamp', value: 75 });
  });

  it('flips the device from the power switch', async () => {
    const { dispatch } = setup('desk-lamp');
    await userEvent.click(screen.getByRole('switch', { name: 'Power' }));
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'device/toggle', id: 'desk-lamp' });
  });

  it('gives a plug a switch and no slider', () => {
    setup('tv-plug');
    expect(screen.getByRole('switch', { name: 'Power' })).toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('gives a thermostat a target slider in the chosen unit, and stores Celsius', async () => {
    const { dispatch } = setup('hall-thermostat', 'F');
    const slider = screen.getByRole('slider', { name: 'Target temperature' });
    expect(slider).toHaveAttribute('aria-valuenow', '68');
    expect(slider).toHaveAttribute('aria-valuemin', '50');
    expect(slider).toHaveAttribute('aria-valuemax', '86');
    expect(slider).toHaveAttribute('aria-valuetext', '68 °F');
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'device/set-target', id: 'hall-thermostat', valueC: 20.5 });
  });

  it('moves a Celsius thermostat in half degrees', async () => {
    const { dispatch } = setup('hall-thermostat', 'C');
    screen.getByRole('slider', { name: 'Target temperature' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'device/set-target', id: 'hall-thermostat', valueC: 19.5 });
  });

  it('gives a sensor only its reading', () => {
    setup('living-sensor', 'F');
    expect(screen.getByText('Reading: 71 °F')).toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('switches the controls of an offline device off, and says why', () => {
    setup('hall-light');
    expect(screen.getByRole('switch', { name: 'Power' })).toBeDisabled();
    expect(screen.getByRole('slider', { name: 'Brightness' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('This device is offline, so its controls are switched off.')).toBeInTheDocument();
  });

  it('removes the device from the Remove device button', async () => {
    const { dispatch } = setup('tv-plug');
    await userEvent.click(screen.getByRole('button', { name: 'Remove device' }));
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'device/remove', id: 'tv-plug' });
  });

  it('closes from Done', async () => {
    const { onClose } = setup('tv-plug');
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape, after the library has finished its closing animation', async () => {
    const { onClose } = setup('tv-plug');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/components/DeviceRow.test.tsx src/components/DeviceSheet.test.tsx`
Expected: FAIL, cannot resolve `./DeviceRow` and `./DeviceSheet`.

- [ ] **Step 3: Write the code**

`src/components/DeviceRow.tsx` (a main button that opens the sheet and, beside it and not inside it, a switch; a sensor shows its reading instead; an offline device's switch is disabled):

```tsx
import { Toggle } from 'cyberui-2045';
import type { Device, TemperatureUnit } from '../data/types';
import { KIND_ICONS } from '../icons';
import { describeDevice } from '../utils/describeDevice';
import { StatusBadge } from './StatusBadge';
import { TouchRow } from './TouchRow';

/** The id of a row's "open the controls" button. The Devices screen focuses it again when the sheet closes. */
export const rowButtonId = (deviceId: string) => `device-open-${deviceId}`;

interface DeviceRowProps {
  device: Device;
  unit: TemperatureUnit;
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
}

// Two separate controls side by side, never one inside the other: the main
// button opens the sheet, and the switch is a sibling, because a switch nested
// in a button is invalid and breaks both for assistive technology.
export function DeviceRow({ device, unit, onToggle, onOpen }: DeviceRowProps) {
  const Icon = KIND_ICONS[device.kind];
  return (
    <li className="device-row">
      <button type="button" id={rowButtonId(device.id)} className="device-main" aria-haspopup="dialog" onClick={() => onOpen(device.id)}>
        <span className="device-icon">
          <Icon />
        </span>
        <span className="device-text">
          <span className="device-name">{device.name}</span>
          <span className="device-meta">
            <StatusBadge status={device.status} />
            {/* A sensor's reading is shown at the right instead of a switch, so it is not repeated here. */}
            {device.kind !== 'sensor' && <span className="device-detail">{describeDevice(device, unit)}</span>}
          </span>
        </span>
      </button>
      {device.kind === 'sensor' ? (
        <span className="device-reading">{describeDevice(device, unit)}</span>
      ) : (
        <TouchRow control="switch">
          {/*
            An id and an accessible name are both needed. Toggle only connects its
            visible `label` to the switch through the id, and this row has no
            visible label, so aria-label (spread onto the input) names it; without
            either, a screen reader announces an unnamed checkbox
            (patrickkuei/CyberUI#120). role="switch" says what it does.
            An offline device cannot be controlled, so its switch is disabled.
          */}
          <Toggle
            id={`power-${device.id}`}
            aria-label={`${device.name} power`}
            role="switch"
            variant="accent"
            size="lg"
            checked={device.on}
            disabled={device.status === 'offline'}
            onChange={() => onToggle(device.id)}
          />
        </TouchRow>
      )}
    </li>
  );
}
```

`src/components/DeviceSheet.tsx` (a `Drawer side="bottom"` with no `title`, no library × button, its own heading, and the controls by kind; the long comment is the one a forker needs):

```tsx
import type { Dispatch, ReactElement } from 'react';
import { Button, Drawer, Slider, Toggle } from 'cyberui-2045';
import { BRIGHTNESS } from '../data/devices';
import type { Device, TemperatureUnit } from '../data/types';
import type { Action } from '../state/reducer';
import { describeDevice } from '../utils/describeDevice';
import { fromDisplay, sliderScale, toDisplay } from '../utils/units';
import { StatusBadge } from './StatusBadge';
import { TouchRow } from './TouchRow';

interface DeviceSheetProps {
  /** The device whose controls are open, or undefined when the sheet is closed. */
  device: Device | undefined;
  unit: TemperatureUnit;
  dispatch: Dispatch<Action>;
  onClose: () => void;
}

function PowerSwitch({ device, dispatch }: { device: Device; dispatch: Dispatch<Action> }) {
  if (device.kind === 'sensor') return null;
  return (
    <TouchRow control="switch">
      {/* Toggle needs an id for its visible label to name the switch (patrickkuei/CyberUI#120). */}
      <Toggle
        id={`sheet-power-${device.id}`}
        label="Power"
        role="switch"
        variant="accent"
        size="lg"
        checked={device.on}
        disabled={device.status === 'offline'}
        onChange={() => dispatch({ type: 'device/toggle', id: device.id })}
      />
    </TouchRow>
  );
}

// A switch over the kind rather than a Record<DeviceKind, Component>: each kind
// reads different fields, and TypeScript cannot match a component picked from a
// Record to the narrowed device it needs. The return type excludes undefined on
// purpose, so a new DeviceKind without a case is a compile error here.
function Controls({ device, unit, dispatch }: { device: Device; unit: TemperatureUnit; dispatch: Dispatch<Action> }): ReactElement | null {
  const disabled = device.status === 'offline';
  switch (device.kind) {
    case 'light':
      return (
        <>
          <PowerSwitch device={device} dispatch={dispatch} />
          <TouchRow control="slider">
            <Slider
              className="slider-control"
              label="Brightness"
              variant="accent"
              size="lg"
              min={BRIGHTNESS.min}
              max={BRIGHTNESS.max}
              step={BRIGHTNESS.step}
              value={device.brightness}
              onValueChange={(value) => dispatch({ type: 'device/set-brightness', id: device.id, value })}
              showValue
              formatValue={(value) => `${value}%`}
              disabled={disabled}
            />
          </TouchRow>
        </>
      );
    case 'plug':
      return <PowerSwitch device={device} dispatch={dispatch} />;
    case 'thermostat': {
      const scale = sliderScale(unit);
      return (
        <>
          <PowerSwitch device={device} dispatch={dispatch} />
          <TouchRow control="slider">
            <Slider
              className="slider-control"
              label="Target temperature"
              variant="accent"
              size="lg"
              min={scale.min}
              max={scale.max}
              step={scale.step}
              // Stored in Celsius; the slider works in the displayed unit (utils/units.ts).
              value={unit === 'C' ? device.targetC : Math.round(toDisplay(device.targetC, unit))}
              onValueChange={(value) => dispatch({ type: 'device/set-target', id: device.id, valueC: fromDisplay(value, unit) })}
              showValue
              formatValue={(value) => `${value} °${unit}`}
              disabled={disabled}
            />
          </TouchRow>
        </>
      );
    }
    case 'sensor':
      return <p className="sheet-reading">Reading: {describeDevice(device, unit)}</p>;
  }
}

/**
 * The device's controls in a bottom sheet. This is the template's list-action
 * pattern: every action is a visible, labelled control (nothing hides behind a
 * swipe or a hover), so a thumb, a keyboard and a screen reader all reach it.
 *
 * Drawer facts that are not in its types (cyberui-2045 2.8.0):
 * - It is only animated out by its own close button, Escape and a tap on the
 *   backdrop. Setting isOpen to false from here (the Done and Remove buttons)
 *   unmounts it at once, and no focus is restored: DevicesScreen puts focus
 *   back on the row's button itself.
 * - It is aria-modal but does not trap Tab (patrickkuei/CyberUI#123), its
 *   border animation cycles through hard-coded colours (#124) and its title is
 *   3.45:1 on its surface (#125). So: no `title` (the heading below is ours),
 *   the glow is switched off in App.css (.device-sheet), and the template does
 *   not work around the missing focus trap.
 * - Its close button is a 32px target, so showCloseButton is false and Done is
 *   the 44px way out. It sizes the panel to a fixed height by `size`; App.css
 *   lets the content decide instead.
 * - The panel is full width. App.css centres it in the app's column on wide
 *   screens and pads it for the home indicator.
 */
export function DeviceSheet({ device, unit, dispatch, onClose }: DeviceSheetProps) {
  return (
    <Drawer
      isOpen={device !== undefined}
      onClose={onClose}
      side="bottom"
      showCloseButton={false}
      ariaLabel={device ? `${device.name} controls` : 'Device controls'}
      className="device-sheet"
    >
      {device && (
        <div className="sheet">
          <div className="sheet-header">
            <h2 className="sheet-title">{device.name}</h2>
            <p className="sheet-sub">
              {device.room} <StatusBadge status={device.status} />
            </p>
          </div>
          <div className="sheet-controls">
            <Controls device={device} unit={unit} dispatch={dispatch} />
          </div>
          {device.status === 'offline' && <p className="sheet-note">This device is offline, so its controls are switched off.</p>}
          <div className="sheet-actions">
            <Button variant="danger" onClick={() => dispatch({ type: 'device/remove', id: device.id })}>
              Remove device
            </Button>
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
```

- [ ] **Step 4: Run the tests, then commit**

Run: `npx vitest run src/components` (expected PASS) and `npx tsc --noEmit`.

```bash
git add src
git commit -m "feat(mobile-app): device row and the device sheet" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 8: The four screens

**Files:**
- Create: `src/components/ScreenTitle.tsx`, `src/screens/DevicesScreen.tsx` + `.test.tsx`, `src/screens/AddDeviceScreen.tsx` + `.test.tsx`, `src/screens/ScenesScreen.tsx` + `.test.tsx`, `src/screens/SettingsScreen.tsx` + `.test.tsx`

- [ ] **Step 1: Write the failing tests**

Each screen test drives the screen over the real reducer through a tiny `Harness`, so a click is checked in the state it produces. `DevicesScreen.test.tsx` carries the `within()` scoping note for the screens, once, at its first collision (device names, "Power" and room names repeat between a row and its sheet); `App.test.tsx` has its own short one about the tab names.

`src/screens/DevicesScreen.test.tsx`:

```tsx
import { useReducer } from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STARTING_DEVICES } from '../data/devices';
import { createInitialState, reducer, type AppState } from '../state/reducer';
import { DevicesScreen } from './DevicesScreen';

function Harness({ initial = createInitialState() }: { initial?: AppState }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <DevicesScreen state={state} dispatch={dispatch} />;
}

// Reusing a component across screens repeats visible text: a device's name is in
// its row and, while its sheet is open, in the sheet; "Power" and the room names
// repeat too. Scope queries with within(...) rather than renaming anything.
const row = (name: RegExp | string) => screen.getByRole('button', { name }).closest('li')!;

describe('DevicesScreen', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('has one h1 and groups the devices under a heading per room, in room order', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { level: 1, name: 'Devices' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Living room', 'Bedroom', 'Hall']);
    const living = within(screen.getByRole('region', { name: 'Living room' }));
    expect(living.getAllByRole('listitem')).toHaveLength(STARTING_DEVICES.filter((d) => d.room === 'Living room').length);
  });

  it('shows every kind and every status without any interaction', () => {
    render(<Harness />);
    for (const status of ['Online', 'Low battery', 'Offline']) expect(screen.getAllByText(status).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('switch')).toHaveLength(STARTING_DEVICES.filter((d) => d.kind !== 'sensor').length);
  });

  it("flips only that row's switch", async () => {
    render(<Harness />);
    const lamp = screen.getByRole('switch', { name: 'Desk lamp power' });
    const plug = screen.getByRole('switch', { name: 'TV plug power' });
    expect(lamp).toBeChecked();
    await userEvent.click(lamp);
    expect(lamp).not.toBeChecked();
    expect(plug).toBeChecked();
    expect(within(row(/Desk lamp/)).getByText('Off')).toBeInTheDocument();
  });

  it('disables the switch of an offline device and gives sensors none', () => {
    render(<Harness />);
    expect(screen.getByRole('switch', { name: 'Hall light power' })).toBeDisabled();
    expect(within(row(/Living room sensor/)).queryByRole('switch')).not.toBeInTheDocument();
  });

  it('shows temperatures in Fahrenheit when the unit says so, without changing what is stored', () => {
    const initial = createInitialState();
    render(<Harness initial={{ ...initial, settings: { ...initial.settings, unit: 'F' } }} />);
    expect(within(row(/Hall thermostat/)).getByText('Target 68 °F')).toBeInTheDocument();
    expect(within(row(/Living room sensor/)).getByText('71 °F')).toBeInTheDocument();
  });

  it('goes to Add device from the Add device button, by changing the hash like a link', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
    expect(window.location.hash).toBe('#/add');
  });

  it('says so when there are no devices', () => {
    render(<Harness initial={{ ...createInitialState(), devices: [] }} />);
    expect(screen.getByText('No devices yet. Add one to get started.')).toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  describe('the device sheet', () => {
    it('opens from a row and shows that device’s controls', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: /Desk lamp/ }));
      const dialog = screen.getByRole('dialog', { name: 'Desk lamp controls' });
      expect(within(dialog).getByRole('slider', { name: 'Brightness' })).toHaveAttribute('aria-valuenow', '70');
    });

    it('changes the device behind it, and the row follows', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: /Desk lamp/ }));
      const dialog = within(screen.getByRole('dialog'));
      dialog.getByRole('slider', { name: 'Brightness' }).focus();
      await userEvent.keyboard('{ArrowRight}');
      await userEvent.click(dialog.getByRole('switch', { name: 'Power' }));
      const lampRow = within(row(/Desk lamp/));
      expect(lampRow.getByRole('switch')).not.toBeChecked();
      expect(lampRow.getByText('Off')).toBeInTheDocument();
    });

    it('closes from Done and puts focus back on the row that opened it', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: /TV plug/ }));
      await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Done' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /TV plug/ })).toHaveFocus();
    });

    it('closes on Escape', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: /TV plug/ }));
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('removes the device, closes, and moves focus to the title because its row is gone', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: /TV plug/ }));
      await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove device' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /TV plug/ })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
    });

    it('opens an offline device with its controls off', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: /Hall light/ }));
      expect(within(screen.getByRole('dialog')).getByRole('switch', { name: 'Power' })).toBeDisabled();
    });
  });
});
```

`src/screens/AddDeviceScreen.test.tsx`:

```tsx
import { useReducer } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEMO_NOTE } from '../data/product';
import { createInitialState, reducer } from '../state/reducer';
import { AddDeviceScreen } from './AddDeviceScreen';

// Renders the screen over the real reducer so a save can be checked in the state it produces.
let latest = createInitialState();
function Harness({ leave }: { leave: () => void }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  latest = state;
  return <AddDeviceScreen dispatch={dispatch} leave={leave} />;
}

const name = () => screen.getByLabelText('Device name');
const code = () => screen.getByLabelText('Pairing code');
const save = () => screen.getByRole('button', { name: 'Save device' });

describe('AddDeviceScreen', () => {
  it('has one h1 and the four fields, each with a label', () => {
    render(<Harness leave={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Add device' })).toBeInTheDocument();
    expect(name()).toBeInTheDocument();
    expect(screen.getByLabelText('Room')).toHaveValue('Living room');
    expect(screen.getByLabelText('Type')).toHaveValue('light');
    expect(code()).toHaveAttribute('autocapitalize', 'characters');
    expect(code()).toHaveAttribute('maxlength', '6');
  });

  it('lists the rooms and the kinds in the pickers', () => {
    render(<Harness leave={vi.fn()} />);
    expect(Array.from((screen.getByLabelText('Room') as HTMLSelectElement).options).map((option) => option.text)).toEqual(['Living room', 'Bedroom', 'Hall']);
    expect(Array.from((screen.getByLabelText('Type') as HTMLSelectElement).options).map((option) => option.text)).toEqual(['Light', 'Plug', 'Thermostat', 'Sensor']);
  });

  it('rejects an empty name: shows the error, links it to the field, keeps focus there and adds nothing', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(code(), 'ab12cd');
    await userEvent.click(save());
    expect(name()).toHaveAttribute('aria-invalid', 'true');
    expect(name()).toHaveAccessibleDescription('Enter a name for the device.');
    expect(name()).toHaveFocus();
    expect(leave).not.toHaveBeenCalled();
    expect(latest.devices).toHaveLength(createInitialState().devices.length);
  });

  it.each(['abc', 'abc12', 'abc12!', '      '])('rejects the pairing code %j', async (value) => {
    render(<Harness leave={vi.fn()} />);
    await userEvent.type(name(), 'Shelf lamp');
    await userEvent.type(code(), value);
    await userEvent.click(save());
    expect(code()).toHaveAccessibleDescription('Enter the 6-character pairing code: letters and numbers only.');
    expect(code()).toHaveFocus();
  });

  it('puts focus on the name when both fields are wrong, and shows both errors', async () => {
    render(<Harness leave={vi.fn()} />);
    await userEvent.click(save());
    expect(name()).toHaveFocus();
    expect(name()).toHaveAccessibleDescription('Enter a name for the device.');
    expect(code()).toHaveAccessibleDescription('Enter the 6-character pairing code: letters and numbers only.');
  });

  it('clears an error as soon as the person edits that field', async () => {
    render(<Harness leave={vi.fn()} />);
    await userEvent.click(save());
    await userEvent.type(name(), 'L');
    expect(screen.queryByText('Enter a name for the device.')).not.toBeInTheDocument();
    expect(screen.getByText('Enter the 6-character pairing code: letters and numbers only.')).toBeInTheDocument();
  });

  it('writes the pairing code in capitals', async () => {
    render(<Harness leave={vi.fn()} />);
    await userEvent.type(code(), 'ab12cd');
    expect(code()).toHaveValue('AB12CD');
  });

  it('adds the device with the chosen room and kind, tells the demo sentence, and leaves', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(name(), '  Shelf lamp ');
    await userEvent.selectOptions(screen.getByLabelText('Room'), 'Bedroom');
    await userEvent.selectOptions(screen.getByLabelText('Type'), 'plug');
    await userEvent.type(code(), 'ab12cd');
    await userEvent.click(save());
    expect(latest.devices.at(-1)).toEqual({ id: 'new-1', name: 'Shelf lamp', room: 'Bedroom', kind: 'plug', status: 'online', on: false });
    expect(latest.notice).toBe(`Added Shelf lamp to Bedroom. ${DEMO_NOTE}`);
    expect(leave).toHaveBeenCalledTimes(1);
  });

  it('leaves without adding anything from Cancel', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(name(), 'Shelf lamp');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(leave).toHaveBeenCalledTimes(1);
    expect(latest.devices).toHaveLength(createInitialState().devices.length);
  });
});
```

`src/screens/ScenesScreen.test.tsx`:

```tsx
import { useReducer } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STARTING_DEVICES } from '../data/devices';
import { createInitialState, reducer } from '../state/reducer';
import { ScenesScreen, describeSceneResult } from './ScenesScreen';

let latest = createInitialState();
function Harness() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  latest = state;
  return <ScenesScreen state={state} dispatch={dispatch} />;
}

describe('ScenesScreen', () => {
  it('has one h1 and a card with a heading and an Apply button for each scene', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { level: 1, name: 'Scenes' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Good night', 'Morning', 'Away']);
    expect(screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual(['Apply Good night', 'Apply Morning', 'Apply Away']);
  });

  it('has an empty polite status that is already in the page', () => {
    render(<Harness />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('applies a scene to the devices it lists and says which changed and which were offline', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Apply Good night' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Good night applied. Changed: Desk lamp, TV plug, Fan plug, Hall thermostat. Offline, so not changed: Hall light.',
    );
    expect(latest.devices.find((d) => d.id === 'tv-plug')).toMatchObject({ on: false });
    expect(latest.devices.find((d) => d.id === 'living-sensor')).toEqual(STARTING_DEVICES.find((d) => d.id === 'living-sensor'));
  });

  it('says so when a scene had nothing to change', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Apply Morning' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply Morning' }));
    expect(screen.getByRole('status')).toHaveTextContent('Morning applied. Nothing needed changing.');
  });
});

describe('describeSceneResult', () => {
  it('leaves out devices that no longer exist', () => {
    expect(describeSceneResult({ sceneId: 'away', changed: ['desk-lamp', 'gone'], offline: [] }, STARTING_DEVICES)).toBe('Away applied. Changed: Desk lamp.');
  });
});
```

`src/screens/SettingsScreen.test.tsx`:

```tsx
import { useReducer } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInitialState, reducer } from '../state/reducer';
import { SettingsScreen } from './SettingsScreen';

let latest = createInitialState();
function Harness() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  latest = state;
  return <SettingsScreen state={state} dispatch={dispatch} />;
}

describe('SettingsScreen', () => {
  it('has one h1 and a heading for each group', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Temperature', 'Alerts and access', 'About']);
  });

  it('offers the two units and shows the current one', () => {
    render(<Harness />);
    const group = within(screen.getByRole('group', { name: 'Temperature unit' }));
    expect(group.getByRole('radio', { name: '°C' })).toBeChecked();
    expect(group.getByRole('radio', { name: '°F' })).not.toBeChecked();
  });

  it('changes the unit in state, and only the unit', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('radio', { name: '°F' }));
    expect(latest.settings).toEqual({ unit: 'F', alertOffline: true, remoteAccess: false });
    expect(screen.getByRole('radio', { name: '°F' })).toBeChecked();
  });

  it('has a named switch for each setting, reflecting the defaults', () => {
    render(<Harness />);
    expect(screen.getByRole('switch', { name: 'Alert me when a device goes offline' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Remote access' })).not.toBeChecked();
  });

  it('flips each switch on its own', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('switch', { name: 'Remote access' }));
    expect(latest.settings).toEqual({ unit: 'C', alertOffline: true, remoteAccess: true });
    await userEvent.click(screen.getByRole('switch', { name: 'Alert me when a device goes offline' }));
    expect(latest.settings).toEqual({ unit: 'C', alertOffline: false, remoteAccess: true });
  });

  it('says in the About block that the app is a demo that controls nothing', () => {
    render(<Harness />);
    expect(screen.getByText('Template demo: Kestrel is fictional and controls nothing.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/screens`
Expected: FAIL, cannot resolve the screens.

- [ ] **Step 3: Write the code**

`src/components/ScreenTitle.tsx` (the `<h1>` that takes focus after a route change):

```tsx
/** The id App.tsx looks for to move focus after a route change. */
export const SCREEN_TITLE_ID = 'screen-title';

/**
 * The screen's <h1>. It takes focus (tabIndex -1: only code can focus it) when
 * the route changes, so a keyboard or screen-reader user starts at the top of
 * the new screen instead of on the link they pressed, which is no longer there
 * on Add device. See App.tsx.
 */
export function ScreenTitle({ children }: { children: string }) {
  return (
    <h1 id={SCREEN_TITLE_ID} className="screen-title" tabIndex={-1}>
      {children}
    </h1>
  );
}
```

`src/screens/DevicesScreen.tsx` (rooms with a heading each, the Add device button, and the sheet; which sheet is open is screen state, and focus goes back to the row, or the title if the row is gone, when the sheet closes):

```tsx
import { useEffect, useRef, useState, type Dispatch } from 'react';
import { Button, SectionTitle } from 'cyberui-2045';
import { DeviceRow, rowButtonId } from '../components/DeviceRow';
import { DeviceSheet } from '../components/DeviceSheet';
import { SCREEN_TITLE_ID, ScreenTitle } from '../components/ScreenTitle';
import { ROUTE_TITLES } from '../data/product';
import { ROOMS } from '../data/types';
import type { Action, AppState } from '../state/reducer';

interface DevicesScreenProps {
  state: AppState;
  dispatch: Dispatch<Action>;
}

export function DevicesScreen({ state, dispatch }: DevicesScreenProps) {
  // Which sheet is open is screen state, not app state: it is gone on a reload
  // and means nothing to the reducer. Looked up by id, so a removed device
  // closes its own sheet.
  const [openId, setOpenId] = useState<string | null>(null);
  const openDevice = state.devices.find((device) => device.id === openId);
  const { unit } = state.settings;

  // The sheet is a modal: when it closes, put focus back where the person was,
  // on that row's button (or on the title when the row is gone, which is what
  // Remove device does). The library only restores focus after its own close
  // paths, and only for keyboard users, so the Done and Remove buttons would
  // otherwise drop focus onto <body>.
  const openDeviceId = openDevice?.id;
  const lastOpened = useRef<string | null>(null);
  useEffect(() => {
    if (openDeviceId !== undefined) {
      lastOpened.current = openDeviceId;
      return;
    }
    if (lastOpened.current === null) return;
    const row = document.getElementById(rowButtonId(lastOpened.current));
    (row ?? document.getElementById(SCREEN_TITLE_ID))?.focus();
    lastOpened.current = null;
  }, [openDeviceId]);

  return (
    <>
      <ScreenTitle>{ROUTE_TITLES.devices}</ScreenTitle>
      {state.devices.length === 0 && <p className="empty">No devices yet. Add one to get started.</p>}
      {ROOMS.map((room) => {
        const inRoom = state.devices.filter((device) => device.room === room);
        if (inRoom.length === 0) return null;
        return (
          <section key={room} className="room" aria-label={room}>
            {/* SectionTitle renders the <h2> and cannot take an id, so the <section> is named with aria-label. */}
            <SectionTitle size="sm">{room}</SectionTitle>
            <ul className="device-list">
              {inRoom.map((device) => (
                <DeviceRow
                  key={device.id}
                  device={device}
                  unit={unit}
                  onToggle={(id) => dispatch({ type: 'device/toggle', id })}
                  onOpen={setOpenId}
                />
              ))}
            </ul>
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
        Add device
      </Button>
      <DeviceSheet device={openDevice} unit={unit} dispatch={dispatch} onClose={() => setOpenId(null)} />
    </>
  );
}
```

`src/screens/AddDeviceScreen.tsx` (a form with `noValidate`, errors tied to their fields, focus on the first invalid field, and the pairing mock boundary):

```tsx
import { useState, type ChangeEvent, type Dispatch, type FormEvent } from 'react';
import { Button, Input, Select } from 'cyberui-2045';
import { ScreenTitle } from '../components/ScreenTitle';
import { ADD_DEVICE, KIND_LABELS, ROUTE_TITLES } from '../data/product';
import { DEVICE_KINDS, ROOMS, type DeviceKind, type Room } from '../data/types';
import type { Action } from '../state/reducer';

interface AddDeviceScreenProps {
  dispatch: Dispatch<Action>;
  /** Closes this screen: Back when that is safe, otherwise Devices (router/useHashRoute.ts). */
  leave: () => void;
}

// Exactly six letters or numbers. Deliberately the only rule: nothing here can
// tell a real code from a made-up one, because nothing is paired (see onSubmit).
const CODE_PATTERN = /^[A-Za-z0-9]{6}$/;

const ROOM_OPTIONS = ROOMS.map((room) => ({ value: room, label: room }));
const KIND_OPTIONS = DEVICE_KINDS.map((kind) => ({ value: kind, label: KIND_LABELS[kind] }));

export function AddDeviceScreen({ dispatch, leave }: AddDeviceScreenProps) {
  const [name, setName] = useState('');
  const [room, setRoom] = useState<Room>(ROOMS[0]);
  const [kind, setKind] = useState<DeviceKind>(DEVICE_KINDS[0]!);
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});

  const onName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
  };
  const onCode = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value.toUpperCase());
    if (errors.code) setErrors((current) => ({ ...current, code: undefined }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found: { name?: string; code?: string } = {};
    if (name.trim() === '') found.name = ADD_DEVICE.nameError;
    if (!CODE_PATTERN.test(code)) found.code = ADD_DEVICE.codeError;
    if (found.name || found.code) {
      setErrors(found);
      // Focus goes to the first field with a problem so a screen reader reads
      // its label and the linked error together. Input does not announce a new
      // error by itself (patrickkuei/CyberUI#121; drop this if it is fixed in
      // the version you use) and does not forward a ref, so find the field by name.
      const first = found.name ? 'name' : 'code';
      (event.currentTarget.elements.namedItem(first) as HTMLInputElement | null)?.focus();
      return;
    }
    // MOCK: nothing is paired. The six characters were checked for shape and are
    // not kept or sent. A real app would pair here (a request to your hub, a
    // Bluetooth or QR flow) and dispatch 'device/add' only once that succeeds.
    dispatch({ type: 'device/add', draft: { name: name.trim(), room, kind } });
    leave();
  };

  return (
    <>
      <ScreenTitle>{ROUTE_TITLES.add}</ScreenTitle>
      {/*
        noValidate: the browser's own validation bubble would pre-empt the
        messages below, which are the ones this template words and links to
        the field. The Save row is sticky inside the form (not a fixed bar), so
        it stays reachable above the on-screen keyboard without covering a field.
      */}
      <form className="add-form" onSubmit={onSubmit} noValidate>
        <Input
          label={ADD_DEVICE.nameLabel}
          name="name"
          type="text"
          placeholder={ADD_DEVICE.namePlaceholder}
          autoComplete="off"
          enterKeyHint="next"
          maxLength={ADD_DEVICE.nameMaxLength}
          aria-required="true"
          value={name}
          onChange={onName}
          error={errors.name}
        />
        {/*
          Select is the library's native <select>, so a phone opens its own
          picker, which is what a thumb wants. variant="secondary" because
          Select's default variant glows with --color-primary (magenta) where
          Input's default uses the accent, so the two would not match.
        */}
        <Select
          label={ADD_DEVICE.roomLabel}
          name="room"
          variant="secondary"
          options={ROOM_OPTIONS}
          value={room}
          onValueChange={(value) => setRoom(value as Room)}
        />
        <Select
          label={ADD_DEVICE.kindLabel}
          name="kind"
          variant="secondary"
          options={KIND_OPTIONS}
          value={kind}
          onValueChange={(value) => setKind(value as DeviceKind)}
        />
        <Input
          label={ADD_DEVICE.codeLabel}
          name="code"
          type="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          maxLength={ADD_DEVICE.codeLength}
          aria-required="true"
          helperText={ADD_DEVICE.codeHelp}
          value={code}
          onChange={onCode}
          error={errors.code}
        />
        <div className="form-actions">
          <Button type="submit">{ADD_DEVICE.save}</Button>
          <Button type="button" variant="secondary" onClick={leave}>
            {ADD_DEVICE.cancel}
          </Button>
        </div>
      </form>
    </>
  );
}
```

`src/screens/ScenesScreen.tsx` (an always-present polite status line reports what a scene did):

```tsx
import type { Dispatch } from 'react';
import { Button, Card } from 'cyberui-2045';
import { ScreenTitle } from '../components/ScreenTitle';
import { ROUTE_TITLES } from '../data/product';
import { SCENES } from '../data/scenes';
import type { Device, SceneResult } from '../data/types';
import type { Action, AppState } from '../state/reducer';

interface ScenesScreenProps {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const names = (ids: string[], devices: Device[]) =>
  ids.flatMap((id) => devices.find((device) => device.id === id)?.name ?? []).join(', ');

/** What applying a scene did, in a sentence or two. Devices that no longer exist are left out. */
export function describeSceneResult(result: SceneResult, devices: Device[]): string {
  const sceneName = SCENES.find((scene) => scene.id === result.sceneId)?.name ?? 'Scene';
  const changed = names(result.changed, devices);
  const offline = names(result.offline, devices);
  const parts = [`${sceneName} applied.`, changed ? `Changed: ${changed}.` : 'Nothing needed changing.'];
  if (offline) parts.push(`Offline, so not changed: ${offline}.`);
  return parts.join(' ');
}

export function ScenesScreen({ state, dispatch }: ScenesScreenProps) {
  return (
    <>
      <ScreenTitle>{ROUTE_TITLES.scenes}</ScreenTitle>
      {/* role="status" is a polite live region. It must be in the page before its text changes, so it is always rendered. */}
      <p role="status" className="scene-result">
        {state.sceneResult ? describeSceneResult(state.sceneResult, state.devices) : ''}
      </p>
      <ul className="scene-list">
        {SCENES.map((scene) => (
          <li key={scene.id}>
            {/*
              Card gives its body text the magenta --color-primary and its
              children space-y margins; card-surface (App.css) resets both. A
              Card `title` would render an <h3> straight under the <h1>, so the
              heading is written out as an <h2> instead.
            */}
            <Card className="card-surface scene-card">
              <h2 className="scene-name">{scene.name}</h2>
              <p className="scene-summary">{scene.summary}</p>
              {/* MOCK: applying a scene edits the in-memory devices (state/reducer.ts). It reaches nothing real. */}
              <Button variant="secondary" aria-label={`Apply ${scene.name}`} onClick={() => dispatch({ type: 'scene/apply', sceneId: scene.id })}>
                Apply
              </Button>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
```

`src/screens/SettingsScreen.tsx`:

```tsx
import type { Dispatch } from 'react';
import { Card, Divider, RadioGroup, SectionTitle, Toggle } from 'cyberui-2045';
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

      <section className="settings-section" aria-label={SETTINGS_COPY.temperatureTitle}>
        <SectionTitle size="sm">{SETTINGS_COPY.temperatureTitle}</SectionTitle>
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

      <Divider />

      <section className="settings-section" aria-label={SETTINGS_COPY.alertsTitle}>
        <SectionTitle size="sm">{SETTINGS_COPY.alertsTitle}</SectionTitle>
        {/*
          MOCK: both switches are remembered in memory so they respond, and that
          is all. The template never asks for notification permission and never
          shows a notification; there is no remote access.
          Toggle needs an id for its visible label to name the switch
          (patrickkuei/CyberUI#120).
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

      <Divider />

      <section className="settings-section" aria-label={SETTINGS_COPY.aboutTitle}>
        <SectionTitle size="sm">{SETTINGS_COPY.aboutTitle}</SectionTitle>
        <Card className="card-surface">
          <p className="about-version">{SETTINGS_COPY.version}</p>
          <p className="about-demo">{DEMO_NOTE}</p>
        </Card>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Run the tests, then commit**

Run: `npx vitest run src/screens` (expected PASS) and `npx tsc --noEmit`.

```bash
git add src
git commit -m "feat(mobile-app): the four screens" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 9: The app shell

Wires the screens together: one reducer, the route, the skip link, the pairing notice, focus and scroll on a route change, the document title, and the bottom nav (hidden on Add device).

**Files:**
- Modify: `src/App.tsx` (replaces the placeholder), `src/App.test.tsx` (replaces the placeholder)

- [ ] **Step 1: Write the failing test**

`src/App.test.tsx` (it stubs `window.history.back` to move the hash itself, because happy-dom has no session history; and its last test walks through a switch, the sheet, pairing, a scene and both settings switches with spies on `fetch`, `Notification` and `navigator.bluetooth`):

```tsx
import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { DEMO_NOTE } from './data/product';

function goTo(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event('hashchange'));
  });
}

// The tab names are also the screens' headings and a few buttons' words, so a
// bare getByText finds several. Query by role, inside the navigation.
const nav = () => within(screen.getByRole('navigation', { name: 'Main' }));

describe('App', () => {
  afterEach(() => {
    window.location.hash = '';
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the Devices screen by default, with the three landmarks', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Devices' })).toBeInTheDocument();
    expect(nav().getByRole('link', { name: 'Devices' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows the Demo badge in the app bar on every screen', () => {
    render(<App />);
    expect(within(screen.getByRole('banner')).getByText('Demo')).toBeInTheDocument();
    goTo('#/settings');
    expect(within(screen.getByRole('banner')).getByText('Demo')).toBeInTheDocument();
  });

  it('has exactly one h1 on every screen, and headings never skip a level', () => {
    render(<App />);
    for (const hash of ['#/devices', '#/scenes', '#/settings', '#/add']) {
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

  it('falls back to Devices for an unknown hash', () => {
    window.location.hash = '#/nope';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Devices' })).toBeInTheDocument();
  });

  it('moves between the tabs through real links, marking the current one', async () => {
    render(<App />);
    await userEvent.click(nav().getByRole('link', { name: 'Scenes' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Scenes' })).toBeInTheDocument();
    expect(nav().getByRole('link', { name: 'Scenes' })).toHaveAttribute('aria-current', 'page');
    expect(nav().getByRole('link', { name: 'Devices' })).not.toHaveAttribute('aria-current');
    await userEvent.click(nav().getByRole('link', { name: 'Settings' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
  });

  it('keeps the document title in step with the route', () => {
    render(<App />);
    expect(document.title).toBe('Devices — Kestrel');
    goTo('#/scenes');
    expect(document.title).toBe('Scenes — Kestrel');
  });

  it('moves focus to the new screen’s title on a route change, but not on first load', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveFocus();
    goTo('#/settings');
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toHaveFocus();
  });

  it('scrolls to the top on a route change', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<App />);
    expect(scrollTo).not.toHaveBeenCalled();
    goTo('#/scenes');
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('skips to the main content without touching location.hash', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('link', { name: 'Skip to main content' }));
    expect(screen.getByRole('main')).toHaveFocus();
    expect(window.location.hash).toBe('');
  });

  describe('Add device, pushed on top of Devices', () => {
    it('hides the bottom nav and shows a Back button', async () => {
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      expect(await screen.findByRole('heading', { level: 1, name: 'Add device' })).toBeInTheDocument();
      expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });

    it('goes back to Devices from Back and from Cancel, without adding anything', async () => {
      // happy-dom does not run a real session history, so Back is done by hand.
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      await screen.findByRole('heading', { level: 1, name: 'Add device' });
      await userEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(await screen.findByRole('heading', { level: 1, name: 'Devices' })).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      await screen.findByRole('heading', { level: 1, name: 'Add device' });
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(await screen.findByRole('heading', { level: 1, name: 'Devices' })).toBeInTheDocument();
      expect(screen.queryByText(/Shelf lamp/)).not.toBeInTheDocument();
    });

    it('pairs a device: it appears in its room and the confirmation names the demo', async () => {
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      await screen.findByRole('heading', { level: 1, name: 'Add device' });
      await userEvent.type(screen.getByLabelText('Device name'), 'Shelf lamp');
      await userEvent.selectOptions(screen.getByLabelText('Room'), 'Bedroom');
      await userEvent.type(screen.getByLabelText('Pairing code'), 'ab12cd');
      await userEvent.click(screen.getByRole('button', { name: 'Save device' }));

      expect(await screen.findByRole('heading', { level: 1, name: 'Devices' })).toBeInTheDocument();
      const bedroom = within(screen.getByRole('region', { name: 'Bedroom' }));
      expect(bedroom.getByRole('button', { name: /Shelf lamp/ })).toBeInTheDocument();
      expect(screen.getByRole('status', { name: '' })).toHaveTextContent(`Added Shelf lamp to Bedroom. ${DEMO_NOTE}`);
    });

    it('lets the person dismiss the confirmation', async () => {
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      await screen.findByRole('heading', { level: 1, name: 'Add device' });
      await userEvent.type(screen.getByLabelText('Device name'), 'Shelf lamp');
      await userEvent.type(screen.getByLabelText('Pairing code'), 'ab12cd');
      await userEvent.click(screen.getByRole('button', { name: 'Save device' }));
      await screen.findByRole('heading', { level: 1, name: 'Devices' });
      await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(screen.queryByText(/Template demo/)).not.toBeInTheDocument();
    });

    it('opened directly at #/add, Cancel replaces the entry with Devices instead of going Back out of the app', async () => {
      window.location.hash = '#/add';
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(back).not.toHaveBeenCalled();
      expect(await screen.findByRole('heading', { level: 1, name: 'Devices' })).toBeInTheDocument();
    });
  });

  describe('state is shared between screens', () => {
    it('shows a unit change on Devices', async () => {
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Settings' }));
      await userEvent.click(await screen.findByRole('radio', { name: '°F' }));
      await userEvent.click(nav().getByRole('link', { name: 'Devices' }));
      await screen.findByRole('heading', { level: 1, name: 'Devices' });
      expect(screen.getByText('Target 68 °F')).toBeInTheDocument();
    });

    it('shows a scene on Devices', async () => {
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Scenes' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Apply Good night' }));
      await userEvent.click(nav().getByRole('link', { name: 'Devices' }));
      await screen.findByRole('heading', { level: 1, name: 'Devices' });
      expect(screen.getByRole('switch', { name: 'Desk lamp power' })).not.toBeChecked();
      expect(screen.getByRole('switch', { name: 'Fan plug power' })).toBeChecked();
    });
  });

  describe('is a demo that controls nothing', () => {
    it('says so in Settings', async () => {
      render(<App />);
      goTo('#/settings');
      expect(screen.getByText(DEMO_NOTE)).toBeInTheDocument();
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
      await userEvent.click(screen.getByRole('button', { name: /TV plug/ }));
      await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Done' }));
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      await screen.findByRole('heading', { level: 1, name: 'Add device' });
      await userEvent.type(screen.getByLabelText('Device name'), 'Shelf lamp');
      await userEvent.type(screen.getByLabelText('Pairing code'), 'ab12cd');
      await userEvent.click(screen.getByRole('button', { name: 'Save device' }));
      await screen.findByRole('heading', { level: 1, name: 'Devices' });
      await userEvent.click(nav().getByRole('link', { name: 'Scenes' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Apply Away' }));
      await userEvent.click(nav().getByRole('link', { name: 'Settings' }));
      await userEvent.click(await screen.findByRole('switch', { name: 'Alert me when a device goes offline' }));
      await userEvent.click(screen.getByRole('switch', { name: 'Remote access' }));

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(notificationSpy).not.toHaveBeenCalled();
      expect(bluetoothRead).not.toHaveBeenCalled();
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      Reflect.deleteProperty(navigator, 'bluetooth');
    });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL (the placeholder `App` has no banner, nav or screens).

- [ ] **Step 3: Write the app shell**

`src/App.tsx`:

```tsx
import { useEffect, useReducer, useRef, type MouseEvent, type ReactNode } from 'react';
import { Button } from 'cyberui-2045';
import { AppBar } from './components/AppBar';
import { BottomNav } from './components/BottomNav';
import { SCREEN_TITLE_ID } from './components/ScreenTitle';
import { PRODUCT_NAME, ROUTE_TITLES } from './data/product';
import { useHashRoute, type Route } from './router/useHashRoute';
import { AddDeviceScreen } from './screens/AddDeviceScreen';
import { DevicesScreen } from './screens/DevicesScreen';
import { ScenesScreen } from './screens/ScenesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { createInitialState, reducer } from './state/reducer';
import './App.css';

export default function App() {
  // The only state in the app. Screens read it and describe changes as actions
  // (state/reducer.ts); a reload restores the starting data, nothing is saved.
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const { route, leaveAdd } = useHashRoute();

  // On a route change: keep the document title in step, scroll to the top (one
  // document holds every screen, so the old scroll position would carry over),
  // and move focus to the new screen's <h1>. Without that a keyboard or
  // screen-reader user is left on the tab they pressed, or on a Back button
  // that no longer exists. Not on first load, where the browser's own focus
  // handling is right (and StrictMode runs effects twice in development, which
  // the ref also absorbs).
  const shownRoute = useRef<Route>(route);
  useEffect(() => {
    document.title = `${ROUTE_TITLES[route]} — ${PRODUCT_NAME}`;
    if (shownRoute.current === route) return;
    shownRoute.current = route;
    window.scrollTo(0, 0);
    document.getElementById(SCREEN_TITLE_ID)?.focus({ preventScroll: true });
  }, [route]);

  // The skip link would normally be href="#main", but following it would write
  // location.hash, and every unknown hash falls back to Devices. Focusing <main> does the same job.
  const skipToMain = (event: MouseEvent) => {
    event.preventDefault();
    document.getElementById('main')?.focus();
  };

  // Record<Route, ...> (like ROUTE_TITLES in data/product.ts) makes adding a
  // route without a screen a type error, instead of a blank <main>. ROUTES in
  // router/useHashRoute.ts is the one list to start from.
  const screens: Record<Route, () => ReactNode> = {
    devices: () => <DevicesScreen state={state} dispatch={dispatch} />,
    scenes: () => <ScenesScreen state={state} dispatch={dispatch} />,
    settings: () => <SettingsScreen state={state} dispatch={dispatch} />,
    add: () => <AddDeviceScreen dispatch={dispatch} leave={leaveAdd} />,
  };

  return (
    <div className="app">
      <a className="skip-link" href="#main" onClick={skipToMain}>
        Skip to main content
      </a>
      <AppBar onBack={route === 'add' ? leaveAdd : undefined} />
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
      {/* Add device hides the nav: a form with the on-screen keyboard open should not carry a bar under its fields. */}
      {route !== 'add' && <BottomNav route={route} />}
    </div>
  );
}
```

- [ ] **Step 4: Run the whole suite, then commit**

Run: `npx vitest run` and `npx tsc --noEmit`.
Expected: PASS, no `act` warnings. (`noInlineStyles` now scans more than 10 `.tsx` files.)

```bash
git add src
git commit -m "feat(mobile-app): the app shell, route focus and the pairing notice" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 10: The stylesheet, and the tests that guard the phone rules and that nothing is sent or saved

**Files:**
- Modify: `src/App.css` (replace the Task 3 block with the complete stylesheet)
- Create: `src/phoneRules.test.ts`, `src/noNetworkOrStorage.test.ts`

- [ ] **Step 1: Write the failing tests**

`src/phoneRules.test.ts` reads `App.css` and `index.html` from disk (like the hex test) and fails when a phone rule is deleted: every `:hover` inside `@media (hover: hover)`, the `--touch` token and the `min-height: var(--touch)` / `touch-action: none` rules, the focus ring on the switch track, `100vh` then `100dvh`, `env(safe-area-inset-*)` on the app bar, bottom nav, Save row, sheet and shell, the sheet's `animation: none`, transitions only under `prefers-reduced-motion: no-preference`, and `viewport-fit=cover`. It proves a rule is still written down, not that it works (that is the browser check):

```ts
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
```

`src/noNetworkOrStorage.test.ts` scans the non-test source (comments stripped) for `fetch(`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, Bluetooth, the Notification API, service workers, `localStorage`, `sessionStorage`, `indexedDB` and `document.cookie`:

```ts
import { describe, it, expect } from 'vitest';

// Nothing in this template is sent or saved, and this test is what keeps that
// true when someone edits it. App.test.tsx checks that using the app never
// reaches fetch, Bluetooth or notifications; this one reads the source, so it
// also catches code that no test happens to run. It looks at source files, not
// a built bundle, and strips comments first (the mock-boundary comments
// quote the calls a real app would make). Put your real hub or backend code
// somewhere this test does not look, or delete the names you now need from
// FORBIDDEN, on purpose.
const sources = import.meta.glob('./**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const FORBIDDEN: [name: string, pattern: RegExp][] = [
  ['fetch', /\bfetch\s*\(/],
  ['XMLHttpRequest', /\bXMLHttpRequest\b/],
  ['WebSocket', /\bWebSocket\b/],
  ['EventSource', /\bEventSource\b/],
  ['sendBeacon', /\bsendBeacon\b/],
  ['Bluetooth', /\bbluetooth\b/i],
  ['the Notification API', /\bNotification\b/],
  ['a service worker', /\bserviceWorker\b/],
  ['localStorage', /\blocalStorage\b/],
  ['sessionStorage', /\bsessionStorage\b/],
  ['indexedDB', /\bindexedDB\b/],
  ['cookies', /\bdocument\.cookie\b/],
];

const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

export function forbiddenIn(code: string): string[] {
  const stripped = stripComments(code);
  return FORBIDDEN.filter(([, pattern]) => pattern.test(stripped)).map(([name]) => name);
}

describe('forbiddenIn', () => {
  it('finds each forbidden call', () => {
    expect(forbiddenIn("await fetch('/api')")).toEqual(['fetch']);
    expect(forbiddenIn('navigator.bluetooth.requestDevice()')).toEqual(['Bluetooth']);
    expect(forbiddenIn("new Notification('hi')")).toEqual(['the Notification API']);
    expect(forbiddenIn("localStorage.setItem('a', 'b')")).toEqual(['localStorage']);
  });

  it('ignores comments that merely mention them', () => {
    expect(forbiddenIn("// await fetch('/api/pair')\nconst a = 1;")).toEqual([]);
    expect(forbiddenIn('/* navigator.bluetooth */ const a = 1;')).toEqual([]);
  });
});

describe('nothing is sent or saved', () => {
  it('finds the source files it is meant to scan', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(20);
  });

  it('has no network, Bluetooth, notification or storage code in the app', () => {
    const offenders = Object.entries(sources)
      .filter(([file]) => !/\.test\.tsx?$/.test(file))
      .map(([file, code]) => [file, forbiddenIn(code)] as const)
      .filter(([, found]) => found.length > 0);
    expect(offenders).toEqual([]);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/phoneRules.test.ts src/noNetworkOrStorage.test.ts`
Expected: `phoneRules` FAILS on the rules the Task 3 stub lacks (the hover block, the touch rules, the switch focus ring, `dvh`, the safe areas and the sheet's `animation: none`) and already passes the motion and `viewport-fit` checks; `noNetworkOrStorage` PASSES already (nothing in the source uses those APIs), which is why Step 4 proves it can fail.

- [ ] **Step 3: Write the stylesheet**

Replace `src/App.css` with this file. Read the comments: each phone rule has its reason there. The `.touch-*` rules and the switch focus ring rely on the library's markup (Review Focus 5); the `.device-sheet` block is the #124 workaround plus the bottom-sheet sizing the library lacks.

`src/App.css`:

```css
/* Kestrel styles. Colours come only from tokens (var(--color-*)); the one place
   a hex colour is allowed is theme/blue.css (noHexColors.test.ts). Class names
   are flat, not nested under .app, because the device sheet is rendered by the
   library in a portal outside the app's root element.

   The phone rules live in this file, each with its reason, and
   phoneRules.test.ts guards the ones a tidy-up would break:
     - Touch targets (44px)   see "Touch targets"
     - Safe areas and dvh     see ".app", ".app-bar", ".bottom-nav", ".device-sheet"
     - No sticky hover        every :hover is inside @media (hover: hover)
     - Reduced motion         the only transitions are under no-preference */

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
   the page is scrolled. cyberui-2045 2.8.0 uses no dvh/svh anywhere. 100vh is
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

/* Hidden until it takes focus, then the first thing a keyboard visitor sees. */
.skip-link {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 100;
  padding: 0.5rem 1rem;
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
   title) take focus without drawing one. */
:where(.app-bar-back, .device-main, .nav-tab):focus-visible {
  outline: 2px solid var(--color-secondary);
  outline-offset: 2px;
}

.screen:focus,
.screen-title:focus {
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
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-secondary);
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

/* ---- Notice (after pairing a device) ---- */

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
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-secondary);
}

.empty {
  margin: 0;
  color: var(--color-muted);
}

.full-width {
  width: 100%;
}

/* Card gives its body text the magenta --color-primary and its children
   space-y margins. Cards in this app reset both: text is the default colour,
   the surface is --color-surface, and spacing is each card's own gap. */
.card-surface {
  background-color: var(--color-surface);
  color: var(--color-default);
}

.card-surface > * {
  margin: 0;
}

/* ---- Devices ---- */

.room {
  display: flex;
  flex-direction: column;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.device-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border-default);
  border-radius: 0.75rem;
}

.device-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  min-height: 4rem;
  padding: 0.5rem 0.75rem;
  font: inherit;
  color: inherit;
  text-align: left;
  background: none;
  border: 0;
  border-radius: 0.75rem 0 0 0.75rem;
  cursor: pointer;
}

.device-icon {
  display: inline-flex;
  flex: none;
  color: var(--color-secondary);
}

.device-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.device-name {
  font-weight: 600;
  overflow-wrap: anywhere;
}

.device-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.device-reading {
  padding-inline: 1rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.device-row .touch-switch {
  padding-inline: 0.25rem 0.75rem;
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

/* Toggle draws no focus indicator: its focus classes set a ring colour but never
   a ring width, so a keyboard user cannot see which switch has focus. The real
   <input> is visually hidden and the track is the element right after it, so the
   ring is drawn there (see the README's Known limits). */
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
   stops a finger that starts on the slider from scrolling the sheet or page
   instead of dragging: the library sets no touch-action of its own, so it is
   the template's job. The padding keeps the widened areas inside the wrapper. */
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

/* ---- Device sheet (cyberui-2045 Drawer, side="bottom") ----
   Drawer sizes the panel to a fixed height by `size`; this lets the content
   decide, up to the screen, and the content scrolls past that. It is full
   width by default, so it is held to the app's column and centred on wide
   screens (fixed + left/right 0 + max-width + auto margins). The bottom padding
   keeps the buttons clear of the home indicator (the library adds none).
   Last, the border glow: Drawer animates its border through hard-coded colours
   (magenta, cyan, green) and ignores the accent (patrickkuei/CyberUI#124), which
   on a sheet this large would flash on a blue app. These three lines, which
   beat the library's layered CSS, hold it at the steady accent border the
   library itself uses under prefers-reduced-motion. */
.device-sheet {
  height: auto;
  max-height: calc(100vh - 1rem);
  max-height: calc(100dvh - 1rem);
  max-width: var(--app-max);
  margin-inline: auto;
  padding-bottom: env(safe-area-inset-bottom);
  border-radius: 1rem 1rem 0 0;
  animation: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 12px var(--color-accent);
}

.sheet {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* The library's own Drawer title is 3.45:1 on its surface (patrickkuei/CyberUI#125), so the sheet draws its own heading in the default text colour. */
.sheet-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-default);
}

.sheet-sub {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.25rem 0 0;
  color: var(--color-muted);
}

.sheet-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sheet-reading,
.sheet-note {
  margin: 0;
  color: var(--color-muted);
}

.sheet-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sheet-actions > * {
  width: 100%;
}

/* ---- Add device ---- */

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

/* ---- Scenes ---- */

.scene-result {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.4;
}

.scene-result:not(:empty) {
  padding: 0.75rem 1rem;
  background: var(--color-surface);
  border-left: 4px solid var(--color-secondary);
  border-radius: 0.5rem;
}

.scene-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.scene-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.scene-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-secondary);
}

.scene-summary {
  color: var(--color-muted);
}

/* ---- Settings ---- */

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.about-version {
  font-weight: 600;
}

.about-demo {
  color: var(--color-muted);
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
.device-main:active {
  background-color: color-mix(in srgb, var(--color-accent) 16%, transparent);
}

/* Hover only where a pointer can hover: after a tap on a touch screen :hover
   sticks to the last thing touched. Hover never carries meaning here, it only
   decorates. */
@media (hover: hover) {
  .nav-tab:hover,
  .device-main:hover,
  .app-bar-back:hover {
    background-color: color-mix(in srgb, var(--color-accent) 10%, transparent);
  }
}

/* No animation at all for people who ask for none. */
@media (prefers-reduced-motion: no-preference) {
  .nav-tab,
  .device-main,
  .app-bar-back {
    transition: background-color 150ms ease-out, color 150ms ease-out;
  }
}
```

- [ ] **Step 4: Run the tests, prove the guards can fail, and look at it**

Run: `npx vitest run` (expected PASS, 154 tests in 23 files by now) and `npx tsc --noEmit`.

Prove each guard can fail (do not commit the broken state): (a) put `fetch('/x')` in `src/data/settings.ts` and run `npx vitest run src/noNetworkOrStorage.test.ts` (expected FAIL naming `src/data/settings.ts`); (b) delete `touch-action: none;` from `.touch-slider` and run `src/phoneRules.test.ts` (expected FAIL); (c) add `.nav-tab:hover { color: red; }` outside the media block (expected FAIL). Restore each.

Then run `pnpm --filter mobile-app-template dev` and open the printed address in a browser narrowed to about 390px. You should see the app bar, the Devices list in three rooms with blue switches and a Demo badge, and the bottom nav. The proper check is Task 13.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat(mobile-app): the stylesheet, and tests that guard the phone rules and that nothing is sent or saved" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 11: The README (the forker's documentation)

The README is the only documentation that travels with a fork (repo `CLAUDE.md`). It is in landing's shape and honesty standard.

**Files:**
- Create: `packages/mobile-app/README.md`

- [ ] **Step 1: Write the README**

Sections, in order: what it is and what is mock (the Real/Mock/Images lists); the three commands; **Re-theming**; **Where your data goes** (the four data files, the reducer as the mock backend, where pairing goes, how to add a screen or a device kind, the `index.html` tags, two deliberate behaviours); **Phone checklist** (each rule, where it lives, how to check it, and what was not checked); **Known limits** (the library issues, which Task 14 completes with the numbers of the issues it files); **Principles this code follows** (the table the Code tab in Task 18 mirrors). Every principle must be true of the shipped code and every link must resolve; Step 2 checks the links, and Task 13 re-checks the "measured in" sentence against your own run.

`README.md`:

````markdown
# Kestrel mobile app (template)

A phone-first home device controller (a list of devices with a switch on each row, a bottom sheet of controls, one-tap scenes, a pairing form and a few settings) built with [cyberui-2045](https://www.npmjs.com/package/cyberui-2045). Kestrel is a fictional hub: swap in your own app by editing the files in `src/data/`.

**Nothing here is connected to anything: no device is controlled, nothing is paired, nothing is sent or saved.** The app says so with a small "Demo" badge in the app bar, in Settings, and in the confirmation shown after you pair a device ("Template demo: Kestrel is fictional and controls nothing."). Delete those when you make the app real.

- **Real:** the bottom navigation and the hash routes (Back closes Add device), every switch and slider (they change the in-memory state, and the rows follow), the temperature unit (Celsius is stored, Fahrenheit is only how it is shown), applying a scene (it changes several devices and says which), removing a device, and the pairing form's own validation (a name is required and the code must be six letters or numbers).
- **Mock:** the devices, their status (online, low battery and offline are fixed, nothing is detected), pairing (any six letters or numbers are accepted and dropped), the two settings switches ("Alert me when a device goes offline" and "Remote access" are remembered in memory; no notification is ever scheduled or requested), and all the names and readings. A reload puts the starting data back.
- **Images:** none. The visuals are cyberui-2045 components, CSS and inline SVG, so the package has no image files to replace or license.

```bash
npm install && npm run dev   # start the dev server
npm run build                # type-check and build to dist/
npm test                     # run the test suite
```

Requires Node 20.19 or newer. On a phone, open the dev server's address (`npm run dev -- --host`) or the built page; a desktop browser with its device toolbar is fine for the layout.

## Re-theming

The blue accent is two color tokens in [src/theme/blue.css](src/theme/blue.css), imported right after the library's stylesheet in [src/main.tsx](src/main.tsx). cyberui-2045's components read those tokens, so changing the two values re-themes the whole app. `--color-primary` (magenta) is left alone on purpose. The app shows device status in the library's own green, amber and red, so keep your accent clear of those; the file's comment has the contrast numbers for this blue (check 4.5:1 on both `--color-base` and `--color-surface` when you pick another). Two library quirks to know when you add components: `Card` gives its body text the magenta primary color (the `card-surface` class in [src/App.css](src/App.css) resets it), and `Select`'s default variant glows magenta where `Input`'s uses the accent (this app uses `variant="secondary"` on `Select`).

## Where your data goes

Everything the app says that is not a device comes from files you can edit without touching a component:

- [src/data/devices.ts](src/data/devices.ts): the starting devices, each with a room, a kind (`light`, `plug`, `thermostat` or `sensor`) and a status.
- [src/data/scenes.ts](src/data/scenes.ts): the three scenes, each a list of changes by device id.
- [src/data/settings.ts](src/data/settings.ts): the settings' defaults.
- [src/data/product.ts](src/data/product.ts): the app's name, the screen titles, the form's words and the demo sentence.

State is one `useReducer` in [src/App.tsx](src/App.tsx), and [src/state/reducer.ts](src/state/reducer.ts) is the only place it changes: every change is an `Action` in a union, so an action without a case is a compile error. That reducer is the whole mock backend. To connect a real hub, send the request where the action is dispatched (or in an effect that watches the state) and keep the reducer for the instant update. Pairing is in [src/screens/AddDeviceScreen.tsx](src/screens/AddDeviceScreen.tsx): the comment in `onSubmit` says where your pairing request goes, and the device should be added only once it succeeds. To add a screen, add its id to `ROUTES` in [src/router/useHashRoute.ts](src/router/useHashRoute.ts): the compiler then lists what is still missing (a screen in `src/App.tsx` and a title in `src/data/product.ts`). A new device kind is the same: add it to `KindFields` in [src/data/types.ts](src/data/types.ts) and the compiler lists its icon, label and sheet controls.

Before you publish, replace the title, description and theme colour in [index.html](index.html). They describe the fictional product, and link previews read them, not your React code.

Two things that are deliberate and easy to trip over. Routes are hash routes (`#/scenes`), so the app works on any static host and inside an iframe, and the browser's Back button closes Add device instead of leaving the app. And pressing Escape closes the device sheet; if you embed this app in a page that also closes on Escape, both close.

## Phone checklist

The rules this template follows, where each lives, and how to check it. Layout cannot be tested without a browser, so most of these are checked by looking.

| Rule | Where it is | How to check it |
|---|---|---|
| Touch targets of at least 44 by 44 CSS pixels | `--touch` and the `.touch-*` rules in [src/App.css](src/App.css); [src/components/TouchRow.tsx](src/components/TouchRow.tsx) explains why (cyberui-2045's `Toggle`, `Checkbox`, `RadioGroup` rows and `Slider` are smaller than 44px as shipped) | In the browser's inspector, hover each switch, slider and nav tab and read its size; [src/phoneRules.test.ts](src/phoneRules.test.ts) fails if a rule is deleted |
| Safe-area insets | `viewport-fit=cover` in [index.html](index.html); `env(safe-area-inset-*)` on the app bar, bottom nav, Save row and device sheet in [src/App.css](src/App.css). The library adds none | A phone with a notch or home indicator, or your browser's device emulation with safe areas; a desktop window always reads 0 |
| `dvh`, not `vh` | `.app` in [src/App.css](src/App.css), with a `vh` fallback written first | Scroll a phone's browser so its toolbar collapses; the bottom nav must stay on screen |
| No hover-only controls, no sticky hover | Every `:hover` in [src/App.css](src/App.css) is inside `@media (hover: hover)`; every action is a visible control | Emulate touch and tap a row; nothing may stay highlighted |
| Reduced motion | The only transitions are under `prefers-reduced-motion: no-preference`; the library's Drawer honours the setting itself | Turn on "reduce motion" in the system or the browser's rendering tools |
| The on-screen keyboard | The form's fields are 16px (iOS does not zoom them), use `autoCapitalize`/`autoComplete` and `enterKeyHint`, and the Save row is sticky inside the form rather than a fixed bar | Focus a field on a real phone and check Save stays reachable |
| No sideways scroll | One column, `max-width: 30rem`, centred on wide screens | Compare `document.documentElement.scrollWidth` with the window width at 320, 390 and 800px |

It was measured in desktop Chromium (Microsoft Edge) with device emulation: viewports of 320, 390 and 800px, touch input, safe-area insets and reduced motion. **Not checked:** a real phone, iOS Safari and other WebKit or Firefox browsers, the on-screen keyboard resizing the page, a screen reader, and how a real notch or home indicator looks. Do those before you rely on them.

## Known limits (cyberui-2045 2.8.0)

These are in the library, not in this template, and the template does not work around them silently. Where one is filed upstream it is listed with its issue on [patrickkuei/CyberUI](https://github.com/patrickkuei/CyberUI/issues).

- **The device sheet is a `Drawer`, which does not trap Tab** although it is `aria-modal`: Tab can move into the page behind it. Escape and Done still work. (CyberUI#123)
- **The Drawer's border animation cycles through hard-coded colors** and ignores the accent; `.device-sheet` in [src/App.css](src/App.css) holds it at a steady accent border instead. (CyberUI#124)
- **The Drawer's own title is 3.45:1 on its surface**, so the sheet writes its own heading and passes no `title`. (CyberUI#125)
- **`Toggle` has no accessible name unless it has an `id`** (for its visible label) or an `aria-label`; every switch here has both. (CyberUI#120)
- **`Input` does not announce a new error**, so a failed Save moves focus to the first field with a problem. (CyberUI#121)
- **`Toggle` draws no keyboard focus indicator** (its focus classes set a ring color but never a width), so `.touch-switch input:focus-visible + div` in [src/App.css](src/App.css) draws one.
- **`Slider` sets no `touch-action`**, so a touch drag that drifts a little up or down inside something that can scroll (the device sheet on a short screen) is cancelled by the browser part-way; the `.touch-slider` wrapper in [src/App.css](src/App.css) sets `touch-action: none`.
- **There is no bottom navigation, no safe-area or `dvh` support, no way to make `Toggle`, `Checkbox` or `Slider` touch-sized, and no swipeable row**, so this template hand-builds the first, writes the safe-area and `dvh` rules itself, wraps the small controls in `TouchRow`, and uses a bottom sheet instead of swipe. These are filed upstream as feature requests.
- **The `Remove device` button is the library's `danger` variant**, whose red text is 4.13:1 on the sheet's surface (it is 18px bold, which is not "large text" for the WCAG 3:1 allowance).

## Principles this code follows

| Principle | Where to see it |
|---|---|
| **Single source of truth** | The list of screens is `ROUTES` in [src/router/useHashRoute.ts](src/router/useHashRoute.ts), and all app state changes in one reducer, [src/state/reducer.ts](src/state/reducer.ts). The device list, scenes and words live in [src/data/](src/data/). |
| **Typed and exhaustive** | `Route` is derived from `ROUTES`, and `Record<Route, …>` maps in [src/App.tsx](src/App.tsx) and [src/data/product.ts](src/data/product.ts) turn "added a screen but forgot its page or title" into a compile error. The reducer's `Action` union is checked with `assertNever`, and icons, labels and status badges are `Record<DeviceKind, …>` or `Record<DeviceStatus, …>`. |
| **No inline styles, no stray colors** | All styling is in CSS classes. [src/noInlineStyles.test.ts](src/noInlineStyles.test.ts) fails if a `style={...}` prop appears, and [src/noHexColors.test.ts](src/noHexColors.test.ts) fails if any stylesheet other than `blue.css` contains a hex color. |
| **Nothing sent, nothing saved** | [src/noNetworkOrStorage.test.ts](src/noNetworkOrStorage.test.ts) fails if the source gains a network, Bluetooth, notification or storage call, and [src/App.test.tsx](src/App.test.tsx) checks that using the app never reaches `fetch`, Bluetooth or notifications. |
| **Phone rules in one place** | The touch-target, safe-area, `dvh`, hover and motion rules are in [src/App.css](src/App.css), each with its reason, and [src/phoneRules.test.ts](src/phoneRules.test.ts) fails when one is deleted. |
| **Tested** | A test file sits next to each screen, component, data file and helper, covering behavior (pairing and its validation, the device sheet, scenes, the unit change, the routes and focus) rather than markup. The exceptions are `src/main.tsx` and the stylesheets. |
````

- [ ] **Step 2: Check every link and every claim**

```bash
# from packages/mobile-app
for f in $(grep -o '](\([^)#]*\))' README.md | sed 's/](//;s/)//' | grep -v '^http'); do [ -e "$f" ] || echo "MISSING LINK TARGET: $f"; done
```

Expected: no output. Then read each row of the Principles table and each bullet of Known limits against the code and fix the README (not the code) if a row is not true. In particular: `ROUTES` is in `src/router/useHashRoute.ts`; the two `Record<Route, …>` maps are in `src/App.tsx` and `src/data/product.ts`; `assertNever` is in `src/state/reducer.ts`; the hover, touch, safe-area and motion rules are in `src/App.css` and guarded by `src/phoneRules.test.ts`.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(mobile-app): README for people who fork the template" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 12: The standalone check (clean room), and mutation-testing the tests

Prove a fork works with nothing from the monorepo (monitoring plan Task 9's method), on the npm a forker is likely to have, and prove the tests can fail.

**Files:** none (all work in a temporary directory outside the repo; keep the helper scripts outside the package).

- [ ] **Step 1: Copy the package out of the workspace and install there**

```bash
# from the repo root
CLEAN=$(mktemp -d)
tar --exclude=node_modules --exclude=dist -cf - -C packages/mobile-app . | tar -xf - -C "$CLEAN"
cd "$CLEAN" && node --version && npm --version && npm install && npm run build && npm test
```

Expected: `npm install` ends with `added N packages` and prints **no `npm error` and no `npm warn`** (the funding notice is not a warning); the build and all 154 tests pass. While writing this plan: Node 20.20.2, npm 10.8.2, 128 packages, no warnings. Record the Node and npm versions you used in the PR. With Node 20's bundled npm 10.x a `Cannot read properties of null (reading 'edgesOut')` crash means `vitest` in `package.json` is below `^4.1.12`; do not paper over it with `--legacy-peer-deps`. With npm 11 you may see an `npm warn install-scripts` notice about postinstall scripts of `cyberui-2045` and `esbuild`; that comes from those dependencies, not from this package: record it and carry on.

- [ ] **Step 2: Check it is self-contained**

Save this script **outside** the package and run it against the real package folder:

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
node /path/to/check-standalone.mjs packages/mobile-app
```

Expected: `standalone check OK: no workspace: ranges, no imports leaving the package`. Also confirm `diff LICENSE packages/mobile-app/LICENSE` prints nothing, `packages/mobile-app/package.json` has `"license": "MIT"`, and `ls -A packages/mobile-app` shows no `CLAUDE.md`, no `package-lock.json` and no process or skill files.

- [ ] **Step 3: Run it from the copy**

In the clean copy, run `npm run dev`, open the printed address (or `curl -s -o /dev/null -w '%{http_code}' http://localhost:5173/` and expect `200`), then stop it.

- [ ] **Step 4: Mutation-test the tests**

A test suite that cannot fail proves nothing (the hex test was exactly that once). This script, kept outside the package, applies one small change at a time to the source, runs the test file that should notice, expects it to fail, and restores the file. It matches on LF text, so a CRLF checkout does not hide a multi-line pattern.

```js
// Usage: node mutate.mjs <package dir>. Applies one change at a time to a source file, runs the named test file,
// expects it to FAIL, and restores the file. Lives outside the package.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
const pkg = path.resolve(process.argv[2]);
const MUTATIONS = [
  ['src/state/reducer.ts', "if (!target || target.status === 'offline') return state;", "if (!target) return state;", 'src/state/reducer.test.ts'],
  ['src/state/reducer.ts', "if (sameDevice(before, after)) continue;", "", 'src/state/reducer.test.ts'],
  ['src/components/DeviceRow.tsx', "disabled={device.status === 'offline'}", "", 'src/components/DeviceRow.test.tsx'],
  ['src/App.tsx', "document.getElementById(SCREEN_TITLE_ID)?.focus({ preventScroll: true });", "", 'src/App.test.tsx'],
  ['src/App.tsx', "window.scrollTo(0, 0);", "", 'src/App.test.tsx'],
  ['src/screens/DevicesScreen.tsx', "(row ?? document.getElementById(SCREEN_TITLE_ID))?.focus();", "", 'src/screens/DevicesScreen.test.tsx'],
  ['src/screens/AddDeviceScreen.tsx', "(event.currentTarget.elements.namedItem(first) as HTMLInputElement | null)?.focus();", "", 'src/screens/AddDeviceScreen.test.tsx'],
  ['src/screens/AddDeviceScreen.tsx', "!CODE_PATTERN.test(code)", "code === ''", 'src/screens/AddDeviceScreen.test.tsx'],
  ['src/router/useHashRoute.ts', "if (arrivedFromApp.current) window.history.back();", "if (true) window.history.back();", 'src/router/useHashRoute.test.ts'],
  ['src/App.css', "  touch-action: none;\n", "", 'src/phoneRules.test.ts'],
  ['src/App.css', "min-height: 100vh;\n  min-height: 100dvh;", "min-height: 100vh;", 'src/phoneRules.test.ts'],
  ['src/App.css', "@media (hover: hover) {\n  .nav-tab:hover,", ".nav-tab:hover {}\n@media (hover: hover) {\n  .nav-tab:hover,", 'src/phoneRules.test.ts'],
  ['src/App.css', "  animation: none;\n", "", 'src/phoneRules.test.ts'],
  ['src/App.css', "  color: var(--color-base);\n  background: var(--color-secondary);", "  color: #123456;\n  background: var(--color-secondary);", 'src/noHexColors.test.ts'],
  ['src/data/devices.ts', "status: 'offline', on: false, brightness: 50", "status: 'online', on: false, brightness: 50", 'src/data/devices.test.ts'],
  ['src/data/product.ts', "export const DEMO_NOTE = `Template demo: ${PRODUCT_NAME} is fictional and controls nothing.`;", "export const DEMO_NOTE = `Template demo.`;", 'src/data/product.test.ts'],
  ['src/components/AppBar.tsx', "{DEMO_BADGE}", "", 'src/App.test.tsx'],
  ['src/components/DeviceSheet.tsx', "showCloseButton={false}", "", 'src/components/DeviceSheet.test.tsx'],
  ['src/screens/SettingsScreen.tsx', "{DEMO_NOTE}", "", 'src/screens/SettingsScreen.test.tsx'],
  ['src/utils/units.ts', "const snapped = Math.round(celsius / TARGET_C.step) * TARGET_C.step;", "const snapped = celsius;", 'src/utils/units.test.ts'],
  ['src/components/BottomNav.tsx', "aria-current={route === tab ? 'page' : undefined}", "", 'src/components/BottomNav.test.tsx'],
  ['src/screens/ScenesScreen.tsx', "role=\"status\" className=\"scene-result\"", "className=\"scene-result\"", 'src/screens/ScenesScreen.test.tsx'],
  ['src/App.tsx', "<p role=\"status\" className=\"notice-text\">", "<p className=\"notice-text\">", 'src/App.test.tsx'],
  ['src/App.css', ".touch-switch input:focus-visible + div {", ".touch-switch input:focus + div {", 'src/phoneRules.test.ts'],
  ['src/data/settings.ts', "export const DEFAULT_SETTINGS", "export const leak = () => fetch('/x');\nexport const DEFAULT_SETTINGS", 'src/noNetworkOrStorage.test.ts'],
  ['src/data/settings.ts', "export const DEFAULT_SETTINGS", "export const leak = () => localStorage.setItem('a', 'b');\nexport const DEFAULT_SETTINGS", 'src/noNetworkOrStorage.test.ts'],
];
let survived = 0;
for (const [file, from, to, test] of MUTATIONS) {
  const full = path.join(pkg, file);
  const original = readFileSync(full, 'utf8');
  // Match on LF text, so a CRLF checkout does not hide a pattern that spans lines.
  const lf = original.replace(/\r\n/g, '\n');
  if (!lf.includes(from)) { console.log(`SKIP (pattern not found) ${file}: ${from.slice(0, 50)}`); survived++; continue; }
  writeFileSync(full, lf.replace(from, () => to));
  let failed = false;
  try { execSync(`npx vitest run ${test}`, { cwd: pkg, stdio: 'pipe' }); } catch { failed = true; }
  writeFileSync(full, original);
  console.log(`${failed ? 'caught  ' : 'SURVIVED'} ${file}: ${from.slice(0, 60).replace(/\n/g, ' ')}`);
  if (!failed) survived++;
}
console.log(survived === 0 ? 'all mutations caught' : `${survived} problem(s)`);
```

```bash
node /path/to/mutate.mjs packages/mobile-app
git status --short packages/mobile-app   # must show nothing: every file is restored
```

Expected (26 mutations, all caught):

```text
caught   src/state/reducer.ts: if (!target || target.status === 'offline') return state;
caught   src/state/reducer.ts: if (sameDevice(before, after)) continue;
caught   src/components/DeviceRow.tsx: disabled={device.status === 'offline'}
caught   src/App.tsx: document.getElementById(SCREEN_TITLE_ID)?.focus({ preventScr
caught   src/App.tsx: window.scrollTo(0, 0);
caught   src/screens/DevicesScreen.tsx: (row ?? document.getElementById(SCREEN_TITLE_ID))?.focus();
caught   src/screens/AddDeviceScreen.tsx: (event.currentTarget.elements.namedItem(first) as HTMLInputE
caught   src/screens/AddDeviceScreen.tsx: !CODE_PATTERN.test(code)
caught   src/router/useHashRoute.ts: if (arrivedFromApp.current) window.history.back();
caught   src/App.css:   touch-action: none; 
caught   src/App.css: min-height: 100vh;   min-height: 100dvh;
caught   src/App.css: @media (hover: hover) {   .nav-tab:hover,
caught   src/App.css:   animation: none; 
caught   src/App.css:   color: var(--color-base);   background: var(--color-second
caught   src/data/devices.ts: status: 'offline', on: false, brightness: 50
caught   src/data/product.ts: export const DEMO_NOTE = `Template demo: ${PRODUCT_NAME} is 
caught   src/components/AppBar.tsx: {DEMO_BADGE}
caught   src/components/DeviceSheet.tsx: showCloseButton={false}
caught   src/screens/SettingsScreen.tsx: {DEMO_NOTE}
caught   src/utils/units.ts: const snapped = Math.round(celsius / TARGET_C.step) * TARGET
caught   src/components/BottomNav.tsx: aria-current={route === tab ? 'page' : undefined}
caught   src/screens/ScenesScreen.tsx: role="status" className="scene-result"
caught   src/App.tsx: <p role="status" className="notice-text">
caught   src/App.css: .touch-switch input:focus-visible + div {
caught   src/data/settings.ts: export const DEFAULT_SETTINGS
caught   src/data/settings.ts: export const DEFAULT_SETTINGS
all mutations caught
```

If one survives, the test is weaker than its name: strengthen the test (not the code) until the mutation is caught, and commit it as `test(mobile-app): …`. If a pattern is "not found", the code moved: update the script, not the code.

- [ ] **Step 5: After PR A is merged, the real fork path**

```bash
npx --yes tiged patrickkuei/cyberui-templates/packages/mobile-app /tmp/mobile-app-tiged
cd /tmp/mobile-app-tiged && npm install && npm run build && npm test
```

Record the result in PR B's description (and in the spec's findings, Task 20). If it cannot be run yet, say so. Nothing to commit in this task.

### Task 13: The real-browser check at 320, 390 and 800px

Layout, touch sizes, the Drawer against safe areas, focus rings, the real accent contrast and the hover and motion behaviour cannot be tested under happy-dom (spec §8), so this is a task with a checklist and scripts, as issue #48 requires: **320, 390 and 800px**, checked in a real browser, fixing what fails in the file it belongs to (each fix its own commit). The numbers below are what the code in this plan produced; yours are the real ones.

**Files:**
- Modify: whatever the checks say; `docs/superpowers/specs/2026-10-17-mobile-app-design.md` (append "Findings from the first browser check"); `packages/mobile-app/README.md` if its "measured in" sentence is no longer true

- [ ] **Step 1: Start the app and set up the tools outside the repo**

```bash
pnpm --filter mobile-app-template dev --port 5199 --strictPort     # leave it running
mkdir -p ~/mobile-app-checks && cd ~/mobile-app-checks && npm init -y && npm install puppeteer-core@24
```

`puppeteer-core` drives a Chromium you already have: Microsoft Edge on Windows (`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`, the default in the scripts), Chrome on macOS or Linux (pass its path as the last argument). Write these scripts into `~/mobile-app-checks/` with the Write tool, not a shell heredoc. Note which browser and version you used: say so in the findings.

- [ ] **Step 2: Accent and status contrast, from the real tokens**

```js
// Usage: node contrast.mjs <path to cyberui-2045.css> <path to src/theme/blue.css>
// Prints WCAG contrast ratios for the pairs this app actually uses, from the real tokens.
// Kept OUTSIDE the package: it is a check, not part of the template.
import { readFileSync } from 'node:fs';

const [libraryCss, themeCss] = process.argv.slice(2).map((file) => readFileSync(file, 'utf8'));
const hex = (css, name) => css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{3,6})`))?.[1];
const full = (value) => (value.length === 4 ? '#' + [1, 2, 3].map((i) => value[i] + value[i]).join('') : value);
const color = Object.fromEntries(
  ['base', 'surface', 'muted', 'default', 'primary', 'success', 'warning', 'error', 'inverse'].map((name) => [name, full(hex(libraryCss, name))]),
);
color.accent = full(hex(themeCss, 'accent'));

const luminance = (value) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi + 0.05) / (lo + 0.05)).toFixed(2);
};

const pairs = [
  ['accent on base (headings, app name, active tab)', 'accent', 'base', 4.5],
  ['accent on surface (card headings, sheet slider value)', 'accent', 'surface', 4.5],
  ['base on accent (primary button text)', 'base', 'accent', 4.5],
  ['muted on base (radio labels, hints)', 'muted', 'base', 4.5],
  ['muted on surface (row details, scene text)', 'muted', 'surface', 4.5],
  ['default on base', 'default', 'base', 4.5],
  ['default on surface (device names, sheet title)', 'default', 'surface', 4.5],
  ['base on success (Online badge)', 'base', 'success', 4.5],
  ['base on warning (Low battery badge)', 'base', 'warning', 4.5],
  ['base on error (Offline badge)', 'base', 'error', 4.5],
  ['error on surface (Remove device, the library danger Button)', 'error', 'surface', 4.5],
  ['primary on surface (the library Drawer title, CyberUI#125)', 'primary', 'surface', 4.5],
];
for (const [label, fg, bg, need] of pairs) {
  const value = ratio(color[fg], color[bg]);
  console.log(`${Number(value) >= need ? 'ok  ' : 'FAIL'} ${value}:1 (needs ${need})  ${label}`);
}
```

```bash
node contrast.mjs <package>/node_modules/cyberui-2045/dist/cyberui-2045.css <package>/src/theme/blue.css
```

Expected (computed while writing the plan; spec §4 had the first two by hand). The two `FAIL` lines are **library** findings, not template bugs: the Drawer title is why the sheet draws its own heading (#125), and the red text of the library's `danger` Button on its own surface background is a new finding (Task 14):

```text
ok   6.21:1 (needs 4.5)  accent on base (headings, app name, active tab)
ok   4.87:1 (needs 4.5)  accent on surface (card headings, sheet slider value)
ok   6.21:1 (needs 4.5)  base on accent (primary button text)
ok   6.02:1 (needs 4.5)  muted on base (radio labels, hints)
ok   4.72:1 (needs 4.5)  muted on surface (row details, scene text)
ok   12.92:1 (needs 4.5)  default on base
ok   10.13:1 (needs 4.5)  default on surface (device names, sheet title)
ok   12.83:1 (needs 4.5)  base on success (Online badge)
ok   8.94:1 (needs 4.5)  base on warning (Low battery badge)
ok   5.27:1 (needs 4.5)  base on error (Offline badge)
FAIL 4.13:1 (needs 4.5)  error on surface (Remove device, the library danger Button)
FAIL 3.45:1 (needs 4.5)  primary on surface (the library Drawer title, CyberUI#125)
```

- [ ] **Step 3: Measure it in a real browser**

This script visits every screen at 320, 390 and 800px, measures the touch targets, taps a row with touch emulation, opens the sheet with insets of 47px (top) and 34px (bottom) emulated, drags the slider by touch inside a sheet that can scroll (twice: as built, and with `touch-action` forced back to `auto`), checks reduced motion and the focus rings, and checks the switch's keyboard focus indicator.

```js
// A throwaway browser check for the mobile-app template, kept OUTSIDE the repo.
// Usage: node browser-check.mjs <url of the dev server or preview, no hash> [path to a Chromium or Edge executable]
// It drives a real Chromium (Edge here) through puppeteer-core with device emulation: touch, a mobile
// viewport, safe-area insets and prefers-reduced-motion. It measures and prints; it fixes nothing.
import puppeteer from 'puppeteer-core';

const url = process.argv[2] ?? 'http://localhost:5199/';
const exe = process.argv[3] ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const out = {};

const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const client = await page.createCDPSession();

async function phone(width, height, extra = {}) {
  await page.setViewport({ width, height, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ...extra });
}
const size = (el) => el.evaluate((node) => { const b = node.getBoundingClientRect(); return [Math.round(b.width * 10) / 10, Math.round(b.height * 10) / 10]; });
// about:blank first: going from one hash to the same hash is not a reload, and a sheet left open would stay open.
const open = async (hash = '#/devices') => { await page.goto('about:blank'); await page.goto(url + hash, { waitUntil: 'networkidle0' }); await sleep(300); };

// 1. Sideways scroll and the basics, at the three widths
out.widths = {};
for (const [w, h] of [[320, 568], [390, 844], [800, 900]]) {
  await phone(w, h, w >= 800 ? { isMobile: false, hasTouch: false } : {});
  for (const hash of ['#/devices', '#/scenes', '#/settings', '#/add']) {
    await open(hash);
    const r = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, innerW: innerWidth, overflowing: [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest('.skip-link')).map((e) => e.tagName + '.' + String(e.className).slice(0, 20)).slice(0, 5) }));
    out.widths[`${w} ${hash}`] = r.scrollW <= r.innerW && r.overflowing.length === 0 ? 'ok' : r;
  }
}

// 2. Touch target sizes at 390
await phone(390, 844);
await open('#/devices');
out.sizes = {};
out.sizes.addButton = await size(await page.$('main > button'));
out.sizes.deviceRowButton = await size(await page.$('.device-main'));
out.sizes.switchHitArea = await size(await page.$('.touch-switch label'));
out.sizes.navTab = await size(await page.$('.nav-tab'));
await open('#/settings');
out.sizes.radioLabel = await size(await page.$('.touch-radios label'));
out.sizes.settingsSwitchRow = await size(await page.$('.touch-switch'));
await open('#/add');
out.sizes.input = await size(await page.$('input[name=name]'));
out.sizes.select = await size(await page.$('select[name=room]'));
out.sizes.saveButton = await size(await page.$('.form-actions button'));
out.sizes.backButton = await size(await page.$('.app-bar-back'));

// 3. Hover under touch emulation: after a tap nothing stays hover-styled
await open('#/devices');
out.hover = { mediaHoverHover: await page.evaluate(() => matchMedia('(hover: hover)').matches) };
const row = await page.$('.device-main');
const box = await row.boundingBox();
await page.touchscreen.tap(box.x + 20, box.y + 20);
await sleep(700);
out.hover.sheetOpenedByTap = await page.evaluate(() => !!document.querySelector('.device-sheet'));
await page.keyboard.press('Escape');
await sleep(600);
out.hover.rowBackgroundAfterTap = await page.evaluate(() => getComputedStyle(document.querySelector('.device-main')).backgroundColor);

// 4. The sheet: glow off, safe-area padding, sizes, and the Drawer's own behaviour
await client.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 47, bottom: 34, left: 0, right: 0 } }).then(
  () => { out.safeAreaOverride = 'applied'; },
  (error) => { out.safeAreaOverride = 'not supported: ' + error.message; },
);
await open('#/devices');
await page.tap('.device-main');
await sleep(900);
out.sheet = await page.evaluate(() => {
  const sheet = document.querySelector('.device-sheet');
  const cs = getComputedStyle(sheet);
  const done = [...sheet.querySelectorAll('button')].find((b) => b.textContent === 'Done').getBoundingClientRect();
  const track = document.querySelector('.slider-control > div:last-child').getBoundingClientRect();
  const thumb = document.querySelector('[role=slider]').getBoundingClientRect();
  return {
    animationName: cs.animationName, borderTop: cs.borderTopColor, paddingBottom: cs.paddingBottom, height: sheet.getBoundingClientRect().height,
    doneBottom: Math.round(done.bottom), innerH: innerHeight, track: [track.width, track.height], thumb: [thumb.width, thumb.height],
    bottomNavPaddingBottom: getComputedStyle(document.querySelector('.bottom-nav')).paddingBottom,
    appBarPaddingTop: getComputedStyle(document.querySelector('.app-bar')).paddingTop,
  };
});
const insetsApplied = await page.evaluate(() => { const probe = document.createElement('div'); probe.style.cssText = 'position:fixed;padding-bottom:env(safe-area-inset-bottom)'; document.body.append(probe); const v = getComputedStyle(probe).paddingBottom; probe.remove(); return v; });
out.safeAreaBottomReadsAs = insetsApplied;

// 5. Dragging the slider by touch while the sheet can scroll (a short, landscape-like viewport)
async function dragThumb(label, forceAuto) {
  await client.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 0, bottom: 0, left: 0, right: 0 } });
  await phone(390, 300);
  await open('#/devices');
  await page.tap('.device-main');
  await sleep(900);
  if (forceAuto) await page.addStyleTag({ content: '.touch-slider { touch-action: auto !important; }' });
  await page.evaluate(() => document.querySelector('[role=slider]').scrollIntoView({ block: 'center' }));
  const before = await page.evaluate(() => ({ value: document.querySelector('[role=slider]').getAttribute('aria-valuenow'), sheetScrollTop: document.querySelector('.device-sheet > div:last-child')?.scrollTop, sheetCanScroll: (() => { const body = document.querySelector('.device-sheet > div:last-child'); return body.scrollHeight > body.clientHeight; })() }));
  const t2 = await (await page.$('[role=slider]')).boundingBox();
  const sx = t2.x + t2.width / 2; const sy = t2.y + t2.height / 2;
  const touch = await page.touchscreen.touchStart(sx, sy);
  for (let i = 1; i <= 10; i++) { await touch.move(sx - i * 12, sy + i * 3); await sleep(16); }
  await touch.end();
  await sleep(200);
  const after = await page.evaluate(() => ({ value: document.querySelector('[role=slider]').getAttribute('aria-valuenow'), sheetScrollTop: document.querySelector('.device-sheet > div:last-child')?.scrollTop }));
  out[label] = { before, after, valueChanged: before.value !== after.value, sheetScrolledDuringDrag: before.sheetScrollTop !== after.sheetScrollTop };
}
for (const [label, auto] of [['touchDragWithTouchActionNone', false], ['touchDragWithTouchActionAuto', true]]) { try { await dragThumb(label, auto); } catch (error) { out[label] = 'failed: ' + error.message + ' | sheet present: ' + (await page.evaluate(() => !!document.querySelector('.device-sheet'))); } }

// 6. Reduced motion
await phone(390, 844);
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await open('#/devices');
out.reducedMotion = await page.evaluate(() => ({ navTabTransition: getComputedStyle(document.querySelector('.nav-tab')).transitionDuration, rowTransition: getComputedStyle(document.querySelector('.device-main')).transitionDuration }));
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await open('#/devices');
out.motionAllowed = await page.evaluate(() => ({ navTabTransition: getComputedStyle(document.querySelector('.nav-tab')).transitionDuration }));

// 7. Keyboard focus rings
await phone(800, 900, { isMobile: false, hasTouch: false });
await open('#/devices');
out.focusRings = [];
for (let i = 0; i < 6; i++) {
  await page.keyboard.press('Tab');
  out.focusRings.push(await page.evaluate(() => { const el = document.activeElement; const cs = getComputedStyle(el); return `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 18)} outline=${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} ring=${cs.boxShadow !== 'none' ? 'shadow' : 'none'}`; }));
}

// 8. Toggle keyboard focus: is there any visible indicator on the switch?
await phone(800, 900, { isMobile: false, hasTouch: false });
await open('#/settings');
await page.focus('#setting-alert-offline');
await page.keyboard.press('Tab');
await page.keyboard.down('Shift'); await page.keyboard.press('Tab'); await page.keyboard.up('Shift');
out.toggleFocus = await page.evaluate(() => { const input = document.activeElement; const track = input.nextElementSibling; const cs = getComputedStyle(track); return { focused: input.id, inputMatchesFocusVisible: input.matches(':focus-visible'), trackBoxShadow: cs.boxShadow, trackOutline: cs.outlineStyle + ' ' + cs.outlineWidth, trackRing: cs.getPropertyValue('--tw-ring-shadow') }; });

console.log(JSON.stringify(out, null, 1));
await browser.close();
```

```bash
node browser-check.mjs http://localhost:5199/
```

Expected, from the run while writing the plan (the numbers that matter: no sideways scroll anywhere; every touch target 44px or more; `(hover: hover)` is false under touch emulation and a tapped row has no leftover background; the sheet has `animation-name: none`, a steady accent border and `34px` bottom padding, and its Done button ends 34px above the viewport's bottom; the nav and app bar take the emulated insets; the touch drag moves 70 → 35 with `touch-action: none` and 70 → 65 without; transitions are `0s` under reduced motion and `0.15s` otherwise; the switch's track has a 2px outline when focused from the keyboard):

```text
{
 "widths": {
  "320 #/devices": "ok",
  "320 #/scenes": "ok",
  "320 #/settings": "ok",
  "320 #/add": "ok",
  "390 #/devices": "ok",
  "390 #/scenes": "ok",
  "390 #/settings": "ok",
  "390 #/add": "ok",
  "800 #/devices": "ok",
  "800 #/scenes": "ok",
  "800 #/settings": "ok",
  "800 #/add": "ok"
 },
 "sizes": {
  "addButton": [
   358,
   44
  ],
  "deviceRowButton": [
   276,
   68
  ],
  "switchHitArea": [
   64,
   44
  ],
  "navTab": [
   130,
   61.5
  ],
  "radioLabel": [
   47.1,
   44
  ],
  "settingsSwitchRow": [
   358,
   44
  ],
  "input": [
   358,
   52
  ],
  "select": [
   358,
   52
  ],
  "saveButton": [
   358,
   44
  ],
  "backButton": [
   80.3,
   44
  ]
 },
 "hover": {
  "mediaHoverHover": false,
  "sheetOpenedByTap": true,
  "rowBackgroundAfterTap": "rgba(0, 0, 0, 0)"
 },
 "safeAreaOverride": "applied",
 "sheet": {
  "animationName": "none",
  "borderTop": "rgb(91, 156, 255)",
  "paddingBottom": "34px",
  "height": 402,
  "doneBottom": 786,
  "innerH": 844,
  "track": [
   342,
   12
  ],
  "thumb": [
   24,
   24
  ],
  "bottomNavPaddingBottom": "34px",
  "appBarPaddingTop": "47px"
 },
 "safeAreaBottomReadsAs": "34px",
 "touchDragWithTouchActionNone": {
  "before": {
   "value": "70",
   "sheetScrollTop": 59,
   "sheetCanScroll": true
  },
  "after": {
   "value": "35",
   "sheetScrollTop": 59
  },
  "valueChanged": true,
  "sheetScrolledDuringDrag": false
 },
 "touchDragWithTouchActionAuto": {
  "before": {
   "value": "70",
   "sheetScrollTop": 59,
   "sheetCanScroll": true
  },
  "after": {
   "value": "65",
   "sheetScrollTop": 59
  },
  "valueChanged": true,
  "sheetScrolledDuringDrag": false
 },
 "reducedMotion": {
  "navTabTransition": "0s",
  "rowTransition": "0s"
 },
 "motionAllowed": {
  "navTabTransition": "0.15s, 0.15s"
 },
 "focusRings": [
  "a.skip-link outline=auto 1px rgb(16, 16, 16) ring=none",
  "button.device-main outline=solid 2px rgb(91, 156, 255) ring=none",
  "input.sr-only peer outline=auto 1px rgb(16, 16, 16) ring=none",
  "button.device-main outline=solid 2px rgb(91, 156, 255) ring=none",
  "input.sr-only peer outline=auto 1px rgb(16, 16, 16) ring=none",
  "button.device-main outline=solid 2px rgb(91, 156, 255) ring=none"
 ],
 "toggleFocus": {
  "focused": "setting-alert-offline",
  "inputMatchesFocusVisible": true,
  "trackBoxShadow": "none",
  "trackOutline": "solid 2px",
  "trackRing": "0 0 #0000"
 }
}
```

If `safeAreaOverride` says "not supported", your browser is older than the emulation command: say so in the findings and check the insets some other way (or list them as not checked). `sheetCanScroll` must be `true` in the drag test, or the test is not testing a scrollable sheet.

- [ ] **Step 4: The same sizes as shipped, and a colour scan**

`measure-shipped.mjs` switches the template's touch rules off and measures the library's controls as it ships them (this is the evidence for Task 14's feature requests):

```js
// Measures cyberui-2045's controls as shipped, with the template's touch-target rules switched off.
// Kept OUTSIDE the repo. Usage: node measure-shipped.mjs <app url>
import puppeteer from 'puppeteer-core';
const url = process.argv[2] ?? 'http://localhost:5199/';
const exe = process.argv[3] ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const rect = (selector) => page.$eval(selector, (el) => { const b = el.getBoundingClientRect(); return [Math.round(b.width * 10) / 10, Math.round(b.height * 10) / 10]; });
const out = {};
await page.goto(url + '#/settings', { waitUntil: 'networkidle0' });
await page.addStyleTag({ content: '.touch-switch label, .touch-radios label { min-height: 0 !important; }' });
await sleep(200);
out.toggleTrackLg = await rect('.touch-switch label:last-child');
out.radioOptionRow = await rect('.touch-radios label');
await page.goto('about:blank');
await page.goto(url + '#/devices', { waitUntil: 'networkidle0' });
await page.tap('.device-main'); await sleep(900);
await page.addStyleTag({ content: '.slider-control > div:last-child::before, .slider-control [role=slider]::before { display: none !important; }' });
out.sliderTrackLg = await rect('.slider-control > div:last-child');
out.sliderThumbLg = await rect('[role=slider]');
out.touchActionOnSliderPieces = await page.evaluate(() => ({ track: getComputedStyle(document.querySelector('.slider-control > div:last-child')).touchAction, thumb: getComputedStyle(document.querySelector('[role=slider]')).touchAction }));
console.log(JSON.stringify(out));
await browser.close();
```

Expected: `{"toggleTrackLg":[64,32],"radioOptionRow":[47.1,20],"sliderTrackLg":[342,12],"sliderThumbLg":[24,24],"touchActionOnSliderPieces":{"track":"auto","thumb":"auto"}}`

`colour-scan.mjs` looks for the library's default cyan and yellow, and for magenta text, on every screen and on the open sheet:

```js
// Looks for colour leaks on every screen, and on the open device sheet, in a real Chromium. Kept OUTSIDE the repo.
// Usage: node colour-scan.mjs <url of the dev server or preview, no hash> [path to a Chromium or Edge executable]
// It reads computed styles of the states it visits (not hover or focus), and reports
//   cyanYellow: anything still painted in the library's default secondary (cyan) or accent (yellow), meaning
//               the blue override missed a place;
//   magentaText: text in the library's --color-primary, which Card gives its body text unless reset.
import puppeteer from 'puppeteer-core';

const url = process.argv[2] ?? 'http://localhost:5199/';
const exe = process.argv[3] ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });

const scan = () =>
  page.evaluate(() => {
    const bad = ['rgb(0, 255, 249)', 'rgb(255, 251, 0)'];
    const props = ['color', 'backgroundColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor', 'boxShadow', 'textDecorationColor', 'fill', 'stroke'];
    const label = (el) => el.tagName + '.' + String(el.className.baseVal ?? el.className).slice(0, 30);
    const cyanYellow = [...document.querySelectorAll('body *')].flatMap((el) => {
      const cs = getComputedStyle(el);
      return props.filter((p) => bad.some((b) => String(cs[p]).includes(b))).map((p) => label(el) + ' ' + p);
    });
    const magentaText = [...document.querySelectorAll('body *')]
      .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && getComputedStyle(el).color === 'rgb(255, 0, 93)')
      .map((el) => label(el) + ' "' + el.textContent.trim().slice(0, 30) + '"');
    return { cyanYellow, magentaText };
  });

for (const hash of ['#/devices', '#/scenes', '#/settings', '#/add']) {
  await page.goto('about:blank');
  await page.goto(url + hash, { waitUntil: 'networkidle0' });
  await sleep(400);
  console.log(hash, JSON.stringify(await scan()));
}
await page.goto('about:blank');
await page.goto(url + '#/devices', { waitUntil: 'networkidle0' });
await page.tap('.device-main');
await sleep(900);
console.log('sheet open', JSON.stringify(await scan()));
await browser.close();
```

Expected: `{"cyanYellow":[],"magentaText":[]}` for `#/devices`, `#/scenes`, `#/settings`, `#/add` and the open sheet. (The slider's filled part still ends in magenta: the library's `accent` variant is a gradient from `--color-accent` to `--color-primary`, which is on purpose and not text.)

- [ ] **Step 5: Look at every screen at 390, 320 and 800px**

Use the Claude Browser pane, devtools' device toolbar, or the same `puppeteer-core` with `page.screenshot`. Check by eye, and write down anything that is off:

- **390 and 320, Devices:** the app bar (name left, "Demo" badge right), "Devices" in blue, three room headings with a rule, eight rows. Online badges are green, "Low battery" amber, an offline row has a red "Offline" badge and a dimmed switch, sensors show a reading at the right and no switch. Nothing is clipped at 320; the bottom nav has three equal tabs with the current one marked in blue with a bar above it.
- **The sheet (tap Desk lamp):** it slides up, a steady blue border (no colour cycling), "Desk lamp" in the default text colour, "Living room" and a green badge, a Power switch, a Brightness slider with a value, then a red-outlined "Remove device" and a solid blue "Done". At 320x568 it fits without scrolling (measured 368px high); `Esc`, a tap on the backdrop and Done all close it, and afterwards the page scrolls again (`document.body.style.overflow` is `''`) and focus is on the row you opened.
- **Hall thermostat:** the slider shows °C or °F according to Settings; switch to °F in Settings and the Devices rows read `Target 68 °F`.
- **Add device:** four fields (52px high, 16px text), a native picker for Room and Type, "Save device" and "Cancel" stuck at the bottom of the screen with no bottom nav, "Back" in the app bar. Press Save empty: two red messages, focus on Device name. Type a name and a six-character code and Save: you land on Devices with a blue-ruled notice "Added … Template demo: Kestrel is fictional and controls nothing." and a Dismiss button.
- **Scenes:** three cards; "Apply" on Good night reports `Good night applied. Changed: Desk lamp, TV plug, Fan plug, Hall thermostat. Offline, so not changed: Hall light.`
- **Settings:** °C/°F radios 44px high, two switches with their labels, an About card with the demo sentence.
- **800:** one centred column 480px wide with a border at each side, the same bottom nav at its foot, the sheet centred at the same width.
- **Reduced motion:** emulate it (devtools Rendering panel) and reload: no transitions on tabs and rows, and the sheet appears without sliding.

- [ ] **Step 6: What you cannot check this way, and say so**

Write these in the findings as **not checked** unless you actually did them: a real phone and real touch (the emulation sends touch events, but a finger is not a simulated pointer); real safe-area insets on a notched device; the on-screen keyboard resizing the page (the Save row is sticky inside the form and cannot be confirmed above a real keyboard); iOS Safari and its collapsing toolbars (so `dvh` and the sticky nav against a moving toolbar), and any other WebKit or Firefox (the `.device-sheet` `height: auto` inside a flex column is the layout most at risk); a screen reader (VoiceOver, TalkBack, NVDA); the library's lack of a Drawer focus trap (read, and open as #123: you can show it by pressing Tab past Done).

- [ ] **Step 7: Fix what failed, then record what you found**

Fix each failure in the file it belongs to (its own commit each, message `fix(mobile-app): <what>`), re-running the affected script. Then append a "Findings from the first browser check" section at the end of `docs/superpowers/specs/2026-10-17-mobile-app-design.md`, in landing's format: the tool and browser; what needed a fix; what was checked and held (with the numbers: contrast, scroll widths, target sizes, the sheet's insets); the library findings with their evidence (Task 14 files them); and what you could **not** check, stated plainly. If your run contradicts the README's "measured in … Not checked …" sentence, change the README, not the findings.

```bash
git add docs/superpowers/specs/2026-10-17-mobile-app-design.md packages/mobile-app
git commit -m "docs: findings from the first browser check of the mobile app" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 14: Library findings, the upstream feature requests, the fork-install matrix, then open PR A

Spec §7.1 asks that the phone gaps this template exposes be filed on patrickkuei/CyberUI. The rule of the repo applies: **file only after reproducing, and after checking the existing issues**. The evidence comes from Task 13.

**Files:**
- Modify: `.github/workflows/checks.yml`; the comments and README lines listed in Step 4; `docs/superpowers/specs/2026-10-17-mobile-app-design.md`

- [ ] **Step 1: Reproduce each finding on the library itself**

Candidates found while writing this plan. For each, reproduce it in a minimal setting (a scratch Vite app with only cyberui-2045 2.8.0, or the template with the workaround rule removed) and in the latest published version if it is cheap. **Drop any you cannot reproduce.**

1. **`Toggle` draws no keyboard focus indicator** (a defect). Its classes include `peer-focus:ring-accent` (a ring colour) and `peer-focus:outline-none`, but no ring width. Reproduce: Tab to a `<Toggle id="a" label="A" />`; the input matches `:focus-visible` and its track (`input.nextElementSibling`) has `box-shadow: none` and no outline. In the template: delete the `.touch-switch input:focus-visible + div` rule and run `browser-check.mjs`; section 8 then reports `trackOutline: "none 3px"`.
2. **`Slider` sets no `touch-action`, so a touch drag is cancelled when the slider sits in something scrollable** (a defect). Reproduce with `browser-check.mjs` (its `touchDragWithTouchActionAuto` run: `touch-action` forced back to `auto`): the drag starts, the browser takes over the gesture, and the value stops after a few points instead of following the finger. A repro without the template: a `Slider` in a `div` with `overflow: auto; height: 200px` and content taller than that.
3. **`Button variant="danger"` text is 4.13:1 on its own `--color-surface` background** (a defect; the text is 18px bold, which is not "large text"). It is computed from the tokens and confirmed in the browser (`rgb(255, 79, 79)` on `rgb(45, 45, 68)`). The same `text-error` on a surface affects error text of `Input` and `Select` inside a Card or Drawer. Compare #113 (muted text on surface, closed).
4. **`Select` does not tie its `error` to the field** (a defect, an accessibility gap like #121 but for `Select`). Reproduce: render `<Select label="Room" options={[…]} error="Pick a room" />`; the `<select>` has no `aria-invalid` and no `aria-describedby`, and the message has no id (`Input` has all three).
5. **Optional, only if you can state it precisely:** setting `Drawer`'s `isOpen` to false unmounts it at once, skipping its closing animation and its focus restore, which only its own close paths perform. Check whether this is documented as intended before filing; if it is, drop it.

And the four phone **feature requests** from spec §7.1, each with the evidence this template produced:

| Request | Evidence to put in it |
|---|---|
| A bottom navigation component (3 to 5 items, `aria-current`, safe-area padding) | `src/components/BottomNav.tsx` and the CSS around `.bottom-nav` and `.nav-tab`: what had to be built (sticky in the column, safe-area padding, 3 equal 61px tabs, the active mark) and that `TabNavigation` is a strip along the top |
| Safe-area and `dvh` support (padding utilities or a prop on `Drawer`, app-shell helpers) | The stylesheet has 0 `env(`, `dvh`, `svh`, `lvh`; `100vh` appears only in `Image` utilities and two keyframes; the Drawer's bottom sheet has a fixed height by `size`, is full width with no maximum, and has no bottom padding, so the template's `.device-sheet` block exists. With 34px of emulated inset the sheet's Done button sat 34px above the bottom only because of that block. Say how you emulated it (`Emulation.setSafeAreaInsetsOverride`) and what that cannot show (a real device) |
| A touch-size option for `Toggle`, `Checkbox` and `Slider` (a 44px hit area without a bigger visual) | The as-shipped sizes from `measure-shipped.mjs` (Toggle `lg` track 64x32, `md` 56x28, `sm` 40x20; Slider `lg` track 12px, thumb 24px; RadioGroup rows 47x20; Checkbox 16/20/24px from its classes; the Drawer × 32px; the Notification × 20px), `TouchRow` and the `.touch-*` rules, and that they rely on the library's markup |
| A swipeable row and/or a bottom-sheet action list (a gesture component with a keyboard alternative built in) | What the template does instead (a visible switch on each row and a bottom sheet) and what it costs; the owner's decision (Q4) that this template does not carry its own pointer-event code, so a library component is the way to get swipe |

- [ ] **Step 2: Check what already exists**

```bash
gh issue list --repo patrickkuei/CyberUI --state all --limit 100 --json number,title,state
gh issue list --repo patrickkuei/CyberUI --state all --search "Toggle focus"
gh issue list --repo patrickkuei/CyberUI --state all --search "Slider touch"
gh issue list --repo patrickkuei/CyberUI --state all --search "danger contrast"
gh issue list --repo patrickkuei/CyberUI --state all --search "Select error"
gh issue list --repo patrickkuei/CyberUI --state all --search "bottom navigation"
gh issue list --repo patrickkuei/CyberUI --state all --search "safe-area"
gh issue list --repo patrickkuei/CyberUI --state all --search "swipe"
```

When this plan was written the open issues were #116, #117, #119 to #125 and none covered any of the above (#121 is `Input` only; #124 and #125 are the Drawer's glow and title). If one now does, comment on it with your evidence instead of opening a duplicate. If `gh` cannot reach that repository, list the findings in the PR description instead and say so.

- [ ] **Step 3: File them**

For each finding you reproduced and each feature request:

```bash
gh issue create --repo patrickkuei/CyberUI --title "<short, specific>" --body "<what you did, what you expected, what happened, version 2.8.0, a minimal snippet, the measured numbers; for a request: the evidence table row above>"
```

End every body with the line `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. Defects get a title like `Toggle: no visible keyboard focus indicator (the focus ring has a colour but no width)`; requests get `[Feature Request]` as the library's earlier requests do (#34, #35). Write down every number the commands print.

- [ ] **Step 4: Point the template at the issues**

The template must cite the issue for every workaround. Find each site with `grep -rn "feature request\|Known limits\|touch-action of its own" src README.md` and add the number you got (use the Edit tool; the comments are wrapped across lines, so edit by sentence, not by exact text):

| Where | What it says now | Make it say |
|---|---|---|
| `src/App.css`, the comment above `.touch-switch input:focus-visible + div` | ends `(see the README's Known limits).` | `(patrickkuei/CyberUI#<Toggle focus>, and the README's Known limits).` |
| `src/App.css`, the comment above `.touch-slider` | `the library sets no touch-action of its own, so it is the template's job.` | the same, followed by `(patrickkuei/CyberUI#<Slider touch-action>)` |
| `src/components/TouchRow.tsx`, the comment | `a touch-size option is an open feature request on patrickkuei/CyberUI, linked from the README's Known limits` | `a touch-size option is an open feature request, patrickkuei/CyberUI#<touch size>` |
| `src/components/BottomNav.tsx`, the first comment | `a bottom bar is an open feature request on patrickkuei/CyberUI, linked from the README's Known limits` | `a bottom bar is an open feature request, patrickkuei/CyberUI#<bottom nav>` |
| `src/components/DeviceSheet.tsx`, the long comment | the bullet `The panel is full width. App.css centres it in the app's column on wide screens and pads it for the home indicator.` | the same, followed by `(safe-area and dvh support is an open feature request, patrickkuei/CyberUI#<safe area>)` |
| `README.md`, Known limits | the bullets for the Toggle focus ring, the Slider `touch-action`, the missing bottom nav / safe area / touch size / swipe, and the `Remove device` button's 4.13:1 | a `(CyberUI#NNN)` at the end of each, as the other bullets have (the missing-feature bullet names four issues) |

Then `grep -rn "CyberUI#" src README.md` and check each number is the issue it claims (Review Focus 18). Commit as `docs(mobile-app): point the library workarounds at the CyberUI issues filed for them`.

- [ ] **Step 5: Add the template to the `fork-install` matrix**

In `.github/workflows/checks.yml`, in the `fork-install` job, extend the matrix:

```yaml
        template: [monitoring, agent-panel, landing, mobile-app]
```

This is in PR A (spec §10 lists it among PR B's integration changes) so that CI copies the package out and runs a plain `npm install`, `npm run build` and `npm test` on Node 20 before it is merged: the check that would have caught the vitest range. Commit as `ci: run the fork-install job for the mobile-app template too`.

- [ ] **Step 6: Record what was filed in the spec**

Append a "Library findings, reproduced and filed" section to `docs/superpowers/specs/2026-10-17-mobile-app-design.md` (landing's spec has the same section): a table of every finding and request with its issue number, what you reproduced and how, what you dropped and why, and the four feature requests with their numbers. Also, if the spec's header still says "Plan: not written", change it to link to this plan. Commit as `docs: record the library findings filed for the mobile app`.

- [ ] **Step 7: Run everything once more**

From the repo root: `pnpm --filter mobile-app-template run build`, `pnpm --filter mobile-app-template test` (23 files, 154 tests), `pnpm install --frozen-lockfile` (succeeds), `npm run check:license`, `npm run check:templates-readme`, `npm run check:code-tab` (all pass; they only know the three published templates until PR B). Note: `check:template-builds` does not know `mobile-app` yet, which is why it still passes.

- [ ] **Step 8: Push and open PR A**

```bash
git push -u origin feat/mobile-app-template
gh pr create --base main --title "feat(mobile-app): the fourth template, a phone-first device controller" --body "<summary; test plan; what was and was not checked (Task 13's findings and its not-checked list); the npm 10 install note (vitest ^4.1.12) and the Node/npm versions used; the library issues filed (Task 14); the deviations from the spec; Refs #48>"
```

The PR body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)` and says, in plain words, that the template was measured in desktop Chromium with device emulation and **not** on a real phone, in WebKit, in Firefox, with a screen reader or against a real on-screen keyboard. Do not merge.

---

## PR B: publish it on the site

Start after PR A is merged: `git checkout main && git pull && git checkout -b feat/site-mobile-app`. PR B cannot pass `check:code-tab` until then (the Code tab's excerpts and folders must exist in `packages/mobile-app`), and `check:license` and `check:template-builds` only start covering the package once Task 18 registers it. Everything the site shows is derived from `TEMPLATES` and needs no edit (Home's "N templates ready", the Templates page, the section component, the preview dialog, the start prompt and fork command, the router, `llms.ts`, the `<noscript>` list in `staticHtml.ts`; `sitemap.xml` lists only the site root). Read `packages/site/src/data/templates.ts`, `src/content/templateContent.ts`, `src/components/TemplatePreview.tsx` and `src/components/PreviewDialog.tsx` first.

Checks that must pass before the PR is opened (Task 20 runs them): `npm run test:scripts`, `npm run check:process-excerpts`, `npm run check:templates-readme`, `npm run check:code-tab`, `npm run check:license`, `npm run check:template-builds`, and the full `pnpm -r --workspace-concurrency=1 run test` (serial: run in parallel, the Vitest processes compete for CPU and a few monitoring tests time out on a loaded machine).

### Task 15: The examples: two role-play interviews, kept verbatim

The Examples on the Templates page are **never invented** (spec 2026-10-05 §2 and §4; the mobile-app spec §11). They are two subagents playing a person, asked what they would type to their AI, in order, where they would get stuck, and how they would know it worked. They are language-model role-plays, not users, and the page says so. If you cannot run subagents, **stop and ask the owner; do not write the examples yourself.**

**Files:** none in the repo yet (the interviews are saved outside it; Task 18 puts the chosen pieces into `templateContent.ts`).

- [ ] **Step 1: Run two interviews, one subagent each**

Use this brief for both, changing only the persona. Save each reply **whole and unedited** to its own file outside the repo (`interview-1.txt`, `interview-2.txt`):

> You are \<persona\>. You have just downloaded the Mobile App template from the CyberUI templates site: a phone-first web app for a fictional home device controller called Kestrel (a list of devices with a switch on each row, a bottom sheet of controls for one device, one-tap scenes, a form to add a device and a settings screen), built with React and a cyberpunk-styled component library. It is a demo: the hub, the devices, the scenes and the readings are made up, and nothing is controlled, paired, sent or saved. You will tell your AI coding assistant what to change. Reply with: (1) what you would type to your AI, in order, 4 to 6 messages; (2) where you would get stuck; (3) how you would know it worked.

Personas (spec §11): (a) a hobbyist who wants a phone controller for their own home lab or a handful of smart plugs; (b) a designer who is prototyping a device app to show a client. Add one or two sentences of detail to each persona if you like, but do not tell them what to say, what will go wrong or what the template lacks.

- [ ] **Step 2: Choose what goes on the page, by these rules**

- Everything is **verbatim**: the person's own words, never reworded or tidied. Long fields are truncated with an ellipsis (`…`) as the other entries do (see `packages/site/src/content/templateContent.ts`). The messages go in order, in `requests`.
- **"Where they'd get stuck" may only list obstacles that the library and the templates did not cause** (the owner's rule for this section): a device protocol such as MQTT or Matter, an account system and who gets access, installing it on a phone's home screen or in an app store, real notifications, hosting. **Drop** any passage that is a comment on the template or the demo itself ("it is all fake", "the README says", "for real life I'd say not yet"): those read as feedback, not as use. If nothing in an interview qualifies for "stuck", do not write something: report it to the owner.
- Examples should read like monitoring's: what the person asks for, the real wall they hit (connecting their own system), and how they would know it worked.
- Voice: the labels inside the section say "they"; the entry's `title` names the person ("A home-lab hobbyist", "A designer").

- [ ] **Step 3: Verify they are verbatim**

Put the two chosen examples in a JSON array (the `ExampleCase` shape: `{ "title", "requests": [...], "stuck", "worked" }`, in the same order as the interview files) and run this script, kept outside the repo:

```js
// Usage: node check-verbatim.mjs examples.json interview-1.txt interview-2.txt
// examples.json is an array of { title, requests[], stuck, worked } (the
// ExampleCase shape), in the same order as the interview files. It fails if any
// piece of an example, split at its ellipses, is not found word for word
// (whitespace differences ignored) in that person's saved interview. Keep the
// script and the files outside the repo.
import { readFileSync } from 'node:fs';

const [examplesFile, ...interviewFiles] = process.argv.slice(2);
const examples = JSON.parse(readFileSync(examplesFile, 'utf8'));
const squash = (text) => text.replace(/\s+/g, ' ').trim();
const problems = [];

if (examples.length !== interviewFiles.length) problems.push(`${examples.length} examples but ${interviewFiles.length} interview files`);

examples.forEach((example, index) => {
  const source = squash(readFileSync(interviewFiles[index] ?? '', 'utf8'));
  const pieces = [...example.requests, example.stuck, example.worked];
  for (const piece of pieces) {
    for (const part of piece.split(/…|\.\.\./).map(squash).filter(Boolean)) {
      if (!source.includes(part)) problems.push(`${example.title}: not in the saved interview: "${part.slice(0, 80)}"`);
    }
  }
});

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`verbatim check OK (${examples.length} examples)`);
```

```bash
node /path/to/check-verbatim.mjs examples.json interview-1.txt interview-2.txt
```

Expected: `verbatim check OK (2 examples)`. It splits each piece at its ellipses and requires every part to be found word for word (whitespace aside) in that person's interview. (Tried while writing the plan on sample files: a reworded request fails with the offending words.) Nothing to commit in this task.

### Task 16: The site's phone-sized frame

New site behaviour, decided by the owner (Q3): an optional `previewFrame: 'phone'` on `Template` makes the live preview a 390px-wide iframe, centred, instead of filling the dialog. The iframe really is 390px wide (nothing is scaled), so the template's own phone layout is what runs. Below the dialog's own full-screen breakpoint the frame is dropped. Esc forwarding, no-reload tab switching and `usePreviewNav` are untouched.

**Files (all under `packages/site/`):**
- Modify: `src/data/templates.ts` (the type only; the entry is Task 18), `src/components/TemplatePreview.tsx`, `src/components/TemplatePreview.test.tsx`, `src/App.css`

- [ ] **Step 1: Write the failing tests**

In `src/components/TemplatePreview.test.tsx`, add two imports at the top:

```ts
import { readFileSync } from 'node:fs';
import path from 'node:path';
```

and a `describe` at the end of the file's top-level `describe('TemplatePreview', …)`. It uses a copy of an existing template that asks for the frame, so it does not depend on the mobile-app entry (Task 18). The third test reads the stylesheet as text, because happy-dom has no layout: it keeps the frame's breakpoint tied to the dialog's.

```tsx
  describe('the phone-sized frame', () => {
    // A copy of an existing template that asks for the frame, so this test does
    // not depend on which real template does.
    const phone = { ...monitoring, previewFrame: 'phone' as const };

    it('is asked for by a template that sets previewFrame', () => {
      const { container } = render(<TemplatePreview template={phone} code={code} onClose={vi.fn()} />);
      expect(container.firstElementChild).toHaveClass('template-preview--phone');
    });

    it('is not asked for by a template that does not', () => {
      const { frame } = renderPreview();
      expect(frame.closest('.template-preview')).not.toHaveClass('template-preview--phone');
    });

    it('keeps everything else about the preview: the same iframe, the tabs, and Esc forwarding', async () => {
      const onClose = vi.fn();
      render(<TemplatePreview template={phone} code={code} onClose={onClose} />);
      const frame = screen.getByTitle('AI Product Monitoring live preview') as HTMLIFrameElement;
      expect(frame).toHaveAttribute('src', './live/monitoring/index.html');
      const inside = giveWindow(frame);
      fireEvent.load(frame);
      inside.dispatchEvent(escape());
      expect(onClose).toHaveBeenCalledTimes(1);
      await userEvent.click(screen.getByRole('tab', { name: 'Code' }));
      await userEvent.click(screen.getByRole('tab', { name: 'Live preview' }));
      expect(screen.getByTitle('AI Product Monitoring live preview')).toBe(frame);
    });

    // happy-dom has no layout, so the CSS is checked as text: the frame must be
    // drawn only above the width where the dialog stops being full screen, or a
    // phone would get a 390px frame inside a 390px screen.
    it('is drawn only above the dialog’s full-screen breakpoint, 390px wide', () => {
      const css = readFileSync(path.resolve(__dirname, '../App.css'), 'utf8');
      expect(css).toMatch(/@media \(max-width: 640px\)\s*\{\s*\.preview-dialog\s*\{[^}]*width: 100vw/);
      expect(css).toMatch(/@media \(min-width: 641px\)\s*\{\s*\.template-preview--phone \.template-preview-body iframe,[^}]*width: 390px/);
    });
  });
```

The block above is the whole `describe`; it goes just before the file's own closing `});`.

- [ ] **Step 2: Run it to verify it fails**

Run (from `packages/site`): `npx vitest run src/components/TemplatePreview.test.tsx`
Expected: FAIL (`previewFrame` is not a property of `Template`, no `template-preview--phone` class, no phone rule in the stylesheet).

- [ ] **Step 3: Write the code**

In `src/data/templates.ts`, end the `Template` interface with the new optional field:

```ts
  livePreviewPath: string;
  /**
   * Set for a template designed for a phone. The live preview is then shown in
   * a frame 390 CSS pixels wide (a real iframe of that width, so the template's
   * own phone layout runs, not a scaled-down copy of its wide one) instead of
   * filling the dialog. At 640px and below the dialog is already the size of a
   * phone, so the frame is dropped there and the template runs at the
   * visitor's real width. Leave it out for everything else.
   */
  previewFrame?: 'phone';
}
```

In `src/components/TemplatePreview.tsx`, add this to the comment above the component (after the "Note for forks" lines) and change the root element's class:

```tsx
// A template with previewFrame: 'phone' gets an extra class, and App.css then
// draws its iframe 390px wide and centred (above 640px). Nothing else about the
// preview changes: same iframe, same tabs, same Esc forwarding.
```

...and the root element, from `<div className="template-preview">` to:

```tsx
    <div className={template.previewFrame === 'phone' ? 'template-preview template-preview--phone' : 'template-preview'}>
```

In `src/App.css`, directly after the `.template-preview-code` rule (before the "Live preview iframe stays mounted" comment), add:

```css
/* A template designed for a phone (Template.previewFrame === 'phone') is shown
   in a frame 390px wide instead of filling the dialog, so it runs its own
   phone layout. The iframe really is 390px wide: nothing is scaled, and its
   border is the only "device" drawn. The loading cover is centred over the
   same box. Above 640px only: at 640px and below (the same breakpoint as the
   dialog's own full-screen rule above) the dialog is already phone-sized and
   the template runs at the visitor's real width. */
@media (min-width: 641px) {
  .template-preview--phone .template-preview-body iframe,
  .template-preview--phone .template-preview-loading {
    width: 390px;
    max-width: 100%;
    margin-inline: auto;
  }

  .template-preview--phone .template-preview-loading {
    inset-inline: 0;
  }
}
```

The breakpoint is 641px because the dialog's own full-screen rule is `@media (max-width: 640px)`; the third test above keeps the two tied together.

- [ ] **Step 4: Run the tests, then look at it**

Run (`packages/site`): `npx vitest run src/components/TemplatePreview.test.tsx` (expected PASS) and `npx tsc --noEmit`. The visual check is Task 20 (it needs the Mobile App's build and entry).

- [ ] **Step 5: Commit**

```bash
git add packages/site
git commit -m "feat(site): an optional phone-sized frame for the live preview" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 17: The screenshot

**Files:**
- Create: `packages/site/public/screenshots/mobile-app.png`

The site's screenshot frame draws every image at the width of the section, so a portrait phone capture would be stretched to about 2000px tall. This plan therefore captures **the running app in a 390 x 740 frame, centred near the top of a 1440 x 900 canvas** (the same shape as the other screenshots), with the bottom of the canvas left clear for the site's gradient and its "Run the live demo" button. It looks like what the preview dialog shows. (Deviation from spec §10, which only asks that it "look like a phone app, not a wide page"; a portrait capture would need new site CSS.)

- [ ] **Step 1: Take it**

Run `pnpm --filter mobile-app-template dev --port 5199 --strictPort` and, outside the repo, this script with the same `puppeteer-core` setup as Task 13 (`node screenshot.mjs http://localhost:5199/ <repo>/packages/site/public/screenshots/mobile-app.png`):

```js
// Takes the Templates-page screenshot of the mobile-app template: the running app in a
// 390 x 740 frame, centred near the top of a 1440 x 900 canvas, with room underneath for the
// site's gradient and "Run the live demo" button. Kept OUTSIDE the repo.
// Usage: node screenshot.mjs <url of the running app, e.g. http://localhost:5199/> <output .png>
import puppeteer from 'puppeteer-core';

const [url, output] = process.argv.slice(2);
const exe = process.env.CHROMIUM ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
// #1a1a2e is --color-base and #3c3c5e is --color-border-default (this file is not part of the package, so a hex literal is fine here).
await page.setContent(`<!doctype html><body style="margin:0;height:100vh;background:#1a1a2e;display:flex;justify-content:center;align-items:flex-start;padding-top:40px;box-sizing:border-box">
  <iframe src="${url}#/devices" width="390" height="740" style="border:1px solid #3c3c5e;border-radius:6px;background:#1a1a2e"></iframe></body>`);
await sleep(2500);
await page.screenshot({ path: output, type: 'png' });
await browser.close();
console.log('saved', output);
```

If you have no tool that can capture it, leave the file for the owner and say so in the PR (Task 18's screenshot test fails until it exists, so do not merge).

- [ ] **Step 2: Check it**

Run: `ls -l packages/site/public/screenshots/mobile-app.png` (expected 1440x900, about 40 KB; the other screenshots are 76 to 134 KB; keep it under about 200 KB) and open it: the app bar with the Demo badge, "Devices", the first rooms' rows with blue switches, the bottom nav, the phone frame centred with empty space below it, no cyan or yellow. Nothing to commit yet (Task 18 commits it with the entry).

### Task 18: Site data, copy, Code tab

**Files (all under `packages/site/` unless noted):**
- Modify: `src/data/templates.ts`, `src/data/templates.test.ts`, `src/content/templateContent.ts`, `src/content/templateContent.test.ts`, `src/content/codeTabs.json`, `src/content/staticHtml.ts`, `src/content/staticHtml.test.ts`

- [ ] **Step 1: Write the failing tests**

In `src/data/templates.test.ts`, inside `describe('templates', …)`, add (before the screenshot-exists test):

```ts
  it('looks up the mobile app and gives it a blue accent distinct from the others', () => {
    expect(getTemplate('mobile-app')?.name).toBe('Mobile App');
    expect(getTemplate('mobile-app')?.accentHex).toBe('#5b9cff');
  });

  it('asks for the phone-sized preview frame only where the template is made for a phone', () => {
    expect(TEMPLATES.filter((item) => item.previewFrame === 'phone').map((item) => item.slug)).toEqual(['mobile-app']);
  });
```

In `src/content/templateContent.test.ts`, add this test after the landing page's, and add one line to the existing "describes each template's own limits in notFor" test (after the landing line):

```ts
  it('gives the mobile app fit copy that says plainly nothing is controlled or sent, and two examples', () => {
    const content = TEMPLATE_CONTENT['mobile-app']!;
    expect(content.useIf).toHaveLength(3);
    expect(content.headsUp).toMatch(/nothing is controlled or sent/);
    expect(content.headsUp).toMatch(/screens, not the hub/);
    expect(content.examples).toHaveLength(2);
    for (const example of content.examples) {
      expect(example.requests.length, example.title).toBeGreaterThan(0);
      expect(example.title, 'the title names the person').toMatch(/^An? /);
    }
  });
```

```ts
    expect(TEMPLATE_CONTENT['mobile-app']!.notFor).toMatch(/real devices or install it on a phone/);
```

The existing test also forbids a `notFor` that names another kind of app (`/landing page|dashboard|mobile app/i`); the mobile app's own `notFor` passes it because it describes this template's limits only.

In `src/content/staticHtml.test.ts`, change the description test to name four templates:

```ts
  it('names all four templates in the description a link preview and a search result show', () => {
    expect(head).toContain('an AI monitoring dashboard, an agent control panel, a landing page and a mobile app');
  });
```

- [ ] **Step 2: Run them to verify they fail**

Run (from `packages/site`): `npx vitest run src/data src/content`
Expected: FAIL (no `mobile-app` entry or copy; the description does not name the mobile app).

- [ ] **Step 3: Add the template entry**

In `src/data/templates.ts`, add after the `landing` entry (`slug:` immediately followed by `name:`, plain single-line quoted strings with no quote inside: `scripts/check-templates-readme.mjs` reads this file as text):

```ts
  {
    slug: 'mobile-app',
    name: 'Mobile App',
    tagline: 'A home device controller built for a phone: bottom navigation, on/off switches and sliders in a list, one-tap scenes and a pairing form.',
    accentLabel: 'Blue',
    accentHex: '#5b9cff',
    screenshotSrc: './screenshots/mobile-app.png',
    livePreviewPath: './live/mobile-app/index.html',
    previewFrame: 'phone',
  },
```

- [ ] **Step 4: Add the section copy**

In `src/content/templateContent.ts`, add after the `landing` entry (wording is spec §11; `examples` come from Task 15, in the `ExampleCase` shape the other entries use, verbatim):

```ts
  'mobile-app': {
    code: CODE_TABS['mobile-app']!,
    useIf: [
      'a small control app people will use on their phone',
      'the front end of an app you will later connect to real devices or a backend',
      'something with a list, switches, a form and a few settings',
    ],
    headsUp:
      'This is a demo: the home and its devices are made up, and nothing is controlled or sent. You get the screens, not the hub. Your AI can help you connect yours.',
    notFor: "if you need to talk to real devices or install it on a phone. The devices are made up, and it's a web page with no saved data.",
```

```ts
    examples: [
      /* the two chosen examples from Task 15, verbatim, in the interview order */
    ],
  },
```

The existing comment above `TEMPLATE_CONTENT` (examples are role-plays, never reworded; `notFor` states this template's own limits and never names another kind of app) already covers the new entry; add no comment of your own unless something differs from the other entries.

- [ ] **Step 5: Name the mobile app in the site's description**

In `src/content/staticHtml.ts` the description currently reads `such as an AI monitoring dashboard, an agent control panel and a landing page.` Change that part to `such as an AI monitoring dashboard, an agent control panel, a landing page and a mobile app.` (the rest of the string stays). `llms.ts` and the `<noscript>` list derive from `TEMPLATES` and `TEMPLATE_CONTENT` and need no edit; `sitemap.xml` lists only the site root.

- [ ] **Step 6: Write the Code tab entry**

Add the `"mobile-app"` entry below to `src/content/codeTabs.json` after `"landing"` (add the comma). Principles must be true and each excerpt copied **verbatim** from the merged package. The block below was generated by slicing the real package files (with a script that checks each anchor line still starts as expected) and passes the repo's own `check:code-tab`; **re-copy from the merged files if anything changed since** (open the file, copy the lines, keep indentation, one array entry per line), then run `npm run check:code-tab`.

```json
  "mobile-app": {
    "principles": [
      {
        "name": "Single source of truth",
        "detail": "All app state changes in one reducer.",
        "file": "src/state/reducer.ts",
        "excerpt": [
          "// The one place state changes. Every screen reads from AppState and describes a",
          "// change as an Action; nothing else holds app data (the form fields and which",
          "// sheet is open are screen state, not app state)."
        ]
      },
      {
        "name": "Typed and exhaustive",
        "detail": "Screens are one tuple, and a missing case fails to compile.",
        "file": "src/router/useHashRoute.ts",
        "excerpt": [
          "export const ROUTES = ['devices', 'scenes', 'settings', 'add'] as const;",
          "export type Route = (typeof ROUTES)[number];"
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
        "file": "src/screens/AddDeviceScreen.test.tsx",
        "excerpt": [
          "  it('rejects an empty name: shows the error, links it to the field, keeps focus there and adds nothing', async () => {",
          "    const leave = vi.fn();",
          "    render(<Harness leave={leave} />);",
          "    await userEvent.type(code(), 'ab12cd');",
          "    await userEvent.click(save());",
          "    expect(name()).toHaveAttribute('aria-invalid', 'true');",
          "    expect(name()).toHaveAccessibleDescription('Enter a name for the device.');",
          "    expect(name()).toHaveFocus();"
        ]
      },
      {
        "name": "Phone rules in one place",
        "detail": "Touch targets, safe areas and dvh live in one stylesheet.",
        "file": "src/App.css",
        "excerpt": [
          ".touch-switch label {",
          "  display: inline-flex;",
          "  align-items: center;",
          "  min-height: var(--touch);",
          "}"
        ]
      },
      {
        "name": "Content as data",
        "detail": "Swap the devices by editing one file.",
        "file": "src/data/devices.ts",
        "excerpt": [
          "export const STARTING_DEVICES: Device[] = [",
          "  { id: 'desk-lamp', name: 'Desk lamp', room: 'Living room', kind: 'light', status: 'online', on: true, brightness: 70 },",
          "  { id: 'tv-plug', name: 'TV plug', room: 'Living room', kind: 'plug', status: 'online', on: true },"
        ]
      }
    ],
    "folders": [
      {
        "path": "src/screens",
        "purpose": "The four screens: Devices, Add device, Scenes and Settings."
      },
      {
        "path": "src/components",
        "purpose": "The app bar, bottom nav, device row and sheet, and the touch-target wrapper."
      },
      {
        "path": "src/state",
        "purpose": "The reducer: the one place state changes."
      },
      {
        "path": "src/data",
        "purpose": "The devices, scenes, settings and words. Your product goes here."
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
        "purpose": "Temperature units and device descriptions."
      },
      {
        "path": "src/icons",
        "purpose": "Inline SVG icons."
      }
    ]
  }
```

Principles map to spec §11: Single source of truth (state in one reducer, content in `src/data/`: the reducer's header comment), Typed and exhaustive (the `ROUTES` tuple; the action union and `Record<DeviceKind, …>` are named in the README), No inline styles (the test's `visit` function, the same lines landing's and monitoring's entries show), Tested (the empty-name test: error, linked description, focus), Phone rules in one place (the `.touch-switch label` rule), Content as data (the first starting devices). Folders: each must exist.

- [ ] **Step 7: Run the checks**

Run (`packages/site`): `npx vitest run` (expected all PASS, including the screenshot-exists test now that Task 17's file is there) and `pnpm run build` (expected clean). From the repo root: `npm run check:code-tab` (expected `code tab OK (4 templates checked)`). `npm run check:templates-readme` and `npm run check:template-builds` will FAIL until Task 19; that is expected here.

- [ ] **Step 8: Commit**

```bash
git add packages/site
git commit -m "feat(site): publish the Mobile App: entry, copy, Code tab, screenshot and description" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 19: Wire the build and the README

Make the live preview exist locally and in production, and keep the README table honest.

**Files:**
- Modify: `packages/site/scripts/sync-template-builds.mjs`, `.github/workflows/deploy.yml`, `README.md` (repo root), `package.json` (repo root, the `description` only)

- [ ] **Step 1: Sync script.** In `packages/site/scripts/sync-template-builds.mjs` add a fourth object, one per line (`scripts/check-template-builds.mjs` parses this list):

```js
const TEMPLATE_BUILDS = [
  { slug: 'monitoring', pnpmFilter: 'monitoring-template' },
  { slug: 'agent-panel', pnpmFilter: 'agent-panel-template' },
  { slug: 'landing', pnpmFilter: 'landing-template' },
  { slug: 'mobile-app', pnpmFilter: 'mobile-app-template' },
];
```

- [ ] **Step 2: Deploy workflow.** In `.github/workflows/deploy.yml` add a step directly after "Build landing template":

```yaml
      - name: Build mobile-app template
        run: pnpm --filter mobile-app-template run build
```

and extend the combine step (keep the existing lines):

```yaml
          mkdir -p packages/site/dist/live/mobile-app
          cp -r packages/mobile-app/dist/. packages/site/dist/live/mobile-app/
```

(`.github/workflows/checks.yml` already has the template in its matrix from Task 14.)

- [ ] **Step 3: README row.** In the root `README.md` `## Templates` table add, below the Landing Page row:

```markdown
| [Mobile App](packages/mobile-app) | A home device controller built for a phone: bottom navigation, on/off switches and sliders in a list, one-tap scenes and a pairing form. |
```

In the root `package.json`, extend the `description` from `React starter templates (AI monitoring dashboard, agent control panel, landing page) built with cyberui-2045` to `React starter templates (AI monitoring dashboard, agent control panel, landing page, mobile app) built with cyberui-2045`. (Nothing reads it, but it should not go stale.)

- [ ] **Step 4: Verify everything the integration touches**

Run from the repo root: `pnpm install --frozen-lockfile` (succeeds; the lockfile already has the importer from PR A), `npm run test:scripts`, `npm run check:templates-readme`, `npm run check:code-tab`, `npm run check:license`, `npm run check:process-excerpts`, `npm run check:template-builds` (all pass; the last prints `template builds OK (4 templates checked)`). Prove the drift check can fail for the new template: temporarily delete the `mobile-app` copy line from `deploy.yml`, run `npm run check:template-builds` (expected exit 1 naming the missing copy), and restore the line. Do not commit the broken state.

- [ ] **Step 5: Commit**

```bash
git add packages/site/scripts .github/workflows/deploy.yml README.md package.json
git commit -m "ci: build and deploy the mobile app; list it in the README" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 20: Look at the published page, verify everything, open PR B

**Files:** none (fixes go in the file they belong to, each its own commit); the spec gets a findings section.

- [ ] **Step 1: Run the whole suite and the production builds**

Run: `pnpm -r run build` and `pnpm -r --workspace-concurrency=1 run test` (monitoring, agent-panel, landing, mobile-app and the site; expected all PASS; the site has 183 tests in 30 files once the Task 16 and 18 tests are in), then from the repo root `npm run test:scripts` and the five checks (`check:process-excerpts`, `check:templates-readme`, `check:code-tab`, `check:license`, `check:template-builds`). The package tests run in CI (`package-tests`); report the local run too.

- [ ] **Step 2: Start the site with all four real builds**

Run: `pnpm --filter cyberui-templates-site run sync-templates` (builds and copies all four) then `pnpm --filter cyberui-templates-site run dev --port 5201 --strictPort`; open `#/templates`.

- [ ] **Step 3: Check each item and fix what fails**

Desktop (about 1440px):
- [ ] Four sections in order (monitoring, agent-panel, landing, mobile-app), one h1 "Templates"; each hero shows its own accent (cyan, violet, orange, blue) only on its badge, "Run the live demo" and Copy start prompt; no blue leaks into the folds, the Heads-up or the dialog chrome.
- [ ] The Mobile App screenshot shows the phone-framed app near the top, and the frame has the dark bottom gradient and the visible "Run the live demo" button without it covering the nav.
- [ ] The dialog opens at `#/templates/mobile-app`; the preview iframe is **390px wide and centred** (measured while writing the plan in a 1440x900 window: the dialog 1283x810, the iframe 390x660 at its centre), the Code tab shows six principles with excerpts and the folder tree (nine lines: the root and eight folders), and tabs switch without reloading the preview.
- [ ] The Heads-up reads "This is a demo: the home and its devices are made up, and nothing is controlled or sent…" and "Probably not for you" reads "…if you need to talk to real devices or install it on a phone. The devices are made up, and it's a web page with no saved data."
- [ ] Esc, the close button and a backdrop click close the dialog; Back closes it and stays on Templates; reloading with the dialog open reopens it.
- [ ] Copy start prompt puts a prompt naming `packages/mobile-app` on the clipboard; the terminal fold shows `npx --yes tiged patrickkuei/cyberui-templates/packages/mobile-app my-app`.
- [ ] Home says "4 templates ready." and does not list templates by name.

**Inside the preview (Review Focus 14; the plan's scratch run did these with `site-check.mjs`):**

```js
// Checks the live preview dialog of the site with the mobile-app template, in a real Chromium. Kept OUTSIDE the repo.
// Usage: node site-check.mjs <site url, e.g. http://localhost:5201/> [path to a Chromium or Edge executable]
import puppeteer from 'puppeteer-core';

const base = process.argv[2] ?? 'http://localhost:5201/';
const exe = process.argv[3] ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const out = {};

const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const frameOf = async () => (await (await page.waitForSelector('dialog[open] iframe')).contentFrame());
const state = () => page.evaluate(() => ({ hash: location.hash, dialogOpen: !!document.querySelector('dialog[open]'), historyLength: history.length }));
const clickIn = async (frame, text) => { const handle = await frame.evaluateHandle((t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === t), text); await handle.asElement().click(); };

// A: open, pair a device inside the iframe (Add -> fill -> Save), the dialog must still be open on #/templates/mobile-app
await page.goto(base + '#/templates/mobile-app', { waitUntil: 'networkidle0' });
let frame = await frameOf(); await sleep(800);
out.frameWidth = await page.evaluate(() => document.querySelector('dialog[open] iframe').getBoundingClientRect().width);
await clickIn(frame, 'Add device'); await sleep(400);
out.afterAdd = { siteHash: (await state()).hash, frameHash: await frame.evaluate(() => location.hash) };
await frame.type('input[name=name]', 'Shelf lamp'); await frame.type('input[name=code]', 'ab12cd');
await clickIn(frame, 'Save device'); await sleep(600);
out.afterSave = { ...(await state()), frameHash: await frame.evaluate(() => location.hash), h1: await frame.evaluate(() => document.querySelector('h1').textContent), notice: await frame.evaluate(() => document.querySelector('.notice-text').textContent.slice(0, 40)) };

// B: with the iframe's history changed, the dialog's close button must still close it (usePreviewNav replaces)
await page.click('dialog[open] .preview-dialog-header button'); await sleep(700);
out.afterCloseButton = await state();

// C: Escape pressed inside the running app closes the dialog (the site forwards it)
await page.goto('about:blank'); await page.goto(base + '#/templates/mobile-app', { waitUntil: 'networkidle0' });
frame = await frameOf(); await sleep(800);
await frame.focus('.device-main'); await page.keyboard.press('Escape'); await sleep(700);
out.escapeInsideApp = await state();

// D: Escape with the device sheet open closes the sheet and the dialog together (documented in the README)
await page.goto('about:blank'); await page.goto(base + '#/templates/mobile-app', { waitUntil: 'networkidle0' });
frame = await frameOf(); await sleep(800);
await frame.click('.device-main'); await sleep(900);
out.sheetOpen = await frame.evaluate(() => !!document.querySelector('.device-sheet'));
await page.keyboard.press('Escape'); await sleep(900);
out.escapeWithSheetOpen = { ...(await state()), sheetStillOpen: await (async () => { try { return await frame.evaluate(() => !!document.querySelector('.device-sheet')); } catch { return 'frame gone'; } })() };

// E: tab switching does not reload the preview (a state change inside it survives)
await page.goto('about:blank'); await page.goto(base + '#/templates/mobile-app', { waitUntil: 'networkidle0' });
frame = await frameOf(); await sleep(800);
await frame.click('.touch-switch label'); await sleep(200);
const before = await frame.evaluate(() => document.querySelector('.device-row input[type=checkbox]').checked);
await page.evaluate(() => [...document.querySelectorAll('dialog[open] [role=tab]')].find((t) => t.textContent === 'Code').click()); await sleep(300);
await page.evaluate(() => [...document.querySelectorAll('dialog[open] [role=tab]')].find((t) => t.textContent === 'Live preview').click()); await sleep(300);
out.noReloadOnTabSwitch = { switchAfterClick: before, switchAfterTabsSwitched: await frame.evaluate(() => document.querySelector('.device-row input[type=checkbox]').checked), note: 'the first switch starts on, so false on both means the preview was not reloaded' };

// F: the Code tab lists six principles and eight folders
await page.evaluate(() => [...document.querySelectorAll('dialog[open] [role=tab]')].find((t) => t.textContent === 'Code').click()); await sleep(300);
out.codeTab = await page.evaluate(() => ({ principles: document.querySelectorAll('dialog[open] .code-tab-principle').length, folderTreeLines: document.querySelector('dialog[open] .terminal-pre-tree').textContent.trim().split(String.fromCharCode(10)).length }));

console.log(JSON.stringify(out, null, 1));
await browser.close();
```

```bash
node site-check.mjs http://localhost:5201/
```

Expected, from the run while writing the plan: the frame is 390px wide; Add device inside the iframe changes the iframe's hash and not the site's; saving a device returns to Devices inside the iframe with the dialog still open and the pairing notice shown; with the iframe's history changed, the dialog's close button still closes it (`#/templates`); Esc pressed inside the app closes the dialog; Esc with the device sheet open closes the sheet and the dialog together (the README says so); the preview is not reloaded when you switch to Code and back; the Code tab has six principles and nine tree lines.

```text
{
 "frameWidth": 390,
 "afterAdd": {
  "siteHash": "#/templates/mobile-app",
  "frameHash": "#/add"
 },
 "afterSave": {
  "hash": "#/templates/mobile-app",
  "dialogOpen": true,
  "historyLength": 3,
  "frameHash": "",
  "h1": "Devices",
  "notice": "Added Shelf lamp to Living room. Templat"
 },
 "afterCloseButton": {
  "hash": "#/templates",
  "dialogOpen": false,
  "historyLength": 3
 },
 "escapeInsideApp": {
  "hash": "#/templates",
  "dialogOpen": false,
  "historyLength": 4
 },
 "sheetOpen": true,
 "escapeWithSheetOpen": {
  "hash": "#/templates",
  "dialogOpen": false,
  "historyLength": 6,
  "sheetStillOpen": "frame gone"
 },
 "noReloadOnTabSwitch": {
  "switchAfterClick": false,
  "switchAfterTabsSwitched": false,
  "note": "the first switch starts on, so false on both means the preview was not reloaded"
 },
 "codeTab": {
  "principles": 6,
  "folderTreeLines": 9
 }
}
```

If any of these fail, the likely cause is `leaveAdd` (Review Focus 4), the frame's breakpoint (Review Focus 14) or the Escape forwarding; fix it in the file it belongs to.

Phone (390px): no sideways scroll on `/templates`; the dialog is full-screen; the preview inside it (about 358px wide) is the Mobile App at the visitor's real width, **not** a 390px frame inside a 358px box (the frame rule is off at 640px and below); at 600px the iframe is as wide as the dialog allows (568px measured).

Reduced motion: the dialog appears with no fade; inside the preview there are no transitions on tabs and rows.

- [ ] **Step 4: Record what you found** in a short "Findings from checking the published page" section at the end of `docs/superpowers/specs/2026-10-17-mobile-app-design.md`, stating plainly what was not checked (the real production deploy, which only happens after merge; `npx tiged …/packages/mobile-app` against the published repo, unless Task 12 Step 5 has now been run; Firefox, WebKit, a real phone and a screen reader).

- [ ] **Step 5: Commit, push, open PR B**

```bash
git add docs/superpowers/specs/2026-10-17-mobile-app-design.md
git commit -m "docs: record findings from checking the published Mobile App" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git push -u origin feat/site-mobile-app
gh pr create --base main --title "feat(site): publish the Mobile App template, with a phone-sized preview frame" --body "<summary, including the one new site behaviour (the previewFrame field, its tests and the 15-line CSS rule); what was and was not checked; the interviews were role-plays run by subagents and kept verbatim; library issues filed; Closes #48>"
```

The PR body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. Do not merge. The owner ticks the checkbox in the tracking issue #1 by hand.

- [ ] **Step 6: After the owner merges, look at the deployed site**

Watch the Deploy site run (`gh run watch`), then at `https://patrickkuei.github.io/cyberui-templates/`: `llms.txt` lists the Mobile App; `#/templates/mobile-app` opens the dialog with the live preview at 390px (this is the first time the *production* build is served from a subpath: the template's `base: './'` and the iframe's relative URL must resolve; open a device sheet and Add device inside it); the screenshot loads; and `npx --yes tiged patrickkuei/cyberui-templates/packages/mobile-app /tmp/check && cd /tmp/check && npm install && npm run build && npm test` passes. Record the result in a comment on PR B or in the spec. If anything is wrong, fix it in a follow-up PR; do not edit the merged ones.

---

## Self-review notes

**Spec coverage.** §1 goals: a phone-first app with bottom navigation, a pushed screen, a list acted on with a thumb, a form, safe areas and `dvh` (Tasks 4-10), forkable (Tasks 2, 12), held at 320/390/800 in a real browser (Task 13). §2 fiction and names (Task 4 data; Kestrel and generic device names). §3.1 routes: the `ROUTES` tuple, `Record<Route, …>` maps, default `devices`, unknown hash falls back, focus to the `h1` on a route change (Tasks 4, 8, 9). §3.2 screens: Devices, Add device, Scenes, Settings and the device sheet (Tasks 7, 8). §3.3 bottom nav, three links, `aria-current`, safe-area padding, 44px+ tabs, hidden on Add device (Tasks 6, 9, 10). §3.4 what is real, and no swipe (Tasks 5, 7, 8). §3.5 the phone rules: touch targets (`TouchRow`, `.touch-*`, Tasks 6, 10, 13), safe areas (index.html, App.css, Task 13's emulated insets), `dvh`, reduced motion, no hover-only controls, the on-screen keyboard (a sticky Save row, 16px fields: the real keyboard is not checked), text size, landmarks and focus. §3.6 what is mock and how the app says so (Global Constraints; Tasks 5, 8, 9, 10). §4 theming and the hex test (Tasks 3, 13). §5 data and the reducer (Tasks 4, 5), the README's "Where your data goes" (Task 11). §6 structure and patterns (Tasks 2-10), each new pattern with its forker-facing comment. §7 components (Task 1) and library issues (comments citing #120 to #125; Task 14). §7.1 the four upstream feature requests (Task 14). §8 tests (every task) and the browser check (Task 13). §9 self-containment (Tasks 2, 12, and the `fork-install` matrix in 14). §10 integration (Tasks 15-20) and §10.1 the phone frame (Task 16, verified in Task 20). §11 copy (Task 18), examples (Task 15). §12 verification and what is not verified (Task 13 Step 6 and the lists below). Issue #48: spec, plan and the two PRs; the preview-dialog decision (Task 16); the check at 320, 390 and 800px (Task 13); library findings upstream (Task 14).

**Not covered, by design:** talking to real devices, accounts, notifications, a PWA manifest, persistence, i18n, a light theme, swipe gestures, a side rail at wide widths, a library `BottomNav`/`SwipeableRow`/`BottomSheet` in this repo, the community template (#49), any change to cyberui-2045.

**Names used consistently across tasks:** `ROUTES`, `Route`, `TabRoute`, `TAB_ROUTES`, `useHashRoute`, `leaveAdd`, `AppState`, `Action`, `reducer`, `createInitialState`, `STARTING_DEVICES`, `BRIGHTNESS`, `SCENES`, `DEFAULT_SETTINGS`, `PRODUCT_NAME`, `DEMO_BADGE`, `DEMO_NOTE`, `ROUTE_TITLES`, `KIND_LABELS`, `ADD_DEVICE`, `pairedMessage`, `SETTINGS_COPY`, `DEVICE_KINDS`, `DEVICE_STATUSES`, `ROOMS`, `TARGET_C`, `toDisplay`, `formatTemp`, `fromDisplay`, `sliderScale`, `describeDevice`, `rowButtonId`, `SCREEN_TITLE_ID`, `TouchRow`, `KIND_ICONS`, `TAB_ICONS`; the class names `touch-switch`, `touch-slider`, `touch-radios`, `slider-control`, `device-sheet` (App.css, `phoneRules.test.ts` and the components agree on them). Regions and names the tests scope with: the room headings ("Living room", "Bedroom", "Hall"), the dialog "Desk lamp controls", the switch names "Desk lamp power" (rows) and "Power" (sheet), the navigation "Main".

**Deviations from the spec** (also in the final report; none is silent):
1. **The bottom nav is `position: sticky` inside the app column, not fixed** (spec §3.3 says "fixed at the foot of the app shell"). A sticky bar cannot leave the column, so the centred-column layout at 800px+ needs no re-centring; in a single-column shell it behaves as fixed.
2. **`usePrefersReducedMotion` is not copied** (spec §6.1 lists it). Nothing in the app needs it in JavaScript: the only transitions are CSS under `prefers-reduced-motion: no-preference` (guarded by `phoneRules.test.ts`) and the library's Drawer honours the setting itself. A hook nobody calls would be dead weight in a fork.
3. **`Notification` is not used** (spec §7 says "possibly"). Its close button is a 20px icon, below the 44px rule; a `role="status"` paragraph and a `Button` named Dismiss do the job.
4. **The sheet's controls are a `switch` over the device kind, not a `Record<DeviceKind, Component>`** (spec §5 says a Record for "which controls the sheet shows"): TypeScript cannot match a component picked from a Record to the narrowed device it needs. The return type excludes `undefined`, so a new kind without a case is still a compile error. Icons, labels and status badges are Records.
5. **Two guard tests beyond spec §8:** `noNetworkOrStorage.test.ts` (nothing sent or saved, enforced on the source, as well as the behavioural spies the spec asks for) and `phoneRules.test.ts` (the CSS-level phone rules; spec §12 left the `min-height` rule as "the guard, not a test").
6. **`Select` is used for Room and Type, `RadioGroup` only for the unit** (spec: "`Select` or `RadioGroup`"), and the template passes `variant="secondary"` to `Select`.
7. **Add device is left with Back or with a replace** depending on how it was reached (`leaveAdd`), which the spec only describes as "Back returns to Devices". This is more code than a link, and exists because `history.back()` from a page opened at `#/add` would leave the app, or undo the preview dialog opening on the site.
8. **Two workarounds the spec did not list**, both with comments and (after Task 14) issue numbers: a focus ring for `Toggle`, which draws none, and `touch-action: none` on the `Slider` wrapper. Both were found while writing the plan and measured.
9. **The `fork-install` matrix entry is in PR A**, where the spec's §10 table lists it with PR B's changes, so the clean-room install runs on CI before the template is merged.
10. **The screenshot is the app in a 390x740 frame on a 1440x900 canvas**, not a raw phone capture (Task 17), so the site's screenshot frame needs no change.
11. **The device sheet's closing button is the template's own "Done"**; the library's 32px × is switched off (`showCloseButton={false}`).

**Verified by reading code or running a command (while writing this plan, in scratch directories outside the repo, on Windows, Node 20.20.2, npm 10.8.2, pnpm 10.34.2, Vitest 4.1.12):**
- Every prop and behaviour in Task 1's table: read from `npm pack cyberui-2045@2.8.0` (`dist/components/*.d.ts` and the compiled `.js` for Drawer, Toggle, Slider, Input, Select, RadioGroup, Badge, Card, Button, SectionTitle, Notification, Checkbox, `hooks/useDialogBehavior.js`, `utils/responsive.js`, `utils/cn.js`), by `check-props.mjs`, and the stylesheet facts by search (no `env(`, `dvh`, `svh`, `lvh` or `touch-action`; five `@media (hover:hover)` blocks and no `:hover` outside them; the reduced-motion static glow; the colour tokens).
- The package in this plan: `tsc --noEmit` clean, `vite build` clean, 154 tests in 23 files pass with no warnings, 26 mutations all caught, a clean-room copy installed with plain `npm install` on npm 10.8.2 (128 packages, no warnings), built and tested; `check-standalone.mjs` passes; the license is identical; the README's links all resolve; the contrast numbers (6.21 and 4.87) computed with `contrast.mjs`.
- In real browsers (Edge 155 through `puppeteer-core`, and the Claude Browser pane): no sideways scroll at 320, 390 and 800px on all four screens; every touch target measured (44px or more); the widened slider hit areas (a real mouse click 10px above the track moved the value; `elementFromPoint` bands of 44 and 48px); the sheet (steady blue border, `animation-name: none`, 368px high at 320x568, 34px bottom padding under emulated insets, Done 34px above the bottom, nav and app bar taking their insets); no sticky hover under touch emulation; reduced-motion transitions; focus on the title after a route change and not on first load, also under StrictMode; `leaveAdd` both ways; the switch focus ring; the touch drag with and without `touch-action`; no cyan, yellow or magenta text on any screen.
- PR B in a scratch copy of the repo: site tests 176 → 183 (30 files), `tsc`, `vite build`, `llms.txt` and `index.html` naming the Mobile App, `check:code-tab` (4 templates), `check:license`, `check:templates-readme`, `check:template-builds`; `pnpm install --lockfile-only` adds only the importer and `--frozen-lockfile` passes; the dialog in Edge at 1440x900 (iframe 390x660, centred) and 600px (frame dropped), and `site-check.mjs`.
- The existing CyberUI issue list (#116 to #125 open, none covering the new findings) and the filed-issue titles were read; **nothing was filed**.

**Assumed, not verified:**
- Everything that needs a real device or another engine: touch on a real phone, WebKit (iOS Safari, its collapsing toolbars and the `.device-sheet` `height: auto` inside a flex column) and Firefox, the on-screen keyboard resizing the page, real safe-area insets on a notch, a screen reader. The README says so.
- The persona interviews and so the example copy (`examples: []` is a placeholder until Task 15 runs), and `check-verbatim.mjs` against real interviews (it was tried only on sample files).
- The real repository's CI, `pnpm install` in the real repo with its `node_modules`, the real `deploy.yml` run, `sync-templates` for all four templates together (the scratch run built the mobile app and copied it by hand), the Templates page's other three sections with the four-template page, and `npx tiged` against the published repo (Tasks 12 and 20 do these).
- That `check:process-excerpts` passes: the scratch copy excluded `docs/`, so it could not run. Its evidence file quotes only the older specs and plans and `HeroScene.tsx`, and neither PR edits those, so it should be unaffected; Task 19's run is the proof.
- That the invented names (Kestrel and the eight device names) are not someone's trademark; they were chosen to be unremarkable and generic, not searched.
- That the owner agrees with deviations 1 to 11 above, in particular 3 and 8.
