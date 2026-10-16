import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { headTags, noscriptHtml, sitemapXml } from './staticHtml';
import { TEMPLATES } from '../data/templates';
import { forkCommand } from './start';

describe('headTags', () => {
  const head = headTags();

  it('gives link previews a title, description and absolute image URL', () => {
    expect(head).toContain('<title>CyberUI templates');
    expect(head).toContain('<meta property="og:title"');
    expect(head).toContain('<meta property="og:description"');
    expect(head).toContain(
      '<meta property="og:image" content="https://patrickkuei.github.io/cyberui-templates/screenshots/monitoring.png" />',
    );
    expect(head).toContain('<meta name="twitter:card" content="summary_large_image" />');
  });

  it('points at a screenshot that exists', () => {
    expect(existsSync(path.resolve(__dirname, '../../public/screenshots/monitoring.png'))).toBe(true);
  });
});

describe('noscriptHtml', () => {
  const html = noscriptHtml();

  it('lists every published template with its fork command, source and live demo', () => {
    expect(html.startsWith('<noscript>')).toBe(true);
    for (const template of TEMPLATES) {
      expect(html).toContain(`<h2>${template.name}</h2>`);
      expect(html).toContain(`<code>${forkCommand(template.slug)}</code>`);
      expect(html).toContain(`href="https://github.com/patrickkuei/cyberui-templates/tree/main/packages/${template.slug}"`);
      expect(html).toContain(`href="${template.livePreviewPath}"`);
    }
  });

  it('links to the plain-text version', () => {
    expect(html).toContain('href="./llms.txt"');
  });
});

describe('sitemapXml', () => {
  it('lists the site root', () => {
    expect(sitemapXml()).toContain('<loc>https://patrickkuei.github.io/cyberui-templates/</loc>');
  });
});
