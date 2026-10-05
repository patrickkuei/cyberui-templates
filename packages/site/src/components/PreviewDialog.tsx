import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from 'cyberui-2045';

export interface PreviewDialogProps {
  isOpen: boolean;
  /** Called on Esc and on the close button. The parent owns whether the dialog is open. */
  onClose: () => void;
  title: string;
  /** Mounted only while the dialog is open, so an iframe inside never loads until asked for. */
  children: ReactNode;
}

// A native <dialog>, not cyberui-2045's Modal, on purpose. Modal v2.6.0 keeps
// aria-hidden="true" on the overlay that contains its open dialog (assistive
// technology may skip it), paints an accent border and glow that this page
// does not want, and has no size between xl (896px) and fullscreen. The
// native element gives the focus trap, Esc, focus return and inert
// background for free, so only the styling is ours (App.css, .preview-dialog).
//
// Esc is intercepted: the native `cancel` event would close the dialog behind
// the parent's back, leaving the URL (which is the open state) out of step.
export function PreviewDialog({ isOpen, onClose, title, children }: PreviewDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      className="preview-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // A click on the ::backdrop is delivered to the <dialog> itself, while a
      // click on anything inside it targets a child (the dialog has no padding).
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {isOpen && (
        <>
          <header className="preview-dialog-header">
            <h2 id={titleId}>{title}</h2>
            <Button variant="ghost" size="sm" aria-label="Close preview" onClick={onClose}>
              <span aria-hidden="true">✕</span>
            </Button>
          </header>
          <div className="preview-dialog-body">{children}</div>
        </>
      )}
    </dialog>
  );
}
