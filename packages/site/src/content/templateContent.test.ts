import { describe, it, expect } from 'vitest';
import { TEMPLATES } from '../data/templates';
import { TEMPLATE_CONTENT, TEMPLATE_ENTRIES, contentFor } from './templateContent';

describe('template content', () => {
  it('has content for every template, so a new TEMPLATES entry cannot ship without its copy', () => {
    for (const template of TEMPLATES) {
      expect(() => contentFor(template.slug)).not.toThrow();
    }
    expect(TEMPLATE_ENTRIES.map((entry) => entry.template.slug)).toEqual(TEMPLATES.map((t) => t.slug));
  });

  it('throws a helpful error for a slug with no content', () => {
    expect(() => contentFor('nope')).toThrow(/templateContent\.ts/);
  });

  it('gives the monitoring template fit copy and two examples', () => {
    const content = TEMPLATE_CONTENT.monitoring!;
    expect(content.useIf).toHaveLength(3);
    expect(content.headsUp).toMatch(/screens, not the data connection/);
    expect(content.examples.map((example) => example.title)).toEqual(['A small shop owner', 'An LLM API developer']);
  });

  it('gives the agent panel fit copy that says plainly the agent is a script, and two examples', () => {
    const content = TEMPLATE_CONTENT['agent-panel']!;
    expect(content.useIf).toHaveLength(3);
    expect(content.headsUp).toMatch(/screens, not the agent/);
    expect(content.headsUp).toMatch(/no AI model is called/);
    expect(content.examples).toHaveLength(2);
  });

  it('keeps every example request verbatim and in order', () => {
    const [shop, api] = TEMPLATE_CONTENT.monitoring!.examples;
    expect(shop!.requests).toHaveLength(5);
    expect(shop!.requests[0]).toBe(
      'Change the app name and all the text from AI monitoring to my shop. The Dashboard should show orders per day, revenue, and return rate.'
    );
    expect(api!.requests).toHaveLength(5);
    expect(api!.requests[2]).toBe(
      "instead of random data, fetch from /api/usage?range=24h. here's the json shape [paste]. make the time range buttons actually work"
    );
  });
});
