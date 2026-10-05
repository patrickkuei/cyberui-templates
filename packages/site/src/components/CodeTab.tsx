import { sourceUrl } from '../content/start';
import type { CodeTabContent } from '../content/types';

export interface CodeTabProps {
  slug: string;
  content: CodeTabContent;
}

// For a developer deciding how clean the template is. It states the
// principles the code follows and links each to a real file, rather than
// quoting code: a claim here is only as good as the file it points at, and
// scripts/check-code-tab.mjs fails CI if a linked path stops existing.
export function CodeTab({ slug, content }: CodeTabProps) {
  return (
    <div className="code-tab">
      <section className="code-tab-section">
        <h3>Principles it follows</h3>
        <dl className="code-tab-principles">
          {content.principles.map((principle) => (
            <div className="code-tab-principle" key={principle.name}>
              <dt>{principle.name}</dt>
              <dd>
                {principle.detail}{' '}
                <span className="code-tab-files">
                  {principle.files.map((file, index) => (
                    <span key={file.path}>
                      {index > 0 && ', '}
                      <a href={sourceUrl(slug, file.path)} target="_blank" rel="noreferrer">
                        {file.label}
                        <span className="visually-hidden"> (opens in new tab)</span>
                      </a>
                    </span>
                  ))}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="code-tab-section">
        <h3>What&apos;s where</h3>
        <ul className="code-tab-folders">
          {content.folders.map((folder) => (
            <li key={folder.path}>
              <a href={sourceUrl(slug, folder.path)} target="_blank" rel="noreferrer">
                <code>{folder.path}</code>
                <span className="visually-hidden"> (opens in new tab)</span>
              </a>{' '}
              {folder.purpose}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
