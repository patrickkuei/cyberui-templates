import { Steps } from 'cyberui-2045';
import { STEPS } from '../data/product';
import { sectionProps } from '../sections';
import { SectionHeading } from './SectionHeading';

// Steps is built for progress through a flow, but here all three steps are just
// shown. It has no "none is current" mode: leaving `status` out makes step 0
// "current" (with an animated marker), and a `current` past the end logs a
// warning. Marking every step 'completed' gives the calm, static look instead.
// Orientation is left at the library's default: vertical on phones, horizontal
// from md up (its own responsive object, which works since cyberui-2045 2.8.0).
// Its marker and chevron glyphs are not aria-hidden (patrickkuei/CyberUI#122).
const ITEMS = STEPS.map((step) => ({ ...step, status: 'completed' as const }));

export function HowItWorksSection() {
  return (
    <section {...sectionProps('how-it-works')} className="section">
      <div className="page-width">
        <SectionHeading id="how-it-works" />
        <div className="steps-wrap">
          <Steps items={ITEMS} />
        </div>
      </div>
    </section>
  );
}
