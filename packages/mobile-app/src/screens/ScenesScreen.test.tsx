import { useReducer } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STARTING_DEVICES } from '../data/devices';
import { createInitialState, reducer } from '../state/reducer';
import { ScenesScreen, describeSceneResult } from './ScenesScreen';

let latest = createInitialState();
function Harness() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  latest = state;
  return <ScenesScreen state={state} dispatch={dispatch} />;
}

describe('ScenesScreen', () => {
  it('has one h1 and a card with a heading and an Apply button for each scene', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { level: 1, name: 'Scenes' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Good night', 'Morning', 'Away']);
    expect(screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual(['Apply Good night', 'Apply Morning', 'Apply Away']);
  });

  it('has an empty polite status that is already in the page', () => {
    render(<Harness />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('applies a scene to the devices it lists and says which changed and which were offline', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Apply Good night' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Good night applied. Changed: Desk lamp, TV plug, Fan plug, Hall thermostat. Offline, so not changed: Hall light.',
    );
    expect(latest.devices.find((d) => d.id === 'tv-plug')).toMatchObject({ on: false });
    expect(latest.devices.find((d) => d.id === 'living-sensor')).toEqual(STARTING_DEVICES.find((d) => d.id === 'living-sensor'));
  });

  it('says so when a scene had nothing to change', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Apply Morning' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply Morning' }));
    expect(screen.getByRole('status')).toHaveTextContent('Morning applied. Nothing needed changing.');
  });
});

describe('describeSceneResult', () => {
  it('leaves out devices that no longer exist', () => {
    expect(describeSceneResult({ sceneId: 'away', changed: ['desk-lamp', 'gone'], offline: [] }, STARTING_DEVICES)).toBe('Away applied. Changed: Desk lamp.');
  });
});
