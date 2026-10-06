# cyberui-templates

Ready-made starting points for building with AI: complete example apps built with [cyberui-2045](https://github.com/patrickkuei/CyberUI) — showing what you can actually build, not just a component inventory.

## Templates

| Template | What it is |
|----------|------------|
| [AI Product Monitoring](packages/monitoring) | Request volume, latency percentiles, error rate, and a live alerts feed for a production AI API. |
| [Agent Control Panel](packages/agent-panel) | A conversation, task queue, live status and reasoning trace for an AI assistant, with a human approval step. |

More are planned; follow [the open issues](https://github.com/patrickkuei/cyberui-templates/issues) to see what is next. The [site](https://patrickkuei.github.io/cyberui-templates/) has a live preview and a one-step start for each template that is ready.

## Get just one template

Each template package is self-contained — you don't need to clone this whole repo:

```bash
npx tiged patrickkuei/cyberui-templates/packages/<template-name> my-app
cd my-app && npm install && npm run dev
```

## Design

See [docs/superpowers/specs/2026-09-27-cyberui-showcase-design.md](docs/superpowers/specs/2026-09-27-cyberui-showcase-design.md) for the full design rationale (structure, hosting, theming decisions).

Tracking issue: [#1](https://github.com/patrickkuei/cyberui-templates/issues/1)

## License

MIT
