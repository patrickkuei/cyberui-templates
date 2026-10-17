export type FeatureIcon = 'bolt' | 'branch' | 'globe' | 'undo' | 'shield' | 'chart';

export interface Feature {
  id: string;
  icon: FeatureIcon;
  title: string;
  body: string;
}

// Plain data: FeatureCard turns `icon` into an inline SVG through the
// FEATURE_ICONS Record in icons/index.tsx, so an icon name with no drawing is a
// compile error. Fictional product, illustrative claims.
export const FEATURES: Feature[] = [
  {
    id: 'zero-config',
    icon: 'bolt',
    title: 'Zero-config builds',
    body: 'Tessera picks the build command and output folder for you. Override either with one line when you need to.',
  },
  {
    id: 'previews',
    icon: 'branch',
    title: 'A preview for every branch',
    body: 'Open a pull request and get a URL for it. Reviewers see the change, not a screenshot of it.',
  },
  {
    id: 'edge',
    icon: 'globe',
    title: 'A global edge network',
    body: 'Static files are served from the location nearest your visitor, with HTTPS set up for you.',
  },
  {
    id: 'rollbacks',
    icon: 'undo',
    title: 'Instant rollbacks',
    body: 'Every deploy is kept. Point your domain back at the previous build in one click.',
  },
  {
    id: 'secrets',
    icon: 'shield',
    title: 'Secrets, handled',
    body: 'Environment variables are encrypted, scoped per environment and never printed in build logs.',
  },
  {
    id: 'usage',
    icon: 'chart',
    title: 'Usage you can read',
    body: 'Bandwidth and build minutes in plain numbers, with an alert before you reach a limit.',
  },
];
