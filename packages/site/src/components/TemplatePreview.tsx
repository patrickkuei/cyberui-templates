import { useEffect, useRef, useState } from 'react';
import { Skeleton, TabNavigation } from 'cyberui-2045';
import type { Template } from '../data/templates';
import type { CodeTabContent } from '../content/types';
import { CodeTab } from './CodeTab';

const TABS = ['Live preview', 'Code'] as const;
type Tab = (typeof TABS)[number];

export interface TemplatePreviewProps {
  template: Template;
  code: CodeTabContent;
  /** Called when Esc is pressed while focus is inside the running template. */
  onClose: () => void;
}

// The live preview is the template's own built index.html, served from the
// same origin (live/<slug>/index.html). It is a full running app, so the
// iframe is only ever mounted while the surrounding dialog is open. Both
// panes stay mounted and the inactive one is `hidden`, so switching to Code
// and back does not reload (and reset) the running template.
//
// Until the iframe fires `load` a skeleton covers it. `load` also fires for an
// error page, so this says "loaded", not "working".
//
// Esc: once someone clicks into the running template, key presses go to the
// iframe's own document and never reach the dialog, so its native Esc handling
// is blind. The preview is same-origin, so on load we listen for Esc inside it
// and forward it to `onClose`. (A cross-origin preview would throw on access;
// that is caught and Esc then simply does not forward.)
// Note for forks: this also fires when the template itself uses Esc (to close
// its own modal, say), so that press closes the preview as well as the modal.
export function TemplatePreview({ template, code, onClose }: TemplatePreviewProps) {
  const [tab, setTab] = useState<Tab>('Live preview');
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const onCloseRef = useRef(onClose);
  const forwarded = useRef<{ target: EventTarget; handler: (event: Event) => void } | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  function stopForwarding() {
    if (forwarded.current) {
      forwarded.current.target.removeEventListener('keydown', forwarded.current.handler);
      forwarded.current = null;
    }
  }

  // A navigation inside the iframe fires `load` again, possibly on a new
  // window, so drop the old listener before adding one.
  function handleLoad() {
    setLoaded(true);
    stopForwarding();
    try {
      const target = frameRef.current?.contentWindow;
      if (!target) return;
      const handler = (event: Event) => {
        if ((event as KeyboardEvent).key === 'Escape') onCloseRef.current();
      };
      target.addEventListener('keydown', handler);
      forwarded.current = { target, handler };
    } catch {
      // Cross-origin: nothing to forward.
    }
  }

  useEffect(() => stopForwarding, []);

  return (
    <div className="template-preview">
      <TabNavigation tabs={TABS} activeTab={tab} onTabChange={(next) => setTab(next as Tab)} />
      <div className="template-preview-body">
        <iframe
          ref={frameRef}
          title={`${template.name} live preview`}
          src={template.livePreviewPath}
          hidden={tab !== 'Live preview'}
          onLoad={handleLoad}
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
