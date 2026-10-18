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
  {
    slug: 'landing',
    name: 'Landing Page',
    tagline: 'A hero, features, pricing with a working billing toggle, FAQ and a signup form for a product launch.',
    accentLabel: 'Orange',
    accentHex: '#ff8a3d',
    screenshotSrc: './screenshots/landing.png',
    livePreviewPath: './live/landing/index.html',
  },
  {
    slug: 'mobile-app',
    name: 'Mobile App',
    tagline: 'A home device controller built for a phone: rooms, a glowing glyph for every device, a full page to control each one and a scan-and-link flow to add more.',
    accentLabel: 'Blue',
    accentHex: '#5b9cff',
    screenshotSrc: './screenshots/mobile-app.png',
    livePreviewPath: './live/mobile-app/index.html',
    previewFrame: 'phone',
  },
];

export function getTemplate(slug: string): Template | undefined {
  return TEMPLATES.find((item) => item.slug === slug);
}
