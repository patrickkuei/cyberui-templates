import { describe, it, expect, vi } from 'vitest';
import { CyberNotificationProvider } from 'cyberui-2045';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateSection } from './TemplateSection';
import { getTemplate } from '../data/templates';
import { contentFor } from '../content/templateContent';

const template = getTemplate('monitoring')!;
const content = contentFor('monitoring');

function renderSection(overrides: Partial<React.ComponentProps<typeof TemplateSection>> = {}) {
  const props = { template, content, previewOpen: false, onOpenPreview: vi.fn(), onClosePreview: vi.fn(), ...overrides };
  render(<TemplateSection {...props} />, { wrapper: CyberNotificationProvider });
  return props;
}

describe('TemplateSection', () => {
  it('names the template, its accent and its tagline', () => {
    renderSection();
    expect(screen.getByRole('heading', { level: 2, name: 'AI Product Monitoring' })).toBeInTheDocument();
    expect(screen.getByText('Cyan accent')).toBeInTheDocument();
    expect(screen.getByText(template.tagline)).toBeInTheDocument();
  });

  it('opens the preview from the Run the live demo button, once', async () => {
    const props = renderSection();
    await userEvent.click(screen.getByRole('button', { name: 'Run the live demo' }));
    expect(props.onOpenPreview).toHaveBeenCalledTimes(1);
  });

  it('opens the preview from a click on the screenshot area, once, through a button hidden from assistive technology', async () => {
    const props = renderSection();
    const hit = document.querySelector('.template-frame-hit') as HTMLElement;
    expect(hit).toHaveAttribute('aria-hidden', 'true');
    expect(hit).toHaveAttribute('tabindex', '-1');
    await userEvent.click(hit);
    expect(props.onOpenPreview).toHaveBeenCalledTimes(1);
  });

  it('shows the fit copy: use-if bullets, the heads-up, and who it is not for', () => {
    renderSection();
    expect(screen.getByText("Use this if you're building…")).toBeInTheDocument();
    for (const bullet of content.useIf) expect(screen.getByText(bullet)).toBeInTheDocument();
    expect(screen.getByText(/You get the screens, not the data connection/)).toBeInTheDocument();
    expect(screen.getByText(/Probably not for you/)).toBeInTheDocument();
  });

  it('includes the examples and the start block', () => {
    renderSection();
    expect(screen.getByRole('button', { name: /A small shop owner/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy start prompt' })).toBeInTheDocument();
  });

  it('mounts no iframe while the preview is closed', () => {
    renderSection({ previewOpen: false });
    expect(screen.queryByTitle('AI Product Monitoring live preview')).not.toBeInTheDocument();
  });

  it('mounts the live preview in a dialog while open, and closes it through the parent', async () => {
    const props = renderSection({ previewOpen: true });
    const dialog = document.querySelector('dialog')!;
    expect(dialog).toHaveAttribute('open');
    // The template name is also the section heading, so scope to the dialog.
    expect(within(dialog).getByRole('heading', { name: 'AI Product Monitoring' })).toBeInTheDocument();
    expect(within(dialog).getByTitle('AI Product Monitoring live preview')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close preview' }));
    expect(props.onClosePreview).toHaveBeenCalledTimes(1);
  });
});
