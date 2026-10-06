import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplatePreview } from './TemplatePreview';
import { getTemplate } from '../data/templates';
import { contentFor } from '../content/templateContent';

const monitoring = getTemplate('monitoring')!;
const code = contentFor('monitoring').code;

function renderPreview(onClose = vi.fn()) {
  render(<TemplatePreview template={monitoring} code={code} onClose={onClose} />);
  return { onClose, frame: screen.getByTitle('AI Product Monitoring live preview') as HTMLIFrameElement };
}

// happy-dom gives an iframe no real contentWindow, so stand one in.
function giveWindow(frame: HTMLIFrameElement) {
  const fakeWindow = new EventTarget();
  Object.defineProperty(frame, 'contentWindow', { value: fakeWindow, configurable: true });
  return fakeWindow;
}

const escape = () => new KeyboardEvent('keydown', { key: 'Escape' });

describe('TemplatePreview', () => {
  it('shows the live preview iframe by default', () => {
    const { frame } = renderPreview();
    expect(frame).toHaveAttribute('src', './live/monitoring/index.html');
  });

  it('shows a loading state until the iframe has loaded', () => {
    const { frame } = renderPreview();
    expect(screen.getByRole('status')).toHaveTextContent('Loading the live demo');
    fireEvent.load(frame);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('switches to the Code tab, hiding the iframe without unmounting it (no reload on the way back)', async () => {
    const { frame } = renderPreview();
    await userEvent.click(screen.getByRole('tab', { name: 'Code' }));
    expect(screen.getByText('Principles it follows')).toBeVisible();
    expect(frame).not.toBeVisible();
    await userEvent.click(screen.getByRole('tab', { name: 'Live preview' }));
    expect(screen.getByTitle('AI Product Monitoring live preview')).toBe(frame);
    expect(frame).toBeVisible();
  });

  it('forwards Esc pressed inside the running template, which the dialog cannot see', () => {
    const { frame, onClose } = renderPreview();
    const inside = giveWindow(frame);
    fireEvent.load(frame);
    inside.dispatchEvent(escape());
    expect(onClose).toHaveBeenCalledTimes(1);
    inside.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not stack listeners when the iframe loads again', () => {
    const { frame, onClose } = renderPreview();
    const inside = giveWindow(frame);
    fireEvent.load(frame);
    fireEvent.load(frame);
    inside.dispatchEvent(escape());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('survives a preview whose window cannot be reached (cross-origin)', () => {
    const { frame, onClose } = renderPreview();
    Object.defineProperty(frame, 'contentWindow', {
      get() {
        throw new DOMException('Blocked a frame', 'SecurityError');
      },
      configurable: true,
    });
    expect(() => fireEvent.load(frame)).not.toThrow();
    expect(onClose).not.toHaveBeenCalled();
  });
});
