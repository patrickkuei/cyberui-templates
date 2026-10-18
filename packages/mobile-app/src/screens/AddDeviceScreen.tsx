import { useEffect, useRef, useState, type ChangeEvent, type Dispatch, type FormEvent, type RefObject } from 'react';
import { Button, Input, Select } from 'cyberui-2045';
import { isAbort, type Connection } from '../connection';
import { Glyph } from '../components/Glyph';
import { LinkRun } from '../components/LinkRun';
import { ScreenTitle } from '../components/ScreenTitle';
import { SignalBars } from '../components/SignalBars';
import { CONNECT_COPY, KIND_LABELS, ROUTE_TITLES } from '../data/product';
import { DEVICE_KINDS, type Device, type DeviceKind, type NearbyDevice, type Room } from '../data/types';
import type { Action } from '../state/reducer';

interface AddDeviceScreenProps {
  devices: readonly Device[];
  rooms: readonly Room[];
  connection: Connection;
  dispatch: Dispatch<Action>;
  /** Closes this screen: Back when that is safe, otherwise Home (router/useHashRoute.ts). */
  leave: () => void;
}

/** What is being linked: a device the scan found, or a typed code (then nothing is known about it). */
interface Target {
  linkId: string;
  nearby: NearbyDevice | null;
}

// The steps of Connect, in order. Which one is showing is screen state, not app
// state: it is gone when the screen is left, and means nothing to the reducer.
type Step =
  | { name: 'start' }
  | { name: 'scanning' }
  | { name: 'results'; found: NearbyDevice[] }
  | { name: 'code' }
  | { name: 'link'; target: Target }
  | { name: 'details'; target: Target };

// Exactly six letters or numbers. Deliberately the only rule: nothing here can
// tell a real code from a made-up one, because nothing is paired (see LinkRun
// and connection/scripted.ts).
const CODE_PATTERN = /^[A-Za-z0-9]{6}$/;

/**
 * Connect: Scan, Pick, Link, then name and room. Every step that needs the
 * outside world goes through the Connection (connection/types.ts), which here
 * is scripted: the scan lists a fixed set of "nearby" devices after a progress
 * bar, and nothing is discovered. A scan starts only when the person taps Start
 * scan, never by itself. "Enter a code instead" is the way in when the device
 * is not listed.
 */
export function AddDeviceScreen({ devices, rooms, connection, dispatch, leave }: AddDeviceScreenProps) {
  const [step, setStep] = useState<Step>({ name: 'start' });
  const [percent, setPercent] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);

  // When the step changes, focus moves to its heading (tabIndex -1: only code
  // can focus it), so a keyboard or screen-reader user is not left on a button
  // that has just disappeared. Not on first load: the browser's own focus is right there.
  const shown = useRef(step.name);
  useEffect(() => {
    if (shown.current === step.name) return;
    shown.current = step.name;
    heading.current?.focus({ preventScroll: true });
  }, [step.name]);

  // The scan runs while this step is showing. Leaving the step (Cancel, or the
  // screen) aborts it, which also clears its timers.
  const scanning = step.name === 'scanning';
  useEffect(() => {
    if (!scanning) return;
    const controller = new AbortController();
    setPercent(0);
    connection
      .scan(setPercent, controller.signal)
      .then((found) => setStep({ name: 'results', found }))
      .catch((error: unknown) => {
        if (!isAbort(error)) throw error;
      });
    return () => controller.abort();
  }, [scanning, connection]);

  const toStart = () => setStep({ name: 'start' });
  const toCode = () => setStep({ name: 'code' });

  switch (step.name) {
    case 'start':
      return (
        <>
          <ScreenTitle>{ROUTE_TITLES.add}</ScreenTitle>
          <section className="step" aria-labelledby="step-title">
            <h2 id="step-title" className="step-title" tabIndex={-1} ref={heading}>
              {CONNECT_COPY.scanTitle}
            </h2>
            <p>{CONNECT_COPY.scanIntro}</p>
            <Button className="full-width" onClick={() => setStep({ name: 'scanning' })}>
              {CONNECT_COPY.scanStart}
            </Button>
            <p className="note">{CONNECT_COPY.scripted}</p>
            <button type="button" className="text-button" onClick={toCode}>
              {CONNECT_COPY.enterCode}
            </button>
          </section>
        </>
      );

    case 'scanning':
      return (
        <>
          <ScreenTitle>{ROUTE_TITLES.add}</ScreenTitle>
          <section className="step" aria-labelledby="step-title">
            <h2 id="step-title" className="step-title" tabIndex={-1} ref={heading}>
              {CONNECT_COPY.scanTitle}
            </h2>
            {/* Motion only while scanning and only if the person has not asked for less (App.css). The words below say the same. */}
            <span className="pulse" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <progress className="progress" max={100} value={percent} aria-label="Scan progress" />
            <p role="status" className="scan-status">
              {CONNECT_COPY.scanning}
            </p>
            <Button variant="secondary" onClick={toStart}>
              {CONNECT_COPY.stopScan}
            </Button>
          </section>
        </>
      );

    case 'results': {
      // A device that is already in the home is not offered again.
      const left = step.found.filter((nearby) => !devices.some((device) => device.id === nearby.id));
      return (
        <>
          <ScreenTitle>{ROUTE_TITLES.add}</ScreenTitle>
          <section className="step" aria-labelledby="step-title">
            <h2 id="step-title" className="step-title" tabIndex={-1} ref={heading}>
              {left.length === 0 ? CONNECT_COPY.noneLeft : CONNECT_COPY.found(left.length)}
            </h2>
            {left.length > 0 && (
              <ul className="nearby-list">
                {left.map((nearby) => (
                  <li key={nearby.id}>
                    {/* One tap picks it and starts the link. The whole row is the target, 64px high. */}
                    <button type="button" className="nearby-row" onClick={() => setStep({ name: 'link', target: { linkId: nearby.id, nearby } })}>
                      <span className="glyph-button glyph-button--static">
                        <Glyph kind={nearby.kind} level={0} />
                      </span>
                      <span className="device-text">
                        <span className="device-name">{nearby.name}</span>
                        <span className="device-meta">{KIND_LABELS[nearby.kind]}</span>
                      </span>
                      <SignalBars signal={nearby.signal} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="secondary" onClick={() => setStep({ name: 'scanning' })}>
              {CONNECT_COPY.scanAgain}
            </Button>
            <button type="button" className="text-button" onClick={toCode}>
              {CONNECT_COPY.enterCode}
            </button>
          </section>
        </>
      );
    }

    case 'code':
      return (
        <>
          <ScreenTitle>{ROUTE_TITLES.add}</ScreenTitle>
          <CodeStep heading={heading} onBack={toStart} onCode={(code) => setStep({ name: 'link', target: { linkId: code, nearby: null } })} />
        </>
      );

    case 'link':
      return (
        <>
          <ScreenTitle>{ROUTE_TITLES.add}</ScreenTitle>
          <section className="step" aria-labelledby="step-title">
            <h2 id="step-title" className="step-title" tabIndex={-1} ref={heading}>
              {CONNECT_COPY.linkTitle}
              {step.target.nearby ? ` ${step.target.nearby.name}` : ''}
            </h2>
            <LinkRun connection={connection} id={step.target.linkId} onLinked={() => setStep({ name: 'details', target: step.target })} onCancel={toStart} />
          </section>
        </>
      );

    case 'details':
      return (
        <>
          <ScreenTitle>{ROUTE_TITLES.add}</ScreenTitle>
          <DetailsStep heading={heading} target={step.target} rooms={rooms} dispatch={dispatch} leave={leave} />
        </>
      );
  }
}

function CodeStep({ heading, onBack, onCode }: { heading: RefObject<HTMLHeadingElement | null>; onBack: () => void; onCode: (code: string) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value.toUpperCase());
    if (error) setError(undefined);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!CODE_PATTERN.test(code)) {
      setError(CONNECT_COPY.codeError);
      // Input does not announce a new error (patrickkuei/CyberUI#121) and takes
      // no ref, so focus goes to the field by name.
      (event.currentTarget.elements.namedItem('code') as HTMLInputElement | null)?.focus();
      return;
    }
    // MOCK: the six characters were checked for shape and are handed to the
    // Connection as the thing to link. Nothing can tell a real code from a
    // made-up one here; a real Connection would.
    onCode(code);
  };

  return (
    <section className="step" aria-labelledby="step-title">
      <h2 id="step-title" className="step-title" tabIndex={-1} ref={heading}>
        {CONNECT_COPY.codeTitle}
      </h2>
      <form className="add-form" onSubmit={onSubmit} noValidate>
        <Input
          label={CONNECT_COPY.codeLabel}
          name="code"
          type="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          maxLength={CONNECT_COPY.codeLength}
          aria-required="true"
          helperText={CONNECT_COPY.codeHelp}
          value={code}
          onChange={onChange}
          error={error}
        />
        <div className="form-actions">
          <Button type="submit">{CONNECT_COPY.codeSubmit}</Button>
          <Button type="button" variant="secondary" onClick={onBack}>
            {CONNECT_COPY.backToScan}
          </Button>
        </div>
      </form>
    </section>
  );
}

function DetailsStep({
  heading,
  target,
  rooms,
  dispatch,
  leave,
}: {
  heading: RefObject<HTMLHeadingElement | null>;
  target: Target;
  rooms: readonly Room[];
  dispatch: Dispatch<Action>;
  leave: () => void;
}) {
  const [name, setName] = useState(target.nearby?.name ?? '');
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? '');
  const [kind, setKind] = useState<DeviceKind>(DEVICE_KINDS[0]!);
  const [error, setError] = useState<string | undefined>();

  const onName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    if (error) setError(undefined);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim() === '') {
      setError(CONNECT_COPY.nameError);
      (event.currentTarget.elements.namedItem('name') as HTMLInputElement | null)?.focus();
      return;
    }
    // MOCK: nothing was paired. A real app adds the device once the link
    // succeeded, and the Connection already said so.
    dispatch({
      type: 'device/add',
      draft: { id: target.nearby?.id, name: name.trim(), roomId, kind: target.nearby?.kind ?? kind, signal: target.nearby?.signal },
    });
    leave();
  };

  return (
    <section className="step" aria-labelledby="step-title">
      <h2 id="step-title" className="step-title" tabIndex={-1} ref={heading}>
        {CONNECT_COPY.detailsTitle}
      </h2>
      <form className="add-form" onSubmit={onSubmit} noValidate>
        <Input
          label={CONNECT_COPY.nameLabel}
          name="name"
          type="text"
          autoComplete="off"
          enterKeyHint="next"
          maxLength={CONNECT_COPY.nameMaxLength}
          aria-required="true"
          value={name}
          onChange={onName}
          error={error}
        />
        {rooms.length === 0 ? (
          <p className="note">
            There are no rooms yet. <a href="#/add-room">Add a room</a> first.
          </p>
        ) : (
          /*
            Select is the library's native <select>, so a phone opens its own
            picker, which is what a thumb wants. variant="secondary" because
            Select's default variant glows with --color-primary (magenta) where
            Input's default uses the accent. No Select is given an `error`:
            Select does not tie it to the field with aria-invalid or
            aria-describedby (patrickkuei/CyberUI#129), and every option is valid.
          */
          <Select
            label={CONNECT_COPY.roomLabel}
            name="room"
            variant="secondary"
            options={rooms.map((room) => ({ value: room.id, label: room.name }))}
            value={roomId}
            onValueChange={setRoomId}
          />
        )}
        {/* A scanned device already says what it is; one added by code does not. */}
        {target.nearby === null && (
          <Select
            label={CONNECT_COPY.kindLabel}
            name="kind"
            variant="secondary"
            options={DEVICE_KINDS.map((option) => ({ value: option, label: KIND_LABELS[option] }))}
            value={kind}
            onValueChange={(value) => setKind(value as DeviceKind)}
          />
        )}
        <div className="form-actions">
          <Button type="submit" disabled={rooms.length === 0}>
            {CONNECT_COPY.save}
          </Button>
          <Button type="button" variant="secondary" onClick={leave}>
            {CONNECT_COPY.cancel}
          </Button>
        </div>
      </form>
    </section>
  );
}
