import { useState, type Dispatch, type ReactElement } from 'react';
import { Button, Slider } from 'cyberui-2045';
import type { Connection } from '../connection';
import { Glyph } from '../components/Glyph';
import { LinkRun } from '../components/LinkRun';
import { ScreenTitle } from '../components/ScreenTitle';
import { SignalBars } from '../components/SignalBars';
import { TouchRow } from '../components/TouchRow';
import { LEVEL } from '../data/devices';
import { LIGHT_PRESETS, THERMOSTAT_PRESETS } from '../data/presets';
import { DEVICE_COPY, LINK_WORDS, ROUTE_TITLES } from '../data/product';
import type { Device, TemperatureUnit } from '../data/types';
import { MinusIcon, PlusIcon } from '../icons';
import type { Action, AppState } from '../state/reducer';
import { glowLevel } from '../utils/glow';
import { WEAK_SIGNAL, isReachable, roomName } from '../utils/summary';
import { formatDegrees, formatTemp, fromDisplay, nudge, sliderScale, toDisplay } from '../utils/units';

interface DeviceScreenProps {
  state: AppState;
  dispatch: Dispatch<Action>;
  connection: Connection;
  /** The id from the hash, #/device/:id. */
  deviceId: string | undefined;
  /** Closes this pushed screen (router/useHashRoute.ts). */
  leave: () => void;
}

function PowerButton({ device, dispatch }: { device: Device & { on: boolean }; dispatch: Dispatch<Action> }) {
  return (
    <Button
      className="full-width"
      variant={device.on ? 'secondary' : 'primary'}
      onClick={() => dispatch({ type: 'device/toggle', id: device.id })}
    >
      {device.on ? DEVICE_COPY.turnOff : DEVICE_COPY.turnOn}
    </Button>
  );
}

/** A row of fixed presets. A preset is a button that sets a state, so the one that matches the device now is aria-pressed. */
function Presets({ title, children }: { title: string; children: ReactElement[] }) {
  return (
    <section className="presets" aria-label={title}>
      <h2 className="section-title">{title}</h2>
      <div className="preset-row">{children}</div>
    </section>
  );
}

function Preset({ label, value, active, onPress }: { label: string; value?: string; active: boolean; onPress: () => void }) {
  return (
    <button type="button" className="preset" aria-pressed={active} onClick={onPress}>
      <span>{label}</span>
      {value && <span className="preset-num">{value}</span>}
    </button>
  );
}

/**
 * The big numeral and what goes with it. A switch over the kind rather than a
 * Record<DeviceKind, ...> because each kind reads different fields; the return
 * type excludes undefined on purpose, so a new DeviceKind without a case is a
 * compile error here.
 */
function hero(device: Device, unit: TemperatureUnit): { value: string; unit?: string; caption?: string; dim?: boolean } {
  switch (device.kind) {
    case 'light':
      return device.on ? { value: String(device.level), unit: '%' } : { value: 'Off', dim: true };
    case 'plug':
      return device.on ? { value: String(device.watts), unit: 'W' } : { value: 'Off', dim: true };
    case 'thermostat':
      return {
        value: formatDegrees(device.targetC, unit),
        caption: `${device.on ? DEVICE_COPY.now : 'Off, now'} ${formatDegrees(device.currentC, unit)}`,
        dim: !device.on,
      };
    case 'sensor':
      return { value: formatDegrees(device.readingC, unit), caption: device.batteryLow ? DEVICE_COPY.batteryLow : undefined };
  }
}

function Controls({ device, unit, dispatch }: { device: Device; unit: TemperatureUnit; dispatch: Dispatch<Action> }): ReactElement | null {
  switch (device.kind) {
    case 'light':
      return (
        <>
          <TouchRow control="slider">
            <Slider
              className="slider-control"
              ariaLabel={DEVICE_COPY.lightLevel}
              variant="accent"
              size="lg"
              min={LEVEL.min}
              max={LEVEL.max}
              step={LEVEL.step}
              value={device.level}
              onValueChange={(value) => dispatch({ type: 'device/set-level', id: device.id, value })}
            />
          </TouchRow>
          <PowerButton device={device} dispatch={dispatch} />
          <Presets title={DEVICE_COPY.lightPresets}>
            {LIGHT_PRESETS.map((preset) => (
              <Preset
                key={preset.id}
                label={preset.label}
                value={String(preset.level)}
                active={device.on && device.level === preset.level}
                onPress={() => dispatch({ type: 'device/preset', id: device.id, presetId: preset.id })}
              />
            ))}
          </Presets>
        </>
      );
    case 'plug':
      return <PowerButton device={device} dispatch={dispatch} />;
    case 'thermostat': {
      const scale = sliderScale(unit);
      return (
        <>
          <TouchRow control="slider">
            <Slider
              className="slider-control"
              ariaLabel={DEVICE_COPY.target}
              variant="accent"
              size="lg"
              min={scale.min}
              max={scale.max}
              step={scale.step}
              // Stored in Celsius; the slider works in the displayed unit (utils/units.ts).
              value={unit === 'C' ? device.targetC : Math.round(toDisplay(device.targetC, unit))}
              onValueChange={(value) => dispatch({ type: 'device/set-target', id: device.id, valueC: fromDisplay(value, unit) })}
            />
          </TouchRow>
          <Presets title={DEVICE_COPY.thermostatPresets}>
            {THERMOSTAT_PRESETS.map((preset) => (
              <Preset
                key={preset.id}
                label={preset.label}
                value={preset.targetC === undefined ? undefined : formatDegrees(preset.targetC, unit)}
                active={preset.on ? device.on && device.targetC === preset.targetC : !device.on}
                onPress={() => dispatch({ type: 'device/preset', id: device.id, presetId: preset.id })}
              />
            ))}
          </Presets>
        </>
      );
    }
    case 'sensor':
      return <p className="note">{DEVICE_COPY.sensorNote}</p>;
  }
}

/**
 * One device, full page: the second depth. A big glyph that glows with the
 * device's level, its name and room, one big numeral, then whatever that kind
 * of device can be told to do, then the link. A device that cannot be reached
 * shows a dark glyph, one sentence, Reconnect and Remove, and nothing else: its
 * state is not trustworthy, so no control is offered for it.
 */
export function DeviceScreen({ state, dispatch, connection, deviceId, leave }: DeviceScreenProps) {
  const [reconnecting, setReconnecting] = useState(false);
  const device = state.devices.find((candidate) => candidate.id === deviceId);
  const { unit } = state.settings;

  if (!device) {
    return (
      <>
        <ScreenTitle>{ROUTE_TITLES.device}</ScreenTitle>
        <p className="note">{DEVICE_COPY.notFound}</p>
        <a className="text-link" href="#/devices">
          {DEVICE_COPY.notFoundBack}
        </a>
      </>
    );
  }

  const reachable = isReachable(device);
  const big = hero(device, unit);
  const weak = reachable && device.signal <= WEAK_SIGNAL;

  return (
    <>
      <div className={reachable ? 'hero' : 'hero hero--down'}>
        <div className="hero-glyph">
          <Glyph kind={device.kind} level={glowLevel(device)} />
        </div>
        <ScreenTitle>{device.name}</ScreenTitle>
        <p className="hero-room">{roomName(state.rooms, device.roomId)}</p>
        {device.link === 'connected' ? (
          <div className="hero-value">
            {device.kind === 'thermostat' && (
              <Button
                variant="secondary"
                className="stepper"
                aria-label={`Lower ${DEVICE_COPY.target.toLowerCase()}`}
                onClick={() => dispatch({ type: 'device/set-target', id: device.id, valueC: nudge(device.targetC, -1, unit) })}
              >
                <MinusIcon />
              </Button>
            )}
            <p
              className={big.dim ? 'numeral numeral--dim' : 'numeral'}
              // The thermostat has no slider-style announcement for the plus and
              // minus buttons, so its numeral is a polite live region.
              aria-live={device.kind === 'thermostat' ? 'polite' : undefined}
              aria-label={device.kind === 'thermostat' ? `${DEVICE_COPY.target} ${formatTemp(device.targetC, unit)}${device.on ? '' : ', off'}` : undefined}
            >
              {big.value}
              {big.unit && <span className="numeral-unit">{big.unit}</span>}
            </p>
            {device.kind === 'thermostat' && (
              <Button
                variant="secondary"
                className="stepper"
                aria-label={`Raise ${DEVICE_COPY.target.toLowerCase()}`}
                onClick={() => dispatch({ type: 'device/set-target', id: device.id, valueC: nudge(device.targetC, 1, unit) })}
              >
                <PlusIcon />
              </Button>
            )}
          </div>
        ) : (
          <p className="down-note">{`${LINK_WORDS[device.link]}. Controls are unavailable.`}</p>
        )}
        {reachable && big.caption && <p className="hero-caption">{big.caption}</p>}
      </div>

      {reachable && <Controls device={device} unit={unit} dispatch={dispatch} />}

      <section className="link-panel" aria-label={DEVICE_COPY.linkTitle}>
        <h2 className="section-title">{DEVICE_COPY.linkTitle}</h2>
        {reconnecting ? (
          <LinkRun
            connection={connection}
            id={device.id}
            onLinked={() => {
              dispatch({ type: 'device/reconnected', id: device.id });
              setReconnecting(false);
            }}
            onCancel={() => setReconnecting(false)}
          />
        ) : (
          <>
            <div className="link-facts">
              <SignalBars signal={reachable ? device.signal : 0} />
              <span className={weak ? 'link-text link-text--weak' : 'link-text'}>{reachable ? `${weak ? 'Weak, ' : ''}${device.latencyMs} ms` : 'No link'}</span>
            </div>
            {reachable ? (
              <Button variant="secondary" onClick={() => dispatch({ type: 'device/disconnect', id: device.id })}>
                {DEVICE_COPY.disconnect}
              </Button>
            ) : (
              <Button onClick={() => setReconnecting(true)}>{DEVICE_COPY.reconnect}</Button>
            )}
          </>
        )}
      </section>

      {/* The library's danger variant is 4.13:1 on its own surface (patrickkuei/CyberUI#128). It is kept rather than restyled, so a fix upstream reaches this button. */}
      <Button
        className="full-width"
        variant="danger"
        onClick={() => {
          dispatch({ type: 'device/remove', id: device.id });
          leave();
        }}
      >
        {DEVICE_COPY.remove}
      </Button>
    </>
  );
}
