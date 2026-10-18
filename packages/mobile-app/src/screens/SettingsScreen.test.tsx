import { useReducer } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEMO_NOTE } from '../data/product';
import { createInitialState, reducer } from '../state/reducer';
import { SettingsScreen } from './SettingsScreen';

function Harness() {
  const [state, dispatch] = useReducer(reducer, createInitialState());
  return (
    <>
      <SettingsScreen state={state} dispatch={dispatch} />
      <p data-testid="settings">{JSON.stringify(state.settings)}</p>
    </>
  );
}

const stored = () => JSON.parse(screen.getByTestId('settings').textContent!) as { unit: string; alertOffline: boolean; remoteAccess: boolean };

describe('SettingsScreen', () => {
  it('has one h1 and its sections in order', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Temperature', 'Alerts and access', 'About']);
  });

  it('changes the unit, and only the unit', async () => {
    render(<Harness />);
    expect(screen.getByRole('radio', { name: '°C' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: '°F' }));
    expect(screen.getByRole('radio', { name: '°F' })).toBeChecked();
    expect(stored()).toEqual({ unit: 'F', alertOffline: true, remoteAccess: false });
  });

  it('names each switch by its label and flips each on its own', async () => {
    render(<Harness />);
    const alerts = screen.getByRole('switch', { name: 'Alert me when a device goes offline' });
    const remote = screen.getByRole('switch', { name: 'Remote access' });
    expect(alerts).toBeChecked();
    expect(remote).not.toBeChecked();
    await userEvent.click(alerts);
    expect(stored()).toEqual({ unit: 'C', alertOffline: false, remoteAccess: false });
    await userEvent.click(remote);
    expect(stored()).toEqual({ unit: 'C', alertOffline: false, remoteAccess: true });
  });

  it('flips a switch when its label is pressed, which is what the 44px hit area is for', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText('Remote access'));
    expect(screen.getByRole('switch', { name: 'Remote access' })).toBeChecked();
  });

  it('says in the About block that the app is a demo', () => {
    render(<Harness />);
    expect(screen.getByText(DEMO_NOTE)).toBeInTheDocument();
    expect(screen.getByText('Kestrel 1.0, a template')).toBeInTheDocument();
  });

  it('wraps the switches and the radios in the rows that give them a 44px target', () => {
    const { container } = render(<Harness />);
    expect(container.querySelectorAll('.touch-switch')).toHaveLength(2);
    expect(container.querySelectorAll('.touch-radios')).toHaveLength(1);
  });
});
