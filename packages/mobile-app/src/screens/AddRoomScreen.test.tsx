import { useReducer } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInitialState, reducer } from '../state/reducer';
import { AddRoomScreen } from './AddRoomScreen';

function Harness({ leave = vi.fn() }: { leave?: () => void }) {
  const [state, dispatch] = useReducer(reducer, createInitialState());
  return (
    <>
      <AddRoomScreen rooms={state.rooms} dispatch={dispatch} leave={leave} />
      <ul aria-label="rooms">
        {state.rooms.map((room) => (
          <li key={room.id}>{room.name}</li>
        ))}
      </ul>
    </>
  );
}

const name = () => screen.getByLabelText('Room name');
const save = () => screen.getByRole('button', { name: 'Add room' });

describe('AddRoomScreen', () => {
  it('has one h1 and one field: a name, with no icon picker and no other control', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { level: 1, name: 'Add room' })).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['Add room', 'Cancel']);
  });

  it('adds the room and leaves the screen', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(name(), 'Kitchen');
    await userEvent.click(save());
    expect(screen.getByRole('list', { name: 'rooms' })).toHaveTextContent('Kitchen');
    expect(leave).toHaveBeenCalledTimes(1);
  });

  it('adds a room from the keyboard with Enter', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(name(), 'Study{Enter}');
    expect(screen.getByRole('list', { name: 'rooms' })).toHaveTextContent('Study');
    expect(leave).toHaveBeenCalled();
  });

  it('requires a name: shows the error, links it to the field, keeps focus there and adds nothing', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(name(), '   ');
    await userEvent.click(save());
    expect(name()).toHaveAttribute('aria-invalid', 'true');
    expect(name()).toHaveAccessibleDescription('Enter a name for the room.');
    expect(name()).toHaveFocus();
    expect(leave).not.toHaveBeenCalled();
    expect(screen.getByRole('list', { name: 'rooms' }).children).toHaveLength(3);
  });

  it('refuses a name that is taken, ignoring case and spaces', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(name(), ' living ROOM ');
    await userEvent.click(save());
    expect(name()).toHaveAccessibleDescription('There is already a room with that name.');
    expect(leave).not.toHaveBeenCalled();
  });

  it('clears the error once the person types again', async () => {
    render(<Harness />);
    await userEvent.click(save());
    expect(name()).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(name(), 'K');
    expect(name()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('caps the length of a name', () => {
    render(<Harness />);
    expect(name()).toHaveAttribute('maxlength', '24');
  });

  it('leaves from Cancel without adding anything, even with a name typed', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(name(), 'Kitchen');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(leave).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('list', { name: 'rooms' })).not.toHaveTextContent('Kitchen');
  });

  it('turns the browser’s own validation bubble off, so the message above is the one that shows', () => {
    const { container } = render(<Harness />);
    expect(container.querySelector('form')).toHaveAttribute('novalidate');
  });
});
