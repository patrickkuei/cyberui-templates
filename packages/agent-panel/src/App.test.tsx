import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const APPROVAL_PROMPT = 'Refund $42.00 to the customer for order #4821?';

function goTo(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event('hashchange'));
  });
}

const nav = () => within(screen.getByRole('navigation', { name: 'Primary' }));
const region = (name: string) => within(screen.getByRole('region', { name }));

describe('App', () => {
  afterEach(() => {
    window.location.hash = '';
    vi.useRealTimers();
  });

  it('renders the Console by default, with the primary nav', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Vesper' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Conversation' })).toBeInTheDocument();
    expect(nav().getByRole('link', { name: 'Console' })).toHaveAttribute('aria-current', 'page');
  });

  it('navigates Console, Tasks and Logs through real links', async () => {
    render(<App />);
    await userEvent.click(nav().getByRole('link', { name: 'Tasks' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Tasks' })).toBeInTheDocument();
    expect(nav().getByRole('link', { name: 'Tasks' })).toHaveAttribute('aria-current', 'page');
    expect(nav().getByRole('link', { name: 'Console' })).not.toHaveAttribute('aria-current');

    await userEvent.click(nav().getByRole('link', { name: 'Logs' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Logs' })).toBeInTheDocument();

    await userEvent.click(nav().getByRole('link', { name: 'Console' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Vesper' })).toBeInTheDocument();
  });

  it('falls back to the Console for an unknown hash', () => {
    window.location.hash = '#/nope';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Vesper' })).toBeInTheDocument();
  });

  it('keeps the document title in step with the route', () => {
    render(<App />);
    expect(document.title).toBe('Console — Vesper Control');
    goTo('#/logs');
    expect(document.title).toBe('Logs — Vesper Control');
  });

  it('shows the agent status in the nav on every route', () => {
    render(<App />);
    expect(nav().getByText('Idle')).toBeInTheDocument();
    goTo('#/tasks');
    expect(nav().getByText('Idle')).toBeInTheDocument();
  });

  describe('end to end, with a fake clock', () => {
    // Every tick is 250ms (TICK_MS). The cap turns a hung run into a failing test instead of a hung one.
    function advanceUntil(done: () => boolean) {
      for (let i = 0; i < 400 && !done(); i++) {
        act(() => {
          vi.advanceTimersByTime(250);
        });
      }
      expect(done(), 'the simulation did not get there').toBe(true);
    }

    // fireEvent, not userEvent, in these two tests: Testing Library's async
    // wrapper waits on a real setTimeout, which a vitest fake clock never fires,
    // so every awaited userEvent call would hang.
    function askForRefund() {
      vi.useFakeTimers();
      render(<App />);
      fireEvent.click(region('Conversation').getByRole('button', { name: 'Refund an order' }));
      fireEvent.click(region('Conversation').getByRole('button', { name: 'Send' }));
      advanceUntil(() => screen.queryByRole('group', { name: APPROVAL_PROMPT }) !== null);
    }

    it('approving: waits for the person, then finishes the refund', () => {
      askForRefund();
      // Waiting shows in the nav, the Live status panel and the header; the nav is the one under test here.
      expect(nav().getByText('Waiting for approval')).toBeInTheDocument();
      expect(region('Reasoning trace').getByText('Approval: Waiting for your approval')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Approve' })).toHaveFocus();

      fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
      advanceUntil(() => nav().queryByText('Idle') !== null);

      expect(region('Conversation').getByText(/The \$42\.00 refund for order #4821 is processed/)).toBeInTheDocument();
      expect(screen.queryByRole('group', { name: APPROVAL_PROMPT })).not.toBeInTheDocument();

      goTo('#/tasks');
      const row = within(screen.getByRole('table', { name: 'Tasks' }).querySelector('tbody')!);
      const refundRow = row.getByText('Process refund #4821').closest('tr')!;
      expect(within(refundRow).getByText('done')).toBeInTheDocument();
    });

    it('rejecting: leaves the order alone and creates no refund task', () => {
      askForRefund();
      fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
      advanceUntil(() => nav().queryByText('Idle') !== null);

      expect(region('Conversation').getByText(/left order #4821 untouched/)).toBeInTheDocument();
      goTo('#/tasks');
      expect(screen.queryByText('Process refund #4821')).not.toBeInTheDocument();
    });
  });
});
