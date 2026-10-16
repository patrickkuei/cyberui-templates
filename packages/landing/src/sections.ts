/**
 * The page is one scroll, so its "routes" are sections. This list is the single
 * source of truth for which sections exist and in what order: SectionId is
 * derived from it, App.tsx keeps its components in a Record<SectionId, ...> and
 * data/product.ts keeps the nav labels and the headings in Record<SectionId, ...>
 * maps. Adding a section here is therefore a compile error until you have
 * written its component and decided whether it appears in the nav, the same
 * trick as the ROUTES tuple in the other templates.
 */
export const SECTIONS = ['hero', 'logos', 'features', 'how-it-works', 'pricing', 'faq', 'signup'] as const;
export type SectionId = (typeof SECTIONS)[number];

/** Every section except the hero, whose heading is the page's <h1>, written out in HeroSection. */
export type HeadedSection = Exclude<SectionId, 'hero'>;

/** What every section component receives. goTo scrolls to another section (see utils/scrollToSection.ts). */
export interface SectionProps {
  goTo: (id: SectionId) => void;
}

/** The id of a section's heading element, which names the <section> for screen readers. */
export function headingId(id: SectionId): string {
  return `${id}-heading`;
}

/**
 * Spread onto each section's <section>: its id (the scroll target), its
 * accessible name, and tabIndex -1 so scrollToSection can move keyboard focus
 * there. -1 keeps it out of the Tab order; only code can focus it.
 */
export function sectionProps(id: SectionId) {
  return { id, 'aria-labelledby': headingId(id), tabIndex: -1 } as const;
}
