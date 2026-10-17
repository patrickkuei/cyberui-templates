import { Card } from 'cyberui-2045';
import type { Feature } from '../data/features';
import { FEATURE_ICONS } from '../icons';

// The title is our own <h3> rather than Card's `title` prop. Card renders an
// <h3> only when `title` is given (none otherwise), but that one is fixed to
// the accent colour, a margin and (unless titleBorder is false) a rule, and the
// icon has to sit above it.
export function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = FEATURE_ICONS[feature.icon];
  return (
    <Card variant="small" className="card-surface feature-card">
      <span className="feature-icon">
        <Icon />
      </span>
      <h3 className="feature-title">{feature.title}</h3>
      <p className="feature-body">{feature.body}</p>
    </Card>
  );
}
