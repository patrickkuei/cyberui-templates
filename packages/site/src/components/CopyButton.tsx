import { Button, useCyberNotifications } from 'cyberui-2045';

export interface CopyButtonProps {
  /** The text put on the clipboard. */
  text: string;
  /** The button's label. It does not change after a click: the toast says what happened. */
  label: string;
  /** `primary` glows in whatever accent the surrounding scope sets. Defaults to quiet. */
  variant?: 'primary' | 'secondary';
}

// Needs a CyberNotificationProvider above it (App.tsx has one; tests wrap
// with it). navigator.clipboard is undefined on insecure origins and rejects
// when permission is denied; both land in the same catch, so the user gets an
// error toast instead of an exception.
export function CopyButton({ text, label, variant = 'secondary' }: CopyButtonProps) {
  const { showNotification } = useCyberNotifications();

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('success', 'Copied', 'Paste it into your AI coding assistant.', { duration: 3000 });
    } catch {
      showNotification('error', "Couldn't copy", 'Open the fold below and copy the prompt by hand.');
    }
  }

  return (
    <Button variant={variant} onClick={copy}>
      {label}
    </Button>
  );
}
