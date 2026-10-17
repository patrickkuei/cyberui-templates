import { useReducer } from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STARTING_DEVICES } from '../data/devices';
import { createInitialState, reducer, type AppState } from '../state/reducer';
import { DevicesScreen } from './DevicesScreen';

function Harness({ initial = createInitialState() }: { initial?: AppState }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <DevicesScreen state={state} dispatch={dispatch} />;
}

// Reusing a component across screens repeats visible text: a device's name is in
// its row and, while its sheet is open, in the sheet; "Power" and the room names
// repeat too. Scope queries with within(...) rather than renaming anything.
const row = (name: RegExp | string) => screen.getByRole('button', { name }).closest('li')!;

describe('DevicesScreen', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('has one h1 and groups the devices under a heading per room, in room order', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { level: 1, name: 'Devices' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Living room', 'Bedroom', 'Hall']);
    const living = within(screen.getByRole('region', { name: 'Living room' }));
    expect(living.getAllByRole('listitem')).toHaveLength(STARTING_DEVICES.filter((d) => d.room === 'Living room').length);
  });

  it('shows every kind and every status without any interaction', () => {
    render(<Harness />);
    for (const status of ['Online', 'Low battery', 'Offline']) expect(screen.getAllByText(status).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('switch')).toHaveLength(STARTING_DEVICES.filter((d) => d.kind !== 'sensor').length);
  });

  it("flips only that row's switch", async () => {
    render(<Harness />);
    const lamp = screen.getByRole('switch', { name: 'Desk lamp power' });
    const plug = screen.getByRole('switch', { name: 'TV plug power' });
    expect(lamp).toBeChecked();
    await userEvent.click(lamp);
    expect(lamp).not.toBeChecked();
    expect(plug).toBeChecked();
    expect(within(row(/Desk lamp/)).getByText('Off')).toBeInTheDocument();
  });

  it('disables the switch of an offline device and gives sensors none', () => {
    render(<Harness />);
    expect(screen.getByRole('switch', { name: 'Hall light power' })).toBeDisabled();
    expect(within(row(/Living room sensor/)).queryByRole('switch')).not.toBeInTheDocument();
  });

  it('shows temperatures in Fahrenheit when the unit says so, without changing what is stored', () => {
    const initial = createInitialState();
    render(<Harness initial={{ ...initial, settings: { ...initial.settings, unit: 'F' } }} />);
    expect(within(row(/Hall thermostat/)).getByText('Target 68 °F')).toBeInTheDocument();
    expect(within(row(/Living room sensor/)).getByText('71 °F')).toBeInTheDocument();
  });

  it('goes to Add device from the Add device button, by changing the hash like a link', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
    expect(window.location.hash).toBe('#/add');
  });

  it('says so when there are no devices', () => {
    render(<Harness initial={{ ...createInitialState(), devices: [] }} />);
    expect(screen.getByText('No devices yet. Add one to get started.')).toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  describe('the device sheet', () => {
    it('opens from a row and shows that device’s controls', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: /Desk lamp/ }));
      const dialog = screen.getByRole('dialog', { name: 'Desk lamp controls' });
      expect(within(dialog).getByRole('slider', { name: 'Brightness' })).toHaveAttribute('aria-valuenow', '70');
    });

    it('changes the device behind it, and the row follows', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: /Desk lamp/ }));
      const dialog = within(screen.getByRole('dialog'));
      dialog.getByRole('slider', { name: 'Brightness' }).focus();
      await userEvent.keyboard('{ArrowRight}');
      await userEvent.click(dialog.getByRole('switch', { name: 'Power' }));
      const lampRow = within(row(/Desk lamp/));
      expect(lampRow.getByRole('switch')).not.toBeChecked();
      expect(lampRow.getByText('Off')).toBeInTheDocument();
    });

    it('closes from Done and puts focus back on the row that opened it', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: /TV plug/ }));
      await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Done' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /TV plug/ })).toHaveFocus();
    });

    it('closes on Escape', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: /TV plug/ }));
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('removes the device, closes, and moves focus to the title because its row is gone', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: /TV plug/ }));
      await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove device' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /TV plug/ })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
    });

    it('opens an offline device with its controls off', async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole('button', { name: /Hall light/ }));
      expect(within(screen.getByRole('dialog')).getByRole('switch', { name: 'Power' })).toBeDisabled();
    });
  });
});
