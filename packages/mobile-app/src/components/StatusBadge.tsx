import { Badge } from 'cyberui-2045';
import type { DeviceStatus } from '../data/types';

// Record<DeviceStatus, ...>: a new status without a label and a colour is a
// compile error. The three colours are the library's own status colours, left
// alone by the blue accent (theme/blue.css), which is why blue was chosen.
const STATUS_VIEW: Record<DeviceStatus, { label: string; variant: 'success' | 'warning' | 'error' }> = {
  online: { label: 'Online', variant: 'success' },
  'low-battery': { label: 'Low battery', variant: 'warning' },
  offline: { label: 'Offline', variant: 'error' },
};

export function StatusBadge({ status }: { status: DeviceStatus }) {
  const { label, variant } = STATUS_VIEW[status];
  // Filled badges carry dark text (--color-inverse), 5.3:1 or better on all three.
  // shadow={false}: a flat badge is less noisy in a dense list.
  return (
    <Badge variant={variant} size="sm" shape="rounded" shadow={false}>
      {label}
    </Badge>
  );
}
