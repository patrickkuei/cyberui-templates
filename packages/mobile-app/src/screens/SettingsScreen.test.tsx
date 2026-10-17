import { useReducer } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInitialState, reducer } from '../state/reducer';
import { SettingsScreen } from './SettingsScreen';

let latest = createInitialState();
function Harness() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  latest = state;
  return <SettingsScreen state={state} dispatch={dispatch} />;
}

describe('SettingsScreen', () => {
  it('has one h1 and a heading for each group', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Temperature', 'Alerts and access', 'About']);
  });

  it('offers the two units and shows the current one', () => {
    render(<Harness />);
    const group = within(screen.getByRole('group', { name: 'Temperature unit' }));
    expect(group.getByRole('radio', { name: '°C' })).toBeChecked();
    expect(group.getByRole('radio', { name: '°F' })).not.toBeChecked();
  });

  it('changes the unit in state, and only the unit', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('radio', { name: '°F' }));
    expect(latest.settings).toEqual({ unit: 'F', alertOffline: true, remoteAccess: false });
    expect(screen.getByRole('radio', { name: '°F' })).toBeChecked();
  });

  it('has a named switch for each setting, reflecting the defaults', () => {
    render(<Harness />);
    expect(screen.getByRole('switch', { name: 'Alert me when a device goes offline' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Remote access' })).not.toBeChecked();
  });

  it('flips each switch on its own', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('switch', { name: 'Remote access' }));
    expect(latest.settings).toEqual({ unit: 'C', alertOffline: true, remoteAccess: true });
    await userEvent.click(screen.getByRole('switch', { name: 'Alert me when a device goes offline' }));
    expect(latest.settings).toEqual({ unit: 'C', alertOffline: false, remoteAccess: true });
  });

  it('says in the About block that the app is a demo that controls nothing', () => {
    render(<Harness />);
    expect(screen.getByText('Template demo: Kestrel is fictional and controls nothing.')).toBeInTheDocument();
  });
});
