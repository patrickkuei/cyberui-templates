import { describe, it, expect } from 'vitest';
import { SECTIONS } from '../sections';
import { DEMO_NOTE, NAV_ITEMS, NAV_LABELS, SECTION_COPY } from './product';

describe('product data', () => {
  it('lists every nav target in SECTIONS, in page order', () => {
    const ids = NAV_ITEMS.map((item) => item.id);
    for (const id of ids) expect(SECTIONS).toContain(id);
    expect(ids).toEqual(SECTIONS.filter((id) => NAV_LABELS[id] !== null));
  });

  it('keeps the signup call to action out of the nav, because the header already has its own button', () => {
    expect(NAV_ITEMS.map((item) => item.id)).not.toContain('signup');
    expect(NAV_ITEMS.length).toBeGreaterThan(0);
  });

  it('gives every nav label once', () => {
    const labels = NAV_ITEMS.map((item) => item.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('has a heading for every section except the hero, whose heading is the h1', () => {
    expect(Object.keys(SECTION_COPY).sort()).toEqual(SECTIONS.filter((id) => id !== 'hero').sort());
  });

  it('words the one persistent demo signal exactly', () => {
    expect(DEMO_NOTE).toBe('Template demo: Tessera is fictional and the form sends nothing.');
  });
});
