// The one place the fork command and the start prompt are built. The prompt,
// the terminal fold and the root README's instructions must all agree, so
// they come from the template's slug here instead of being retyped. The
// slug is also the folder name under packages/, which is what tiged needs.
export const REPO = 'patrickkuei/cyberui-templates';

// Where deploy.yml publishes this site. Only llms.txt needs it: the page
// itself uses relative URLs so it works under any path.
export const SITE_URL = 'https://patrickkuei.github.io/cyberui-templates/';

// Matches `engines.node` in the template packages and this site.
export const NODE_MIN = '20.19';

// --yes: without it, npx asks "Ok to proceed?" before its first download of
// tiged, and an AI assistant's non-interactive shell can't answer, so the
// very first step of the start prompt stalls (seen in the #44 dogfood run).
export function forkCommand(slug: string): string {
  return `npx --yes tiged ${REPO}/packages/${slug} my-app`;
}

export function terminalSteps(slug: string): string[] {
  return [forkCommand(slug), 'cd my-app', 'npm install', 'npm run dev'];
}

// A one-shot start. The last sentence hands the standing "use the library's
// components" guidance to cyberui-2045's own `init`, which writes it into
// the user's CLAUDE.md / .cursorrules / AGENTS.md, so the site does not
// invent a second way of telling an AI about the library.
export function startPrompt(name: string, slug: string): string {
  return [
    `Start a new project from the ${name} template.`,
    `Run \`${forkCommand(slug)}\`, then \`cd my-app\`, \`npm install\`, and \`npm run dev\`.`,
    `It needs Node ${NODE_MIN} or newer, so tell me if I need to install it.`,
    "Tell me when it's running and what address to open.",
    'Then run `npx cyberui-2045 init` so you know how to use the component library from now on.',
  ].join(' ');
}
