import { Divider } from 'cyberui-2045';
import { LOGOS } from '../data/product';
import { sectionProps } from '../sections';
import { SectionHeading } from './SectionHeading';

// These are invented names set in text, not images, so there is nothing to
// license and no real company is implied. See LOGOS in data/product.ts.
export function LogoStrip() {
  return (
    <section {...sectionProps('logos')} className="section logos">
      <div className="page-width">
        <Divider />
        <SectionHeading id="logos" quiet />
        <ul className="logo-list">
          {LOGOS.map((name) => (
            <li key={name} className="logo-item">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
