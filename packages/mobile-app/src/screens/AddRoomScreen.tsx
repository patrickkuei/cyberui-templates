import { useState, type ChangeEvent, type Dispatch, type FormEvent } from 'react';
import { Button, Input } from 'cyberui-2045';
import { ScreenTitle } from '../components/ScreenTitle';
import { ADD_ROOM, ROUTE_TITLES } from '../data/product';
import type { Room } from '../data/types';
import type { Action } from '../state/reducer';
import { roomNameProblem } from '../utils/summary';

interface AddRoomScreenProps {
  rooms: readonly Room[];
  dispatch: Dispatch<Action>;
  /** Closes this screen: Back when that is safe, otherwise Rooms (router/useHashRoute.ts). */
  leave: () => void;
}

/** One field, no icon picker: a room is a name. The rules (required, unique ignoring case, a length cap) are roomNameProblem and the input's maxLength. */
export function AddRoomScreen({ rooms, dispatch, leave }: AddRoomScreenProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();

  const onName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    if (error) setError(undefined);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const problem = roomNameProblem(name, rooms);
    if (problem) {
      setError(ADD_ROOM.errors[problem]);
      // Input does not announce a new error by itself (patrickkuei/CyberUI#121)
      // and takes no ref, so focus goes to the field by name: a screen reader
      // then reads its label and the linked error together.
      (event.currentTarget.elements.namedItem('name') as HTMLInputElement | null)?.focus();
      return;
    }
    dispatch({ type: 'room/add', name });
    leave();
  };

  return (
    <>
      <ScreenTitle>{ROUTE_TITLES['add-room']}</ScreenTitle>
      {/* noValidate: the browser's own validation bubble would pre-empt the message below, which is the one this template words and links to the field. */}
      <form className="add-form" onSubmit={onSubmit} noValidate>
        <Input
          label={ADD_ROOM.nameLabel}
          name="name"
          type="text"
          placeholder={ADD_ROOM.namePlaceholder}
          autoComplete="off"
          enterKeyHint="done"
          maxLength={ADD_ROOM.maxLength}
          aria-required="true"
          value={name}
          onChange={onName}
          error={error}
        />
        <div className="form-actions">
          <Button type="submit">{ADD_ROOM.save}</Button>
          <Button type="button" variant="secondary" onClick={leave}>
            {ADD_ROOM.cancel}
          </Button>
        </div>
      </form>
    </>
  );
}
