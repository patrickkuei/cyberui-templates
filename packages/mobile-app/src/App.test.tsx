import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { DEMO_NOTE } from './data/product';

function goTo(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event('hashchange'));
  });
}

// The tab names are also headings and a few buttons' words ("Rooms", "Home"), so a
// bare getByText finds several. Query by role, inside the navigation.
const nav = () => within(screen.getByRole('navigation', { name: 'Main' }));
const h1 = (name: string) => screen.findByRole('heading', { level: 1, name });

describe('App', () => {
  afterEach(() => {
    window.location.hash = '';
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders Home by default, with the three landmarks', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeInTheDocument();
    expect(nav().getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows the Demo badge in the app bar on every screen', () => {
    render(<App />);
    for (const hash of ['#/devices', '#/device/desk-lamp', '#/rooms', '#/settings', '#/add', '#/add-room']) {
      goTo(hash);
      expect(within(screen.getByRole('banner')).getByText('Demo'), hash).toBeInTheDocument();
    }
  });

  it('has exactly one h1 on every screen, and headings never skip a level', () => {
    render(<App />);
    for (const hash of ['#/devices', '#/device/desk-lamp', '#/device/hall-light', '#/device/living-sensor', '#/rooms', '#/settings', '#/add', '#/add-room', '#/device/nope']) {
      goTo(hash);
      expect(screen.getAllByRole('heading', { level: 1 }), hash).toHaveLength(1);
      let previous = 0;
      for (const heading of screen.getAllByRole('heading')) {
        const level = Number(heading.tagName.slice(1));
        expect(level, `${hash}: "${heading.textContent}" jumps from h${previous} to h${level}`).toBeLessThanOrEqual(previous + 1);
        previous = level;
      }
    }
  });

  it('falls back to Home for an unknown hash', () => {
    window.location.hash = '#/nope';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeInTheDocument();
  });

  it('moves between the tabs through real links, marking the current one', async () => {
    render(<App />);
    await userEvent.click(nav().getByRole('link', { name: 'Rooms' }));
    expect(await h1('Rooms')).toBeInTheDocument();
    expect(nav().getByRole('link', { name: 'Rooms' })).toHaveAttribute('aria-current', 'page');
    expect(nav().getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    await userEvent.click(nav().getByRole('link', { name: 'Settings' }));
    expect(await h1('Settings')).toBeInTheDocument();
  });

  it('keeps the document title in step with the route, and names the device on its page', () => {
    render(<App />);
    expect(document.title).toBe('Home — Kestrel');
    goTo('#/rooms');
    expect(document.title).toBe('Rooms — Kestrel');
    goTo('#/device/desk-lamp');
    expect(document.title).toBe('Desk lamp — Kestrel');
    goTo('#/device/nope');
    expect(document.title).toBe('Device — Kestrel');
  });

  it('moves focus to the new screen’s title on a route change, but not on first load', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveFocus();
    goTo('#/settings');
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toHaveFocus();
  });

  it('moves focus to the title when only the device changes', () => {
    render(<App />);
    goTo('#/device/desk-lamp');
    goTo('#/device/tv-plug');
    expect(screen.getByRole('heading', { level: 1, name: 'TV plug' })).toHaveFocus();
  });

  // happy-dom focuses anything, so these would pass without the attribute while a
  // real browser would not focus an <h1> or <main>: route-change focus and the
  // skip link would silently stop working.
  it('makes the screen title and <main> programmatically focusable', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });

  it('scrolls to the top on a route change', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<App />);
    expect(scrollTo).not.toHaveBeenCalled();
    goTo('#/rooms');
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('skips to the main content without touching location.hash', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('link', { name: 'Skip to main content' }));
    expect(screen.getByRole('main')).toHaveFocus();
    expect(window.location.hash).toBe('');
  });

  describe('a device page, pushed on top of Home', () => {
    it('opens from a row, hides the bottom nav and shows a Back button', async () => {
      render(<App />);
      await userEvent.click(screen.getByRole('link', { name: /Desk lamp/ }));
      expect(await h1('Desk lamp')).toBeInTheDocument();
      expect(window.location.hash).toBe('#/device/desk-lamp');
      expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });

    it('goes Back to Home, with the room filter and the switches as they were left', async () => {
      // happy-dom does not run a real session history, so Back is done by hand.
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Hall 2' }));
      await userEvent.click(screen.getByRole('link', { name: /Hall thermostat/ }));
      await h1('Hall thermostat');
      await userEvent.click(screen.getByRole('button', { name: 'Lower target temperature' }));
      await userEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(await h1('Home')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Hall 2' })).toHaveAttribute('aria-pressed', 'true');
      expect(within(screen.getByRole('link', { name: /Hall thermostat/ })).getByText('19.5°')).toBeInTheDocument();
    });

    it('shows a change made on the page in the row, and the power button on Home follows the page', async () => {
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));
      render(<App />);
      await userEvent.click(screen.getByRole('link', { name: /TV plug/ }));
      await userEvent.click(await screen.findByRole('button', { name: 'Turn off' }));
      await userEvent.click(screen.getByRole('button', { name: 'Back' }));
      await h1('Home');
      expect(screen.getByRole('switch', { name: 'TV plug power' })).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByText('3 on, 3 need attention')).toBeInTheDocument();
    });

    it('removes a device from its page, goes back, and says so on Home', async () => {
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));
      render(<App />);
      await userEvent.click(screen.getByRole('link', { name: /Desk lamp/ }));
      await userEvent.click(await screen.findByRole('button', { name: 'Remove device' }));
      await h1('Home');
      expect(screen.queryByRole('link', { name: /Desk lamp/ })).not.toBeInTheDocument();
      expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Removed Desk lamp.');
    });

    it('starts another device’s page clean: a Reconnect in progress is not carried over to it', async () => {
      render(<App />);
      goTo('#/device/hall-light');
      await userEvent.click(screen.getByRole('button', { name: 'Reconnect' }));
      expect(screen.getByRole('list')).toBeInTheDocument();
      goTo('#/device/desk-lamp');
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Disconnect' })).toBeInTheDocument();
    });

    it('opened directly, Back replaces the entry with Home instead of leaving the app', async () => {
      window.location.hash = '#/device/desk-lamp';
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(back).not.toHaveBeenCalled();
      expect(await h1('Home')).toBeInTheDocument();
    });
  });

  describe('Rooms', () => {
    it('opens Home filtered to a room from its chevron', async () => {
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Rooms' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Show devices in Bedroom' }));
      expect(await h1('Home')).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Bedroom: 0 of 2 on']);
      expect(screen.getByRole('button', { name: 'Bedroom 3' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('adds a room: the new room is on Rooms, as a chip on Home and as a choice in Add device, and the notice says so', async () => {
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/rooms'));
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Rooms' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Add room' }));
      await h1('Add room');
      expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
      await userEvent.type(screen.getByLabelText('Room name'), 'Kitchen');
      await userEvent.click(screen.getByRole('button', { name: 'Add room' }));
      await h1('Rooms');
      expect(screen.getByRole('heading', { level: 2, name: 'Kitchen' })).toBeInTheDocument();
      expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Added the room Kitchen.');
      await userEvent.click(nav().getByRole('link', { name: 'Home' }));
      expect(await screen.findByRole('button', { name: 'Kitchen 0' })).toBeInTheDocument();
    });

    it('will not remove a room that still has devices, and says why', async () => {
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Rooms' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Remove room Bedroom' }));
      expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Bedroom still has 3 devices. Remove them first.');
      expect(screen.getByRole('heading', { level: 2, name: 'Bedroom' })).toBeInTheDocument();
    });
  });

  describe('the notice', () => {
    it('can be dismissed', async () => {
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Rooms' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Remove room Hall' }));
      await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(screen.getByRole('status', { name: '' })).toBeEmptyDOMElement();
    });

    it('goes when the person moves to another tab', async () => {
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Rooms' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Remove room Hall' }));
      expect(screen.getByRole('status', { name: '' })).not.toBeEmptyDOMElement();
      await userEvent.click(nav().getByRole('link', { name: 'Settings' }));
      expect(screen.getByRole('status', { name: '' })).toBeEmptyDOMElement();
    });
  });

  describe('state is shared between screens', () => {
    it('shows a unit change on Home and on a device page', async () => {
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Settings' }));
      await userEvent.click(await screen.findByRole('radio', { name: '°F' }));
      await userEvent.click(nav().getByRole('link', { name: 'Home' }));
      await h1('Home');
      expect(within(screen.getByRole('link', { name: /Hall thermostat/ })).getByText('68°')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('link', { name: /Hall thermostat/ }));
      await h1('Hall thermostat');
      expect(document.querySelector('.numeral')).toHaveTextContent('68°');
    });
  });

  // The scripted scan takes 2.4s and each of the four link steps 0.6s. A fake
  // clock runs them at once, but only around the waits: navigating changes the
  // hash, which happy-dom delivers on a real timer, so that part runs on the
  // real clock (and userEvent, which also waits on real timers, only works there).
  async function onFakeClock(run: (advance: (ms: number) => Promise<void>) => Promise<void>) {
    vi.useFakeTimers();
    try {
      await run((ms) => act(async () => { await vi.advanceTimersByTimeAsync(ms); }));
    } finally {
      vi.useRealTimers();
    }
  }

  describe('Add device, end to end', () => {
    it('scans, picks, links, names, and lands on Home with the device in its room and a notice', async () => {
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      await h1('Add device');
      expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
      await onFakeClock(async (advance) => {
        fireEvent.click(screen.getByRole('button', { name: 'Start scan' }));
        await advance(2400);
        fireEvent.click(screen.getByRole('button', { name: /Shelf lamp/ }));
        await advance(2400 + 600);
      });
      fireEvent.change(screen.getByLabelText('Room'), { target: { value: 'bedroom' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add device' }));
      expect(await h1('Home')).toBeInTheDocument();
      const bedroom = within(screen.getByRole('region', { name: /^Bedroom/ }));
      expect(bedroom.getByRole('link', { name: /Shelf lamp/ })).toBeInTheDocument();
      expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Added Shelf lamp to Bedroom.');
    });
  });

  describe('is a demo that controls nothing', () => {
    it('says so in Settings', () => {
      render(<App />);
      goTo('#/settings');
      expect(screen.getByText(DEMO_NOTE)).toBeInTheDocument();
    });

    it('says so on the Scan screen', () => {
      render(<App />);
      goTo('#/add');
      expect(screen.getByText(/This scan is scripted: nothing is discovered/)).toBeInTheDocument();
    });

    it('never calls fetch, Bluetooth or notifications while it is used', async () => {
      const fetchSpy = vi.fn();
      const bluetoothRead = vi.fn();
      const notificationSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      vi.stubGlobal('Notification', notificationSpy);
      Object.defineProperty(navigator, 'bluetooth', { configurable: true, get: bluetoothRead });
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));

      render(<App />);
      await userEvent.click(screen.getByRole('switch', { name: 'Desk lamp power' }));
      await userEvent.click(screen.getByRole('button', { name: 'Turn off Living room' }));
      await userEvent.click(screen.getByRole('link', { name: /Hall light/ }));
      const reconnect = await screen.findByRole('button', { name: 'Reconnect' });
      await onFakeClock(async (advance) => {
        fireEvent.click(reconnect);
        await advance(3000);
      });
      await userEvent.click(screen.getByRole('button', { name: 'Back' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Add device' }));
      await h1('Add device');
      await onFakeClock(async (advance) => {
        fireEvent.click(screen.getByRole('button', { name: 'Start scan' }));
        await advance(2400);
        fireEvent.click(screen.getByRole('button', { name: /Kettle plug/ }));
        await advance(3000);
      });
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      await h1('Home');
      await userEvent.click(nav().getByRole('link', { name: 'Settings' }));
      await userEvent.click(await screen.findByRole('switch', { name: 'Alert me when a device goes offline' }));
      await userEvent.click(screen.getByRole('switch', { name: 'Remote access' }));

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(notificationSpy).not.toHaveBeenCalled();
      expect(bluetoothRead).not.toHaveBeenCalled();
      Reflect.deleteProperty(navigator, 'bluetooth');
    });
  });
});
