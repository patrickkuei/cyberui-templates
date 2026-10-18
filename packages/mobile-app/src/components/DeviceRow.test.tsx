import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STARTING_DEVICES } from '../data/devices';
import type { Device } from '../data/types';
import { DeviceRow, devicePath } from './DeviceRow';

const byId = (id: string): Device => STARTING_DEVICES.find((device) => device.id === id)!;
const with_ = (id: string, change: Record<string, unknown>): Device => ({ ...byId(id), ...change }) as Device;

function renderRow(device: Device, onToggle = vi.fn(), unit: 'C' | 'F' = 'C') {
  render(
    <ul>
      <DeviceRow device={device} unit={unit} onToggle={onToggle} />
    </ul>,
  );
  return { onToggle, row: screen.getByRole('listitem') };
}

describe('DeviceRow', () => {
  it('has two sibling controls: a power switch and a link to the device page, never one inside the other', () => {
    const { row } = renderRow(byId('desk-lamp'));
    const power = within(row).getByRole('switch', { name: 'Desk lamp power' });
    const link = within(row).getByRole('link', { name: /Desk lamp/ });
    expect(link).toHaveAttribute('href', '#/device/desk-lamp');
    expect(power.contains(link)).toBe(false);
    expect(link.contains(power)).toBe(false);
    expect(power.parentElement).toBe(link.parentElement);
  });

  it('shows its name and one value at the right', () => {
    const { row } = renderRow(byId('desk-lamp'));
    expect(within(row).getByText('Desk lamp')).toBeInTheDocument();
    expect(within(row).getByText('70%')).toBeInTheDocument();
  });

  it('is checked while the device is on, unchecked while it is off, and the glyph button is what flips it', async () => {
    const { onToggle } = renderRow(byId('desk-lamp'));
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(screen.getByRole('switch'));
    expect(onToggle).toHaveBeenCalledWith('desk-lamp');
  });

  it('is unchecked for a light that is off, and says Off', () => {
    const { row } = renderRow(byId('bedside-lamp'));
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(within(row).getByText('Off')).toBeInTheDocument();
  });

  it('does not toggle when the link is pressed', async () => {
    const { onToggle } = renderRow(byId('tv-plug'));
    await userEvent.click(screen.getByRole('link', { name: /TV plug/ }));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('draws a level bar under a light, filled to its level, and empty while it is off', () => {
    const on = render(
      <ul>
        <DeviceRow device={byId('desk-lamp')} unit="C" onToggle={vi.fn()} />
      </ul>,
    );
    expect(on.container.querySelector('.level-bar-fill')).toHaveAttribute('width', '70');
    on.unmount();
    const off = render(
      <ul>
        <DeviceRow device={byId('bedside-lamp')} unit="C" onToggle={vi.fn()} />
      </ul>,
    );
    expect(off.container.querySelector('.level-bar-fill')).toHaveAttribute('width', '0');
  });

  it('draws no level bar for anything but a light', () => {
    for (const id of ['tv-plug', 'hall-thermostat', 'living-sensor']) {
      const { container, unmount } = render(
        <ul>
          <DeviceRow device={byId(id)} unit="C" onToggle={vi.fn()} />
        </ul>,
      );
      expect(container.querySelector('.level-bar'), id).toBeNull();
      unmount();
    }
  });

  describe('a sensor', () => {
    it('shows its reading as the value and has no power button', () => {
      const { row } = renderRow(byId('living-sensor'));
      expect(within(row).getByText('21.5°')).toBeInTheDocument();
      expect(within(row).queryByRole('switch')).not.toBeInTheDocument();
      expect(within(row).getByRole('link', { name: /Living room sensor/ })).toBeInTheDocument();
    });

    it('shows the reading in Fahrenheit when that is the unit', () => {
      const { row } = renderRow(byId('living-sensor'), vi.fn(), 'F');
      expect(within(row).getByText('71°')).toBeInTheDocument();
    });
  });

  describe('status only by exception', () => {
    it('shows no mark and no badge for a healthy device', () => {
      const { row } = renderRow(byId('desk-lamp'));
      expect(row.querySelector('.mark')).toBeNull();
      expect(row).not.toHaveTextContent(/online|battery|weak|lost|offline/i);
    });

    it('marks a low battery with a small amber mark that is also in words for assistive technology', () => {
      const { row } = renderRow(byId('bedroom-sensor'));
      expect(row.querySelectorAll('.mark')).toHaveLength(1);
      expect(within(row).getByRole('link')).toHaveAccessibleName(/Bedroom sensor Low battery/);
    });

    it('marks a weak signal the same way', () => {
      const { row } = renderRow(byId('fan-plug'));
      expect(row.querySelectorAll('.mark')).toHaveLength(1);
      expect(within(row).getByRole('link')).toHaveAccessibleName(/Fan plug Weak signal/);
    });

    it('is dashed and muted with the word Lost for a lost device, and its power button is disabled', () => {
      const { row } = renderRow(byId('hall-light'));
      expect(row).toHaveClass('device-row--down');
      expect(within(row).getByText('Lost')).toBeInTheDocument();
      expect(within(row).getByRole('switch')).toBeDisabled();
      expect(within(row).getByRole('switch')).toHaveAttribute('aria-checked', 'false');
      expect(row.querySelector('.level-bar')).toBeNull();
      expect(row.querySelector('.mark')).toBeNull();
    });

    it('says Offline for a device that was disconnected', () => {
      const { row } = renderRow(with_('desk-lamp', { link: 'offline' }));
      expect(row).toHaveClass('device-row--down');
      expect(within(row).getByText('Offline')).toBeInTheDocument();
      expect(within(row).getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    });

    it('does not call a sensor on: a lost sensor is down and has no power button either', () => {
      const { row } = renderRow(with_('living-sensor', { link: 'lost' }));
      expect(row).toHaveClass('device-row--down');
      expect(within(row).getByText('Lost')).toBeInTheDocument();
      expect(within(row).queryByRole('switch')).not.toBeInTheDocument();
    });
  });

  it('colours the value as lit only while the device is on', () => {
    const on = render(
      <ul>
        <DeviceRow device={byId('tv-plug')} unit="C" onToggle={vi.fn()} />
      </ul>,
    );
    expect(on.container.querySelector('.device-value')).toHaveClass('device-value--on');
    on.unmount();
    const off = render(
      <ul>
        <DeviceRow device={byId('fan-plug')} unit="C" onToggle={vi.fn()} />
      </ul>,
    );
    expect(off.container.querySelector('.device-value')).not.toHaveClass('device-value--on');
  });

  it('builds the link to a device page from its id, encoded', () => {
    expect(devicePath('desk-lamp')).toBe('#/device/desk-lamp');
    expect(devicePath('a b')).toBe('#/device/a%20b');
  });
});
