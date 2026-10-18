import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
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

  it('looks up the agent panel and gives it a violet accent distinct from monitoring', () => {
    expect(getTemplate('agent-panel')?.name).toBe('Agent Control Panel');
    expect(getTemplate('agent-panel')?.accentHex).toBe('#c084fc');
  });

  it('looks up the landing page and gives it an orange accent distinct from the others', () => {
    expect(getTemplate('landing')?.name).toBe('Landing Page');
    expect(getTemplate('landing')?.accentHex).toBe('#ff8a3d');
  });

  it('looks up the mobile app and gives it a blue accent distinct from the others', () => {
    expect(getTemplate('mobile-app')?.name).toBe('Mobile App');
    expect(getTemplate('mobile-app')?.accentHex).toBe('#5b9cff');
  });

  // The first version of the Mobile App had bottom navigation with a Scenes tab, a bottom sheet
  // and a pairing form; the redesign has none of them, so a tagline that still says so is stale.
  it('describes the redesigned mobile app, not the first one', () => {
    const tagline = getTemplate('mobile-app')!.tagline;
    expect(tagline).toMatch(/rooms/);
    expect(tagline).not.toMatch(/one-tap scenes|pairing form|bottom sheet|bottom navigation/i);
  });

  it('asks for the phone-sized preview frame only where the template is made for a phone', () => {
    expect(TEMPLATES.filter((item) => item.previewFrame === 'phone').map((item) => item.slug)).toEqual(['mobile-app']);
  });

  it("every item's screenshot file exists, because nothing else in CI would notice a missing one", () => {
    for (const item of TEMPLATES) {
      const file = resolve(__dirname, '../../public', item.screenshotSrc.replace(/^\.\//, ''));
      expect(existsSync(file), `${item.screenshotSrc} is missing from packages/site/public`).toBe(true);
    }
  });
});
