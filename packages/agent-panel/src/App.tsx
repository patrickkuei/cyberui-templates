import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Badge } from 'cyberui-2045';
import { CHARS_PER_TICK } from './data/limits';
import { useSimulatedAgent } from './data/useSimulatedAgent';
import { deriveStatus } from './data/simulation';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { ROUTES, useHashRoute, type Route } from './router/useHashRoute';
import { STATUS_VIEW } from './theme/tones';
import { ConsolePage } from './pages/ConsolePage';
import { TasksPage } from './pages/TasksPage';
import { LogsPage } from './pages/LogsPage';
import './App.css';

// Record<Route, ...> (here and for the pages below) makes adding a route
// without a label or a page a type error, instead of a blank <main>.
const ROUTE_LABELS: Record<Route, string> = {
  console: 'Console',
  tasks: 'Tasks',
  logs: 'Logs',
};

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  // Everything on screen comes from this one hook (see its comment for how to
  // swap in a real agent). Under reduced motion a reply appears whole instead of typing in.
  const { state, actions } = useSimulatedAgent({ charsPerTick: reducedMotion ? Infinity : CHARS_PER_TICK });
  // Lives here, not in ConsolePage, so the picked run survives leaving and returning to the Console.
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const route = useHashRoute();
  const status = deriveStatus(state);

  // Sending a message goes back to following the latest run, and a reset throws
  // the old runs away, so a picked run could point at nothing.
  const send = useCallback(
    (text: string) => {
      setSelectedRunId(null);
      actions.send(text);
    },
    [actions],
  );
  const reset = useCallback(() => {
    setSelectedRunId(null);
    actions.reset();
  }, [actions]);

  useEffect(() => {
    document.title = `${ROUTE_LABELS[route]} — Vesper Control`;
  }, [route]);

  const pages: Record<Route, () => ReactNode> = {
    console: () => (
      <ConsolePage
        agent={{ state, actions: { ...actions, send, reset } }}
        selectedRunId={selectedRunId}
        onSelectRun={setSelectedRunId}
      />
    ),
    tasks: () => <TasksPage tasks={state.tasks} onCancel={actions.cancelTask} onRetry={actions.retryTask} />,
    logs: () => <LogsPage now={state.startedAt} />,
  };

  return (
    <div className="agent-panel">
      <nav className="topnav" aria-label="Primary">
        <div className="topnav-brand">
          <span className="topnav-logo" aria-hidden="true">
            ⬡
          </span>
          <span className="topnav-name">Vesper</span>
        </div>
        <div className="topnav-links">
          {ROUTES.map((itemRoute) => (
            <a
              key={itemRoute}
              href={`#/${itemRoute}`}
              className={route === itemRoute ? 'topnav-link topnav-link--active' : 'topnav-link'}
              aria-current={route === itemRoute ? 'page' : undefined}
            >
              {ROUTE_LABELS[itemRoute]}
            </a>
          ))}
        </div>
        <div className="topnav-status" role="status">
          <span className="live-dot" aria-hidden="true" />
          <Badge variant={STATUS_VIEW[status].badge}>{STATUS_VIEW[status].label}</Badge>
        </div>
      </nav>
      <main className="panel-body">{pages[route]()}</main>
    </div>
  );
}
