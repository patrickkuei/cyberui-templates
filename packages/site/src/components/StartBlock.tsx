import { useId } from 'react';
import { Accordion } from 'cyberui-2045';
import { NODE_MIN, startPrompt, terminalSteps } from '../content/start';
import { CopyButton } from './CopyButton';

export interface StartBlockProps {
  name: string;
  slug: string;
}

// The prompt is long and dull to read, so it is folded; the visible part is
// one button. The terminal route shares the fold: people who prefer it open
// the fold anyway, and everyone else is not shown a command.
export function StartBlock({ name, slug }: StartBlockProps) {
  const prefix = useId();

  return (
    <div className="template-start neutral-scope">
      <h3>Start building</h3>
      <div className="template-start-copy">
        <CopyButton text={startPrompt(name, slug)} label="Copy start prompt" />
      </div>
      <p className="template-start-note">
        Paste it into your AI coding assistant (Cursor, Claude Code…). It makes a folder called <code>my-app</code> and sets things up.
        Then tell it what to change.
      </p>
      <Accordion
        items={[
          {
            id: `${prefix}-start`,
            title: 'See the prompt, or use the terminal instead',
            content: (
              <div className="start-details">
                <h4>The prompt</h4>
                <pre className="start-pre start-pre-wrap">
                  <code>{startPrompt(name, slug)}</code>
                </pre>
                <h4>In a terminal</h4>
                <pre className="start-pre">
                  <code>{terminalSteps(slug).join('\n')}</code>
                </pre>
                <p>Needs Node {NODE_MIN} or newer.</p>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
