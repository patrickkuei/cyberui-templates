// What index.html says before any JavaScript runs: the <title>, description,
// Open Graph / Twitter card tags (link previews in chat apps and social
// sites), and a <noscript> list of the templates. Crawlers, link unfurlers
// and AI assistants that fetch the page without running JS read only this
// and llms.txt. vite.config.ts injects it into index.html, so it comes from
// the same data the page renders and can't drift from it.
//
// There is deliberately no robots.txt: crawlers only read one at the root of
// a host (patrickkuei.github.io/robots.txt), never under a project path like
// /cyberui-templates/, so one here would be ignored. sitemap.xml is written
// instead; submit it in a search console to use it.
import { TEMPLATE_ENTRIES } from './templateContent';
import { REPO, SITE_URL, forkCommand } from './start';

export const SITE_TITLE = 'CyberUI templates — React starter apps built with cyberui-2045';

export const SITE_DESCRIPTION =
  'React starter templates built with cyberui-2045, such as an AI monitoring dashboard, an agent control panel, a landing page and a mobile app.' +
  'Live previews, code, and a one-command fork with npx tiged.';

// Link previews need an absolute image URL. The monitoring screenshot is
// 1280x800, close enough to the 1.91:1 that large cards crop to.
const PREVIEW_IMAGE = { path: 'screenshots/monitoring.png', width: 1280, height: 800 };

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function headTags(): string {
  const title = escapeHtml(SITE_TITLE);
  const description = escapeHtml(SITE_DESCRIPTION);
  const image = new URL(PREVIEW_IMAGE.path, SITE_URL).href;
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${SITE_URL}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="CyberUI templates" />',
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${SITE_URL}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="${PREVIEW_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${PREVIEW_IMAGE.height}" />`,
    '<meta property="og:image:alt" content="The AI Product Monitoring template: charts, a requests table and an alerts feed in a dark cyberpunk style." />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join('\n    ');
}

export function noscriptHtml(): string {
  const items = TEMPLATE_ENTRIES.map(({ template }) =>
    [
      '<li>',
      `<h2>${escapeHtml(template.name)}</h2>`,
      `<p>${escapeHtml(template.tagline)}</p>`,
      `<p>Fork it: <code>${escapeHtml(forkCommand(template.slug))}</code></p>`,
      `<p><a href="https://github.com/${REPO}/tree/main/packages/${template.slug}">Source</a>` +
        ` · <a href="${escapeHtml(template.livePreviewPath)}">Live demo</a></p>`,
      '</li>',
    ].join(''),
  );
  return [
    '<noscript>',
    '<h1>CyberUI templates</h1>',
    `<p>${escapeHtml(SITE_DESCRIPTION)}</p>`,
    '<p>This page needs JavaScript. The templates, with their start prompts, are also in <a href="./llms.txt">plain text</a>.</p>',
    `<ul>${items.join('')}</ul>`,
    '</noscript>',
  ].join('\n    ');
}

export function sitemapXml(): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${SITE_URL}</loc></url>`,
    '</urlset>',
    '',
  ].join('\n');
}
