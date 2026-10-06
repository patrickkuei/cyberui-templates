import { Badge } from 'cyberui-2045';
import { TASK_BADGE } from '../theme/tones';
import type { TaskStatus } from '../data/types';

export interface TaskStatusBadgeProps {
  status: TaskStatus;
}

/** The status is the badge's text as well as its colour ("failed", not just red). */
export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return (
    <Badge variant={TASK_BADGE[status]} size="sm">
      {status}
    </Badge>
  );
}
