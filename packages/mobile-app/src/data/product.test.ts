import { describe, it, expect } from 'vitest';
import { LINK_STEPS } from '../connection';
import { ROUTES } from '../router/useHashRoute';
import { CONNECT_COPY, DEMO_NOTE, LINK_STEP_LABELS, LINK_WORDS, ROUTE_TITLES } from './product';

describe('product data', () => {
  it('has a title for every route', () => {
    expect(Object.keys(ROUTE_TITLES).sort()).toEqual([...ROUTES].sort());
  });

  it('words the demo sentence exactly', () => {
    expect(DEMO_NOTE).toBe('Template demo: Kestrel is fictional and controls nothing.');
  });

  it('says on the Scan screen that the scan is scripted and nothing is discovered', () => {
    expect(CONNECT_COPY.scripted).toMatch(/scripted/);
    expect(CONNECT_COPY.scripted).toMatch(/nothing is discovered/);
  });

  it('has a label for every step of the link, and a word for every link that is down', () => {
    expect(Object.keys(LINK_STEP_LABELS).sort()).toEqual([...LINK_STEPS].sort());
    expect(LINK_WORDS).toEqual({ lost: 'Lost', offline: 'Offline' });
  });

  it('counts the devices a scan found, in the singular and the plural', () => {
    expect(CONNECT_COPY.found(1)).toBe('1 device nearby');
    expect(CONNECT_COPY.found(4)).toBe('4 devices nearby');
  });
});
