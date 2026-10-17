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
// notFor is optional (the page and llms.txt show no "Probably not for you" line
// without it). When you write one, state this template's own limits; do not
// name another template type or kind of app, since that stops being true the
// day a template for it ships. Every other field is required.
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
    notFor: 'if you need live data out of the box. The numbers are simulated, and you connect your own.',
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
    notFor: 'if you need a real model or login. The agent is a script, and a chat window for your customers is fine.',
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
          "Message 5 is the big wall. Hooking to Zendesk needs API keys, a place to host it, and something that actually writes drafts. I don't know what an API key is or where to find it, and I'm nervous about giving it to an AI. I also don't know whether it costs money per reply. … I wouldn't know who should be allowed to log in. My team of six would all need it, and I have no idea about passwords or sharing it.",
        worked:
          "I open the screen and see my words (refund, shipping, Dana's order) instead of tech jargon, and I can read the whole page without asking anyone what something means. … I can walk through one fake ticket start to finish: I see the customer's message and the draft, I click Approve, and it moves to Sent. And when I click Reject it asks me why. …",
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
          "Message 5: I wouldn't know what to hand over, like API keys, a server, or where my real assistant even lives. I might not know if my ops assistant is something this can connect to at all. That would likely be a dead end for me without more help.",
        worked:
          "A money task sits in \"waiting for approval\" with the dollar amount, and it does not move on until I click approve. If I click reject it clearly stops and shows rejected in the logs. … The summary box at the top shows the right count and dollar total, and the numbers change when I approve or reject something. …",
      },
    ],
  },
  landing: {
    code: CODE_TABS.landing!,
    useIf: [
      'a launch page for a product or side project',
      'a pricing page with plans to compare',
      'a one-screen "join the waitlist" page',
    ],
    headsUp: 'This is a demo: the product and numbers are made up and the signup sends nothing. You get the page, not the backend. Your AI can help you connect yours.',
    notFor: "if you need several pages, a blog or a real signup backend. It's one scrolling page with a mock form.",
    examples: [
      {
        title: 'An indie developer',
        requests: [
          "I just downloaded this landing page template. It's a demo for a fake deploy platform called Tessera. My real product is [my tool: one sentence on what it does and who it's for]. Before you change anything, run it, tell me how to start it locally, and give me a list of every place that still talks about Tessera or uses made-up content: the name, the headline, the logo strip, the numbers, the plans, the FAQ and the footer.",
          "Okay, rewrite all of that for my product. Name, hero headline and subtext, the features and the how-it-works steps. Here are my real features: [list]. Delete the logo strip. I have no customers yet and I don't want fake company logos on a page where people pay me. If you invent a number or a claim, mark it so I can check it. Don't make anything up.",
          "Now pricing. I want one paid plan at $[X] a month and $[Y] a year, not the three made-up tiers. Keep the monthly/yearly switch if it still makes sense with one plan. Update the FAQ to match, including refunds and what happens when someone cancels. Here's my refund policy: [policy].",
          "The signup form doesn't send anything, and I need to take money. I want to use Stripe [or Lemon Squeezy, whichever is simpler for a solo dev]. What's the smallest setup that works? I don't have a backend. Can the plan buttons go to a hosted checkout link, and can the form just collect an email into something like Buttondown or a Google Sheet? Do the simple version and tell me what I have to create in their dashboards myself. Don't put any secret keys in the front-end code.",
          'Put the real page title, favicon and meta description in. Add a privacy policy page and a terms page, plus a contact email in the footer, and swap the footer links for real ones. Then build it for production and tell me exactly how to put it on Cloudflare Pages [or Vercel] and point my domain [mydomain.com] at it.',
          "Last check. Run the tests and the build, and fix anything that broke when you swapped the text. Then list every leftover 'Tessera', 'lorem' or fake number you can find, and tell me what to click on the live site before I tell anyone about it.",
        ],
        stuck:
          "Payment. This is the biggest one. … My AI can wire a button to a hosted checkout link, but I still have to open a Stripe account, make a product and price, and deal with identity checks. Then I need to know how a buyer gets access after paying. That part is a backend, and I don't have one. … The signup form. … it needs somewhere to send to. I'd have to pick and sign up for an email or database service myself. … Domain and hosting. Pointing DNS at the host, waiting for it to take effect, and getting HTTPS working. … Legal pages and tax. … I'm not a lawyer and I don't know what is required where I sell. I'd copy something generic and hope that's fine.",
        worked:
          "I click the buy button on the live site and arrive at a real checkout page with my product name and price. I then make a test purchase in Stripe's test mode, and later one real purchase with my own card that I refund. The money has to show up in my Stripe dashboard. … I put my own email in the signup form on the live site and it shows up in the email tool or sheet. … The site loads on my domain with HTTPS, on my phone as well as my laptop, and the tab title, favicon and link preview are mine. …",
      },
      {
        title: 'A product manager',
        requests: [
          "I just downloaded this landing page template. I'm a product manager, not a developer. Please start it so I can see it in my browser, and tell me exactly what to click or type, one step at a time. If something needs installing first, say so in plain words.",
          "Good, I can see it. It's a made-up product called Tessera. Mine is called [our product name]. It's [one sentence: what it does] for [who it's for]. Please rename everything from Tessera to my product, including the browser tab title and the footer, and rewrite the top headline and the sub-headline using this: [my two sentences]. Then tell me every place you changed so I can check.",
          "We have no pricing, no customers and no logos yet. Please take out the logo strip and the pricing section completely, and make sure nothing else on the page still points to them (menu links, buttons). Rewrite the features and 'how it works' sections with my three points: [point 1], [point 2], [point 3]. Don't invent any numbers or claims. If a stat or a quote is in there, either remove it or tell me it's made up.",
          "Every button should say 'Join the waitlist' and take people to the email form. Change the form so it only asks for an email. Rewrite the FAQ to 4 questions about the waitlist: when do we launch, what does it cost, who sees my email, how do I unsubscribe. Here are my answers: [answers].",
          "I read that the signup form doesn't send anything. I need the emails to actually reach me. I don't have a server or a developer. What is the simplest way for me to get the emails, like a Google Sheet or my inbox? Pick the easiest one, tell me what I have to sign up for and what I have to copy and paste back to you, and then connect the form to it.",
          'Stakeholders need to open this from a link on their own computers. How do I put it online for free? Walk me through it. After that, give me a short checklist of what I should click and look at to be sure everything works, including on a phone.',
        ],
        stuck:
          "Message 5 is the wall. Collecting emails needs a third-party account (a form service, a Google Sheet link, an API key) and I have to do the signup and pass something back. I don't know what \"endpoint\" or \"key\" means, or whether pasting it in chat is safe. This is the step I am most likely to give up on. … Footer and legal. … I'm collecting emails, so someone will ask me about this, and I don't know what I'm allowed to leave out. … Putting it online. Hosting, a build step, a domain name. \"Free link\" is easy to say, but I'd have trouble when it asks me to log in to GitHub or something else.",
        worked:
          "I open the link on my laptop and then on my phone. I see my product name and my headline, with no pricing, logo strip, or monthly/yearly switch. … Every \"Join the waitlist\" button scrolls or jumps to the email box. … I type my own email into the form and press the button. I then see that exact email land in my Sheet or my inbox within a minute. That is the real test. … A colleague, not me, opens the link on a different computer, signs up with their own email, and I see it arrive. …",
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
