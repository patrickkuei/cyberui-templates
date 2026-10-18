import { useReducer } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createScriptedConnection } from '../connection';
import { createInitialState, reducer, type AppState } from '../state/reducer';
import { DeviceScreen } from './DeviceScreen';

const connection = createScriptedConnection({ stepMs: 100 });

function Harness({ id, leave = vi.fn(), initial = createInitialState() }: { id: string; leave?: () => void; initial?: AppState }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <>
      <DeviceScreen state={state} dispatch={dispatch} connection={connection} deviceId={id} leave={leave} />
      <p data-testid="notice">{state.notice}</p>
    </>
  );
}

// "Power" is the name of a button and of the Link panel's neighbours, and the
// numeral repeats what the slider says: scope with within(...) or query by role
// and name rather than renaming anything.
const numeral = () => document.querySelector('.numeral') as HTMLElement;
const preset = (name: RegExp | string) => screen.getByRole('button', { name });
const link = () => within(screen.getByRole('region', { name: 'Link' }));

describe('DeviceScreen', () => {
  describe('a light', () => {
    it('shows a glowing glyph, its name as the one h1, its room, and its level as the big numeral', () => {
      render(<Harness id="desk-lamp" />);
      expect(screen.getByRole('heading', { level: 1, name: 'Desk lamp' })).toBeInTheDocument();
      expect(screen.getByText('Living room')).toBeInTheDocument();
      expect(numeral()).toHaveTextContent('70%');
      expect(document.querySelector('.glyph--lit')).not.toBeNull();
      expect(document.querySelector('.glyph-halo')).toHaveAttribute('opacity', '0.75');
    });

    it('changes the level with the wide slider, and the numeral and the glow follow', async () => {
      render(<Harness id="desk-lamp" />);
      const slider = screen.getByRole('slider', { name: 'Brightness' });
      expect(slider).toHaveAttribute('aria-valuenow', '70');
      slider.focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(slider).toHaveAttribute('aria-valuenow', '75');
      expect(numeral()).toHaveTextContent('75%');
      expect(document.querySelector('.glyph-halo')).toHaveAttribute('opacity', '0.79');
    });

    it('turns off and on from the full-width Power button, and the glyph goes dark', async () => {
      render(<Harness id="desk-lamp" />);
      await userEvent.click(screen.getByRole('button', { name: 'Turn off' }));
      expect(numeral()).toHaveTextContent('Off');
      expect(document.querySelector('.glyph-halo')).toBeNull();
      await userEvent.click(screen.getByRole('button', { name: 'Turn on' }));
      expect(numeral()).toHaveTextContent('70%');
    });

    it('lists the Scenes presets with their levels, and sets the level in one tap', async () => {
      render(<Harness id="desk-lamp" />);
      const scenes = within(screen.getByRole('region', { name: 'Scenes' }));
      expect(scenes.getAllByRole('button').map((button) => button.textContent)).toEqual(['Reading80', 'Movie25', 'Night5']);
      await userEvent.click(preset('Movie 25'));
      expect(screen.getByRole('slider', { name: 'Brightness' })).toHaveAttribute('aria-valuenow', '25');
      expect(numeral()).toHaveTextContent('25%');
    });

    it('marks the preset that matches as pressed, and none when the level is something else', async () => {
      render(<Harness id="desk-lamp" />);
      expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0);
      await userEvent.click(preset('Reading 80'));
      expect(preset('Reading 80')).toHaveAttribute('aria-pressed', 'true');
      expect(preset('Movie 25')).toHaveAttribute('aria-pressed', 'false');
      await userEvent.click(screen.getByRole('button', { name: 'Turn off' }));
      expect(preset('Reading 80')).toHaveAttribute('aria-pressed', 'false');
    });

    it('lights a light that is off when a scene is pressed', async () => {
      render(<Harness id="bedside-lamp" />);
      expect(numeral()).toHaveTextContent('Off');
      await userEvent.click(preset('Night 5'));
      expect(numeral()).toHaveTextContent('5%');
      expect(screen.getByRole('button', { name: 'Turn off' })).toBeInTheDocument();
    });
  });

  describe('a plug', () => {
    it('shows its draw while on, and a Power button and nothing else to control', async () => {
      render(<Harness id="tv-plug" />);
      expect(numeral()).toHaveTextContent('85W');
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
      expect(screen.queryByRole('region', { name: 'Scenes' })).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Turn off' }));
      expect(numeral()).toHaveTextContent('Off');
      expect(screen.getByRole('button', { name: 'Turn on' })).toBeInTheDocument();
    });
  });

  describe('a thermostat', () => {
    it('shows its target as the big numeral with the temperature now, a slider and 48px minus and plus buttons', () => {
      render(<Harness id="hall-thermostat" />);
      expect(numeral()).toHaveTextContent('20°');
      expect(screen.getByText('Now 19.5°')).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: 'Target temperature' })).toHaveAttribute('aria-valuenow', '20');
      expect(screen.getByRole('button', { name: 'Raise target temperature' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Lower target temperature' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Turn (on|off)$/ })).not.toBeInTheDocument();
    });

    it('moves half a degree for each press, and the slider follows', async () => {
      render(<Harness id="hall-thermostat" />);
      await userEvent.click(screen.getByRole('button', { name: 'Raise target temperature' }));
      expect(numeral()).toHaveTextContent('20.5°');
      await userEvent.click(screen.getByRole('button', { name: 'Lower target temperature' }));
      await userEvent.click(screen.getByRole('button', { name: 'Lower target temperature' }));
      expect(numeral()).toHaveTextContent('19.5°');
      expect(screen.getByRole('slider', { name: 'Target temperature' })).toHaveAttribute('aria-valuenow', '19.5');
    });

    it('announces its numeral politely, since the buttons have nothing else to say what changed', () => {
      render(<Harness id="hall-thermostat" />);
      expect(numeral()).toHaveAttribute('aria-live', 'polite');
      expect(numeral()).toHaveAccessibleName('Target temperature 20 °C');
    });

    it('follows the unit setting while storing Celsius: 68° in Fahrenheit, and one press is one whole degree', async () => {
      const initial = createInitialState();
      render(<Harness id="hall-thermostat" initial={{ ...initial, settings: { ...initial.settings, unit: 'F' } }} />);
      expect(numeral()).toHaveTextContent('68°');
      expect(screen.getByText('Now 67°')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Raise target temperature' }));
      expect(numeral()).toHaveTextContent('69°');
      expect(screen.getByRole('slider', { name: 'Target temperature' })).toHaveAttribute('aria-valuenow', '69');
    });

    it('offers Heat, Eco and Off as fixed modes, and Off darkens the glyph and dims the numeral', async () => {
      render(<Harness id="hall-thermostat" />);
      const modes = within(screen.getByRole('region', { name: 'Modes' }));
      expect(modes.getAllByRole('button').map((button) => button.textContent)).toEqual(['Heat22°', 'Eco18°', 'Off']);
      await userEvent.click(preset('Heat 22°'));
      expect(numeral()).toHaveTextContent('22°');
      expect(preset('Heat 22°')).toHaveAttribute('aria-pressed', 'true');
      await userEvent.click(preset('Off'));
      expect(preset('Off')).toHaveAttribute('aria-pressed', 'true');
      expect(numeral()).toHaveClass('numeral--dim');
      expect(screen.getByText('Off, now 19.5°')).toBeInTheDocument();
      expect(document.querySelector('.glyph-halo')).toBeNull();
    });

    it('switches back on when a target is picked after Off', async () => {
      render(<Harness id="hall-thermostat" />);
      await userEvent.click(preset('Off'));
      await userEvent.click(screen.getByRole('button', { name: 'Raise target temperature' }));
      expect(numeral()).not.toHaveClass('numeral--dim');
      expect(document.querySelector('.glyph-halo')).not.toBeNull();
    });
  });

  describe('a sensor', () => {
    it('shows its reading and a plain note that there is nothing to control', () => {
      render(<Harness id="living-sensor" />);
      expect(numeral()).toHaveTextContent('21.5°');
      expect(screen.getByText('Nothing to control here: this sensor only reports.')).toBeInTheDocument();
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
      expect(screen.queryByRole('region', { name: 'Scenes' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Turn (on|off)$/ })).not.toBeInTheDocument();
    });

    it('says when its battery is low', () => {
      render(<Harness id="bedroom-sensor" />);
      expect(screen.getByText('Battery is low.')).toBeInTheDocument();
    });

    it('says nothing about the battery when it is fine', () => {
      render(<Harness id="living-sensor" />);
      expect(screen.queryByText('Battery is low.')).not.toBeInTheDocument();
    });
  });

  describe('a device that cannot be reached', () => {
    it('shows a dark dashed glyph, says it is lost, and offers only Reconnect and Remove', () => {
      render(<Harness id="hall-light" />);
      expect(screen.getByRole('heading', { level: 1, name: 'Hall light' })).toBeInTheDocument();
      expect(screen.getByText('Lost. Controls are unavailable.')).toBeInTheDocument();
      expect(document.querySelector('.glyph--lit')).toBeNull();
      expect(document.querySelector('.hero--down')).not.toBeNull();
      expect(document.querySelector('.numeral')).toBeNull();
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
      expect(screen.queryByRole('region', { name: 'Scenes' })).not.toBeInTheDocument();
      expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['Reconnect', 'Remove device']);
    });

    it('says offline for a device that was disconnected, and shows no signal and no latency', async () => {
      render(<Harness id="desk-lamp" />);
      await userEvent.click(link().getByRole('button', { name: 'Disconnect' }));
      expect(screen.getByText('Offline. Controls are unavailable.')).toBeInTheDocument();
      expect(link().getByText('No link')).toBeInTheDocument();
      expect(link().getByRole('img', { name: 'Signal 0 of 4' })).toBeInTheDocument();
      expect(link().getByRole('button', { name: 'Reconnect' })).toBeInTheDocument();
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    });
  });

  describe('the Link panel', () => {
    it('shows signal bars and latency in milliseconds, and Disconnect, on every kind of device', () => {
      for (const [id, signal, latency] of [['desk-lamp', 4, 12], ['tv-plug', 3, 22], ['hall-thermostat', 4, 18], ['living-sensor', 3, 31]] as const) {
        const { unmount } = render(<Harness id={id} />);
        expect(link().getByRole('img', { name: `Signal ${signal} of 4` }), id).toBeInTheDocument();
        expect(link().getByText(`${latency} ms`), id).toBeInTheDocument();
        expect(link().getByRole('button', { name: 'Disconnect' }), id).toBeInTheDocument();
        unmount();
      }
    });

    it('says Weak, in amber, when the signal is a single bar', () => {
      render(<Harness id="fan-plug" />);
      expect(link().getByText('Weak, 96 ms')).toHaveClass('link-text--weak');
    });
  });

  describe('Remove device', () => {
    it('removes the device, says so, and leaves the page', async () => {
      const leave = vi.fn();
      render(<Harness id="tv-plug" leave={leave} />);
      await userEvent.click(screen.getByRole('button', { name: 'Remove device' }));
      expect(screen.getByTestId('notice')).toHaveTextContent('Removed TV plug.');
      expect(leave).toHaveBeenCalledTimes(1);
    });

    it('is offered on a device that is lost too', async () => {
      const leave = vi.fn();
      render(<Harness id="hall-light" leave={leave} />);
      await userEvent.click(screen.getByRole('button', { name: 'Remove device' }));
      expect(leave).toHaveBeenCalledTimes(1);
    });
  });

  it('says so, with a way back, when the device does not exist', () => {
    render(<Harness id="nope" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Device' })).toBeInTheDocument();
    expect(screen.getByText('That device is not here any more.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute('href', '#/devices');
  });
});

describe('Reconnect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
  // userEvent waits on real timers, which a fake clock never fires: these presses are fireEvent.

  it('shows the link steps in place of the Link panel, and brings the controls back when it works', async () => {
    render(<Harness id="desk-lamp" />);
    fireEvent.click(link().getByRole('button', { name: 'Disconnect' }));
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    fireEvent.click(link().getByRole('button', { name: 'Reconnect' }));
    expect(link().getByRole('list')).toBeInTheDocument();
    expect(link().queryByRole('button', { name: 'Reconnect' })).not.toBeInTheDocument();
    await advance(400 + 600);
    expect(link().queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Brightness' })).toHaveAttribute('aria-valuenow', '70');
    expect(link().getByRole('button', { name: 'Disconnect' })).toBeInTheDocument();
  });

  it('fails for the Hall light, scripted to, and says why, with Try again and Cancel', async () => {
    render(<Harness id="hall-light" />);
    fireEvent.click(link().getByRole('button', { name: 'Reconnect' }));
    await advance(1000);
    expect(link().getByRole('status')).toHaveTextContent('The link failed: No response from the hub');
    expect(screen.getByText('Lost. Controls are unavailable.')).toBeInTheDocument();
    expect(link().getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    fireEvent.click(link().getByRole('button', { name: 'Cancel' }));
    expect(link().getByRole('button', { name: 'Reconnect' })).toBeInTheDocument();
    expect(link().queryByRole('list')).not.toBeInTheDocument();
  });

  it('leaves no timer running when the page is left mid-link', async () => {
    const { unmount } = render(<Harness id="hall-light" />);
    fireEvent.click(link().getByRole('button', { name: 'Reconnect' }));
    await advance(150);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
