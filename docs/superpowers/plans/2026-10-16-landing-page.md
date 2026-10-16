# Landing Page Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `packages/landing`, a self-contained orange-themed React + Vite template of a one-page marketing site for a fictional product (hero, logo strip, features, how it works, pricing with a working monthly/yearly switch, FAQ, a signup form, footer), built with cyberui-2045 and extractable with `npx tiged`, then publish it on the site's `/templates` page through the same path monitoring and agent-panel took.

**Architecture:** No router and no state beyond a billing toggle and a form. One typed list, `SECTIONS` (`src/sections.ts`), says which sections exist and in what order; `App.tsx` keeps their components in a `Record<SectionId, …>`, and `src/data/product.ts` keeps their headings and nav labels in two more. All content is plain typed data in `src/data/` (`product.ts`, `features.ts`, `plans.ts`, `faq.ts`). Plans carry a `Record<BillingPeriod, number>` price. Navigation scrolls with `scrollIntoView` and moves focus, and never writes `location.hash`. The accent is a two-token override of cyberui-2045 (`src/theme/orange.css`). The site publishes it by adding data (a `TEMPLATES` entry, its section copy, a Code tab entry, a screenshot) and wiring the build (sync script, `deploy.yml`, README row).

**Tech Stack:** React 19, TypeScript (strict), Vite 7, Vitest 4 with happy-dom and Testing Library, cyberui-2045 ^2.8.0 (`Button`, `Card`, `Badge`, `Toggle`, `Accordion`, `Steps`, `Drawer`, `Input`, `Divider`, `GradientText`, `SectionTitle`). No router, no chart library, no new runtime dependency. Node built-ins for the site-side scripts.

**Spec:** [docs/superpowers/specs/2026-10-16-landing-page-design.md](../specs/2026-10-16-landing-page-design.md) (approved; the owner answered Q1 to Q10 "fine as proposed", so every "proposed" decision in it is decided). Issue: [#47](https://github.com/patrickkuei/cyberui-templates/issues/47), item 3 of the tracking issue #1.

**Model to follow:** `packages/agent-panel` (structure, config, README, tests) and its plan, [2026-10-06-agent-panel.md](2026-10-06-agent-panel.md) (the two-PR split and the publishing tasks). Read `packages/agent-panel/README.md` and `src/App.tsx` before Task 1.

> **How much code this plan shows, and how it was checked.** Every file of the package is shown in full, because a plan that says "implement the hero" is useless to an implementer with no memory of the design. While writing this plan the whole package was built in a scratch directory **outside the repository** and exercised there: `tsc --noEmit` clean, `vite build` clean, 75 tests in 23 files passing, a clean-room `npm install` with no warnings, and a look at the running page in a real browser (1440px at the top of the page; 1024, 820, 768 and 390px for the layout; the Drawer; the pricing switch; the FAQ; the form error). The code below is that code, so it should pass as written; **your run is the real one**, and the checks that were not or could not be done are listed in the Self-review section. If a test and the code here disagree, the test is the intent. Do not rewrite the copy (headings, answers, plan text): it is part of what the owner approved. The PR B tasks (site wiring) were read against the current files but **not run**.

## Conventions for every task

- **Two pull requests.** PR A: Tasks 1-14 on branch `feat/landing-template` (the package, plus appending findings to the spec, plus `pnpm-lock.yaml`; nothing else outside `packages/landing`). PR B: Tasks 15-19 on branch `feat/site-landing`, started after PR A is merged (the Code tab's excerpts must exist in the package before `check:code-tab` accepts them, so **PR B cannot pass `check:code-tab` until PR A is merged**). Neither PR merges itself; the owner merges. Before PR A: the docs PR that carries the spec and this plan must be on `main` (the spec is edited in Tasks 13 and 19), so start with `git checkout main && git pull`.
- Work in `packages/landing` unless a step says otherwise (Tasks 1, 2, 12, 14 and 15-19 name where they run). Run package tests as `npx vitest run <path>` from the package, or `pnpm --filter landing-template test` from the repo root.
- Commit with two `-m` flags, the second being exactly: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Conventional commit prefixes as in the log (`feat(landing):`, `test(landing):`, `docs:`, `ci:`, `feat(site):`, `fix(site):`).
- Pull request bodies end with the line `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. PR A says `Refs #47`; PR B says `Closes #47`. The tracking issue #1 gets its checkbox ticked by hand (the owner does it).
- `pnpm` is the package manager. No `workspace:` ranges, and nothing in `packages/landing` imports outside its own folder.
- **Test first where a task has tests:** write the test files, run them and see them fail for the stated reason, write the implementation, see them pass. Run `npx tsc --noEmit` before each commit.
- **Use the Write/Edit tools to create the files in this plan, not shell heredocs.** Several files contain backslashes and quotes that a shell silently changes (this happened while writing the plan: a `'\\'` in a test became `'\'`).
- Do not add a `CLAUDE.md`, a skill or any process file to `packages/landing`: a forker would get dead weight (repo `CLAUDE.md`). Its documentation is its README and its code comments.

## Global Constraints

- **Standalone.** `packages/landing` installs and builds under plain `npm install` outside the monorepo (Task 12 proves it). `cyberui-2045` is `^2.8.0` from npm (never 2.7.x: responsive props such as `size={{ base: 'md', lg: 'lg' }}` have no effect above `base` before 2.8.0). No `workspace:` range, no import outside the package, a complete `tsconfig.json` (not `extends`), `vite.config.ts` with `base: './'`, a `LICENSE` identical to the root one, `"license": "MIT"`.
- **Honest about what is mock.** The signup sends nothing, the plan and header buttons only scroll, the footer links do nothing, every number, plan and logo is invented. The page says so **once**, in the footer line `Template demo: Tessera is fictional and the form sends nothing.` (no banner, no "(demo)" on buttons), plus the form's confirmation (it names the demo, because that is the moment someone has typed an email address), plus the README. Comments at each mock boundary (`SignupForm` `onSubmit`, the plan buttons in `PricingSection`, the footer links, `plans.ts`, `product.ts`) say so for a forker reading code. Tests assert the footer line and the confirmation exist.
- **Colour only through tokens.** The accent is `src/theme/orange.css`, which sets `--color-secondary` and `--color-accent` together to `#ff8a3d` and leaves `--color-primary` alone. No hex colour literal anywhere else in `src/**/*.css`; no JSX `style` attribute anywhere. Components read `var(--color-*)` only, never cyberui's internal Tailwind class names.
- **Exhaustive by type.** Anything keyed by a union (`SectionId`, `BillingPeriod`, `FeatureIcon`, `TerminalLineKind`) is a `Record<Union, …>`, never an `if/else` chain or a template string.
- **One h1, headings in order, landmarks** (`header`, `main`, `footer`), a skip link, every control keyboard-operable.
- **No `location.hash` writes.** Nav links, the skip link and the footer's placeholder links all call `preventDefault`; scrolling goes through `scrollToSection`.
- **Motion:** one CSS entrance for the hero at first load, none scroll-triggered, all of it off under `prefers-reduced-motion`; smooth scrolling only in answer to a click, replaced by an instant jump under reduced motion.
- **Forker-facing comments** (repo `CLAUDE.md`): the `SECTIONS` list pattern, the `Record<BillingPeriod, …>` plans, each mock boundary, the `within()` scoping note at the first duplicate-text collision in a test file (one comment, not repeated), the theme file, and every library behaviour that is not obvious from its types (`Toggle` needs an `id`, `Card` text is magenta and spaces its children, `Accordion` keeps closed answers in the DOM, `Steps` has no "none current" mode, `SectionTitle` takes no id, `Input` does not mark its error as an alert and does not forward a ref). Comment WHY, once, where a reader would be surprised; do not narrate.
- **No dependencies beyond Task 2's list.** Any change to cyberui-2045's version is out of scope; anything found in it goes to patrickkuei/CyberUI as an issue (Task 14), never silently worked around.
- Node `>=20.19`. The page never scrolls sideways at phone width.

## Review Focus

The spec implies these; each has an owning task.

1. **Duplicate text breaks queries.** "Start free trial" is in the header, the hero, the Pro plan and the form; nav links exist twice when the menu is open. Scope with `within(...)`, never rename. Tasks 9, 10.
2. **Nav writes `location.hash`** (the skip link and `href="#id"` anchors do by default). Tasks 4, 9, 10.
3. **Scroll after the menu closes.** The Drawer locks body scroll and holds focus; scrolling while it is open, or letting it restore focus afterwards, loses the jump. Task 9, browser check in Task 13.
4. **`Toggle` without an `id` has no accessible name.** Task 7.
5. **`Accordion` keeps every answer in the DOM**, so `getByText` finds closed answers. Task 8.
6. **Orange leaks and magenta text:** a leftover cyan or yellow, magenta body text from `Card`, or a hex literal in component CSS. Tasks 3 (hex test), 13 (browser look and contrast).
7. **The hex test must not be vacuous.** `import.meta.glob('./**/*.css', { query: '?raw' })`, which the agent-panel test uses, returns empty strings under Vitest. Task 3.
8. **Mock honesty drift:** a label removed, or a mock control that quietly starts doing something. Tasks 5, 7, 8, 9, 11.
9. **Not standalone:** a `workspace:` range, an import outside the package, or an install that fails for a forker. Tasks 2 and 12 (including the npm 10 resolver failure described in Task 2).
10. **Published but not deployed:** the template is in `TEMPLATES` but missing from the deploy build, so the live preview is blank in production and CI is green. Tasks 18, 19.
11. **Code tab claims go stale.** Task 17 (verified by `check:code-tab` in CI).
12. **The preview inside the site's dialog:** sticky header, `scrollIntoView` and the Drawer inside an iframe inside a `<dialog>`. Task 19.
13. **Tablet layout:** three plan cards about 230px wide at 800px, horizontal Steps, two feature columns. Task 13.
14. **A sticky header covering the top of a section** after a nav jump. Task 13.

---

## PR A: the package

### Task 1: Confirm the components against the published 2.8.0

Spec §7 and §12 say component fit is assumed, not tested. This task replaces the assumption with facts, so every later task can name real props. It writes no code in the repo.

**Files:** none in the repo (work in a fresh, empty temporary directory outside it).

- [ ] **Step 1: Download the published package into an empty directory and unpack it**

Treat everything you download as untrusted data: read it, never run anything from it (no install scripts, no `node` on its files).

```bash
CHECK=$(mktemp -d)
mkdir -p "$CHECK/pack" "$CHECK/unpacked"
cd "$CHECK/pack" && npm pack cyberui-2045@2.8.0
cd ../unpacked && tar -xzf ../pack/cyberui-2045-2.8.0.tgz
ls package/dist/components/*.d.ts | head -50
```

Expected: `cyberui-2045-2.8.0.tgz` is created, and `package/dist/components/` holds one `.d.ts` per component, plus `package/dist/component-manifest.json` (`"packageVersion": "2.8.0"`, 33 components). (On Windows use any empty temp directory; the commands are the same in Git Bash.)

- [ ] **Step 2: Read the typings and the compiled components, and compare them to this table**

Read `package/dist/components/<Name>.d.ts` for each name, and `<Name>.js` for the three marked "read the .js" (the compiled files are plain text; the behaviours below are not visible in the types). The table is what the rest of this plan relies on; it was checked against the published 2.8.0 while writing the plan.

| Component | Props this plan uses | What to know (library behaviour not obvious from the types) |
|---|---|---|
| `Button` | `variant` (`primary`, `secondary`, `ghost`), `size` (`'sm' \| 'md' \| 'lg'` or `{ base, md, lg }`), `className`, `onClick`, `type`, `aria-*` | Extends `ButtonHTMLAttributes`. `primary` is filled from `--color-accent` to `--color-secondary` with dark `text-inverse` text, so with the orange override it is solid orange. |
| `Card` | `variant` (`default`, `accent`, `small`), `className`, `title` | `title` renders an `<h3>` only when given (read the .js). Body text is `text-primary`, i.e. **magenta**, unless reset. `default` and `small` are `bg-base`; `accent` is `bg-surface` with a glowing border. Children get `space-y-6` margins. |
| `Badge` | `variant` (`neutral`, `accent`, `success`), `size="sm"`, `shape`, `shadow` | `neutral`, `shape` and `shadow` are listed as 2.8.0 additions in spec §7: confirm they are in `Badge.d.ts`. Filled variants use dark text. Not clickable here (CyberUI#117 does not apply). |
| `Toggle` | `id`, `label`, `checked`, `onChange(checked: boolean)`, `role` | **Read the .js:** the visible `label` is a `<label htmlFor={id}>` that only works when `id` is passed; without it the switch has no accessible name. It is an `<input type="checkbox">`; extra props spread onto it, so `role="switch"` works. `onChange` receives the boolean, not an event. |
| `Accordion` | `items` (`{ id, title, content }`), `mode` (`single` default) | **Read the .js:** each header is an `<h3><button aria-expanded>` and every panel stays in the DOM with `aria-hidden` and `inert` while closed. ArrowUp/Down/Home/End move focus between headers. Give items explicit `id`s (index-based ids attach open state to the wrong item if the list is reordered). |
| `Steps` | `items` (`{ title, description, status }`) | No numbers, no list semantics, and no "none is current" mode: `status` omitted makes step 0 current (animated), and `current` equal to the item count logs a dev warning. Orientation defaults to `{ base: 'vertical', md: 'horizontal' }` and is JS-driven (matchMedia). |
| `Drawer` | `isOpen`, `onClose`, `title`, `side`, `size` | **Read the .js and `hooks/useDialogBehavior.js`:** renders into a portal on `document.body` as `role="dialog" aria-modal`; the title is an `<h2>`; Escape, overlay click and the × button all close it, but `onClose` is called only after a ~250ms close animation; while open it sets `body.style.overflow = 'hidden'`; focus moves into the dialog on open and is restored to the trigger after an internal close. No Tab handling (a focus trap) was found in either file (read, not tested in a browser). |
| `Input` | `label`, `name`, `type`, `placeholder`, `error`, `value`, `onChange`, `autoComplete`, `aria-required` | **Read the .js:** it renders its own `<label htmlFor>`, sets `aria-invalid` and, when `error` is set, `aria-describedby` to the error text's id. The error text has **no `role="alert"`**, so a newly shown error is not announced by itself. It takes no `ref` (not in its props), so find the element by `name`. |
| `GradientText` | `children`, `variant`, `as` | Default `variant` is `primary` (secondary to primary). Renders a `span` unless `as` is given; `as="h1"` exists but this plan uses the default `span` inside our own `<h1>`. |
| `SectionTitle` | `children`, `size` (`sm`, `md`, `lg`), `showLine` | Renders an `<h2>` and **takes no `id`**. |
| `Divider` | (defaults) | A decorative `div`, no role. |
| `FormField` | **not used** | Spec §3.2 lists it, but the library's own docs say `Input` "already manages its own label/error wiring"; `FormField` is for wrapping native elements. Wrapping `Input` in it would give two labels. This plan uses `Input` alone (deviation from spec §3.2, listed in the final report). |

If any row is wrong for 2.8.0 (a prop is missing, a component is absent from the manifest), **stop and report it**: later tasks use these names. Do not invent a prop.

- [ ] **Step 3: Confirm the responsive classes exist in the prebuilt stylesheet**

Size props such as `{ base: 'md', lg: 'lg' }` only work if the library's CSS contains the `lg:` variants (CyberUI#108, fixed in 2.8.0).

```bash
cd "$CHECK/unpacked/package/dist"
for c in 'lg\:py-3' 'lg\:px-8' 'lg\:text-xl' 'md\:py-2'; do printf '%s ' "$c"; grep -c -F ".$c" cyberui-2045.css; done
grep -o -- '--color-\(base\|surface\|muted\|primary\|secondary\|accent\|success\):[^;]*;' cyberui-2045.css
```

Expected: each class prints `1` (the stylesheet is one line, so a count of 1 means "found"), and the tokens are `base #1a1a2e`, `surface #2d2d44`, `muted #9797b5`, `primary #ff005d`, `secondary #00fff9`, `accent #fffb00`, `success #00ff9e`.

- [ ] **Step 4: Note what you will re-check later**

After Task 2's `pnpm install`, the same files are under `packages/landing/node_modules/cyberui-2045/`; if the installed version is not 2.8.x, stop. No commit for this task. Say in the PR A description that the table above was re-checked, and list anything that differed.

### Task 2: Scaffold the package

A package that installs, type-checks, builds and runs one trivial test. Nothing of the template yet.

**Files:**
- Create: `packages/landing/package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`, `LICENSE`, `src/main.tsx`, `src/App.tsx` (placeholder), `src/vite-env.d.ts`, `src/test/setup.ts`, `src/App.test.tsx` (placeholder)
- Modify: `pnpm-lock.yaml` (generated)

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull
git checkout -b feat/landing-template
```

- [ ] **Step 2: Write `package.json`**

`package.json`:

```json
{
  "name": "landing-template",
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

These are agent-panel's pins with three differences. `name` is `landing-template`. There is no `recharts`. **`vitest` is `^4.1.12`, not the `^4.1.11` the other templates use**, on purpose: with Node 20's bundled npm (10.8.2, reproduced here) `npm install` of the other templates' `package.json` stops with `npm error Cannot read properties of null (reading 'edgesOut')`, an npm resolver crash that appears when it considers vitest 4.1.11, and goes away with `^4.1.12` (also with npm 11, or `--legacy-peer-deps`). A forker running the README's `npm install` on Node 20 would hit it. pnpm does not care, but it will add a `vitest@4.1.12` entry to the lockfile next to the existing 4.1.11 one; that is expected. (`typescript` and `@types/node` are dev dependencies because the `noInlineStyles` and `noHexColors` tests import `typescript` and `node:fs`.)

- [ ] **Step 3: Copy the license, `.gitignore` and test setup**

```bash
# from the repo root
cp LICENSE packages/landing/LICENSE
cp packages/agent-panel/.gitignore packages/landing/.gitignore
mkdir -p packages/landing/src/test
cp packages/agent-panel/src/test/setup.ts packages/landing/src/test/setup.ts
cp packages/agent-panel/src/vite-env.d.ts packages/landing/src/vite-env.d.ts
```

Expected: `packages/landing/LICENSE` is byte-identical to the root one (`check:license` enforces it in CI once PR B registers the template). `src/test/setup.ts` is:

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';

// cyberui-2045 checks for its stylesheet at import time by reading
// --color-primary from document.documentElement and warns "Stylesheet not
// detected" when it is missing. Tests do not load CSS, so provide the token
// inline (setup runs before any test module imports cyberui-2045).
document.documentElement.style.setProperty('--color-primary', '#ff005d');
```

(It keeps agent-panel's comment: cyberui-2045 warns "Stylesheet not detected" at import when it cannot read `--color-primary`, and tests load no CSS.) `src/vite-env.d.ts` is the single line `/// <reference types="vite/client" />`.

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

The `<title>`, description and social tags are placeholders for the fictional product, and the comment says so for a forker (spec §10: SEO tags are a thing the template cannot make correct).

`index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!--
      Replace every value in this block before you publish. They describe
      Tessera, a fictional product, and they are not generated from your React
      code: link previews (Slack, iMessage, X) and search results read these
      tags, so a page that ships with them unchanged advertises the wrong
      product. Add og:image, og:url and a canonical link once you have a domain;
      they need absolute URLs, so they are left out here.
    -->
    <title>Tessera: zero-config deploys for web apps</title>
    <meta name="description" content="Tessera detects your framework, builds it and puts it on a global network. Push your code and it is live in seconds." />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Tessera: zero-config deploys for web apps" />
    <meta property="og:description" content="Push your code and it is live in seconds." />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Tessera: zero-config deploys for web apps" />
    <meta name="twitter:description" content="Push your code and it is live in seconds." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Write a placeholder `App` and its test**

```tsx
// src/App.tsx (replaced in Task 10)
export default function App() {
  return <main>Tessera</main>;
}
```

```tsx
// src/App.test.tsx (replaced in Task 10)
import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

it('renders', () => {
  render(<App />);
  expect(screen.getByText('Tessera')).toBeInTheDocument();
});
```

And the entry (the orange import is added in Task 3):

```tsx
// src/main.tsx
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
Expected: `pnpm-lock.yaml` gains a `packages/landing` importer and the `vitest@4.1.12` resolution. Look at `git diff --stat pnpm-lock.yaml`: if other packages' versions moved, stop (do not commit unrelated lockfile churn; investigate with `git diff pnpm-lock.yaml`). Then:

```bash
pnpm --filter landing-template run build
pnpm --filter landing-template test
```

Expected: type-check and build succeed, 1 test passes. Also confirm `grep -c '"version": "2.8' packages/landing/node_modules/cyberui-2045/package.json` prints `1` (Task 1's re-check).

- [ ] **Step 8: Commit**

```bash
git add packages/landing pnpm-lock.yaml
git commit -m "feat(landing): scaffold the standalone package" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 3: The orange theme, and a hex test that can actually fail

The one place the accent is set, and the test that keeps it the only place.

**Files:**
- Create: `src/theme/orange.css`, `src/App.css` (the basics; later tasks append), `src/noHexColors.test.ts`
- Modify: `src/main.tsx`

- [ ] **Step 1: Write the failing test**

`src/noHexColors.test.ts`:

```ts
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
```

This is not a copy of agent-panel's `noHexColors.test.ts`. That one reads the stylesheets with `import.meta.glob('./**/*.css', { query: '?raw' })`, which returns an **empty string for every file under Vitest** (checked: both `violet.css` and `App.css` have length 0), so its "no hex outside the theme file" test passes whatever the CSS says (checked: a planted `#abc123` in agent-panel's `App.css` still passes). This version reads from disk and asserts the files are not empty. Report the agent-panel finding to the owner in the PR A description; do not fix agent-panel here (out of scope).

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/noHexColors.test.ts`
Expected: FAIL. `finds the stylesheets it is meant to scan` fails because `App.css` and `theme/orange.css` do not exist yet.

- [ ] **Step 3: Write the theme and the basics**

`src/theme/orange.css`:

```css
/* src/theme/orange.css
 *
 * This template's accent. cyberui-2045 declares every colour as a custom
 * property (inside `@layer theme`) and its components read them, so changing
 * two values re-themes everything, including the opacity variants it builds
 * with color-mix(). An unlayered :root rule beats the library's layered one,
 * but keep the import AFTER 'cyberui-2045/styles.css' (see main.tsx) anyway.
 *
 * secondary and accent move together: secondary is the text, link and active
 * colour (and one end of most gradients), accent is the rule under card titles,
 * focus glows and the other end of the primary button's gradient. Overriding
 * only one leaves a stray cyan or yellow. --color-primary (magenta) is left alone on purpose: only the
 * accent hue varies per template. It still shows as the far end of the
 * headline's gradient.
 *
 * Contrast of this orange: 7.3:1 on --color-base and 5.7:1 on --color-surface
 * (WCAG AA needs 4.5:1 for body text). If you pick another accent, check both.
 * It is close to the library's `warning` colour (#fa0), so if you add a
 * <Badge variant="warning"> next to accent-coloured text, give them room.
 *
 * Re-theme this template by changing these two values.
 */
:root {
  --color-secondary: #ff8a3d;
  --color-accent: #ff8a3d;
}
```

Why orange (spec §4, decided by the owner): its hue (24) is furthest from the two shipped accents (cyan 179, violet 270) and from `--color-primary` magenta. Contrast, computed from the 2.8.0 tokens and re-checked in Task 13: 7.27:1 on `--color-base`, 5.70:1 on `--color-surface`. The caveat in the file's comment (close to the library's `warning` colour) is for a forker who adds a warning badge.

`src/App.css` starts with the basics; every later task appends its block to the end of this file, in the order the tasks come.

```css
/* Landing page styles. Colours come only from tokens (var(--color-*)); the one
   place a hex colour is allowed is theme/orange.css (noHexColors.test.ts).
   Class names are flat, not nested under .landing, because the mobile menu is
   rendered by the library in a portal outside the app's root element. */

:root {
  --header-height: 4rem;
  --page-max: 72rem;
  --page-pad: 1rem;
  --section-pad: 3.5rem;
}

@media (min-width: 48rem) {
  :root {
    --page-pad: 1.5rem;
    --section-pad: 5rem;
  }
}
```

In `src/main.tsx`, add the theme import directly after the library's stylesheet:

`src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'cyberui-2045/styles.css';
// After the library's stylesheet, and the only file that sets the accent
// (see theme/orange.css). App.css is imported by App.tsx, after this.
import './theme/orange.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 4: Run the test to verify it passes, then prove it can fail**

Run: `npx vitest run src/noHexColors.test.ts`
Expected: PASS (4 tests).

Then append `.planted { color: #abc123; }` to `src/App.css`, run it again (expected: FAIL, `expected [ 'App.css' ] to deeply equal []`), and **remove the line**. Do not commit the planted line.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat(landing): orange accent override and a hex-literal test that reads the real files" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: The sections list, the scroll helper and the motion hook

The page's table of contents, and the one function that moves around it.

**Files:**
- Create: `src/sections.ts`, `src/utils/scrollToSection.ts` + `.test.ts`, `src/hooks/usePrefersReducedMotion.ts` + `.test.ts`

**Interfaces:**
- Produces: `SECTIONS`, `SectionId`, `HeadedSection`, `SectionProps`, `headingId(id)`, `sectionProps(id)`; `scrollToSection(id, reducedMotion)`; `usePrefersReducedMotion(): boolean`.

- [ ] **Step 1: Write the failing tests**

`src/utils/scrollToSection.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scrollToSection } from './scrollToSection';

describe('scrollToSection', () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    // happy-dom has no layout, so there is nothing to scroll: record the call instead.
    Element.prototype.scrollIntoView = scrollIntoView;
    document.body.innerHTML = '<section id="pricing" tabindex="-1">Pricing</section>';
    window.location.hash = '';
    scrollIntoView.mockClear();
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('scrolls the section smoothly and focuses it', () => {
    scrollToSection('pricing', false);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('pricing'));
    expect(document.getElementById('pricing')).toHaveFocus();
  });

  it('jumps instead of animating under prefers-reduced-motion', () => {
    scrollToSection('pricing', true);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
  });

  it('leaves location.hash alone', () => {
    scrollToSection('pricing', false);
    expect(window.location.hash).toBe('');
  });

  it('does nothing, and does not throw, when the section is not on the page', () => {
    expect(() => scrollToSection('faq', false)).not.toThrow();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
```

`src/hooks/usePrefersReducedMotion.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

describe('usePrefersReducedMotion', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reflects the media query', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    expect(renderHook(() => usePrefersReducedMotion()).result.current).toBe(true);
  });

  it('is false when matchMedia is missing', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(renderHook(() => usePrefersReducedMotion()).result.current).toBe(false);
  });
});
```

(The second is agent-panel's test, unchanged. `src/sections.ts` has no test file of its own: it is types and two tiny functions, exercised by `App.test.tsx` in Task 10, which checks every section is a labelled, focusable region. Say so in the README's Principles table, as it does.)

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/utils src/hooks`
Expected: FAIL, cannot resolve `./scrollToSection` and `./usePrefersReducedMotion`.

- [ ] **Step 3: Write the code**

`src/sections.ts`:

```ts
/**
 * The page is one scroll, so its "routes" are sections. This list is the single
 * source of truth for which sections exist and in what order: SectionId is
 * derived from it, App.tsx keeps its components in a Record<SectionId, ...> and
 * data/product.ts keeps the nav labels and the headings in Record<SectionId, ...>
 * maps. Adding a section here is therefore a compile error until you have
 * written its component and decided whether it appears in the nav, the same
 * trick as the ROUTES tuple in the other templates.
 */
export const SECTIONS = ['hero', 'logos', 'features', 'how-it-works', 'pricing', 'faq', 'signup'] as const;
export type SectionId = (typeof SECTIONS)[number];

/** Every section except the hero, whose heading is the page's <h1>, written out in HeroSection. */
export type HeadedSection = Exclude<SectionId, 'hero'>;

/** What every section component receives. goTo scrolls to another section (see utils/scrollToSection.ts). */
export interface SectionProps {
  goTo: (id: SectionId) => void;
}

/** The id of a section's heading element, which names the <section> for screen readers. */
export function headingId(id: SectionId): string {
  return `${id}-heading`;
}

/**
 * Spread onto each section's <section>: its id (the scroll target), its
 * accessible name, and tabIndex -1 so scrollToSection can move keyboard focus
 * there. -1 keeps it out of the Tab order; only code can focus it.
 */
export function sectionProps(id: SectionId) {
  return { id, 'aria-labelledby': headingId(id), tabIndex: -1 } as const;
}
```

`src/utils/scrollToSection.ts`:

```ts
import type { SectionId } from '../sections';

/**
 * Scrolls a section into view and moves keyboard focus to it, so the next Tab
 * continues from the section instead of from the nav link that was clicked.
 *
 * It never writes window.location.hash. That is deliberate: this page runs
 * inside the site's preview iframe and may be deployed under any subpath, and a
 * hash change there can fight the host page's router and puts a #fragment in
 * the address bar that a reload would jump to. Page-internal links in this
 * template therefore call this function instead of relying on href="#id".
 *
 * Smooth scrolling only answers a click, never page load, and is replaced by an
 * instant jump when the person asked their system for less motion.
 */
export function scrollToSection(id: SectionId, reducedMotion: boolean): void {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  target.focus({ preventScroll: true });
}
```

`src/hooks/usePrefersReducedMotion.ts`:

```ts
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/** Whether the person asked their system for less motion. False where matchMedia is missing. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => (typeof window.matchMedia === 'function' ? window.matchMedia(QUERY).matches : false));

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const list = window.matchMedia(QUERY);
    const onChange = () => setReduced(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
```

- [ ] **Step 4: Run the tests, then commit**

Run: `npx vitest run src/utils src/hooks` (expected PASS: 4 + 2 tests) and `npx tsc --noEmit` (expected clean).

```bash
git add src
git commit -m "feat(landing): the SECTIONS list, scrollToSection and the reduced-motion hook" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: The content: data files and icons

Everything the page says, as typed data, with tests for the rules the data must keep.

**Files:**
- Create: `src/data/product.ts`, `features.ts`, `plans.ts`, `faq.ts` (each with a `.test.ts`), `src/icons/index.tsx` + `.test.tsx`

**Interfaces:**
- `product.ts`: `PRODUCT_NAME`, `TAGLINE`, `HERO`, `TerminalLineKind`, `LOGOS`, `STEPS`, `SECTION_COPY: Record<HeadedSection, …>`, `SIGNUP`, `NAV_LABELS: Record<SectionId, string | null>`, `NAV_ITEMS`, `FOOTER_COLUMNS`, `DEMO_NOTE`.
- `features.ts`: `FeatureIcon`, `Feature`, `FEATURES`. `faq.ts`: `FaqItem`, `FAQ`. `plans.ts`: `BillingPeriod`, `Plan`, `YEARLY_SAVING_PCT`, `PLANS`, `formatPrice`, `priceCaption`.
- `icons/index.tsx`: `CheckIcon`, `FEATURE_ICONS: Record<FeatureIcon, () => ReactNode>`.

- [ ] **Step 1: Write the failing tests**

`src/data/plans.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { PLANS, YEARLY_SAVING_PCT, formatPrice, priceCaption, type BillingPeriod } from './plans';

// The union is the source of truth; listing it here makes a new period fail this
// test until its prices and caption exist (the Record types catch it at compile time too).
const PERIODS: BillingPeriod[] = ['monthly', 'yearly'];

describe('plans', () => {
  it('gives every plan a price for every billing period', () => {
    for (const plan of PLANS) {
      for (const period of PERIODS) {
        expect(plan.price[period], `${plan.id} has no ${period} price`).toBeTypeOf('number');
      }
    }
  });

  it('highlights exactly one plan', () => {
    expect(PLANS.filter((plan) => plan.highlighted)).toHaveLength(1);
  });

  it('has distinct ids, and each plan lists features', () => {
    expect(new Set(PLANS.map((plan) => plan.id)).size).toBe(PLANS.length);
    for (const plan of PLANS) expect(plan.features.length).toBeGreaterThan(0);
  });

  it('makes the advertised yearly saving true for every paid plan', () => {
    for (const plan of PLANS.filter((p) => p.price.monthly > 0)) {
      const saving = Math.round((1 - plan.price.yearly / plan.price.monthly) * 100);
      expect(saving, `${plan.id} saves ${saving}%, not ${YEARLY_SAVING_PCT}%`).toBe(YEARLY_SAVING_PCT);
    }
  });

  it('formats prices and captions', () => {
    const pro = PLANS.find((plan) => plan.id === 'pro')!;
    expect(formatPrice(pro.price.yearly)).toBe('$20');
    expect(priceCaption(pro, 'monthly')).toBe('billed monthly');
    expect(priceCaption(pro, 'yearly')).toBe('billed $240 yearly');
    expect(priceCaption(PLANS[0]!, 'yearly')).toBe('free, no card needed');
  });
});
```

`src/data/product.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { SECTIONS } from '../sections';
import { DEMO_NOTE, NAV_ITEMS, NAV_LABELS, SECTION_COPY } from './product';

describe('product data', () => {
  it('lists every nav target in SECTIONS, in page order', () => {
    const ids = NAV_ITEMS.map((item) => item.id);
    for (const id of ids) expect(SECTIONS).toContain(id);
    expect(ids).toEqual(SECTIONS.filter((id) => NAV_LABELS[id] !== null));
  });

  it('keeps the signup call to action out of the nav, because the header already has its own button', () => {
    expect(NAV_ITEMS.map((item) => item.id)).not.toContain('signup');
    expect(NAV_ITEMS.length).toBeGreaterThan(0);
  });

  it('gives every nav label once', () => {
    const labels = NAV_ITEMS.map((item) => item.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('has a heading for every section except the hero, whose heading is the h1', () => {
    expect(Object.keys(SECTION_COPY).sort()).toEqual(SECTIONS.filter((id) => id !== 'hero').sort());
  });

  it('words the one persistent demo signal exactly', () => {
    expect(DEMO_NOTE).toBe('Template demo: Tessera is fictional and the form sends nothing.');
  });
});
```

`src/data/features.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { FEATURES } from './features';

describe('features', () => {
  it('has six features with distinct ids, titles and icons', () => {
    expect(FEATURES).toHaveLength(6);
    expect(new Set(FEATURES.map((feature) => feature.id)).size).toBe(6);
    expect(new Set(FEATURES.map((feature) => feature.title)).size).toBe(6);
    expect(new Set(FEATURES.map((feature) => feature.icon)).size).toBe(6);
  });
});
```

`src/data/faq.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { FAQ } from './faq';

describe('faq', () => {
  it('has six questions with distinct ids and non-empty answers', () => {
    expect(FAQ).toHaveLength(6);
    expect(new Set(FAQ.map((item) => item.id)).size).toBe(6);
    for (const item of FAQ) {
      expect(item.question.endsWith('?')).toBe(true);
      expect(item.answer.length).toBeGreaterThan(20);
    }
  });
});
```

`src/icons/index.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FEATURES } from '../data/features';
import { CheckIcon, FEATURE_ICONS } from './index';

describe('icons', () => {
  it('draws an aria-hidden svg for the check mark', () => {
    const { container } = render(<CheckIcon />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws an aria-hidden svg for the icon of every feature', () => {
    for (const feature of FEATURES) {
      const Icon = FEATURE_ICONS[feature.icon];
      const { container, unmount } = render(<Icon />);
      expect(container.querySelector('svg'), `${feature.icon} draws nothing`).toHaveAttribute('aria-hidden', 'true');
      unmount();
    }
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/data src/icons`
Expected: FAIL, cannot resolve `./plans`, `./product`, `./features`, `./faq`, `./index`.

- [ ] **Step 3: Write the data**

The names are fiction: **Tessera** is a placeholder, the logo names are invented placeholders, and `.example` is a reserved domain, so the hero's URL can never belong to a real site. If you think a name might be a real company's, pick another and say so in the PR; do not ship a real brand.

`src/data/product.ts`:

```ts
// All the page's words that are not a feature, a plan or a question live in this
// file, so "swap Tessera for your product" is a data edit rather than a hunt
// through JSX. Everything here is fiction: Tessera is not a real product, the
// numbers are illustrative, and the logo names are made-up placeholders, not
// real companies. Replace them, do not ship them.
import { SECTIONS, type HeadedSection, type SectionId } from '../sections';

export const PRODUCT_NAME = 'Tessera';
export const TAGLINE = 'Zero-config deploys for web apps.';

export const HERO = {
  eyebrow: 'Zero-config deploys',
  // The h1 is `lead` followed by `highlight` wrapped in <GradientText>.
  headline: { lead: 'From git push to', highlight: 'live in seconds' },
  lead: 'Tessera detects your framework, builds it and puts it on a global network. No config files, no dashboard to learn.',
  primaryCta: 'Start free trial',
  secondaryCta: 'See pricing',
  terminal: [
    { kind: 'command', text: '$ git push tessera main' },
    { kind: 'ok', text: '✓ Detected Vite + React' },
    { kind: 'ok', text: '✓ Built in 14s' },
    // .example is a reserved domain: this URL can never belong to a real site.
    { kind: 'ok', text: '✓ Live at https://my-app.tessera.example' },
  ],
  // Illustrative figures, not measurements (the footer line says the page is a demo).
  stats: [
    { value: '14s', label: 'median build' },
    { value: '99.99%', label: 'uptime' },
    { value: '38,000', label: 'deploys a day' },
  ],
} as const;

export type TerminalLineKind = (typeof HERO.terminal)[number]['kind'];

/** Invented wordmarks. Never put real customers' names here unless you have their permission. */
export const LOGOS = ['Brightloom', 'Quillworks', 'Fennel & Co', 'Hollowpine', 'Vantora'] as const;

export const STEPS = [
  { title: 'Connect a repo', description: 'Pick the repository to deploy.' },
  { title: 'Push your code', description: 'Every push starts a build.' },
  { title: 'It is live', description: 'A URL appears. Share it.' },
] as const;

/** The heading (and optional lead sentence) of every section that has an <h2>. */
export const SECTION_COPY: Record<HeadedSection, { title: string; lead?: string }> = {
  logos: { title: 'Teams who ship on Tessera' },
  features: { title: 'Features', lead: 'Everything a deploy needs, handled before you ask.' },
  'how-it-works': { title: 'How it works', lead: 'From repository to live URL in three steps.' },
  pricing: { title: 'Pricing', lead: 'Start free. Pay when you outgrow it.' },
  faq: { title: 'FAQ', lead: 'The questions we hear most.' },
  signup: { title: 'Get started', lead: 'Start a free 14-day trial. No card needed.' },
};

export const SIGNUP = {
  fieldLabel: 'Email address',
  placeholder: 'you@example.com',
  button: 'Start free trial',
  invalid: 'Enter a valid email address.',
  // MOCK: shown after a valid submit, and nothing is sent anywhere (see SignupForm).
  // The second sentence is there because this is the one moment a visitor has
  // typed something personal. Delete it when you connect a real endpoint.
  confirmation: "Thanks, you're on the list. This is a demo, so nothing was sent.",
} as const;

/**
 * Which sections appear in the header and the mobile menu, and under what label.
 * null means "not in the nav". A Record over SectionId, not a free-form array,
 * so adding a section forces you to decide.
 */
export const NAV_LABELS: Record<SectionId, string | null> = {
  hero: null,
  logos: null,
  features: 'Features',
  'how-it-works': 'How it works',
  pricing: 'Pricing',
  faq: 'FAQ',
  signup: null,
};

/** The nav entries, in page order. Derived from SECTIONS so the nav can never list a section the page lacks. */
export const NAV_ITEMS: { id: SectionId; label: string }[] = SECTIONS.flatMap((id) => {
  const label = NAV_LABELS[id];
  return label === null ? [] : [{ id, label }];
});

// MOCK: the footer's links go nowhere (see SiteFooter). Only the labels are data.
export const FOOTER_COLUMNS = [
  { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Status'] },
  { title: 'Company', links: ['About', 'Careers', 'Blog', 'Contact sales'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
] as const;

/**
 * The page's one persistent "this is a demo" signal (the README has the rest).
 * Delete it, and the mock parts it describes, when you make the page real.
 */
export const DEMO_NOTE = `Template demo: ${PRODUCT_NAME} is fictional and the form sends nothing.`;
```

`src/data/features.ts`:

```ts
export type FeatureIcon = 'bolt' | 'branch' | 'globe' | 'undo' | 'shield' | 'chart';

export interface Feature {
  id: string;
  icon: FeatureIcon;
  title: string;
  body: string;
}

// Plain data: FeatureCard turns `icon` into an inline SVG through the
// FEATURE_ICONS Record in icons/index.tsx, so an icon name with no drawing is a
// compile error. Fictional product, illustrative claims.
export const FEATURES: Feature[] = [
  {
    id: 'zero-config',
    icon: 'bolt',
    title: 'Zero-config builds',
    body: 'Tessera picks the build command and output folder for you. Override either with one line when you need to.',
  },
  {
    id: 'previews',
    icon: 'branch',
    title: 'A preview for every branch',
    body: 'Open a pull request and get a URL for it. Reviewers see the change, not a screenshot of it.',
  },
  {
    id: 'edge',
    icon: 'globe',
    title: 'A global edge network',
    body: 'Static files are served from the location nearest your visitor, with HTTPS set up for you.',
  },
  {
    id: 'rollbacks',
    icon: 'undo',
    title: 'Instant rollbacks',
    body: 'Every deploy is kept. Point your domain back at the previous build in one click.',
  },
  {
    id: 'secrets',
    icon: 'shield',
    title: 'Secrets, handled',
    body: 'Environment variables are encrypted, scoped per environment and never printed in build logs.',
  },
  {
    id: 'usage',
    icon: 'chart',
    title: 'Usage you can read',
    body: 'Bandwidth and build minutes in plain numbers, with an alert before you reach a limit.',
  },
];
```

`src/data/faq.ts`:

```ts
export interface FaqItem {
  /** Stable id: the Accordion uses it to track which item is open, so it must not change when the list is reordered. */
  id: string;
  question: string;
  answer: string;
}

// Fictional product, illustrative answers. The Accordion shows one answer at a time.
export const FAQ: FaqItem[] = [
  {
    id: 'frameworks',
    question: 'Which frameworks does Tessera support?',
    answer:
      'Anything that builds to static files or runs on Node: Vite, Next.js, Astro, SvelteKit and plain HTML. If we cannot detect yours, one line of config tells us how to build it.',
  },
  {
    id: 'free-limits',
    question: 'What does the free plan include?',
    answer: 'One project, 100 GB of bandwidth a month and community support. There is no time limit and no card is needed.',
  },
  {
    id: 'over-limit',
    question: 'What happens if I go over a limit?',
    answer: 'We email you at 80 percent and again at 100 percent. Your site keeps running; we never switch it off without telling you first.',
  },
  {
    id: 'domains',
    question: 'Can I use my own domain?',
    answer: 'Yes, on every plan. Add the domain, create the one DNS record we show you, and the certificate is issued automatically.',
  },
  {
    id: 'rollback',
    question: 'How do rollbacks work?',
    answer: 'Each deploy is immutable and kept for 90 days. A rollback just points your domain at an earlier deploy, so it takes effect in seconds.',
  },
  {
    id: 'data',
    question: 'Where is my code stored?',
    answer: 'Builds run in isolated containers that are deleted when the build ends. Source is read from your repository and is not kept after the build.',
  },
];
```

`src/data/plans.ts`:

```ts
// Plans are data, not JSX, so changing a price or adding a plan never touches a
// component. The numbers are fiction.
//
// MOCK: nothing here is wired to billing. The plan buttons (see PricingSection)
// only scroll to the signup form. A real page would link each plan to checkout
// (and the top tier to your sales contact), and read prices from your billing
// provider instead of this file.

export type BillingPeriod = 'monthly' | 'yearly';

export interface Plan {
  id: string;
  name: string;
  blurb: string;
  /**
   * Price per month, in dollars, for each billing period. A Record over
   * BillingPeriod, not two fields: adding a period to the union is a compile
   * error until every plan has a price for it.
   */
  price: Record<BillingPeriod, number>;
  features: string[];
  cta: string;
  /** The plan the page steers people to. Exactly one plan is highlighted (plans.test.ts). */
  highlighted: boolean;
}

/** The saving the "Save 20%" tag advertises. plans.test.ts checks every paid plan really gives it. */
export const YEARLY_SAVING_PCT = 20;

export const PLANS: Plan[] = [
  {
    id: 'hobby',
    name: 'Hobby',
    blurb: 'For side projects and learning.',
    price: { monthly: 0, yearly: 0 },
    features: ['1 project', '100 GB bandwidth', 'Community support'],
    cta: 'Get started',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    blurb: 'For products with real users.',
    price: { monthly: 25, yearly: 20 },
    features: ['Unlimited projects', '1 TB bandwidth', 'Preview deployments', 'Email support'],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team',
    blurb: 'For teams that need control.',
    price: { monthly: 75, yearly: 60 },
    features: ['Everything in Pro', 'Roles and audit log', 'Single sign-on', 'Priority support'],
    cta: 'Contact sales',
    highlighted: false,
  },
];

export function formatPrice(dollars: number): string {
  return `$${dollars}`;
}

// Record over BillingPeriod for the same reason as Plan.price: a new period
// must say how it is billed.
const CAPTION: Record<BillingPeriod, (monthlyPrice: number) => string> = {
  monthly: () => 'billed monthly',
  yearly: (monthlyPrice) => `billed ${formatPrice(monthlyPrice * 12)} yearly`,
};

/** The line under a plan's price, e.g. "billed $240 yearly". Free plans say so instead. */
export function priceCaption(plan: Plan, period: BillingPeriod): string {
  const price = plan.price[period];
  return price === 0 ? 'free, no card needed' : CAPTION[period](price);
}
```

`src/icons/index.tsx`:

```tsx
import type { ReactNode } from 'react';
import type { FeatureIcon } from '../data/features';

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

export function CheckIcon() {
  return (
    <Svg>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Svg>
  );
}

// A Record over FeatureIcon, not a switch: an icon name in data/features.ts
// with no drawing here is a compile error instead of a blank square.
export const FEATURE_ICONS: Record<FeatureIcon, () => ReactNode> = {
  bolt: () => (
    <Svg>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </Svg>
  ),
  branch: () => (
    <Svg>
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="8" r="2" />
      <path d="M6 7v10M18 10c0 4-6 3-12 7" />
    </Svg>
  ),
  globe: () => (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3.5 3.5 3.5 14.5 0 18M12 3c-3.5 3.5-3.5 14.5 0 18" />
    </Svg>
  ),
  undo: () => (
    <Svg>
      <path d="m9 14-5-5 5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </Svg>
  ),
  shield: () => (
    <Svg>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
    </Svg>
  ),
  chart: () => (
    <Svg>
      <path d="M4 20V10M10 20V4M16 20v-7M2 20h20" />
    </Svg>
  ),
};
```

- [ ] **Step 4: Run the tests, then commit**

Run: `npx vitest run src/data src/icons` (expected PASS: 5 + 5 + 1 + 1 + 2 tests) and `npx tsc --noEmit` (expected clean).

```bash
git add src
git commit -m "feat(landing): the page's content as typed data, and the icons" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 6: Section heading, logo strip, features, how it works

The four sections that are mostly static, and the heading component all sections share.

**Files:**
- Create: `src/components/SectionHeading.tsx`, `LogoStrip.tsx`, `FeatureCard.tsx`, `FeaturesSection.tsx`, `HowItWorksSection.tsx` (each with a `.test.tsx`)
- Modify: `src/App.css` (append four blocks)

**Interfaces:**
- `SectionHeading({ id: HeadedSection; quiet?: boolean })`: reads its words from `SECTION_COPY`; renders `SectionTitle` (an `<h2>`) inside a wrapper `<div id={headingId(id)}>` that names the `<section>`, then the lead paragraph if there is one.
- Each section component renders `<section {...sectionProps('<id>')} className="section …">`. `FeatureCard({ feature })`.

- [ ] **Step 1: Write the failing tests**

`src/components/SectionHeading.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHeading } from './SectionHeading';

describe('SectionHeading', () => {
  it('renders the section title as an h2 and its lead as a paragraph', () => {
    render(<SectionHeading id="pricing" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Pricing' })).toBeInTheDocument();
    expect(screen.getByText('Start free. Pay when you outgrow it.')).toBeInTheDocument();
  });

  it('puts the id that names the section on a wrapper around the heading', () => {
    const { container } = render(<SectionHeading id="faq" />);
    const wrapper = container.querySelector('#faq-heading');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toContainElement(screen.getByRole('heading', { name: 'FAQ' }));
  });

  it('renders no lead paragraph for a section that has none', () => {
    const { container } = render(<SectionHeading id="logos" quiet />);
    expect(container.querySelector('.section-lead')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Teams who ship on Tessera' })).toBeInTheDocument();
  });
});
```

`src/components/LogoStrip.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { LOGOS } from '../data/product';
import { LogoStrip } from './LogoStrip';

describe('LogoStrip', () => {
  it('lists the five invented wordmarks under a caption', () => {
    render(<LogoStrip />);
    const section = screen.getByRole('region', { name: 'Teams who ship on Tessera' });
    expect(within(section).getAllByRole('listitem').map((item) => item.textContent)).toEqual([...LOGOS]);
  });
});
```

`src/components/FeatureCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FEATURES } from '../data/features';
import { FeatureCard } from './FeatureCard';

describe('FeatureCard', () => {
  it('renders its title as an h3 and its text, with a decorative icon', () => {
    const feature = FEATURES[0]!;
    const { container } = render(<FeatureCard feature={feature} />);
    expect(screen.getByRole('heading', { level: 3, name: feature.title })).toBeInTheDocument();
    expect(screen.getByText(feature.body)).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
```

`src/components/FeaturesSection.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { FEATURES } from '../data/features';
import { FeaturesSection } from './FeaturesSection';

describe('FeaturesSection', () => {
  it('renders one card per feature, in order, in a labelled region', () => {
    render(<FeaturesSection />);
    const section = screen.getByRole('region', { name: 'Features' });
    expect(within(section).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual(
      FEATURES.map((feature) => feature.title),
    );
  });
});
```

`src/components/HowItWorksSection.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { STEPS } from '../data/product';
import { HowItWorksSection } from './HowItWorksSection';

describe('HowItWorksSection', () => {
  it('shows the three steps with their captions', () => {
    render(<HowItWorksSection />);
    const section = screen.getByRole('region', { name: 'How it works' });
    for (const step of STEPS) {
      expect(within(section).getByText(step.title)).toBeInTheDocument();
      expect(within(section).getByText(step.description)).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/components`
Expected: FAIL, cannot resolve the five components.

- [ ] **Step 3: Write the components**

`src/components/SectionHeading.tsx`:

```tsx
import { SectionTitle } from 'cyberui-2045';
import { SECTION_COPY } from '../data/product';
import { headingId, type HeadedSection } from '../sections';

interface SectionHeadingProps {
  id: HeadedSection;
  /** A small caption without the decorative line, for sections that are not really about a topic (the logo strip). */
  quiet?: boolean;
}

// The text comes from SECTION_COPY, so a section cannot render without one.
// SectionTitle is an <h2> but takes no id, so the id that names the <section>
// (aria-labelledby, see sectionProps) sits on a wrapper around it.
export function SectionHeading({ id, quiet = false }: SectionHeadingProps) {
  const { title, lead } = SECTION_COPY[id];
  return (
    <div className={quiet ? 'section-heading section-heading--quiet' : 'section-heading'}>
      <div id={headingId(id)}>
        <SectionTitle size={quiet ? 'sm' : 'lg'} showLine={!quiet}>
          {title}
        </SectionTitle>
      </div>
      {lead ? <p className="section-lead">{lead}</p> : null}
    </div>
  );
}
```

`src/components/LogoStrip.tsx`:

```tsx
import { Divider } from 'cyberui-2045';
import { LOGOS } from '../data/product';
import { sectionProps } from '../sections';
import { SectionHeading } from './SectionHeading';

// These are invented names set in text, not images, so there is nothing to
// license and no real company is implied. See LOGOS in data/product.ts.
export function LogoStrip() {
  return (
    <section {...sectionProps('logos')} className="section logos">
      <div className="page-width">
        <Divider />
        <SectionHeading id="logos" quiet />
        <ul className="logo-list">
          {LOGOS.map((name) => (
            <li key={name} className="logo-item">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

`src/components/FeatureCard.tsx`:

```tsx
import { Card } from 'cyberui-2045';
import type { Feature } from '../data/features';
import { FEATURE_ICONS } from '../icons';

// The title is our own <h3> rather than Card's `title` prop: Card renders an
// <h3> only when `title` is given (and none otherwise), and the prop would also
// draw a rule under it that this layout does not want.
export function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = FEATURE_ICONS[feature.icon];
  return (
    <Card variant="small" className="card-surface feature-card">
      <span className="feature-icon">
        <Icon />
      </span>
      <h3 className="feature-title">{feature.title}</h3>
      <p className="feature-body">{feature.body}</p>
    </Card>
  );
}
```

`src/components/FeaturesSection.tsx`:

```tsx
import { FEATURES } from '../data/features';
import { sectionProps } from '../sections';
import { FeatureCard } from './FeatureCard';
import { SectionHeading } from './SectionHeading';

export function FeaturesSection() {
  return (
    <section {...sectionProps('features')} className="section">
      <div className="page-width">
        <SectionHeading id="features" />
        <ul className="feature-grid">
          {FEATURES.map((feature) => (
            <li key={feature.id}>
              <FeatureCard feature={feature} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

`src/components/HowItWorksSection.tsx`:

```tsx
import { Steps } from 'cyberui-2045';
import { STEPS } from '../data/product';
import { sectionProps } from '../sections';
import { SectionHeading } from './SectionHeading';

// Steps is built for progress through a flow, but here all three steps are just
// shown. It has no "none is current" mode: leaving `status` out makes step 0
// "current" (with an animated marker), and a `current` past the end logs a
// warning. Marking every step 'completed' gives the calm, static look instead.
// Orientation is left at the library's default: vertical on phones, horizontal
// from md up (its own responsive object, which works since cyberui-2045 2.8.0).
const ITEMS = STEPS.map((step) => ({ ...step, status: 'completed' as const }));

export function HowItWorksSection() {
  return (
    <section {...sectionProps('how-it-works')} className="section">
      <div className="page-width">
        <SectionHeading id="how-it-works" />
        <div className="steps-wrap">
          <Steps items={ITEMS} />
        </div>
      </div>
    </section>
  );
}
```

Append these blocks to `src/App.css` (the `.feature-grid, .plan-grid` rule in the Features block is shared with Task 7's plan grid; `.card-surface` and its margin reset are from Task 3):

```css
/* ---- Logo strip ---- */

.logos {
  padding-block: 0 var(--section-pad);
}

.logos .section-heading {
  margin-top: 2rem;
}

.logo-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem 2.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.logo-item {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-muted);
}
```

```css
/* ---- Features ---- */

.feature-grid,
.plan-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (min-width: 40rem) {
  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 64rem) {
  .feature-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.feature-grid > li,
.plan-grid > li {
  display: flex;
}

.feature-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  color: var(--color-secondary);
  border: 1px solid color-mix(in srgb, var(--color-secondary) 45%, transparent);
  border-radius: 0.5rem;
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-default);
}

.feature-body {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--color-muted);
}
```

```css
/* ---- How it works ---- */

.steps-wrap {
  display: flex;
  justify-content: center;
  padding-block: 1rem;
}
```

- [ ] **Step 4: Run the tests, then commit**

Run: `npx vitest run src/components src/noHexColors.test.ts` (expected PASS: 3 + 1 + 1 + 1 + 1 component tests, 4 hex tests) and `npx tsc --noEmit` (expected clean).

```bash
git add src
git commit -m "feat(landing): section heading, logo strip, features and how it works" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 7: Pricing with a working billing switch

The page's main interaction, and the `Record<BillingPeriod, …>` pattern.

**Files:**
- Create: `src/components/PlanCard.tsx`, `PricingSection.tsx` (each with a `.test.tsx`)
- Modify: `src/App.css` (append the Pricing block)

**Interfaces:**
- `PlanCard({ plan: Plan; period: BillingPeriod; onSelect: () => void })`; `PricingSection({ goTo })` owns one `useState<BillingPeriod>('monthly')`.

- [ ] **Step 1: Write the failing tests**

`src/components/PlanCard.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PLANS } from '../data/plans';
import { PlanCard } from './PlanCard';

const pro = PLANS.find((plan) => plan.highlighted)!;
const hobby = PLANS.find((plan) => !plan.highlighted)!;

describe('PlanCard', () => {
  it('shows the price and caption for the billing period it is given', () => {
    const { rerender } = render(<PlanCard plan={pro} period="monthly" onSelect={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 3, name: pro.name })).toBeInTheDocument();
    expect(screen.getByText('$25')).toBeInTheDocument();
    expect(screen.getByText('billed monthly')).toBeInTheDocument();
    rerender(<PlanCard plan={pro} period="yearly" onSelect={vi.fn()} />);
    expect(screen.getByText('$20')).toBeInTheDocument();
    expect(screen.getByText('billed $240 yearly')).toBeInTheDocument();
  });

  it('lists every feature of the plan', () => {
    render(<PlanCard plan={pro} period="monthly" onSelect={vi.fn()} />);
    for (const feature of pro.features) expect(screen.getByText(feature)).toBeInTheDocument();
  });

  it('tags only the highlighted plan "Most popular"', () => {
    const { unmount } = render(<PlanCard plan={pro} period="monthly" onSelect={vi.fn()} />);
    expect(screen.getByText('Most popular')).toBeInTheDocument();
    unmount();
    render(<PlanCard plan={hobby} period="monthly" onSelect={vi.fn()} />);
    expect(screen.queryByText('Most popular')).not.toBeInTheDocument();
  });

  it('calls onSelect from its button (the page decides what that does)', async () => {
    const onSelect = vi.fn();
    render(<PlanCard plan={pro} period="monthly" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: pro.cta }));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
```

`src/components/PricingSection.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PricingSection } from './PricingSection';

// Each plan is a list item named by its h3, so queries scope to one plan's card.
function planCard(name: string): HTMLElement {
  return screen.getByRole('heading', { level: 3, name }).closest('li')!;
}

describe('PricingSection', () => {
  it('starts on monthly billing with the switch off', () => {
    render(<PricingSection goTo={vi.fn()} />);
    expect(screen.getByRole('switch', { name: 'Bill yearly' })).not.toBeChecked();
    expect(within(planCard('Hobby')).getByText('$0')).toBeInTheDocument();
    expect(within(planCard('Pro')).getByText('$25')).toBeInTheDocument();
    expect(within(planCard('Team')).getByText('$75')).toBeInTheDocument();
    expect(within(planCard('Pro')).getByText('billed monthly')).toBeInTheDocument();
  });

  it('switches every price and caption to yearly, and back', async () => {
    render(<PricingSection goTo={vi.fn()} />);
    const toggle = screen.getByRole('switch', { name: 'Bill yearly' });
    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
    expect(within(planCard('Hobby')).getByText('$0')).toBeInTheDocument();
    expect(within(planCard('Hobby')).getByText('free, no card needed')).toBeInTheDocument();
    expect(within(planCard('Pro')).getByText('$20')).toBeInTheDocument();
    expect(within(planCard('Pro')).getByText('billed $240 yearly')).toBeInTheDocument();
    expect(within(planCard('Team')).getByText('$60')).toBeInTheDocument();
    expect(within(planCard('Team')).getByText('billed $720 yearly')).toBeInTheDocument();

    await userEvent.click(toggle);
    expect(toggle).not.toBeChecked();
    expect(within(planCard('Pro')).getByText('$25')).toBeInTheDocument();
  });

  it('advertises the saving and keeps the highlighted plan highlighted in both periods', async () => {
    render(<PricingSection goTo={vi.fn()} />);
    expect(screen.getByText('Save 20%')).toBeInTheDocument();
    expect(screen.getAllByText('Most popular')).toHaveLength(1);
    expect(within(planCard('Pro')).getByText('Most popular')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('switch', { name: 'Bill yearly' }));
    expect(screen.getAllByText('Most popular')).toHaveLength(1);
    expect(within(planCard('Pro')).getByText('Most popular')).toBeInTheDocument();
  });

  it('sends every plan button to the signup form (they are mock)', async () => {
    const goTo = vi.fn();
    render(<PricingSection goTo={goTo} />);
    await userEvent.click(within(planCard('Hobby')).getByRole('button', { name: 'Get started' }));
    await userEvent.click(within(planCard('Pro')).getByRole('button', { name: 'Start free trial' }));
    await userEvent.click(within(planCard('Team')).getByRole('button', { name: 'Contact sales' }));
    expect(goTo.mock.calls).toEqual([['signup'], ['signup'], ['signup']]);
  });
});
```

`PricingSection.test.tsx` has no `within()` collision comment because it scopes every query to a plan card from its first line. The package's first collision comment is in `SiteHeader.test.tsx` (Task 9), where nav links really do exist twice, and `App.test.tsx` (Task 10) has one more for "Start free trial".

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/components/PlanCard.test.tsx src/components/PricingSection.test.tsx`
Expected: FAIL, cannot resolve `./PlanCard`, `./PricingSection`.

- [ ] **Step 3: Write the components**

Two library facts are commented where they bite: `Toggle` needs an `id` (without it the switch has no accessible name; the test `getByRole('switch', { name: 'Bill yearly' })` is what catches that), and `Card` renders an `<h3>` only for `title`, so the plan name is our own `<h3>` beside the "Most popular" badge.

`src/components/PlanCard.tsx`:

```tsx
import { Badge, Button, Card } from 'cyberui-2045';
import { formatPrice, priceCaption, type BillingPeriod, type Plan } from '../data/plans';
import { CheckIcon } from '../icons';

interface PlanCardProps {
  plan: Plan;
  period: BillingPeriod;
  onSelect: () => void;
}

// The name is our own <h3> (not Card's `title` prop) so the "Most popular" tag
// can sit beside it. Card renders an <h3> only when `title` is given, so this
// does not make two. The highlighted plan gets Card's `accent` variant: the
// glowing border is the whole emphasis, and no other card on the page has it.
export function PlanCard({ plan, period, onSelect }: PlanCardProps) {
  return (
    <Card variant={plan.highlighted ? 'accent' : 'default'} className="card-surface plan-card">
      <div className="plan-head">
        <h3 className="plan-name">{plan.name}</h3>
        {plan.highlighted ? (
          <Badge variant="accent" size="sm">
            Most popular
          </Badge>
        ) : null}
      </div>
      <p className="plan-blurb">{plan.blurb}</p>
      <p className="plan-price">
        <span className="plan-amount">{formatPrice(plan.price[period])}</span>
        <span className="plan-unit"> /month</span>
      </p>
      <p className="plan-caption">{priceCaption(plan, period)}</p>
      <ul className="plan-features">
        {plan.features.map((feature) => (
          <li key={feature}>
            <span className="plan-check">
              <CheckIcon />
            </span>
            {feature}
          </li>
        ))}
      </ul>
      <Button className="plan-cta" variant={plan.highlighted ? 'primary' : 'secondary'} onClick={onSelect}>
        {plan.cta}
      </Button>
    </Card>
  );
}
```

`src/components/PricingSection.tsx`:

```tsx
import { useState } from 'react';
import { Badge, Toggle } from 'cyberui-2045';
import { PLANS, YEARLY_SAVING_PCT, type BillingPeriod } from '../data/plans';
import { sectionProps, type SectionProps } from '../sections';
import { PlanCard } from './PlanCard';
import { SectionHeading } from './SectionHeading';

export function PricingSection({ goTo }: SectionProps) {
  const [period, setPeriod] = useState<BillingPeriod>('monthly');

  return (
    <section {...sectionProps('pricing')} className="section">
      <div className="page-width">
        <SectionHeading id="pricing" />
        <div className="billing-switch">
          {/*
            Toggle only connects its visible label to the switch when it is
            given an `id`, so the id is not optional: without it the switch has
            no accessible name. role="switch" because it is an on/off setting,
            not a choice to submit; onChange receives the new boolean.
          */}
          <Toggle
            id="billing-period"
            role="switch"
            label="Bill yearly"
            checked={period === 'yearly'}
            onChange={(yearly) => setPeriod(yearly ? 'yearly' : 'monthly')}
          />
          <Badge variant="success" size="sm">
            Save {YEARLY_SAVING_PCT}%
          </Badge>
        </div>
        <ul className="plan-grid">
          {PLANS.map((plan) => (
            <li key={plan.id}>
              {/* MOCK: every plan button just scrolls to the signup form. A real page links to checkout, or to your sales contact for the top tier. */}
              <PlanCard plan={plan} period={period} onSelect={() => goTo('signup')} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

```css
/* ---- Pricing ---- */

.billing-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 48rem) {
  .plan-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.plan-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.plan-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.plan-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-default);
}

.plan-blurb,
.plan-caption {
  color: var(--color-muted);
  font-size: 0.9375rem;
}

.plan-price {
  display: flex;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
}

.plan-amount {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-default);
}

.plan-unit {
  margin-inline-start: 0.25rem;
  color: var(--color-muted);
}

.plan-features {
  display: grid;
  gap: 0.5rem;
  margin: 0.5rem 0 1rem;
  padding: 0;
  list-style: none;
}

.plan-features li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.plan-check {
  display: inline-flex;
  flex: none;
  margin-top: 0.15rem;
  color: var(--color-success);
}

.plan-check svg {
  width: 1.125rem;
  height: 1.125rem;
}

.plan-cta {
  width: 100%;
  margin-top: auto;
}
```

- [ ] **Step 4: Run the tests, then commit**

Run: `npx vitest run src/components/PlanCard.test.tsx src/components/PricingSection.test.tsx` (expected PASS: 4 + 4) and `npx tsc --noEmit`.

```bash
git add src
git commit -m "feat(landing): pricing with a working monthly/yearly switch" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 8: FAQ and the signup form

The second real interaction, and the one mock that takes input.

**Files:**
- Create: `src/components/FaqSection.tsx`, `SignupForm.tsx`, `SignupSection.tsx` (each with a `.test.tsx`)
- Modify: `src/App.css` (append the FAQ and Signup blocks)

**Interfaces:**
- `FaqSection()`: one `Accordion` (`mode="single"`) over `FAQ`. `SignupForm()`: a labelled `Input` (`name="email"`), a submit `Button`, an always-rendered `<p role="status">`. Validation: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` on the trimmed value; invalid sets the error, clears any confirmation and focuses the field; valid sets the confirmation and clears the field; typing clears the error. `SignupSection()`.

- [ ] **Step 1: Write the failing tests**

`src/components/FaqSection.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAQ } from '../data/faq';
import { FaqSection } from './FaqSection';

// Accordion keeps every answer in the DOM (hidden with aria-hidden and inert),
// so getByText would find closed answers. These tests read each question
// button's aria-expanded, and the answer through its region role, which a
// closed (aria-hidden) answer does not have.
const question = (index: number) => screen.getByRole('button', { name: FAQ[index]!.question });

describe('FaqSection', () => {
  it('lists every question, all closed to start with', () => {
    render(<FaqSection />);
    expect(screen.getAllByRole('button')).toHaveLength(FAQ.length);
    for (let i = 0; i < FAQ.length; i += 1) expect(question(i)).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryAllByRole('region', { name: FAQ[0]!.question })).toHaveLength(0);
  });

  it('opens one answer at a time', async () => {
    render(<FaqSection />);
    await userEvent.click(question(0));
    expect(question(0)).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: FAQ[0]!.question })).toHaveTextContent(FAQ[0]!.answer);

    await userEvent.click(question(1));
    expect(question(1)).toHaveAttribute('aria-expanded', 'true');
    expect(question(0)).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryAllByRole('region', { name: FAQ[0]!.question })).toHaveLength(0);
  });

  it('closes an open answer when its question is pressed again', async () => {
    render(<FaqSection />);
    await userEvent.click(question(2));
    await userEvent.click(question(2));
    expect(question(2)).toHaveAttribute('aria-expanded', 'false');
  });

  it('works from the keyboard: Tab to a question, Enter opens it, the arrow keys move between questions', async () => {
    render(<FaqSection />);
    await userEvent.tab();
    expect(question(0)).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(question(0)).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}');
    expect(question(1)).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(question(FAQ.length - 1)).toHaveFocus();
  });
});
```

`src/components/SignupForm.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignupForm } from './SignupForm';

const input = () => screen.getByLabelText('Email address');
const submit = () => screen.getByRole('button', { name: 'Start free trial' });

describe('SignupForm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('has a labelled email field and an empty polite status that is already in the page', () => {
    render(<SignupForm />);
    expect(input()).toHaveAttribute('type', 'email');
    expect(input()).toHaveAttribute('aria-invalid', 'false');
    // role="status" is a polite live region; it has to exist before its text does.
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('rejects a malformed address: shows the error, links it to the field, and puts focus back on the field', async () => {
    render(<SignupForm />);
    await userEvent.type(input(), 'not-an-email');
    await userEvent.click(submit());
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveAccessibleDescription('Enter a valid email address.');
    expect(input()).toHaveFocus();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('rejects an empty field the same way', async () => {
    render(<SignupForm />);
    await userEvent.click(submit());
    expect(input()).toHaveAccessibleDescription('Enter a valid email address.');
  });

  it('accepts a valid address, announces the confirmation politely, and clears the field', async () => {
    render(<SignupForm />);
    await userEvent.type(input(), '  ada@example.com ');
    await userEvent.click(submit());
    expect(screen.getByRole('status')).toHaveTextContent("Thanks, you're on the list. This is a demo, so nothing was sent.");
    expect(input()).toHaveValue('');
    expect(input()).toHaveAttribute('aria-invalid', 'false');
  });

  it('clears the error as soon as the person edits the field, and replaces it with the confirmation on a good retry', async () => {
    render(<SignupForm />);
    await userEvent.type(input(), 'oops');
    await userEvent.click(submit());
    await userEvent.type(input(), '@example.com');
    expect(screen.queryByText('Enter a valid email address.')).not.toBeInTheDocument();
    await userEvent.click(submit());
    expect(screen.getByRole('status')).toHaveTextContent('on the list');
  });

  it('sends nothing: no network request is made (the form is a mock)', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    render(<SignupForm />);
    await userEvent.type(input(), 'ada@example.com');
    await userEvent.click(submit());
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
```

`src/components/SignupSection.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { SignupSection } from './SignupSection';

describe('SignupSection', () => {
  it('is the "Get started" region and holds the signup form', () => {
    render(<SignupSection />);
    const section = screen.getByRole('region', { name: 'Get started' });
    expect(section).toHaveAttribute('id', 'signup');
    expect(within(section).getByLabelText('Email address')).toBeInTheDocument();
    expect(within(section).getByRole('button', { name: 'Start free trial' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/components/FaqSection.test.tsx src/components/SignupForm.test.tsx src/components/SignupSection.test.tsx`
Expected: FAIL, cannot resolve the three components.

- [ ] **Step 3: Write the components**

Library facts commented at their use sites: `Accordion` keeps closed answers in the DOM and needs explicit item ids; `Input` links its error with `aria-describedby` but does not announce it and does not forward a ref, which is why a failed submit moves focus to the field by looking it up by `name`; the status paragraph is always rendered because a live region must exist before its text changes. The form is `noValidate` so the browser's own bubble does not pre-empt the styled message.

`src/components/FaqSection.tsx`:

```tsx
import { Accordion } from 'cyberui-2045';
import { FAQ } from '../data/faq';
import { sectionProps } from '../sections';
import { SectionHeading } from './SectionHeading';

// Built once: the questions are static. Each item gets an explicit `id`
// because Accordion otherwise ids items by position, which would attach the
// open state to the wrong question if the list were ever reordered. Accordion
// renders every answer in the DOM, hidden (aria-hidden and inert) until opened,
// and `single` mode (the default) closes the open item when another opens.
const ITEMS = FAQ.map((item) => ({
  id: item.id,
  title: item.question,
  content: <p className="faq-answer">{item.answer}</p>,
}));

export function FaqSection() {
  return (
    <section {...sectionProps('faq')} className="section">
      <div className="page-width faq-width">
        <SectionHeading id="faq" />
        <Accordion items={ITEMS} mode="single" />
      </div>
    </section>
  );
}
```

`src/components/SignupForm.tsx`:

```tsx
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, Input } from 'cyberui-2045';
import { SIGNUP } from '../data/product';

// Deliberately loose: it catches typos, not undeliverable addresses (only
// sending a message can do that). Replace it if your backend is stricter.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (error) setError('');
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setConfirmation('');
      setError(SIGNUP.invalid);
      // Focus goes back to the field so a screen reader reads its label and
      // the linked error together. Input does not forward a ref, so find it by name.
      (event.currentTarget.elements.namedItem('email') as HTMLInputElement | null)?.focus();
      return;
    }
    // MOCK: nothing is sent. This is where your sign-up request goes, e.g.
    //   await fetch('/api/signup', { method: 'POST', body: JSON.stringify({ email }) });
    // and the confirmation below should wait for it to succeed (and show a
    // failure message when it does not).
    setConfirmation(SIGNUP.confirmation);
    setEmail('');
  };

  return (
    // noValidate: the browser's own validation bubble would pre-empt the
    // message below, which is the one this template styles and links to the field.
    <form className="signup-form" onSubmit={onSubmit} noValidate>
      {/*
        Input renders the <label>, the error text, and aria-invalid; when
        `error` is set it also points aria-describedby at that text. It does not
        mark the error as an alert, which is why submit moves focus to the field.
      */}
      <Input
        label={SIGNUP.fieldLabel}
        name="email"
        type="email"
        autoComplete="email"
        placeholder={SIGNUP.placeholder}
        aria-required="true"
        value={email}
        onChange={onChange}
        error={error || undefined}
      />
      <Button type="submit">{SIGNUP.button}</Button>
      {/* role="status" is a polite live region. It must be in the page before its text changes, so it is always rendered. */}
      <p role="status" className="signup-status">
        {confirmation}
      </p>
    </form>
  );
}
```

`src/components/SignupSection.tsx`:

```tsx
import { sectionProps } from '../sections';
import { SectionHeading } from './SectionHeading';
import { SignupForm } from './SignupForm';

export function SignupSection() {
  return (
    <section {...sectionProps('signup')} className="section signup">
      <div className="page-width signup-inner">
        <SectionHeading id="signup" />
        <SignupForm />
      </div>
    </section>
  );
}
```

```css
/* ---- FAQ ---- */

.faq-width {
  max-width: 48rem;
}

.faq-answer {
  margin: 0;
  line-height: 1.6;
}
```

```css
/* ---- Signup ---- */

.signup-inner {
  max-width: 40rem;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.signup-status {
  min-height: 1.5rem;
  margin: 0;
  color: var(--color-success);
}
```

- [ ] **Step 4: Run the tests, then commit**

Run: `npx vitest run src/components/FaqSection.test.tsx src/components/SignupForm.test.tsx src/components/SignupSection.test.tsx` (expected PASS: 4 + 6 + 1) and `npx tsc --noEmit`.

```bash
git add src
git commit -m "feat(landing): FAQ accordion and the signup form (mock submit, real validation)" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 9: Header with the mobile menu, hero, footer

The three pieces that make the page feel like a page. The Drawer is the part with a real trap in it (Review Focus #3).

**Files:**
- Create: `src/components/SiteHeader.tsx`, `HeroSection.tsx`, `SiteFooter.tsx` (each with a `.test.tsx`)
- Modify: `src/App.css` (append the Header, Hero and Footer blocks)

**Interfaces:**
- `SiteHeader({ goTo })`: wordmark, a `nav` named "Primary" with one link per `NAV_ITEMS` entry, a "Start free trial" button, and below `md` a "Menu" button that opens a `Drawer` (title "Menu") holding a `nav` named "Mobile" with the same links and the trial button. Links are `<a href="#id">` whose click is intercepted (`preventDefault`, then `goTo`); inside the Drawer a click records the target in a ref, closes the Drawer, and an effect scrolls **after** it has unmounted.
- `HeroSection({ goTo })`: the page's only `<h1>` (`HERO.headline.lead` then `HERO.headline.highlight` in `GradientText`), the lead, two buttons (primary goes to `signup`, secondary to `pricing`; both mock), three figures, and a terminal snippet in a `figure`.
- `SiteFooter()`: `footer` with a "Footer" `nav` of three `h2`-headed columns of mock links, the copyright and the `DEMO_NOTE` line.

- [ ] **Step 1: Write the failing tests**

`SiteHeader.test.tsx` carries the package's first `within()` comment: once the menu is open every nav link exists twice (the header and the dialog).

`src/components/SiteHeader.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
  const goTo = vi.fn();

  beforeEach(() => {
    goTo.mockClear();
    window.location.hash = '';
  });

  it('shows the wordmark and a link for every nav entry, in page order', () => {
    render(<SiteHeader goTo={goTo} />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getAllByRole('link').map((link) => link.textContent)).toEqual(['Features', 'How it works', 'Pricing', 'FAQ']);
    expect(screen.getByRole('link', { name: 'Tessera' })).toBeInTheDocument();
  });

  it('scrolls to the section on a nav click and leaves location.hash alone', async () => {
    render(<SiteHeader goTo={goTo} />);
    await userEvent.click(within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('link', { name: 'Pricing' }));
    expect(goTo).toHaveBeenCalledExactlyOnceWith('pricing');
    expect(window.location.hash).toBe('');
  });

  it('sends the header button to the signup form', async () => {
    render(<SiteHeader goTo={goTo} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start free trial' }));
    expect(goTo).toHaveBeenCalledExactlyOnceWith('signup');
  });

  describe('the menu below md', () => {
    it('opens a dialog with the same links, and says so on the button', async () => {
      render(<SiteHeader goTo={goTo} />);
      const menuButton = screen.getByRole('button', { name: 'Menu' });
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      await userEvent.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      // The links now exist twice (header nav and menu), so scope to the dialog.
      const dialog = screen.getByRole('dialog', { name: 'Menu' });
      expect(within(dialog).getAllByRole('link').map((link) => link.textContent)).toEqual(['Features', 'How it works', 'Pricing', 'FAQ']);
    });

    it('closes on a link click and scrolls only after it has closed', async () => {
      render(<SiteHeader goTo={goTo} />);
      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
      await userEvent.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'FAQ' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(goTo).toHaveBeenCalledExactlyOnceWith('faq');
      expect(window.location.hash).toBe('');
    });

    it('lets the menu start the trial too', async () => {
      render(<SiteHeader goTo={goTo} />);
      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
      await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Start free trial' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(goTo).toHaveBeenCalledExactlyOnceWith('signup');
    });

    it('closes on Escape without scrolling anywhere', async () => {
      render(<SiteHeader goTo={goTo} />);
      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
      await userEvent.keyboard('{Escape}');
      // The library closes with a short animation, then calls onClose.
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(goTo).not.toHaveBeenCalled();
    });
  });
});
```

`src/components/HeroSection.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('has the page’s one h1, with the highlighted phrase inside it', () => {
    render(<HeroSection goTo={vi.fn()} />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('From git push to live in seconds');
    expect(screen.getByRole('region', { name: 'From git push to live in seconds' })).toBeInTheDocument();
  });

  it('sends the primary button to the signup form and the secondary one to pricing', async () => {
    const goTo = vi.fn();
    render(<HeroSection goTo={goTo} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start free trial' }));
    await userEvent.click(screen.getByRole('button', { name: 'See pricing' }));
    expect(goTo.mock.calls).toEqual([['signup'], ['pricing']]);
  });

  it('shows the terminal snippet with a caption, and the three illustrative figures', () => {
    render(<HeroSection goTo={vi.fn()} />);
    const terminal = screen.getByRole('figure');
    expect(within(terminal).getByText('Example terminal session')).toBeInTheDocument();
    expect(terminal).toHaveTextContent('Live at https://my-app.tessera.example');
    expect(screen.getByText('median build')).toBeInTheDocument();
    expect(screen.getByText('99.99%')).toBeInTheDocument();
  });
});
```

`src/components/SiteFooter.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('is the page’s contentinfo landmark', () => {
    render(<SiteFooter />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('says once, in the agreed words, that this is a demo', () => {
    render(<SiteFooter />);
    expect(screen.getAllByText('Template demo: Tessera is fictional and the form sends nothing.')).toHaveLength(1);
  });

  it('lists the link columns under their headings', () => {
    render(<SiteFooter />);
    const nav = screen.getByRole('navigation', { name: 'Footer' });
    expect(within(nav).getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Product', 'Company', 'Legal']);
    expect(within(nav).getByRole('link', { name: 'Privacy' })).toBeInTheDocument();
  });

  it('has mock links: clicking one is cancelled and does not touch location.hash', () => {
    render(<SiteFooter />);
    const link = screen.getByRole('link', { name: 'Privacy' });
    // fireEvent.click returns false when a handler called preventDefault.
    expect(fireEvent.click(link)).toBe(false);
    expect(window.location.hash).toBe('');
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/components/SiteHeader.test.tsx src/components/HeroSection.test.tsx src/components/SiteFooter.test.tsx`
Expected: FAIL, cannot resolve the three components.

- [ ] **Step 3: Write the components**

Why the header scrolls from an effect: while the Drawer is open the library sets `document.body.style.overflow = 'hidden'` and parks focus inside the dialog. If the click handler scrolled immediately, the scroll would run under that lock and `goTo`'s `focus()` could be overwritten when the Drawer restores focus. Recording the target and scrolling in an effect that runs after the Drawer unmounted (its cleanup has restored the body) avoids both; the test `closes on a link click and scrolls only after it has closed` pins the order, and Task 13 checks it in a real browser.

`src/components/SiteHeader.tsx`:

```tsx
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Button, Drawer } from 'cyberui-2045';
import { HERO, NAV_ITEMS, PRODUCT_NAME } from '../data/product';
import type { SectionId } from '../sections';

interface SiteHeaderProps {
  goTo: (id: SectionId) => void;
}

export function SiteHeader({ goTo }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pendingSection = useRef<SectionId | null>(null);

  // Scroll only after the Drawer has unmounted. While it is open the library
  // locks the page's scroll (body overflow: hidden) and puts focus inside the
  // dialog; this effect runs after both have been undone, so the scroll lands
  // and goTo's focus() is not overwritten by the Drawer closing.
  useEffect(() => {
    if (!menuOpen && pendingSection.current) {
      const id = pendingSection.current;
      pendingSection.current = null;
      goTo(id);
    }
  }, [menuOpen, goTo]);

  // These are <a href="#id"> for the semantics (a link to a place on the page),
  // but the click is intercepted: following the href would rewrite
  // location.hash, which this template never does (see utils/scrollToSection.ts).
  const onNavClick = (id: SectionId) => (event: MouseEvent) => {
    event.preventDefault();
    goTo(id);
  };
  const chooseFromMenu = (id: SectionId) => {
    pendingSection.current = id;
    setMenuOpen(false);
  };
  const onMenuLinkClick = (id: SectionId) => (event: MouseEvent) => {
    event.preventDefault();
    chooseFromMenu(id);
  };

  return (
    <header className="site-header">
      <div className="site-header-inner page-width">
        <a className="wordmark" href="#hero" onClick={onNavClick('hero')}>
          {PRODUCT_NAME}
        </a>
        <nav className="site-nav" aria-label="Primary">
          {NAV_ITEMS.map(({ id, label }) => (
            <a key={id} className="site-nav-link" href={`#${id}`} onClick={onNavClick(id)}>
              {label}
            </a>
          ))}
        </nav>
        <div className="site-header-actions">
          {/* MOCK: scrolls to the signup form. A real page would start a trial or go to your sign-up route. */}
          <Button className="header-cta" size="sm" onClick={() => goTo('signup')}>
            {HERO.primaryCta}
          </Button>
          {/* Below md the links move into a Drawer; CSS hides this button from md up. */}
          <Button
            className="menu-button"
            variant="ghost"
            size="sm"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </Button>
        </div>
      </div>
      <Drawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" side="right" size="sm">
        <nav className="drawer-nav" aria-label="Mobile">
          {NAV_ITEMS.map(({ id, label }) => (
            <a key={id} className="site-nav-link" href={`#${id}`} onClick={onMenuLinkClick(id)}>
              {label}
            </a>
          ))}
          <Button onClick={() => chooseFromMenu('signup')}>{HERO.primaryCta}</Button>
        </nav>
      </Drawer>
    </header>
  );
}
```

`src/components/HeroSection.tsx`:

```tsx
import { Badge, Button, Card, GradientText } from 'cyberui-2045';
import { HERO, type TerminalLineKind } from '../data/product';
import { headingId, sectionProps, type SectionProps } from '../sections';

// A Record over the line kinds, like every other kind -> class map in these
// templates: a new kind without a class is a compile error.
const TERMINAL_LINE_CLASS: Record<TerminalLineKind, string> = {
  command: 'terminal-line terminal-line--command',
  ok: 'terminal-line terminal-line--ok',
};

export function HeroSection({ goTo }: SectionProps) {
  return (
    <section {...sectionProps('hero')} className="section hero">
      <div className="page-width hero-inner">
        <div className="hero-copy">
          <Badge variant="neutral" shape="square" shadow={false} size="sm">
            {HERO.eyebrow}
          </Badge>
          <h1 id={headingId('hero')} className="hero-title">
            {HERO.headline.lead} <GradientText>{HERO.headline.highlight}</GradientText>
          </h1>
          <p className="hero-lead">{HERO.lead}</p>
          {/* MOCK: both buttons only scroll. size takes a per-breakpoint object since cyberui-2045 2.8.0. */}
          <div className="hero-actions">
            <Button size={{ base: 'md', lg: 'lg' }} onClick={() => goTo('signup')}>
              {HERO.primaryCta}
            </Button>
            <Button variant="secondary" size={{ base: 'md', lg: 'lg' }} onClick={() => goTo('pricing')}>
              {HERO.secondaryCta}
            </Button>
          </div>
          <dl className="hero-stats">
            {HERO.stats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        {/* Card renders no <h3> without a title, which is what we want here. */}
        <Card variant="small" className="card-surface hero-terminal">
          <figure>
            <figcaption className="visually-hidden">Example terminal session</figcaption>
            <pre className="terminal">
              <code>
                {HERO.terminal.map((line) => (
                  <span key={line.text} className={TERMINAL_LINE_CLASS[line.kind]}>
                    {line.text}
                  </span>
                ))}
              </code>
            </pre>
          </figure>
        </Card>
      </div>
    </section>
  );
}
```

`src/components/SiteFooter.tsx`:

```tsx
import { Divider } from 'cyberui-2045';
import { DEMO_NOTE, FOOTER_COLUMNS, PRODUCT_NAME, TAGLINE } from '../data/product';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-width">
        <Divider />
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="wordmark">{PRODUCT_NAME}</span>
            <p>{TAGLINE}</p>
          </div>
          <nav className="footer-columns" aria-label="Footer">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="footer-heading">{column.title}</h2>
                <ul>
                  {column.links.map((label) => (
                    <li key={label}>
                      {/* MOCK: these links go nowhere. Give each a real href; preventDefault keeps the placeholder from jumping to the top and rewriting the URL. */}
                      <a href="#" onClick={(event) => event.preventDefault()}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <p className="footer-legal">
          © {new Date().getFullYear()} {PRODUCT_NAME}. <span>{DEMO_NOTE}</span>
        </p>
      </div>
    </footer>
  );
}
```

```css
/* ---- Header ---- */

.site-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--color-base) 90%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border-default);
}

.site-header-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: var(--header-height);
}

.wordmark {
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-secondary);
  text-decoration: none;
}

.site-nav {
  display: none;
  margin-inline-start: auto;
  gap: 1.75rem;
}

.site-nav-link {
  padding-block: 0.25rem;
  color: var(--color-default);
  text-decoration: none;
  border-bottom: 2px solid transparent;
}

.site-nav-link:hover {
  color: var(--color-secondary);
  border-bottom-color: var(--color-secondary);
}

.site-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-inline-start: auto;
}

/* Below md: no inline links and no header button; the Menu button opens the Drawer. */
.header-cta {
  display: none;
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.25rem;
  font-size: 1.125rem;
}

@media (min-width: 48rem) {
  .site-nav {
    display: flex;
  }

  .site-header-actions {
    margin-inline-start: 0;
  }

  .header-cta {
    display: inline-block;
  }

  .menu-button {
    display: none;
  }
}
```

```css
/* ---- Hero ---- */

.hero {
  padding-block: 2.5rem var(--section-pad);
}

.hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2.5rem;
  align-items: center;
}

@media (min-width: 64rem) {
  .hero-inner {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  }
}

.hero-title {
  margin: 1.25rem 0 1rem;
  font-size: clamp(2.25rem, 1.4rem + 3.6vw, 4rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: var(--color-default);
}

.hero-lead {
  margin: 0 0 1.75rem;
  max-width: 34rem;
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--color-muted);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2.5rem;
  margin: 2.5rem 0 0;
  padding: 0;
}

/* dt (the label) comes first in the markup, so the label is read before the
   number; column-reverse shows the number above it. */
.hero-stat {
  display: flex;
  flex-direction: column-reverse;
}

.hero-stat dt {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.hero-stat dd {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--color-secondary);
}

.hero-terminal figure {
  margin: 0;
}

.terminal {
  margin: 0;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.9375rem;
  line-height: 1.8;
}

.terminal-line {
  display: block;
  white-space: pre;
}

.terminal-line--command {
  color: var(--color-default);
}

.terminal-line--ok {
  color: var(--color-success);
}

/* One entrance at first load, for the hero only, and none for people who asked
   for less motion. Nothing on this page animates on scroll. */
@media (prefers-reduced-motion: no-preference) {
  .hero-copy,
  .hero-terminal {
    animation: hero-in 600ms ease-out both;
  }

  .hero-terminal {
    animation-delay: 120ms;
  }
}

@keyframes hero-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}
```

```css
/* ---- Footer ---- */

.site-footer {
  padding-block: 1.5rem 2.5rem;
}

.footer-grid {
  display: grid;
  gap: 2rem;
  padding-block: 2rem;
}

@media (min-width: 48rem) {
  .footer-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  }
}

.footer-brand p {
  margin: 0.5rem 0 0;
  color: var(--color-muted);
}

.footer-columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
}

.footer-heading {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-default);
}

.footer-columns ul {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.footer-columns a {
  color: var(--color-muted);
  text-decoration: none;
}

.footer-columns a:hover {
  color: var(--color-secondary);
}

.footer-legal {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-muted);
}
```

- [ ] **Step 4: Run the tests, then commit**

Run: `npx vitest run src/components/SiteHeader.test.tsx src/components/HeroSection.test.tsx src/components/SiteFooter.test.tsx` (expected PASS: 7 + 3 + 4) and `npx tsc --noEmit`. The Escape test waits for the library's ~250ms close animation, so the header file takes about a second.

```bash
git add src
git commit -m "feat(landing): sticky header with a mobile menu, the hero and the footer" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 10: The app shell

Wire everything. After this task the page works end to end.

**Files:**
- Create: `src/noInlineStyles.test.ts`
- Modify: `src/App.tsx`, `src/App.test.tsx` (both replace the Task 2 placeholders)

- [ ] **Step 1: Write the failing tests**

`noInlineStyles.test.ts` is copied from agent-panel unchanged (it scans `./**/*.tsx` as raw text, which works under Vitest, unlike CSS). It is added now rather than in Task 2 because its "finds the source files" test needs more than ten `.tsx` files to exist.

`src/noInlineStyles.test.ts`:

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

`App.test.tsx` is the integration test: landmarks, one `h1`, heading order, every section rendered in `SECTIONS` order and focusable by code, the skip link, nav scrolling (smooth, then `auto` under reduced motion), `location.hash` untouched, and one flow through the billing switch and the form. It carries the "scope with `within()`" comment, because "Start free trial" is in the header, the hero, the Pro plan and the form.

`src/App.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { SECTIONS } from './sections';

describe('App', () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    // happy-dom has no layout, so record the call instead of scrolling.
    Element.prototype.scrollIntoView = scrollIntoView;
    scrollIntoView.mockClear();
    window.location.hash = '';
  });
  afterEach(() => vi.unstubAllGlobals());

  it('renders the three landmarks and both navigation regions', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeInTheDocument();
  });

  it('has exactly one h1, and headings never skip a level', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    let previous = 0;
    for (const heading of screen.getAllByRole('heading')) {
      const level = Number(heading.tagName.slice(1));
      expect(level, `"${heading.textContent}" jumps from h${previous} to h${level}`).toBeLessThanOrEqual(previous + 1);
      previous = level;
    }
  });

  it('renders every section in SECTIONS order, each a labelled region that code can focus', () => {
    render(<App />);
    const rendered = Array.from(document.querySelectorAll('main > section')).map((section) => section.id);
    expect(rendered).toEqual([...SECTIONS]);
    for (const section of document.querySelectorAll('main > section')) {
      expect(section).toHaveAttribute('aria-labelledby', `${section.id}-heading`);
      expect(section).toHaveAttribute('tabindex', '-1');
      expect(document.getElementById(`${section.id}-heading`), `${section.id} has no heading`).not.toBeNull();
    }
  });

  it('skips to the main content without touching location.hash', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('link', { name: 'Skip to main content' }));
    expect(screen.getByRole('main')).toHaveFocus();
    expect(window.location.hash).toBe('');
  });

  // "Start free trial" is in the header, the hero, the Pro plan and the signup
  // form, so queries here are scoped to the region they mean (the same fix as
  // everywhere in this repo: scope with within(), never rename the text).
  it('scrolls to a section, smoothly, when a nav link is clicked, and moves focus there', async () => {
    render(<App />);
    await userEvent.click(within(screen.getByRole('banner')).getByRole('link', { name: 'Pricing' }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('pricing'));
    expect(document.getElementById('pricing')).toHaveFocus();
    expect(window.location.hash).toBe('');
  });

  it('jumps instead of animating when the visitor prefers reduced motion', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    render(<App />);
    await userEvent.click(within(screen.getByRole('banner')).getByRole('button', { name: 'Start free trial' }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('signup'));
  });

  it('takes a visitor from the pricing toggle to the confirmation, the whole page working together', async () => {
    render(<App />);
    const pricing = screen.getByRole('region', { name: 'Pricing' });
    await userEvent.click(within(pricing).getByRole('switch', { name: 'Bill yearly' }));
    expect(within(pricing).getByText('billed $240 yearly')).toBeInTheDocument();

    const signup = screen.getByRole('region', { name: 'Get started' });
    await userEvent.type(within(signup).getByLabelText('Email address'), 'ada@example.com');
    await userEvent.click(within(signup).getByRole('button', { name: 'Start free trial' }));
    expect(within(signup).getByRole('status')).toHaveTextContent('on the list');
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL (the placeholder `App` has none of this). `noInlineStyles.test.ts` should already pass: `npx vitest run src/noInlineStyles.test.ts` (4 tests).

- [ ] **Step 3: Write the app**

`App.tsx` is the pattern to copy: `SECTION_COMPONENTS` is a `Record<SectionId, ComponentType<SectionProps>>`, and `SECTIONS` (not the object) decides the order. Its comments say why the skip link is not a plain `href="#main"`.

`src/App.tsx`:

```tsx
import { useCallback, type ComponentType, type MouseEvent } from 'react';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { SECTIONS, type SectionId, type SectionProps } from './sections';
import { scrollToSection } from './utils/scrollToSection';
import { SiteHeader } from './components/SiteHeader';
import { HeroSection } from './components/HeroSection';
import { LogoStrip } from './components/LogoStrip';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { SignupSection } from './components/SignupSection';
import { SiteFooter } from './components/SiteFooter';
import './App.css';

// Record<SectionId, ...> is the page's table of contents: adding an id to
// SECTIONS (src/sections.ts) without a component here is a type error, instead
// of a section that silently never renders. Order comes from SECTIONS, not from
// this object. A component that needs nothing from SectionProps may ignore it.
const SECTION_COMPONENTS: Record<SectionId, ComponentType<SectionProps>> = {
  hero: HeroSection,
  logos: LogoStrip,
  features: FeaturesSection,
  'how-it-works': HowItWorksSection,
  pricing: PricingSection,
  faq: FaqSection,
  signup: SignupSection,
};

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  const goTo = useCallback((id: SectionId) => scrollToSection(id, reducedMotion), [reducedMotion]);

  // The skip link would normally be href="#main", but following it writes
  // location.hash (see utils/scrollToSection.ts). Focusing <main> does the same job.
  const skipToMain = (event: MouseEvent) => {
    event.preventDefault();
    document.getElementById('main')?.focus();
  };

  return (
    <div className="landing">
      <a className="skip-link" href="#main" onClick={skipToMain}>
        Skip to main content
      </a>
      <SiteHeader goTo={goTo} />
      <main id="main" tabIndex={-1}>
        {SECTIONS.map((id) => {
          const Section = SECTION_COMPONENTS[id];
          return <Section key={id} goTo={goTo} />;
        })}
      </main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 4: Run the whole suite and the build**

Run: `npx vitest run` (expected: 23 files, 75 tests, all PASS, no warnings in the output), `pnpm --filter landing-template run build` (expected clean). Then `pnpm --filter landing-template dev` and click through once; fix anything glaring now (the full browser pass is Task 13).

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat(landing): the app shell, wired from the SECTIONS list" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 11: The README (the forker's documentation)

The README is the only documentation that travels with a fork (repo `CLAUDE.md`). It is in agent-panel's shape and honesty standard.

**Files:**
- Create: `packages/landing/README.md`

- [ ] **Step 1: Write the README**

Sections, in order: what it is and what is mock (the footer line, the Real/Mock/Images lists); the three commands and "Requires Node 20.19 or newer"; **Re-theming**; **Where your content goes** (the four data files, the two places to make the mock parts real, how to add a section, the `index.html` tags, and the two deliberate behaviours: no `location.hash` writes and Escape closing the menu); **Principles this code follows** (the table the Code tab in Task 17 mirrors). Every principle in it must be true of the shipped code and every link must resolve; Step 2 checks the links.

`README.md`:

````markdown
# Tessera landing page (template)

A one-page marketing site for a product launch (a hero, a logo strip, features, how it works, pricing with a monthly/yearly switch, an FAQ, a signup form and a footer) built with [cyberui-2045](https://www.npmjs.com/package/cyberui-2045). Tessera is a fictional deploy platform: swap in your own product by editing the files in `src/data/`.

**Nothing here is connected to anything: no signup is sent, no plan is billed, no link goes anywhere.** The page says so once, in a line in the footer ("Template demo: Tessera is fictional and the form sends nothing."). Delete that line when you make the page real.

- **Real:** the Monthly/Yearly switch (it changes every price and caption), the FAQ (one answer open at a time), the menu that replaces the header links on narrow screens, and the signup form's own validation (a malformed email shows an error and does not "send").
- **Mock:** the signup form (a valid email shows a confirmation and nothing is sent), every "Start free trial", "Get started" and "Contact sales" button (they scroll to the signup form), all the footer links (they do nothing), and every number, logo name, plan, price and answer. The company names in the logo strip are invented placeholders; do not ship them.
- **Images:** none. The visuals are cyberui-2045 components, CSS and inline SVG, so the package has no image files to replace or license.

```bash
npm install && npm run dev   # start the dev server
npm run build                # type-check and build to dist/
npm test                     # run the test suite
```

Requires Node 20.19 or newer.

## Re-theming

The orange accent is two color tokens in [src/theme/orange.css](src/theme/orange.css), imported right after the library's stylesheet in [src/main.tsx](src/main.tsx). cyberui-2045's components read those tokens, so changing the two values re-themes the whole page. `--color-primary` (magenta, the far end of the headline's gradient) is left alone on purpose. When you pick a new accent, check that it reaches 4.5:1 contrast on both `--color-base` and `--color-surface`; the file's comment has the numbers for this orange, and says why it sits close to the library's `warning` colour. One thing to know when you add your own `Card`: the library gives it magenta body text by default, so give it the `card-surface` class as the existing cards do (see [src/App.css](src/App.css)).

## Where your content goes

Everything the page says comes from four files, so most of "make it mine" is a data edit:

- [src/data/product.ts](src/data/product.ts): the product name, headline, hero text, the three figures, the logo names, the three steps, every section's heading, the signup copy, the nav labels, the footer columns and the demo line.
- [src/data/features.ts](src/data/features.ts): the six feature cards (an icon name, a title, two lines).
- [src/data/plans.ts](src/data/plans.ts): the plans, each with a price for every billing period.
- [src/data/faq.ts](src/data/faq.ts): the questions and answers.

To make the signup real, replace the comment block in `onSubmit` in [src/components/SignupForm.tsx](src/components/SignupForm.tsx) with your request, and show the confirmation only after it succeeds. To make the plan buttons real, change `onSelect` in [src/components/PricingSection.tsx](src/components/PricingSection.tsx) to go to checkout. To add a section, add its id to `SECTIONS` in [src/sections.ts](src/sections.ts): the compiler then lists what is still missing (a component in `src/App.tsx`, a heading in `SECTION_COPY` and a nav decision in `NAV_LABELS`, both in `src/data/product.ts`).

Before you publish, replace the title, description and social tags in [index.html](index.html). They describe the fictional product, and link previews read them, not your React components.

Two things that are deliberate and easy to trip over. Nav links scroll with `scrollIntoView` and never write `location.hash` (see [src/utils/scrollToSection.ts](src/utils/scrollToSection.ts)), so the page behaves the same inside an iframe or under any deploy subpath. And pressing Escape closes the mobile menu; if you embed this page in another page that also closes on Escape, both close.

## Principles this code follows

| Principle | Where to see it |
|---|---|
| **Single source of truth** | The order of the sections is the `SECTIONS` list in [src/sections.ts](src/sections.ts). The advertised yearly saving is one number, `YEARLY_SAVING_PCT` in [src/data/plans.ts](src/data/plans.ts), which the "Save 20%" tag displays and [src/data/plans.test.ts](src/data/plans.test.ts) checks every paid plan against. |
| **DRY** | Every section's heading and lead sentence go through one component, [src/components/SectionHeading.tsx](src/components/SectionHeading.tsx), which reads its words from `SECTION_COPY`. Every `<section>`'s id, label and focus behavior come from `sectionProps` in [src/sections.ts](src/sections.ts). |
| **Typed and exhaustive** | `Record<SectionId, …>` maps in [src/App.tsx](src/App.tsx) and [src/data/product.ts](src/data/product.ts) turn "added a section but forgot its component, heading or nav decision" into a compile error. Plan prices are a `Record<BillingPeriod, number>` in [src/data/plans.ts](src/data/plans.ts), so a new billing period fails to compile until every plan has a price for it. |
| **No inline styles, no stray colors** | All styling is in CSS classes. [src/noInlineStyles.test.ts](src/noInlineStyles.test.ts) fails if a `style={...}` prop appears, and [src/noHexColors.test.ts](src/noHexColors.test.ts) fails if any stylesheet other than `orange.css` contains a hex color. |
| **Content as data** | The page's words live in [src/data/](src/data/), not in JSX. Components take a plan, a feature or a question as a prop and render it. |
| **Tested** | A test file sits next to each component, data file and helper, covering the behavior (the billing switch, the FAQ, the menu, the form's validation and confirmation, the scroll-to-section links) rather than the markup. The exceptions are `src/main.tsx`, `src/sections.ts` (exercised through [src/App.test.tsx](src/App.test.tsx)) and the stylesheets. |
````

- [ ] **Step 2: Check every link and every claim**

```bash
# from packages/landing
for f in $(grep -o '](\([^)#]*\))' README.md | sed 's/](//;s/)//' | grep -v '^http'); do [ -e "$f" ] || echo "MISSING LINK TARGET: $f"; done
```

Expected: no output. Then read each row of the Principles table against the code and fix the README (not the code) if a row is not true. In particular: `sectionProps` is in `src/sections.ts`; `YEARLY_SAVING_PCT` is checked by `src/data/plans.test.ts`; the two `Record<SectionId, …>` maps are in `src/App.tsx` and `src/data/product.ts`.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(landing): README for people who fork the template" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 12: The standalone check (clean room)

Prove a fork works with nothing from the monorepo (monitoring plan Task 9's method), and prove it on the npm a forker is likely to have.

**Files:** none (all work in a temporary directory outside the repo; keep the helper scripts outside the package).

- [ ] **Step 1: Copy the package out of the workspace and install there**

```bash
# from the repo root
CLEAN=$(mktemp -d)
tar --exclude=node_modules --exclude=dist -cf - -C packages/landing . | tar -xf - -C "$CLEAN"
cd "$CLEAN" && node --version && npm --version && npm install && npm run build && npm test
```

Expected: `npm install` ends with `added N packages` and prints **no `npm error` and no `npm warn`** (a one-line `found 0 vulnerabilities` and the funding notice are not warnings); the build and all 75 tests pass. Record the Node and npm versions you used in the PR. With Node 20's bundled npm 10.x a `Cannot read properties of null (reading 'edgesOut')` crash means `vitest` in `package.json` is below `^4.1.12` (Task 2); do not paper over it with `--legacy-peer-deps`. With npm 11 you may see an `npm warn install-scripts` notice about postinstall scripts of `cyberui-2045` and `esbuild`; that comes from those dependencies, not from this package: record it and carry on.

- [ ] **Step 2: Check it is self-contained**

Save this script **outside** the package (for example next to the temp directory) and run it against the real package folder:

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
node /path/to/check-standalone.mjs packages/landing
```

Expected: `standalone check OK: no workspace: ranges, no imports leaving the package`. Also confirm `diff LICENSE packages/landing/LICENSE` prints nothing, `packages/landing/package.json` has `"license": "MIT"`, and `ls packages/landing` shows no `CLAUDE.md` and no process or skill files.

- [ ] **Step 3: Run it from the copy**

In the clean copy, run `npm run dev`, open the printed address (or `curl -s -o /dev/null -w '%{http_code}' http://localhost:5173/` and expect `200`), then stop it.

- [ ] **Step 4: After PR A is merged, the real fork path**

```bash
npx --yes tiged patrickkuei/cyberui-templates/packages/landing /tmp/landing-tiged
cd /tmp/landing-tiged && npm install && npm run build && npm test
```

Record the result in PR B's description (and in the spec's findings, Task 19). If it cannot be run yet, say so. Nothing to commit in this task.

### Task 13: The real-browser look

Layout, the Drawer, the sticky header, focus rings and the real accent contrast cannot be tested under happy-dom (spec §8), so this is a task with a checklist, as issue #47 requires: **1440, 800 and 390px**, checked in a real browser, fixing what fails in the file it belongs to (each fix its own commit).

**Files:**
- Modify: whatever the checks say; `docs/superpowers/specs/2026-10-16-landing-page-design.md` (append "Findings from the first browser check")

- [ ] **Step 1: Start the page and pick your tool**

Run `pnpm --filter landing-template dev` and open the printed address. Any real browser works (a desktop browser with its devtools, the Claude Browser pane, or a throwaway `puppeteer-core` script that lives outside the repo). Set the viewport with the tool (devtools device toolbar, or `resize_window`); read measurements from the console. Note which tool you used and which browser: say so in the findings.

- [ ] **Step 2: Accent contrast, from the real tokens**

Save this script outside the package and run it with the installed stylesheet and the theme file:

```js
// Usage: node contrast.mjs <path to cyberui-2045.css> <path to src/theme/orange.css>
// Prints WCAG contrast ratios for the pairs this page actually uses.
import { readFileSync } from 'node:fs';

const [libraryCss, themeCss] = process.argv.slice(2).map((file) => readFileSync(file, 'utf8'));
const hex = (css, name) => css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
const color = {
  base: hex(libraryCss, 'base'),
  surface: hex(libraryCss, 'surface'),
  muted: hex(libraryCss, 'muted'),
  primary: hex(libraryCss, 'primary'),
  success: hex(libraryCss, 'success'),
  accent: hex(themeCss, 'accent'),
};

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
  ['accent on base (links, stats)', 'accent', 'base', 4.5],
  ['accent on surface (secondary button)', 'accent', 'surface', 4.5],
  ['base on accent (primary button, badge text)', 'base', 'accent', 4.5],
  ['muted on base (body copy)', 'muted', 'base', 4.5],
  ['muted on surface', 'muted', 'surface', 4.5],
  ['success on base (ticks, confirmation)', 'success', 'base', 4.5],
  ['primary on base (far end of the headline gradient, large text)', 'primary', 'base', 3],
];
for (const [label, fg, bg, need] of pairs) {
  const value = ratio(color[fg], color[bg]);
  console.log(`${Number(value) >= need ? 'ok  ' : 'FAIL'} ${value}:1 (needs ${need})  ${label}`);
}
```

```bash
node /path/to/contrast.mjs packages/landing/node_modules/cyberui-2045/dist/cyberui-2045.css packages/landing/src/theme/orange.css
```

Expected (the numbers computed while writing this plan; spec §4 had the first two by hand):

```
ok   7.27:1 (needs 4.5)  accent on base (links, stats)
ok   5.70:1 (needs 4.5)  accent on surface (secondary button)
ok   7.27:1 (needs 4.5)  base on accent (primary button, badge text)
ok   6.02:1 (needs 4.5)  muted on base (body copy)
ok   4.72:1 (needs 4.5)  muted on surface
ok   12.83:1 (needs 4.5)  success on base (ticks, confirmation)
ok   4.39:1 (needs 3)  primary on base (far end of the headline gradient, large text)
```

Any `FAIL` is a finding: fix the colour use (not the library) or, if the accent itself fails, say so to the owner. The gradient headline is large text, so the 3:1 bar applies to it; say that in the findings.

- [ ] **Step 3: Desktop, 1440px wide (top of the page)**

- The header is sticky: wordmark left, four links and an orange "Start free trial" button right, no Menu button.
- Hero in two columns (copy left, terminal card right). The headline's second line is a gradient from orange to magenta. The eyebrow badge is an outlined, square-cornered neutral badge. The three figures are orange. Both hero buttons are the large size (`size={{ base: 'md', lg: 'lg' }}` taking effect is the 2.8.0 fix; at 390px they are the medium size).
- The logo strip: a thin orange rule, a small orange caption, five names in muted text.
- **No stray cyan or yellow, and no magenta body text.** Run this in the console; expected `{"cyanYellow":[],"magentaText":[...]}` where `magentaText` lists only the Steps chevrons (`›`; they are the library's deliberate `--color-primary`) and, with the menu open, the Drawer's "Menu" title:

```js
const bad = ['rgb(0, 255, 249)', 'rgb(255, 251, 0)'];
const props = ['color','backgroundColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','outlineColor','boxShadow','textDecorationColor','fill','stroke'];
const cyanYellow = [...document.querySelectorAll('body *')].flatMap(el => { const cs = getComputedStyle(el); return props.filter(p => bad.some(b => String(cs[p]).includes(b))).map(p => el.tagName + '.' + String(el.className.baseVal ?? el.className).slice(0,40) + ' ' + p); });
const magentaText = [...document.querySelectorAll('body *')].filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && getComputedStyle(el).color === 'rgb(255, 0, 93)').map(el => el.tagName + '.' + String(el.className).slice(0,40) + ' "' + el.textContent.trim().slice(0,30) + '"');
JSON.stringify({cyanYellow, magentaText})
```

  If the page has not loaded fully, wait a second first: the hero fades in over 600ms. It reads computed styles of the states you visit; hover and focus states are not scanned.
- Scroll through: Features is three columns of six cards with orange outlined icons; How it works is horizontal (three titles with underlines, three captions, magenta chevrons between); Pricing shows three plan cards (Pro has the glowing orange border and a "Most popular" badge, ticks are green); the switch reads "Bill yearly" with a green "Save 20%" tag; FAQ is a single column of six closed items; the signup card is narrow and centred; the footer has three link columns and, under them, the copyright with the demo line.
- Click the switch: every price changes (`$25` to `$20`, `$75` to `$60`, captions `billed monthly` to `billed $240 yearly` and `billed $720 yearly`), Hobby stays `$0`, Pro keeps its badge. Click it again: back.
- FAQ: open one, then another; the first closes. With the keyboard: Tab to a question, Enter opens it, ArrowDown moves to the next question, End to the last.
- Form: press the button empty; a small red message appears under the field, the field has a red outline and **keeps focus**. Type a valid address and submit: the field clears and a green line says "Thanks, you're on the list. This is a demo, so nothing was sent."

- [ ] **Step 4: Nav and focus**

- Click "Pricing" in the header: the page scrolls (smoothly) so the Pricing section's top sits just under the sticky header (its `getBoundingClientRect().top` should be about 64, the header height; **not hidden behind the header**), the address bar does not change (`location.hash === ''`), and `document.activeElement.id === 'pricing'`.
- Keyboard from the top of the page (click the address bar, then Tab): the first stop is a "Skip to main content" link that appears at the top left; Enter focuses the main area and the URL does not change. Then Tab reaches the wordmark, the four links, the header button, then the hero buttons. **Every stop shows a visible focus indicator** (an orange outline on links, the library's ring on buttons, inputs and the switch); Space toggles the switch.

- [ ] **Step 5: Tablet, 800px wide**

- No sideways scroll: `document.documentElement.scrollWidth <= innerWidth` (it reads 785 at 800 because of the scrollbar). The header still shows the links, no Menu button (the menu appears below 768px).
- Hero is one column (the terminal card under the copy). Features are two columns. How it works is still horizontal (the three steps are about 550px wide inside a ~736px column). **Pricing is three columns of about 230px**: confirm no price, caption or button text is clipped (`[...document.querySelectorAll('.plan-card *')].filter(e => e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0).length` should be `0`). If three columns are too tight to read, change the breakpoint of `.plan-grid` in the Pricing block from `48rem` to `64rem` and say so in the findings.

- [ ] **Step 6: Phone, 390px wide**

- No sideways scroll: `scrollWidth` equals the viewport, and `[...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest('.visually-hidden'))` is empty.
- The header shows the wordmark and a "Menu" button only. The hero buttons stack; the terminal card scrolls inside itself if a line is long (it does not widen the page); the figures wrap.
- Menu: it opens a drawer from the right with the heading "Menu", four links and a "Start free trial" button; Escape and the × close it. **Click "Pricing" in the drawer:** the drawer closes, the page scrolls so Pricing sits under the header, `location.hash` is still `''`, `document.activeElement.id` is `pricing`, and `document.body.style.overflow` is `''` again (the scroll lock was released; if the page will not scroll afterwards, Review Focus #3 failed: fix `SiteHeader.tsx`).
- Pricing cards stack, one column; the Pro card sits second.

- [ ] **Step 7: Reduced motion**

Emulate `prefers-reduced-motion: reduce` (devtools Rendering panel, or `page.emulateMediaFeatures` in puppeteer) and reload. Expected: `document.querySelector('.hero-copy').getAnimations().length` is `0` (it is `1`, named `hero-in`, without the emulation), the page renders at once, and clicking a nav link jumps instead of animating (`scrollY` is final immediately). Say if you could not emulate it.

- [ ] **Step 8: Fix what failed, then record what you found**

Fix each failure in the file it belongs to (its own commit each, message `fix(landing): <what>`). Then append a "Findings from the first browser check" section at the end of `docs/superpowers/specs/2026-10-16-landing-page-design.md`: the tool and browser, what needed a fix, what was checked and held (with the numbers: contrast, scroll widths, plan-card widths), and what you could **not** check, stated plainly. Candidates that are known not to be covered: a screen reader; Firefox and Safari; a real touch device; hover and focus states in the colour scan; the Drawer's lack of a focus trap (read in the library, not tested).

```bash
git add docs/superpowers/specs/2026-10-16-landing-page-design.md packages/landing
git commit -m "docs(landing): findings from the first browser check" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 14: Library findings, then open PR A

**Files:** none (a GitHub step and the PR).

- [ ] **Step 1: File anything found in cyberui-2045 on patrickkuei/CyberUI** (issue #47, step 4)

The template never works around a library problem silently without a comment saying so, and the library owner can only fix what is reported. Candidates found while writing this plan, all from reading the published 2.8.0 files, none yet reproduced in a browser:

1. **`Toggle`: the visible `label` is not connected to the switch unless an `id` is passed**, so without one the switch has no accessible name (`Toggle.js`: `<label htmlFor={id}>`, and the input gets `id={id}`).
2. **`Input`: a newly shown `error` is not announced.** It sets `aria-describedby` to the error text but the text has no `role="alert"` or `aria-live`, unlike `FormField`'s error. This template moves focus to the field to compensate, and says so in a comment.
3. **`Steps` has no static or "none current" mode.** Omitting `status` makes step 0 current with an animated marker, and `current={items.length}` logs a dev warning, so a plain "how it works" row has to mark every step `completed`. (A feature request.)
4. **`Drawer` has no focus trap** that was found in `Drawer.js` or `useDialogBehavior.js` although it sets `aria-modal`. Reproduce it in a browser (open the Drawer and Tab past its last control) before reporting.

For each one you can reproduce on the installed version (and, where it is cheap, the latest published version): search `gh issue list -R patrickkuei/CyberUI --state all --search "<keywords>"` first to avoid a duplicate, then `gh issue create -R patrickkuei/CyberUI --title "<short>" --body "<what you did, what you expected, what happened, version, a minimal snippet>"` ending the body with the line `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. Drop any candidate you cannot reproduce or that is already filed, and put the issue links in both PR descriptions. If `gh` cannot reach that repository, list the findings in the PR description instead and say so.

- [ ] **Step 2: Run everything once more**

From the repo root: `pnpm --filter landing-template run build`, `pnpm --filter landing-template test` (23 files, 75 tests), `pnpm install --frozen-lockfile` (succeeds), `npm run check:license`, `npm run check:templates-readme` (both pass: they only know the two published templates until PR B). Note: `check:code-tab` and `check:template-builds` do not know `landing` yet, which is why they still pass.

- [ ] **Step 3: Push and open PR A**

```bash
git push -u origin feat/landing-template
gh pr create --base main --title "feat(landing): the third template, a marketing landing page" --body "<summary; test plan; what was and was not checked (Task 13's findings); the npm 10 install note (vitest ^4.1.12); the agent-panel noHexColors finding; library issues filed; Refs #47>"
```

The PR body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)` and says, in plain words: the two findings about the existing templates (`noHexColors.test.ts` in agent-panel passes vacuously, and the other templates' `npm install` fails on npm 10.8.2) are reported here but not fixed here. Do not merge.

---

## PR B: publish it on the site

Start after PR A is merged: `git checkout main && git pull && git checkout -b feat/site-landing`. **Order of work:** PR A merges first; PR B is started from the updated `main`. PR B cannot pass `check:code-tab` until then (the Code tab's excerpts and folders must exist in `packages/landing`), and `check:license` and `check:template-builds` only start covering the package once Task 17 registers it. Everything the site shows is derived from `TEMPLATES` and needs no edit (Home's "N templates ready", the Templates page, the section component, the preview dialog, the start prompt and fork command, the router, `llms.ts`, the `<noscript>` list in `staticHtml.ts`; `sitemap.xml` lists only the site root). Read `packages/site/src/data/templates.ts` and `src/content/templateContent.ts` first.

Checks that must pass before the PR is opened (Task 19 runs them): `npm run test:scripts`, `npm run check:process-excerpts`, `npm run check:templates-readme`, `npm run check:code-tab`, `npm run check:license`, `npm run check:template-builds`, and the full `pnpm -r --workspace-concurrency=1 run test` (serial: run in parallel, the Vitest processes compete for CPU and a few monitoring tests time out on a loaded machine).

### Task 15: The examples: two role-play interviews, kept verbatim

The Examples on the Templates page are **never invented** (spec 2026-10-05 §2 and §4; spec 2026-10-16 §11). They are two subagents playing a person, asked what they would type to their AI, in order, where they would get stuck, and how they would know it worked. They are language-model role-plays, not users, and the page says so. If you cannot run subagents, **stop and ask the owner; do not write the examples yourself.**

**Files:** none in the repo yet (the interviews are saved outside it; Task 17 puts the chosen pieces into `templateContent.ts`).

- [ ] **Step 1: Run two interviews, one subagent each**

Use this brief for both, changing only the persona. Save each reply **whole and unedited** to its own file outside the repo (`interview-1.txt`, `interview-2.txt`):

> You are \<persona\>. You have just downloaded the Landing Page template from the CyberUI templates site: a one-page marketing site for a fictional deploy platform called Tessera (a hero, a logo strip, features, how it works, pricing with a monthly/yearly switch, an FAQ, a signup form and a footer), built with React and a cyberpunk-styled component library. It is a demo: the product, the numbers, the logos and the plans are made up, and the signup form sends nothing. You will tell your AI coding assistant what to change. Reply with: (1) what you would type to your AI, in order, 4 to 6 messages; (2) where you would get stuck; (3) how you would know it worked.

Personas (spec §11): (a) an indie developer launching a paid side project (a small paid tool; they want to take payment and put it on their own domain); (b) a product manager who needs a waitlist page to show stakeholders before engineering starts (not a developer; wants to collect emails). Add one or two sentences of detail to each persona if you like, but do not tell them what to say, what will go wrong or what the template lacks.

- [ ] **Step 2: Choose what goes on the page, by these rules**

- Everything is **verbatim**: the person's own words, never reworded or tidied. Long fields are truncated with an ellipsis (`…`) as the monitoring and agent-panel entries do (see `packages/site/src/content/templateContent.ts`). The messages go in order, in `requests`.
- **"Where they'd get stuck" may only list obstacles that the library and the templates did not cause** (the owner's rule for this section: it is there for honesty, and the section exists to share how people would use the template): hosting, a domain, DNS, an email provider or a mailing list, taking real payment, accounts and who gets access. **Drop** any passage that is a comment on the template or the demo itself ("it is all fake", "the README says", "for real life I'd say not yet"): those read as feedback, not as use. If nothing in an interview qualifies for "stuck", do not write something: report it to the owner.
- Examples should read like monitoring's: what the person asks for, the real wall they hit (connecting their own system), and how they would know it worked.
- Voice: the labels inside the section say "they"; the entry's `title` names the person ("An indie developer", "A product manager").

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

Expected: `verbatim check OK (2 examples)`. It splits each piece at its ellipses and requires every part to be found word for word (whitespace aside) in that person's interview. Nothing to commit in this task.

### Task 16: The screenshot

**Files:**
- Create: `packages/site/public/screenshots/landing.png`

- [ ] **Step 1: Take it**

Run `pnpm --filter landing-template dev`, open it at **1440px wide and 900px tall**, wait a second for the hero entrance to finish, scroll to the top, and capture the viewport. Save it as `packages/site/public/screenshots/landing.png` (monitoring's is 76 KB and agent-panel's 133 KB; keep it under about 200 KB). Use the browser tooling in your session; a throwaway `puppeteer-core` script outside the repo with `page.setViewport({ width: 1440, height: 900 })` and `page.screenshot({ path })` is fine. If you have no tool that can capture it, leave the file for the owner and say so in the PR (Task 17's screenshot test fails until it exists, so do not merge).

**A deviation from spec §10, for the owner:** the spec says "taken at the top of the page with the pricing toggle visible". At 1440x900 the pricing switch is about 2,900px below the top, so a top-of-page capture cannot show it. This plan captures **the top of the page** (header, headline, buttons, figures, terminal and logo strip), which is what makes a visitor recognise a landing page; the billing switch is the first thing the live demo shows when they scroll. If the owner prefers the pricing section, capture with the page scrolled so Pricing fills the frame instead (it shows three plan cards and the switch in one frame).

- [ ] **Step 2: Check it**

Run: `ls -l packages/site/public/screenshots/landing.png` (expected under about 200 KB), and open it: no cyan or yellow, the orange accent, the headline gradient visible, the header not cut off. Nothing to commit yet (Task 17 commits it with the entry).

### Task 17: Site data, copy, Code tab

**Files (all under `packages/site/` unless noted):**
- Modify: `src/data/templates.ts`, `src/data/templates.test.ts`, `src/content/templateContent.ts`, `src/content/templateContent.test.ts`, `src/content/codeTabs.json`, `src/content/staticHtml.ts`, `src/content/staticHtml.test.ts`

- [ ] **Step 1: Write the failing tests**

In `src/data/templates.test.ts`, inside `describe('templates', …)`, add:

```ts
  it('looks up the landing page and gives it an orange accent distinct from the others', () => {
    expect(getTemplate('landing')?.name).toBe('Landing Page');
    expect(getTemplate('landing')?.accentHex).toBe('#ff8a3d');
  });
```

(The existing generic tests already check distinct accents, relative screenshot paths and that every screenshot file exists, so they cover the new entry once it is added.)

In `src/content/templateContent.test.ts`, inside `describe('template content', …)`, add:

```ts
  it('gives the landing page fit copy that says plainly the signup sends nothing, and two examples', () => {
    const content = TEMPLATE_CONTENT.landing!;
    expect(content.useIf).toHaveLength(3);
    expect(content.headsUp).toMatch(/signup sends nothing/);
    expect(content.headsUp).toMatch(/the page, not the backend/);
    expect(content.examples).toHaveLength(2);
  });

  it('no longer says the other two templates are not for a landing page, now that there is one', () => {
    for (const slug of ['monitoring', 'agent-panel']) {
      expect(TEMPLATE_CONTENT[slug]!.notFor, slug).not.toMatch(/landing page/);
    }
    expect(TEMPLATE_CONTENT.landing!.notFor).toMatch(/dashboard/);
  });
```

In `src/content/staticHtml.test.ts`, inside `describe('headTags', …)`, add:

```ts
  it('names all three templates in the description a link preview and a search result show', () => {
    expect(head).toContain('an AI monitoring dashboard, an agent control panel and a landing page');
  });
```

- [ ] **Step 2: Run them to verify they fail**

Run (from `packages/site`): `npx vitest run src/data src/content`
Expected: FAIL (no `landing` entry or copy; the description does not name the landing page; the other two `notFor` still say "landing page").

- [ ] **Step 3: Add the template entry**

In `src/data/templates.ts`, add after the `agent-panel` entry (`slug:` immediately followed by `name:`, plain single-line quoted strings with no quote inside: `scripts/check-templates-readme.mjs` reads this file as text):

```ts
  {
    slug: 'landing',
    name: 'Landing Page',
    tagline: 'A hero, features, pricing with a working billing toggle, FAQ and a signup form for a product launch.',
    accentLabel: 'Orange',
    accentHex: '#ff8a3d',
    screenshotSrc: './screenshots/landing.png',
    livePreviewPath: './live/landing/index.html',
  },
```

- [ ] **Step 4: Add the section copy and fix the other two `notFor` lines**

In `src/content/templateContent.ts`, add after the `'agent-panel'` entry (wording is spec §11, extended with the changes below; `examples` come from Task 15, in the `ExampleCase` shape the other two use):

```ts
  landing: {
    code: CODE_TABS.landing!,
    useIf: [
      'a launch page for a product or side project',
      'a pricing page with plans to compare',
      'a one-screen "join the waitlist" page',
    ],
    headsUp:
      'This is a demo: the product and numbers are made up and the signup sends nothing. You get the page, not the backend. Your AI can help you connect yours.',
    notFor: "if you're after a dashboard or a native mobile app. (A one-page portfolio is fine.)",
    examples: [/* the two chosen examples from Task 15, verbatim */],
  },
```

And edit the two existing lines (spec §10 names them; they are lines 32 and 73 at the time of writing, search for `landing page`), because "Probably not for you: … a landing page" becomes false the moment this ships:

```ts
// monitoring
    notFor: "if you're after a native mobile app. (A marketing dashboard is fine.)",
// agent-panel
    notFor: "if you're after a native mobile app. (A chat window for your customers is fine.)",
```

The existing comment above `TEMPLATE_CONTENT` (examples are role-plays, never reworded) already covers the new entry; add no comment of your own unless something differs from the other entries.

- [ ] **Step 5: Name the landing page in the site's description**

In `src/content/staticHtml.ts` the description currently reads `such as an AI monitoring dashboard and an agent control panel`. Change that part to `such as an AI monitoring dashboard, an agent control panel and a landing page` (the rest of the string stays). `llms.ts` and the `<noscript>` list derive from `TEMPLATES` and `TEMPLATE_CONTENT` and need no edit (their own comments say so); `sitemap.xml` lists only the site root.

- [ ] **Step 6: Write the Code tab entry**

Add the `"landing"` entry below to `src/content/codeTabs.json` after `"agent-panel"` (add the comma). Principles must be true and each excerpt copied **verbatim** from the merged package. The block below was generated by slicing the code in this plan and checked with the repo's own `checkCodeTabs` against a copy of the package; **re-copy from the merged files if anything changed since** (open the file, copy the lines, keep indentation, one array entry per line), then run `npm run check:code-tab`.

```json
  "landing": {
    "principles": [
      {
        "name": "Single source of truth",
        "detail": "The advertised saving is one number.",
        "file": "src/data/plans.ts",
        "excerpt": [
          "/** The saving the \"Save 20%\" tag advertises. plans.test.ts checks every paid plan really gives it. */",
          "export const YEARLY_SAVING_PCT = 20;"
        ]
      },
      {
        "name": "DRY",
        "detail": "Every section heading comes from one component.",
        "file": "src/components/SectionHeading.tsx",
        "excerpt": [
          "export function SectionHeading({ id, quiet = false }: SectionHeadingProps) {",
          "  const { title, lead } = SECTION_COPY[id];",
          "  return (",
          "    <div className={quiet ? 'section-heading section-heading--quiet' : 'section-heading'}>",
          "      <div id={headingId(id)}>"
        ]
      },
      {
        "name": "Typed and exhaustive",
        "detail": "A section without a component fails to compile.",
        "file": "src/App.tsx",
        "excerpt": [
          "const SECTION_COMPONENTS: Record<SectionId, ComponentType<SectionProps>> = {",
          "  hero: HeroSection,",
          "  logos: LogoStrip,",
          "  features: FeaturesSection,",
          "  'how-it-works': HowItWorksSection,",
          "  pricing: PricingSection,",
          "  faq: FaqSection,",
          "  signup: SignupSection,",
          "};"
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
        "detail": "Tests check what a visitor can do, next to the code.",
        "file": "src/components/PricingSection.test.tsx",
        "excerpt": [
          "  it('starts on monthly billing with the switch off', () => {",
          "    render(<PricingSection goTo={vi.fn()} />);",
          "    expect(screen.getByRole('switch', { name: 'Bill yearly' })).not.toBeChecked();",
          "    expect(within(planCard('Hobby')).getByText('$0')).toBeInTheDocument();",
          "    expect(within(planCard('Pro')).getByText('$25')).toBeInTheDocument();",
          "    expect(within(planCard('Team')).getByText('$75')).toBeInTheDocument();",
          "    expect(within(planCard('Pro')).getByText('billed monthly')).toBeInTheDocument();",
          "  });"
        ]
      },
      {
        "name": "Content as data",
        "detail": "Swap the product by editing four files.",
        "file": "src/data/features.ts",
        "excerpt": [
          "export const FEATURES: Feature[] = [",
          "  {",
          "    id: 'zero-config',",
          "    icon: 'bolt',",
          "    title: 'Zero-config builds',",
          "    body: 'Tessera picks the build command and output folder for you. Override either with one line when you need to.',",
          "  },"
        ]
      }
    ],
    "folders": [
      {
        "path": "src/components",
        "purpose": "One file per section, plus the cards and the form."
      },
      {
        "path": "src/data",
        "purpose": "The content of the page: product, features, plans, FAQ. Your product goes here."
      },
      {
        "path": "src/theme",
        "purpose": "The accent override."
      },
      {
        "path": "src/hooks",
        "purpose": "Reduced-motion preference."
      },
      {
        "path": "src/utils",
        "purpose": "Scrolling to a section."
      },
      {
        "path": "src/icons",
        "purpose": "Inline SVG icons."
      }
    ]
  }
```

Principles map to spec §11: Single source of truth (`YEARLY_SAVING_PCT`, one number shared by the tag and the test), DRY (every section heading through `SectionHeading`), Typed and exhaustive (`Record<SectionId, …>`; the `Record<BillingPeriod, …>` plans are named in the README), No inline styles (the test's `visit` function, the same lines monitoring's entry shows), Tested (a behaviour test from `PricingSection.test.tsx`), Content as data ("Swap the product by editing four files": `src/data/`). Folders: each must exist.

- [ ] **Step 7: Run the checks**

Run (`packages/site`): `npx vitest run` (expected all PASS, including the screenshot-exists test now that Task 16's file is there) and `pnpm run build` (expected clean). From the repo root: `npm run check:code-tab` (expected `code tab OK (3 templates checked)`). `npm run check:templates-readme` and `npm run check:template-builds` will FAIL until Task 18; that is expected here.

- [ ] **Step 8: Commit**

```bash
git add packages/site
git commit -m "feat(site): publish the Landing Page: entry, copy, Code tab, screenshot and description" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 18: Wire the build and the README

Make the live preview exist locally and in production, and keep the README table honest.

**Files:**
- Modify: `packages/site/scripts/sync-template-builds.mjs`, `.github/workflows/deploy.yml`, `README.md` (repo root), `package.json` (repo root, the `description` only)

- [ ] **Step 1: Sync script.** In `packages/site/scripts/sync-template-builds.mjs` add a third object, one per line (`scripts/check-template-builds.mjs` parses this list):

```js
const TEMPLATE_BUILDS = [
  { slug: 'monitoring', pnpmFilter: 'monitoring-template' },
  { slug: 'agent-panel', pnpmFilter: 'agent-panel-template' },
  { slug: 'landing', pnpmFilter: 'landing-template' },
];
```

- [ ] **Step 2: Deploy workflow.** In `.github/workflows/deploy.yml` add a step directly after "Build agent-panel template":

```yaml
      - name: Build landing template
        run: pnpm --filter landing-template run build
```

and extend the combine step (keep the existing lines):

```yaml
          mkdir -p packages/site/dist/live/landing
          cp -r packages/landing/dist/. packages/site/dist/live/landing/
```

- [ ] **Step 3: README row.** In the root `README.md` `## Templates` table add, below agent-panel's row:

```
| [Landing Page](packages/landing) | A hero, features, pricing with a working billing toggle, FAQ and a signup form for a product launch. |
```

In the root `package.json`, extend the `description` from `React starter templates (AI monitoring dashboard, agent control panel) built with cyberui-2045` to `React starter templates (AI monitoring dashboard, agent control panel, landing page) built with cyberui-2045`. (Nothing reads it, but it should not go stale.)

- [ ] **Step 4: Verify everything the integration touches**

Run from the repo root: `pnpm install --frozen-lockfile` (succeeds; the lockfile already has the importer from PR A), `npm run test:scripts`, `npm run check:templates-readme`, `npm run check:code-tab`, `npm run check:license`, `npm run check:process-excerpts`, `npm run check:template-builds` (all pass; the last prints `template builds OK (3 templates checked)`). Prove the drift check can fail for the new template: temporarily delete the `landing` copy line from `deploy.yml`, run `npm run check:template-builds` (expected exit 1 naming the missing copy), and restore the line. Do not commit the broken state.

- [ ] **Step 5: Commit**

```bash
git add packages/site/scripts .github/workflows/deploy.yml README.md package.json
git commit -m "ci: build and deploy the landing page; list it in the README" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 19: Look at the published page, verify everything, open PR B

**Files:** none (fixes go in the file they belong to, each its own commit); the spec gets a findings section.

- [ ] **Step 1: Run the whole suite and the production builds**

Run: `pnpm -r run build` and `pnpm -r --workspace-concurrency=1 run test` (monitoring, agent-panel, landing and the site; expected all PASS), then from the repo root `npm run test:scripts` and the five checks (`check:process-excerpts`, `check:templates-readme`, `check:code-tab`, `check:license`, `check:template-builds`). The package tests run in CI (`package-tests`); report the local run too.

- [ ] **Step 2: Start the site with all three real builds**

Run: `pnpm --filter cyberui-templates-site run sync-templates` (builds and copies all three) then `pnpm --filter cyberui-templates-site run dev`; open `#/templates`.

- [ ] **Step 3: Check each item and fix what fails**

Desktop (about 1440px):
- [ ] Three sections in order (monitoring, agent-panel, landing), one h1 "Templates"; each hero shows its own accent (cyan, violet, orange) only on its badge, "Run the live demo" and Copy start prompt; no orange leaks into the folds, the Heads-up or the dialog chrome.
- [ ] The landing screenshot shows the page top, and its frame has the dark bottom gradient and the visible "Run the live demo" button.
- [ ] The dialog opens at `#/templates/landing`, the orange page runs inside, the Code tab shows six principles with excerpts and the six-folder tree, tabs switch without reloading the preview.
- [ ] The Heads-up reads "This is a demo: the product and numbers are made up and the signup sends nothing…".
- [ ] Esc, the close button and a backdrop click close the dialog; Back closes it and stays on Templates; reloading with the dialog open reopens it. Inside the running preview, Esc closes the dialog (the site forwards it; the template has no Esc handling except the mobile menu, which the README mentions).
- [ ] Copy start prompt puts a prompt naming `packages/landing` on the clipboard; the terminal fold shows `npx --yes tiged patrickkuei/cyberui-templates/packages/landing my-app`.
- [ ] Home says "3 templates ready." and does not list templates by name.

**Inside the preview (Review Focus #12; spec §12 says this was untested):**
- [ ] The header stays at the top of the preview while you scroll it.
- [ ] Click "Pricing" in the preview's header: the preview scrolls; **the dialog and the site page behind it do not** (record `parent.scrollY` and the dialog's `scrollTop` before and after) and the site's hash stays `#/templates/landing`. If the site scrolls, `scrollIntoView` is moving ancestor frames: change `scrollToSection.ts` to scroll only its own window, `const top = target.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(target).scrollMarginTop) || 0); window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });`, update `scrollToSection.test.ts` and `App.test.tsx` to spy on `window.scrollTo`, and commit it as `fix(landing): …` in this PR (re-run `check:code-tab`; no Code tab excerpt comes from that file).
- [ ] Switch the preview's billing switch, open an FAQ item, submit the form with a bad and a good address: all work inside the iframe.

Phone (390px): no sideways scroll on `/templates`; the dialog is full-screen; the preview inside it (about 356px wide) shows the wordmark and a Menu button, and the menu opens inside the preview and its links scroll the preview.

Reduced motion: the dialog appears with no fade; inside the preview there is no hero entrance and a nav click jumps.

- [ ] **Step 4: Record what you found** in a short "Findings from checking the published page" section at the end of `docs/superpowers/specs/2026-10-16-landing-page-design.md`, stating plainly what was not checked (the real production deploy, which only happens after merge; `npx tiged …/packages/landing` against the published repo, unless Task 12 Step 4 has now been run; Firefox, Safari, a real phone and a screen reader).

- [ ] **Step 5: Commit, push, open PR B**

```bash
git add docs/superpowers/specs/2026-10-16-landing-page-design.md
git commit -m "docs: record findings from checking the published Landing Page" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git push -u origin feat/site-landing
gh pr create --base main --title "feat(site): publish the Landing Page template" --body "<summary; what was and was not checked; the interviews were role-plays run by subagents and kept verbatim; library issues filed; Closes #47>"
```

The PR body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. Do not merge. The owner ticks the checkbox in the tracking issue #1 by hand.

---

## Self-review notes

**Spec coverage.** §3.1 shape and no hash writes (Tasks 4, 9, 10, 13). §3.2 nine sections: header and footer (9), hero (9), logo strip, features, how it works (6), pricing (7), FAQ and closing signup (8); the numbers strip lives in the hero (9). §3.3 interactions: pricing toggle (7), FAQ (8), Drawer menu closing on link click and Escape (9), smooth scroll only on click (4, 10). §3.4 mock boundaries and the footer line (5, 7, 8, 9, 11). §3.5 landmarks, one h1, skip link, labelled field with `aria-describedby`, polite confirmation, contrast, motion (8, 9, 10, 13). §4 theming and the hex test (3, 13). §5 data files (5). §6 structure and patterns (2-10): `SECTIONS` list (4, 10), `Record<BillingPeriod, …>` (5, 7), mock boundaries (5-9), `within()` note (9, 10). §7 components (Task 1 table; used in 6-9). §8 tests (every task) and the browser check (13). §9 self-containment (2, 12). §10 integration (15-19). §11 copy (17) and examples (15). §12 verification (13, 19). Issue #47 step 4 (14).

**Not covered, by design:** a real signup, billing or analytics; a router; a light theme; real images (the spec's non-goals); changes to cyberui-2045; fixing the two pre-existing problems found while writing this plan (below).

**Names used consistently across tasks:** `SECTIONS`, `SectionId`, `HeadedSection`, `SectionProps`, `headingId`, `sectionProps`, `scrollToSection`, `usePrefersReducedMotion`, `PRODUCT_NAME`, `HERO`, `LOGOS`, `STEPS`, `SECTION_COPY`, `SIGNUP`, `NAV_LABELS`, `NAV_ITEMS`, `FOOTER_COLUMNS`, `DEMO_NOTE`, `FEATURES`, `FEATURE_ICONS`, `FAQ`, `PLANS`, `BillingPeriod`, `YEARLY_SAVING_PCT`, `formatPrice`, `priceCaption`. Region names the tests scope with are the section headings ("Features", "How it works", "Pricing", "FAQ", "Get started", "Teams who ship on Tessera").

**Deviations from the spec** (also in the final report): (1) `FormField` is not used, `Input` alone is (spec §3.2 lists both; `Input` already wires its label and error). (2) The nav labels live in `src/data/product.ts` as `NAV_LABELS` and are derived into `NAV_ITEMS`; the spec's §5 table lists "nav links" there, which holds, but the list is a `Record<SectionId, string | null>`. (3) The billing control is one labelled switch ("Bill yearly") plus a "Save 20%" tag, not a two-ended Monthly/Yearly control, because `Toggle` is a single switch. (4) `Steps` marks all three steps `completed`, the only way to get a static row. (5) The signup confirmation says "This is a demo, so nothing was sent." (the spec says one footer line; this is the one moment a visitor types personal data; the owner may delete the sentence). (6) The screenshot is the top of the page, not "with the pricing toggle visible" (Task 16). (7) Nav links are `<a href="#id">` with the click intercepted, not `<button>`s. (8) `vitest` is `^4.1.12` here (Task 2). (9) `noHexColors.test.ts` reads files from disk (Task 3).

**Verified by reading code or running a command (while writing this plan, in a scratch copy outside the repo on Windows, Node 20.20.2, npm 10.8.2, Vitest 4.1.12):**
- Every prop and behaviour in Task 1's table: read from `npm pack cyberui-2045@2.8.0` (`dist/components/*.d.ts`, the compiled `.js` for Toggle, Accordion, Drawer, Input, Card, Steps, FormField, SectionTitle, GradientText, Divider, `hooks/useDialogBehavior.js`, `component-manifest.json`: 33 components, all twelve named ones present). The responsive `lg:`/`md:` classes and the colour tokens: grepped from `dist/cyberui-2045.css`.
- The package in this plan: `tsc --noEmit` clean, `vite build` clean, 75 tests in 23 files pass with no warnings, and a clean-room copy installed with plain `npm install` (no warnings), built and tested. A planted hex literal makes `noHexColors.test.ts` fail. The README's links all resolve, and `check-standalone.mjs` passes on it.
- The Code tab entry passes the repo's own `checkCodeTabs` (imported from `scripts/check-code-tab.mjs`) against a copy of the package.
- The agent-panel `noHexColors.test.ts` is vacuous (the stylesheet strings have length 0; a planted `#abc123` still passes), and `npm install` of the existing templates' `package.json` fails on npm 10.8.2 with `edgesOut` unless vitest is at least 4.1.12 (bisected: `^4.1.11`, `4.1.11` and `4.1.0` fail; `4.1.12`, `^4.1.12` and `4.0.18` pass; `--legacy-peer-deps` and npm 11 pass).
- In a real browser (the Claude Browser pane, on the dev server): the hero at 1440px; features, how it works, pricing, FAQ, the form error and footer at about 1024px; the Drawer at 390px (opens, a link closes it, the scroll lands with the section 64px under the header, `location.hash` stays empty, focus is on the section, the body scroll lock is released); the billing switch changing prices and captions; the FAQ opening; no sideways scroll at 390, 800 and 820px; plan cards 232px wide and unclipped at 800px, horizontal Steps at 820px (and vertical at 768px in one run, not investigated); a scan for the library's cyan and yellow found none; the only magenta text is the Steps chevrons; the hero's entrance animation exists without reduced motion. The contrast numbers: computed with `contrast.mjs`.
- Site files (read, not run): `templates.ts`, `templateContent.ts` and its two tests, `staticHtml.ts` (and that `<noscript>` derives from `TEMPLATE_ENTRIES` while `sitemap.xml` lists only the root), `llms.ts`, `sync-template-builds.mjs`, `deploy.yml`, `checks.yml`, `check-templates-readme.mjs`, `check-code-tab.mjs`, `check-license.mjs`, `check-template-builds.mjs`, the root README and `package.json`, and the site tests that mention template counts (none hard-codes two apart from a test that uses its own fake second entry). `processEvidence.json` quotes no file this plan edits, so `check:process-excerpts` is unaffected.

**Assumed, not verified:**
- Everything in PR B: no site file was edited and none of the commands in Tasks 15-19 was run (including `pnpm install` with the new importer, the lockfile diff, `sync-templates`, the dialog and iframe behaviour, the `Esc` forwarding and the start prompt for `landing`).
- The scratch copy was **not** inside the pnpm workspace; `pnpm --filter landing-template …` and the lockfile are untested.
- Browser behaviour that was not looked at: a keyboard pass with visible focus rings, reduced-motion emulation, Firefox and Safari, a screen reader, a real phone, hover and focus states in the colour scan. 800px was measured but not viewed (the pane's screenshot was unreliable at that size). The 1440px view was the top of the page only.
- That `scrollIntoView` inside the site's iframe inside a `<dialog>` does not scroll the parent (Task 19 checks it and gives the fallback).
- That the Drawer has no focus trap (read, not exercised) and that the library's `Input`/`Toggle` behaviours in Task 14's list reproduce in a browser.
- That the invented names (Tessera and the five logo names) are not someone's trademark; they were chosen to be unremarkable, not searched.
- That the owner agrees with deviations 5 and 6 above.
