import { describe, it, expect } from 'vitest';
import { forkCommand, terminalSteps, startPrompt } from './start';

describe('start facts', () => {
  it('builds the fork command from the slug', () => {
    expect(forkCommand('monitoring')).toBe('npx tiged patrickkuei/cyberui-templates/packages/monitoring my-app');
  });

  it('lists the terminal steps in order, starting with the fork command', () => {
    expect(terminalSteps('monitoring')).toEqual([
      'npx tiged patrickkuei/cyberui-templates/packages/monitoring my-app',
      'cd my-app',
      'npm install',
      'npm run dev',
    ]);
  });

  it('writes the start prompt exactly as the spec fixes it', () => {
    expect(startPrompt('AI Product Monitoring', 'monitoring')).toBe(
      'Start a new project from the AI Product Monitoring template. ' +
        'Run `npx tiged patrickkuei/cyberui-templates/packages/monitoring my-app`, then `cd my-app`, `npm install`, and `npm run dev`. ' +
        'It needs Node 20.19 or newer, so tell me if I need to install it. ' +
        "Tell me when it's running and what address to open. " +
        'Then run `npx cyberui-2045 init` so you know how to use the component library from now on.'
    );
  });
});
