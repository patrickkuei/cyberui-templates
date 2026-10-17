export interface FaqItem {
  /** Stable id: the Accordion uses it to track which item is open, so it must not change when the list is reordered. */
  id: string;
  question: string;
  answer: string;
}

// Fictional product, illustrative answers. The Accordion shows one answer at a time.
export const FAQ: FaqItem[] = [
  {
    id: 'frameworks',
    question: 'Which frameworks does Tessera support?',
    answer:
      'Anything that builds to static files or runs on Node: Vite, Next.js, Astro, SvelteKit and plain HTML. If we cannot detect yours, one line of config tells us how to build it.',
  },
  {
    id: 'free-limits',
    question: 'What does the free plan include?',
    answer: 'One project, 100 GB of bandwidth a month and community support. There is no time limit and no card is needed.',
  },
  {
    id: 'over-limit',
    question: 'What happens if I go over a limit?',
    answer: 'We email you at 80 percent and again at 100 percent. Your site keeps running; we never switch it off without telling you first.',
  },
  {
    id: 'domains',
    question: 'Can I use my own domain?',
    answer: 'Yes, on every plan. Add the domain, create the one DNS record we show you, and the certificate is issued automatically.',
  },
  {
    id: 'rollback',
    question: 'How do rollbacks work?',
    answer: 'Each deploy is immutable and kept for 90 days. A rollback just points your domain at an earlier deploy, so it takes effect in seconds.',
  },
  {
    id: 'data',
    question: 'Where is my code stored?',
    answer: 'Builds run in isolated containers that are deleted when the build ends. Source is read from your repository and is not kept after the build.',
  },
];
