import type { Dispatch } from 'react';
import { Card, Divider, RadioGroup, SectionTitle, Toggle } from 'cyberui-2045';
import { ScreenTitle } from '../components/ScreenTitle';
import { TouchRow } from '../components/TouchRow';
import { DEMO_NOTE, ROUTE_TITLES, SETTINGS_COPY } from '../data/product';
import type { TemperatureUnit } from '../data/types';
import type { Action, AppState } from '../state/reducer';

interface SettingsScreenProps {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const UNIT_OPTIONS = [
  { value: 'C', label: '°C' },
  { value: 'F', label: '°F' },
];

export function SettingsScreen({ state, dispatch }: SettingsScreenProps) {
  const { settings } = state;
  return (
    <>
      <ScreenTitle>{ROUTE_TITLES.settings}</ScreenTitle>

      <section className="settings-section" aria-label={SETTINGS_COPY.temperatureTitle}>
        <SectionTitle size="sm">{SETTINGS_COPY.temperatureTitle}</SectionTitle>
        <TouchRow control="radios">
          <RadioGroup
            label={SETTINGS_COPY.unitLabel}
            orientation="horizontal"
            options={UNIT_OPTIONS}
            value={settings.unit}
            onValueChange={(unit) => dispatch({ type: 'settings/set-unit', unit: unit as TemperatureUnit })}
          />
        </TouchRow>
      </section>

      <Divider />

      <section className="settings-section" aria-label={SETTINGS_COPY.alertsTitle}>
        <SectionTitle size="sm">{SETTINGS_COPY.alertsTitle}</SectionTitle>
        {/*
          MOCK: both switches are remembered in memory so they respond, and that
          is all. The template never asks for notification permission and never
          shows a notification; there is no remote access.
          Toggle needs an id for its visible label to name the switch
          (patrickkuei/CyberUI#120).
        */}
        <TouchRow control="switch">
          <Toggle
            id="setting-alert-offline"
            label={SETTINGS_COPY.alertOffline}
            role="switch"
            variant="accent"
            size="lg"
            checked={settings.alertOffline}
            onChange={(value) => dispatch({ type: 'settings/set-flag', flag: 'alertOffline', value })}
          />
        </TouchRow>
        <TouchRow control="switch">
          <Toggle
            id="setting-remote-access"
            label={SETTINGS_COPY.remoteAccess}
            role="switch"
            variant="accent"
            size="lg"
            checked={settings.remoteAccess}
            onChange={(value) => dispatch({ type: 'settings/set-flag', flag: 'remoteAccess', value })}
          />
        </TouchRow>
      </section>

      <Divider />

      <section className="settings-section" aria-label={SETTINGS_COPY.aboutTitle}>
        <SectionTitle size="sm">{SETTINGS_COPY.aboutTitle}</SectionTitle>
        <Card className="card-surface">
          <p className="about-version">{SETTINGS_COPY.version}</p>
          <p className="about-demo">{DEMO_NOTE}</p>
        </Card>
      </section>
    </>
  );
}
