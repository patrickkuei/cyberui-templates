import { describe, it, expect } from 'vitest';
import { ROUTES } from '../router/useHashRoute';
import { DEMO_NOTE, ROUTE_TITLES, pairedMessage } from './product';

describe('product data', () => {
  it('has a title for every route', () => {
    expect(Object.keys(ROUTE_TITLES).sort()).toEqual([...ROUTES].sort());
  });

  it('words the demo sentence exactly', () => {
    expect(DEMO_NOTE).toBe('Template demo: Kestrel is fictional and controls nothing.');
  });

  it('puts the demo sentence in the pairing confirmation, after what was added', () => {
    expect(pairedMessage('Desk lamp', 'Bedroom')).toBe(`Added Desk lamp to Bedroom. ${DEMO_NOTE}`);
  });
});
