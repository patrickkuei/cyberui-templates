import { useMemo, useState } from 'react';
import { Badge, Button, Input, Pagination, TabNavigation, Table } from 'cyberui-2045';
import type { TableColumn } from 'cyberui-2045';
import type { SessionLog, SessionOutcome } from '../data/sessions';
import { OUTCOME_BADGE } from '../theme/tones';
import { formatRelativeTime } from '../utils/format';

export interface SessionTableProps {
  sessions: SessionLog[];
  /** The reference time for "5m ago". Passed in so the rendering is stable and testable. */
  now: number;
}

const PAGE_SIZE = 6;

// TabNavigation takes labels (strings), not ids, so the active tab is stored as
// a label from this tuple. The Record turns each label into the outcome it
// filters to (null means no filter), and makes a tab without a meaning a type error.
const FILTER_TABS = ['All', 'Resolved', 'Escalated', 'Abandoned'] as const;
type FilterTab = (typeof FILTER_TABS)[number];
const TAB_OUTCOME: Record<FilterTab, SessionOutcome | null> = {
  All: null,
  Resolved: 'resolved',
  Escalated: 'escalated',
  Abandoned: 'abandoned',
};

const isFilterTab = (value: string): value is FilterTab => (FILTER_TABS as readonly string[]).includes(value);

export function SessionTable({ sessions, now }: SessionTableProps) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<FilterTab>('All');
  const [page, setPage] = useState(1);
  const [exported, setExported] = useState(false);

  const filtered = useMemo(() => {
    const outcome = TAB_OUTCOME[tab];
    const needle = query.trim().toLowerCase();
    return sessions.filter(
      (session) => (outcome === null || session.outcome === outcome) && session.title.toLowerCase().includes(needle),
    );
  }, [sessions, tab, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Searching or filtering sets the page back to 1 (see the handlers); the clamp
  // is only a safety net so a shrinking list can never leave an empty page showing.
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const columns: TableColumn<SessionLog>[] = [
    { key: 'title', header: 'Session' },
    { key: 'startedAt', header: 'Started', render: (row) => formatRelativeTime(row.startedAt, now) },
    { key: 'messageCount', header: 'Messages', align: 'right' },
    { key: 'toolCalls', header: 'Tool calls', align: 'right' },
    { key: 'durationMin', header: 'Duration', align: 'right', render: (row) => `${row.durationMin} min` },
    {
      key: 'outcome',
      header: 'Outcome',
      render: (row) => (
        <Badge variant={OUTCOME_BADGE[row.outcome]} size="sm">
          {row.outcome}
        </Badge>
      ),
    },
  ];

  return (
    <div className="session-table">
      <div className="session-controls">
        <Input
          label="Search sessions"
          placeholder="Search by title"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
        <TabNavigation
          tabs={FILTER_TABS}
          activeTab={tab}
          onTabChange={(next) => {
            if (isFilterTab(next)) {
              setTab(next);
              setPage(1);
            }
          }}
        />
      </div>

      <Table
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        variant="striped"
        ariaLabel="Past sessions"
        emptyMessage="No sessions match."
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          size="sm"
          variant="secondary"
          ariaLabel="Past sessions pages"
          className="session-pagination"
        />
      )}

      <div className="session-footer">
        {/* A mock, on purpose: it changes this label and does nothing else, so a fork
            does not mistake it for a working export. To make it real, build the file
            here (a Blob and an anchor click) from the session being exported. */}
        {!exported ? (
          <Button variant="secondary" size="sm" onClick={() => setExported(true)}>
            Export transcript
          </Button>
        ) : (
          <>
            <span className="export-done">Exported</span>
            <span className="export-note">Demo only: nothing was saved.</span>
          </>
        )}
      </div>
    </div>
  );
}
