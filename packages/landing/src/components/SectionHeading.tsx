import { SectionTitle } from 'cyberui-2045';
import { SECTION_COPY } from '../data/product';
import { headingId, type HeadedSection } from '../sections';

interface SectionHeadingProps {
  id: HeadedSection;
  /** A small caption without the decorative line, for sections that are not really about a topic (the logo strip). */
  quiet?: boolean;
}

// The text comes from SECTION_COPY, so a section cannot render without one.
// SectionTitle is an <h2> but takes no id, so the id that names the <section>
// (aria-labelledby, see sectionProps) sits on a wrapper around it.
export function SectionHeading({ id, quiet = false }: SectionHeadingProps) {
  const { title, lead } = SECTION_COPY[id];
  return (
    <div className={quiet ? 'section-heading section-heading--quiet' : 'section-heading'}>
      <div id={headingId(id)}>
        <SectionTitle size={quiet ? 'sm' : 'lg'} showLine={!quiet}>
          {title}
        </SectionTitle>
      </div>
      {lead ? <p className="section-lead">{lead}</p> : null}
    </div>
  );
}
