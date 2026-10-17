import type { Dispatch } from 'react';
import { Button, Card } from 'cyberui-2045';
import { ScreenTitle } from '../components/ScreenTitle';
import { ROUTE_TITLES } from '../data/product';
import { SCENES } from '../data/scenes';
import type { Device, SceneResult } from '../data/types';
import type { Action, AppState } from '../state/reducer';

interface ScenesScreenProps {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const names = (ids: string[], devices: Device[]) =>
  ids.flatMap((id) => devices.find((device) => device.id === id)?.name ?? []).join(', ');

/** What applying a scene did, in a sentence or two. Devices that no longer exist are left out. */
export function describeSceneResult(result: SceneResult, devices: Device[]): string {
  const sceneName = SCENES.find((scene) => scene.id === result.sceneId)?.name ?? 'Scene';
  const changed = names(result.changed, devices);
  const offline = names(result.offline, devices);
  const parts = [`${sceneName} applied.`, changed ? `Changed: ${changed}.` : 'Nothing needed changing.'];
  if (offline) parts.push(`Offline, so not changed: ${offline}.`);
  return parts.join(' ');
}

export function ScenesScreen({ state, dispatch }: ScenesScreenProps) {
  return (
    <>
      <ScreenTitle>{ROUTE_TITLES.scenes}</ScreenTitle>
      {/* role="status" is a polite live region. It must be in the page before its text changes, so it is always rendered. */}
      <p role="status" className="scene-result">
        {state.sceneResult ? describeSceneResult(state.sceneResult, state.devices) : ''}
      </p>
      <ul className="scene-list">
        {SCENES.map((scene) => (
          <li key={scene.id}>
            {/*
              Card gives its body text the magenta --color-primary and its
              children space-y margins; card-surface (App.css) resets both. A
              Card `title` would render an <h3> straight under the <h1>, so the
              heading is written out as an <h2> instead.
            */}
            <Card className="card-surface scene-card">
              <h2 className="scene-name">{scene.name}</h2>
              <p className="scene-summary">{scene.summary}</p>
              {/* MOCK: applying a scene edits the in-memory devices (state/reducer.ts). It reaches nothing real. */}
              <Button variant="secondary" aria-label={`Apply ${scene.name}`} onClick={() => dispatch({ type: 'scene/apply', sceneId: scene.id })}>
                Apply
              </Button>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
