import type { CodeTabContent } from '../content/types';

// Draws the folder map as a tree. Every folder in the map is expected to share
// one parent (src/), which becomes the root line; the rest are its children.
// Purposes are padded into a column so they line up.
export function folderTree(folders: CodeTabContent['folders']): string {
  const root = folders[0]?.path.split('/')[0] ?? '';
  const names = folders.map((folder) => folder.path.split('/').slice(1).join('/'));
  const width = Math.max(...names.map((name) => name.length));
  const lines = folders.map((folder, index) => {
    const branch = index === folders.length - 1 ? '└── ' : '├── ';
    return branch + names[index]!.padEnd(width + 2) + folder.purpose;
  });
  return [root + '/', ...lines].join('\n');
}

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
        <p className="signpost">
          The reasoning behind them: <a href="#/process">How we design</a>
        </p>
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
        <h3>Folder map</h3>
        <pre className="terminal-pre terminal-pre-tree">
          <code>{folderTree(content.folders)}</code>
        </pre>
      </section>
    </div>
  );
}
