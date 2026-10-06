// A template is published by adding it here, and nothing else is "coming
// soon": the site lists only templates that are finished and previewable.
// To add one, you need all four of:
//   1. its package at packages/<slug>/ (self-contained; see the root README),
//   2. an entry below,
//   3. its section copy in src/content/templateContent.ts (a test fails
//      without it),
//   4. a screenshot at public/screenshots/<slug>.png, plus its build copied
//      to live/<slug>/ (packages/site/scripts/sync-template-builds.mjs for
//      local dev, the deploy workflow for production).
// The repo-root README's template table must list it too; the repo-root script
// scripts/check-templates-readme.mjs fails CI if the two disagree.
export interface Template {
  slug: string;
  name: string;
  tagline: string;
  /** Human label for the template's accent hue — display only. */
  accentLabel: string;
  /**
   * The template's accent hex value. Scoped to just this template's own hero
   * (name badge, screenshot frame, "Run the live demo" button) as
   * --color-accent / --color-secondary — never applied to hub chrome, which
   * stays neutral. See the design spec, Visual direction.
   */
  accentHex: string;
  /** Path to a static screenshot, relative to the site's own index.html. */
  screenshotSrc: string;
  /**
   * Path to the template's built index.html, relative to the site's own
   * index.html. In production the CI workflow copies each template's dist
   * into site/dist/live/<slug>/ (see #8); for local dev, run
   * `npm run sync-templates` first to populate public/live/<slug>/.
   */
  livePreviewPath: string;
}

export const TEMPLATES: Template[] = [
  {
    slug: 'monitoring',
    name: 'AI Product Monitoring',
    tagline: 'Request volume, latency percentiles, error rate, and a live alerts feed for a production AI API.',
    accentLabel: 'Cyan',
    accentHex: '#00fff9',
    screenshotSrc: './screenshots/monitoring.png',
    livePreviewPath: './live/monitoring/index.html',
  },
  {
    slug: 'agent-panel',
    name: 'Agent Control Panel',
    tagline: 'A conversation, a task queue, live status and a reasoning trace for an AI assistant, with a human approval step.',
    accentLabel: 'Violet',
    accentHex: '#c084fc',
    screenshotSrc: './screenshots/agent-panel.png',
    livePreviewPath: './live/agent-panel/index.html',
  },
];

export function getTemplate(slug: string): Template | undefined {
  return TEMPLATES.find((item) => item.slug === slug);
}
