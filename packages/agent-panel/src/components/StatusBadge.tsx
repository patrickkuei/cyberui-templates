import { Badge } from 'cyberui-2045';
import { STATUS_VIEW } from '../theme/tones';
import type { AgentStatus } from '../data/types';

export interface StatusBadgeProps {
  status: AgentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const view = STATUS_VIEW[status];
  return (
    <Badge variant={view.badge} size="sm">
      {view.label}
    </Badge>
  );
}
