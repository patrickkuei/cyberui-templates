import { useReducer } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEMO_NOTE } from '../data/product';
import { createInitialState, reducer } from '../state/reducer';
import { AddDeviceScreen } from './AddDeviceScreen';

// Renders the screen over the real reducer so a save can be checked in the state it produces.
let latest = createInitialState();
function Harness({ leave }: { leave: () => void }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  latest = state;
  return <AddDeviceScreen dispatch={dispatch} leave={leave} />;
}

const name = () => screen.getByLabelText('Device name');
const code = () => screen.getByLabelText('Pairing code');
const save = () => screen.getByRole('button', { name: 'Save device' });

describe('AddDeviceScreen', () => {
  it('has one h1 and the four fields, each with a label', () => {
    render(<Harness leave={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Add device' })).toBeInTheDocument();
    expect(name()).toBeInTheDocument();
    expect(screen.getByLabelText('Room')).toHaveValue('Living room');
    expect(screen.getByLabelText('Type')).toHaveValue('light');
    expect(code()).toHaveAttribute('autocapitalize', 'characters');
    expect(code()).toHaveAttribute('maxlength', '6');
  });

  it('lists the rooms and the kinds in the pickers', () => {
    render(<Harness leave={vi.fn()} />);
    expect(Array.from((screen.getByLabelText('Room') as HTMLSelectElement).options).map((option) => option.text)).toEqual(['Living room', 'Bedroom', 'Hall']);
    expect(Array.from((screen.getByLabelText('Type') as HTMLSelectElement).options).map((option) => option.text)).toEqual(['Light', 'Plug', 'Thermostat', 'Sensor']);
  });

  it('rejects an empty name: shows the error, links it to the field, keeps focus there and adds nothing', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(code(), 'ab12cd');
    await userEvent.click(save());
    expect(name()).toHaveAttribute('aria-invalid', 'true');
    expect(name()).toHaveAccessibleDescription('Enter a name for the device.');
    expect(name()).toHaveFocus();
    expect(leave).not.toHaveBeenCalled();
    expect(latest.devices).toHaveLength(createInitialState().devices.length);
  });

  it.each(['abc', 'abc12', 'abc12!', '      '])('rejects the pairing code %j', async (value) => {
    render(<Harness leave={vi.fn()} />);
    await userEvent.type(name(), 'Shelf lamp');
    await userEvent.type(code(), value);
    await userEvent.click(save());
    expect(code()).toHaveAccessibleDescription('Enter the 6-character pairing code: letters and numbers only.');
    expect(code()).toHaveFocus();
  });

  it('puts focus on the name when both fields are wrong, and shows both errors', async () => {
    render(<Harness leave={vi.fn()} />);
    await userEvent.click(save());
    expect(name()).toHaveFocus();
    expect(name()).toHaveAccessibleDescription('Enter a name for the device.');
    expect(code()).toHaveAccessibleDescription('Enter the 6-character pairing code: letters and numbers only.');
  });

  it('clears an error as soon as the person edits that field', async () => {
    render(<Harness leave={vi.fn()} />);
    await userEvent.click(save());
    await userEvent.type(name(), 'L');
    expect(screen.queryByText('Enter a name for the device.')).not.toBeInTheDocument();
    expect(screen.getByText('Enter the 6-character pairing code: letters and numbers only.')).toBeInTheDocument();
  });

  it('writes the pairing code in capitals', async () => {
    render(<Harness leave={vi.fn()} />);
    await userEvent.type(code(), 'ab12cd');
    expect(code()).toHaveValue('AB12CD');
  });

  it('adds the device with the chosen room and kind, tells the demo sentence, and leaves', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(name(), '  Shelf lamp ');
    await userEvent.selectOptions(screen.getByLabelText('Room'), 'Bedroom');
    await userEvent.selectOptions(screen.getByLabelText('Type'), 'plug');
    await userEvent.type(code(), 'ab12cd');
    await userEvent.click(save());
    expect(latest.devices.at(-1)).toEqual({ id: 'new-1', name: 'Shelf lamp', room: 'Bedroom', kind: 'plug', status: 'online', on: false });
    expect(latest.notice).toBe(`Added Shelf lamp to Bedroom. ${DEMO_NOTE}`);
    expect(leave).toHaveBeenCalledTimes(1);
  });

  it('leaves without adding anything from Cancel', async () => {
    const leave = vi.fn();
    render(<Harness leave={leave} />);
    await userEvent.type(name(), 'Shelf lamp');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(leave).toHaveBeenCalledTimes(1);
    expect(latest.devices).toHaveLength(createInitialState().devices.length);
  });
});
