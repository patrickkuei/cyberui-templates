import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { TONE_CLASS } from './tones';

describe('TONE_CLASS', () => {
  it('has a rule in App.css for every tone class, so no tone renders without a colour', () => {
    const css = readFileSync(resolve(__dirname, '../App.css'), 'utf8');
    for (const className of Object.values(TONE_CLASS)) {
      expect(css, `App.css has no .${className} rule`).toMatch(new RegExp(`\\.${className}\\s*\\{`));
    }
  });
});
