import { TEMPLATES, type Template } from '../data/templates';
import type { CodeTabContent, TemplateContent } from './types';
import codeTabsJson from './codeTabs.json';

// Plain JSON (not TS) so scripts/check-code-tab.mjs can read it with Node and
// confirm every path it names still exists in the template's package.
const CODE_TABS: Record<string, CodeTabContent> = codeTabsJson;

// Plain typed content, one entry per template, keyed by the template's slug.
// To add a template's section: add its entry to TEMPLATES (src/data/templates.ts)
// and its copy here. contentFor() throws if one is missing, and a test fails
// before it can ship.
//
// The examples are not real customers. Each is an AI role-playing a person in
// a simulated interview (no real user was interviewed), kept in the AI's own
// words and truncated with an ellipsis. Do not reword them into something
// tidier; that would make them marketing.
//
// The headsUp line is a promise about what is mock: say exactly what the mock
// controls do (here they change the screen but never the data, and nothing is
// exported or saved), so a visitor who clicks one in the demo is not surprised.
export const TEMPLATE_CONTENT: Record<string, TemplateContent> = {
  monitoring: {
    code: CODE_TABS.monitoring!,
    useIf: [
      'a screen to keep an eye on something: orders, usage, errors, support tickets',
      'anything made of charts, a table and a list of things that need attention',
      'a dashboard for yourself or your team',
    ],
    headsUp:
      'The data is made up, and a few buttons (time range, Acknowledge, Export CSV, Download) only change how the screen looks: nothing is exported or saved. You get the screens, not the data connection. Your AI can help you hook up yours.',
    notFor: "if you're after a native mobile app or a landing page. (A marketing dashboard is fine.)",
    examples: [
      {
        title: 'A small shop owner',
        requests: [
          'Change the app name and all the text from AI monitoring to my shop. The Dashboard should show orders per day, revenue, and return rate.',
          'Replace the Endpoints page with an Orders table: order number, customer, product, amount, status. Make the Alerts page show returns instead.',
          'Make the data come from my real shop, not fake numbers. I use Shopify (or maybe an Excel export, not sure).',
          'Make the Acknowledge button actually mark a return as handled, and make Export CSV really download.',
          'Put this online so I can open it on my phone.',
        ],
        stuck:
          "Step 3 is the hard one. I don't know where my data \"lives\" or what an API key is, and I'm scared of pasting secrets into chat. The AI will ask me for things I can't answer.",
        worked:
          "I'm done when I open it, see three orders I recognize, the totals roughly match my shop admin, and clicking a return stays marked after refresh.",
      },
      {
        title: 'An LLM API developer',
        requests: [
          'rename this to Acme LLM API, remove the Reports page and the Alerts page for now, keep Dashboard and Endpoints',
          'my endpoints are /v1/chat, /v1/embeddings, /v1/completions. replace the fake endpoints and make the charts show requests, p95 latency, and error rate',
          "instead of random data, fetch from /api/usage?range=24h. here's the json shape [paste]. make the time range buttons actually work",
          'add a login screen, customers enter their API key and only see their own usage',
          'add a tokens used column and an errors by status code (429, 500, 400) breakdown',
        ],
        stuck:
          "I don't have a /api/usage endpoint. My logs are in Postgres plus raw nginx logs, so I'd need to write the aggregation backend first. That's the real work, and the template doesn't help with it.",
        worked:
          "I log in with a test customer's key and the numbers match what I see in my own database or logs for the same window. …",
      },
    ],
  },
};

export function contentFor(slug: string): TemplateContent {
  const content = TEMPLATE_CONTENT[slug];
  if (!content) {
    throw new Error(`No section copy for template "${slug}". Add it to TEMPLATE_CONTENT in src/content/templateContent.ts.`);
  }
  return content;
}

export interface TemplateEntry {
  template: Template;
  content: TemplateContent;
}

export const TEMPLATE_ENTRIES: TemplateEntry[] = TEMPLATES.map((template) => ({
  template,
  content: contentFor(template.slug),
}));
