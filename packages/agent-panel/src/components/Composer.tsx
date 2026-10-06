import { useState, type FormEvent } from 'react';
import { Button, Input } from 'cyberui-2045';

export interface ComposerProps {
  onSend: (text: string) => void;
  /** Why sending is not possible right now; null when it is. Shown above the box. */
  disabledReason: string | null;
  /** One-click prompts that fill the box. They are written to match a scripted scenario. */
  suggested: { label: string; text: string }[];
}

export function Composer({ onSend, disabledReason, suggested }: ComposerProps) {
  const [text, setText] = useState('');
  const disabled = disabledReason !== null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const body = text.trim();
    if (!body || disabled) return;
    onSend(body);
    setText('');
  };

  return (
    <form className="composer" onSubmit={submit}>
      {disabledReason && (
        <p className="composer-reason" role="status">
          {disabledReason}
        </p>
      )}
      <div className="suggested-prompts">
        {suggested.map((prompt) => (
          <button key={prompt.label} type="button" className="chip" disabled={disabled} onClick={() => setText(prompt.text)}>
            {prompt.label}
          </button>
        ))}
      </div>
      <div className="composer-row">
        <div className="composer-input">
          <Input
            label="Message Vesper"
            value={text}
            disabled={disabled}
            onChange={(event) => setText(event.target.value)}
            // Always shown, in every state: nothing here talks to a model, and
            // the line says so where a person is about to type.
            helperText="Scripted demo: replies are pre-written. Nothing is sent to a model or leaves your browser."
          />
        </div>
        <Button type="submit" size="md" disabled={disabled}>
          Send
        </Button>
      </div>
    </form>
  );
}
