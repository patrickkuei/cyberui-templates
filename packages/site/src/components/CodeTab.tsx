import type { CodeTabContent } from '../content/types';

export interface CodeTabProps {
  content: CodeTabContent;
}

// For a developer deciding how clean the template is. Each principle is one
// short line plus a real excerpt from the template as evidence.
// scripts/check-code-tab.mjs fails CI if an excerpt stops matching its file.
export function CodeTab({ content }: CodeTabProps) {
  return (
    <div className="code-tab">
      <section className="code-tab-section">
        <h3>Principles it follows</h3>
        <div className="code-tab-principles">
          {content.principles.map((principle) => (
            <figure className="code-tab-principle" key={principle.name}>
              <figcaption>
                <strong>{principle.name}</strong> {principle.detail}
                <code className="code-tab-file">{principle.file}</code>
              </figcaption>
              <pre className="terminal-pre">
                <code>{principle.excerpt.join('\n')}</code>
              </pre>
            </figure>
          ))}
        </div>
      </section>

      <section className="code-tab-section">
        <h3>What&apos;s where</h3>
        <ul className="code-tab-folders">
          {content.folders.map((folder) => (
            <li key={folder.path}>
              <code>{folder.path}</code> {folder.purpose}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
