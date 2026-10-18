import { useReducer } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createScriptedConnection } from '../connection';
import { createInitialState, reducer, type AppState } from '../state/reducer';
import { AddDeviceScreen } from './AddDeviceScreen';

// The scan and the link run on timers, so every test here drives fake ones and
// presses with fireEvent: userEvent waits on real timers between its steps,
// which a fake clock never fires. Times: the scan takes 800ms, each of the four
// link steps 100ms, and the finished checklist stays 600ms.
const connection = createScriptedConnection({ scanMs: 800, stepMs: 100 });
const SCAN = 800;
const LINK = 400 + 600;

function Harness({ leave = vi.fn(), initial = createInitialState() }: { leave?: () => void; initial?: AppState }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <>
      <AddDeviceScreen devices={state.devices} rooms={state.rooms} connection={connection} dispatch={dispatch} leave={leave} />
      <div role="group" aria-label="devices">
        {state.devices.map((device) => (
          <span key={device.id}>{`${device.id}|${device.name}|${device.roomId}|${device.kind}`}</span>
        ))}
      </div>
    </>
  );
}

const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const press = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const devices = () => within(screen.getByRole('group', { name: 'devices' }));
const stepTitle = () => screen.getByRole('heading', { level: 2 });

async function scanAndPick(name: string) {
  press('Start scan');
  await advance(SCAN);
  press(new RegExp(name));
  await advance(LINK);
}

describe('AddDeviceScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Scan', () => {
    it('opens on one h1, a Start scan button and the line that says the scan is scripted', () => {
      render(<Harness />);
      expect(screen.getByRole('heading', { level: 1, name: 'Add device' })).toBeInTheDocument();
      expect(stepTitle()).toHaveTextContent('Find a device nearby');
      expect(screen.getByRole('button', { name: 'Start scan' })).toBeInTheDocument();
      expect(screen.getByText('This scan is scripted: nothing is discovered. It shows a fixed list.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Enter a code instead' })).toBeInTheDocument();
    });

    it('starts only when the button is pressed: nothing runs, however long the screen is open', async () => {
      render(<Harness />);
      await advance(60_000);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('shows a progress bar that moves, a pulse for the eye and the words "Scanning…" for everyone', async () => {
      render(<Harness />);
      press('Start scan');
      expect(screen.getByRole('progressbar', { name: 'Scan progress' })).toHaveAttribute('value', '0');
      expect(screen.getByRole('status')).toHaveTextContent('Scanning…');
      expect(document.querySelector('.pulse')).toHaveAttribute('aria-hidden', 'true');
      await advance(400);
      expect(Number(screen.getByRole('progressbar').getAttribute('value'))).toBeGreaterThanOrEqual(50);
    });

    it('stops from Cancel and goes back to the start, with no timer left', async () => {
      render(<Harness />);
      press('Start scan');
      await advance(300);
      press('Cancel');
      expect(screen.getByRole('button', { name: 'Start scan' })).toBeInTheDocument();
      expect(vi.getTimerCount()).toBe(0);
      await advance(5000);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('lists what the script finds when it is done, with a signal for each', async () => {
      render(<Harness />);
      press('Start scan');
      await advance(SCAN);
      expect(stepTitle()).toHaveTextContent('4 devices nearby');
      const rows = within(screen.getByRole('list')).getAllByRole('button');
      expect(rows.map((row) => row.textContent)).toEqual(['Shelf lampLight', 'Kettle plugPlug', 'Porch thermostatThermostat', 'Garage sensorSensor']);
      expect(within(rows[0]!).getByRole('img', { name: 'Signal 4 of 4' })).toBeInTheDocument();
      expect(within(rows[3]!).getByRole('img', { name: 'Signal 1 of 4' })).toBeInTheDocument();
    });

    it('can scan again, and leaves out what is already in the home', async () => {
      render(<Harness />);
      await scanAndPick('Shelf lamp');
      type('Device name', 'Shelf lamp');
      press('Add device');
      // Same screen mounted again, as navigating back to it would.
      document.body.innerHTML = '';
      const added = reducer(createInitialState(), { type: 'device/add', draft: { id: 'shelf-lamp', name: 'Shelf lamp', roomId: 'hall', kind: 'light' } });
      render(<Harness initial={added} />);
      press('Start scan');
      await advance(SCAN);
      expect(stepTitle()).toHaveTextContent('3 devices nearby');
      expect(screen.queryByRole('button', { name: /Shelf lamp/ })).not.toBeInTheDocument();
      press('Scan again');
      expect(screen.getByRole('status')).toHaveTextContent('Scanning…');
    });

    it('says so when there is nothing left to find', async () => {
      const all = createInitialState();
      const full = { ...all, devices: [...all.devices, ...['shelf-lamp', 'kettle-plug', 'porch-thermostat', 'garage-sensor'].map((id) => ({ ...all.devices[0]!, id }))] };
      render(<Harness initial={full} />);
      press('Start scan');
      await advance(SCAN);
      expect(stepTitle()).toHaveTextContent('Everything the scan can find is already added.');
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  describe('Pick and Link', () => {
    it('links the device that was tapped, with a checklist and a bar, and no other control', async () => {
      render(<Harness />);
      press('Start scan');
      await advance(SCAN);
      press(/Kettle plug/);
      expect(stepTitle()).toHaveTextContent('Linking Kettle plug');
      expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(4);
      expect(screen.getByRole('progressbar', { name: 'Link progress' })).toBeInTheDocument();
      await advance(150);
      expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Device found: done');
    });

    it('goes on to the name and room once the link is ready', async () => {
      render(<Harness />);
      await scanAndPick('Kettle plug');
      expect(stepTitle()).toHaveTextContent('Name the device');
      expect(screen.getByLabelText('Device name')).toHaveValue('Kettle plug');
    });

    it('goes back to the start from Cancel while linking, with no timer left', async () => {
      render(<Harness />);
      press('Start scan');
      await advance(SCAN);
      press(/Shelf lamp/);
      await advance(150);
      press('Cancel');
      expect(screen.getByRole('button', { name: 'Start scan' })).toBeInTheDocument();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('Name and room', () => {
    it('adds a scanned device under its own id, as its own kind, in the room chosen, then leaves', async () => {
      const leave = vi.fn();
      render(<Harness leave={leave} />);
      await scanAndPick('Porch thermostat');
      expect(screen.queryByLabelText('Type')).not.toBeInTheDocument();
      fireEvent.change(screen.getByLabelText('Room'), { target: { value: 'bedroom' } });
      type('Device name', '  Porch heater ');
      press('Add device');
      expect(devices().getByText('porch-thermostat|Porch heater|bedroom|thermostat')).toBeInTheDocument();
      expect(leave).toHaveBeenCalledTimes(1);
    });

    it('offers every room, in order', async () => {
      render(<Harness />);
      await scanAndPick('Shelf lamp');
      const options = within(screen.getByLabelText('Room')).getAllByRole('option');
      expect(options.map((option) => option.textContent)).toEqual(['Living room', 'Bedroom', 'Hall']);
    });

    it('requires a name: shows the error, links it to the field, keeps focus there and adds nothing', async () => {
      const leave = vi.fn();
      render(<Harness leave={leave} />);
      await scanAndPick('Shelf lamp');
      type('Device name', '   ');
      press('Add device');
      const name = screen.getByLabelText('Device name');
      expect(name).toHaveAttribute('aria-invalid', 'true');
      expect(name).toHaveAccessibleDescription('Enter a name for the device.');
      expect(name).toHaveFocus();
      expect(leave).not.toHaveBeenCalled();
      expect(devices().queryByText(/shelf-lamp/)).not.toBeInTheDocument();
    });

    it('leaves from Cancel without adding anything, even with everything filled in', async () => {
      const leave = vi.fn();
      render(<Harness leave={leave} />);
      await scanAndPick('Shelf lamp');
      press('Cancel');
      expect(leave).toHaveBeenCalledTimes(1);
      expect(devices().queryByText(/shelf-lamp/)).not.toBeInTheDocument();
    });

    it('turns the browser’s own validation bubble off', async () => {
      const { container } = render(<Harness />);
      await scanAndPick('Shelf lamp');
      expect(container.querySelector('form')).toHaveAttribute('novalidate');
    });

    it('says there are no rooms, and will not add, when every room has been removed', async () => {
      const bare = { ...createInitialState(), rooms: [], devices: [] };
      render(<Harness initial={bare} />);
      await scanAndPick('Shelf lamp');
      expect(screen.getByText(/There are no rooms yet/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Add a room' })).toHaveAttribute('href', '#/add-room');
      expect(screen.getByRole('button', { name: 'Add device' })).toBeDisabled();
    });
  });

  describe('Enter a code instead', () => {
    it('opens the code form from the start and from the results, and goes back to the scan', async () => {
      render(<Harness />);
      press('Enter a code instead');
      expect(stepTitle()).toHaveTextContent('Enter the pairing code');
      press('Back to scan');
      expect(screen.getByRole('button', { name: 'Start scan' })).toBeInTheDocument();
      press('Start scan');
      await advance(SCAN);
      press('Enter a code instead');
      expect(stepTitle()).toHaveTextContent('Enter the pairing code');
    });

    it('rejects a code that is not six letters or numbers: shows the error, links it, keeps focus there', async () => {
      render(<Harness />);
      press('Enter a code instead');
      type('Pairing code', 'ab12');
      press('Link device');
      const code = screen.getByLabelText('Pairing code');
      expect(code).toHaveAttribute('aria-invalid', 'true');
      expect(code).toHaveAccessibleDescription('Enter the 6-character pairing code: letters and numbers only.');
      expect(code).toHaveFocus();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('rejects six characters that are not all letters and numbers', () => {
      render(<Harness />);
      press('Enter a code instead');
      type('Pairing code', 'ab-2cd');
      press('Link device');
      expect(screen.getByLabelText('Pairing code')).toHaveAttribute('aria-invalid', 'true');
    });

    it('writes the code in capitals and takes at most six characters', () => {
      render(<Harness />);
      press('Enter a code instead');
      type('Pairing code', 'ab12cd');
      expect(screen.getByLabelText('Pairing code')).toHaveValue('AB12CD');
      expect(screen.getByLabelText('Pairing code')).toHaveAttribute('maxlength', '6');
      expect(screen.getByLabelText('Pairing code')).toHaveAttribute('autocapitalize', 'characters');
    });

    it('links a valid code, then asks for a name, a room and a type, and adds a numbered device', async () => {
      const leave = vi.fn();
      render(<Harness leave={leave} />);
      press('Enter a code instead');
      type('Pairing code', 'ab12cd');
      press('Link device');
      expect(stepTitle()).toHaveTextContent('Linking');
      await advance(LINK);
      expect(stepTitle()).toHaveTextContent('Name the device');
      expect(screen.getByLabelText('Device name')).toHaveValue('');
      type('Device name', 'Workshop plug');
      fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'plug' } });
      press('Add device');
      expect(devices().getByText('new-1|Workshop plug|living-room|plug')).toBeInTheDocument();
      expect(leave).toHaveBeenCalledTimes(1);
    });
  });

  it('moves focus to the heading of each new step, but not on first load', async () => {
    render(<Harness />);
    expect(stepTitle()).not.toHaveFocus();
    press('Start scan');
    expect(stepTitle()).toHaveFocus();
    await advance(SCAN);
    expect(stepTitle()).toHaveFocus();
    press(/Shelf lamp/);
    expect(stepTitle()).toHaveFocus();
    await advance(LINK);
    expect(stepTitle()).toHaveFocus();
  });

  it('makes each step’s heading programmatically focusable', () => {
    render(<Harness />);
    expect(stepTitle()).toHaveAttribute('tabindex', '-1');
  });

  it('leaves no timer running when the screen is left mid-scan or mid-link', async () => {
    const first = render(<Harness />);
    press('Start scan');
    await advance(200);
    first.unmount();
    expect(vi.getTimerCount()).toBe(0);
    const second = render(<Harness />);
    press('Start scan');
    await advance(SCAN);
    press(/Shelf lamp/);
    await advance(150);
    second.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
