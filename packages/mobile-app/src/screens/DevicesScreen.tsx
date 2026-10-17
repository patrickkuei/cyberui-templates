import { useEffect, useRef, useState, type Dispatch } from 'react';
import { Button, SectionTitle } from 'cyberui-2045';
import { DeviceRow, rowButtonId } from '../components/DeviceRow';
import { DeviceSheet } from '../components/DeviceSheet';
import { SCREEN_TITLE_ID, ScreenTitle } from '../components/ScreenTitle';
import { ROUTE_TITLES } from '../data/product';
import { ROOMS } from '../data/types';
import type { Action, AppState } from '../state/reducer';

interface DevicesScreenProps {
  state: AppState;
  dispatch: Dispatch<Action>;
}

export function DevicesScreen({ state, dispatch }: DevicesScreenProps) {
  // Which sheet is open is screen state, not app state: it is gone on a reload
  // and means nothing to the reducer. Looked up by id, so a removed device
  // closes its own sheet.
  const [openId, setOpenId] = useState<string | null>(null);
  const openDevice = state.devices.find((device) => device.id === openId);
  const { unit } = state.settings;

  // The sheet is a modal: when it closes, put focus back where the person was,
  // on that row's button (or on the title when the row is gone, which is what
  // Remove device does). The library only restores focus after its own close
  // paths, and only for keyboard users, so the Done and Remove buttons would
  // otherwise drop focus onto <body>.
  const openDeviceId = openDevice?.id;
  const lastOpened = useRef<string | null>(null);
  useEffect(() => {
    if (openDeviceId !== undefined) {
      lastOpened.current = openDeviceId;
      return;
    }
    if (lastOpened.current === null) return;
    const row = document.getElementById(rowButtonId(lastOpened.current));
    (row ?? document.getElementById(SCREEN_TITLE_ID))?.focus();
    lastOpened.current = null;
  }, [openDeviceId]);

  return (
    <>
      <ScreenTitle>{ROUTE_TITLES.devices}</ScreenTitle>
      {state.devices.length === 0 && <p className="empty">No devices yet. Add one to get started.</p>}
      {ROOMS.map((room) => {
        const inRoom = state.devices.filter((device) => device.room === room);
        if (inRoom.length === 0) return null;
        return (
          <section key={room} className="room" aria-label={room}>
            {/* SectionTitle renders the <h2> and cannot take an id, so the <section> is named with aria-label. */}
            <SectionTitle size="sm">{room}</SectionTitle>
            <ul className="device-list">
              {inRoom.map((device) => (
                <DeviceRow
                  key={device.id}
                  device={device}
                  unit={unit}
                  onToggle={(id) => dispatch({ type: 'device/toggle', id })}
                  onOpen={setOpenId}
                />
              ))}
            </ul>
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
        Add device
      </Button>
      <DeviceSheet device={openDevice} unit={unit} dispatch={dispatch} onClose={() => setOpenId(null)} />
    </>
  );
}
