import { describe, it, expect, vi, afterEach } from 'vitest';
import { CyberNotificationProvider } from 'cyberui-2045';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StartBlock } from './StartBlock';
import { startPrompt, terminalSteps } from '../content/start';

describe('StartBlock', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
  });

  it('copies the start prompt for this template', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<StartBlock name="AI Product Monitoring" slug="monitoring" accentHex="#00fff9" />, { wrapper: CyberNotificationProvider });
    await userEvent.click(screen.getByRole('button', { name: 'Copy start prompt' }));
    expect(writeText).toHaveBeenCalledWith(startPrompt('AI Product Monitoring', 'monitoring'));
  });

  it("scopes the template's accent to the copy button, including the gradient the primary button actually paints with", () => {
    const { container } = render(<StartBlock name="Agent Control Panel" slug="agent-panel" accentHex="#c084fc" />, { wrapper: CyberNotificationProvider });
    const scope = container.querySelector<HTMLElement>('.template-start-copy')!;
    expect(scope.style.getPropertyValue('--color-accent')).toBe('#c084fc');
    expect(scope.style.getPropertyValue('--gradient-accent')).toBe('135deg, #c084fc 10%, #c084fc 90%');
  });

  it('explains where to paste it and what it does', () => {
    render(<StartBlock name="AI Product Monitoring" slug="monitoring" accentHex="#00fff9" />, { wrapper: CyberNotificationProvider });
    expect(screen.getByText(/Paste it into your AI coding assistant/)).toBeInTheDocument();
    expect(screen.getByText('my-app')).toBeInTheDocument();
  });

  it('folds the full prompt and the terminal route together, closed to start', () => {
    const { container } = render(<StartBlock name="AI Product Monitoring" slug="monitoring" accentHex="#00fff9" />, { wrapper: CyberNotificationProvider });
    const fold = screen.getByRole('button', { name: /See the prompt, or use the terminal instead/ });
    expect(fold).toHaveAttribute('aria-expanded', 'false');
    const blocks = container.querySelectorAll('pre');
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toHaveTextContent(startPrompt('AI Product Monitoring', 'monitoring'));
    expect(blocks[1]!.textContent).toBe(terminalSteps('monitoring').join('\n'));
    expect(screen.getByText('Needs Node 20.19 or newer.')).toBeInTheDocument();
  });

  it('opens the fold on click', async () => {
    render(<StartBlock name="AI Product Monitoring" slug="monitoring" accentHex="#00fff9" />, { wrapper: CyberNotificationProvider });
    const fold = screen.getByRole('button', { name: /See the prompt, or use the terminal instead/ });
    await userEvent.click(fold);
    expect(fold).toHaveAttribute('aria-expanded', 'true');
  });
});
