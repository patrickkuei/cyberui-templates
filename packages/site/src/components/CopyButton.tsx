import { useState } from 'react';
import { Button } from 'cyberui-2045';

type CopyState = 'idle' | 'copied' | 'failed';

export interface CopyButtonProps {
  /** The text put on the clipboard. */
  text: string;
  /** The button's resting label. */
  label: string;
  /** `primary` glows in whatever accent the surrounding scope sets. Defaults to quiet. */
  variant?: 'primary' | 'secondary';
}

// navigator.clipboard is undefined on insecure origins and rejects when
// permission is denied; both land in the same catch, so the button reports
// failure instead of throwing.
export function CopyButton({ text, label, variant = 'secondary' }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
  }

  return (
    <>
      <Button variant={variant} onClick={copy}>
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : label}
      </Button>
      <span className="visually-hidden" role="status">
        {state === 'copied' ? 'Copied to clipboard' : state === 'failed' ? 'Could not copy' : ''}
      </span>
    </>
  );
}
