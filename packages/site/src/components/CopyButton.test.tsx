import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CyberNotificationProvider } from 'cyberui-2045';
import { CopyButton } from './CopyButton';

function stubClipboard(writeText: ((text: string) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, 'clipboard', {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
}

function renderButton() {
  return render(<CopyButton text="hello" label="Copy start prompt" />, { wrapper: CyberNotificationProvider });
}

describe('CopyButton', () => {
  afterEach(() => stubClipboard(undefined));

  it('copies the text and confirms with a toast, leaving its own label alone', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    renderButton();
    await userEvent.click(screen.getByRole('button', { name: 'Copy start prompt' }));
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(await screen.findByText('Paste it into your AI coding assistant.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy start prompt' })).toBeInTheDocument();
  });

  it('shows an error toast when the clipboard rejects', async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    renderButton();
    await userEvent.click(screen.getByRole('button', { name: 'Copy start prompt' }));
    expect(await screen.findByText("Couldn't copy")).toBeInTheDocument();
  });

  it('shows an error toast when there is no clipboard API at all (insecure context)', async () => {
    stubClipboard(undefined);
    renderButton();
    await userEvent.click(screen.getByRole('button', { name: 'Copy start prompt' }));
    expect(await screen.findByText("Couldn't copy")).toBeInTheDocument();
  });
});
