import { useState } from 'react';
import { Skeleton, TabNavigation } from 'cyberui-2045';
import type { Template } from '../data/templates';
import type { CodeTabContent } from '../content/types';
import { CodeTab } from './CodeTab';

const TABS = ['Live preview', 'Code'] as const;
type Tab = (typeof TABS)[number];

export interface TemplatePreviewProps {
  template: Template;
  code: CodeTabContent;
}

// The live preview is the template's own built index.html, served from the
// same origin (live/<slug>/index.html). It is a full running app, so the
// iframe is only ever mounted while the surrounding dialog is open. Both
// panes stay mounted and the inactive one is `hidden`, so switching to Code
// and back does not reload (and reset) the running template.
//
// Until the iframe fires `load` a skeleton covers it. `load` also fires for an
// error page, so this says "loaded", not "working".
export function TemplatePreview({ template, code }: TemplatePreviewProps) {
  const [tab, setTab] = useState<Tab>('Live preview');
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="template-preview">
      <TabNavigation tabs={TABS} activeTab={tab} onTabChange={(next) => setTab(next as Tab)} />
      <div className="template-preview-body">
        <iframe
          title={`${template.name} live preview`}
          src={template.livePreviewPath}
          hidden={tab !== 'Live preview'}
          onLoad={() => setLoaded(true)}
        />
        {!loaded && tab === 'Live preview' && (
          <div className="template-preview-loading" role="status">
            <Skeleton variant="rectangular" width="100%" height="100%" />
            <span className="template-preview-loading-label">Loading the live demo…</span>
          </div>
        )}
        <div className="template-preview-code" hidden={tab !== 'Code'}>
          <CodeTab content={code} />
        </div>
      </div>
    </div>
  );
}
