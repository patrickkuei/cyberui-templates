import { useState, type ChangeEvent, type Dispatch, type FormEvent } from 'react';
import { Button, Input, Select } from 'cyberui-2045';
import { ScreenTitle } from '../components/ScreenTitle';
import { ADD_DEVICE, KIND_LABELS, ROUTE_TITLES } from '../data/product';
import { DEVICE_KINDS, ROOMS, type DeviceKind, type Room } from '../data/types';
import type { Action } from '../state/reducer';

interface AddDeviceScreenProps {
  dispatch: Dispatch<Action>;
  /** Closes this screen: Back when that is safe, otherwise Devices (router/useHashRoute.ts). */
  leave: () => void;
}

// Exactly six letters or numbers. Deliberately the only rule: nothing here can
// tell a real code from a made-up one, because nothing is paired (see onSubmit).
const CODE_PATTERN = /^[A-Za-z0-9]{6}$/;

const ROOM_OPTIONS = ROOMS.map((room) => ({ value: room, label: room }));
const KIND_OPTIONS = DEVICE_KINDS.map((kind) => ({ value: kind, label: KIND_LABELS[kind] }));

export function AddDeviceScreen({ dispatch, leave }: AddDeviceScreenProps) {
  const [name, setName] = useState('');
  const [room, setRoom] = useState<Room>(ROOMS[0]);
  const [kind, setKind] = useState<DeviceKind>(DEVICE_KINDS[0]!);
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});

  const onName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
  };
  const onCode = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value.toUpperCase());
    if (errors.code) setErrors((current) => ({ ...current, code: undefined }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found: { name?: string; code?: string } = {};
    if (name.trim() === '') found.name = ADD_DEVICE.nameError;
    if (!CODE_PATTERN.test(code)) found.code = ADD_DEVICE.codeError;
    if (found.name || found.code) {
      setErrors(found);
      // Focus goes to the first field with a problem so a screen reader reads
      // its label and the linked error together. Input does not announce a new
      // error by itself (patrickkuei/CyberUI#121; drop this if it is fixed in
      // the version you use) and does not forward a ref, so find the field by name.
      const first = found.name ? 'name' : 'code';
      (event.currentTarget.elements.namedItem(first) as HTMLInputElement | null)?.focus();
      return;
    }
    // MOCK: nothing is paired. The six characters were checked for shape and are
    // not kept or sent. A real app would pair here (a request to your hub, a
    // Bluetooth or QR flow) and dispatch 'device/add' only once that succeeds.
    dispatch({ type: 'device/add', draft: { name: name.trim(), room, kind } });
    leave();
  };

  return (
    <>
      <ScreenTitle>{ROUTE_TITLES.add}</ScreenTitle>
      {/*
        noValidate: the browser's own validation bubble would pre-empt the
        messages below, which are the ones this template words and links to
        the field. The Save row is sticky inside the form (not a fixed bar), so
        it stays reachable above the on-screen keyboard without covering a field.
      */}
      <form className="add-form" onSubmit={onSubmit} noValidate>
        <Input
          label={ADD_DEVICE.nameLabel}
          name="name"
          type="text"
          placeholder={ADD_DEVICE.namePlaceholder}
          autoComplete="off"
          enterKeyHint="next"
          maxLength={ADD_DEVICE.nameMaxLength}
          aria-required="true"
          value={name}
          onChange={onName}
          error={errors.name}
        />
        {/*
          Select is the library's native <select>, so a phone opens its own
          picker, which is what a thumb wants. variant="secondary" because
          Select's default variant glows with --color-primary (magenta) where
          Input's default uses the accent, so the two would not match. No Select
          here is given an `error`: Select does not tie it to the field with
          aria-invalid or aria-describedby (patrickkuei/CyberUI#129), and every
          option is valid anyway.
        */}
        <Select
          label={ADD_DEVICE.roomLabel}
          name="room"
          variant="secondary"
          options={ROOM_OPTIONS}
          value={room}
          onValueChange={(value) => setRoom(value as Room)}
        />
        <Select
          label={ADD_DEVICE.kindLabel}
          name="kind"
          variant="secondary"
          options={KIND_OPTIONS}
          value={kind}
          onValueChange={(value) => setKind(value as DeviceKind)}
        />
        <Input
          label={ADD_DEVICE.codeLabel}
          name="code"
          type="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          maxLength={ADD_DEVICE.codeLength}
          aria-required="true"
          helperText={ADD_DEVICE.codeHelp}
          value={code}
          onChange={onCode}
          error={errors.code}
        />
        <div className="form-actions">
          <Button type="submit">{ADD_DEVICE.save}</Button>
          <Button type="button" variant="secondary" onClick={leave}>
            {ADD_DEVICE.cancel}
          </Button>
        </div>
      </form>
    </>
  );
}
