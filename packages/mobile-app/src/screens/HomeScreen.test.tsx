import { useReducer } from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STARTING_DEVICES } from '../data/devices';
import { createInitialState, reducer, type AppState } from '../state/reducer';
import { HomeScreen } from './HomeScreen';

function Harness({ initial = createInitialState() }: { initial?: AppState }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <HomeScreen state={state} dispatch={dispatch} />;
}

// Reusing a component across screens repeats visible text: a room's name is a
// chip and a heading, and a device's name is in its row. Scope queries with
// within(...) rather than renaming anything.
const room = (name: string) => within(screen.getByRole('region', { name: new RegExp(`^${name}`) }));
// happy-dom puts a space before the span's colon when it computes a heading's name ("Living room : 2 of 3 on"); a browser does not. Match either.
const roomHeading = (text: string) => screen.getByRole('heading', { name: (name) => name.replace(' :', ':') === text });
const chips = () => within(screen.getByRole('group', { name: 'Show devices in' }));

describe('HomeScreen', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('has one h1 and says in one sentence how the home is doing', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('4 on, 3 need attention')).toBeInTheDocument();
  });

  it('groups the devices under a heading per room, in room order, each saying how many are on', () => {
    render(<Harness />);
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'Living room: 3 of 3 on',
      'Bedroom: 0 of 2 on',
      'Hall: 1 of 2 on',
    ]);
    expect(room('Living room').getAllByRole('listitem')).toHaveLength(4);
    expect(room('Bedroom').getAllByRole('listitem')).toHaveLength(3);
    expect(room('Hall').getAllByRole('listitem')).toHaveLength(2);
  });

  it('shows no badge anywhere: status is only by exception', () => {
    render(<Harness />);
    expect(screen.queryByText('Online')).not.toBeInTheDocument();
    expect(screen.getByText('Lost')).toBeInTheDocument();
    expect(room('Bedroom').getByRole('link', { name: /Bedroom sensor Low battery/ })).toBeInTheDocument();
    expect(room('Bedroom').getByRole('link', { name: /Fan plug Weak signal/ })).toBeInTheDocument();
  });

  describe('room chips', () => {
    it('lists All and every room, each with its device count', () => {
      render(<Harness />);
      expect(chips().getAllByRole('button').map((chip) => chip.textContent)).toEqual(['All 9', 'Living room 4', 'Bedroom 3', 'Hall 2']);
      expect(chips().getByRole('button', { name: 'All 9' })).toHaveAttribute('aria-pressed', 'true');
      expect(chips().getByRole('button', { name: 'Hall 2' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('shows only that room when a chip is pressed, and everything again on All', async () => {
      render(<Harness />);
      await userEvent.click(chips().getByRole('button', { name: 'Bedroom 3' }));
      expect(chips().getByRole('button', { name: 'Bedroom 3' })).toHaveAttribute('aria-pressed', 'true');
      expect(chips().getByRole('button', { name: 'All 9' })).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Bedroom: 0 of 2 on']);
      await userEvent.click(chips().getByRole('button', { name: 'All 9' }));
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
    });

    it('keeps the sentence about the whole home while one room is shown', async () => {
      render(<Harness />);
      await userEvent.click(chips().getByRole('button', { name: 'Hall 2' }));
      expect(screen.getByText('4 on, 3 need attention')).toBeInTheDocument();
    });

    it('shows everything when the filter points at a room that is gone', () => {
      render(<Harness initial={{ ...createInitialState(), roomFilter: 'nowhere' }} />);
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
      expect(chips().getByRole('button', { name: 'All 9' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('starts on the room Rooms chose', () => {
      render(<Harness initial={{ ...createInitialState(), roomFilter: 'hall' }} />);
      expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Hall: 1 of 2 on']);
    });
  });

  describe('power', () => {
    it("flips only that row's switch, and the sentence and the room heading follow", async () => {
      render(<Harness />);
      const lamp = screen.getByRole('switch', { name: 'Desk lamp power' });
      expect(lamp).toHaveAttribute('aria-checked', 'true');
      await userEvent.click(lamp);
      expect(lamp).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByRole('switch', { name: 'TV plug power' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByText('3 on, 3 need attention')).toBeInTheDocument();
      expect(roomHeading('Living room: 2 of 3 on')).toBeInTheDocument();
      expect(within(room('Living room').getByRole('link', { name: /Desk lamp/ })).getByText('Off')).toBeInTheDocument();
    });

    it('disables the power button of a lost device and gives a sensor none', () => {
      render(<Harness />);
      expect(screen.getByRole('switch', { name: 'Hall light power' })).toBeDisabled();
      expect(room('Living room').getAllByRole('switch')).toHaveLength(3);
    });

    it('turns off a whole room from its heading, and only that room', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: 'Turn off Living room' }));
      expect(room('Living room').getAllByRole('switch').every((toggle) => toggle.getAttribute('aria-checked') === 'false')).toBe(true);
      expect(roomHeading('Living room: 0 of 3 on')).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: 'Hall thermostat power' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('button', { name: 'Turn off Living room' })).toBeDisabled();
    });

    it('disables Turn off for a room with nothing on', () => {
      render(<Harness />);
      expect(screen.getByRole('button', { name: 'Turn off Bedroom' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Turn off Hall' })).toBeEnabled();
    });
  });

  it('shows temperatures in Fahrenheit when the unit says so, without changing what is stored', () => {
    const initial = createInitialState();
    render(<Harness initial={{ ...initial, settings: { ...initial.settings, unit: 'F' } }} />);
    expect(within(room('Hall').getByRole('link', { name: /Hall thermostat/ })).getByText('68°')).toBeInTheDocument();
    expect(within(room('Living room').getByRole('link', { name: /Living room sensor/ })).getByText('71°')).toBeInTheDocument();
  });

  it('goes to Add device from the Add device button, by changing the hash like a link', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
    expect(window.location.hash).toBe('#/add');
  });

  describe('when there is little to show', () => {
    it('says so when there are no devices, and offers the way to add one', () => {
      render(<Harness initial={{ ...createInitialState(), devices: [] }} />);
      expect(screen.getByText('No devices yet. Add one to get started.')).toBeInTheDocument();
      expect(screen.queryByText(/on, /)).not.toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Living room', 'Bedroom', 'Hall']);
      expect(screen.getByRole('button', { name: 'Add device' })).toBeInTheDocument();
    });

    it('says a room is empty, and gives it no Turn off', () => {
      const initial = createInitialState();
      const empty = { ...initial, devices: STARTING_DEVICES.filter((device) => device.roomId !== 'hall') };
      render(<Harness initial={empty} />);
      expect(room('Hall').getByText('Nothing in this room yet.')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Turn off Hall' })).not.toBeInTheDocument();
    });
  });
});
