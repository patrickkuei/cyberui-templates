import type { Dispatch } from 'react';
import { Button } from 'cyberui-2045';
import { DeviceRow } from '../components/DeviceRow';
import { ScreenTitle } from '../components/ScreenTitle';
import { HOME_COPY, ROUTE_TITLES } from '../data/product';
import type { Action, AppState } from '../state/reducer';
import { homeSummary, roomOnText, roomStats } from '../utils/summary';

interface HomeScreenProps {
  state: AppState;
  dispatch: Dispatch<Action>;
}

/**
 * Home is for glancing: one sentence about the whole home, a chip per room, and
 * the devices under their room, each row a glyph that is lit when the device is
 * on. "Place before device": rooms are how you navigate, so they come first as
 * chips (with counts) and again as headings. Anything beyond flipping a switch
 * is one tap deeper, on the device's page.
 */
export function HomeScreen({ state, dispatch }: HomeScreenProps) {
  const { rooms, devices, roomFilter, settings } = state;
  // A filter that points at a room that no longer exists shows everything (the reducer also clears it).
  const filter = rooms.some((room) => room.id === roomFilter) ? roomFilter : null;
  const visibleRooms = rooms.filter((room) => filter === null || room.id === filter);

  return (
    <>
      <ScreenTitle>{ROUTE_TITLES.devices}</ScreenTitle>
      {devices.length === 0 ? (
        <p className="empty">{HOME_COPY.empty}</p>
      ) : (
        <p className="summary">{homeSummary(devices)}</p>
      )}

      <div className="chips" role="group" aria-label={HOME_COPY.filterLabel}>
        <button type="button" className="chip" aria-pressed={filter === null} onClick={() => dispatch({ type: 'filter/set', roomId: null })}>
          {HOME_COPY.all} <span className="chip-count">{devices.length}</span>
        </button>
        {rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            className="chip"
            aria-pressed={filter === room.id}
            onClick={() => dispatch({ type: 'filter/set', roomId: room.id })}
          >
            {room.name} <span className="chip-count">{roomStats(devices, room.id).devices}</span>
          </button>
        ))}
      </div>

      {visibleRooms.map((room) => {
        const inRoom = devices.filter((device) => device.roomId === room.id);
        const stats = roomStats(devices, room.id);
        const onText = roomOnText(stats);
        return (
          <section key={room.id} className="room" aria-labelledby={`room-${room.id}`}>
            <div className="room-head">
              <h2 id={`room-${room.id}`} className="room-title">
                {room.name}
                {onText && <span className="room-count">: {onText}</span>}
              </h2>
              {stats.switchable > 0 && (
                <Button
                  variant="secondary"
                  className="room-off"
                  aria-label={`${HOME_COPY.turnOffRoom} ${room.name}`}
                  disabled={stats.on === 0}
                  onClick={() => dispatch({ type: 'room/turn-off', id: room.id })}
                >
                  {HOME_COPY.turnOffRoom}
                </Button>
              )}
            </div>
            {inRoom.length === 0 ? (
              <p className="empty">{HOME_COPY.emptyFilter}</p>
            ) : (
              <ul className="device-list">
                {inRoom.map((device) => (
                  <DeviceRow key={device.id} device={device} unit={settings.unit} onToggle={(id) => dispatch({ type: 'device/toggle', id })} />
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {/* A button that navigates: the library has no link-styled Button. It sets the hash like a link would, so Back returns here. */}
      <Button
        className="full-width"
        onClick={() => {
          window.location.hash = '#/add';
        }}
      >
        {HOME_COPY.add}
      </Button>
    </>
  );
}
