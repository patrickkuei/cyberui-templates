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
    expect(content.headsUp).toMatch(/no AI model is running/);
    expect(content.examples).toHaveLength(2);
  });

  it('gives the landing page fit copy that says plainly the signup sends nothing, and two examples', () => {
    const content = TEMPLATE_CONTENT.landing!;
    expect(content.useIf).toHaveLength(3);
    expect(content.headsUp).toMatch(/signup sends nothing/);
    expect(content.headsUp).toMatch(/the page, not the backend/);
    expect(content.examples.map((example) => example.title)).toEqual(['An indie developer', 'A product manager']);
    for (const example of content.examples) expect(example.requests, example.title).toHaveLength(6);
  });

  it('gives the mobile app fit copy that says plainly nothing is controlled or sent, and two examples', () => {
    const content = TEMPLATE_CONTENT['mobile-app']!;
    expect(content.useIf).toHaveLength(3);
    expect(content.headsUp).toMatch(/nothing is controlled or sent/);
    expect(content.headsUp).toMatch(/screens, not the hub/);
    expect(content.examples).toHaveLength(2);
    for (const example of content.examples) {
      expect(example.requests.length, example.title).toBeGreaterThanOrEqual(4);
      expect(example.requests.length, example.title).toBeLessThanOrEqual(6);
      expect(example.title, 'the title names the person').toMatch(/^An? /);
    }
  });

  // The first version of the Mobile App had a bottom sheet, a pairing form and a Scenes tab. The
  // two examples written for it said so, and the redesign has none of them: copy that still mentions
  // them is stale. (The redesigned app does have scenes, but as the three one-tap presets on a
  // light's own page, and the interview brief says so, so a person who asks to rename "the three
  // one-tap scenes" on "the light page" is describing the redesigned app: "scenes" and "one-tap
  // scenes" are not on this list. The tagline test above does reject "one-tap scenes", because
  // in the tagline it was the first version's feature list.)
  it('describes the redesigned mobile app everywhere, not the first one', () => {
    const content = TEMPLATE_CONTENT['mobile-app']!;
    const words = [...content.useIf, content.headsUp, content.notFor ?? '', ...content.examples.flatMap((e) => [e.title, ...e.requests, e.stuck, e.worked])].join('\n');
    expect(words).not.toMatch(/bottom sheet|pairing form|Scenes tab|Add device form/i);
  });

  it("keeps the mobile app's examples to the owner's rules: no remark about the template or the demo in where they would get stuck, and labels that say they", () => {
    for (const example of TEMPLATE_CONTENT['mobile-app']!.examples) {
      expect(example.stuck, example.title).not.toMatch(/\b(the template|the demo|this template|the README|it is (all )?fake|it'?s (all )?fake|pretend)\b/i);
    }
  });

  it("describes each template's own limits in notFor, never another kind of app", () => {
    expect(TEMPLATE_CONTENT.monitoring!.notFor).toMatch(/live data/);
    expect(TEMPLATE_CONTENT['agent-panel']!.notFor).toMatch(/real model or login/);
    expect(TEMPLATE_CONTENT.landing!.notFor).toMatch(/several pages, a blog or a real signup backend/);
    expect(TEMPLATE_CONTENT['mobile-app']!.notFor).toMatch(/find or talk to real devices, or install it on a phone/);
    for (const [slug, { notFor }] of Object.entries(TEMPLATE_CONTENT)) {
      expect(notFor ?? '', slug).not.toMatch(/landing page|dashboard|mobile app/i);
    }
  });

  it('keeps every other field required: a template with copy but no examples or code is still caught', () => {
    for (const [slug, content] of Object.entries(TEMPLATE_CONTENT)) {
      expect(content.useIf.length, slug).toBeGreaterThan(0);
      expect(content.headsUp.length, slug).toBeGreaterThan(0);
      expect(content.examples.length, slug).toBeGreaterThan(0);
      expect(content.code.principles.length, slug).toBeGreaterThan(0);
    }
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
