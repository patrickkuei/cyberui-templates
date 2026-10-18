import type { Device, TemperatureUnit } from '../data/types';
import { BatteryLowIcon, WeakSignalIcon } from '../icons';
import { describeDevice } from '../utils/describeDevice';
import { glowLevel } from '../utils/glow';
import { attentionOf, isOn, isReachable, isSwitchable } from '../utils/summary';
import { Glyph } from './Glyph';

interface DeviceRowProps {
  device: Device;
  unit: TemperatureUnit;
  onToggle: (id: string) => void;
}

/** The link to a device's own page. Rows and the Rooms screen both build it here. */
export const devicePath = (deviceId: string) => `#/device/${encodeURIComponent(deviceId)}`;

/**
 * One device on Home. Two sibling controls, never one inside the other (a
 * switch nested in a link is invalid and breaks both for assistive technology):
 *  - the glyph is the quick power button, and is lit when the device is on;
 *  - the rest of the row is a link to the device's page, where the full
 *    controls live. That is the app's "two depths": glance and flip a switch
 *    here, go one tap deeper to do anything else.
 * A sensor has no power state, so its glyph is not a button and its reading is
 * the row's value. A device that cannot be reached shows the word for it
 * ("Lost", "Offline") in a dashed, muted row, and its button is disabled.
 */
export function DeviceRow({ device, unit, onToggle }: DeviceRowProps) {
  const reachable = isReachable(device);
  const reasons = attentionOf(device);
  const classes = ['device-row', reachable ? '' : 'device-row--down', device.kind === 'sensor' ? 'device-row--sensor' : ''].filter(Boolean).join(' ');
  return (
    <li className={classes}>
      {isSwitchable(device) ? (
        // role="switch" and aria-checked: it is a button that sets a state. The
        // glyph inside is decorative, the state is in aria-checked, and the
        // name says what it switches ("Desk lamp power").
        <button
          type="button"
          role="switch"
          aria-checked={reachable && device.on}
          aria-label={`${device.name} power`}
          className="glyph-button"
          disabled={!reachable}
          onClick={() => onToggle(device.id)}
        >
          <Glyph kind={device.kind} level={glowLevel(device)} />
        </button>
      ) : (
        <span className="glyph-button glyph-button--static">
          <Glyph kind={device.kind} level={glowLevel(device)} />
        </span>
      )}
      <a className="device-link" href={devicePath(device.id)}>
        <span className="device-text">
          <span className="device-name">{device.name}</span>
          {/* Status only by exception: a small amber mark, and words for assistive technology. */}
          {reasons.includes('battery') && (
            <span className="mark">
              <BatteryLowIcon />
              <span className="sr-only">Low battery</span>
            </span>
          )}
          {reasons.includes('weak') && (
            <span className="mark">
              <WeakSignalIcon />
              <span className="sr-only">Weak signal</span>
            </span>
          )}
        </span>
        <span className={isOn(device) ? 'device-value device-value--on' : 'device-value'}>{describeDevice(device, unit)}</span>
      </a>
      {device.kind === 'light' && reachable && (
        // A thin bar under the row: its fill is the light's level, and empty while the light is off.
        <svg className="level-bar" viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <rect className="level-bar-fill" width={device.on ? device.level : 0} height="2" />
        </svg>
      )}
    </li>
  );
}
