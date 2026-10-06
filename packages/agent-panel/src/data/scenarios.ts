import type { Scenario } from './types';

// The agent's whole "intelligence": three scripted scenarios and a fallback.
// Nothing here calls a model. To teach the demo something new, add a scenario;
// the engine (simulation.ts) does not change. Rules scenarios.test.ts enforces:
// every path ends in a `reply` (so a run can never hang), and no keyword is
// shared between scenarios (so matching is unambiguous).

export const REFUND: Scenario = {
  id: 'refund',
  keywords: ['refund', 'return', 'order'],
  steps: [
    { type: 'think', title: 'Plan the refund', detail: 'Find the order, check the refund policy, then ask a person before moving money.', ticks: 4 },
    { type: 'tool', tool: 'orders.lookup', input: 'order #4821', output: 'Order #4821, $42.00, delivered 6 days ago, within the 30-day window.', ticks: 4 },
    {
      type: 'approval',
      prompt: 'Refund $42.00 to the customer for order #4821?',
      approve: [
        { type: 'tool', tool: 'payments.refund', input: 'order #4821, $42.00', output: 'Refund queued.', ticks: 3 },
        { type: 'task', title: 'Process refund #4821', ticks: 10, priority: 'high' },
        { type: 'reply', text: 'Done. The $42.00 refund for order #4821 is processed and the customer will see it in 3 to 5 days.' },
      ],
      reject: [
        { type: 'reply', text: "Understood, I've left order #4821 untouched. Tell me if you want a different outcome, such as store credit." },
      ],
    },
  ],
};

export const SUMMARY: Scenario = {
  id: 'summary',
  keywords: ['summarise', 'summarize', 'summary', 'ticket', 'support'],
  steps: [
    { type: 'think', title: 'Scope the summary', detail: 'Last 7 days of support tickets, grouped by theme.', ticks: 3 },
    { type: 'tool', tool: 'helpdesk.search', input: 'created:7d', output: '38 tickets found.', ticks: 4 },
    { type: 'task', title: 'Summarise 38 tickets', ticks: 12, priority: 'high' },
    {
      type: 'reply',
      text: 'Of 38 tickets this week, 15 were about login problems, 11 about billing questions and 7 about a slow export. The other 5 were one-offs. Login problems are up on last week.',
    },
  ],
};

export const RELEASE: Scenario = {
  id: 'release',
  keywords: ['release', 'deploy', 'changelog', 'notes'],
  steps: [
    { type: 'think', title: 'Plan the release notes', detail: 'Read the merged changes since the last tag and group them for customers.', ticks: 3 },
    {
      type: 'tool',
      tool: 'git.log',
      input: 'v2.3.0..HEAD',
      output: '14 merged changes since v2.3.0.',
      ticks: 4,
      failFirst: 'Rate limited by the git host. Retrying.',
    },
    { type: 'task', title: 'Draft release notes v2.4', ticks: 8, priority: 'high' },
    {
      type: 'approval',
      prompt: 'Post the v2.4 release notes to #releases?',
      approve: [
        { type: 'tool', tool: 'chat.post', input: '#releases', output: 'Posted.', ticks: 2 },
        { type: 'reply', text: 'Posted the v2.4 release notes to #releases: 6 features, 5 fixes and 3 internal changes.' },
      ],
      reject: [{ type: 'reply', text: "No problem, the draft is saved and I haven't posted anything." }],
    },
  ],
};

export const FALLBACK: Scenario = {
  id: 'fallback',
  keywords: [],
  steps: [
    { type: 'think', title: 'Look for something I can do', detail: 'This is a scripted demo, so only three requests are wired up.', ticks: 2 },
    {
      type: 'reply',
      text: 'This is a scripted demo, so I only know three things: issuing a refund, summarising support tickets and drafting release notes. Try one of the suggested prompts.',
    },
  ],
};

export const SCENARIOS: Scenario[] = [REFUND, SUMMARY, RELEASE];

/** The first scenario with a keyword in the message, else FALLBACK. */
export function matchScenario(text: string, scenarios: Scenario[] = SCENARIOS): Scenario {
  const lower = text.toLowerCase();
  return scenarios.find((scenario) => scenario.keywords.some((keyword) => lower.includes(keyword))) ?? FALLBACK;
}

/** The prompts offered as one-click chips; each matches the scenario named. */
export const SUGGESTED_PROMPTS: { label: string; text: string }[] = [
  { label: 'Refund an order', text: 'Please refund order #4821, the customer says it arrived damaged.' },
  { label: 'Summarise support tickets', text: 'Summarise this week’s support tickets.' },
  { label: 'Draft release notes', text: 'Draft the release notes for v2.4 and post them.' },
];
