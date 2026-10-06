export type Tone = 'default' | 'success' | 'warning' | 'error';

// The CSS class that colours each tone (defined once, as `.tone-*` in App.css).
// A Record, not a template string like `tone-${tone}`, so adding a Tone without
// its class here is a compile error instead of text that silently has no
// colour. tones.test.ts checks that every class below has a rule in App.css.
export const TONE_CLASS: Record<Tone, string> = {
  default: 'tone-default',
  success: 'tone-success',
  warning: 'tone-warning',
  error: 'tone-error',
};
