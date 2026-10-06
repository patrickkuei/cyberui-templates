import { Avatar, Badge, Button } from 'cyberui-2045';
import { STATUS_VIEW } from '../theme/tones';
import { StatusBadge } from './StatusBadge';
import type { AgentStatus } from '../data/types';

export interface AgentHeaderProps {
  status: AgentStatus;
  paused: boolean;
  /** Whether a run is active; Stop run is only meaningful then. */
  running: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function AgentHeader({ status, paused, running, onPause, onResume, onStop, onReset }: AgentHeaderProps) {
  return (
    <header className="agent-header">
      <div className="agent-identity">
        <Avatar alt="Vesper" initials="V" status={STATUS_VIEW[status].avatar} />
        <h1 className="page-title">Vesper</h1>
        {/* Always visible, in every state: the whole agent is a script, and a forker or a visitor to the live preview should never have to guess. */}
        <Badge variant="accent" size="sm">
          Simulated
        </Badge>
        <StatusBadge status={status} />
      </div>
      <div className="agent-controls">
        {paused ? (
          <Button variant="secondary" size="sm" onClick={onResume}>
            Resume
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={onPause}>
            Pause
          </Button>
        )}
        <Button variant="danger" size="sm" onClick={onStop} disabled={!running}>
          Stop run
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>
    </header>
  );
}
