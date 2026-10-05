# `/templates` Page — Design Spec

**Date:** 2026-10-05
**Status:** Sections 1-6 agreed with the user in conversation. Pending written-spec review.
**Builds on:** [2026-09-30-showcase-hub-redesign-design.md](2026-09-30-showcase-hub-redesign-design.md) (nav, neutral hub chrome, "spend the neon once per page"; its "Gallery" is now "Templates") and [2026-10-01-process-page-design.md](2026-10-01-process-page-design.md), whose method this spec follows: run the design stages against the page itself, record stages 1-6 here, leave stages 7-10 to the implementation plan. This spec replaces the index grid, `TemplateTile`, the coming-soon handling and the separate `/templates/:slug` detail page.

## 1. Discovery

**Problem.** A visitor clicks "Pick a starting point" on Home, so they have already decided to look for a template. Now they are asking whether this one is right for what they want to build, and what to do next if it is. Today's page does not help with either: it shows one real template next to four placeholders, so there is little to judge and no next step. The way to start (`npx tiged`) lives only in the root README.

**Audience.** The same people as Home and `/process`: someone building a product with an AI assistant who wants a head start. Carried over from the `/process` spec, not new research. Most arrive with a specific idea and are asking whether the template fits it, not browsing.

**Voice.** Plain and friendly, second person, like Home. Not the formal voice of `/process`, which documents a process. This page is a decision page.

**Success criteria** (what is true for the visitor afterward):
1. They know whether the template fits what they want to build.
2. They believe what they saw: they trust the template is real and know which parts are simulated, so nothing surprises them after they start.
3. They know what to do next. If it fits, they know how to start and can. If it does not, they find out quickly and leave without false hope.

**Decision taken here.** Only finished templates are published. There are no "coming soon" tiles. On a solo repo with no dates, a placeholder is a promise nobody owns, and it makes the page look emptier than it is. The roadmap already lives in GitHub issues (#9 for the agent panel).

## 2. Research

**Reference sites** (from search summaries; the user opened the first three and confirmed their previews are screenshots, the rest were not opened):
- Vercel's template gallery: browse by filter, one Deploy button per template.
- shadcn-style block libraries: Code/Preview toggle and a copy-able install command beside the preview.
- Prompt-first tools (Lovable, Bolt, v0): the template is a prompt you copy and paste.
- Live demo plus forkable: open-source dashboard templates on GitHub (live demo is a separate deployed site, fork path is the repo), Astro themes (demo on its own preview URL, separate "use this template" step), StackBlitz/CodeSandbox (the live project is the thing you fork).

**Findings.** The start action sits next to the preview in all of them, so the visitor is not sent elsewhere to find out how to start. Galleries that show screenshots have no reason to say what is simulated. Live-plus-forkable references usually split the demo and the fork path across two places. None found put them on one page. These galleries are built to browse many items; with one template they are a weak model for an index and a good model for the single-template page.

**Simulated interviews.** Two rounds, four subagent personas each (a non-technical shop owner, a solo founder running an LLM API, a hobbyist building a mobile app, a skeptical agency engineer). They are language-model role-plays of the personas Claude wrote, not users. Round 1 reacted to a draft of this page. Round 2 described how each would use the template: what they would type to their AI, in order, and where they would get stuck. Round 2 is the source of the examples in §4. Neither round counts as user research, and the page says so.

**Evidence in this repo.** A live, running template exists (`monitoring`), served at `live/monitoring/index.html` inside the site build. Its README lists the mock controls. The four other templates have no screenshots. There has been no user research.

## 3. Information architecture

**One page.** `/templates` shows each template in full. The index-plus-detail split is dropped: with one template the index has nothing to choose between and costs the visitor a click. Each template is a self-contained section component, so a future index can reuse it if the page ever grows too long. The page must look right with one template and not break with two or three.

**Order within a template section** (the order a visitor sees, judges, then acts):
1. Name, one line, accent label.
2. Screenshot in a window frame. Clicking it, or its "Run the live demo" button, opens the dialog.
3. Fit: "Use this if you're building…", the Heads-up, "Probably not for you…".
4. Examples (two, each folded).
5. Start building: Copy button, a one-line explanation, and a fold with the full prompt and the terminal route.

**The dialog.** Opens at roughly 80-90% of the viewport (full-screen on phones). Tabs: Live preview and Code. Live preview is an iframe of the template's built `index.html`. A visible close button is required, because key presses inside an iframe do not reach the page, so Esc does not close it from there.

**Back button.** Opening the dialog must be a browser history step, so Back closes it instead of leaving the page (otherwise Android Back would leave `/templates` and lose the preview). The existing `#/templates/:slug` route is the candidate: it would mean "the Templates page with this template's dialog open", which also gives a shareable link. The router has not been checked to see whether it can support that; this is a question for the plan.

**Constraints for the plan.**
- Adding a template is adding data and content, with no layout work.
- Facts that appear in more than one place (the fork command, the README's template list) have one source, derived from the template's slug and data, with a drift check in the style of `check-process-excerpts`.
- The site routes on the URL hash, so in-page `#anchor` links break routing. Any "jump to section" link must use `scrollIntoView`, not an anchor.
- Templates and the library are one project split for maintenance. The start prompt reuses the library's own `npx cyberui-2045 init` for persistent AI guidance instead of inventing a second mechanism.

## 4. Wireframe and copy

```
 Templates

 AI Product Monitoring             [ Cyan accent ]
 Request volume, latency, error rate, live alerts.

 ┌ ● ● ●  live/monitoring ───────────────────────┐
 │                                               │
 │          (screenshot of the dashboard)        │
 │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
 │ ░░░░  [ ▶ Run the live demo ]  ░░░░░░░░░░░░░░ │
 └───────────────────────────────────────────────┘

 Use this if you're building…
   • …
 Heads-up: …
 Probably not for you if …

 Examples: making it yours
 ▸ A small shop owner
 ▸ An LLM API developer

 [ Copy start prompt ]
   Paste it into your AI coding assistant …
   ▸ See the prompt, or use the terminal instead
```

The dialog:

```
 ┌ AI Product Monitoring ──────────── [ ✕ ] ┐
 │  [ Live preview ]  [ Code ]               │
 │ ┌───────────────────────────────────────┐ │
 │ │            running template           │ │
 │ └───────────────────────────────────────┘ │
 └───────────────────────────────────────────┘
```

**Copy** (for the `monitoring` template; the wording of each block is fixed here, the data shape that holds it is the plan's decision):

*Use this if you're building…*
- a screen to keep an eye on something: orders, usage, errors, support tickets
- anything made of charts, a table and a list of things that need attention
- a dashboard for yourself or your team

*Heads-up:* The data is made up, and a few buttons (time range, Acknowledge, Export CSV, Download) don't do anything yet. You get the screens, not the data connection. Your AI can help you hook up yours.

*Probably not for you* if you're after a native mobile app or a landing page. (A marketing dashboard is fine.)

*Start building.* Button: **Copy start prompt**. Line under it: "Paste it into your AI coding assistant (Cursor, Claude Code…). It makes a folder called `my-app` and sets things up. Then tell it what to change."

*The prompt* (shown in the fold):

> Start a new project from the AI Product Monitoring template. Run `npx tiged patrickkuei/cyberui-templates/packages/monitoring my-app`, then `cd my-app`, `npm install`, and `npm run dev`. It needs Node 20.19 or newer, so tell me if I need to install it. Tell me when it's running and what address to open. Then run `npx cyberui-2045 init` so you know how to use the component library from now on.

*Terminal route* (same fold): the same three commands, plus "Needs Node 20.19 or newer."

**Examples.** Introduced once above both folds: "An AI played each of these, in a simulated interview. They are not real people." The text inside each fold is the subagent's own wording, truncated with ellipses and not reworded.

*A small shop owner* (wants an orders-and-returns screen)

What they'd type to their AI, in order:
1. "Change the app name and all the text from AI monitoring to my shop. The Dashboard should show orders per day, revenue, and return rate."
2. "Replace the Endpoints page with an Orders table: order number, customer, product, amount, status. Make the Alerts page show returns instead."
3. "Make the data come from my real shop, not fake numbers. I use Shopify (or maybe an Excel export, not sure)."
4. "Make the Acknowledge button actually mark a return as handled, and make Export CSV really download."
5. "Put this online so I can open it on my phone."

Where they'd get stuck: "Step 3 is the hard one. I don't know where my data "lives" or what an API key is, and I'm scared of pasting secrets into chat. The AI will ask me for things I can't answer."

How they'd know it worked: "I'm done when I open it, see three orders I recognize, the totals roughly match my shop admin, and clicking a return stays marked after refresh."

*An LLM API developer* (customer-facing usage and errors dashboard for about 200 customers)

What they'd type to their AI, in order:
1. "rename this to Acme LLM API, remove the Reports page and the Alerts page for now, keep Dashboard and Endpoints"
2. "my endpoints are /v1/chat, /v1/embeddings, /v1/completions. replace the fake endpoints and make the charts show requests, p95 latency, and error rate"
3. "instead of random data, fetch from /api/usage?range=24h. here's the json shape [paste]. make the time range buttons actually work"
4. "add a login screen, customers enter their API key and only see their own usage"
5. "add a tokens used column and an errors by status code (429, 500, 400) breakdown"

Where they'd get stuck: "I don't have a /api/usage endpoint. My logs are in Postgres plus raw nginx logs, so I'd need to write the aggregation backend first. That's the real work, and the template doesn't help with it."

How they'd know it worked: "I log in with a test customer's key and the numbers match what I see in my own database or logs for the same window. …"

## 5. Visual direction

All within the hub rule: neutral chrome, neon only where it means something, no new colors.
- **Accent** is scoped to the template's own section, as a local override (the same technique the old live tile used). It glows in one place: the **Copy start prompt** button (primary), because copying the prompt is the page's main action. The hero (name badge) and the outlined **Run the live demo** button (secondary) carry the accent colour without a glow. Nothing else uses it. *First agreed as glow-on-the-demo-button; changed after the first browser look, when the user found Copy too weak and asked which matters more. The demo is how a visitor decides; Copy is what they do once they have.*
- **Screenshot frame:** a window frame with a 2rem top bar (like the existing `.preview-frame`), a dark gradient over the bottom edge, neutral. The "Run the live demo" hint is always visible, never hover-only, because touch has no hover.
- **Heads-up** is plain text with a neutral left rule, not a warning color. It is information, not an alert. "Use this if" and "Probably not for you" are plain text too. *Agreed with the user over a two-column layout and a boxed callout. Revisit if the Heads-up is easy to skim past once built; the boxed callout is the fallback.*
- **Dialog:** neutral surface, 1px border, no glow.
- **Type** unchanged (IBM Plex Sans/Mono). Wide code scrolls inside its own block; the page never scrolls sideways.
- **Motion:** the dialog fades in by opacity only; with `prefers-reduced-motion` it appears with no transition. No scroll-reveal is planned for this page.

## 6. Design system

Checked against cyberui-2045 v2.6.0's types and built code, not in a browser.

| Need | Use | Adjustments |
|---|---|---|
| Folds (examples, prompt/terminal) | Library `Accordion` | Expanded panels get a neon accent border by default. Scope `--color-accent` to a neutral token on the folds (the technique the old coming-soon tile used) so the page keeps one neon spot. |
| Dialog | Site-local `PreviewDialog` on the native `<dialog>` element | See below. |
| Dialog tabs | Library `TabNavigation` (already used by the old `TemplatePage`) | None. |
| Accent label | Library `Badge` (already used) | None. |
| "Run the live demo" | Library `Button` `secondary`, inside the accent-scoped hero | None. |
| Copy start prompt | Library `Button` `primary`, inside an accent-scoped wrapper | None. |
| Code tab | Site-local `CodeViewer` (exists) | Possibly extended; see "Decisions not made". |
| Copy to clipboard | Small site-local piece; no library component | |
| Screenshot frame and overlay | Custom CSS | |

**Dialog: native `<dialog>`, not the library `Modal`.** The user chose to try `Modal` first. A probe in the test environment then showed that `Modal` (cyberui-2045 v2.6.0):
- keeps `aria-hidden="true"` on its overlay while open, and the `role="dialog"` panel sits inside that overlay, so assistive technology may not reach the dialog (confirmed in the DOM, not with a real screen reader);
- draws its panel with `border-accent` and an accent shadow, plus CRT fade classes, the opposite of §5's quiet neutral dialog;
- caps the panel at 90vh with fixed overlay padding, and its `size` takes no responsive value (the built sizes are maximum widths; `xl` is 56rem, 896px), so 90vw on desktop and full-screen on phones needs more overrides.

The user then chose the simple way for this page: a small `PreviewDialog` component on the native `<dialog>` element, opened with `showModal()`. The browser supplies the focus trap, Esc to close, focus return to the opener, an inert background and correct accessibility semantics, so the site owns only styling: a neutral surface, 90vw by 90vh on desktop and full-screen at phone width, and an opacity-only fade that is off under `prefers-reduced-motion`. A visible close button is still required. The component's props are `isOpen`, `onClose`, `title` and `children`, so the implementation stays swappable. The iframe must mount only while the dialog is open, so the dashboard does not load until asked for.

**Library gaps, not filed** (for the CyberUI repo, as #60 and #61 were for `/process`): `Modal` leaves `aria-hidden="true"` on the overlay that contains the open dialog; its `size` takes no responsive value and there is no size between `xl` and `fullscreen`. The user thinks the first is worth an issue; filing needs their approval of the text.

To remove: `TemplatesIndexPage`, `TemplateTile`, the `status` field and the `small` tile size, the coming-soon fallback image, the "isn't built yet" branch of `TemplatePage`, and the four placeholder entries in `TEMPLATES`. `CaseStudy` and `caseStudies.ts` hold the engineering story, which has no place in the new layout and is replaced by the examples above. Home's "N templates ready. M more coming soon." sentence and the root README's status table also change, because they were written for the placeholders.

## 7. The Code tab (agreed after the first browser look; not built yet)

**Purpose.** Let a developer judge how clean the template's code is. It is not a component exhibition: the template is not required to use a library component for everything (a plain `<button>` is fine), and the tab does not audit the template against the library's own guide.

**What the tab does not show.** No stack line (every template is TypeScript, so it distinguishes nothing). Nothing about how the data is simulated. The current snippets (`simulation.ts`: a random walk, a capped alerts list) are engineering trivia to a visitor and are removed.

**What it shows.**
1. **The principles the code follows,** each with a link to a real file that shows it. A claim that is not true of the code does not go on the list.
2. **A folder map** with one line of purpose per folder, each file linking to its current source on GitHub. The `data/` line says it is the one place data comes from, so it is where your own data goes.
3. Possibly a few real files in full, chosen by a stated rule and not for how they look (open; see below).

**The principles** (evidence is what a developer opens):

| Principle | Evidence |
|---|---|
| Single source of truth | The alarm thresholds in one module that the simulation, `trend.ts` and the pages all import; chart colours from one hook (`useChartColors`); routes derived from one `ROUTES` tuple |
| DRY | One shared tone-to-colour map used by `StatTile` and `ActionPanel` |
| Hook-based state | `useSimulatedMetrics` holds all timers and state; components and pages are presentational |
| No inline styles | Styling is in CSS classes; a test fails if a `style={{…}}` appears in the template's source |
| Typed and exhaustive | `Record<Route, …>` maps that fail to compile when a page is missing |
| Tested | A test file next to each component, page and helper |

"Clean code" is left off the list: it is too vague to link to a file.

**Template cleanup this requires** (a separate branch and PR on `packages/monitoring`, merged before the tab is written, so every listed principle is true when it ships):
- Move the thresholds into one module. Today the error-rate limit `2` is a literal in four places (`DashboardPage` twice, `EndpointsPage`, `trend.ts`) and latency `500` in `DashboardPage` twice and `trend.ts`, while `P95_LATENCY_THRESHOLD_MS` in `simulation.ts` goes unused by them.
- Share one tone map instead of the copies in `StatTile.tsx` and `ActionPanel.tsx`.
- Remove every inline `style={{…}}` (`StatTile` 5, `ActionPanel` 2, `UsageChart` 2, `EndpointRequestsChart`, `LatencyChart` and `RequestVolumeChart` 1 each) in favour of CSS classes, using a `data-tone` attribute or a class per tone for the values that vary. Add the test that keeps them out. Recharts props that are plain objects (not a React `style` prop) are not what the test looks for.
- Behaviour must not change; the template's existing tests cover it. The running demo should be looked at afterwards, and `monitoring.png` retaken if it changed.

**Where the principles are written down.**
- In **`packages/monitoring/README.md`**, a short "Principles this code follows" section with the same table. This is the documentation that travels with a fork (per the repo's CLAUDE.md), so it is the primary home.
- In the **Code tab**, as the visitor-facing copy of the same list. The site is self-contained and cannot import the README, so this is a copy; keep the two in step by hand unless drift becomes a problem, then add a check in the style of `check-templates-readme`.
- In **this spec** (here), as the record of why.

## Decisions not made

- Whether to add a short stack, license and GitHub-repo line under the description. Two of the four simulated reviewers asked for it. The `monitoring` package has no license file of its own (see below).
- Whether to add a one-line "this is the only template right now" note, so a visitor who is not a fit does not wonder whether others exist.
- Whether the Code tab also shows a few real files in full (a code file with its test, and a page), chosen by a stated rule such as "typical size", or only the principles and the folder map (§7). Alternatively a full file browser over every source file, which needs a build step that copies the template's source into the site. Not chosen.
- Whether `useSimulatedMetrics.ts` really is the only place the simulated data enters, before the folder map says so. Not verified.
- Whether `npx cyberui-2045 init` can be run by an AI without answering an interactive prompt (it reads from readline; flags such as `--claude` exist). Check when the prompt is written into code, and adjust its wording if needed.
- Whether `npx tiged …/packages/monitoring` and `npm run dev` work exactly as written, and whether the dev server prints an address. Not tested.

## Stages 7-10: for the implementation plan

- **7 High-Fidelity:** merged page and section component; screenshot frame and overlay; dialog with tabs; start block; examples content.
- **8 Motion:** dialog fade; reduced-motion path.
- **9 Prototype & Testing:** RTL tests scoped with `within(...)` (the section repeats text such as template names and button labels); a render test with a second fake template; the drift check; a human check at desktop and phone widths; a reduced-motion check; Back-button behavior in the dialog.
- **10 Handoff:** this spec and its plan. Per the repo's CLAUDE.md, forker-facing comments in code for the template data contract, and the mock/simulated behavior stated where a forker would otherwise think it is live.

## Out of scope

- A device-size toggle in the dialog.
- A third template or any new template.
- **Licensing of forks.** The repo has a root `LICENSE`, but `packages/monitoring` has none, and `tiged` copies only the package folder, so a forker gets no license file. Worth a separate issue.
- The vague wording on Home ("the look stays consistent", "Open source") that three simulated reviewers called marketing.
- Any change to the library itself.

## Verification status after the first build

Checked by Claude: the site's tests, `tsc`, the production build, the two root scripts (`check:process-excerpts`, `check:templates-readme`) all pass. The new components are covered by tests in a simulated DOM (happy-dom).

**Not checked, because no browser was available in the build session** (the plan's Task 12 checklist is still open and belongs to a human):
- Whether the Copy start prompt glow is strong enough and the outlined demo button still reads as clickable on the screenshot (§5).
- Whether the Heads-up is easy to skim past (§5 "revisit"; the boxed callout is the fallback).
- The `.neutral-scope` override actually removing the Accordion's expanded accent border and the secondary Button's accent colour in a real browser.
- The dialog at about 90vw by 90vh on desktop and full-screen at 390px, its fade, and the `prefers-reduced-motion` path.
- Esc, focus return and the focus trap in a real browser, and the dialog's place in the accessibility tree.
- Browser Back and Android Back closing the dialog; a direct link to `#/templates/monitoring` reopening it and closing to `#/templates`.
- The copy button on a real clipboard, and the running template loading inside the iframe (the tests do not load it).
- `npx tiged …/packages/monitoring` and `npx cyberui-2045 init` as the start prompt describes them.
