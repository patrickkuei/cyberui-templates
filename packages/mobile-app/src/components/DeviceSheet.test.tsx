import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STARTING_DEVICES } from '../data/devices';
import type { Device, TemperatureUnit } from '../data/types';
import { DeviceSheet } from './DeviceSheet';

const byId = (id: string): Device => STARTING_DEVICES.find((device) => device.id === id)!;

function setup(id: string | undefined, unit: TemperatureUnit = 'C') {
  const dispatch = vi.fn();
  const onClose = vi.fn();
  render(<DeviceSheet device={id ? byId(id) : undefined} unit={unit} dispatch={dispatch} onClose={onClose} />);
  return { dispatch, onClose };
}

describe('DeviceSheet', () => {
  it('renders nothing while no device is open', () => {
    setup(undefined);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens as a dialog named after the device, with its own heading and no close button of the library’s', () => {
    setup('desk-lamp');
    const dialog = screen.getByRole('dialog', { name: 'Desk lamp controls' });
    expect(within(dialog).getByRole('heading', { level: 2, name: 'Desk lamp' })).toBeInTheDocument();
    expect(within(dialog).getByText('Living room')).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Close drawer' })).not.toBeInTheDocument();
  });

  it('gives a light a power switch and a brightness slider, and the slider moves by its step', async () => {
    const { dispatch } = setup('desk-lamp');
    expect(screen.getByRole('switch', { name: 'Power' })).toBeChecked();
    const slider = screen.getByRole('slider', { name: 'Brightness' });
    expect(slider).toHaveAttribute('aria-valuenow', '70');
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'device/set-brightness', id: 'desk-lamp', value: 75 });
  });

  it('flips the device from the power switch', async () => {
    const { dispatch } = setup('desk-lamp');
    await userEvent.click(screen.getByRole('switch', { name: 'Power' }));
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'device/toggle', id: 'desk-lamp' });
  });

  it('gives a plug a switch and no slider', () => {
    setup('tv-plug');
    expect(screen.getByRole('switch', { name: 'Power' })).toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('gives a thermostat a target slider in the chosen unit, and stores Celsius', async () => {
    const { dispatch } = setup('hall-thermostat', 'F');
    const slider = screen.getByRole('slider', { name: 'Target temperature' });
    expect(slider).toHaveAttribute('aria-valuenow', '68');
    expect(slider).toHaveAttribute('aria-valuemin', '50');
    expect(slider).toHaveAttribute('aria-valuemax', '86');
    expect(slider).toHaveAttribute('aria-valuetext', '68 °F');
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'device/set-target', id: 'hall-thermostat', valueC: 20.5 });
  });

  it('moves a Celsius thermostat in half degrees', async () => {
    const { dispatch } = setup('hall-thermostat', 'C');
    screen.getByRole('slider', { name: 'Target temperature' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'device/set-target', id: 'hall-thermostat', valueC: 19.5 });
  });

  it('gives a sensor only its reading', () => {
    setup('living-sensor', 'F');
    expect(screen.getByText('Reading: 71 °F')).toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('switches the controls of an offline device off, and says why', () => {
    setup('hall-light');
    expect(screen.getByRole('switch', { name: 'Power' })).toBeDisabled();
    expect(screen.getByRole('slider', { name: 'Brightness' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('This device is offline, so its controls are switched off.')).toBeInTheDocument();
  });

  it('removes the device from the Remove device button', async () => {
    const { dispatch } = setup('tv-plug');
    await userEvent.click(screen.getByRole('button', { name: 'Remove device' }));
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'device/remove', id: 'tv-plug' });
  });

  it('closes from Done', async () => {
    const { onClose } = setup('tv-plug');
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape, after the library has finished its closing animation', async () => {
    const { onClose } = setup('tv-plug');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});
