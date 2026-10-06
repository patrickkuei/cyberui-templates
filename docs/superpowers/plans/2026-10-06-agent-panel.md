# Agent Control Panel Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `packages/agent-panel`, a self-contained violet-themed React + Vite template of an AI-assistant control panel (conversation, task queue, live status, reasoning trace, a human approval step) built with cyberui-2045, extractable with `npx tiged`, then publish it on the site's `/templates` page through the same path monitoring took.

**Architecture:** A pure, timer-free, random-free engine (`src/data/simulation.ts`) owns all state and runs scripted scenarios (`src/data/scenarios.ts`, plain data). One hook, `useSimulatedAgent`, is the only timer and exposes stable `actions`. Presentational components render one slice each; three hash-routed pages compose them (`ROUTES` tuple, `Record<Route, …>` maps). The accent is a two-token override of cyberui-2045 (`src/theme/violet.css`). The site publishes it by adding data (a `TEMPLATES` entry, its section copy, a Code tab entry, a screenshot) and wiring the build (sync script, `deploy.yml`, README row).

**Tech Stack:** React 19, TypeScript (strict), Vite 7, Vitest 3 with happy-dom and Testing Library, cyberui-2045 ^2.6.0 (`Avatar`, `Badge`, `Button`, `Card`, `Input`, `LinearProgress`, `Pagination`, `TabNavigation`, `Table`, `Timeline`; optionally `Tooltip`, `SegmentedProgress`). No chart library. Node built-ins for the new check script.

**Spec:** [docs/superpowers/specs/2026-10-06-agent-panel-design.md](../specs/2026-10-06-agent-panel-design.md). Read it first: it holds the decisions, the layout, the copy and the reasons. Issue #9 is the origin but uses stale names (`packages/showcase`, `/gallery/agent-panel`); use the current ones.

**Model to follow:** `packages/monitoring` (structure, README, tests) and the `/templates` plan, [2026-10-05-templates-page.md](2026-10-05-templates-page.md) (publishing). Read `packages/monitoring/README.md` and `src/App.tsx` before Task 1.

> **How much code this plan shows.** Tasks 1-7 and 15-17 give the code to write, because they are foundations or contracts. The engine and scenarios (Tasks 4-6) are the code that was type-checked and smoke-run in a scratch directory while writing the spec; the tests are new and have not been run. Tasks 8-14 (components, pages, README) give the props contract, the behaviors to build, the exact tests to write and the shape of the markup, not every line of JSX or CSS: follow monitoring's components for style and write the rest. If a task's tests and the code here disagree, the tests are the intent.

## Conventions for every task

- **Two pull requests.** PR A: Tasks 1-14 on branch `feat/agent-panel-template` (the package, nothing outside `packages/agent-panel` except `pnpm-lock.yaml`). PR B: Tasks 15-18 on branch `feat/site-agent-panel`, started after PR A is merged (the Code tab's excerpts must exist in the package before `check-code-tab` accepts them). Neither PR merges itself; the owner merges.
- Work in `packages/agent-panel` unless a step says otherwise (Tasks 15-17 work from the repo root or `packages/site`, as each says). Run package tests as `npx vitest run <path>` from the package, or `pnpm --filter agent-panel-template test` from the root.
- Commit with two `-m` flags, the second being exactly: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Conventional commit prefixes as in the log (`feat(agent-panel):`, `test(agent-panel):`, `docs:`, `ci:`, `feat(site):`).
- Pull request bodies reference issue #9 (`Refs #9`) and end with the line `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. PR A says `Refs #9`; PR B says `Closes #9` (the owner decided this, spec Q6).
- `pnpm` is the package manager. No `workspace:` ranges, and nothing in `packages/agent-panel` imports outside its own folder.
- Where this plan says "copy from monitoring", copy the file and keep its comments (they are forker-facing documentation), then change only what the step says.

## Global Constraints

- **Standalone.** `packages/agent-panel` installs and builds under plain `npm install` outside the monorepo (Task 14 proves it). `cyberui-2045` is `^2.6.0` from npm. No `recharts`.
- **Honest about what is simulated.** No model, no network, no persistence. The app shows a "Simulated" badge beside the agent name and the helper line "Scripted demo: replies are pre-written. Nothing is sent to a model or leaves your browser." under the message box. The README lists what is mock (only Export transcript) and what is real inside the simulation (spec §3.4). Tests assert these labels exist.
- **Colour only through tokens.** The accent is `src/theme/violet.css`. No hex colour literal anywhere else in `src/**/*.css`; no JSX `style` attribute anywhere (`noInlineStyles.test.ts`). Components read `var(--color-*)` only, never cyberui's internal Tailwind class names.
- **Deterministic engine.** No `Math.random`, no `Date.now()` in `src/data/simulation.ts` or `scenarios.ts`; the hook is the only caller of `Date.now()` and the only timer.
- **Exhaustive by type.** Anything keyed by a union (`Route`, `AgentStatus`, `TaskStatus`, `TraceOutcome`, `ContextLevel`, `SessionOutcome`, `Tone`) is a `Record<Union, …>`, never an `if/else` chain or a template string.
- **Forker-facing comments** (repo `CLAUDE.md`): the engine contract, the scenario format and its two invariants, the `violet.css` override, the `Card` text-colour gotcha, the derived-not-stored fields, and every mock control. Comment WHY, once, where a reader would be surprised; do not narrate.
- **Tests:** a test file beside every component, page and helper. Where the same text appears in more than one panel, scope the query with `within(screen.getByRole('region', { name: '<panel>' }))`; never rename text or weaken an assertion. One comment at the first collision in a file.
- **No dependencies beyond Task 1's list.** Any change to cyberui-2045's version is out of scope.
- Node `>=20.19`. Page never scrolls sideways at phone width; wide content scrolls inside its own block.

## Review Focus

The spec implies these, but no task's main tests would exercise them unless listed here. Each has an owning task with a test.

1. **A run can hang forever**: a scenario branch with no `reply`, an approval nobody answers while paused, a task the user cancels. Owners: Task 4 (every path ends in `reply`), Task 6 (cancelling a run's task ends the run), Task 5 (`settle` throws if a run never ends).
2. **Lists grow without bound** on a tab left open: messages, trace, runs, finished tasks. Task 6.
3. **Timer leak and idle re-renders**: the interval is cleared on unmount; an idle tick must not re-render. Task 7.
4. **A streaming reply yanks the page.** Auto-scroll sticks to the bottom only if the reader was already there. Task 11.
5. **The composer is usable when it must not be**: mid-run, paused, context full; and each state must say why. Tasks 5 (engine ignores), 11 (UI disables and explains).
6. **Violet leaks**: a leftover cyan/yellow, magenta body text from `Card`, or a hex literal in component CSS. Tasks 2 (hex test), 14 (browser look).
7. **Not standalone**: a `workspace:` range or an import outside the package breaks `tiged`. Tasks 1 and 14.
8. **Mock honesty drift**: a label removed, or a mock control that quietly starts doing something. Tasks 11, 12, 13, 14.
9. **Published but not deployed**: the template is in `TEMPLATES` but missing from the deploy build, so the live preview is blank in production and CI is green. Tasks 16, 17.
10. **Code tab claims go stale**: an excerpt or folder that no longer matches. Task 15 (verified by `check-code-tab` in CI).
11. **Pane switching on phones** is not testable under happy-dom. Task 14 (browser).

---

## PR A: the package

### Task 1: Scaffold the package

A package that installs, type-checks, builds and runs one empty test. Nothing of the template yet.

**Files:**
- Create: `packages/agent-panel/package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`, `LICENSE`, `src/main.tsx`, `src/App.tsx` (placeholder), `src/vite-env.d.ts`, `src/test/setup.ts`, `src/App.test.tsx`
- Modify: `pnpm-lock.yaml` (generated)

- [ ] **Step 1: Check where issue #28 stands**

Run: `gh issue view 28 --json state,title` and `git log --oneline -5 -- packages/monitoring/LICENSE packages/monitoring/package.json`
Expected: #28 is fixed (PR #31 merged first, as the owner decided, spec Q1): `packages/monitoring` has a `LICENSE` file identical to the root one and `"license": "MIT"`; do exactly that here (Steps 2 and 3). If #28 somehow has not landed, still do both for this package and add a line to the PR body: "#28 is still open; this package already carries a LICENSE and a license field, and #28's sweep should include it."

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "agent-panel-template",
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
    "cyberui-2045": "^2.6.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.6.0",
    "happy-dom": "20.14.5",
    "typescript": "~5.8.3",
    "vite": "^7.0.4",
    "vitest": "^3.2.4"
  }
}
```

(These are monitoring's pins, without `recharts`. `typescript` is a dev dependency because `noInlineStyles.test.ts` imports it.)

- [ ] **Step 3: Copy the license**

Run (from the repo root): `cp LICENSE packages/agent-panel/LICENSE`
Expected: identical text to the root MIT license. Do not build a check here: `npm run check:license` (from #28) already keeps copies identical, and finds this package through `templates.ts`, so it starts covering it when PR B registers the template (Task 15).

- [ ] **Step 4: Copy the build config from monitoring**

Copy `packages/monitoring/tsconfig.json`, `vite.config.ts` and `.gitignore` unchanged (the `base: './'` comment explaining relative URLs stays). Write `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agent Control Panel — cyberui-2045</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Write the entry, a placeholder App and the test setup**

`src/vite-env.d.ts`: `/// <reference types="vite/client" />`.

```tsx
// src/main.tsx (the violet import is added in Task 2)
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

```tsx
// src/App.tsx (replaced in Task 13)
export default function App() {
  return <main>Agent Control Panel</main>;
}
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';

// cyberui-2045 checks for its stylesheet at import time by reading
// --color-primary from document.documentElement and warns "Stylesheet not
// detected" when it is missing. Tests do not load CSS, so provide the token
// inline (setup runs before any test module imports cyberui-2045).
document.documentElement.style.setProperty('--color-primary', '#ff005d');
```

```tsx
// src/App.test.tsx (replaced in Task 13)
import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

it('renders', () => {
  render(<App />);
  expect(screen.getByText('Agent Control Panel')).toBeInTheDocument();
});
```

- [ ] **Step 6: Install and verify**

Run (repo root): `pnpm install`
Expected: `pnpm-lock.yaml` gains a `packages/agent-panel` importer and nothing else changes in it. Then `pnpm --filter agent-panel-template run build` and `pnpm --filter agent-panel-template test`. Expected: type-check and build succeed, 1 test passes.

- [ ] **Step 7: Commit**

```bash
git checkout -b feat/agent-panel-template
git add packages/agent-panel pnpm-lock.yaml
git commit -m "feat(agent-panel): scaffold the standalone package" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 2: The violet theme and the tone classes

The one place the accent is set, and the one definition of what each tone looks like.

**Files:**
- Create: `src/theme/violet.css`, `src/theme/tones.ts`, `src/theme/tones.test.ts`, `src/App.css`, `src/noHexColors.test.ts`
- Modify: `src/main.tsx`

**Interfaces:**
- Produces: `Tone = 'default' | 'success' | 'warning' | 'error'`, `TONE_CLASS: Record<Tone, string>`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/theme/tones.test.ts (copied from monitoring, with the import changed)
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { TONE_CLASS } from './tones';

describe('TONE_CLASS', () => {
  it('has a rule in App.css for every tone class, so no tone renders without a colour', () => {
    const css = readFileSync(resolve(__dirname, '../App.css'), 'utf8');
    for (const className of Object.values(TONE_CLASS)) {
      expect(css, `App.css has no .${className} rule`).toMatch(new RegExp(`\\.${className}\\s*\\{`));
    }
  });
});
```

```ts
// src/noHexColors.test.ts
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
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/theme src/noHexColors.test.ts`
Expected: FAIL (cannot resolve `./tones`; no `App.css`).

- [ ] **Step 3: Write the theme and the tone map**

```css
/* src/theme/violet.css
 *
 * This template's accent. cyberui-2045 declares every colour as a custom
 * property (inside `@layer theme`) and its components read them, so changing
 * two values re-themes everything, including the opacity variants it builds
 * with color-mix(). An unlayered :root rule beats the library's layered one,
 * but keep the import AFTER 'cyberui-2045/styles.css' (see main.tsx) anyway.
 *
 * secondary and accent move together: secondary is the active/text colour,
 * accent is the rule under card titles and focus glows. Overriding only one
 * leaves a stray cyan or yellow. --color-primary (the magenta used by primary
 * buttons) is left alone on purpose: only the accent hue varies per template.
 *
 * Re-theme this template by changing these two values.
 */
:root {
  --color-secondary: #c084fc;
  --color-accent: #c084fc;
}
```

```ts
// src/theme/tones.ts
export type Tone = 'default' | 'success' | 'warning' | 'error';

// The CSS class that colours each tone (defined once, as `.tone-*` in App.css).
// A Record, not a template string like `tone-${tone}`, so adding a Tone without
// its class here is a compile error instead of text that silently has no
// colour. tones.test.ts checks that every class below has a rule in App.css.
export const TONE_CLASS: Record<Tone, string> = {
  default: 'tone-default',
  success: 'tone-success',
  warning: 'tone-warning',
  error: 'tone-error',
};
```

```css
/* src/App.css (grows in later tasks). Colours come only from tokens. */

/* ---- Tones: the one definition of what each tone looks like ----
   Components add `tone-<name>` through TONE_CLASS instead of mapping a tone to
   a colour in TypeScript or an inline style. Anything that should take the
   tone colour (text, or a dot drawn with `background: currentColor`) inherits it. */

.tone-default {
  color: var(--color-default);
}

.tone-success {
  color: var(--color-success);
}

.tone-warning {
  color: var(--color-warning);
}

.tone-error {
  color: var(--color-error);
}
```

In `src/main.tsx`, add `import './theme/violet.css';` directly after the `cyberui-2045/styles.css` import and `import './App.css';` after it.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/theme src/noHexColors.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/theme src/noHexColors.test.ts src/App.css src/main.tsx
git commit -m "feat(agent-panel): violet accent override and the shared tone classes" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 3: Hash routing

**Files:**
- Create: `src/router/useHashRoute.ts`, `src/router/useHashRoute.test.ts`

**Interfaces:**
- Produces: `ROUTES`, `Route`, `useHashRoute(): Route`.

- [ ] **Step 1: Copy monitoring's test and change the routes**

Copy `packages/monitoring/src/router/useHashRoute.test.ts`. Replace `dashboard` with `console`, `endpoints` with `tasks`, and the other route with `logs`; keep every test (default, known hash, unknown hash falls back, updates on `hashchange`, cleans up its listener).

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/router`
Expected: FAIL, cannot resolve `./useHashRoute`.

- [ ] **Step 3: Copy the implementation**

Copy `packages/monitoring/src/router/useHashRoute.ts` and change only the tuple and the default (keep its comment on why `Route` is derived):

```ts
/** The single source of truth for routes; Route is derived from it so the two can't drift. */
export const ROUTES = ['console', 'tasks', 'logs'] as const;
export type Route = (typeof ROUTES)[number];

const DEFAULT_ROUTE: Route = 'console';
```

- [ ] **Step 4: Run, then commit**

Run: `npx vitest run src/router` (expected PASS).

```bash
git add src/router
git commit -m "feat(agent-panel): hash routing from one ROUTES tuple" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: The data model, the limits and the scripted scenarios

The shapes everything else uses, every threshold in one module, and the agent's whole "intelligence" as data, with the two invariants that keep a run from hanging enforced by a test.

**Files:**
- Create: `src/data/types.ts`, `src/data/limits.ts`, `src/data/limits.test.ts`, `src/data/scenarios.ts`, `src/data/scenarios.test.ts`

**Interfaces:**
- Produces: the types below; `limits.ts` constants plus `contextPct`, `contextLevel`, `ContextLevel`; `SCENARIOS`, `FALLBACK`, `matchScenario(text, scenarios?)`, `SUGGESTED_PROMPTS`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/data/limits.test.ts
import { describe, it, expect } from 'vitest';
import { CONTEXT_FULL_PCT, CONTEXT_HIGH_PCT, CONTEXT_WINDOW_TOKENS, contextLevel, contextPct } from './limits';

describe('context window', () => {
  const at = (pct: number) => Math.ceil((CONTEXT_WINDOW_TOKENS * pct) / 100);

  it('turns percentages into levels at the documented thresholds', () => {
    expect(contextLevel(at(CONTEXT_HIGH_PCT) - 400)).toBe('ok');
    expect(contextLevel(at(CONTEXT_HIGH_PCT))).toBe('high');
    expect(contextLevel(at(CONTEXT_FULL_PCT) - 400)).toBe('high');
    expect(contextLevel(at(CONTEXT_FULL_PCT))).toBe('full');
  });

  it('never reports more than 100%', () => {
    expect(contextPct(CONTEXT_WINDOW_TOKENS * 3)).toBe(100);
  });
});
```

```ts
// src/data/scenarios.test.ts
import { describe, it, expect } from 'vitest';
import { FALLBACK, SCENARIOS, SUGGESTED_PROMPTS, matchScenario } from './scenarios';
import type { Step } from './types';

// Every way through a scenario: each approval forks into its approve and
// reject branches. A run that ends without a `reply` would leave the agent
// stuck "working" forever, which is the failure these tests exist to prevent.
function paths(steps: Step[]): Step[][] {
  const at = steps.findIndex((step) => step.type === 'approval');
  if (at === -1) return [steps];
  const approval = steps[at]!;
  if (approval.type !== 'approval') return [steps];
  const head = steps.slice(0, at);
  const tail = steps.slice(at + 1);
  return [...paths(approval.approve), ...paths(approval.reject)].map((branch) => [...head, ...branch, ...tail]);
}

describe('scenarios', () => {
  it('every path through every scenario ends in a reply', () => {
    for (const scenario of [...SCENARIOS, FALLBACK]) {
      for (const path of paths(scenario.steps)) {
        expect(path[path.length - 1]?.type, `${scenario.id} must end in a reply`).toBe('reply');
      }
    }
  });

  it('shares no keyword between scenarios, so matching is unambiguous', () => {
    const seen = new Map<string, string>();
    for (const scenario of SCENARIOS) {
      for (const keyword of scenario.keywords) {
        expect(seen.get(keyword), `"${keyword}" is in ${scenario.id} and ${seen.get(keyword)}`).toBeUndefined();
        seen.set(keyword, scenario.id);
      }
    }
  });

  it('keywords are lower case, because matching lower-cases the message', () => {
    for (const scenario of SCENARIOS) {
      for (const keyword of scenario.keywords) expect(keyword).toBe(keyword.toLowerCase());
    }
  });

  it('gives the fallback no keywords and matches it only when nothing else does', () => {
    expect(FALLBACK.keywords).toEqual([]);
    expect(matchScenario('hello there')).toBe(FALLBACK);
  });

  it('matches case-insensitively', () => {
    expect(matchScenario('PLEASE REFUND IT').id).toBe('refund');
  });

  it('each suggested prompt selects a real scenario, in order', () => {
    expect(SUGGESTED_PROMPTS.map((prompt) => matchScenario(prompt.text).id)).toEqual(['refund', 'summary', 'release']);
  });

  it('every approval offers both a branch to approve and one to reject', () => {
    for (const scenario of SCENARIOS) {
      for (const step of scenario.steps) {
        if (step.type === 'approval') {
          expect(step.approve.length).toBeGreaterThan(0);
          expect(step.reject.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/data`
Expected: FAIL, cannot resolve `./limits`, `./scenarios`.

- [ ] **Step 3: Write the model, the limits and the scenarios**

```ts
// src/data/types.ts
export type AgentStatus = 'idle' | 'thinking' | 'working' | 'waiting' | 'paused';
export type Priority = 'low' | 'normal' | 'high';
export type TaskStatus = 'queued' | 'running' | 'done' | 'failed' | 'cancelled';
export type TraceKind = 'thought' | 'tool' | 'observation' | 'approval' | 'decision';
export type TraceOutcome = 'ok' | 'error' | 'pending' | 'waiting';

export interface Message {
  id: string;
  role: 'user' | 'agent';
  /** The whole message. Agent messages stream in: only the first `revealed` characters are shown. */
  text: string;
  revealed: number;
  /** The run that produced an agent message (selecting it shows that run's trace). */
  runId?: string;
  at: number;
}

export interface TraceStep {
  id: string;
  runId: string;
  kind: TraceKind;
  title: string;
  detail?: string;
  outcome: TraceOutcome;
  at: number;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  /** Progress is derived (see taskProgress), never stored twice. */
  ticksDone: number;
  ticksTotal: number;
  runId?: string;
  /** Why a failed task failed. */
  error?: string;
  createdAt: number;
}

/** One step of a scripted scenario. A scenario is plain data; the engine in simulation.ts runs it. */
export type Step =
  | { type: 'think'; title: string; detail: string; ticks: number }
  | {
      type: 'tool';
      tool: string;
      input: string;
      output: string;
      ticks: number;
      /** If set, the first attempt fails with this text and the engine retries once. */
      failFirst?: string;
    }
  | { type: 'task'; title: string; ticks: number; priority?: Priority }
  | { type: 'approval'; prompt: string; approve: Step[]; reject: Step[] }
  | { type: 'reply'; text: string };

export interface Scenario {
  id: string;
  /** Lower-case words that select this scenario when the user's message contains one. */
  keywords: string[];
  steps: Step[];
}

export interface Approval {
  id: string;
  prompt: string;
  approve: Step[];
  reject: Step[];
  /** The trace step that shows this approval as waiting. */
  traceId: string;
}

/** The step a run is working on right now. */
export interface Current {
  step: Step;
  ticksLeft: number;
  traceId: string | null;
  taskId: string | null;
  /** The agent message a `reply` step is streaming into. */
  messageId: string | null;
}

export interface Run {
  id: string;
  scenarioId: string;
  remaining: Step[];
  current: Current | null;
  approval: Approval | null;
  ended: 'done' | 'cancelled' | null;
}

export interface AgentState {
  paused: boolean;
  messages: Message[];
  trace: TraceStep[];
  tasks: Task[];
  runs: Run[];
  /** Simulated, not measured: grows as the conversation does. */
  contextTokens: number;
  toolCalls: number;
  startedAt: number;
  /** Counter behind every id, so the engine needs no randomness for them. */
  nextId: number;
}
```

```ts
// src/data/limits.ts
// Every number that decides how the simulation behaves or when the UI warns.
// The engine, the hook and the Live status panel all import from here, so
// "how full is too full" is answered in exactly one place.

export const TICK_MS = 250;
/** Streaming speed: characters of an agent reply revealed per tick (about 24 per second). */
export const CHARS_PER_TICK = 6;
/** How many tasks the worker pool runs at once. */
export const TASK_CONCURRENCY = 3;

// Caps, so a tab left open does not grow without bound.
export const MAX_MESSAGES = 200;
export const MAX_TRACE_STEPS = 300;
export const MAX_FINISHED_TASKS = 20;
export const MAX_RUNS = 50;

export const CONTEXT_WINDOW_TOKENS = 32000;
export const CONTEXT_HIGH_PCT = 70;
export const CONTEXT_FULL_PCT = 90;

/** Tokens the simulation adds to the context for each kind of thing. Made-up numbers. */
export const TOKENS = { user: 90, think: 380, tool: 520, reply: 260 } as const;

export type ContextLevel = 'ok' | 'high' | 'full';

export function contextPct(tokens: number): number {
  return Math.min(100, Math.round((tokens / CONTEXT_WINDOW_TOKENS) * 100));
}

export function contextLevel(tokens: number): ContextLevel {
  const pct = contextPct(tokens);
  if (pct >= CONTEXT_FULL_PCT) return 'full';
  if (pct >= CONTEXT_HIGH_PCT) return 'high';
  return 'ok';
}
```

```ts
// src/data/scenarios.ts
import type { Scenario } from './types';

// The agent's whole "intelligence": three scripted scenarios and a fallback.
// Nothing here calls a model. To teach the demo something new, add a scenario;
// the engine (simulation.ts) does not change. Rules scenarios.test.ts enforces:
// every path ends in a `reply` (so a run can never hang), and no keyword is
// shared between scenarios (so matching is unambiguous).

export const REFUND: Scenario = {
  id: 'refund',
  keywords: ['refund', 'return', 'order'],
  steps: [
    { type: 'think', title: 'Plan the refund', detail: 'Find the order, check the refund policy, then ask a person before moving money.', ticks: 4 },
    { type: 'tool', tool: 'orders.lookup', input: 'order #4821', output: 'Order #4821, $42.00, delivered 6 days ago, within the 30-day window.', ticks: 4 },
    {
      type: 'approval',
      prompt: 'Refund $42.00 to the customer for order #4821?',
      approve: [
        { type: 'tool', tool: 'payments.refund', input: 'order #4821, $42.00', output: 'Refund queued.', ticks: 3 },
        { type: 'task', title: 'Process refund #4821', ticks: 10, priority: 'high' },
        { type: 'reply', text: 'Done. The $42.00 refund for order #4821 is processed and the customer will see it in 3 to 5 days.' },
      ],
      reject: [
        { type: 'reply', text: "Understood, I've left order #4821 untouched. Tell me if you want a different outcome, such as store credit." },
      ],
    },
  ],
};

export const SUMMARY: Scenario = {
  id: 'summary',
  keywords: ['summarise', 'summarize', 'summary', 'ticket', 'support'],
  steps: [
    { type: 'think', title: 'Scope the summary', detail: 'Last 7 days of support tickets, grouped by theme.', ticks: 3 },
    { type: 'tool', tool: 'helpdesk.search', input: 'created:7d', output: '38 tickets found.', ticks: 4 },
    { type: 'task', title: 'Summarise 38 tickets', ticks: 12, priority: 'high' },
    {
      type: 'reply',
      text: 'Of 38 tickets this week, 15 were about login problems, 11 about billing questions and 7 about a slow export. The other 5 were one-offs. Login problems are up on last week.',
    },
  ],
};

export const RELEASE: Scenario = {
  id: 'release',
  keywords: ['release', 'deploy', 'changelog', 'notes'],
  steps: [
    { type: 'think', title: 'Plan the release notes', detail: 'Read the merged changes since the last tag and group them for customers.', ticks: 3 },
    {
      type: 'tool',
      tool: 'git.log',
      input: 'v2.3.0..HEAD',
      output: '14 merged changes since v2.3.0.',
      ticks: 4,
      failFirst: 'Rate limited by the git host. Retrying.',
    },
    { type: 'task', title: 'Draft release notes v2.4', ticks: 8, priority: 'high' },
    {
      type: 'approval',
      prompt: 'Post the v2.4 release notes to #releases?',
      approve: [
        { type: 'tool', tool: 'chat.post', input: '#releases', output: 'Posted.', ticks: 2 },
        { type: 'reply', text: 'Posted the v2.4 release notes to #releases: 6 features, 5 fixes and 3 internal changes.' },
      ],
      reject: [{ type: 'reply', text: "No problem, the draft is saved and I haven't posted anything." }],
    },
  ],
};

export const FALLBACK: Scenario = {
  id: 'fallback',
  keywords: [],
  steps: [
    { type: 'think', title: 'Look for something I can do', detail: 'This is a scripted demo, so only three requests are wired up.', ticks: 2 },
    {
      type: 'reply',
      text: 'This is a scripted demo, so I only know three things: issuing a refund, summarising support tickets and drafting release notes. Try one of the suggested prompts.',
    },
  ],
};

export const SCENARIOS: Scenario[] = [REFUND, SUMMARY, RELEASE];

/** The first scenario with a keyword in the message, else FALLBACK. */
export function matchScenario(text: string, scenarios: Scenario[] = SCENARIOS): Scenario {
  const lower = text.toLowerCase();
  return scenarios.find((scenario) => scenario.keywords.some((keyword) => lower.includes(keyword))) ?? FALLBACK;
}

/** The prompts offered as one-click chips; each matches the scenario named. */
export const SUGGESTED_PROMPTS: { label: string; text: string }[] = [
  { label: 'Refund an order', text: 'Please refund order #4821, the customer says it arrived damaged.' },
  { label: 'Summarise support tickets', text: 'Summarise this week’s support tickets.' },
  { label: 'Draft release notes', text: 'Draft the release notes for v2.4 and post them.' },
];
```

Add this comment above `AgentState` in `types.ts` (forker-facing): *"The whole state of the panel as one plain, serialisable object. Two things you might expect to find here are deliberately not stored: the agent's status (`deriveStatus` computes it from the active run, so it cannot disagree with what the agent is doing) and a task's progress percentage (`taskProgress` derives it from `ticksDone / ticksTotal`). To use a real backend, produce this shape from your server's events and the screens do not change."*

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/data` (expected PASS) and `npx tsc --noEmit` (expected no errors).

- [ ] **Step 5: Commit**

```bash
git add src/data
git commit -m "feat(agent-panel): data model, limits and scripted scenarios" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: The engine, part one: state, sending, ticking

`createInitialState`, `sendMessage`, `tick`, `deriveStatus`, `taskProgress`, `activeRun`. Enough to run a scenario that has no approval.

**Files:**
- Create: `src/data/simulation.ts`, `src/data/simulation.test.ts`

**Interfaces:**
- Consumes: Task 4's types, limits and `matchScenario`.
- Produces: `createInitialState(now)`, `sendMessage(state, text, now, scenarios?)`, `tick(state, now, charsPerTick?)`, `deriveStatus(state)`, `taskProgress(task)`, `activeRun(state)`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/data/simulation.test.ts
import { describe, it, expect } from 'vitest';
import { activeRun, createInitialState, deriveStatus, sendMessage, taskProgress, tick } from './simulation';
import { CONTEXT_WINDOW_TOKENS, TASK_CONCURRENCY } from './limits';
import type { AgentState, AgentStatus } from './types';

const NOW = 1_000_000;
const fresh = () => createInitialState(NOW);

/**
 * Ticks (revealing replies at once) until the active run ends. `decide` answers
 * an approval when one is pending. Throws if the run never ends, which is how a
 * hung scenario shows up (Review Focus #1).
 */
function settle(state: AgentState, decide?: (s: AgentState) => AgentState, limit = 400): AgentState {
  let s = state;
  for (let i = 0; i < limit; i++) {
    if (!activeRun(s)) return s;
    if (decide && activeRun(s)?.approval) s = decide(s);
    s = tick(s, NOW + i, Infinity);
  }
  throw new Error('the run did not finish');
}

describe('createInitialState', () => {
  it('starts with one finished exchange and a trace for it', () => {
    const s = fresh();
    expect(s.messages.map((m) => m.role)).toEqual(['user', 'agent']);
    expect(s.trace.every((t) => t.runId === 'seed-run')).toBe(true);
    expect(activeRun(s)).toBeUndefined();
  });

  it('seeds one task in each of four states, so every panel and Retry have something to show on first paint', () => {
    expect(fresh().tasks.map((t) => t.status).sort()).toEqual(['done', 'failed', 'queued', 'running']);
  });
});

describe('sendMessage', () => {
  it('adds the message and starts a run', () => {
    const s = sendMessage(fresh(), '  hello there  ', NOW);
    expect(s.messages.at(-1)).toMatchObject({ role: 'user', text: 'hello there' });
    expect(activeRun(s)).toBeDefined();
  });

  it('is ignored when blank, mid-run or when the context is full, returning the same state', () => {
    const s = fresh();
    expect(sendMessage(s, '   ', NOW)).toBe(s);
    const running = sendMessage(s, 'hello', NOW);
    expect(sendMessage(running, 'again', NOW)).toBe(running);
    const full = { ...s, contextTokens: CONTEXT_WINDOW_TOKENS };
    expect(sendMessage(full, 'hello', NOW)).toBe(full);
  });
});

describe('tick', () => {
  it('runs a scenario with no approval to the end: trace, task, and a fully shown reply', () => {
    const s = settle(sendMessage(fresh(), 'Summarise this week’s support tickets.', NOW));
    const run = s.runs.at(-1)!;
    expect(run.ended).toBe('done');
    const kinds = s.trace.filter((t) => t.runId === run.id).map((t) => t.kind);
    expect(kinds).toEqual(['thought', 'tool', 'observation', 'tool']);
    expect(s.trace.filter((t) => t.runId === run.id).every((t) => t.outcome === 'ok')).toBe(true);
    expect(s.tasks.find((t) => t.runId === run.id)?.status).toBe('done');
    const reply = s.messages.at(-1)!;
    expect(reply.role).toBe('agent');
    expect(reply.revealed).toBe(reply.text.length);
  });

  it('streams a reply a few characters per tick unless told to show it at once', () => {
    let s = sendMessage(fresh(), 'hello there', NOW);
    for (let i = 0; i < 12; i++) s = tick(s, NOW + i);
    const reply = s.messages.at(-1)!;
    expect(reply.role).toBe('agent');
    expect(reply.revealed).toBeGreaterThan(0);
    expect(reply.revealed).toBeLessThan(reply.text.length);
  });

  it('answers a message it has no script for honestly, without hanging', () => {
    const s = settle(sendMessage(fresh(), 'what is the weather', NOW));
    expect(s.messages.at(-1)!.text).toMatch(/scripted demo/i);
  });

  it('returns the very same object when nothing changed, so React skips the render', () => {
    let s = fresh();
    // Drain the seeded background tasks first; the seed has one running and one queued.
    for (let i = 0; i < 200; i++) s = tick(s, NOW + i);
    expect(s.tasks.some((t) => t.status === 'running' || t.status === 'queued')).toBe(false);
    expect(tick(s, NOW + 999)).toBe(s);
  });

  it('starts queued tasks by priority, up to the pool size, and leaves the rest queued', () => {
    const base = fresh();
    const make = (id: string, priority: 'low' | 'normal' | 'high') => ({
      id, title: id, status: 'queued' as const, priority, ticksDone: 0, ticksTotal: 5, createdAt: NOW,
    });
    // Four queued tasks and nothing running: the pool takes the three most urgent.
    const s = tick({ ...base, tasks: [make('a', 'low'), make('b', 'high'), make('c', 'high'), make('d', 'normal')] }, NOW);
    expect(s.tasks.filter((t) => t.status === 'running')).toHaveLength(TASK_CONCURRENCY);
    expect(s.tasks.filter((t) => t.status === 'queued').map((t) => t.id)).toEqual(['a']);
  });

  it('moves a task to done after its ticks', () => {
    let s = fresh();
    const running = s.tasks.find((t) => t.status === 'running')!;
    for (let i = 0; i < running.ticksTotal; i++) s = tick(s, NOW + i);
    expect(s.tasks.find((t) => t.id === running.id)?.status).toBe('done');
  });
});

describe('deriveStatus', () => {
  it('is idle with no run, then thinking, then working, and never blinks back to thinking between steps', () => {
    let s = fresh();
    expect(deriveStatus(s)).toBe('idle');
    s = sendMessage(s, 'summarise tickets', NOW);
    const seen: AgentStatus[] = [deriveStatus(s)];
    for (let i = 0; i < 200 && activeRun(s); i++) {
      s = tick(s, NOW + i, Infinity);
      seen.push(deriveStatus(s));
    }
    expect(seen[0]).toBe('thinking');
    expect(seen).toContain('working');
    expect(seen.lastIndexOf('thinking')).toBeLessThan(seen.indexOf('working'));
  });
});

describe('taskProgress', () => {
  it('is derived from ticks, and 100 for a task with no ticks to do', () => {
    const s = fresh();
    expect(taskProgress({ ...s.tasks[0]!, ticksDone: 20, ticksTotal: 80 })).toBe(25);
    expect(taskProgress({ ...s.tasks[0]!, ticksDone: 0, ticksTotal: 0 })).toBe(100);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/data/simulation.test.ts`
Expected: FAIL, cannot resolve `./simulation`.

- [ ] **Step 3: Write the engine (part one)**

```ts
// src/data/simulation.ts
import {
  CHARS_PER_TICK,
  MAX_FINISHED_TASKS,
  MAX_MESSAGES,
  MAX_RUNS,
  MAX_TRACE_STEPS,
  TASK_CONCURRENCY,
  TOKENS,
  contextLevel,
} from './limits';
import { matchScenario } from './scenarios';
import type {
  AgentState,
  AgentStatus,
  Run,
  Scenario,
  Step,
  Task,
  TraceKind,
  TraceOutcome,
  TraceStep,
} from './types';

// A pure, timer-free, random-free engine. Every function takes a state and
// returns the next one; none reads a clock or Math.random, so tests need no
// seeding and the hook (useSimulatedAgent.ts) is the only thing with a timer.
// Each returns the SAME object when nothing changed, so React skips the render
// on an idle tick.
//
// The model: one scripted Run at a time works through a Scenario's steps,
// writing trace steps, creating Tasks and streaming a reply. Tasks run in a
// small worker pool (TASK_CONCURRENCY). An `approval` step parks the run until
// resolveApproval is called.

const PRIORITY_RANK = { high: 0, normal: 1, low: 2 } as const;

/** The run that has not ended, if any. */
export function activeRun(state: AgentState): Run | undefined {
  return state.runs.find((run) => run.ended === null);
}

export function taskProgress(task: Task): number {
  return task.ticksTotal === 0 ? 100 : Math.round((task.ticksDone / task.ticksTotal) * 100);
}

export function deriveStatus(state: AgentState): AgentStatus {
  if (state.paused) return 'paused';
  const run = activeRun(state);
  if (!run) return 'idle';
  if (run.approval) return 'waiting';
  const type = run.current?.step.type;
  return type === undefined || type === 'think' ? 'thinking' : 'working';
}

export function createInitialState(now: number): AgentState {
  const min = 60_000;
  return {
    paused: false,
    startedAt: now,
    contextTokens: 4800,
    toolCalls: 3,
    nextId: 1,
    messages: [
      { id: 'seed-m1', role: 'user', text: "What's on the queue today?", revealed: 26, at: now - 9 * min },
      {
        id: 'seed-m2',
        role: 'agent',
        text: 'Four items: an index refresh is running, a weekly digest is queued, last night’s CRM sync failed and needs a retry, and the chat archive finished.',
        revealed: 999,
        runId: 'seed-run',
        at: now - 9 * min + 4000,
      },
    ],
    trace: [
      { id: 'seed-s1', runId: 'seed-run', kind: 'thought', title: 'Check the queue', detail: 'List every task and group them by state.', outcome: 'ok', at: now - 9 * min + 1000 },
      { id: 'seed-s2', runId: 'seed-run', kind: 'tool', title: 'tasks.list()', outcome: 'ok', at: now - 9 * min + 2000 },
      { id: 'seed-s3', runId: 'seed-run', kind: 'observation', title: '4 tasks: 1 running, 1 queued, 1 failed, 1 done.', outcome: 'ok', at: now - 9 * min + 3000 },
    ],
    tasks: [
      { id: 'seed-t1', title: 'Index refresh: help-center articles', status: 'running', priority: 'low', ticksDone: 20, ticksTotal: 80, createdAt: now - 20 * min },
      { id: 'seed-t2', title: 'Weekly digest draft', status: 'queued', priority: 'normal', ticksDone: 0, ticksTotal: 30, createdAt: now - 15 * min },
      { id: 'seed-t3', title: 'Sync CRM contacts', status: 'failed', priority: 'normal', ticksDone: 14, ticksTotal: 40, error: 'Timed out after 30 s', createdAt: now - 3 * 60 * min },
      { id: 'seed-t4', title: 'Archive resolved chats', status: 'done', priority: 'low', ticksDone: 24, ticksTotal: 24, createdAt: now - 4 * 60 * min },
    ],
    runs: [{ id: 'seed-run', scenarioId: 'seed', remaining: [], current: null, approval: null, ended: 'done' }],
  };
}

// ---- Commands (user actions) ------------------------------------------------

/**
 * Starts a run for the message. Ignored (state returned unchanged) when the
 * text is blank, a run is already going, the agent is paused, or the context
 * is full: the UI disables the composer in those cases and says why.
 */
export function sendMessage(state: AgentState, text: string, now: number, scenarios?: Scenario[]): AgentState {
  const body = text.trim();
  if (!body || activeRun(state) || state.paused || contextLevel(state.contextTokens) === 'full') return state;
  const s = draft(state);
  const scenario = matchScenario(body, scenarios);
  const runId = newId(s, 'r');
  s.messages.push({ id: newId(s, 'm'), role: 'user', text: body, revealed: body.length, at: now });
  s.contextTokens += TOKENS.user;
  s.runs.push({ id: runId, scenarioId: scenario.id, remaining: [...scenario.steps], current: null, approval: null, ended: null });
  return trim(s);
}

// ---- Time -------------------------------------------------------------------

/**
 * Advances the simulation by one tick. `charsPerTick` is how much of a reply
 * to reveal; pass Infinity to show replies at once (reduced motion).
 */
export function tick(state: AgentState, now: number, charsPerTick: number = CHARS_PER_TICK): AgentState {
  if (state.paused) return state;
  const s = draft(state);
  const tasksMoved = advanceTasks(s);
  const run = activeRun(s);
  const runMoved = run ? advanceRun(s, run, now, charsPerTick) : false;
  return tasksMoved || runMoved ? trim(s) : state;
}

function advanceTasks(s: AgentState): boolean {
  let moved = false;
  s.tasks = s.tasks.map((task) => {
    if (task.status !== 'running') return task;
    moved = true;
    const ticksDone = task.ticksDone + 1;
    return ticksDone >= task.ticksTotal ? { ...task, ticksDone: task.ticksTotal, status: 'done' } : { ...task, ticksDone };
  });
  const free = TASK_CONCURRENCY - s.tasks.filter((t) => t.status === 'running').length;
  if (free > 0) {
    const next = s.tasks
      .filter((t) => t.status === 'queued')
      .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.createdAt - b.createdAt)
      .slice(0, free)
      .map((t) => t.id);
    if (next.length > 0) {
      moved = true;
      s.tasks = s.tasks.map((t) => (next.includes(t.id) ? { ...t, status: 'running' } : t));
    }
  }
  return moved;
}

/** Returns whether anything changed. A run parked on an approval does not move. */
function advanceRun(s: AgentState, run: Run, now: number, charsPerTick: number): boolean {
  if (run.approval) return false;
  let next = run.current ? advanceCurrent(s, run, now, charsPerTick) : beginNext(s, run, now);
  // A step that just finished hands over to the next one in the same tick, so
  // the status does not blink back to "thinking" between steps.
  if (next !== run && next.current === null && next.approval === null && next.ended === null) {
    next = beginNext(s, next, now);
  }
  if (next === run) return false;
  replaceRun(s, next);
  return true;
}

function beginNext(s: AgentState, run: Run, now: number): Run {
  const [step, ...rest] = run.remaining;
  if (!step) return { ...run, ended: 'done' };
  const base = { ...run, remaining: rest };
  const current = (traceId: string | null, ticksLeft: number, extra: { taskId?: string; messageId?: string } = {}) => ({
    step,
    ticksLeft,
    traceId,
    taskId: extra.taskId ?? null,
    messageId: extra.messageId ?? null,
  });
  switch (step.type) {
    case 'think': {
      s.contextTokens += TOKENS.think;
      return { ...base, current: current(addTrace(s, run.id, 'thought', step.title, step.detail, 'pending', now), step.ticks) };
    }
    case 'tool': {
      s.contextTokens += TOKENS.tool;
      s.toolCalls += 1;
      return { ...base, current: current(addTrace(s, run.id, 'tool', `${step.tool}(${step.input})`, undefined, 'pending', now), step.ticks) };
    }
    case 'task': {
      const taskId = newId(s, 't');
      s.tasks.push({ id: taskId, title: step.title, status: 'queued', priority: step.priority ?? 'normal', ticksDone: 0, ticksTotal: step.ticks, runId: run.id, createdAt: now });
      return { ...base, current: current(addTrace(s, run.id, 'tool', `Task: ${step.title}`, undefined, 'pending', now), 0, { taskId }) };
    }
    case 'approval': {
      const traceId = addTrace(s, run.id, 'approval', 'Waiting for your approval', step.prompt, 'waiting', now);
      return { ...base, current: null, approval: { id: newId(s, 'a'), prompt: step.prompt, approve: step.approve, reject: step.reject, traceId } };
    }
    case 'reply': {
      s.contextTokens += TOKENS.reply;
      const messageId = newId(s, 'm');
      s.messages.push({ id: messageId, role: 'agent', text: step.text, revealed: 0, runId: run.id, at: now });
      return { ...base, current: current(null, 0, { messageId }) };
    }
  }
}

function advanceCurrent(s: AgentState, run: Run, now: number, charsPerTick: number): Run {
  const cur = run.current!;
  const { step } = cur;
  const finish = (patch: Partial<Run> = {}): Run => ({ ...run, current: null, ...patch });
  switch (step.type) {
    case 'think':
    case 'tool': {
      if (cur.ticksLeft > 1) return { ...run, current: { ...cur, ticksLeft: cur.ticksLeft - 1 } };
      if (step.type === 'tool' && step.failFirst) {
        // First attempt fails, as scripted; the retry is the same step without the failure.
        const { failFirst, ...retry } = step;
        setOutcome(s, cur.traceId, 'error');
        addTrace(s, run.id, 'observation', failFirst, undefined, 'error', now);
        return finish({ remaining: [retry, ...run.remaining] });
      }
      setOutcome(s, cur.traceId, 'ok');
      if (step.type === 'tool') addTrace(s, run.id, 'observation', step.output, undefined, 'ok', now);
      return finish();
    }
    case 'task': {
      const task = s.tasks.find((t) => t.id === cur.taskId);
      if (task?.status === 'queued' || task?.status === 'running') return run;
      if (task?.status === 'done') {
        setOutcome(s, cur.traceId, 'ok');
        return finish();
      }
      setOutcome(s, cur.traceId, 'error');
      addTrace(s, run.id, 'decision', 'The task did not finish, so I am stopping here', undefined, 'error', now);
      return finish({ remaining: [{ type: 'reply', text: 'That task was stopped before it finished, so I did not go any further.' }] });
    }
    case 'reply': {
      const message = s.messages.find((m) => m.id === cur.messageId);
      if (!message) return finish({ ended: 'done' });
      const revealed = Math.min(message.text.length, message.revealed + charsPerTick);
      s.messages = s.messages.map((m) => (m.id === message.id ? { ...m, revealed } : m));
      return revealed >= message.text.length ? finish({ ended: 'done' }) : { ...run };
    }
    case 'approval':
      return run; // never current: beginNext parks the run on `approval` instead
  }
}

// ---- Helpers ----------------------------------------------------------------

/** A copy whose arrays this function may push to; the objects inside are never mutated. */
function draft(state: AgentState): AgentState {
  return { ...state, messages: [...state.messages], trace: [...state.trace], tasks: [...state.tasks], runs: [...state.runs] };
}

function newId(s: AgentState, prefix: string): string {
  const id = `${prefix}${s.nextId}`;
  s.nextId += 1;
  return id;
}

function addTrace(s: AgentState, runId: string, kind: TraceKind, title: string, detail: string | undefined, outcome: TraceOutcome, at: number): string {
  const id = newId(s, 's');
  const step: TraceStep = { id, runId, kind, title, outcome, at };
  if (detail !== undefined) step.detail = detail;
  s.trace.push(step);
  return id;
}

function setOutcome(s: AgentState, traceId: string | null, outcome: TraceOutcome): void {
  if (traceId) s.trace = s.trace.map((t) => (t.id === traceId ? { ...t, outcome } : t));
}

function replaceRun(s: AgentState, run: Run): void {
  s.runs = s.runs.map((r) => (r.id === run.id ? run : r));
}

/** Keeps every list bounded, so a tab left open does not grow forever. */
function trim(s: AgentState): AgentState {
  const finished = s.tasks.filter((t) => t.status === 'done' || t.status === 'failed' || t.status === 'cancelled');
  const drop = new Set(finished.slice(0, Math.max(0, finished.length - MAX_FINISHED_TASKS)).map((t) => t.id));
  return {
    ...s,
    messages: s.messages.slice(-MAX_MESSAGES),
    trace: s.trace.slice(-MAX_TRACE_STEPS),
    runs: s.runs.slice(-MAX_RUNS),
    tasks: drop.size > 0 ? s.tasks.filter((t) => !drop.has(t.id)) : s.tasks,
  };
}
```

Task 6 adds `resolveApproval`, `cancelRun`, `cancelTask`, `retryTask` and `setPaused` to the same file, below `sendMessage`. Until then `tick` simply never meets an approval in these tests.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/data/simulation.test.ts` (expected PASS) and `npx tsc --noEmit` (expected clean).

- [ ] **Step 5: Commit**

```bash
git add src/data/simulation.ts src/data/simulation.test.ts
git commit -m "feat(agent-panel): pure simulation engine: sending, ticking, tasks, status" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 6: The engine, part two: approvals, steering and caps

**Files:**
- Modify: `src/data/simulation.ts`, `src/data/simulation.test.ts`

**Interfaces:**
- Produces: `resolveApproval(state, approvalId, approved, now)`, `cancelRun(state, now)`, `cancelTask(state, taskId)`, `retryTask(state, taskId)`, `setPaused(state, paused)`.

- [ ] **Step 1: Write the failing tests (append to `simulation.test.ts`)**

```ts
import { cancelRun, cancelTask, resolveApproval, retryTask, setPaused } from './simulation';
import { MAX_FINISHED_TASKS, MAX_MESSAGES, MAX_RUNS, MAX_TRACE_STEPS } from './limits';

const approve = (s: AgentState) => resolveApproval(s, activeRun(s)!.approval!.id, true, NOW);
const reject = (s: AgentState) => resolveApproval(s, activeRun(s)!.approval!.id, false, NOW);

/** Ticks until the run parks on its approval. */
function untilApproval(state: AgentState): AgentState {
  let s = state;
  for (let i = 0; i < 200 && !activeRun(s)?.approval; i++) s = tick(s, NOW + i, Infinity);
  return s;
}

describe('approvals', () => {
  it('parks the run, waits, and takes the approve branch: refund processed', () => {
    const waiting = untilApproval(sendMessage(fresh(), 'refund order #4821', NOW));
    expect(deriveStatus(waiting)).toBe('waiting');
    expect(waiting.trace.at(-1)).toMatchObject({ kind: 'approval', outcome: 'waiting' });
    // The run does not move while it waits, however many ticks pass (background tasks still do).
    const later = tick(tick(waiting, NOW + 500, Infinity), NOW + 501, Infinity);
    expect(deriveStatus(later)).toBe('waiting');
    expect(later.trace).toHaveLength(waiting.trace.length);
    expect(later.messages).toHaveLength(waiting.messages.length);
    const done = settle(approve(waiting));
    expect(done.messages.at(-1)!.text).toMatch(/refund .* is processed/i);
    expect(done.trace.some((t) => t.kind === 'decision' && t.title === 'Approved by you')).toBe(true);
    expect(done.tasks.some((t) => t.title === 'Process refund #4821' && t.status === 'done')).toBe(true);
  });

  it('takes the reject branch: nothing is processed', () => {
    const done = settle(reject(untilApproval(sendMessage(fresh(), 'refund order #4821', NOW))));
    expect(done.messages.at(-1)!.text).toMatch(/left order #4821 untouched/i);
    expect(done.tasks.some((t) => t.title === 'Process refund #4821')).toBe(false);
  });

  it('shows a failed first attempt, then the retry succeeding (release notes)', () => {
    const done = settle(approve(untilApproval(sendMessage(fresh(), 'draft the release notes', NOW))));
    const run = done.runs.at(-1)!;
    const observations = done.trace.filter((t) => t.runId === run.id && t.kind === 'observation').map((t) => t.outcome);
    expect(observations.slice(0, 2)).toEqual(['error', 'ok']);
  });

  it('ignores an approval id that is not the one waiting', () => {
    const waiting = untilApproval(sendMessage(fresh(), 'refund order', NOW));
    expect(resolveApproval(waiting, 'nope', true, NOW)).toBe(waiting);
  });
});

describe('steering', () => {
  it('pausing freezes the whole simulation, and resuming restarts it', () => {
    const paused = setPaused(fresh(), true);
    expect(deriveStatus(paused)).toBe('paused');
    expect(tick(paused, NOW)).toBe(paused);
    expect(sendMessage(paused, 'hello', NOW)).toBe(paused);
    expect(setPaused(paused, true)).toBe(paused);
    expect(deriveStatus(setPaused(paused, false))).toBe('idle');
  });

  it('stopping a run cuts a half-streamed reply where it is and settles pending trace steps', () => {
    let s = sendMessage(fresh(), 'hello there', NOW);
    while (!(s.messages.at(-1)!.role === 'agent' && s.messages.at(-1)!.revealed > 0)) s = tick(s, NOW);
    const stopped = cancelRun(s, NOW);
    const reply = stopped.messages.at(-1)!;
    expect(reply.text.length).toBe(reply.revealed);
    expect(stopped.runs.at(-1)!.ended).toBe('cancelled');
    expect(stopped.trace.some((t) => t.outcome === 'pending' || t.outcome === 'waiting')).toBe(false);
    expect(activeRun(stopped)).toBeUndefined();
    expect(cancelRun(stopped, NOW)).toBe(stopped);
  });

  it('cancelling the task a run is waiting for ends the run politely instead of hanging it (Review Focus #1)', () => {
    let s = approve(untilApproval(sendMessage(fresh(), 'refund order', NOW)));
    for (let i = 0; i < 50 && !s.tasks.some((t) => t.title === 'Process refund #4821'); i++) s = tick(s, NOW + i);
    const task = s.tasks.find((t) => t.title === 'Process refund #4821')!;
    const done = settle(cancelTask(s, task.id));
    expect(done.messages.at(-1)!.text).toMatch(/stopped before it finished/i);
  });

  it('cancels only queued or running tasks, and retries only failed or cancelled ones', () => {
    const s = fresh();
    const failed = s.tasks.find((t) => t.status === 'failed')!;
    const done = s.tasks.find((t) => t.status === 'done')!;
    expect(cancelTask(s, done.id)).toBe(s);
    expect(retryTask(s, done.id)).toBe(s);
    const retried = retryTask(s, failed.id).tasks.find((t) => t.id === failed.id)!;
    expect(retried).toMatchObject({ status: 'queued', ticksDone: 0 });
    expect(retried.error).toBeUndefined();
    const cancelled = cancelTask(s, s.tasks.find((t) => t.status === 'queued')!.id);
    expect(cancelled.tasks.filter((t) => t.status === 'cancelled')).toHaveLength(1);
  });
});

describe('caps (Review Focus #2)', () => {
  it('keeps every list bounded however long the tab stays open', () => {
    let s = fresh();
    // 110 runs of a scenario that adds a task and four trace steps each: enough to pass every cap.
    for (let i = 0; i < 110; i++) {
      s = { ...s, contextTokens: 0 }; // a real tab would hit the context limit first; this test is about the lists
      s = settle(sendMessage(s, 'summarise tickets', NOW + i));
    }
    expect(s.messages).toHaveLength(MAX_MESSAGES);
    expect(s.trace).toHaveLength(MAX_TRACE_STEPS);
    expect(s.runs).toHaveLength(MAX_RUNS);
    const finished = s.tasks.filter((t) => t.status === 'done' || t.status === 'failed' || t.status === 'cancelled');
    expect(finished.length).toBeLessThanOrEqual(MAX_FINISHED_TASKS);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/data/simulation.test.ts`
Expected: FAIL, `resolveApproval` and the others are not exported.

- [ ] **Step 3: Add the commands to `simulation.ts`**

Insert directly below `sendMessage` (above the `// ---- Time` section):

```ts
/** Answers the pending approval. Ignored if `approvalId` is not the one waiting. */
export function resolveApproval(state: AgentState, approvalId: string, approved: boolean, now: number): AgentState {
  const run = activeRun(state);
  if (!run?.approval || run.approval.id !== approvalId) return state;
  const s = draft(state);
  const { approval } = run;
  setOutcome(s, approval.traceId, 'ok');
  addTrace(s, run.id, 'decision', approved ? 'Approved by you' : 'Rejected by you', undefined, 'ok', now);
  replaceRun(s, {
    ...run,
    approval: null,
    remaining: [...(approved ? approval.approve : approval.reject), ...run.remaining],
  });
  return trim(s);
}

/** Stops the active run. A reply that was mid-stream is cut off where it is. */
export function cancelRun(state: AgentState, now: number): AgentState {
  const run = activeRun(state);
  if (!run) return state;
  const s = draft(state);
  const messageId = run.current?.messageId;
  if (messageId) {
    s.messages = s.messages.map((m) => (m.id === messageId ? { ...m, text: m.text.slice(0, m.revealed) } : m));
  }
  s.trace = s.trace.map((t) =>
    t.runId === run.id && (t.outcome === 'pending' || t.outcome === 'waiting') ? { ...t, outcome: 'error' } : t,
  );
  addTrace(s, run.id, 'decision', 'Run stopped by you', undefined, 'error', now);
  replaceRun(s, { ...run, current: null, approval: null, remaining: [], ended: 'cancelled' });
  return trim(s);
}

export function cancelTask(state: AgentState, taskId: string): AgentState {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task || (task.status !== 'queued' && task.status !== 'running')) return state;
  return { ...state, tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'cancelled' } : t)) };
}

export function retryTask(state: AgentState, taskId: string): AgentState {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task || (task.status !== 'failed' && task.status !== 'cancelled')) return state;
  const retried: Task = { ...task, status: 'queued', ticksDone: 0 };
  delete retried.error;
  return { ...state, tasks: state.tasks.map((t) => (t.id === taskId ? retried : t)) };
}

export function setPaused(state: AgentState, paused: boolean): AgentState {
  return state.paused === paused ? state : { ...state, paused };
}
```

- [ ] **Step 4: Run the tests, then type-check**

Run: `npx vitest run src/data` (expected all PASS) and `npx tsc --noEmit`.

- [ ] **Step 5: Commit**

```bash
git add src/data
git commit -m "feat(agent-panel): approvals, stop run, task cancel and retry, pause, and list caps" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 7: The hook, the only timer

**Files:**
- Create: `src/data/useSimulatedAgent.ts`, `src/data/useSimulatedAgent.test.ts`, `src/hooks/usePrefersReducedMotion.ts`, `src/hooks/usePrefersReducedMotion.test.ts`

**Interfaces:**
- Produces: `useSimulatedAgent(options?): { state: AgentState; actions: AgentActions }`, `AgentActions`, `AgentController`, `usePrefersReducedMotion(): boolean`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/data/useSimulatedAgent.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSimulatedAgent } from './useSimulatedAgent';
import { activeRun } from './simulation';

describe('useSimulatedAgent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('advances on each interval tick once a message is sent', () => {
    const { result } = renderHook(() => useSimulatedAgent({ tickMs: 250 }));
    act(() => result.current.actions.send('hello there'));
    const before = result.current.state;
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current.state).not.toBe(before);
    expect(activeRun(result.current.state)).toBeDefined();
  });

  it('shows a whole reply in one tick when charsPerTick is Infinity (reduced motion)', () => {
    const { result } = renderHook(() => useSimulatedAgent({ tickMs: 250, charsPerTick: Infinity }));
    act(() => result.current.actions.send('hello there'));
    act(() => {
      vi.advanceTimersByTime(250 * 6);
    });
    const reply = result.current.state.messages.at(-1)!;
    expect(reply.revealed).toBe(reply.text.length);
    expect(activeRun(result.current.state)).toBeUndefined();
  });

  it('does not re-render on a tick when nothing is moving (Review Focus #3)', () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useSimulatedAgent({ tickMs: 250 });
    });
    act(() => {
      vi.advanceTimersByTime(250 * 200); // drain the seeded background tasks
    });
    const settled = renders;
    act(() => {
      vi.advanceTimersByTime(250 * 20);
    });
    // React may re-run the component once before it bails out of an unchanged
    // state; 20 idle ticks must not cost 20 renders.
    expect(renders).toBeLessThanOrEqual(settled + 1);
    expect(result.current.state.tasks.some((t) => t.status === 'running')).toBe(false);
  });

  it('clears its interval on unmount (Review Focus #3)', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = renderHook(() => useSimulatedAgent());
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('gives actions that stay the same function across renders, so memoised children do not re-render', () => {
    const { result } = renderHook(() => useSimulatedAgent());
    const first = result.current.actions;
    act(() => first.setPaused(true));
    expect(result.current.actions).toBe(first);
    expect(result.current.state.paused).toBe(true);
  });

  it('reset returns to the first state', () => {
    const { result } = renderHook(() => useSimulatedAgent());
    act(() => result.current.actions.send('hello'));
    act(() => result.current.actions.reset());
    expect(result.current.state.messages).toHaveLength(2);
  });
});
```

```ts
// src/hooks/usePrefersReducedMotion.test.ts
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

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/data/useSimulatedAgent.test.ts src/hooks`
Expected: FAIL, modules missing.

- [ ] **Step 3: Write the hooks**

```ts
// src/data/useSimulatedAgent.ts
import { useEffect, useMemo, useState } from 'react';
import { CHARS_PER_TICK, TICK_MS } from './limits';
import {
  cancelRun,
  cancelTask,
  createInitialState,
  resolveApproval,
  retryTask,
  sendMessage,
  setPaused,
  tick,
} from './simulation';
import type { AgentState } from './types';

export interface AgentActions {
  send: (text: string) => void;
  resolveApproval: (approvalId: string, approved: boolean) => void;
  stopRun: () => void;
  cancelTask: (taskId: string) => void;
  retryTask: (taskId: string) => void;
  setPaused: (paused: boolean) => void;
  /** Back to the first state. The only way out of a full context window. */
  reset: () => void;
}

export interface AgentController {
  state: AgentState;
  actions: AgentActions;
}

export interface SimulatedAgentOptions {
  tickMs?: number;
  /** Characters of a reply shown per tick. Infinity shows replies at once (reduced motion). */
  charsPerTick?: number;
}

// The seam to replace with a real agent. Everything on screen reads `state`
// and calls `actions`, and nothing below this hook knows the data is
// simulated: to connect your own agent, return `state` built from your
// server's events (keep the AgentState shape) and make each action call your
// API. This is also the only timer and the only caller of Date.now() in the
// template; the engine in simulation.ts is pure.
export function useSimulatedAgent({ tickMs = TICK_MS, charsPerTick = CHARS_PER_TICK }: SimulatedAgentOptions = {}): AgentController {
  const [state, setState] = useState<AgentState>(() => createInitialState(Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      // An idle tick returns the same state object, so React skips the render.
      setState((prev) => tick(prev, Date.now(), charsPerTick));
    }, tickMs);
    return () => clearInterval(id);
  }, [tickMs, charsPerTick]);

  // Stable across renders, so memoised children are not re-rendered by a new
  // `actions` object on every tick.
  const actions = useMemo<AgentActions>(
    () => ({
      send: (text) => setState((prev) => sendMessage(prev, text, Date.now())),
      resolveApproval: (approvalId, approved) => setState((prev) => resolveApproval(prev, approvalId, approved, Date.now())),
      stopRun: () => setState((prev) => cancelRun(prev, Date.now())),
      cancelTask: (taskId) => setState((prev) => cancelTask(prev, taskId)),
      retryTask: (taskId) => setState((prev) => retryTask(prev, taskId)),
      setPaused: (paused) => setState((prev) => setPaused(prev, paused)),
      reset: () => setState(createInitialState(Date.now())),
    }),
    [],
  );

  return { state, actions };
}
```

```ts
// src/hooks/usePrefersReducedMotion.ts
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

Run: `npx vitest run src/data src/hooks` (expected PASS), `npx tsc --noEmit`.

```bash
git add src/data src/hooks
git commit -m "feat(agent-panel): useSimulatedAgent is the only timer; reduced-motion hook" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 8: Agent header, status badge and Live status

**Files:**
- Create: `src/data/describeActivity.ts` + `.test.ts`, `src/components/StatusBadge.tsx` + `.test.tsx`, `src/components/AgentHeader.tsx` + `.test.tsx`, `src/components/LiveStatus.tsx` + `.test.tsx`, `src/utils/format.ts` + `.test.ts`
- Modify: `src/theme/tones.ts`, `src/theme/tones.test.ts`, `src/App.css`

**Interfaces:**
- Consumes: `AgentStatus`, `ContextLevel`, `contextPct`, `contextLevel`, `CONTEXT_WINDOW_TOKENS`.
- Produces (in `tones.ts`): `STATUS_VIEW: Record<AgentStatus, { label: string; tone: Tone; badge: BadgeVariant; avatar: AvatarStatus }>`, `CONTEXT_TONE: Record<ContextLevel, Tone>`. `describeActivity(state): string`. Components: `StatusBadge({ status })`, `AgentHeader({ status, paused, running, onPause, onResume, onStop, onReset })`, `LiveStatus({ state })`. `format.ts`: `formatClock(ms)`, `formatRelativeTime(ts, now)`, `formatTokens(n)` (copy `formatRelativeTime` from monitoring's `utils/format.ts`).

Add to `tones.ts` (with the types imported from the library: `import type { AvatarStatus, BadgeProps } from 'cyberui-2045'; type BadgeVariant = NonNullable<BadgeProps['variant']>;`):

```ts
export const STATUS_VIEW: Record<AgentStatus, { label: string; tone: Tone; badge: BadgeVariant; avatar: AvatarStatus }> = {
  idle: { label: 'Idle', tone: 'default', badge: 'secondary', avatar: 'online' },
  thinking: { label: 'Thinking', tone: 'default', badge: 'secondary', avatar: 'online' },
  working: { label: 'Working', tone: 'success', badge: 'success', avatar: 'online' },
  waiting: { label: 'Waiting for approval', tone: 'warning', badge: 'warning', avatar: 'away' },
  paused: { label: 'Paused', tone: 'warning', badge: 'warning', avatar: 'offline' },
};

export const CONTEXT_TONE: Record<ContextLevel, Tone> = { ok: 'default', high: 'warning', full: 'error' };
```

- [ ] **Step 1: Write the failing tests**
  - `describeActivity.test.ts`: one assertion per `AgentStatus` path using engine states built with `sendMessage`/`tick`/`setPaused` (idle with and without running tasks; thinking shows the step title; working on a tool shows `Calling orders.lookup(order #4821).`; waiting says it is asking the person; paused says nothing will move).
  - `tones.test.ts`: add a test that `STATUS_VIEW` has an entry for every `AgentStatus` value and that every `tone`/`CONTEXT_TONE` value is a key of `TONE_CLASS` (the type guarantees this; the test guards a future `any`).
  - `StatusBadge.test.tsx`: renders the label for each status; gives the `Waiting for approval` badge the warning variant (assert on its text, not the library's classes).
  - `AgentHeader.test.tsx`: shows the agent name "Vesper" and a "Simulated" badge **always** (Review Focus #8); the Avatar's accessible name is "Vesper"; Pause when running, Resume when paused (swap), Stop run enabled only while `running`, Reset always enabled; each button calls its callback once.
  - `LiveStatus.test.tsx`: shows the status badge and the activity sentence; the context meter's label shows the percentage and tokens (`17%`, `5,400 / 32,000`); the meter's wrapper carries `tone-warning` at 70% and `tone-error` at 90%, and `tone-default` below (scoped `within(region 'Live status')`); counts for tool calls and for tasks running/queued.
  - `format.test.ts`: `formatClock` is `HH:MM:SS` (24-hour, local time, zero padded); `formatTokens(5400)` is `5,400`.

- [ ] **Step 2: Run them to verify they fail**, then
- [ ] **Step 3: Implement.** Markup shape:
  - `AgentHeader`: `<header className="agent-header">` with `<Avatar alt="Vesper" initials="V" status={STATUS_VIEW[status].avatar} />`, the name in an `<h1 className="page-title">`, `<Badge variant="accent" size="sm">Simulated</Badge>`, `<StatusBadge />`, then the toolbar of `Button size="sm"` (`variant="secondary"` Pause/Resume, `danger` Stop run, `ghost` Reset). The `<h1>` is the page's title on the Console route only (Tasks and Logs have their own `page-title`).
  - `LiveStatus`: `<section aria-label="Live status">` → `Card title="Live status"` containing the badge, `<p className="live-activity">{describeActivity(state)}</p>`, a `LinearProgress progress={contextPct(...)}` wrapped in `<div className={`context-meter ${TONE_CLASS[CONTEXT_TONE[level]]}`}>`, its label, and a small definition list (tool calls; tasks "1 running · 1 queued").
  - CSS (add to `App.css`, a header comment per block, tokens only): `.agent-header`, `.live-activity`, `.context-meter` (the library's bar takes no colour prop: tint it by setting `color` and letting the wrapper's descendants use `currentColor` only where the bar allows; if the bar cannot be tinted, show the tone on the label and a coloured `●` instead, and say so in a comment), `.live-dot` (pulse, off under `prefers-reduced-motion`; copy monitoring's).
- [ ] **Step 4: Run tests and `npx tsc --noEmit`; Step 5: commit** (`feat(agent-panel): agent header, status badge and live status`).

### Task 9: Reasoning trace

**Files:**
- Create: `src/components/ReasoningTrace.tsx` + `.test.tsx`
- Modify: `src/theme/tones.ts`, `src/theme/tones.test.ts`, `src/App.css`

**Interfaces:**
- Produces (in `tones.ts`): `TRACE_STATUS: Record<TraceOutcome, TimelineEvent['status']>` (`ok → 'success'`, `error → 'error'`, `waiting → 'warning'`, `pending → 'info'`) and `TRACE_KIND_LABEL: Record<TraceKind, string>` (`thought: 'Thought'`, `tool: 'Tool'`, `observation: 'Result'`, `approval: 'Approval'`, `decision: 'Decision'`).
- Component: `ReasoningTrace({ steps: TraceStep[]; runLabel: 'latest' | 'selected'; onFollowLatest: () => void })`.

- [ ] **Step 1: Write the failing tests**
  - Renders each step as a Timeline event whose title starts with its kind label (`Thought: Plan the refund`), so meaning is not colour-only; shows the step's `detail` as the description; the time is `formatClock(at)`.
  - The panel is titled "Reasoning trace (scripted)" (Review Focus #8: the honesty label) and is a `region` named "Reasoning trace".
  - With `runLabel="selected"` it says "Showing the run for the message you picked" and a "Back to latest" button calls `onFollowLatest`; with `"latest"` neither appears.
  - Empty `steps` renders "Nothing yet. Send a message to see the agent's steps." instead of an empty Timeline.
  - Newest step is last, and the list scrolls inside its own container (assert the container has the class that sets `overflow: auto`, not a computed style).
- [ ] **Step 2-5:** run to fail; implement with `Timeline` (the library draws the diamonds; map via `TRACE_STATUS`); add `.trace-scroll` (bounded height, `overflow: auto`) and keep the trace sticking to the newest step the same way Task 11's list does (share the small `useStickToBottom` hook introduced there if Task 11 is already done; otherwise leave a TODO-free simple version and let Task 11 refactor); run tests; commit (`feat(agent-panel): reasoning trace`).

### Task 10: Task queue (compact list and full table)

**Files:**
- Create: `src/components/TaskList.tsx` + `.test.tsx`, `src/components/TaskTable.tsx` + `.test.tsx`, `src/components/TaskStatusBadge.tsx` + `.test.tsx`
- Modify: `src/theme/tones.ts` (+ its test), `src/App.css`

**Interfaces:**
- Produces (in `tones.ts`): `TASK_BADGE: Record<TaskStatus, BadgeVariant>` (`queued: 'secondary'`, `running: 'accent'`, `done: 'success'`, `failed: 'error'`, `cancelled: 'warning'`). Components: `TaskStatusBadge({ status })`, `TaskList({ tasks, onCancel, onRetry })`, `TaskTable({ tasks, onCancel, onRetry })`.

- [ ] **Step 1: Write the failing tests**
  - `TaskList` (the Console's compact queue, in `<section aria-label="Task queue">`): a row per task showing title, `TaskStatusBadge`, and for `running` a `LinearProgress` (assert `role="progressbar"` value or the rendered percentage text `25%`, whichever the library exposes; check in the installed build first and write the assertion against what exists); Cancel is present only for queued/running, Retry only for failed/cancelled, each calls back with the task id; a failed task shows its `error` text; empty state "No tasks."; ordering is running, queued, failed, then finished, newest first within a group.
  - `TaskTable` (Tasks page): library `Table` with columns Task, Priority, Status, Progress, Actions; `ariaLabel="Tasks"`; same Cancel/Retry rules; the filter is *not* in this component (the page owns it).
  - `TaskStatusBadge`: label text equals the status; `TASK_BADGE` covers every `TaskStatus` (type-level, plus the tones test).
  - The two-places collision: a task title is queried with `within(...)`, with a one-line comment.
- [ ] **Step 2-5:** run to fail; implement (shared ordering helper `sortTasks(tasks)` in `src/data/tasks.ts` with its own tests, used by both); `.task-row`, `.task-title`, `.task-error` CSS; run tests; commit (`feat(agent-panel): task list and task table`).

### Task 11: The conversation: bubbles, approval card, composer

The most behavior-heavy UI. Do not skip the tests.

**Files:**
- Create: `src/components/MessageBubble.tsx`, `ApprovalCard.tsx`, `Composer.tsx`, `ConversationPanel.tsx` (each with `.test.tsx`), `src/hooks/useStickToBottom.ts` + `.test.tsx`
- Modify: `src/App.css`

**Interfaces:**
- `MessageBubble({ message, selected, onSelect })`: shows `message.text.slice(0, message.revealed)`; agent bubbles with a `runId` are a `<button>` that calls `onSelect(runId)`; user bubbles are plain. `selected` sets `aria-pressed`.
- `ApprovalCard({ prompt, onApprove, onReject })`: `role="group"` labelled by the prompt; "Approve" (`primary`) and "Reject" (`danger`).
- `Composer({ onSend, disabledReason, suggested })`: `Input` with `label` "Message Vesper" (visually shown), the `helperText` "Scripted demo: replies are pre-written. Nothing is sent to a model or leaves your browser." (always), a Send `Button`, and chips for `SUGGESTED_PROMPTS`. `disabledReason: string | null`; when set, the input and Send are disabled and the reason replaces nothing but is shown above the input.
- `ConversationPanel({ state, selectedRunId, onSelectRun, onSend, onResolveApproval })`: `<section aria-label="Conversation">`, the message list (`aria-live="polite"`, `aria-relevant="additions"`), the `ApprovalCard` when the active run has an `approval`, the `Composer`. The composer's `disabledReason` is computed here from one place: `paused → "The agent is paused. Resume it to send a message."`, `active run with approval → "Approve or reject above to continue."`, `active run → "Vesper is working…"`, `contextLevel === 'full' → "Context full. Reset to start again."`, else `null`.
- `useStickToBottom<T>(dep): RefObject<T>`: keeps a scroll container pinned to the bottom when `dep` changes **only if it was already at (or within 24px of) the bottom before the change**.

- [ ] **Step 1: Write the failing tests**
  - `MessageBubble`: only the revealed part is shown (`revealed: 5` of "Hello there" shows "Hello"); an agent bubble with a run is a button named by its text, calls `onSelect` with the run id; a user bubble is not a button; `selected` → `aria-pressed="true"`.
  - `ApprovalCard`: shows the prompt; Approve and Reject call back once; the group is named by the prompt; focus is on Approve on mount (`toHaveFocus`).
  - `Composer`: Enter sends the trimmed text and clears the box; Shift+Enter does not send (if the library `Input` is single-line this is moot: assert only Enter and the button); blank is not sent; a chip fills the box without sending; with `disabledReason` the input and Send are disabled and the reason text is visible; **the "Scripted demo" helper line is present in every state** (Review Focus #8).
  - `ConversationPanel`: shows messages in order; the approval card appears only when the active run has an approval and its buttons call `onResolveApproval(approvalId, bool)`; the composer's reason for each of the four disabled states (Review Focus #5), built with real engine states (`setPaused`, `sendMessage`, an approval via a short `tick` loop, `contextTokens: 32000`); selecting an agent message calls `onSelectRun`.
  - `useStickToBottom` (a tiny test component): when scrolled to the bottom and `dep` changes, `scrollTop` becomes `scrollHeight`; when scrolled up (set `scrollTop` low with a mocked `scrollHeight`/`clientHeight`), it does not move (Review Focus #4). happy-dom has no layout, so define `scrollHeight`, `clientHeight` on the element with `Object.defineProperty` in the test.
- [ ] **Step 2-5:** run to fail; implement; CSS: `.conversation-scroll` (bounded height, `overflow: auto`), `.bubble`, `.bubble--user`, `.bubble--agent`, `.bubble--selected`, `.approval-card`, `.composer`, `.suggested-prompts` (tokens only; **reset text colour inside the `Card`**: `.panel-surface { color: var(--color-default); }` with the comment that the library's `Card` sets magenta text by default); run tests; commit (`feat(agent-panel): conversation, approval card and composer`).

### Task 12: Past sessions (Logs fixtures and table)

**Files:**
- Create: `src/data/sessions.ts` + `.test.ts`, `src/components/SessionTable.tsx` + `.test.tsx`
- Modify: `src/theme/tones.ts` (+ test), `src/App.css`

**Interfaces:**
- `SessionOutcome = 'resolved' | 'escalated' | 'abandoned'`; `SessionLog { id, title, startedAt, messageCount, toolCalls, outcome, durationMin }`; `createSessionLogs(now): SessionLog[]` (14 fixed rows, times relative to `now`, newest first); `OUTCOME_BADGE: Record<SessionOutcome, BadgeVariant>` in `tones.ts` (`resolved: 'success'`, `escalated: 'warning'`, `abandoned: 'error'`).
- `SessionTable({ sessions, now })`: owns its own search `Input` (label "Search sessions"), outcome filter (`TabNavigation` with `['All', 'Resolved', 'Escalated', 'Abandoned']`, an `as const` tuple), `Pagination` at 6 per page, the library `Table` with `ariaLabel="Past sessions"`, and the mock **Export transcript** `Button`: after a click it shows "Exported" and nothing else happens.

- [ ] **Step 1: Write the failing tests**
  - `sessions.test.ts`: 14 rows, distinct ids, sorted newest first, times are before `now`, every outcome appears at least once.
  - `SessionTable.test.tsx`: shows 6 rows on page 1; search narrows by title (case-insensitive) and resets to page 1; the outcome tab filters; paging moves; empty result shows the table's `emptyMessage` ("No sessions match."); `OUTCOME_BADGE` covers every outcome; **Export transcript is a mock and says so**: click → "Exported" appears and no download is triggered (spy `URL.createObjectURL` and `HTMLAnchorElement.prototype.click`, expect neither called) (Review Focus #8); a comment in the component says the same.
- [ ] **Step 2-5:** run to fail; implement; run tests; commit (`feat(agent-panel): past sessions table with search, filter and paging`).

### Task 13: Pages, the app shell and the layout

Wire everything. After this task the app works end to end.

**Files:**
- Create: `src/pages/ConsolePage.tsx`, `TasksPage.tsx`, `LogsPage.tsx` (each with `.test.tsx`), `src/icons/index.tsx` + `.test.tsx`, `src/noInlineStyles.test.ts`
- Modify: `src/App.tsx`, `src/App.test.tsx`, `src/App.css`, `index.html` (title only if needed)

**Interfaces:**
- `ConsolePage({ agent: AgentController, selectedRunId: string | null, onSelectRun: (id: string | null) => void })`: header, then three panels (Task queue | Conversation | Live status over Reasoning trace). Below 720px a `TabNavigation` (`['Conversation', 'Tasks', 'Trace']`, `as const`) picks one pane (CSS only hides the others; all stay in the DOM). The trace shows the selected run if there is one, else the latest run (`state.runs.at(-1)`, or the active run), and passes `runLabel` accordingly.
- `TasksPage({ tasks, onCancel, onRetry })`: page title "Tasks", a one-line note "Simulated tasks. Cancel and Retry change the simulation only." and a filter `TabNavigation` (`['All', 'Active', 'Done', 'Failed']`) over `TaskTable`.
- `LogsPage({ now })`: page title "Logs", a note "Sample sessions. These are fixed examples; wire in your own history.", and `SessionTable`.
- `icons`: `SendIcon`, `PauseIcon`, `PlayIcon`, `StopIcon` (inline SVG, `aria-hidden`, copy monitoring's icon style and its test).

- [ ] **Step 1: Write `App.tsx`** (the pattern to copy; Review focus: `Record<Route, …>`)

```tsx
import { useEffect, useState, type ReactNode } from 'react';
import { Badge } from 'cyberui-2045';
import { CHARS_PER_TICK } from './data/limits';
import { useSimulatedAgent } from './data/useSimulatedAgent';
import { deriveStatus } from './data/simulation';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { ROUTES, useHashRoute, type Route } from './router/useHashRoute';
import { STATUS_VIEW } from './theme/tones';
import { ConsolePage } from './pages/ConsolePage';
import { TasksPage } from './pages/TasksPage';
import { LogsPage } from './pages/LogsPage';
import './App.css';

// Record<Route, ...> (here and for the pages below) makes adding a route
// without a label or a page a type error, instead of a blank <main>.
const ROUTE_LABELS: Record<Route, string> = {
  console: 'Console',
  tasks: 'Tasks',
  logs: 'Logs',
};

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  // Everything on screen comes from this one hook (see its comment for how to swap in a real agent).
  const agent = useSimulatedAgent({ charsPerTick: reducedMotion ? Infinity : CHARS_PER_TICK });
  const { state, actions } = agent;
  // Lives here, not in ConsolePage, so the picked run survives leaving and returning to the Console.
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const route = useHashRoute();
  const status = deriveStatus(state);

  useEffect(() => {
    document.title = `${ROUTE_LABELS[route]} — Vesper Control`;
  }, [route]);

  const pages: Record<Route, () => ReactNode> = {
    console: () => (
      <ConsolePage
        agent={{ state, actions: { ...actions, send: (text) => { setSelectedRunId(null); actions.send(text); } } }}
        selectedRunId={selectedRunId}
        onSelectRun={setSelectedRunId}
      />
    ),
    tasks: () => <TasksPage tasks={state.tasks} onCancel={actions.cancelTask} onRetry={actions.retryTask} />,
    logs: () => <LogsPage now={state.startedAt} />,
  };

  return (
    <div className="agent-panel">
      <nav className="topnav" aria-label="Primary">
        <div className="topnav-brand">
          <span className="topnav-logo" aria-hidden="true">⬡</span>
          <span className="topnav-name">Vesper</span>
        </div>
        <div className="topnav-links">
          {ROUTES.map((itemRoute) => (
            <a
              key={itemRoute}
              href={`#/${itemRoute}`}
              className={route === itemRoute ? 'topnav-link topnav-link--active' : 'topnav-link'}
              aria-current={route === itemRoute ? 'page' : undefined}
            >
              {ROUTE_LABELS[itemRoute]}
            </a>
          ))}
        </div>
        <div className="topnav-status" role="status">
          <span className="live-dot" aria-hidden="true" />
          <Badge variant={STATUS_VIEW[status].badge}>{STATUS_VIEW[status].label}</Badge>
        </div>
      </nav>
      <main className="panel-body">{pages[route]()}</main>
    </div>
  );
}
```

(Hoist the wrapped `send` into a `useCallback` if the lint-free build shows it re-creating every render; it does not affect correctness.)

- [ ] **Step 2: Write the failing tests**
  - `noInlineStyles.test.ts`: copy monitoring's verbatim (its `hasStyleAttribute` tests and the scan). Raise the "finds the source files" floor only if needed.
  - `ConsolePage.test.tsx`: renders the four named regions (Task queue, Conversation, Live status, Reasoning trace) and the pane tablist; picking a message switches the trace to "Showing the run for the message you picked"; with no pick it follows the latest run; the "Simulated" badge and the "Scripted demo" line are present (Review Focus #8). Use `within(...)` per panel.
  - `TasksPage.test.tsx`: title, the simulated note, filter tabs narrow the rows (Active = queued+running; Done; Failed), Cancel/Retry reach the callbacks.
  - `LogsPage.test.tsx`: title, the sample-sessions note, the table is present.
  - `icons/index.test.tsx`: copy monitoring's (each icon renders an `aria-hidden` svg).
  - `App.test.tsx` (replace the placeholder): renders the Console by default with the primary nav; navigates Console → Tasks → Logs via real links (`aria-current="page"`); unknown hash falls back to Console; document title follows the route; the header status badge in the nav follows the engine. **End-to-end approval flow** with `vi.useFakeTimers()`: click the "Refund an order" chip, press Send, advance 250ms ticks until a group named "Refund $42.00 for order #4821?" appears (loop with a cap), assert the nav status says "Waiting for approval" and the trace region has an "Approval: Waiting for your approval" entry, click Approve, advance until Idle, assert the reply "…refund for order #4821 is processed…" is fully shown in the Conversation region and the Tasks route lists "Process refund #4821" as done. A second test clicks Reject and sees the "left order #4821 untouched" reply and no refund task.
- [ ] **Step 3: Run to verify they fail; Step 4: Implement the pages and the layout CSS**

  `App.css` additions (tokens only, no hex): `.agent-panel` (the layout root: `color: var(--color-default)`, `max-width`, padding, `font-variant-numeric: tabular-nums`; copy monitoring's `--gap` and `--pad-*` variables), `body { background: var(--color-base); }`, `.panel-surface`, `.page-header`/`.page-title`/`.page-subtitle` (copy from monitoring), `.topnav*` (copy monitoring's nav block verbatim, it already uses `--color-secondary`, which is now violet), `.panel-body`, `.console-grid` (one column by default; two columns from 720px; three from 1180px: `minmax(0, 0.9fr) minmax(0, 1.6fr) minmax(0, 1.1fr)`), `.console-pane`/`.console-pane--active` (below 720px only the active pane shows; at and above it all show; the pane tab bar is hidden at and above 720px), `.pane-tabs`, plus every class the earlier tasks introduced. `prefers-reduced-motion`: no transitions or pulse.

- [ ] **Step 5: Run the whole suite and the build**

Run: `npx vitest run` (expected all PASS), `npm run build` via `pnpm --filter agent-panel-template run build` (expected clean). Then `pnpm --filter agent-panel-template dev` and click through once; fix anything glaring now (the full browser pass is Task 14).

- [ ] **Step 6: Commit**

```bash
git add src
git commit -m "feat(agent-panel): console, tasks and logs pages wired into the app shell" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 14: README, the standalone check and the first browser look

**Files:**
- Create: `packages/agent-panel/README.md`
- Modify: `docs/superpowers/specs/2026-10-06-agent-panel-design.md` (append "Findings from the first browser check")

- [ ] **Step 1: Write the README** in monitoring's shape and honesty. Sections, in order:
  1. Title and one paragraph: what it is (a control panel for an AI assistant: conversation, task queue, live status, reasoning trace, human approval), built with cyberui-2045. **Everything is simulated in the browser: no model is called, nothing is sent, nothing is saved.** Then the two lists: *controls that change the simulation* (send, approve/reject, pause/resume, stop run, reset, cancel/retry task, search/filter) and the one *pure mock* (Export transcript on Logs: it shows "Exported" and saves nothing), and that the sessions on Logs are fixed samples.
  2. Commands: `npm install && npm run dev`, `npm run build`, `npm test`; "Requires Node 20.19 or newer."
  3. **Re-theming**: the accent is two tokens in `src/theme/violet.css`; change them.
  4. **Where your data goes**: spec §5.6, with links to `src/App.tsx`, `src/data/useSimulatedAgent.ts`, `src/data/types.ts`, and a sentence on scenarios (`src/data/scenarios.ts`: add a behavior by adding data).
  5. **Principles this code follows**: the table (Single source of truth: `limits.ts`, `ROUTES`; DRY: `TONE_CLASS` and the `Record` maps in `theme/tones.ts`; State in hooks, components presentational; No inline styles and no hex colours outside `violet.css` (two tests); Typed and exhaustive: `Record<Route, …>`; Scripts as data; Tested), each with links to files that exist. Do not claim a principle that is not true.
  6. License line only if the `LICENSE` file is not present (it is).

- [ ] **Step 2: Clean-room install** (monitoring plan Task 9's method). From the repo root, copy the package outside the workspace and install there:

```bash
rm -rf /tmp/agent-panel-copy && cp -r packages/agent-panel /tmp/agent-panel-copy && rm -rf /tmp/agent-panel-copy/node_modules /tmp/agent-panel-copy/dist
cd /tmp/agent-panel-copy && npm install && npm run build && npm test
```

Expected: `npm install` prints no errors and no `npm warn`; build and tests pass. (On Windows use a temp directory outside the repo.) Also check by hand: `grep -n "workspace:" packages/agent-panel/package.json` prints nothing, and no file in `src/` imports from `../../`-style paths leaving the package.

- [ ] **Step 2b: If `tiged` is reachable,** run `npx tiged patrickkuei/cyberui-templates/packages/agent-panel /tmp/agent-panel-tiged` after PR A is merged and repeat the install there (the real fork path). Record the result; if not possible yet, say so in the PR.

- [ ] **Step 3: The browser look.** Run `pnpm --filter agent-panel-template dev`, open the printed address and check, fixing what fails in the file it belongs to (each its own commit):
  - Desktop 1440px: three columns; the conversation is the widest; violet appears on card-title rules, nav active rule, focus rings, links, the Avatar glow, badges; **no stray cyan or yellow anywhere**; `Table` header, `Pagination` and `TabNavigation` are violet.
  - **Q3 (primary magenta beside violet), decided by the owner: keep it.** Do not override `--color-primary`. Judge the Send and Approve buttons; only if they clearly clash, make Send a `secondary` button, and write the finding down either way.
  - **Text colour:** no magenta body text inside any `Card` (the `.panel-surface` reset works).
  - Click the Refund chip, Send: status goes Thinking → Working → Waiting; the approval card appears with focus on Approve; the trace gains entries live; Approve completes; the reply streams.
  - Click an earlier agent message: the trace switches and says so; Back to latest works; sending a new message returns to latest.
  - Pause, Stop run (mid-reply), Reset, Cancel and Retry on tasks all behave; the composer disabled states each show their reason.
  - Fill the context (send about 15 messages): meter goes warning then error; composer disables; Reset recovers.
  - Tasks and Logs pages: filter, search, paging, Export transcript shows "Exported" only.
  - 390px wide: no sideways page scroll; the pane tabs appear and each pane works; the nav links wrap rather than clip.
  - `prefers-reduced-motion` (devtools emulation): replies appear whole; no pulse.
  - Keyboard: Tab order is sensible; every control has a visible focus ring; Enter sends.
  - Screen reader: the streaming reply is not announced character by character (spec §3.5, unchecked until now); note the result.

- [ ] **Step 4: Record what you found** in a "Findings from the first browser check" list at the end of the spec (what needed a fix, the Q3 judgment, what you could not check). State plainly what was not checked.

- [ ] **Step 5: Commit, push, open PR A**

```bash
git add packages/agent-panel docs/superpowers/specs/2026-10-06-agent-panel-design.md
git commit -m "docs(agent-panel): README and findings from the first browser check" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git push -u origin feat/agent-panel-template
gh pr create --base main --title "feat(agent-panel): the second template, an AI assistant control panel" --body "<summary; test plan; the #28 note only if #28 had not landed; Refs #9>" 
```

The PR body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. Do not merge.

---

## PR B: publish it on the site

Start after PR A is merged: `git checkout main && git pull && git checkout -b feat/site-agent-panel`.

### Task 15: Site data, copy, Code tab and screenshot

**Files (all under `packages/site/` unless noted):**
- Modify: `src/data/templates.ts`, `src/data/templates.test.ts`, `src/content/templateContent.ts`, `src/content/templateContent.test.ts`, `src/content/codeTabs.json`
- Create: `public/screenshots/agent-panel.png`

- [ ] **Step 1: Write the failing tests**

In `src/data/templates.test.ts` add:

```ts
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
// (add to the imports at the top of the file)

  it('looks up the agent panel and gives it a violet accent distinct from monitoring', () => {
    expect(getTemplate('agent-panel')?.name).toBe('Agent Control Panel');
    expect(getTemplate('agent-panel')?.accentHex).toBe('#c084fc');
  });

  it("every item's screenshot file exists, because nothing else in CI would notice a missing one", () => {
    for (const item of TEMPLATES) {
      const file = resolve(__dirname, '../../public', item.screenshotSrc.replace(/^\.\//, ''));
      expect(existsSync(file), `${item.screenshotSrc} is missing from packages/site/public`).toBe(true);
    }
  });
```

(`__dirname` is available under vite-node; if the site's types complain, declare it as `packages/monitoring/src/test/setup.ts` does.)

In `src/content/templateContent.test.ts` add:

```ts
  it('gives the agent panel fit copy that says plainly the agent is a script, and two examples', () => {
    const content = TEMPLATE_CONTENT['agent-panel']!;
    expect(content.useIf).toHaveLength(3);
    expect(content.headsUp).toMatch(/screens, not the agent/);
    expect(content.headsUp).toMatch(/no AI model is called/);
    expect(content.examples).toHaveLength(2);
  });
```

- [ ] **Step 2: Run them to verify they fail**

Run (from `packages/site`): `npx vitest run src/data src/content`
Expected: FAIL (no `agent-panel` entry; no screenshot).

- [ ] **Step 3: Add the template entry** (`slug:` immediately followed by `name:`, plain quoted strings; `scripts/check-templates-readme.mjs` reads this file as text)

```ts
  {
    slug: 'agent-panel',
    name: 'Agent Control Panel',
    tagline: 'A conversation, a task queue, live status and a reasoning trace for an AI assistant, with a human approval step.',
    accentLabel: 'Violet',
    accentHex: '#c084fc',
    screenshotSrc: './screenshots/agent-panel.png',
    livePreviewPath: './live/agent-panel/index.html',
  },
```

- [ ] **Step 4: Run the interviews for the examples** (spec §11). Launch two subagents, one per persona, with the same brief the `/templates` spec's Round 2 used: *"You are <persona>. You have the Agent Control Panel template (an operator screen for an AI assistant: Console, Tasks and Logs pages; scripted demo data; a human approval step; no real agent). You will tell your AI coding assistant what to change. Reply with: (1) what you would type to your AI, in order, 4 to 6 messages; (2) where you would get stuck; (3) how you would know it worked."* Personas: (a) a support-team lead who wants a console for an agent that drafts replies to customers; (b) a solo founder who wants to oversee an ops assistant that runs chores and needs to approve anything that spends money. Save the replies verbatim, truncate long fields with an ellipsis (as the monitoring entry does), do not reword. **If subagents cannot be run, stop and ask the owner; do not write the examples yourself.**

- [ ] **Step 5: Add the section copy** to `TEMPLATE_CONTENT` (wording fixed by spec §11; examples from Step 4):

```ts
  'agent-panel': {
    code: CODE_TABS['agent-panel']!,
    useIf: [
      'a screen to watch and steer an AI assistant: what it is doing, what is waiting, and why',
      'a chat where a person has to approve risky steps before the agent goes ahead',
      'an internal tool for a support, ops or content team that works alongside an agent',
    ],
    headsUp:
      'The agent is a script. Every reply, task and reasoning step is pre-written and no AI model is called. You can send a message, approve or reject, pause, stop and retry, but those only change what the screen shows, and nothing leaves your browser. The Export transcript button saves nothing. You get the screens, not the agent. Your AI can help you connect yours.',
    notFor: "if you want a plain chat window for your customers or a native mobile app. (This is a screen for the people running an agent.)",
    examples: [/* from Step 4 */],
  },
```

Add a comment above the entry only if something differs from monitoring's pattern (it should not). The existing comment block above `TEMPLATE_CONTENT` about verbatim examples already covers this entry.

- [ ] **Step 6: Write the Code tab entry** in `src/content/codeTabs.json`. Principles must be true and each excerpt copied **verbatim** from the merged package (open the file, copy the lines, keep indentation, one array entry per line). Planned principles and sources:

| Name | Detail (short) | File | What to excerpt |
|---|---|---|---|
| Single source of truth | Every limit lives in one file. | `src/data/limits.ts` | `CONTEXT_WINDOW_TOKENS` through the `contextLevel` function |
| DRY | Each tone's color is defined once. | `src/App.css` | the `.tone-success` and `.tone-warning` rules |
| State in hooks | The only timer lives in one hook. | `src/data/useSimulatedAgent.ts` | the `useEffect` with `setInterval` |
| No inline styles | Styling is in CSS, and a test enforces it. | `src/noInlineStyles.test.ts` | the `visit` function |
| Typed and exhaustive | A status without a look fails to compile. | `src/theme/tones.ts` | the `STATUS_VIEW` record head |
| Scripts as data | Add a behavior by adding a scenario. | `src/data/scenarios.ts` | the `SUMMARY` scenario |
| Tested | Tests sit next to the code they cover. | `src/data/simulation.test.ts` | one `it` from the engine tests |

Folders (each must exist): `src/pages` ("One component per page."), `src/components` ("Panels, lists and the composer."), `src/data` ("The engine, the scripts, the data hook. Your agent goes here."), `src/router` ("Hash routing."), `src/theme` ("The accent override and tones."), `src/hooks` ("Reduced-motion preference."), `src/utils` ("Formatting helpers."), `src/icons` ("Inline SVG icons.").

- [ ] **Step 7: Take the screenshot.** Run `pnpm --filter agent-panel-template dev` (or the built preview), open `#/console` at 1440px wide, click "Refund an order", Send, and capture when the status is **Waiting for approval** (the frame then shows the approval card, a populated trace, a running task and the violet theme at once). Save it as `packages/site/public/screenshots/agent-panel.png` (about 1440x900; monitoring's is 76 KB; keep it under about 200 KB). Use the browser tooling available in your session; if none is, leave the file for the owner and say so in the PR (the Step 1 test will fail until it exists, so do not merge).

- [ ] **Step 8: Run the checks**

Run (`packages/site`): `npx vitest run` (expected all PASS), `pnpm run build` (expected clean). From the repo root: `npm run check:code-tab` (expected `code tab OK (2 templates checked)`). `npm run check:templates-readme` will FAIL until Task 16 adds the README row; that is expected here.

- [ ] **Step 9: Commit**

```bash
git add packages/site
git commit -m "feat(site): publish the Agent Control Panel: entry, copy, Code tab and screenshot" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 16: Wire the build and the README

Make the live preview exist locally and in production, and keep the README table honest.

**Files:**
- Modify: `packages/site/scripts/sync-template-builds.mjs`, `.github/workflows/deploy.yml`, `README.md` (repo root)

- [ ] **Step 1: Sync script.** In `packages/site/scripts/sync-template-builds.mjs` change:

```js
const TEMPLATE_BUILDS = [
  { slug: 'monitoring', pnpmFilter: 'monitoring-template' },
  { slug: 'agent-panel', pnpmFilter: 'agent-panel-template' },
];
```

(Keep one object per line; Task 17's check parses this list.)

- [ ] **Step 2: Deploy workflow.** In `.github/workflows/deploy.yml`, add a step directly after "Build monitoring template":

```yaml
      - name: Build agent-panel template
        run: pnpm --filter agent-panel-template run build
```

and extend the combine step:

```yaml
      - name: Combine template builds into site/dist/live/*
        run: |
          set -e
          mkdir -p packages/site/dist/live/monitoring
          cp -r packages/monitoring/dist/. packages/site/dist/live/monitoring/
          mkdir -p packages/site/dist/live/agent-panel
          cp -r packages/agent-panel/dist/. packages/site/dist/live/agent-panel/
```

- [ ] **Step 3: README row.** In the root `README.md` `## Templates` table add, below monitoring's row:

```
| [Agent Control Panel](packages/agent-panel) | A conversation, task queue, live status and reasoning trace for an AI assistant, with a human approval step. |
```

- [ ] **Step 4: Verify everything the integration touches**

Run from the repo root: `pnpm install --frozen-lockfile` (expected: succeeds; the lockfile already has the importer from PR A), `npm run test:scripts`, `npm run check:templates-readme`, `npm run check:code-tab`, `npm run check:license`, `npm run check:process-excerpts` (all expected to pass); then `pnpm --filter cyberui-templates-site run sync-templates` (expected: builds both templates and copies them to `packages/site/public/live/<slug>/`) and `pnpm --filter cyberui-templates-site run dev`; open `#/templates`: both sections render; the agent-panel screenshot and the "Run the live demo" dialog work and the preview runs inside the iframe; the Code tab shows the principles and folder tree; Copy start prompt copies a prompt that names `packages/agent-panel`. Home says "2 templates ready."

- [ ] **Step 5: Commit**

```bash
git add packages/site/scripts .github/workflows/deploy.yml README.md
git commit -m "ci: build and deploy the agent panel; list it in the README" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 17: Drift check for the build lists

Three hand-kept lists must agree for a template to reach production: `TEMPLATES`, `TEMPLATE_BUILDS` in the sync script, and the steps in `deploy.yml`. Only the README has a check today. This one fails CI when a published template is missing from the others. The owner confirmed this task stays (spec Q6).

**Files:**
- Create: `scripts/check-template-builds.mjs`, `scripts/check-template-builds.test.mjs`
- Modify: `package.json` (repo root), `.github/workflows/checks.yml`

**Interfaces:**
- Produces: `parseBuilds(syncSource): { slug: string; pnpmFilter: string }[]`, `checkBuilds({ slugs, builds, workflow, packageNames }): string[]` (one problem per mismatch; empty when fine).

- [ ] **Step 1: Write the failing test**

```js
// scripts/check-template-builds.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseBuilds, checkBuilds } from './check-template-builds.mjs';

const SYNC = `
const TEMPLATE_BUILDS = [
  { slug: 'monitoring', pnpmFilter: 'monitoring-template' },
  { slug: 'agent-panel', pnpmFilter: 'agent-panel-template' },
];`;

const WORKFLOW = `
      - run: pnpm --filter monitoring-template run build
      - run: pnpm --filter agent-panel-template run build
      - run: |
          mkdir -p packages/site/dist/live/monitoring
          cp -r packages/monitoring/dist/. packages/site/dist/live/monitoring/
          mkdir -p packages/site/dist/live/agent-panel
          cp -r packages/agent-panel/dist/. packages/site/dist/live/agent-panel/
`;

const good = {
  slugs: ['monitoring', 'agent-panel'],
  builds: parseBuilds(SYNC),
  workflow: WORKFLOW,
  packageNames: { monitoring: 'monitoring-template', 'agent-panel': 'agent-panel-template' },
};

test('parses the sync script list', () => {
  assert.deepEqual(parseBuilds(SYNC), [
    { slug: 'monitoring', pnpmFilter: 'monitoring-template' },
    { slug: 'agent-panel', pnpmFilter: 'agent-panel-template' },
  ]);
});

test('throws when it cannot find the list, instead of passing silently', () => {
  assert.throws(() => parseBuilds('const x = 1;'), /TEMPLATE_BUILDS/);
});

test('passes when the three lists agree', () => {
  assert.deepEqual(checkBuilds(good), []);
});

test('reports a published template missing from the sync script', () => {
  const problems = checkBuilds({ ...good, builds: good.builds.filter((b) => b.slug !== 'agent-panel') });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /agent-panel.*sync-template-builds/);
});

test('reports a template missing its build step or its copy into live/ in deploy.yml', () => {
  const noBuild = checkBuilds({ ...good, workflow: WORKFLOW.replace('pnpm --filter agent-panel-template run build', '') });
  assert.match(noBuild.join('\n'), /deploy\.yml.*agent-panel-template/);
  const noCopy = checkBuilds({ ...good, workflow: WORKFLOW.replace('cp -r packages/agent-panel/dist/. packages/site/dist/live/agent-panel/', '') });
  assert.match(noCopy.join('\n'), /deploy\.yml.*live\/agent-panel/);
});

test('reports a pnpm filter that is not the package.json name', () => {
  const problems = checkBuilds({ ...good, packageNames: { ...good.packageNames, 'agent-panel': 'something-else' } });
  assert.match(problems.join('\n'), /pnpmFilter.*something-else/);
});

test('reports an entry in the sync script for a template the site does not publish', () => {
  const problems = checkBuilds({ ...good, slugs: ['monitoring'] });
  assert.match(problems.join('\n'), /agent-panel.*does not publish/);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test scripts/check-template-builds.test.mjs`
Expected: FAIL, cannot import the module.

- [ ] **Step 3: Write the script**

```js
#!/usr/bin/env node
// Verifies that every template the site publishes (packages/site/src/data/
// templates.ts) is actually built and copied into the deployed site: it must be
// in TEMPLATE_BUILDS (packages/site/scripts/sync-template-builds.mjs, used for
// local dev) and in .github/workflows/deploy.yml (build step and copy into
// site/dist/live/<slug>/), and the pnpm filter it names must be the package's
// real name. Without this, forgetting the deploy step leaves the live preview
// blank in production while every other check stays green.
//
// Lives at the repo root, not in packages/site, so the site package stays
// self-contained, and uses only Node built-ins so CI needs no install. It reads
// the workflow as text: it looks for the build command and the copy
// destination, so reformatting the YAML is fine, renaming those is not.
//
// When it fails: add the missing line the message names.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseTemplates } from './check-templates-readme.mjs';

/** @param {string} source contents of sync-template-builds.mjs */
export function parseBuilds(source) {
  const list = source.match(/TEMPLATE_BUILDS\s*=\s*\[([\s\S]*?)\];/);
  if (!list) throw new Error('Could not find TEMPLATE_BUILDS in sync-template-builds.mjs. Did it move or get renamed?');
  return [...list[1].matchAll(/slug:\s*'([^']+)'\s*,\s*pnpmFilter:\s*'([^']+)'/g)].map((m) => ({ slug: m[1], pnpmFilter: m[2] }));
}

/**
 * @param {{ slugs: string[], builds: {slug: string, pnpmFilter: string}[], workflow: string, packageNames: Record<string, string> }} input
 * @returns {string[]} one problem per mismatch; empty when all is well
 */
export function checkBuilds({ slugs, builds, workflow, packageNames }) {
  const problems = [];
  for (const slug of slugs) {
    const build = builds.find((candidate) => candidate.slug === slug);
    if (!build) {
      problems.push(`"${slug}" is published by the site but missing from TEMPLATE_BUILDS in packages/site/scripts/sync-template-builds.mjs.`);
      continue;
    }
    const name = packageNames[slug];
    if (name !== build.pnpmFilter) {
      problems.push(`TEMPLATE_BUILDS names pnpmFilter "${build.pnpmFilter}" for "${slug}", but packages/${slug}/package.json is named "${name}".`);
    }
    if (!workflow.includes(`pnpm --filter ${build.pnpmFilter} run build`)) {
      problems.push(`.github/workflows/deploy.yml has no build step for "${slug}" (expected \`pnpm --filter ${build.pnpmFilter} run build\`).`);
    }
    if (!workflow.includes(`packages/${slug}/dist/. packages/site/dist/live/${slug}/`)) {
      problems.push(`.github/workflows/deploy.yml does not copy packages/${slug}/dist into site/dist/live/${slug}/.`);
    }
  }
  for (const build of builds) {
    if (!slugs.includes(build.slug)) {
      problems.push(`TEMPLATE_BUILDS lists "${build.slug}" but the site does not publish it (src/data/templates.ts).`);
    }
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const read = (...parts) => readFileSync(path.join(repoRoot, ...parts), 'utf8');
  const slugs = parseTemplates(read('packages', 'site', 'src', 'data', 'templates.ts')).map((t) => t.slug);
  const builds = parseBuilds(read('packages', 'site', 'scripts', 'sync-template-builds.mjs'));
  const packageNames = Object.fromEntries(slugs.map((slug) => [slug, JSON.parse(read('packages', slug, 'package.json')).name]));
  const problems = checkBuilds({ slugs, builds, workflow: read('.github', 'workflows', 'deploy.yml'), packageNames });
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(`template builds OK (${slugs.length} template${slugs.length === 1 ? '' : 's'} checked)`);
}
```

- [ ] **Step 4: Wire it into the root scripts and CI**

In the root `package.json` add `"check:template-builds": "node scripts/check-template-builds.mjs"` and append `scripts/check-template-builds.test.mjs` to the `test:scripts` command. In `.github/workflows/checks.yml` extend the header comment ("…and the deploy build lists must cover every published template"; #28 already added the `license` sentence, so this is the next one) and add a job after `license` (the fifth), modelled exactly on the `code-tab` and `license` jobs:

```yaml
  template-builds:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: node --test scripts/check-template-builds.test.mjs

      - run: node scripts/check-template-builds.mjs
```

- [ ] **Step 5: Run it, and prove it can fail**

Run: `node --test scripts/check-template-builds.test.mjs` (PASS), `node scripts/check-template-builds.mjs` (expected `template builds OK (2 templates checked)`). Then temporarily delete the `agent-panel` copy line from `deploy.yml`, run it again (expected exit 1 naming the missing copy), and restore the line. Do not commit the broken state.

- [ ] **Step 6: Commit**

```bash
git add scripts package.json .github/workflows/checks.yml
git commit -m "ci: fail when a published template is not built or copied into the deployed site" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 18: Look at the published page, then verify everything

**Files:** none (fixes go in the file they belong to, each its own commit).

- [ ] **Step 1: Run the whole suite and the production builds**

Run: `pnpm -r run build` and `pnpm -r run test` (monitoring, agent-panel and the site; expected all PASS), then from the repo root `npm run test:scripts` and the five checks (`check:process-excerpts`, `check:templates-readme`, `check:code-tab`, `check:license`, `check:template-builds`).
Expected: all PASS. Note for the PR: CI does not run the package tests (decided out of scope, spec Q2; tracked in #35); these were run locally.

- [ ] **Step 2: Start the site with both real builds**

Run: `pnpm --filter cyberui-templates-site run sync-templates` then `pnpm --filter cyberui-templates-site run dev`; open `#/templates`.

- [ ] **Step 3: Check each item and fix what fails**

Desktop (about 1440px):
- [ ] Two sections in order (monitoring, then agent-panel), one h1 "Templates"; each hero shows its own accent (cyan, violet) only on its badge, "Run the live demo" and Copy start prompt; no violet or cyan leaks into the folds, the Heads-up or the dialog chrome.
- [ ] The agent-panel screenshot shows the approval state and its frame has the dark bottom gradient and the visible "Run the live demo" button.
- [ ] The dialog opens at `#/templates/agent-panel`, the violet console runs inside, the Code tab shows seven principles with excerpts and the folder tree, tabs switch without reloading the preview.
- [ ] The Heads-up reads "The agent is a script…" and is not easy to skim past (the spec 2026-10-05 §5 "revisit" item; note the finding).
- [ ] Esc, the close button and a backdrop click close the dialog; Back closes it and stays on Templates; reloading with the dialog open reopens it.
- [ ] Inside the running preview, pressing Esc closes the dialog (the site's forwarding); the template has no Esc behavior of its own to conflict.
- [ ] Copy start prompt puts a prompt naming `packages/agent-panel` on the clipboard; the terminal fold shows `npx tiged patrickkuei/cyberui-templates/packages/agent-panel my-app`.
- [ ] Home says "2 templates ready." and does not list templates by name.

Phone (390px): no sideways scroll on `/templates`; the dialog is full-screen; the template inside shows its pane tabs and every pane works.

Reduced motion: dialog appears with no fade; inside the preview, replies appear whole.

- [ ] **Step 4: Record what you found** in a short "Findings from checking the published page" list at the end of the spec, stating plainly what was not checked (for example the real production deploy, which only happens after merge, and `npx tiged …/packages/agent-panel` against the published repo).

- [ ] **Step 5: Commit, push, open PR B**

```bash
git add docs/superpowers/specs/2026-10-06-agent-panel-design.md
git commit -m "docs: record findings from checking the published Agent Control Panel" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git push -u origin feat/site-agent-panel
gh pr create --base main --title "feat(site): publish the Agent Control Panel template" --body "<summary; what was and was not checked; Closes #9>"
```

The PR body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. Do not merge.

---

## Self-review notes

- **Spec coverage:** §1 goal (all tasks). §3 experience: routes (3, 13), console layout and panes (13), interactions 1-6 (5, 6, 11, 13), honesty (8 header badge, 11 helper line, 12 mock export, 14 README, 15 Heads-up; asserted in tests), accessibility and reduced motion (7, 11, 13, 14). §4 theming (2, checked in 14). §5 data: model and scenarios (4), engine (5, 6), hook (7), Logs fixtures (12), README "where your data goes" (14). §6 structure and patterns (1-13; `ROUTES`/`Record<Route,…>` in 3 and 13, limits in 4, tones in 2 and 8-12, state in hooks in 7, no inline styles in 13). §7 components: `Avatar` (8), `Badge` (8, 10, 12), `Timeline` (9), `LinearProgress` (8, 10), `Table` (10, 12), `Pagination` (12), `Input` (11, 12), `Button` (8, 11, 12), `TabNavigation` (12, 13), `Card` (8, 9, 10, 13). §8 testing (every task; `within` in 8, 10, 13). §9 self-containment and license (1, 14). §10 integration points (15, 16, 17). §11 copy (15). §12 verification (14, 18).
- **Not covered, by design:** the CI test job for packages (Q2; tracked in #35); the license sweep and its drift check (done by #28 / PR #31, which `check:license` now enforces); a real Export transcript (Q5); a library chat component; editing issue #9's wording.
- **Types and names used consistently across tasks:** `AgentState`, `AgentStatus`, `Run`, `Step`, `Scenario`, `AgentActions`, `AgentController`, `STATUS_VIEW`, `CONTEXT_TONE`, `TRACE_STATUS`, `TRACE_KIND_LABEL`, `TASK_BADGE`, `OUTCOME_BADGE`, `TONE_CLASS`, `ROUTES`/`Route`; engine function names as in Tasks 5 and 6; panel names ("Task queue", "Conversation", "Live status", "Reasoning trace") are the `aria-label`s the tests scope with.
- **Known soft spots a reviewer should look at first:** the context-meter tint (the library's `LinearProgress` takes no colour prop; Task 8 says what to do if the bar cannot be tinted), the screen-reader behavior of the streaming reply (Task 14), and the primary-magenta-beside-violet judgment (Q3).
