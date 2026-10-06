# Vesper agent control panel (template)

A control panel for an AI assistant (a conversation, a task queue, live status, a reasoning trace, and a human approval step before the agent does anything risky) built with [cyberui-2045](https://www.npmjs.com/package/cyberui-2045). The assistant here is called Vesper and works for no real company.

**Everything is simulated in the browser: no model is called, nothing is sent over the network and nothing is saved.** The agent is a script (three scripted requests and a fallback reply), and its reasoning trace is pre-written, not a model's real chain of thought. The app says so itself: a "Simulated" badge beside the agent's name, the title "Reasoning trace (scripted)", and a line under the message box.

- **Controls that change the simulation** (they change what the screen shows, in your browser, and nothing else): Send and the suggested prompts, Approve and Reject, Pause and Resume, Stop run, Reset, selecting an agent message to see its trace, Cancel and Retry on tasks, and the search, filter and paging on the Tasks and Logs pages.
- **One pure mock:** **Export transcript** on the Logs page. It shows "Exported" and nothing is generated, saved or sent. The sessions listed on Logs are fixed samples, and the token counts in the context meter are made up.

```bash
npm install && npm run dev   # start the dev server
npm run build                # type-check and build to dist/
npm test                     # run the test suite
```

Requires Node 20.19 or newer.

## Re-theming

The violet accent is two color tokens in [src/theme/violet.css](src/theme/violet.css), imported right after the library's stylesheet in [src/main.tsx](src/main.tsx). cyberui-2045's components read those tokens, so changing the two values re-themes the whole app. `--color-primary` (the magenta that shows as the glow on primary buttons and the far end of the progress bars) is left alone on purpose. One thing to know when you add your own `Card`: the library gives it magenta body text by default, so reset it as `.panel-surface` does in [src/App.css](src/App.css).

## Where your data goes

Everything the screens show comes from one hook call, `useSimulatedAgent` in [src/App.tsx](src/App.tsx), and flows down to the pages and components as props. To connect a real agent, replace what [src/data/useSimulatedAgent.ts](src/data/useSimulatedAgent.ts) returns: build `state` from your server's events or a poll (keep the `AgentState` shape from [src/data/types.ts](src/data/types.ts), or change the type and let the compiler point out every place that needs updating), and make each of `actions` call your API (`send` posts the message, `resolveApproval` posts the decision). Nothing below that hook knows the data is simulated.

To change what the demo agent can do without touching the engine, add a scenario to [src/data/scenarios.ts](src/data/scenarios.ts). A scenario is plain data (steps to think, call a tool, start a task, ask for approval, or reply), and a test checks that every path through it ends in a reply.

## Principles this code follows

| Principle | Where to see it |
|---|---|
| **Single source of truth** | Every number that decides behavior (the tick rate, the context-window thresholds, the caps on how many messages, trace steps and tasks are kept) lives only in [src/data/limits.ts](src/data/limits.ts); the engine, the Live status panel and the message box all read it. Routes derive from one `ROUTES` tuple in [src/router/useHashRoute.ts](src/router/useHashRoute.ts). |
| **DRY** | What each tone looks like is defined once, as the `.tone-*` classes in [src/App.css](src/App.css), and [src/theme/tones.ts](src/theme/tones.ts) maps every `Tone`, agent status, task status, trace outcome, context level and session outcome to its look. Those are `Record`s over the data model's unions, so adding a status forces you to decide how it looks. |
| **State in hooks, components presentational** | The only timer, and the only call to `Date.now()`, is in [src/data/useSimulatedAgent.ts](src/data/useSimulatedAgent.ts). The engine in [src/data/simulation.ts](src/data/simulation.ts) is pure (no clock, no randomness), and components and pages take props and render. |
| **No inline styles, no stray colors** | All styling is in CSS classes. [src/noInlineStyles.test.ts](src/noInlineStyles.test.ts) fails if a `style={...}` prop appears, and [src/noHexColors.test.ts](src/noHexColors.test.ts) fails if any stylesheet other than `violet.css` contains a hex color. |
| **Typed and exhaustive** | `Record<Route, …>` maps in [src/App.tsx](src/App.tsx) turn "added a page but forgot its label or component" into a compile error, and the `Record` maps in [src/theme/tones.ts](src/theme/tones.ts) do the same for statuses. |
| **Scripts as data** | The demo agent's behavior is the scenarios in [src/data/scenarios.ts](src/data/scenarios.ts); the engine knows nothing about refunds. |
| **Tested** | A test file sits next to each component, page and helper, including the engine's approve and reject paths, the caps and the one end-to-end flow in [src/App.test.tsx](src/App.test.tsx). The exceptions are `src/data/types.ts` (types only), `src/theme/violet.css` and the entry point (`main.tsx`). |
