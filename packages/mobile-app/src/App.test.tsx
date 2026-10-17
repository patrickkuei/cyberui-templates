import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { DEMO_NOTE } from './data/product';

function goTo(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event('hashchange'));
  });
}

// The tab names are also the screens' headings and a few buttons' words, so a
// bare getByText finds several. Query by role, inside the navigation.
const nav = () => within(screen.getByRole('navigation', { name: 'Main' }));

describe('App', () => {
  afterEach(() => {
    window.location.hash = '';
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the Devices screen by default, with the three landmarks', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Devices' })).toBeInTheDocument();
    expect(nav().getByRole('link', { name: 'Devices' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows the Demo badge in the app bar on every screen', () => {
    render(<App />);
    expect(within(screen.getByRole('banner')).getByText('Demo')).toBeInTheDocument();
    goTo('#/settings');
    expect(within(screen.getByRole('banner')).getByText('Demo')).toBeInTheDocument();
  });

  it('has exactly one h1 on every screen, and headings never skip a level', () => {
    render(<App />);
    for (const hash of ['#/devices', '#/scenes', '#/settings', '#/add']) {
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

  it('falls back to Devices for an unknown hash', () => {
    window.location.hash = '#/nope';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Devices' })).toBeInTheDocument();
  });

  it('moves between the tabs through real links, marking the current one', async () => {
    render(<App />);
    await userEvent.click(nav().getByRole('link', { name: 'Scenes' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Scenes' })).toBeInTheDocument();
    expect(nav().getByRole('link', { name: 'Scenes' })).toHaveAttribute('aria-current', 'page');
    expect(nav().getByRole('link', { name: 'Devices' })).not.toHaveAttribute('aria-current');
    await userEvent.click(nav().getByRole('link', { name: 'Settings' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
  });

  it('keeps the document title in step with the route', () => {
    render(<App />);
    expect(document.title).toBe('Devices — Kestrel');
    goTo('#/scenes');
    expect(document.title).toBe('Scenes — Kestrel');
  });

  it('moves focus to the new screen’s title on a route change, but not on first load', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveFocus();
    goTo('#/settings');
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toHaveFocus();
  });

  it('scrolls to the top on a route change', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<App />);
    expect(scrollTo).not.toHaveBeenCalled();
    goTo('#/scenes');
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('skips to the main content without touching location.hash', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('link', { name: 'Skip to main content' }));
    expect(screen.getByRole('main')).toHaveFocus();
    expect(window.location.hash).toBe('');
  });

  describe('Add device, pushed on top of Devices', () => {
    it('hides the bottom nav and shows a Back button', async () => {
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      expect(await screen.findByRole('heading', { level: 1, name: 'Add device' })).toBeInTheDocument();
      expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });

    it('goes back to Devices from Back and from Cancel, without adding anything', async () => {
      // happy-dom does not run a real session history, so Back is done by hand.
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      await screen.findByRole('heading', { level: 1, name: 'Add device' });
      await userEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(await screen.findByRole('heading', { level: 1, name: 'Devices' })).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      await screen.findByRole('heading', { level: 1, name: 'Add device' });
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(await screen.findByRole('heading', { level: 1, name: 'Devices' })).toBeInTheDocument();
      expect(screen.queryByText(/Shelf lamp/)).not.toBeInTheDocument();
    });

    it('pairs a device: it appears in its room and the confirmation names the demo', async () => {
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      await screen.findByRole('heading', { level: 1, name: 'Add device' });
      await userEvent.type(screen.getByLabelText('Device name'), 'Shelf lamp');
      await userEvent.selectOptions(screen.getByLabelText('Room'), 'Bedroom');
      await userEvent.type(screen.getByLabelText('Pairing code'), 'ab12cd');
      await userEvent.click(screen.getByRole('button', { name: 'Save device' }));

      expect(await screen.findByRole('heading', { level: 1, name: 'Devices' })).toBeInTheDocument();
      const bedroom = within(screen.getByRole('region', { name: 'Bedroom' }));
      expect(bedroom.getByRole('button', { name: /Shelf lamp/ })).toBeInTheDocument();
      expect(screen.getByRole('status', { name: '' })).toHaveTextContent(`Added Shelf lamp to Bedroom. ${DEMO_NOTE}`);
    });

    it('lets the person dismiss the confirmation', async () => {
      vi.spyOn(window.history, 'back').mockImplementation(() => goTo('#/devices'));
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      await screen.findByRole('heading', { level: 1, name: 'Add device' });
      await userEvent.type(screen.getByLabelText('Device name'), 'Shelf lamp');
      await userEvent.type(screen.getByLabelText('Pairing code'), 'ab12cd');
      await userEvent.click(screen.getByRole('button', { name: 'Save device' }));
      await screen.findByRole('heading', { level: 1, name: 'Devices' });
      await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(screen.queryByText(/Template demo/)).not.toBeInTheDocument();
    });

    it('opened directly at #/add, Cancel replaces the entry with Devices instead of going Back out of the app', async () => {
      window.location.hash = '#/add';
      const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      render(<App />);
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(back).not.toHaveBeenCalled();
      expect(await screen.findByRole('heading', { level: 1, name: 'Devices' })).toBeInTheDocument();
    });
  });

  describe('state is shared between screens', () => {
    it('shows a unit change on Devices', async () => {
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Settings' }));
      await userEvent.click(await screen.findByRole('radio', { name: '°F' }));
      await userEvent.click(nav().getByRole('link', { name: 'Devices' }));
      await screen.findByRole('heading', { level: 1, name: 'Devices' });
      expect(screen.getByText('Target 68 °F')).toBeInTheDocument();
    });

    it('shows a scene on Devices', async () => {
      render(<App />);
      await userEvent.click(nav().getByRole('link', { name: 'Scenes' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Apply Good night' }));
      await userEvent.click(nav().getByRole('link', { name: 'Devices' }));
      await screen.findByRole('heading', { level: 1, name: 'Devices' });
      expect(screen.getByRole('switch', { name: 'Desk lamp power' })).not.toBeChecked();
      expect(screen.getByRole('switch', { name: 'Fan plug power' })).toBeChecked();
    });
  });

  describe('is a demo that controls nothing', () => {
    it('says so in Settings', async () => {
      render(<App />);
      goTo('#/settings');
      expect(screen.getByText(DEMO_NOTE)).toBeInTheDocument();
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
      await userEvent.click(screen.getByRole('button', { name: /TV plug/ }));
      await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Done' }));
      await userEvent.click(screen.getByRole('button', { name: 'Add device' }));
      await screen.findByRole('heading', { level: 1, name: 'Add device' });
      await userEvent.type(screen.getByLabelText('Device name'), 'Shelf lamp');
      await userEvent.type(screen.getByLabelText('Pairing code'), 'ab12cd');
      await userEvent.click(screen.getByRole('button', { name: 'Save device' }));
      await screen.findByRole('heading', { level: 1, name: 'Devices' });
      await userEvent.click(nav().getByRole('link', { name: 'Scenes' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Apply Away' }));
      await userEvent.click(nav().getByRole('link', { name: 'Settings' }));
      await userEvent.click(await screen.findByRole('switch', { name: 'Alert me when a device goes offline' }));
      await userEvent.click(screen.getByRole('switch', { name: 'Remote access' }));

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(notificationSpy).not.toHaveBeenCalled();
      expect(bluetoothRead).not.toHaveBeenCalled();
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      Reflect.deleteProperty(navigator, 'bluetooth');
    });
  });
});
