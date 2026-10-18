import type { Dispatch } from 'react';
import { Button } from 'cyberui-2045';
import { ScreenTitle } from '../components/ScreenTitle';
import { ROOMS_COPY, ROUTE_TITLES } from '../data/product';
import { ChevronIcon } from '../icons';
import type { Action, AppState } from '../state/reducer';
import { roomOnText, roomStats } from '../utils/summary';

interface RoomsScreenProps {
  state: AppState;
  dispatch: Dispatch<Action>;
}

/**
 * A card per room: how many devices are on, a power figure, Turn off for the
 * whole room, and a chevron that opens Home filtered to the room. The figure is
 * derived from the devices (utils/summary.ts) and is invented, like every
 * number here: nothing measures anything. A room can only be removed while it
 * is empty; the reducer says why when it is not.
 */
export function RoomsScreen({ state, dispatch }: RoomsScreenProps) {
  return (
    <>
      <ScreenTitle>{ROUTE_TITLES.rooms}</ScreenTitle>
      <ul className="room-list">
        {state.rooms.map((room) => {
          const stats = roomStats(state.devices, room.id);
          return (
            <li key={room.id} className="room-card">
              <div className="room-card-head">
                <h2 className="room-card-title">{room.name}</h2>
                {/* Sets the filter, then goes to Home like a link would, so Back returns here. */}
                <button
                  type="button"
                  className="chevron-button"
                  aria-label={`${ROOMS_COPY.open} in ${room.name}`}
                  onClick={() => {
                    dispatch({ type: 'filter/set', roomId: room.id });
                    window.location.hash = '#/devices';
                  }}
                >
                  <ChevronIcon />
                </button>
              </div>
              <p className="room-card-watts">
                <span className="numeral numeral--card">{stats.watts}</span>
                <span className="numeral-unit">W</span>
              </p>
              <p className="room-card-on">{roomOnText(stats) || `${stats.devices} ${stats.devices === 1 ? 'device' : 'devices'}`}</p>
              <div className="room-card-actions">
                {stats.switchable > 0 && (
                  <Button
                    variant="secondary"
                    aria-label={`${ROOMS_COPY.turnOff} ${room.name}`}
                    disabled={stats.on === 0}
                    onClick={() => dispatch({ type: 'room/turn-off', id: room.id })}
                  >
                    {ROOMS_COPY.turnOff}
                  </Button>
                )}
                <button
                  type="button"
                  className="text-button text-button--quiet"
                  aria-label={`${ROOMS_COPY.remove} ${room.name}`}
                  onClick={() => dispatch({ type: 'room/remove', id: room.id })}
                >
                  {ROOMS_COPY.remove}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <Button
        className="full-width"
        onClick={() => {
          window.location.hash = '#/add-room';
        }}
      >
        {ROOMS_COPY.add}
      </Button>
    </>
  );
}
