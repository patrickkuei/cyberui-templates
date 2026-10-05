# Nexus AI monitoring dashboard (template)

A live AI-platform monitoring dashboard (requests, latency percentiles, token usage, endpoints, alerts) built with [cyberui-2045](https://www.npmjs.com/package/cyberui-2045) and [Recharts](https://recharts.org/).

All data is simulated in the browser; there's no backend and no network calls. The nav tabs are real navigation between the four pages, but a few controls are mock: the chart time-range buttons, the "Acknowledge" button in the "What needs attention" panel, and the "Export CSV" and "Download" buttons on the Reports page. They change what the screen shows (which range is highlighted, "Acknowledged", "Downloaded") but never the data, and nothing is exported, saved or sent.

```bash
npm install && npm run dev   # start the dev server
npm run build                # type-check and build to dist/
npm test                     # run the test suite
```

Requires Node 20.19 or newer.

## Where your data goes

Everything the screens show comes from one hook call, `useSimulatedMetrics` in [src/App.tsx](src/App.tsx), and flows down to the pages and components as props. To use real data, replace what [src/data/useSimulatedMetrics.ts](src/data/useSimulatedMetrics.ts) returns with a fetch (keep the `DashboardState` shape from [src/data/simulation.ts](src/data/simulation.ts), or change the type and let the compiler point out every place that needs updating).

## Principles this code follows

| Principle | Where to see it |
|---|---|
| **Single source of truth** | Alarm limits live only in [src/data/thresholds.ts](src/data/thresholds.ts); the simulation, the trend labels, the Dashboard and Endpoints pages (which pass a tone down to the stat tiles and the action panel) and the header badge all read them. Chart colours come from the theme variables through one hook, [src/theme/chartColors.ts](src/theme/chartColors.ts). Routes derive from one `ROUTES` tuple in [src/router/useHashRoute.ts](src/router/useHashRoute.ts). |
| **DRY** | What each tone (`success`, `warning`, `error`, `default`) looks like is defined once, as the `.tone-*` classes in [src/App.css](src/App.css); the `Tone` type is shared from [src/utils/trend.ts](src/utils/trend.ts), and [src/theme/tones.ts](src/theme/tones.ts) maps every `Tone` to its class, so adding a tone without a class is a compile error. |
| **State in hooks, components presentational** | The only timer is in [src/data/useSimulatedMetrics.ts](src/data/useSimulatedMetrics.ts). Components and pages take props and render. |
| **No inline styles** | All styling is in CSS classes. [src/noInlineStyles.test.ts](src/noInlineStyles.test.ts) fails if a `style={...}` prop appears. |
| **Typed and exhaustive** | `Record<Route, …>` maps in [src/App.tsx](src/App.tsx) turn "added a page but forgot its label or component" into a compile error. |
| **Tested** | A test file sits next to each component, page and helper. The exceptions are `src/theme/chartColors.ts` and the entry points (`main.tsx`). |
