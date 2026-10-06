import type { Message } from '../data/types';

export interface MessageBubbleProps {
  message: Message;
  /** Whether this message's run is the one the trace is showing. */
  selected: boolean;
  onSelect: (runId: string) => void;
}

export function MessageBubble({ message, selected, onSelect }: MessageBubbleProps) {
  // Agent messages stream in, so only the revealed part is shown. An empty
  // string would render an unlabelled empty button, hence the ellipsis.
  const text = message.text.slice(0, message.revealed) || '…';

  if (message.role === 'user') {
    return (
      <div className="bubble-wrap bubble-wrap--user">
        <span className="bubble-author">You</span>
        <div className="bubble bubble--user">{text}</div>
      </div>
    );
  }

  const { runId } = message;
  return (
    <div className="bubble-wrap bubble-wrap--agent">
      <span className="bubble-author">Vesper</span>
      {runId ? (
        // A real button, so it is keyboard reachable: choosing it shows that
        // run's steps in the reasoning trace, and choosing it again goes back to
        // following the latest run (it is a toggle, as aria-pressed says; see
        // ConversationPanel). The author label sits outside the button so the
        // accessible name is just the message.
        <button
          type="button"
          className={selected ? 'bubble bubble--agent bubble--selected' : 'bubble bubble--agent'}
          aria-pressed={selected}
          title={selected ? 'Showing this message’s trace. Click again to follow the latest run.' : 'Show the reasoning trace for this message'}
          onClick={() => onSelect(runId)}
        >
          {text}
        </button>
      ) : (
        <div className="bubble bubble--agent">{text}</div>
      )}
    </div>
  );
}
