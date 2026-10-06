import { useEffect } from 'react';
import { TEMPLATE_ENTRIES, type TemplateEntry } from '../content/templateContent';
import { TemplateSection } from '../components/TemplateSection';
import { usePreviewNav } from '../router/usePreviewNav';

export interface TemplatesPageProps {
  /** Slug of the template whose preview is open (from the route). An unknown slug opens nothing. */
  openSlug?: string;
  /** Overridable so a test can render more than one template. */
  entries?: TemplateEntry[];
}

export function TemplatesPage({ openSlug, entries = TEMPLATE_ENTRIES }: TemplatesPageProps) {
  const { open, close } = usePreviewNav(openSlug);

  // A hash for a template that does not exist (#/templates/typo) opens nothing,
  // but would stay in the URL and in the history, so a later open-then-close
  // would land back on it. Replace it with the plain page.
  const unknownSlug = openSlug !== undefined && !entries.some((entry) => entry.template.slug === openSlug);
  useEffect(() => {
    if (unknownSlug) window.location.replace('#/templates');
  }, [unknownSlug]);

  return (
    <div className="templates-page">
      {/* The nav already says "Templates" and each section has its own heading, so a
          visible h1 would be a duplicate. It stays for the page outline and screen readers. */}
      <h1 className="visually-hidden">Templates</h1>
      {entries.map(({ template, content }) => (
        <TemplateSection
          key={template.slug}
          template={template}
          content={content}
          previewOpen={openSlug === template.slug}
          onOpenPreview={() => open(template.slug)}
          onClosePreview={close}
        />
      ))}
      {/* The page's only link to "How we design" besides the nav and the Code tab: someone who has
          just seen both templates is the person wondering where they came from. */}
      <p className="templates-page-end signpost">
        Wondering how these were made? <a href="#/process">How we design</a>
      </p>
    </div>
  );
}
