import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionTable } from './SessionTable';
import { createSessionLogs } from '../data/sessions';
import { OUTCOME_BADGE } from '../theme/tones';

const NOW = 50_000_000_000;

function renderTable() {
  render(<SessionTable sessions={createSessionLogs(NOW)} now={NOW} />);
  const table = () => within(screen.getByRole('table', { name: 'Past sessions' }));
  // The header row is a row too.
  const bodyRows = () => table().getAllByRole('row').length - 1;
  return { table, bodyRows };
}

describe('SessionTable', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows 6 sessions on the first page, newest first', () => {
    const { table, bodyRows } = renderTable();
    expect(bodyRows()).toBe(6);
    expect(table().getByText('Refund for order #4790')).toBeInTheDocument();
  });

  it('pages through all 14: 6, 6 and 2', async () => {
    const { bodyRows } = renderTable();
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(bodyRows()).toBe(6);
    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(bodyRows()).toBe(2);
  });

  it('searches by title, ignoring case', async () => {
    const { table, bodyRows } = renderTable();
    await userEvent.type(screen.getByRole('textbox', { name: 'Search sessions' }), 'REFUND');
    expect(bodyRows()).toBe(3);
    expect(table().queryByText('Password reset loop')).not.toBeInTheDocument();
  });

  it('goes back to page 1 when the search changes, instead of stranding you on an empty page', async () => {
    const { bodyRows } = renderTable();
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Search sessions' }), 'release');
    expect(bodyRows()).toBe(2);
  });

  it('filters by outcome with the tabs', async () => {
    const { bodyRows } = renderTable();
    await userEvent.click(screen.getByRole('tab', { name: 'Escalated' }));
    expect(bodyRows()).toBe(3);
    await userEvent.click(screen.getByRole('tab', { name: 'All' }));
    expect(bodyRows()).toBe(6);
  });

  it('says so when nothing matches', async () => {
    renderTable();
    await userEvent.type(screen.getByRole('textbox', { name: 'Search sessions' }), 'zzzz');
    expect(screen.getByText('No sessions match.')).toBeInTheDocument();
  });

  it('says each outcome in words in the table', async () => {
    const { table } = renderTable();
    expect(table().getAllByText('resolved').length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('tab', { name: 'Abandoned' }));
    expect(table().getAllByText('abandoned').length).toBeGreaterThan(0);
  });

  it('has a badge variant for every outcome', () => {
    expect(OUTCOME_BADGE).toEqual({ resolved: 'success', escalated: 'warning', abandoned: 'error' });
  });

  it('Export transcript is a mock: it shows "Exported" and starts no download (Review Focus #8)', async () => {
    // happy-dom may not define createObjectURL; define it so there is something to spy on.
    const createObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, writable: true, value: createObjectURL });
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click');
    renderTable();
    await userEvent.click(screen.getByRole('button', { name: 'Export transcript' }));
    expect(screen.getByText('Exported')).toBeInTheDocument();
    expect(screen.getByText('Demo only: nothing was saved.')).toBeInTheDocument();
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(anchorClick).not.toHaveBeenCalled();
  });
});
