# Agent Control Panel Template (`packages/agent-panel`) — Design Spec

**Date:** 2026-10-06
**Status:** Approved by the owner on 2026-10-06. It was drafted without interactive review, so its judgment calls are listed under "Decisions I made, and the owner's answers to the open questions"; the owner has since answered every open question (recorded there).
**Issue:** [#9](https://github.com/patrickkuei/cyberui-templates/issues/9) (second flagship template); tracking issue [#1](https://github.com/patrickkuei/cyberui-templates/issues/1).
**Builds on:** [2026-09-27-cyberui-showcase-design.md](2026-09-27-cyberui-showcase-design.md) (self-contained packages, accent-hue theming, one combined deploy), [2026-10-05-templates-page-design.md](2026-10-05-templates-page-design.md) (the `/templates` page every template is published through, including the Code tab) and the `packages/monitoring` template, which this one follows structurally.
**Plan:** [docs/superpowers/plans/2026-10-06-agent-panel.md](../plans/2026-10-06-agent-panel.md).

> **Vocabulary note.** Issue #9 was written before the repo was restructured and uses stale names: `packages/showcase`, `/gallery/agent-panel`, `patrickkuei/cyberui-showcase`. Today `packages/site` is the website, templates live in `packages/<name>`, the site page is the hash route `#/templates` (a live-preview dialog, folded examples, a one-step start), and the repo is `patrickkuei/cyberui-templates`. This spec uses the current names throughout. Nothing in issue #9 needs a "gallery page"; publishing means adding data to the site (§10).

## Decisions I made, and the owner's answers to the open questions

Decisions (each is cheap to reverse; the section that carries the reasoning is in brackets):

1. **Name, slug, fiction.** Package folder and slug `agent-panel`; pnpm package name `agent-panel-template` (mirrors `monitoring-template`); site name "Agent Control Panel". The fictional assistant is "Vesper", working for no real company; no real brand appears. [§3]
2. **No model is ever called.** The agent is a script: three scripted scenarios (refund an order, summarise support tickets, draft release notes) plus a fallback. A chat box that looks live is the single easiest thing in this template to mistake for real, so beyond the README the app itself carries a persistent "Simulated" badge and a line under the message box. [§3.4, §5]
3. **Three hash routes, one of them the star.** `console` (default; the live three-pane workspace), `tasks` (full queue), `logs` (past sessions). Same `ROUTES` tuple pattern as monitoring. [§3.1, §6]
4. **Violet is `#c084fc`, overriding `--color-secondary` and `--color-accent` together, in one file** (`src/theme/violet.css`). `--color-primary` (the magenta) is left alone. Monitoring has no override at all (its cyan is the library default); this is the first template to override tokens, as its plan anticipated. The override targets the same two tokens the site already scopes per template (`accentHex`), so the template and the site's hero agree. The hex was picked to clear 4.5:1 text contrast on both `--color-base` and `--color-surface` (about 6.5:1 and 5.2:1 by hand calculation, not measured). [§4]
5. **No chart library.** Everything is lists, a timeline, meters and a table, all from cyberui-2045. The package has no `recharts`, so it is smaller to install and has no `ResponsiveContainer` test workaround. [§7]
6. **The engine is pure and uses no randomness at all.** Monitoring's simulation takes an `rng`; this one is deterministic (ids come from a counter, durations are fixed ticks), so tests need no seeding and a demo behaves the same every time. The cost is that nothing "organic" happens on its own; the queue still moves, and the human-approval step supplies the drama. [§5.3]
7. **One run at a time.** The composer is disabled while a run is active, while the agent is paused and when the context window is full, and says why. Tasks run in a pool of three (two seeded background tasks leave a slot free, so a task the agent creates starts at once), and created-by-agent tasks outrank the seeded background work. This keeps the engine small and the screen explainable. [§5.3]
8. **Real-in-the-simulation vs mock.** Send, approve/reject, pause/resume, stop run, cancel/retry task, reset, search, filter and paging all really change the in-browser simulation. Only **Export transcript** (Logs) is a pure mock; the past sessions on Logs are fixed fixtures and their rows do not open. Both groups are listed in the README and in the site's Heads-up. [§3.4]
9. **Reduced motion turns streaming off.** Replies normally type in; under `prefers-reduced-motion` they appear whole (the engine takes `charsPerTick`, the app passes `Infinity`). [§5.4]
10. **The site's two example cases are not written here.** The Templates page's examples are verbatim subagent role-plays (spec 2026-10-05 §2, §4). The plan has a task that runs two new interviews and records the replies truncated, never reworded. If that cannot be done at implementation time the task stops and asks; it does not invent them. [§11]
11. **The plan ships in two pull requests.** PR A is the package (`feat/agent-panel-template`); PR B is the site, CI and README wiring (`feat/site-agent-panel`), because the Code tab's excerpts must exist in the package before CI will accept the site entry. [Plan, Conventions]
12. **One extra CI check (plan Task 17; the owner confirmed it stays).** Today three hand-kept lists must agree for a template to reach production: `TEMPLATES` in the site, `TEMPLATE_BUILDS` in the sync script and the build/copy steps in `deploy.yml`. Only the README table has a drift check. Forgetting the deploy step leaves the live preview blank in production and nothing in CI notices. [§10]

Open questions, answered by the owner on 2026-10-06 (the Q numbers are referenced elsewhere in this spec and in the plan):

- **Q1. License (issue #28) and ordering.** Decided: #28 (PR #31) merges first, and has. Task 1 copies its pattern (a `LICENSE` file identical to the root one, and `"license": "MIT"` in `package.json`), and still adds both itself if #28 somehow has not landed. `scripts/check-license.mjs` (`npm run check:license`) finds template packages through `TEMPLATES` in the site, so it checks `packages/agent-panel` automatically once PR B registers it.
- **Q2. Template tests do not run in CI.** Decided: out of scope for this template. `checks.yml` runs only the root scripts and `deploy.yml` only builds, so no package's tests run in CI. This is tracked in its own issue, #35 (a `pnpm -r test` job). This package's tests run locally, and the PR says so.
- **Q3. Magenta primary beside violet.** Decided: keep it, and do not override `--color-primary`; the repo varies only the accent hue. If the browser check (plan Task 14) shows a clash, make the Send button `secondary`.
- **Q4. Name.** Decided: keep "Vesper" and "Agent Control Panel".
- **Q5. Export transcript.** Decided: stays a mock, matching monitoring's mock Export CSV. A real download is a possible follow-up.
- **Q6. Default route, drift check and closing #9.** Decided: `console` stays the default route. Plan Task 17 (the deploy-lists drift check) stays. PR B says `Closes #9`.

## 1. Goal

Ship the second flagship template: a self-contained **control panel for an AI assistant**, in violet, that shows what a person running an agent needs to see and do: the conversation, a queue of the work the agent has taken on, what it is doing right now, and why it did what it did. It is more interactive than the monitoring dashboard on purpose (issue #9: "a more interactive, novel UI pattern"): the person can talk to the agent, and the agent stops and asks for approval before a risky step.

Success, in the repo's terms (spec 2026-10-05 §1):
1. A visitor can tell within one preview whether this is the shape of thing they want to build (an operator console for an agent), and what is fake in it.
2. A forker gets a package that runs after `npx tiged … my-app && cd my-app && npm install && npm run dev` with no other setup, and whose code reads as a pattern to copy.
3. The package follows the same path to publication as monitoring and adds no new mechanism to the site.

**Not in scope:** a real agent, any network call, persistence, authentication, multi-session conversation switching, a markdown renderer for agent replies, a light theme, a landing/mobile/social template (their own issues), any change to the cyberui-2045 library.

## 2. What the template is for

A person who builds with an AI assistant and now needs a screen for operating the agent they built: a support-team lead with an agent drafting replies, an ops engineer with an agent running chores, a founder who wants to see and approve what their assistant does. The template should answer "what would the operator's screen for my agent look like?" with a working example, not a component inventory.

The core idea the layout carries is **human in the loop**: the agent works, narrates its reasoning, shows its queue, and asks before doing anything that moves money or posts publicly.

## 3. The experience

### 3.1 Routes

| Route | Page | What it is |
|---|---|---|
| `console` (default) | `ConsolePage` | The live workspace: queue, conversation, live status, reasoning trace, side by side. |
| `tasks` | `TasksPage` | The whole task queue as a table, with a filter and per-row Cancel/Retry. |
| `logs` | `LogsPage` | Past sessions: searchable, filterable, paged. Static fixtures. |

Routing is `window.location.hash` (`#/console`, `#/tasks`, `#/logs`), as in monitoring, so it works on GitHub Pages and inside the site's preview iframe without server config. An unknown hash falls back to `console`.

### 3.2 Console layout

Desktop (1180px and up), three columns:

```
 ⬡ Vesper   Console  Tasks  Logs                              ● Waiting for approval   (nav)
 ┌─────────────────────────────────────────────────────────────────────────────────────┐
 │ (V)● Vesper  [Simulated]  Waiting for approval        [ Pause ] [ Stop run ] [ Reset ]│  header
 ├──────────────┬────────────────────────────────────────┬─────────────────────────────┤
 │ Task queue   │ Conversation                           │ Live status                 │
 │              │                                        │  ● Waiting for approval     │
 │ ● Index      │  you   Please refund order #4821…      │  Asking you before going on │
 │   refresh    │  ───                                   │  Context  ▓▓▓░░░░ 17%       │
 │   ▓▓░░ 25%   │  Vesper  (selected → its trace shows)  │  Tool calls 5 · Tasks 1+1   │
 │ ○ Weekly     │  ┌ Approval needed ────────────────┐   ├─────────────────────────────┤
 │   digest     │  │ Refund $42.00 for order #4821?  │   │ Reasoning trace             │
 │ ✕ Sync CRM   │  │ [ Approve ]   [ Reject ]        │   │ ◆ Plan the refund           │
 │   [ Retry ]  │  └─────────────────────────────────┘   │ ◆ orders.lookup(order #4821)│
 │              │ [ Message Vesper…            ] [ Send ]│ ◆ Order #4821, $42.00 …     │
 │              │  Scripted demo: replies are pre-written│ ◇ Waiting for your approval │
 └──────────────┴────────────────────────────────────────┴─────────────────────────────┘
```

Below 1180px the grid becomes two columns (conversation wide; queue and the right column stacked). Below 720px only one pane shows at a time, chosen with a `TabNavigation` ("Conversation", "Tasks", "Trace"); the status header stays. The tab bar is hidden at desktop widths by CSS, and all panes are always in the DOM (tests do not evaluate media queries).

Each panel is a `<section aria-label="…">` ("Task queue", "Conversation", "Live status", "Reasoning trace") so it is a named landmark; this is also what the tests scope with `within(...)` (§8).

### 3.3 The interactions

1. **Send a message** (Enter or the Send button). Three suggested-prompt chips above the composer fill it with a message that is guaranteed to match a scenario; typing anything else usually hits the fallback reply, which says so honestly ("This is a scripted demo, so I only know three things…").
2. **Watch the run.** The agent works through the scenario: a *thought*, a *tool call* and its *observation* appear in the reasoning trace as they happen, a task may appear in the queue and fill, and the reply streams into the conversation a few characters at a time. The Live status badge moves between Thinking, Working, Waiting and Idle.
3. **Approve or reject** (refund and release-notes scenarios). The run parks on an inline "Approval needed" card; the status says Waiting; the trace gets a waiting entry. Approve and Reject both continue the run along different scripted branches, each recorded in the trace as "Approved by you" / "Rejected by you".
4. **Inspect a past answer.** Clicking an agent message (it is a real button, keyboard reachable) selects its run; the reasoning trace then shows that run's steps and says so ("Showing the run for this message", with a "Back to latest" control; clicking the same message again does the same, since it is a toggle). Sending a new message returns to following the latest run.
5. **Steer the agent.** Pause freezes everything (the engine's `tick` does nothing while paused; the status says Paused). Stop run ends the active run, cutting a half-streamed reply off where it is. Reset restarts the whole simulation from its first state (also the only way out of a full context window). Cancel on a queued or running task; Retry on a failed or cancelled one (the seeded failed "Sync CRM contacts" is there to show it).
6. **Context window.** The Live status meter fills as the conversation grows (made-up token counts). It turns warning-coloured at 70% and error-coloured at 90%, at which point the composer is disabled with "Context full. Reset to start again." Because the thresholds live in `src/data/limits.ts`, the engine, the meter and the composer cannot disagree.

### 3.4 What is simulated, and how the app says so

Per `CLAUDE.md` and `packages/monitoring/README.md`, anything not real says so where a forker would otherwise think it is live.

- **Everything the agent does is a script.** No model, no network, no persistence. The reasoning trace is pre-written illustration of the *shape* of an agent's trace, not a model's real chain of thought; its panel is titled "Reasoning trace (scripted)".
- **In the app:** a "Simulated" `Badge` beside the agent's name (always visible, including in the Code tab's preview), and a helper line under the message box: "Scripted demo: replies are pre-written. Nothing is sent to a model or leaves your browser." The Tasks and Logs pages carry a one-line note in the page header ("Simulated tasks" / "Sample sessions").
- **Real inside the simulation** (they change the in-browser state, nothing else): Send, Approve, Reject, Pause/Resume, Stop run, Reset, Cancel task, Retry task, selecting a message, the Logs search/filter/paging, the Tasks filter.
- **Pure mock** (they change a label and nothing else): **Export transcript** on the Logs page ("Exported" appears; nothing is saved or sent). The sessions on Logs are fixed fixtures; their rows do not open.
- **README** carries the same two lists in the first paragraph, like monitoring's.
- **The site's Heads-up** (§11) states the same, in plain words.

### 3.5 Accessibility and motion

- The message list is `aria-live="polite"` with `aria-relevant="additions"`, and a streaming reply is a single growing text node, so a screen reader should announce it as one addition rather than character by character. That is a guess about screen-reader behavior (unchecked, §12); the fallback is to keep the list silent and announce only when a reply completes.
- The approval card is a `role="group"` labelled by its prompt; focus moves to the Approve button when it appears.
- Every control is a real `button`/`input`; focus rings are visible (monitoring's `:focus-visible` rules are the model).
- `prefers-reduced-motion`: no typewriter streaming (replies appear whole), the status dot's pulse is off, no transitions on the pane switch.
- Colour is never the only carrier: every status has a text label (the badge says "Waiting", the task row says "failed").

## 4. Theming: violet

**How monitoring does its accent.** It does not override anything: its cyan is cyberui-2045's default `--color-secondary` (`#00fff9`), and its plan states that "the override file is introduced later for the violet agent-panel demo". Its `App.css` only *reads* tokens (`var(--color-secondary)` for the nav rule, `var(--color-accent)` for the card-title rule). The site's per-template accent (`accentHex`) is a *display* value that the site scopes onto its own hero and Copy button; it is not read from the template.

**How this template does it.** One small stylesheet, imported once in `main.tsx` right after the library's:

```css
/* src/theme/violet.css */
:root {
  --color-secondary: #c084fc;
  --color-accent: #c084fc;
}
```

```tsx
// src/main.tsx
import 'cyberui-2045/styles.css';
import './theme/violet.css';
```

Why this works, checked in the installed v2.6.0 build (`dist/cyberui-2045.css`): the library declares every colour as a custom property inside `@layer theme { :root, :host { … } }`, and its components read them (`border-secondary` is `border-color: var(--color-secondary)`, and the `/20`-style opacity variants are `color-mix(in oklab, var(--color-secondary) 20%, transparent)`). An unlayered `:root` rule beats a layered one regardless of source order, and import order is belt-and-braces. Components pick the new hue up with no further change.

What to know, all from the same build:
- `--color-secondary` and `--color-accent` are overridden *together*. In cyan-themed monitoring, secondary is the text/active colour and accent is the card-title rule; the site scopes both to the same hex for the same reason. Overriding only one would leave a yellow card-title rule in a violet panel.
- `--color-primary` (magenta, `#ff005d`) is left alone (decided, Q3); if the browser check shows a clash, Send becomes a `secondary` button instead.
- Browsers without `color-mix` fall back to the library's own hard-coded cyan hex for the `/NN` opacity variants (`#00fff933` and friends). That is a library limitation affecting only old browsers and is not worked around.
- Cyberui's `Card` sets `text-primary`, i.e. magenta body text, by default. Monitoring resets text colour on its layout root (`.dashboard { color: var(--color-default) }`); this template does the same on `.agent-panel` and then colours individual pieces through the shared tone classes (§6.2). A forker adding a new `Card` should expect to need the same reset.
- The override has to be a *token* override, not hard-coded violet hex values in component CSS: components must keep reading `var(--color-secondary)`, so a forker changes their accent by editing the one file. A test (§8) fails if `src/**/*.css` other than `violet.css` contains a hex colour literal.

The violet file's comment says all this in forker's terms: what the two tokens do, why `primary` is left, that it must be imported after the library stylesheet, and "change these two values to re-theme".

## 5. Data model and mock-data strategy

### 5.1 State is one plain object

`AgentState` (in `src/data/types.ts`) is a flat, serialisable record, so replacing the simulation with a real backend is replacing where it comes from, not how screens read it. Fields: `messages`, `trace`, `tasks`, `runs`, `paused`, `contextTokens`, `toolCalls`, `startedAt`, `nextId`.

- `Message { id, role: 'user'|'agent', text, revealed, runId?, at }`. Agent messages stream: only `text.slice(0, revealed)` is shown. A seeded message is already fully revealed.
- `TraceStep { id, runId, kind: 'thought'|'tool'|'observation'|'approval'|'decision', title, detail?, outcome: 'ok'|'error'|'pending'|'waiting', at }`.
- `Task { id, title, status: 'queued'|'running'|'done'|'failed'|'cancelled', priority: 'low'|'normal'|'high', ticksDone, ticksTotal, runId?, error?, createdAt }`. **Progress is derived** (`taskProgress`), never stored a second time.
- `Run { id, scenarioId, remaining: Step[], current, approval, ended }`: the bookkeeping of one scripted run. `remaining` is plain data; an approval's chosen branch is spliced onto the front of it.
- `AgentStatus = 'idle'|'thinking'|'working'|'waiting'|'paused'` is **derived** (`deriveStatus(state)`), not stored, so it cannot disagree with the run it describes.

### 5.2 Scenarios are data

`src/data/scenarios.ts` holds a `Scenario { id, keywords, steps }` per scripted behaviour, where a `Step` is one of `think`, `tool` (optionally `failFirst`, which makes the first attempt fail and the engine retry once), `task`, `approval` (with `approve` and `reject` branches that are themselves `Step[]`) and `reply`. Adding a behaviour to the demo means adding a scenario, with no engine change; the engine knows nothing about refunds. `matchScenario(text)` picks the first scenario with a keyword in the (lower-cased) message, else the fallback. A test enforces the rules that keep a run from hanging: every path ends in a `reply`, and no keyword belongs to two scenarios.

### 5.3 The engine

`src/data/simulation.ts` is pure and has no randomness and no clock: it exports `createInitialState(now)`, the commands `sendMessage`, `resolveApproval`, `cancelRun`, `cancelTask`, `retryTask`, `setPaused`, and `tick(state, now, charsPerTick)`, plus `deriveStatus`, `activeRun` and `taskProgress`.

- **Idle ticks return the same object**, so React skips the render: the 250ms interval costs nothing when nothing is moving.
- **A step that finishes hands over to the next one in the same tick**, so the status badge does not blink back to Thinking between steps.
- **Bounded**: `MAX_MESSAGES`, `MAX_TRACE_STEPS`, `MAX_RUNS` and `MAX_FINISHED_TASKS` in `limits.ts` cap every list (the equivalent of monitoring's `MAX_ALERTS`; a tab left open overnight must not grow).
- **Worker pool**: `TASK_CONCURRENCY = 3`, queued tasks start by priority then age. The seed keeps two background tasks busy, so one slot is always free and a task the agent creates (priority `high`) starts on the next tick instead of waiting behind them.
- **A cancelled or failed task ends its run politely** (a decision trace step and a short reply) instead of hanging it.
- **First paint is not empty**: the seed has one finished exchange with a trace, and four tasks in four states (running, queued, failed, done), so every panel has something and Retry is demonstrable immediately.

The engine's first version was type-checked under strict TypeScript and run in a scratch directory against all three scenarios (approve and reject), the fallback, pause, stop-run, cancel-mid-task, `Infinity` reveal, the idle same-reference property and the caps; the code in the plan is that code. It has no tests in the repo yet; the plan's Tasks 5 and 6 add them (§12).

### 5.4 The hook

`src/data/useSimulatedAgent.ts` is the only place with a timer and the only place that calls `Date.now()`. It returns `{ state, actions }`, where `actions` (`send`, `resolveApproval`, `stopRun`, `cancelTask`, `retryTask`, `setPaused`, `reset`) are stable functions that call the pure commands through `setState(prev => …)`. It takes `{ tickMs = TICK_MS, charsPerTick = CHARS_PER_TICK }`; the app passes `Infinity` when `prefers-reduced-motion` is set.

### 5.5 Logs fixtures

`src/data/sessions.ts` exports `createSessionLogs(now)`: about 14 fixed past sessions (`{ id, title, startedAt, messageCount, toolCalls, outcome: 'resolved'|'escalated'|'abandoned', durationMin }`), with times relative to `now` so they never look stale. They are static on purpose (the README says so); this is where a fork plugs in real history.

### 5.6 "Where your data goes" (README)

Like monitoring's section of the same name: everything on screen comes from one hook call, `useSimulatedAgent` in `src/App.tsx`, flowing down as props. To connect a real agent, replace what that hook returns: `state` from your server's events or a poll (keep the `AgentState` shape, or change the type and let the compiler list what to update) and `actions` with calls to your API (`send` posts the message, `resolveApproval` posts the decision). Nothing below the hook knows the data is simulated.

## 6. Code structure and patterns to copy

```
packages/agent-panel/
├── .gitignore  index.html  package.json  tsconfig.json  vite.config.ts
├── LICENSE                          # per #28 (see §9)
├── README.md
└── src/
    ├── main.tsx  App.tsx  App.css  vite-env.d.ts
    ├── noInlineStyles.test.ts       # fails if a JSX `style` attribute appears
    ├── theme/
    │   ├── violet.css               # the accent override (§4)
    │   ├── tones.ts  tones.test.ts  # Tone → CSS class; status/outcome → tone maps
    ├── router/   useHashRoute.ts  useHashRoute.test.ts
    ├── data/
    │   ├── types.ts  limits.ts      # shapes; every threshold and cap
    │   ├── scenarios.ts             # the scripted behaviours (data)
    │   ├── simulation.ts            # the pure engine
    │   ├── useSimulatedAgent.ts     # the only timer
    │   ├── describeActivity.ts      # "Calling orders.lookup(…)" for Live status
    │   └── sessions.ts              # Logs fixtures
    ├── hooks/    usePrefersReducedMotion.ts
    ├── components/
    │   ├── AgentHeader  StatusBadge  LiveStatus  ReasoningTrace
    │   ├── ConversationPanel  MessageBubble  ApprovalCard  Composer
    │   ├── TaskList  TaskTable  TaskStatusBadge
    │   └── SessionTable
    ├── pages/    ConsolePage  TasksPage  LogsPage
    ├── icons/    index.tsx
    ├── utils/    format.ts
    └── test/     setup.ts
```

Each component, page and helper has a `.test.tsx`/`.test.ts` beside it, as in monitoring.

### 6.1 Patterns copied from monitoring (and where each must be commented for a forker)

| Pattern | Here | Comment it carries |
|---|---|---|
| `ROUTES = [...] as const` → `Route = (typeof ROUTES)[number]` | `router/useHashRoute.ts`: `['console', 'tasks', 'logs']` | Why the tuple is the one source and `Route` is derived, so adding a 4th page starts here and the compiler follows. |
| `Record<Route, …>` maps | `App.tsx`: `ROUTE_LABELS` and `pages` | Adding a route without a label or a page is a compile error, not a blank `<main>`. |
| One module for limits | `data/limits.ts` (like `thresholds.ts`) | Every number that decides behaviour or a warning, and who reads it. |
| Shared tone → class | `theme/tones.ts`: `Tone`, `TONE_CLASS: Record<Tone, string>` | Why a `Record`, not a template string: a tone without a class is a compile error. |
| Status → presentation maps | `theme/tones.ts`: `STATUS_VIEW: Record<AgentStatus, …>`, `TASK_BADGE: Record<TaskStatus, BadgeVariant>`, `TRACE_STATUS: Record<TraceOutcome, TimelineEvent['status']>`, `CONTEXT_TONE: Record<ContextLevel, Tone>`, `OUTCOME_BADGE: Record<SessionOutcome, BadgeVariant>` | Exhaustive `Record`s over the data model's unions: adding a status forces its look. These play the role `chartColors.ts` plays in monitoring, for a template without charts: components never decide a colour themselves. |
| State in hooks, components presentational | `useSimulatedAgent` is the only timer; panels take props | Why the hook returns stable `actions`. |
| No inline styles | `.tone-*`, `.status-*` classes in `App.css`; `noInlineStyles.test.ts` | The test parses syntax, so spacing and comments cannot fool it. Copied verbatim. |
| Test setup | `test/setup.ts`, a trimmed copy of monitoring's: loads jest-dom and sets `--color-primary` inline. Monitoring's chart-sizing shim (Recharts needs it) is dropped, since there are no charts | Why the token is set: cyberui-2045 warns "Stylesheet not detected" at import when it cannot read `--color-primary`, and tests load no CSS (copied comment). |

### 6.2 Patterns new to this template (and why they need a comment)

- **Pure engine plus one timer.** Documented at the top of `simulation.ts` (it is the contract a forker replaces) and in the hook.
- **Scripted scenarios as data**, with the two invariants enforced by a test.
- **Derived, not stored**: `status` and `progress`. A short comment on `AgentState` says why, since a forker's first instinct is to add a `status` field.
- **Token-override theming** (§4), in `violet.css`.
- **`aria-label`ed `<section>` panels** as both landmarks and test scopes.
- **Auto-scroll that respects the reader.** The message list sticks to the bottom only when it already was at the bottom; a person scrolled up to re-read is not yanked down by a streaming reply. Plain `overflow: auto` containers and `scrollTop`; no `scrollIntoView` (happy-dom does not provide it) and not the library's `useCyberScrollbar` (it wraps the container in its own DOM, which fights a ref we need for scroll-position logic).

## 7. cyberui-2045 components used

Checked against the installed v2.6.0 (`node_modules/cyberui-2045/dist/components/*.d.ts` and `AGENT.md`), not recalled. All 33 components exist in `dist/components/index.d.ts`; these are used:

| Need | Component | Props used / notes |
|---|---|---|
| Panel chrome | `Card` | `title`, `variant="small"`/default, `titleBorder`, `className`. Sets `text-primary` by default: reset text colour on the layout root (§4). Renders an `<h3>` only when `title` is given. |
| Agent identity and presence | `Avatar` | `alt="Vesper"`, `initials="V"`, `status="online"\|"away"\|"offline"` (mapped from `AgentStatus` by `STATUS_VIEW`), `size`. No image, so it uses the glitch-initials fallback. |
| Status and outcome labels | `Badge` | Variants `success`, `warning`, `error`, `secondary`, `accent`; `size="sm"`. The "Simulated" badge is `accent`. |
| Reasoning trace | `Timeline` | `events: { title, description?, time, status: 'success'\|'error'\|'warning'\|'info' }[]`. Library draws the diamond markers; trace kinds are mapped to those four statuses (outcome `ok` → success, `error` → error, `waiting` → warning, `pending` → info), and the *kind* is in the title text ("Thought: …") so meaning is not colour-only. |
| Queue progress | `LinearProgress` | `progress`, `size="sm"`. Fills its container; wrap to constrain. |
| Context meter | `LinearProgress` (and optionally `SegmentedProgress variant="block"`) | The `block` variant is a better "fuel gauge" look; either is fine. Tone comes from a wrapper class, since the component takes no colour prop. |
| Task and session tables | `Table` | Typed columns with `render`, `getRowId`, `variant="striped"`, `caption`/`ariaLabel`, `emptyMessage`. |
| Paging | `Pagination` | Controlled `currentPage`/`totalPages` (as monitoring's audit log does). |
| Composer and search | `Input` | `label`, `helperText` (the "Scripted demo" line), `variant`, `error`. |
| Buttons | `Button` | `primary` (Send, Approve), `secondary`/`ghost` (Pause, Reset, Cancel), `danger` (Reject, Stop run). Sized `sm` for toolbars. |
| Pane switch (phones) and Tasks filter, Logs filter | `TabNavigation` | `tabs: readonly string[]`, `activeTab`, `onTabChange`, `mode`. Tabs are labels (strings), so the active tab is stored as a label from a `as const` tuple. |
| Hints | `Tooltip` | Optional, on the context meter and the "Simulated" badge, `delay`, trigger must be focusable. |
| Loading polish | `Skeleton` | Not needed (no loading state). |

Deliberately **not** used: `Modal`/`Drawer` (nothing is modal; the approval is inline on purpose so it is part of the conversation), `Steps` (a run is not a fixed sequence of known steps), `Notification` (no toasts needed), `Carousel`, `Image`. There is **no library chat-bubble or message component**: message bubbles, the composer layout, the approval card and the task row are plain markup in `App.css` with the same token colours, which is fine per the Code tab's stance ("a plain `<button>` is fine"). If cyberui-2045 later ships a chat component, replacing `MessageBubble` is a one-file change; worth noting to the library owner, not filing from here.

Library behaviours that surprise, to document at their use sites: `Card` renders no `<h3>` without `title`; `Card` text is magenta unless reset; `Table` rows become keyboard-focusable only if `onRowClick` is given (we do not use it); `TabNavigation` takes labels, not ids; `Timeline` has no collapsed or "pending" status of its own; `Tooltip`'s child must accept `aria-describedby`.

## 8. Testing strategy

React Testing Library + Vitest + happy-dom, as in monitoring (its `vitest`/`happy-dom` versions, `globals: true`, `setupFiles`). A test file sits beside every component, page and helper; the two documented exceptions are `main.tsx` and `theme/violet.css`.

- **Engine tests (the bulk of the risk).** Pure, so no timers and no rendering: a helper `settle(state, decide)` ticks with `Infinity` until the run ends, answering approvals with a given decision. For each scenario, approve and reject paths end with `ended: 'done'` and a fully revealed reply; the failing-first tool leaves an `error` observation then an `ok` one; a run creates its task and the task finishes; idle ticks return the same reference; paused ticks return the same reference; `sendMessage` is ignored when blank, mid-run, paused, or with a full context; `resolveApproval` with the wrong id is ignored; `cancelRun` cuts a streaming reply at `revealed` and marks pending trace steps `error`; cancelling a run's task ends the run with the polite reply; `retryTask` revives a failed task; the lists respect their caps after 30 runs; `deriveStatus` covers all five statuses.
- **Scenario rules** (`scenarios.test.ts`): every scenario and branch ends in `reply`; no keyword is shared; each suggested prompt matches its intended scenario; the fallback has no keywords. A helper walks every path, so a new scenario is validated for free.
- **Hook tests** with fake timers, as monitoring's: it advances on the interval; clears its interval on unmount; an idle tick does not re-render (render counter); `charsPerTick: Infinity` reveals a reply in one tick; actions are referentially stable.
- **Tone tests**: every `TONE_CLASS` value has a rule in `App.css` (copied from monitoring); every `Record` in `tones.ts` is exhaustive over its union by type, and the test checks the values are real classes/variants.
- **Component tests** assert behavior, not markup: `Composer` (disabled states and their stated reasons, Enter submits, chips fill the box, blank is not sent), `ApprovalCard` (calls back with the right id and decision, focus lands on Approve), `ConversationPanel` (shows only `revealed` characters, selecting an agent message calls back, does not auto-scroll when scrolled up), `TaskList`/`TaskTable` (Cancel only on queued/running, Retry only on failed/cancelled, progress shown), `LiveStatus` (tone flips at 70% and 90%), `ReasoningTrace` (kind in the title, "Showing the run for this message" and Back to latest), `SessionTable` (search, filter, paging, empty state).
- **`within(...)` scoping, as the repo does every time.** The same text lands in several panels (a task title in the queue, in the trace as "Task: …" and in a `Tasks` table row; "Waiting" in the status badge, the header and the trace). This repo's rule is to scope the query with `within(...)`, never to rename text or weaken the assertion; here the scope is the named `<section>` (`within(screen.getByRole('region', { name: 'Task queue' }))`). One comment at the first collision in a test file is enough.
- **Page and App tests.** `App`: renders `console` by default; navigates between the three routes via real links; an unknown hash falls back; the document title follows the route; and one **end-to-end flow** with fake timers: click the refund chip, send, advance until the approval card appears, check the status says Waiting and the trace has a waiting entry, Approve, advance, and see the full reply and an Idle status. A second flow rejects.
- **`noInlineStyles.test.ts`** copied from monitoring, plus **a hex-literal check**: no `src/**/*.css` except `theme/violet.css` contains `#rrggbb` (so components keep reading tokens).
- **Not tested, by design:** CSS layout and breakpoints (happy-dom has no layout engine), the Avatar's glitch effect, library internals.
- **Not run by CI today** (Q2: tracked in #35, not this template's job); run locally with `pnpm --filter agent-panel-template test`.

## 9. Self-containment and forkability

- **Own `package.json`**: `name: "agent-panel-template"`, `private: true`, `type: "module"`, `engines.node: ">=20.19"`, scripts `dev`, `build` (`tsc --noEmit && vite build`), `preview`, `test`. `cyberui-2045` is `^2.6.0` from npm, never a `workspace:` range; the same React/Vite/Vitest/TypeScript versions as monitoring; **no `recharts`**. `typescript` is a dev dependency because `noInlineStyles.test.ts` imports it.
- **Own complete `tsconfig.json`**, copied from the root `tsconfig.json`/monitoring's (not `extends`ed), and its own `vite.config.ts` (`base: './'` so the build works at any subpath, including inside the site's iframe).
- **No imports outside the package**, and duplication across templates is accepted on purpose: `useHashRoute`, `tones.ts`, `test/setup.ts` and the `noInlineStyles` test are copies of monitoring's, not shared code. A shared layer would break `tiged` extraction, which is the repo's central promise.
- **License (issue #28).** Assumption: the fix lands as a `LICENSE` file in each template package and `"license": "MIT"` in each package's `package.json`. `packages/agent-panel` follows that from its first commit (see Q1). The `README.md` license line in the template is not needed if the file is present.
- **README** (`packages/agent-panel/README.md`) is the forker's documentation, in monitoring's shape and honesty standard: one paragraph saying what it is, that everything is simulated and which controls are mock (§3.4); the commands (`npm install && npm run dev`, `npm run build`, `npm test`, Node 20.19+); "Where your data goes" (§5.6); "Principles this code follows" (the same table as the Code tab, with file links); and "Re-theming" (change the two values in `src/theme/violet.css`).
- **Verification that it is really standalone** (monitoring plan Task 9's method): copy the folder outside the workspace, `npm install` (zero errors and warnings is the bar), `npm run build`, `npm test`, `npm run dev`; and, once merged, `npx tiged patrickkuei/cyberui-templates/packages/agent-panel my-app` for real. The templates-page spec notes this was never run end to end for monitoring either.

## 10. Integration points

Everything that changes outside `packages/agent-panel`, each with what changes. Everything else in the site is derived from `TEMPLATES` and needs no edit (Home's "N templates ready." sentence, the Templates page, the section component, the preview dialog, the start prompt and fork command in `start.ts`, the router).

| File | Change |
|---|---|
| `packages/site/src/data/templates.ts` | Add the `agent-panel` entry: `name: 'Agent Control Panel'`, `tagline`, `accentLabel: 'Violet'`, `accentHex: '#c084fc'` (must differ from monitoring's; a test enforces distinctness), `screenshotSrc: './screenshots/agent-panel.png'`, `livePreviewPath: './live/agent-panel/index.html'`. Write `slug:` then `name:` as plain single-line quoted strings: `scripts/check-templates-readme.mjs` reads the file as text. |
| `packages/site/src/content/templateContent.ts` | Add the `agent-panel` entry: `useIf`, `headsUp`, `notFor`, `examples`, `code: CODE_TABS['agent-panel']`. Missing copy fails a test, by design. |
| `packages/site/src/content/codeTabs.json` | Add `agent-panel`: principles with verbatim excerpts and the folder map. `scripts/check-code-tab.mjs` verifies every excerpt and folder in CI. |
| `packages/site/public/screenshots/agent-panel.png` | The screenshot (about 1440px wide, taken at the "Waiting for approval" state so the frame shows the approval card, trace and queue at once). Nothing in CI checks it exists; plan Task 15 adds a test. |
| `packages/site/scripts/sync-template-builds.mjs` | Add `{ slug: 'agent-panel', pnpmFilter: 'agent-panel-template' }` to `TEMPLATE_BUILDS` (local dev copies each build into `public/live/<slug>/`). |
| `.github/workflows/deploy.yml` | A "Build agent-panel template" step (`pnpm --filter agent-panel-template run build`) before "Build site", and `mkdir -p` plus `cp -r` lines for `packages/agent-panel/dist/.` into `packages/site/dist/live/agent-panel/` in the combine step. |
| `README.md` (repo root) | A row in the `## Templates` table: `| [Agent Control Panel](packages/agent-panel) | … |`. `scripts/check-templates-readme.mjs` fails CI if the row, slug or name disagree with `templates.ts`. |
| `pnpm-lock.yaml` | Gains a `packages/agent-panel` importer, generated by `pnpm install`. `deploy.yml` installs with `--frozen-lockfile`, so a missing importer fails the deploy. |
| `packages/site/src/data/templates.test.ts` | Existing tests are generic; add: `getTemplate('agent-panel')` resolves, and each template's screenshot file exists under `public/`. |
| `packages/site/src/content/templateContent.test.ts` | Add the agent-panel copy assertions (its Heads-up says "screens, not the agent"; two examples). |
| `scripts/check-templates-readme.mjs`, `check-code-tab.mjs`, `check-license.mjs`, `check-process-excerpts.mjs`, `.github/workflows/checks.yml` | **No code change.** They are generic over templates (`check-license.mjs`, from #28, finds templates through `templates.ts`, so it covers `packages/agent-panel` once the entry exists). Run all four after the changes; they are the integration test. |
| `scripts/check-template-builds.mjs` + `.test.mjs`, `package.json` (root, scripts), `checks.yml` | **Plan Task 17, confirmed by the owner.** The drift check described in decision 12: every slug in `templates.ts` appears in `TEMPLATE_BUILDS` and in `deploy.yml`'s build and copy steps. |
| `docs/superpowers/…` | This spec and its plan only. The old specs' "gallery" wording is a record and is not edited. |

Also noted, no change: `packages/site/src/content/processEvidence.json` and `processStages.ts` are about the site's own process (a different set of PRs), and `CLAUDE.md` describes how to work in the repo, not any one template.

## 11. Site copy for the Templates page

Wording is fixed here (as for monitoring, spec 2026-10-05 §4); the data shape is `TemplateContent`.

- **Name / tagline.** "Agent Control Panel" / "A conversation, a task queue, live status and a reasoning trace for an AI assistant, with a human approval step." Accent label "Violet".
- **Use this if you're building…**
  - a screen to watch and steer an AI assistant: what it is doing, what is waiting, and why
  - a chat where a person has to approve risky steps before the agent goes ahead
  - an internal tool for a support, ops or content team that works alongside an agent
- **Heads-up.** "The agent is a script. Every reply, task and reasoning step is pre-written and no AI model is called. You can send a message, approve or reject, pause, stop and retry, but those only change what the screen shows, and nothing leaves your browser. The Export transcript button saves nothing. You get the screens, not the agent. Your AI can help you connect yours."
- **Probably not for you** "if you want a plain chat window for your customers or a native mobile app. (This is a screen for the people running an agent.)"
- **Examples (two folds).** Not written here. Method, same as monitoring's: two persona role-plays by subagents (suggested personas: a support-team lead who wants a console for an agent that drafts replies; a solo founder who wants to oversee an ops assistant), each asked what they would type to their AI in order, where they would get stuck, and how they would know it worked. Stored truncated with ellipses and otherwise verbatim, introduced by the page's existing "An AI played each of these, in a simulated interview. They are not real people." If the interviews cannot be run, the task stops and asks; examples are never invented.
- **Start prompt and terminal fold.** Derived from the slug by `start.ts`; nothing to write.
- **Code tab principles** (every claim must be true of the shipped code, and `check-code-tab` proves the excerpts): Single source of truth (`src/data/limits.ts`), DRY (the tone classes via `TONE_CLASS`), State in hooks (the one interval in `useSimulatedAgent.ts`), No inline styles (the test), Typed and exhaustive (`Record<Route, …>`; the `STATUS_VIEW` record), Tested (an engine test), and one this template adds: **Scripts as data** (a scenario in `scenarios.ts`, "Add a behavior by adding data"). Folder map: `src/pages`, `src/components`, `src/data` ("Scenarios, the engine, the data hook. Your agent goes here."), `src/router`, `src/theme` ("The accent override and tones."), `src/utils`, `src/icons`, `src/hooks`.

## 12. Risks and what is not verified

- **Not built or run:** this spec and plan are documents. The only code exercised is the engine, type-checked under strict TypeScript 5.8 and smoke-run in a scratch directory with Node 20 (all scenarios on both approval branches, the fallback, pause, stop-run, mid-task cancel, `Infinity` reveal, the idle same-reference property, the caps). No component, CSS, page, hook or test has been written or run.
- **Library assumptions to confirm in a browser:** that overriding the two tokens fully removes yellow and cyan from `Card` title rules, `TabNavigation`, `Badge`, `Table` and focus rings (confirmed in the CSS source, not rendered); that the library's own hover glows follow the override; that magenta primary beside violet looks acceptable (Q3); the Timeline's diamond colours for `info`/`success`/`warning`/`error`.
- **Screen-reader behaviour of the streaming reply** (§3.5) is a guess about polite live regions; unchecked.
- **Mobile pane switching** is the most layout-heavy part and is not testable under happy-dom; it is a browser check.
- **Preview inside the site's dialog:** `Esc` pressed inside the running template closes the site dialog (spec 2026-10-05 §3). This template uses no Esc handling of its own, so nothing conflicts today; a forker adding a modal would see both close.
- **`npx tiged …/packages/agent-panel`** end to end, and the zero-warning clean-room install, are plan steps, not facts yet.

## 13. Out of scope

Anything listed under "Not in scope" in §1; the CI test job (Q2; tracked in #35); the license sweep across packages (done by #28 / PR #31); a library chat component; changing issue #9's stale wording (PR B closes the issue with `Closes #9`).

## Findings from the first browser check

Plan Task 14, run on 2026-10-06 against the package's dev server (`vite`), driven with `puppeteer-core` and Microsoft Edge 154 (headless). The driving scripts were throwaway and are not in the repository; screenshots were looked at but are not committed. This is one browser on Windows, so read "checked" as "checked there".

**What needed a fix (each its own commit):**

- **`LinearProgress` did not fill its row, and its track was invisible.** The d.ts says the bar fills its container; the installed 2.6.0 renders a fixed `w-48` unless `className` is given (and passing one replaces that width class). Its track is `bg-surface`, the same colour as a panel. Both bars now pass `.meter-bar` and `.panel-surface [role='progressbar']` darkens the track (commit "make progress bars fill their row and show their track"). Worth telling the library owner; not filed from here.
- **The nav status badge repeated the header badge at full size.** It is `size="sm"` now.

**What was checked and held:**

- **Violet coverage (1440px).** A scan of every element's computed colour, border, background, outline, shadow, fill and stroke for the library's own cyan (`#00fff9`) and yellow (`#fffb00`), within 12 per channel, found none on the Console (idle and waiting for approval), Tasks and Logs. It reads computed styles of the states visited, so hover and focus states were not scanned. Card title rules, tab underlines, table headers, and pagination rendered violet; the Avatar ring is violet with a magenta glow (its `shadow-primary`).
- **No magenta body text in any card.** The same kind of scan found no text in a `section` coloured the primary magenta; the `.panel-surface` reset works.
- **Q3, magenta primary beside violet (decided: keep).** The primary buttons (Send, Approve) render *violet*, not magenta, because the library builds their gradient from `--color-accent` and `--color-secondary` (`--gradient-accent`), which the override moved together. Magenta survives only as the button glow and the far end of the progress bars (their gradient runs from the accent to the primary). To my eye the two read as one palette, with no clash, so Send stays a primary button and the `secondary` fallback was not needed. That is a judgment from screenshots; the owner may want to look.
- **The run.** Status went Thinking, Working, Waiting for approval; focus landed on Approve when the card appeared; trace entries appeared live; Approve finished the refund and the whole reply showed. Picking the earlier agent message switched the trace and said so; Back to latest worked. (Sending a message and Reset both returning to the latest run is covered by `App.test.tsx`, not by the browser.)
- **Steering.** Pause (composer disabled with its reason, status Paused) and Resume; Stop run mid-reply (a 161-character reply was cut at 30, the trace gained "Decision: Run stopped by you", status Idle); Reset (back to the two seeded messages); Cancel and Retry on a task.
- **Composer reasons** seen in the browser: paused, working, waiting for approval, context full.
- **Context window.** With reduced motion on (to speed it up), 33 scripted fallback messages filled it: the meter went default, warning, error, the word "Full" appeared, the composer disabled with "Context full. Reset to start again.", and Reset recovered. The plan's "about 15 messages" was too few: each fallback exchange adds 730 made-up tokens to a start of 4,800.
- **Auto-scroll.** Pinned to the bottom while a reply streamed; after scrolling the list to the top, a new streaming reply left it at the top.
- **390px phone.** No sideways page scroll on any of the Console's three panes, Tasks or Logs (`scrollWidth` equal to the viewport). Each pane tab shows exactly one pane. The nav links wrap to a second row rather than clip.
- **1000px** shows the two-column layout (conversation wide, queue and status stacked) and **1440px** the three columns, as designed.
- **Reduced motion** (emulated media feature): a reply appeared whole within about a second and the status dot's pulse was off.
- **Keyboard.** Tab order is Console, Tasks, Logs, Pause, Reset (the disabled Stop run is skipped), the task buttons, the agent message, the three prompt chips, the message box, Send. Every stop reported a focus indicator in its computed style (an outline on links, messages and chips; a box-shadow ring on the library's buttons and input). I did not judge those rings visually. Enter in the box sends.

**What was not checked:**

- **A screen reader.** Whether the streaming reply is announced once, character by character or not at all (spec §3.5) is still a guess. There is a reason for doubt: the list uses `aria-relevant="additions"`, and a reply that grows after its bubble was added is a text change, not an addition, so it may not be announced at all. Needs a real screen reader.
- **Firefox and Safari**, a real touch device, and browsers without `color-mix`.
- **On Tasks and Logs, the filter, search, paging and Export transcript were exercised by unit tests only,** not clicked in the browser (the pages were rendered and looked at).
- **Pane switching with a long conversation on a phone.** Inactive panes are `display: none`, which has no scroll geometry, so the conversation's scroll position after switching away and back was not looked at with enough messages to scroll.
- **Dev console:** one 404 for `/favicon.ico` (the page has no favicon link); no other errors or warnings.

**Test-tooling note:** under vitest's fake timers `userEvent` hangs (Testing Library's async wrapper waits on a real `setTimeout`), so the two end-to-end flows in `App.test.tsx` use `fireEvent` and say why.

### Changes after the owner's first look (2026-10-06)

The owner ran the console and reported three UX problems; each was fixed and then checked in headless Edge at 1440x900, 800x760 and 390x800.

- **Un-picking a message.** A picked agent message could only be un-picked with "Back to latest" in the trace pane, on the other side of the screen (and on another tab on a phone). The message button is now a real toggle, as its `aria-pressed` already claimed.
- **Two scrollbars.** The page scrolled, and the conversation and trace scrolled inside it on caps unrelated to the window, so the composer drifted out of view. The Console now fits the window: the page does not scroll, each pane (messages, task list, trace) scrolls on its own, and the composer stays at the foot of the conversation. Checked: with six exchanges the page height equalled the viewport at all three sizes and the composer did not move. Below the grid's minimum height (26rem) the page scrolls instead. In the two-column layout (720-1179px) the side pane scrolls as one unit because Live status alone takes most of it. On phones the card title is dropped (the tab names the pane) and the suggested prompts are one scrolling line.
- **A finished task looked like it vanished.** The task jumped from the top of the list to the bottom with no sign it had completed, and a done row said nothing beyond its badge. The queue now has Active / Failed / Finished sections with counts, finished work sorts by `finishedAt`, a done or cancelled row says when it finished, and a task that finishes while you watch gets a green wash that fades (not under reduced motion). Done tasks still have no Retry: retry is for failed and cancelled work. A "Run again" for done tasks would be a new feature, not a fix.
- **Trace title and size.** The "(scripted)" suffix is gone from the Reasoning trace title (the Simulated badge, the composer line and the README carry the honesty message). Live status now puts its badge and sentence on one row, which gave the trace about 24% more height at 1440x900 (276px to 343px). Mid-run that is still only about four steps, so a larger trace is an open design question.
