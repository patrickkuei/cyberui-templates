import { describe, it, expect, afterEach } from 'vitest';
import { CyberNotificationProvider } from 'cyberui-2045';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplatesPage } from './TemplatesPage';
import { TEMPLATE_ENTRIES } from '../content/templateContent';

const monitoring = TEMPLATE_ENTRIES[0]!;
// A second, fake entry: the page must work with more than one template.
const second = {
  template: {
    ...monitoring.template,
    slug: 'second',
    name: 'Second Template',
    accentHex: '#ff00e5',
    accentLabel: 'Magenta',
    livePreviewPath: './live/second/index.html',
  },
  content: monitoring.content,
};

describe('TemplatesPage', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('has one h1 and one section per template', () => {
    render(<TemplatesPage />, { wrapper: CyberNotificationProvider });
    expect(screen.getByRole('heading', { level: 1, name: 'Templates' })).toBeInTheDocument();
    // Not getAllByRole('region'): the library's Accordion panels are regions too.
    expect(document.querySelectorAll('section.template-section')).toHaveLength(TEMPLATE_ENTRIES.length);
  });

  it('opens a template preview by pushing its hash', async () => {
    window.location.hash = '#/templates';
    render(<TemplatesPage />, { wrapper: CyberNotificationProvider });
    // Every template's section has its own "Run the live demo" button, so scope to monitoring's (the first).
    const section = document.querySelector<HTMLElement>('section.template-section')!;
    await userEvent.click(within(section).getByRole('button', { name: 'Run the live demo' }));
    expect(window.location.hash).toBe('#/templates/monitoring');
  });

  it('opens the matching preview when the route says so', () => {
    render(<TemplatesPage openSlug="monitoring" />, { wrapper: CyberNotificationProvider });
    expect(screen.getByTitle('AI Product Monitoring live preview')).toBeInTheDocument();
  });

  it('ignores an unknown slug: the page renders, nothing opens, nothing throws (Review Focus #1)', () => {
    render(<TemplatesPage openSlug="nope" />, { wrapper: CyberNotificationProvider });
    expect(screen.getByRole('heading', { level: 1, name: 'Templates' })).toBeInTheDocument();
    expect(document.querySelector('dialog[open]')).toBeNull();
  });

  it('replaces an unknown slug in the URL with the plain page, so Back cannot land on it later', () => {
    window.location.hash = '#/templates/typo';
    render(<TemplatesPage openSlug="typo" />, { wrapper: CyberNotificationProvider });
    expect(window.location.hash).toBe('#/templates');
  });

  it('leaves a known slug in the URL alone', () => {
    window.location.hash = '#/templates/monitoring';
    render(<TemplatesPage openSlug="monitoring" />, { wrapper: CyberNotificationProvider });
    expect(window.location.hash).toBe('#/templates/monitoring');
  });

  it('with two templates, opens only the one that matches and keeps ids distinct (Review Focus #5)', () => {
    render(<TemplatesPage entries={[monitoring, second]} openSlug="second" />, { wrapper: CyberNotificationProvider });
    expect(screen.getByTitle('Second Template live preview')).toBeInTheDocument();
    expect(screen.queryByTitle('AI Product Monitoring live preview')).not.toBeInTheDocument();
    const sections = Array.from(document.querySelectorAll<HTMLElement>('section.template-section'));
    expect(sections).toHaveLength(2);
    // "Copy start prompt" appears once per section, so scope to each.
    for (const section of sections) {
      expect(within(section).getAllByRole('button', { name: 'Copy start prompt' })).toHaveLength(1);
    }
    const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
