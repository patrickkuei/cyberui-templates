import type { ReactNode } from 'react';
import { Card } from 'cyberui-2045';
import type { Tone } from '../utils/trend';

export interface StatTileProps {
  label: string;
  value: string;
  tone?: Tone;
  icon?: ReactNode;
  status?: string;
  statusTone?: Tone;
}

// Colour comes from the shared .tone-* classes in App.css, not from a map in
// this file or an inline style, so every component that shows a tone reads
// the same single definition.
export function StatTile({ label, value, tone = 'default', icon, status, statusTone = 'default' }: StatTileProps) {
  return (
    <Card title={label} variant="small" titleBorder={false} className="panel-surface">
      <div className="stat-tile-main">
        {icon && (
          <span className="stat-tile-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <p className={`stat-tile-value tone-${tone}`}>{value}</p>
      </div>
      {status && (
        <p className={`stat-tile-status tone-${statusTone}`}>
          <span className="stat-tile-status-dot" aria-hidden="true" />
          {status}
        </p>
      )}
    </Card>
  );
}
