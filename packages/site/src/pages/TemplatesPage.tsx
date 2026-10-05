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
    </div>
  );
}
