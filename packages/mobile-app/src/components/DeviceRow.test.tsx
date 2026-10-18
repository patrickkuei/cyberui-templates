import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STARTING_DEVICES } from '../data/devices';
import type { Device } from '../data/types';
import { DeviceRow } from './DeviceRow';

const byId = (id: string): Device => STARTING_DEVICES.find((device) => device.id === id)!;

function setup(id: string, unit: 'C' | 'F' = 'C') {
  const onToggle = vi.fn();
  const onOpen = vi.fn();
  render(
    <ul>
      <DeviceRow device={byId(id)} unit={unit} onToggle={onToggle} onOpen={onOpen} />
    </ul>,
  );
  return { onToggle, onOpen };
}

describe('DeviceRow', () => {
  it('shows the name, the status in words and the state, with a named switch that reflects it', () => {
    setup('desk-lamp');
    const open = screen.getByRole('button', { name: /Desk lamp/ });
    expect(open).toHaveTextContent('Online');
    expect(open).toHaveTextContent('70%');
    expect(screen.getByRole('switch', { name: 'Desk lamp power' })).toBeChecked();
  });

  it('flips the switch without opening the sheet', async () => {
    const { onToggle, onOpen } = setup('desk-lamp');
    await userEvent.click(screen.getByRole('switch', { name: 'Desk lamp power' }));
    expect(onToggle).toHaveBeenCalledExactlyOnceWith('desk-lamp');
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('opens the sheet from the main button without flipping the switch', async () => {
    const { onToggle, onOpen } = setup('desk-lamp');
    await userEvent.click(screen.getByRole('button', { name: /Desk lamp/ }));
    expect(onOpen).toHaveBeenCalledExactlyOnceWith('desk-lamp');
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('disables the switch of an offline device, and says Offline', () => {
    setup('hall-light');
    expect(screen.getByRole('switch', { name: 'Hall light power' })).toBeDisabled();
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('says that the main button opens a dialog', () => {
    setup('desk-lamp');
    expect(screen.getByRole('button', { name: /Desk lamp/ })).toHaveAttribute('aria-haspopup', 'dialog');
  });

  // The accent variant is a solid accent track when on; the library's default
  // would be a gradient to magenta. Toggle puts that on the track, which is the
  // element after the input (update this with the library if its class names change).
  it('uses the accent variant of the switch', () => {
    setup('desk-lamp');
    expect(screen.getByRole('switch', { name: 'Desk lamp power' }).nextElementSibling).toHaveClass('peer-checked:bg-accent');
  });

  it('shows a low-battery device as such', () => {
    setup('bedroom-sensor');
    expect(screen.getByText('Low battery')).toBeInTheDocument();
  });

  it('gives a sensor a reading and no switch', () => {
    setup('living-sensor');
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.getByText('21.5 °C')).toBeInTheDocument();
  });

  it('shows temperatures in the chosen unit', () => {
    setup('living-sensor', 'F');
    expect(screen.getByText('71 °F')).toBeInTheDocument();
  });
});
