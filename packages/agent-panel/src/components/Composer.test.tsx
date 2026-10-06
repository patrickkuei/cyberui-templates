import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Composer } from './Composer';
import { SUGGESTED_PROMPTS } from '../data/scenarios';

const HELPER = 'Scripted demo: replies are pre-written. Nothing is sent to a model or leaves your browser.';

function renderComposer(props: Partial<React.ComponentProps<typeof Composer>> = {}) {
  const onSend = vi.fn();
  render(<Composer onSend={onSend} disabledReason={null} suggested={SUGGESTED_PROMPTS} {...props} />);
  return { onSend, input: screen.getByRole('textbox', { name: 'Message Vesper' }) };
}

describe('Composer', () => {
  it('sends the trimmed text on Enter and clears the box', async () => {
    const { onSend, input } = renderComposer();
    await userEvent.type(input, '  hello there  {enter}');
    expect(onSend).toHaveBeenCalledWith('hello there');
    expect(input).toHaveValue('');
  });

  it('sends with the Send button', async () => {
    const { onSend, input } = renderComposer();
    await userEvent.type(input, 'hello');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSend).toHaveBeenCalledWith('hello');
  });

  it('does not send a blank message', async () => {
    const { onSend, input } = renderComposer();
    await userEvent.type(input, '   {enter}');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('fills the box from a suggested prompt without sending it', async () => {
    const { onSend, input } = renderComposer();
    await userEvent.click(screen.getByRole('button', { name: SUGGESTED_PROMPTS[0]!.label }));
    expect(input).toHaveValue(SUGGESTED_PROMPTS[0]!.text);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('disables the box, Send and the chips when there is a reason, and shows the reason', () => {
    const { input } = renderComposer({ disabledReason: 'The agent is paused. Resume it to send a message.' });
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    expect(screen.getByRole('button', { name: SUGGESTED_PROMPTS[0]!.label })).toBeDisabled();
    expect(screen.getByText('The agent is paused. Resume it to send a message.')).toBeInTheDocument();
  });

  it('always carries the "Scripted demo" helper line (Review Focus #8)', () => {
    renderComposer();
    expect(screen.getByText(HELPER)).toBeInTheDocument();
  });

  it('carries the helper line in the disabled state too (Review Focus #8)', () => {
    renderComposer({ disabledReason: 'Vesper is working…' });
    expect(screen.getByText(HELPER)).toBeInTheDocument();
  });
});
