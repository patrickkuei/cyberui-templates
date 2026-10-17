import type { Dispatch, ReactElement } from 'react';
import { Button, Drawer, Slider, Toggle } from 'cyberui-2045';
import { BRIGHTNESS } from '../data/devices';
import type { Device, TemperatureUnit } from '../data/types';
import type { Action } from '../state/reducer';
import { describeDevice } from '../utils/describeDevice';
import { fromDisplay, sliderScale, toDisplay } from '../utils/units';
import { StatusBadge } from './StatusBadge';
import { TouchRow } from './TouchRow';

interface DeviceSheetProps {
  /** The device whose controls are open, or undefined when the sheet is closed. */
  device: Device | undefined;
  unit: TemperatureUnit;
  dispatch: Dispatch<Action>;
  onClose: () => void;
}

function PowerSwitch({ device, dispatch }: { device: Device; dispatch: Dispatch<Action> }) {
  if (device.kind === 'sensor') return null;
  return (
    <TouchRow control="switch">
      {/* Toggle needs an id for its visible label to name the switch (patrickkuei/CyberUI#120). */}
      <Toggle
        id={`sheet-power-${device.id}`}
        label="Power"
        role="switch"
        variant="accent"
        size="lg"
        checked={device.on}
        disabled={device.status === 'offline'}
        onChange={() => dispatch({ type: 'device/toggle', id: device.id })}
      />
    </TouchRow>
  );
}

// A switch over the kind rather than a Record<DeviceKind, Component>: each kind
// reads different fields, and TypeScript cannot match a component picked from a
// Record to the narrowed device it needs. The return type excludes undefined on
// purpose, so a new DeviceKind without a case is a compile error here.
function Controls({ device, unit, dispatch }: { device: Device; unit: TemperatureUnit; dispatch: Dispatch<Action> }): ReactElement | null {
  const disabled = device.status === 'offline';
  switch (device.kind) {
    case 'light':
      return (
        <>
          <PowerSwitch device={device} dispatch={dispatch} />
          <TouchRow control="slider">
            <Slider
              className="slider-control"
              label="Brightness"
              variant="accent"
              size="lg"
              min={BRIGHTNESS.min}
              max={BRIGHTNESS.max}
              step={BRIGHTNESS.step}
              value={device.brightness}
              onValueChange={(value) => dispatch({ type: 'device/set-brightness', id: device.id, value })}
              showValue
              formatValue={(value) => `${value}%`}
              disabled={disabled}
            />
          </TouchRow>
        </>
      );
    case 'plug':
      return <PowerSwitch device={device} dispatch={dispatch} />;
    case 'thermostat': {
      const scale = sliderScale(unit);
      return (
        <>
          <PowerSwitch device={device} dispatch={dispatch} />
          <TouchRow control="slider">
            <Slider
              className="slider-control"
              label="Target temperature"
              variant="accent"
              size="lg"
              min={scale.min}
              max={scale.max}
              step={scale.step}
              // Stored in Celsius; the slider works in the displayed unit (utils/units.ts).
              value={unit === 'C' ? device.targetC : Math.round(toDisplay(device.targetC, unit))}
              onValueChange={(value) => dispatch({ type: 'device/set-target', id: device.id, valueC: fromDisplay(value, unit) })}
              showValue
              formatValue={(value) => `${value} °${unit}`}
              disabled={disabled}
            />
          </TouchRow>
        </>
      );
    }
    case 'sensor':
      return <p className="sheet-reading">Reading: {describeDevice(device, unit)}</p>;
  }
}

/**
 * The device's controls in a bottom sheet. This is the template's list-action
 * pattern: every action is a visible, labelled control (nothing hides behind a
 * swipe or a hover), so a thumb, a keyboard and a screen reader all reach it.
 *
 * Drawer facts that are not in its types (cyberui-2045 2.8.0):
 * - It is only animated out by its own close button, Escape and a tap on the
 *   backdrop. Setting isOpen to false from here (the Done and Remove buttons)
 *   unmounts it at once, and no focus is restored: DevicesScreen puts focus
 *   back on the row's button itself.
 * - It is aria-modal but does not trap Tab (patrickkuei/CyberUI#123), its
 *   border animation cycles through hard-coded colours (#124) and its title is
 *   3.45:1 on its surface (#125). So: no `title` (the heading below is ours),
 *   the glow is switched off in App.css (.device-sheet), and the template does
 *   not work around the missing focus trap.
 * - Its close button is a 32px target, so showCloseButton is false and Done is
 *   the 44px way out. It sizes the panel to a fixed height by `size`; App.css
 *   lets the content decide instead.
 * - The panel is full width. App.css centres it in the app's column on wide
 *   screens and pads it for the home indicator (safe-area and dvh support is
 *   an open feature request, patrickkuei/CyberUI#132).
 * - Setting isOpen to false from the parent restores no focus, unlike Escape
 *   (patrickkuei/CyberUI#130), which is why DevicesScreen does it.
 */
export function DeviceSheet({ device, unit, dispatch, onClose }: DeviceSheetProps) {
  return (
    <Drawer
      isOpen={device !== undefined}
      onClose={onClose}
      side="bottom"
      showCloseButton={false}
      ariaLabel={device ? `${device.name} controls` : 'Device controls'}
      className="device-sheet"
    >
      {device && (
        <div className="sheet">
          <div className="sheet-header">
            <h2 className="sheet-title">{device.name}</h2>
            <p className="sheet-sub">
              {device.room} <StatusBadge status={device.status} />
            </p>
          </div>
          <div className="sheet-controls">
            <Controls device={device} unit={unit} dispatch={dispatch} />
          </div>
          {device.status === 'offline' && <p className="sheet-note">This device is offline, so its controls are switched off.</p>}
          <div className="sheet-actions">
            {/* The library's danger variant is 4.13:1 on this surface (patrickkuei/CyberUI#128). It is kept rather than restyled, so a fix upstream reaches this button. */}
            <Button variant="danger" onClick={() => dispatch({ type: 'device/remove', id: device.id })}>
              Remove device
            </Button>
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
