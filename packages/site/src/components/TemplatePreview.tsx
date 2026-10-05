import { useState } from 'react';
import { TabNavigation } from 'cyberui-2045';
import type { Template } from '../data/templates';
import { CODE_SNIPPETS } from '../content/codeSnippets';
import { CodeViewer } from './CodeViewer';

const TABS = ['Live preview', 'Code'] as const;
type Tab = (typeof TABS)[number];

export interface TemplatePreviewProps {
  template: Template;
}

// The live preview is the template's own built index.html, served from the
// same origin (live/<slug>/index.html). It is a full running app, so the
// iframe is only ever mounted while the surrounding dialog is open.
export function TemplatePreview({ template }: TemplatePreviewProps) {
  const [tab, setTab] = useState<Tab>('Live preview');
  const snippets = CODE_SNIPPETS[template.slug] ?? [];

  return (
    <div className="template-preview">
      <TabNavigation tabs={TABS} activeTab={tab} onTabChange={(next) => setTab(next as Tab)} />
      <div className="template-preview-body">
        {tab === 'Live preview' && <iframe title={`${template.name} live preview`} src={template.livePreviewPath} />}
        {tab === 'Code' && (
          <div className="template-preview-code">
            <CodeViewer snippets={snippets} />
          </div>
        )}
      </div>
    </div>
  );
}
