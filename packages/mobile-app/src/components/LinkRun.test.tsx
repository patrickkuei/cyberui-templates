import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createScriptedConnection } from '../connection';
import { LinkRun } from './LinkRun';

// Everything here runs on fake timers: the scripted connection takes
// 4 steps x 100ms, and no test waits for real time. userEvent waits on real
// timers between its steps, which a fake clock never fires, so presses here are
// fireEvent (synchronous), not userEvent.
const connection = createScriptedConnection({ stepMs: 100 });
const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const steps = () => within(screen.getByRole('list')).getAllByRole('listitem');

describe('LinkRun', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at the first step with an empty progress bar and a Cancel button', () => {
    render(<LinkRun connection={connection} id="shelf-lamp" onLinked={vi.fn()} onCancel={vi.fn()} />);
    expect(steps().map((step) => step.textContent)).toEqual([
      'Device found: in progress',
      'Pairing code accepted: waiting',
      'Securing the link: waiting',
      'Ready: waiting',
    ]);
    expect(screen.getByRole('progressbar', { name: 'Link progress' })).toHaveAttribute('value', '0');
    expect(screen.getByRole('status')).toHaveTextContent('Linking…');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('ticks the steps off as the connection reports them, and moves the bar', async () => {
    render(<LinkRun connection={connection} id="shelf-lamp" onLinked={vi.fn()} onCancel={vi.fn()} />);
    await advance(100);
    expect(steps()[0]).toHaveTextContent('Device found: done');
    expect(steps()[1]).toHaveTextContent('Pairing code accepted: in progress');
    expect(steps()[1]).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '25');
    await advance(200);
    expect(steps()[2]).toHaveTextContent('Securing the link: done');
    expect(steps()[3]).toHaveTextContent('Ready: in progress');
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '75');
  });

  it('shows every step done and says Linked, then calls onLinked once after the settle time', async () => {
    const onLinked = vi.fn();
    render(<LinkRun connection={connection} id="shelf-lamp" onLinked={onLinked} onCancel={vi.fn()} settleMs={300} />);
    await advance(400);
    expect(steps().map((step) => step.textContent?.split(': ')[1])).toEqual(['done', 'done', 'done', 'done']);
    expect(screen.getByRole('status')).toHaveTextContent('Linked.');
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '100');
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    expect(onLinked).not.toHaveBeenCalled();
    await advance(300);
    expect(onLinked).toHaveBeenCalledTimes(1);
    await advance(2000);
    expect(onLinked).toHaveBeenCalledTimes(1);
  });

  it('marks the step that failed, shows the reason, and offers Try again and Cancel', async () => {
    const onLinked = vi.fn();
    render(<LinkRun connection={connection} id="hall-light" onLinked={onLinked} onCancel={vi.fn()} />);
    await advance(1000);
    expect(steps().map((step) => step.textContent?.split(': ')[1])).toEqual(['done', 'done', 'failed', 'waiting']);
    expect(screen.getByRole('status')).toHaveTextContent('The link failed: No response from the hub');
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '50');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(onLinked).not.toHaveBeenCalled();
  });

  it('starts over from the first step on Try again, and fails the same way, since the script says it does', async () => {
    render(<LinkRun connection={connection} id="hall-light" onLinked={vi.fn()} onCancel={vi.fn()} />);
    await advance(1000);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(steps()[0]).toHaveTextContent('Device found: in progress');
    expect(screen.getByRole('status')).toHaveTextContent('Linking…');
    await advance(1000);
    expect(screen.getByRole('status')).toHaveTextContent('The link failed: No response from the hub');
  });

  it('calls onCancel from Cancel, and stops: nothing more is reported', async () => {
    const onCancel = vi.fn();
    const onLinked = vi.fn();
    const { unmount } = render(<LinkRun connection={connection} id="shelf-lamp" onLinked={onLinked} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    unmount();
    await advance(5000);
    expect(onLinked).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('aborts the link when it is unmounted part-way, so no timer is left behind', async () => {
    const { unmount } = render(<LinkRun connection={connection} id="shelf-lamp" onLinked={vi.fn()} onCancel={vi.fn()} />);
    await advance(150);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('is not told it failed by a link it replaced: when the id changes mid-link the old one is aborted and the new one runs on', async () => {
    const onLinked = vi.fn();
    const { rerender } = render(<LinkRun connection={connection} id="shelf-lamp" onLinked={onLinked} onCancel={vi.fn()} settleMs={0} />);
    await advance(150);
    rerender(<LinkRun connection={connection} id="kettle-plug" onLinked={onLinked} onCancel={vi.fn()} settleMs={0} />);
    // Let the old link's rejection arrive: it must not be mistaken for a failure of the new one.
    await advance(1);
    expect(steps()[0]).toHaveTextContent('Device found: in progress');
    expect(screen.getByRole('status')).toHaveTextContent('Linking…');
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
    await advance(500);
    expect(screen.getByRole('status')).toHaveTextContent('Linked.');
    expect(onLinked).toHaveBeenCalledTimes(1);
  });

  it('does not restart the link when its owner passes a new onLinked', async () => {
    const link = vi.fn(connection.link);
    const counting = { ...connection, link };
    const { rerender } = render(<LinkRun connection={counting} id="shelf-lamp" onLinked={vi.fn()} onCancel={vi.fn()} />);
    rerender(<LinkRun connection={counting} id="shelf-lamp" onLinked={vi.fn()} onCancel={vi.fn()} />);
    expect(link).toHaveBeenCalledTimes(1);
  });

  it('uses the latest onLinked when the link finishes', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<LinkRun connection={connection} id="shelf-lamp" onLinked={first} onCancel={vi.fn()} settleMs={0} />);
    rerender(<LinkRun connection={connection} id="shelf-lamp" onLinked={second} onCancel={vi.fn()} settleMs={0} />);
    await advance(500);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
