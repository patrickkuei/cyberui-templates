import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyButton } from './CopyButton';

function stubClipboard(writeText: ((text: string) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, 'clipboard', {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
}

describe('CopyButton', () => {
  afterEach(() => stubClipboard(undefined));

  it('copies the text and says so', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<CopyButton text="hello" label="Copy start prompt" />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy start prompt' }));
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard');
  });

  it('says the copy failed when the clipboard rejects', async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    render(<CopyButton text="hello" label="Copy start prompt" />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy start prompt' }));
    expect(screen.getByRole('button', { name: 'Copy failed' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Could not copy');
  });

  it('says the copy failed when there is no clipboard API at all (insecure context)', async () => {
    stubClipboard(undefined);
    render(<CopyButton text="hello" label="Copy start prompt" />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy start prompt' }));
    expect(screen.getByRole('button', { name: 'Copy failed' })).toBeInTheDocument();
  });
});
