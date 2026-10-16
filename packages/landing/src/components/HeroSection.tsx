import { Badge, Button, Card, GradientText } from 'cyberui-2045';
import { HERO, type TerminalLineKind } from '../data/product';
import { headingId, sectionProps, type SectionProps } from '../sections';

// A Record over the line kinds, like every other kind -> class map in these
// templates: a new kind without a class is a compile error.
const TERMINAL_LINE_CLASS: Record<TerminalLineKind, string> = {
  command: 'terminal-line terminal-line--command',
  ok: 'terminal-line terminal-line--ok',
};

export function HeroSection({ goTo }: SectionProps) {
  return (
    <section {...sectionProps('hero')} className="section hero">
      <div className="page-width hero-inner">
        <div className="hero-copy">
          <Badge variant="neutral" shape="square" shadow={false} size="sm">
            {HERO.eyebrow}
          </Badge>
          <h1 id={headingId('hero')} className="hero-title">
            {HERO.headline.lead} <GradientText>{HERO.headline.highlight}</GradientText>
          </h1>
          <p className="hero-lead">{HERO.lead}</p>
          {/* MOCK: both buttons only scroll. size takes a per-breakpoint object since cyberui-2045 2.8.0. */}
          <div className="hero-actions">
            <Button size={{ base: 'md', lg: 'lg' }} onClick={() => goTo('signup')}>
              {HERO.primaryCta}
            </Button>
            <Button variant="secondary" size={{ base: 'md', lg: 'lg' }} onClick={() => goTo('pricing')}>
              {HERO.secondaryCta}
            </Button>
          </div>
          <dl className="hero-stats">
            {HERO.stats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        {/* Card renders no <h3> without a title, which is what we want here. */}
        <Card variant="small" className="card-surface hero-terminal">
          <figure>
            <figcaption className="visually-hidden">Example terminal session</figcaption>
            <pre className="terminal">
              <code>
                {HERO.terminal.map((line) => (
                  <span key={line.text} className={TERMINAL_LINE_CLASS[line.kind]}>
                    {line.text}
                  </span>
                ))}
              </code>
            </pre>
          </figure>
        </Card>
      </div>
    </section>
  );
}
