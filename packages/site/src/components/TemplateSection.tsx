import { useId, type CSSProperties } from 'react';
import { Badge, Button } from 'cyberui-2045';
import type { Template } from '../data/templates';
import type { TemplateContent } from '../content/types';
import { ExampleFolds } from './ExampleFolds';
import { PreviewDialog } from './PreviewDialog';
import { StartBlock } from './StartBlock';
import { TemplatePreview } from './TemplatePreview';

export interface TemplateSectionProps {
  template: Template;
  content: TemplateContent;
  /** Whether this template's preview dialog is open. The parent owns it (it is the URL hash). */
  previewOpen: boolean;
  onOpenPreview: () => void;
  onClosePreview: () => void;
}

// One template, top to bottom: what it is, a screenshot that opens the
// running template, whether it fits, two folded examples, how to start.
//
// The template's accent hue is scoped to two places: the hero (name badge and
// the outlined "Run the live demo" button) and the glowing "Copy start prompt"
// button inside StartBlock, which is the main action. Everything else sits in
// .neutral-scope or is plain text.
export function TemplateSection({ template, content, previewOpen, onOpenPreview, onClosePreview }: TemplateSectionProps) {
  const headingId = useId();
  const accentStyle = {
    '--color-accent': template.accentHex,
    '--color-secondary': template.accentHex,
  } as CSSProperties;

  return (
    <section className="template-section" aria-labelledby={headingId}>
      <div className="template-hero" style={accentStyle}>
        <header className="template-section-header">
          <h2 id={headingId}>{template.name}</h2>
          <Badge variant="secondary" size="sm">
            {template.accentLabel} accent
          </Badge>
        </header>
        <p className="template-section-tagline">{template.tagline}</p>

        <div className="template-frame">
          <div className="template-frame-bar" aria-hidden="true">
            <span className="template-frame-dot" />
            <span className="template-frame-dot" />
            <span className="template-frame-dot" />
            <span className="template-frame-path">live/{template.slug}</span>
          </div>
          <div className="template-frame-screen">
            <img src={template.screenshotSrc} alt={`${template.name} screenshot`} />
            {/* Lets a mouse user click anywhere on the screenshot. It is hidden from
                assistive technology and out of the tab order on purpose: the "Run the
                live demo" button below is the keyboard and screen-reader target. */}
            <button type="button" className="template-frame-hit" tabIndex={-1} aria-hidden="true" onClick={onOpenPreview} />
            <div className="template-frame-overlay">
              <Button variant="secondary" onClick={onOpenPreview}>
                <span aria-hidden="true">▶</span> Run the live demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="template-fit">
        <h3>Use this if you&apos;re building…</h3>
        <ul>
          {content.useIf.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="template-headsup">
          <strong>Heads-up:</strong> {content.headsUp}
        </p>
        <p className="template-notfor">
          <strong>Probably not for you</strong> {content.notFor}
        </p>
      </div>

      <div className="template-examples neutral-scope">
        <h3>Examples: how you might use it</h3>
        <ExampleFolds examples={content.examples} />
      </div>

      <StartBlock name={template.name} slug={template.slug} accentHex={template.accentHex} />

      <PreviewDialog isOpen={previewOpen} onClose={onClosePreview} title={template.name}>
        <TemplatePreview template={template} code={content.code} onClose={onClosePreview} />
      </PreviewDialog>
    </section>
  );
}
