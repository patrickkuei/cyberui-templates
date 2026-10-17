import { FEATURES } from '../data/features';
import { sectionProps } from '../sections';
import { FeatureCard } from './FeatureCard';
import { SectionHeading } from './SectionHeading';

export function FeaturesSection() {
  return (
    <section {...sectionProps('features')} className="section">
      <div className="page-width">
        <SectionHeading id="features" />
        <ul className="feature-grid">
          {FEATURES.map((feature) => (
            <li key={feature.id}>
              <FeatureCard feature={feature} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
