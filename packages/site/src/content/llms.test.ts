import { describe, it, expect } from 'vitest';
import { llmsTxt } from './llms';
import { TEMPLATES } from '../data/templates';
import { forkCommand, startPrompt } from './start';

describe('llmsTxt', () => {
  const text = llmsTxt();

  it('starts with the H1 and summary blockquote llms.txt requires', () => {
    expect(text.startsWith('# CyberUI templates\n\n> ')).toBe(true);
  });

  it('lists every published template with its fork command, start prompt, source and live demo', () => {
    for (const template of TEMPLATES) {
      expect(text).toContain(`### ${template.name}`);
      expect(text).toContain(forkCommand(template.slug));
      expect(text).toContain(startPrompt(template.name, template.slug));
      expect(text).toContain(`(https://github.com/patrickkuei/cyberui-templates/tree/main/packages/${template.slug})`);
      expect(text).toContain(`(https://patrickkuei.github.io/cyberui-templates/live/${template.slug}/index.html)`);
    }
  });

  it('says what is simulated, as the page does', () => {
    expect(text).toContain('Heads-up: This is a demo: the agent is just a script');
  });
});
