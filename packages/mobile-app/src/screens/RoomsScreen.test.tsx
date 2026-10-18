import { useReducer } from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInitialState, reducer, type AppState } from '../state/reducer';
import { RoomsScreen } from './RoomsScreen';

function Harness({ initial = createInitialState() }: { initial?: AppState }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <>
      <RoomsScreen state={state} dispatch={dispatch} />
      <p data-testid="notice">{state.notice}</p>
      <p data-testid="filter">{state.roomFilter ?? 'all'}</p>
    </>
  );
}

// Each card repeats "Turn off", "Remove room" and a room's name; the buttons
// carry the room in their names, and queries here use those names.
const card = (name: string) => within(screen.getByRole('heading', { level: 2, name }).closest('li')!);

describe('RoomsScreen', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('has one h1 and a card per room, in order', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { level: 1, name: 'Rooms' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Living room', 'Bedroom', 'Hall']);
  });

  it('shows how many are on and a power figure derived from the devices that are', () => {
    render(<Harness />);
    expect(card('Living room').getByText('96')).toBeInTheDocument();
    expect(card('Living room').getByText('3 of 3 on')).toBeInTheDocument();
    expect(card('Bedroom').getByText('0')).toBeInTheDocument();
    expect(card('Bedroom').getByText('0 of 2 on')).toBeInTheDocument();
  });

  it('lowers the figure when a device in the room is switched off', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Turn off Living room' }));
    expect(card('Living room').getByText('0')).toBeInTheDocument();
    expect(card('Living room').getByText('0 of 3 on')).toBeInTheDocument();
    expect(card('Hall').getByText('1 of 2 on')).toBeInTheDocument();
  });

  it('disables Turn off for a room with nothing on', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Turn off Bedroom' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Turn off Hall' })).toBeEnabled();
  });

  it('opens Home filtered to the room from its chevron', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Show devices in Hall' }));
    expect(screen.getByTestId('filter')).toHaveTextContent('hall');
    expect(window.location.hash).toBe('#/devices');
  });

  it('goes to Add room from the Add room button, by changing the hash like a link', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Add room' }));
    expect(window.location.hash).toBe('#/add-room');
  });

  describe('Remove room', () => {
    it('says plainly why a room that still has devices stays', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: 'Remove room Hall' }));
      expect(screen.getByTestId('notice')).toHaveTextContent('Hall still has 2 devices. Remove them first.');
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
    });

    it('removes a room that is empty', async () => {
      const initial = reducer(createInitialState(), { type: 'room/add', name: 'Kitchen' });
      render(<Harness initial={{ ...initial, notice: null }} />);
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(4);
      await userEvent.click(screen.getByRole('button', { name: 'Remove room Kitchen' }));
      expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Living room', 'Bedroom', 'Hall']);
      expect(screen.getByTestId('notice')).toHaveTextContent('Removed the room Kitchen.');
    });

    it('shows a room with no devices as such, and gives it no Turn off', () => {
      const initial = reducer(createInitialState(), { type: 'room/add', name: 'Kitchen' });
      render(<Harness initial={initial} />);
      expect(card('Kitchen').getByText('0 devices')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Turn off Kitchen' })).not.toBeInTheDocument();
    });
  });
});
