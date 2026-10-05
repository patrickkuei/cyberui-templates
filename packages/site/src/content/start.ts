// The one place the fork command and the start prompt are built. The prompt,
// the terminal fold and the root README's instructions must all agree, so
// they come from the template's slug here instead of being retyped. The
// slug is also the folder name under packages/, which is what tiged needs.
export const REPO = 'patrickkuei/cyberui-templates';

// Matches `engines.node` in the template packages and this site.
export const NODE_MIN = '20.19';

export function forkCommand(slug: string): string {
  return `npx tiged ${REPO}/packages/${slug} my-app`;
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

// Links to a template's source on GitHub (main), for the Code tab. A folder
// uses /tree/, a file /blob/; GitHub redirects either to the right view, so
// the caller does not need to know which a path is.
export function sourceUrl(slug: string, path: string): string {
  return `https://github.com/${REPO}/blob/main/packages/${slug}/${path}`;
}
