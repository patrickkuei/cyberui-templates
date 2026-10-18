import { useEffect, useRef, useState } from 'react';
import { Button } from 'cyberui-2045';
import { LINK_STEPS, LinkError, isAbort, type Connection, type LinkStep } from '../connection';
import { CONNECT_COPY, LINK_STEP_LABELS } from '../data/product';
import { CheckIcon, CrossIcon } from '../icons';

interface RunState {
  status: 'running' | 'done' | 'failed';
  step: LinkStep;
  percent: number;
  message?: string;
}

interface LinkRunProps {
  connection: Connection;
  /** What to link: a nearby id, an existing device's id (Reconnect) or a typed pairing code. */
  id: string;
  /** Called once the link is ready and its checklist has been on screen for a moment. */
  onLinked: () => void;
  onCancel: () => void;
  /** How long the finished checklist stays before onLinked. Tests pass 0. */
  settleMs?: number;
}

type RowState = 'done' | 'active' | 'failed' | 'pending';

function rowState(index: number, run: RunState): RowState {
  if (run.status === 'done') return 'done';
  const current = LINK_STEPS.indexOf(run.step);
  if (index < current) return 'done';
  if (index > current) return 'pending';
  return run.status === 'failed' ? 'failed' : 'active';
}

const ROW_WORDS: Record<RowState, string> = { done: 'done', active: 'in progress', failed: 'failed', pending: 'waiting' };

/**
 * The handshake as a checklist with a progress bar: Add device uses it after a
 * device is picked and the device page uses it for Reconnect, so the two look
 * and fail the same way. It asks the Connection (connection/types.ts) to link
 * and only draws what the Connection reports; whether the link works is the
 * Connection's business, and the scripted one fails for exactly one device
 * (data/nearby.ts) so the failed state can be seen. Leaving the screen aborts
 * the link and its timers.
 */
export function LinkRun({ connection, id, onLinked, onCancel, settleMs = 600 }: LinkRunProps) {
  const [attempt, setAttempt] = useState(0);
  const [run, setRun] = useState<RunState>({ status: 'running', step: LINK_STEPS[0], percent: 0 });
  // The latest callback, read when the link finishes, so a parent re-rendering
  // with a new function does not restart the link.
  const linked = useRef(onLinked);
  useEffect(() => {
    linked.current = onLinked;
  }, [onLinked]);

  useEffect(() => {
    const controller = new AbortController();
    let settle: ReturnType<typeof setTimeout> | undefined;
    setRun({ status: 'running', step: LINK_STEPS[0], percent: 0 });
    // The Connection should honour its AbortSignal (connection/types.ts), but
    // a screen cannot rely on that: an implementation that ignores it would
    // otherwise report progress, success or failure for a link this effect has
    // already abandoned (Cancel, the screen left, another id). Every callback
    // below therefore checks the signal itself.
    connection
      .link(
        id,
        ({ step, percent }) => {
          if (!controller.signal.aborted) setRun({ status: 'running', step, percent });
        },
        controller.signal,
      )
      .then(() => {
        if (controller.signal.aborted) return;
        setRun((previous) => ({ status: 'done', step: previous.step, percent: 100 }));
        settle = setTimeout(() => linked.current(), settleMs);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbort(error)) return;
        const message = error instanceof Error ? error.message : 'Something went wrong';
        setRun((previous) => ({ status: 'failed', step: error instanceof LinkError ? error.step : previous.step, percent: previous.percent, message }));
      });
    return () => {
      controller.abort();
      clearTimeout(settle);
    };
  }, [connection, id, attempt, settleMs]);

  const statusText = run.status === 'failed' ? `${CONNECT_COPY.linkFailed}: ${run.message}` : run.status === 'done' ? 'Linked.' : 'Linking…';

  return (
    <div className="link-run">
      <ol className="link-steps">
        {LINK_STEPS.map((step, index) => {
          const state = rowState(index, run);
          return (
            <li key={step} className={`link-step link-step--${state}`} aria-current={state === 'active' ? 'step' : undefined}>
              <span className="link-step-mark" aria-hidden="true">
                {state === 'done' ? <CheckIcon /> : state === 'failed' ? <CrossIcon /> : null}
              </span>
              <span>{LINK_STEP_LABELS[step]}</span>
              <span className="sr-only">{`: ${ROW_WORDS[state]}`}</span>
            </li>
          );
        })}
      </ol>
      <progress className="progress" max={100} value={run.percent} aria-label="Link progress" />
      {/* role="status" is a polite live region; it is in the page from the start, before its text changes. */}
      <p role="status" className={run.status === 'failed' ? 'link-status link-status--failed' : 'link-status'}>
        {statusText}
      </p>
      <div className="stack">
        {run.status === 'failed' && <Button onClick={() => setAttempt((count) => count + 1)}>{CONNECT_COPY.tryAgain}</Button>}
        {run.status !== 'done' && (
          <Button variant="secondary" onClick={onCancel}>
            {CONNECT_COPY.cancel}
          </Button>
        )}
      </div>
    </div>
  );
}
