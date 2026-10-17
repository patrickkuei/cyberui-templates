// All the page's words that are not a feature, a plan or a question live in this
// file, so "swap Tessera for your product" is a data edit rather than a hunt
// through JSX. Everything here is fiction: Tessera is not a real product, the
// numbers are illustrative, and the logo names are made-up placeholders, not
// real companies. Replace them, do not ship them.
import { SECTIONS, type HeadedSection, type SectionId } from '../sections';

export const PRODUCT_NAME = 'Tessera';
export const TAGLINE = 'Zero-config deploys for web apps.';

export const HERO = {
  eyebrow: 'Zero-config deploys',
  // The h1 is `lead` followed by `highlight` wrapped in <GradientText>.
  headline: { lead: 'From git push to', highlight: 'live in seconds' },
  lead: 'Tessera detects your framework, builds it and puts it on a global network. No config files, no dashboard to learn.',
  primaryCta: 'Start free trial',
  secondaryCta: 'See pricing',
  terminal: [
    { kind: 'command', text: '$ git push tessera main' },
    { kind: 'ok', text: '✓ Detected Vite + React' },
    { kind: 'ok', text: '✓ Built in 14s' },
    // .example is a reserved domain: this URL can never belong to a real site.
    { kind: 'ok', text: '✓ Live at https://my-app.tessera.example' },
  ],
  // Illustrative figures, not measurements (the footer line says the page is a demo).
  stats: [
    { value: '14s', label: 'median build' },
    { value: '99.99%', label: 'uptime' },
    { value: '38,000', label: 'deploys a day' },
  ],
} as const;

export type TerminalLineKind = (typeof HERO.terminal)[number]['kind'];

/** Invented wordmarks. Never put real customers' names here unless you have their permission. */
export const LOGOS = ['Brightloom', 'Quillworks', 'Fennel & Co', 'Hollowpine', 'Vantora'] as const;

export const STEPS = [
  { title: 'Connect a repo', description: 'Pick the repository to deploy.' },
  { title: 'Push your code', description: 'Every push starts a build.' },
  { title: 'It is live', description: 'A URL appears. Share it.' },
] as const;

/** The heading (and optional lead sentence) of every section that has an <h2>. */
export const SECTION_COPY: Record<HeadedSection, { title: string; lead?: string }> = {
  logos: { title: 'Teams who ship on Tessera' },
  features: { title: 'Features', lead: 'Everything a deploy needs, handled before you ask.' },
  'how-it-works': { title: 'How it works', lead: 'From repository to live URL in three steps.' },
  pricing: { title: 'Pricing', lead: 'Start free. Pay when you outgrow it.' },
  faq: { title: 'FAQ', lead: 'The questions we hear most.' },
  signup: { title: 'Get started', lead: 'Start a free 14-day trial. No card needed.' },
};

export const SIGNUP = {
  fieldLabel: 'Email address',
  placeholder: 'you@example.com',
  button: 'Start free trial',
  invalid: 'Enter a valid email address.',
  // MOCK: shown after a valid submit, and nothing is sent anywhere (see SignupForm).
  // The second sentence is there because this is the one moment a visitor has
  // typed something personal. Delete it when you connect a real endpoint.
  confirmation: "Thanks, you're on the list. This is a demo, so nothing was sent.",
} as const;

/**
 * Which sections appear in the header and the mobile menu, and under what label.
 * null means "not in the nav". A Record over SectionId, not a free-form array,
 * so adding a section forces you to decide.
 */
export const NAV_LABELS: Record<SectionId, string | null> = {
  hero: null,
  logos: null,
  features: 'Features',
  'how-it-works': 'How it works',
  pricing: 'Pricing',
  faq: 'FAQ',
  signup: null,
};

/** The nav entries, in page order. Derived from SECTIONS so the nav can never list a section the page lacks. */
export const NAV_ITEMS: { id: SectionId; label: string }[] = SECTIONS.flatMap((id) => {
  const label = NAV_LABELS[id];
  return label === null ? [] : [{ id, label }];
});

// MOCK: the footer's links go nowhere (see SiteFooter). Only the labels are data.
export const FOOTER_COLUMNS = [
  { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Status'] },
  { title: 'Company', links: ['About', 'Careers', 'Blog', 'Contact sales'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
] as const;

/**
 * The page's one persistent "this is a demo" signal (the README has the rest).
 * Delete it, and the mock parts it describes, when you make the page real.
 */
export const DEMO_NOTE = `Template demo: ${PRODUCT_NAME} is fictional and the form sends nothing.`;
