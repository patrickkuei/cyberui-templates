import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { LINK_STEPS, LinkError, createScriptedConnection, type Connection, type LinkProgress } from '../connection';
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

// The Connection contract says link() should honour its AbortSignal, but a screen
// cannot assume every implementation does (a real Bluetooth or MQTT client may
// not). These tests use a Connection that ignores the signal completely and
// settles only when the test says so.
function stubbornConnection() {
  const calls: { id: string; progress: (p: LinkProgress) => void; resolve: () => void; reject: (e: unknown) => void }[] = [];
  const stubborn: Connection = {
    scan: () => new Promise(() => {}),
    link: (id, progress) =>
      new Promise<void>((resolve, reject) => {
        calls.push({ id, progress, resolve, reject });
      }),
  };
  return { stubborn, calls };
}

describe('LinkRun with a Connection that ignores its AbortSignal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  const flush = (ms = 10) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

  it('is not moved by a link it replaced: late progress and late success of the old id are ignored', async () => {
    const { stubborn, calls } = stubbornConnection();
    const onLinked = vi.fn();
    const { rerender } = render(<LinkRun connection={stubborn} id="a" onLinked={onLinked} onCancel={vi.fn()} settleMs={0} />);
    rerender(<LinkRun connection={stubborn} id="b" onLinked={onLinked} onCancel={vi.fn()} settleMs={0} />);
    const [first, second] = calls;
    await act(async () => { first!.progress({ step: 'pairing', percent: 50 }); });
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
    first!.resolve();
    await flush();
    expect(onLinked).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Linking…');
    second!.resolve();
    await flush();
    expect(onLinked).toHaveBeenCalledTimes(1);
  });

  it('ignores a late failure of a replaced link', async () => {
    const { stubborn, calls } = stubbornConnection();
    const { rerender } = render(<LinkRun connection={stubborn} id="a" onLinked={vi.fn()} onCancel={vi.fn()} />);
    rerender(<LinkRun connection={stubborn} id="b" onLinked={vi.fn()} onCancel={vi.fn()} />);
    calls[0]!.reject(new Error('late'));
    await flush();
    expect(screen.getByRole('status')).toHaveTextContent('Linking…');
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  it('does nothing after it is unmounted, however late the connection answers', async () => {
    const { stubborn, calls } = stubbornConnection();
    const onLinked = vi.fn();
    const { unmount } = render(<LinkRun connection={stubborn} id="a" onLinked={onLinked} onCancel={vi.fn()} settleMs={0} />);
    unmount();
    calls[0]!.resolve();
    await flush();
    expect(onLinked).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('LinkRun timers and failed rows', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

  it('leaves no timer when it is unmounted after the link finished but before it settled', async () => {
    const onLinked = vi.fn();
    const { unmount } = render(<LinkRun connection={connection} id="shelf-lamp" onLinked={onLinked} onCancel={vi.fn()} settleMs={300} />);
    await advance(400);
    expect(screen.getByRole('status')).toHaveTextContent('Linked.');
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    await advance(1000);
    expect(onLinked).not.toHaveBeenCalled();
  });

  it('marks the row of the step a LinkError names, even when the connection never reported that step', async () => {
    const odd: Connection = {
      scan: () => new Promise(() => {}),
      link: (_id, progress) => {
        progress({ step: LINK_STEPS[0], percent: 0 });
        return Promise.reject(new LinkError('Rejected at the end', 'ready'));
      },
    };
    render(<LinkRun connection={odd} id="x" onLinked={vi.fn()} onCancel={vi.fn()} />);
    await advance(1);
    const states = within(screen.getByRole('list')).getAllByRole('listitem').map((step) => step.textContent?.split(': ')[1]);
    expect(states).toEqual(['done', 'done', 'done', 'failed']);
    expect(screen.getByRole('status')).toHaveTextContent('The link failed: Rejected at the end');
  });
});
