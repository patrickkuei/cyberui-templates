// The plain-text version of the Templates page, served as llms.txt
// (https://llmstxt.org). The site is client-rendered, so a crawler or an AI
// assistant that fetches it without running JavaScript sees an empty
// <div id="root">; this file is what they can read instead. vite.config.ts
// writes it into dist/ at build time from the same data the page renders,
// so adding a template to TEMPLATES and TEMPLATE_CONTENT adds it here too.
import { TEMPLATE_ENTRIES } from './templateContent';
import { INIT_COMMAND, NODE_MIN, REPO, SITE_URL, forkCommand, startPrompt, terminalSteps } from './start';

export function llmsTxt(): string {
  const templates = TEMPLATE_ENTRIES.flatMap(({ template, content }) => [
    `### ${template.name}`,
    '',
    template.tagline,
    '',
    `- Use it if you're building: ${content.useIf.join('; ')}.`,
    `- Heads-up: ${content.headsUp}`,
    `- Probably not for you ${content.notFor}`,
    `- Fork it: \`${forkCommand(template.slug)}\`, then ${terminalSteps(template.slug)
      .slice(1)
      .map((step) => `\`${step}\``)
      .join(', ')}`,
    `- Start prompt to paste into an AI coding assistant: ${startPrompt(template.name, template.slug)}`,
    `- [Source](https://github.com/${REPO}/tree/main/packages/${template.slug})`,
    `- [Live demo](${new URL(template.livePreviewPath, SITE_URL).href})`,
    '',
  ]);

  return [
    '# CyberUI templates',
    '',
    '> Ready-made React starter apps built with the cyberui-2045 component library. ' +
      'Each template is a complete, self-contained app: fork just that one with `npx tiged`, ' +
      `then change it with your AI coding assistant. Needs Node ${NODE_MIN} or newer.`,
    '',
    `This is the plain-text version of the Templates page at ${SITE_URL}, which needs JavaScript to render.`,
    '',
    '## Templates',
    '',
    ...templates,
    '## The library',
    '',
    '- [cyberui-2045 on npm](https://www.npmjs.com/package/cyberui-2045)',
    '- [CyberUI on GitHub](https://github.com/patrickkuei/CyberUI)',
    '- [CyberUI docs](https://patrickkuei.github.io/CyberUI/)',
    '- [CyberUI Storybook](https://patrickkuei.github.io/CyberUI/storybook/)',
    `- After forking, run ${INIT_COMMAND}: it writes how to use the library into your assistant's rules file.`,
    '',
  ].join('\n');
}
