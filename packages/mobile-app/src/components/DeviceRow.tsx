import { Toggle } from 'cyberui-2045';
import type { Device, TemperatureUnit } from '../data/types';
import { KIND_ICONS } from '../icons';
import { describeDevice } from '../utils/describeDevice';
import { StatusBadge } from './StatusBadge';
import { TouchRow } from './TouchRow';

/** The id of a row's "open the controls" button. The Devices screen focuses it again when the sheet closes. */
export const rowButtonId = (deviceId: string) => `device-open-${deviceId}`;

interface DeviceRowProps {
  device: Device;
  unit: TemperatureUnit;
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
}

// Two separate controls side by side, never one inside the other: the main
// button opens the sheet, and the switch is a sibling, because a switch nested
// in a button is invalid and breaks both for assistive technology.
export function DeviceRow({ device, unit, onToggle, onOpen }: DeviceRowProps) {
  const Icon = KIND_ICONS[device.kind];
  return (
    <li className="device-row">
      <button type="button" id={rowButtonId(device.id)} className="device-main" aria-haspopup="dialog" onClick={() => onOpen(device.id)}>
        <span className="device-icon">
          <Icon />
        </span>
        <span className="device-text">
          <span className="device-name">{device.name}</span>
          <span className="device-meta">
            <StatusBadge status={device.status} />
            {/* A sensor's reading is shown at the right instead of a switch, so it is not repeated here. */}
            {device.kind !== 'sensor' && <span className="device-detail">{describeDevice(device, unit)}</span>}
          </span>
        </span>
      </button>
      {device.kind === 'sensor' ? (
        <span className="device-reading">{describeDevice(device, unit)}</span>
      ) : (
        <TouchRow control="switch">
          {/*
            An id and an accessible name are both needed. Toggle only connects its
            visible `label` to the switch through the id, and this row has no
            visible label, so aria-label (spread onto the input) names it; without
            either, a screen reader announces an unnamed checkbox
            (patrickkuei/CyberUI#120). role="switch" says what it does.
            An offline device cannot be controlled, so its switch is disabled.
          */}
          <Toggle
            id={`power-${device.id}`}
            aria-label={`${device.name} power`}
            role="switch"
            variant="accent"
            size="lg"
            checked={device.on}
            disabled={device.status === 'offline'}
            onChange={() => onToggle(device.id)}
          />
        </TouchRow>
      )}
    </li>
  );
}
