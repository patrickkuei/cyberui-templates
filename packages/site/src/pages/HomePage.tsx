import { Button, GradientText } from 'cyberui-2045';
import { HeroScene } from '../components/HeroScene';
import { LibraryStats } from '../components/LibraryStats';
import { TOTAL_STAGES } from '../content/processStages';
import { TEMPLATES } from '../data/templates';

function goToTemplates() {
  window.location.hash = '#/templates';
}

// Derived from TEMPLATES (not hardcoded) so this sentence doesn't go
// stale the moment a second template ships.
const templateCountText = `${TEMPLATES.length} template${TEMPLATES.length === 1 ? '' : 's'} ready.`;

export function HomePage() {
  return (
    <div className="home">
      <section className="hero">
        <HeroScene />
        <div className="hero-content">
          <GradientText as="h1" variant="accent" className="hero-title">
            Built by AI.
            <br />
            Ready for yours.
          </GradientText>
          <Button variant="primary" onClick={goToTemplates}>
            Pick a starting point
          </Button>
        </div>
      </section>

      <section className="home-intro">
        <h2>Pick a template, make it yours</h2>
        <p>
          cyberui-2045 is named for the year the Singularity is predicted. The library and every template here were
          made by AI. Copy one, tell your AI what to change, and the look stays consistent as you build.
        </p>
        <LibraryStats />
        <ul className="home-features">
          <li>
            <strong>Looks right from minute one.</strong> Colors, spacing and glow are already decided.
          </li>
          <li>
            <strong>Change it by asking.</strong> Describe the change to your AI. It builds on parts that already fit.
          </li>
          <li>
            <strong>Yours to keep.</strong> Open source, so copy it, edit it, ship it. The steps are on GitHub.
          </li>
          {/* A signpost, not a second call to action: Home's one button stays "Pick a starting point".
              The stage count comes from the process data, like the template count below. */}
          <li>
            <strong>See how it was made.</strong> {TOTAL_STAGES} stages from discovery to handoff, each with what we
            actually produced, and where we produced less. <a href="#/process">How we design</a>
          </li>
        </ul>
        <p className="home-template-count">{templateCountText}</p>
      </section>
    </div>
  );
}
