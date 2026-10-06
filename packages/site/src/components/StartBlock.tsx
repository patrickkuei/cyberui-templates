import { useId, type CSSProperties } from 'react';
import { Accordion } from 'cyberui-2045';
import { NODE_MIN, startPrompt, terminalSteps } from '../content/start';
import { CopyButton } from './CopyButton';

export interface StartBlockProps {
  name: string;
  slug: string;
  /** The template's accent hue. The Copy button glows in it; the fold below stays neutral. */
  accentHex: string;
}

// Copying the start prompt is the page's main action (the live demo is how
// someone decides; this is what they do once they have), so it is the one
// primary, glowing button, in the template's accent. The prompt is long and
// dull to read, so it is folded, and the fold sits in .neutral-scope so its
// expanded border is not neon too. The terminal route shares the fold:
// people who prefer it open the fold anyway, and everyone else is not shown
// a command.
export function StartBlock({ name, slug, accentHex }: StartBlockProps) {
  const prefix = useId();
  // The primary button paints with --gradient-accent, which the library
  // declares on :root as `135deg, var(--color-accent) 10%, var(--color-secondary) 90%`.
  // A custom property is substituted where it is declared, so overriding the two
  // colours here does not reach it: without this line the button keeps the
  // library's yellow-to-cyan fill whatever the template's hue is.
  const accentStyle = {
    '--color-accent': accentHex,
    '--color-secondary': accentHex,
    '--gradient-accent': `135deg, ${accentHex} 10%, ${accentHex} 90%`,
  } as CSSProperties;

  return (
    <div className="template-start">
      <h3>Start building</h3>
      <div className="template-start-copy" style={accentStyle}>
        <CopyButton text={startPrompt(name, slug)} label="Copy start prompt" variant="primary" />
      </div>
      <p className="template-start-note">
        Paste it into your AI coding assistant (Cursor, Claude Code…). It makes a folder called <code>my-app</code> and sets things up.
        Then tell it what to change.
      </p>
      <div className="neutral-scope">
        <Accordion
          items={[
            {
              id: `${prefix}-start`,
              title: 'See the prompt, or use the terminal instead',
              content: (
                <div className="start-details">
                  <h4>The prompt</h4>
                  <pre className="terminal-pre terminal-pre-wrap">
                    <code>{startPrompt(name, slug)}</code>
                  </pre>
                  <h4>In a terminal</h4>
                  <pre className="terminal-pre">
                    <code>{terminalSteps(slug).join('\n')}</code>
                  </pre>
                  <p>Needs Node {NODE_MIN} or newer.</p>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
