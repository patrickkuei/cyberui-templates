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
  'agent-panel': {
    code: CODE_TABS['agent-panel']!,
    useIf: [
      'a screen to watch and steer an AI assistant: what it is doing, what is waiting, and why',
      'a chat where a person has to approve risky steps before the agent goes ahead',
      'an internal tool for a support, ops or content team that works alongside an agent',
    ],
    headsUp:
      'This is a demo: the agent is just a script, so no AI model is running behind it. You get the screens, not the agent. Your AI can help you connect yours.',
    notFor: "if you're after a native mobile app or a landing page. (A chat window for your customers is fine.)",
    examples: [
      {
        title: 'A support-team lead',
        requests: [
          'I got this Agent Control Panel template. It has Console, Tasks and Logs pages with fake demo data. I run a customer support team and I want this to be a screen for an AI that writes draft replies to customers. Can you first just run it and tell me in plain words what each page shows, and which parts are real and which are pretend?',
          "OK. Change all the demo stuff so it's about support. Tasks should be things like 'Reply to refund request from Dana, order 1182', 'Customer says package never arrived', 'Angry customer about double charge'. Use our ticket words: New, Drafted, Waiting for approval, Sent. Logs should read like 'Drafted reply to ticket 4521' instead of the technical stuff.",
          "The approval step is the most important part for me. The AI must never send anything to a customer by itself. Every draft has to show me the customer's message and the AI's draft side by side, and I click Approve, Edit, or Reject. Can you make that the main thing on the Console page, and make Reject ask me for a short reason?",
          'Can you add a tag on each ticket like Refund, Shipping, Billing, Angry customer? And anything with Refund or Angry customer should always need a person to approve, even if I later turn approvals off for easy ones. Also add a simple sentence at the top saying how many drafts are waiting for me.',
          "Is this actually connected to our helpdesk? I use Zendesk. If not, what would it take, in simple terms, and what do I need to get ready on my side? Please don't build it yet, just explain.",
          "Make sure the screen clearly says somewhere that this is a demo with pretend tickets, so my team doesn't think real customers are getting emails. And write me a short checklist of how to show it to my team.",
        ],
        stuck:
          "Message 5 is the big wall. Hooking to Zendesk needs API keys, a place to host it, and something that actually writes drafts. I don't know what an API key is or where to find it, and I'm nervous about giving it to an AI. I also don't know whether it costs money per reply. … I don't know how to judge whether the draft replies are any good, since they're pretend text someone wrote.",
        worked:
          'I can\'t find any way for a draft to go out without my click. I\'d test by just leaving things alone and seeing that nothing moves to Sent on its own. … The AI can tell me honestly in plain words "this part is real, this part is fake", and the answer about Zendesk is clear enough that I can decide whether to ask IT or a freelancer for help. If it just says "sure, done!" about the connection, I wouldn\'t trust it.',
      },
      {
        title: 'A solo founder',
        requests: [
          "I just downloaded this Agent Control Panel template. I'm not a developer. Can you run it on my computer and tell me in plain words what each of the three pages (Console, Tasks, Logs) is for? Also tell me which parts are real and which are just fake demo stuff.",
          "OK. My assistant does bookkeeping stuff, emails to vendors, and small admin jobs. Please change the demo tasks so they look like mine: 'Categorize last week's expenses', 'Email Acme about the late invoice', 'Renew the domain', 'Pay the AWS bill'. Use my wording, not the generic sample names.",
          "The most important thing for me is that nothing that costs money happens without me clicking approve. Can you make any task that spends money show up as 'waiting for my approval' with the dollar amount big and obvious, and make approve and reject buttons really clear? Anything under $0 spend, meaning free stuff, should just run.",
          'Can you put a small box at the top of the Console that says how many things are waiting for me and the total dollars waiting? I want to open the page and know in 5 seconds if I need to do something.',
          "Right now it's just fake data, right? What would it take to connect it to my real assistant? Don't do it yet, just tell me what you'd need from me and what could go wrong, in simple terms.",
          'Before I trust this, show me how to try it myself. Tell me exactly what to click to test that an approval is really required, and make sure the app still starts without errors.',
        ],
        stuck:
          "Message 3 is the scary one. I would not know if the approval is real. The README says there is no real agent behind it, so the \"approve\" button might just be a picture of a button. I'd be afraid I'd ask for approvals and then believe I was protected when I'm not. I'd need the AI to be blunt about this, and I would not catch it if it wasn't. … Message 5: I wouldn't know what to hand over, like API keys, a server, or where my real assistant even lives. I might not know if my ops assistant is something this can connect to at all. That would likely be a dead end for me without more help.",
        worked:
          'A money task sits in "waiting for approval" with the dollar amount, and it does not move on until I click approve. If I click reject it clearly stops and shows rejected in the logs. … The AI tells me plainly, in a sentence, that this is still a demo with no real agent, so I know the approval is a practice version. I would only really say it "worked" for my business once it\'s hooked to the real assistant and I see a real money action get held until I approve. So honestly, for the demo it works if I can see all that; for real life I\'d say not yet.',
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
