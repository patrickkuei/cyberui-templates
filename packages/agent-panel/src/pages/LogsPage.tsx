import { useMemo } from 'react';
import { Card } from 'cyberui-2045';
import { SessionTable } from '../components/SessionTable';
import { createSessionLogs } from '../data/sessions';

export interface LogsPageProps {
  /** The reference time for the sample sessions ("5m ago"). */
  now: number;
}

export function LogsPage({ now }: LogsPageProps) {
  // Fixed fixtures (see data/sessions.ts): this is where a fork loads its real history.
  const sessions = useMemo(() => createSessionLogs(now), [now]);

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Logs</h1>
        <p className="page-subtitle">Sample sessions. These are fixed examples; wire in your own history.</p>
      </header>

      <section aria-label="Past sessions">
        <Card className="panel-surface">
          <SessionTable sessions={sessions} now={now} />
        </Card>
      </section>
    </>
  );
}
