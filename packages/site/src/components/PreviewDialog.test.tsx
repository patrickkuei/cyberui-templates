import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreviewDialog } from './PreviewDialog';

function renderDialog(isOpen: boolean, onClose = vi.fn()) {
  const view = render(
    <PreviewDialog isOpen={isOpen} onClose={onClose} title="Preview title">
      <p>inside</p>
    </PreviewDialog>
  );
  const dialog = () => view.container.querySelector('dialog')!;
  return { ...view, dialog, onClose };
}

describe('PreviewDialog', () => {
  it('keeps its children out of the DOM while closed', () => {
    const { dialog } = renderDialog(false);
    expect(dialog()).not.toHaveAttribute('open');
    expect(screen.queryByText('inside')).not.toBeInTheDocument();
  });

  it('opens as a modal dialog labelled by its title', () => {
    const { dialog } = renderDialog(true);
    expect(dialog()).toHaveAttribute('open');
    expect(screen.getByText('inside')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { name: 'Preview title' });
    expect(dialog().getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('asks the parent to close on Esc instead of closing itself (the URL must stay in step)', () => {
    const { dialog, onClose } = renderDialog(true);
    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(dialog(), cancel);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(cancel.defaultPrevented).toBe(true);
    expect(dialog()).toHaveAttribute('open');
  });

  it('asks the parent to close from the close button', async () => {
    const { onClose } = renderDialog(true);
    await userEvent.click(screen.getByRole('button', { name: 'Close preview' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes and unmounts its children when isOpen goes false', () => {
    const { rerender, dialog } = renderDialog(true);
    rerender(
      <PreviewDialog isOpen={false} onClose={() => {}} title="Preview title">
        <p>inside</p>
      </PreviewDialog>
    );
    expect(dialog()).not.toHaveAttribute('open');
    expect(screen.queryByText('inside')).not.toBeInTheDocument();
  });
});
