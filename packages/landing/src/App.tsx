import { useCallback, type ComponentType, type MouseEvent } from 'react';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { SECTIONS, type SectionId, type SectionProps } from './sections';
import { scrollToSection } from './utils/scrollToSection';
import { SiteHeader } from './components/SiteHeader';
import { HeroSection } from './components/HeroSection';
import { LogoStrip } from './components/LogoStrip';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { SignupSection } from './components/SignupSection';
import { SiteFooter } from './components/SiteFooter';
import './App.css';

// Record<SectionId, ...> is the page's table of contents: adding an id to
// SECTIONS (src/sections.ts) without a component here is a type error, instead
// of a section that silently never renders. Order comes from SECTIONS, not from
// this object. A component that needs nothing from SectionProps may ignore it.
const SECTION_COMPONENTS: Record<SectionId, ComponentType<SectionProps>> = {
  hero: HeroSection,
  logos: LogoStrip,
  features: FeaturesSection,
  'how-it-works': HowItWorksSection,
  pricing: PricingSection,
  faq: FaqSection,
  signup: SignupSection,
};

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  const goTo = useCallback((id: SectionId) => scrollToSection(id, reducedMotion), [reducedMotion]);

  // The skip link would normally be href="#main", but following it writes
  // location.hash (see utils/scrollToSection.ts). Focusing <main> does the same job.
  const skipToMain = (event: MouseEvent) => {
    event.preventDefault();
    document.getElementById('main')?.focus();
  };

  return (
    <div className="landing">
      <a className="skip-link" href="#main" onClick={skipToMain}>
        Skip to main content
      </a>
      <SiteHeader goTo={goTo} />
      <main id="main" tabIndex={-1}>
        {SECTIONS.map((id) => {
          const Section = SECTION_COMPONENTS[id];
          return <Section key={id} goTo={goTo} />;
        })}
      </main>
      <SiteFooter />
    </div>
  );
}
