import { describe, it, expect } from 'vitest';
import { TEMPLATES, getTemplate } from './templates';

describe('templates', () => {
  it('publishes only finished templates: every entry has a live build to preview', () => {
    expect(TEMPLATES.length).toBeGreaterThan(0);
    for (const item of TEMPLATES) {
      expect(item.livePreviewPath).toBe(`./live/${item.slug}/index.html`);
    }
  });

  it('looks a template up by slug', () => {
    expect(getTemplate('monitoring')?.name).toBe('AI Product Monitoring');
    expect(getTemplate('nope')).toBeUndefined();
  });

  it('every item has a distinct slug and a distinct accent hex', () => {
    expect(new Set(TEMPLATES.map((item) => item.slug)).size).toBe(TEMPLATES.length);
    expect(new Set(TEMPLATES.map((item) => item.accentHex)).size).toBe(TEMPLATES.length);
  });

  it("every item's screenshot path is relative, matching the vite base: './' convention", () => {
    for (const item of TEMPLATES) {
      expect(item.screenshotSrc.startsWith('./screenshots/')).toBe(true);
    }
  });
});
