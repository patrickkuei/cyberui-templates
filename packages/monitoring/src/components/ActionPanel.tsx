import { useState } from 'react';
import { Card } from 'cyberui-2045';
import type { StatusNote } from '../data/simulation';
import { TONE_CLASS } from '../theme/tones';

export interface ActionPanelProps {
  /**
   * Stable identity of the current situation (e.g. 'errors', 'latency', 'healthy').
   * An acknowledgment lasts until this changes; the headline may tick freely.
   */
  incidentKey: string;
  headline: string;
  headlineTone: 'success' | 'error';
  primaryActionLabel?: string;
  /** Informational lines listed under the action item, each with a success dot and no button. */
  notes?: readonly StatusNote[];
}

export function ActionPanel({ incidentKey, headline, headlineTone, primaryActionLabel, notes = [] }: ActionPanelProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  // Reset during render (not in an effect) when a genuinely new incident starts.
  const [prevIncidentKey, setPrevIncidentKey] = useState(incidentKey);
  if (incidentKey !== prevIncidentKey) {
    setPrevIncidentKey(incidentKey);
    setAcknowledged(false);
  }

  return (
    <Card title="What needs attention" className="action-panel panel-surface">
      {primaryActionLabel && (
        <div className="action-item">
          <span className={`action-dot ${TONE_CLASS[headlineTone]}`} aria-hidden="true" />
          <div className="action-item-body">
            <p className="action-item-title">{headline}</p>
            {!acknowledged ? (
              <button type="button" className="action-item-button" onClick={() => setAcknowledged(true)}>
                {primaryActionLabel}
              </button>
            ) : (
              <span className="action-item-done">Acknowledged</span>
            )}
          </div>
        </div>
      )}
      {notes.map((note) => (
        <div key={note.title} className="action-item action-item--static">
          <span className={`action-dot ${TONE_CLASS.success}`} aria-hidden="true" />
          <div className="action-item-body">
            <p className="action-item-title">{note.title}</p>
            {note.subtitle && <p className="action-item-subtitle">{note.subtitle}</p>}
          </div>
        </div>
      ))}
    </Card>
  );
}
