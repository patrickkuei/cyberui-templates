# `/templates` Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Templates index grid and the separate template detail page with one `/templates` page that shows each template in full: a screenshot that opens a live-preview dialog, plain-language fit copy, two folded examples, and a one-step start.

**Architecture:** One `TemplatesPage` renders a `TemplateSection` per entry in `TEMPLATES`. Section copy lives in typed content (`templateContent.ts`); facts that appear in several places (the fork command and prompt) are derived from the template's slug in `start.ts`. The live-preview dialog is a site-local `PreviewDialog` on the native `<dialog>` element. Its open state is the URL hash (`#/templates/:slug`), so Back closes it and the link is shareable. Old index, tile, detail-page, case-study and coming-soon code is deleted.

**Tech Stack:** React 19, TypeScript (strict), Vite 7, Vitest 3 with happy-dom and Testing Library, cyberui-2045 v2.6 (`Accordion`, `Badge`, `Button`, `TabNavigation`), Node built-ins for the README check script.

**Spec:** [docs/superpowers/specs/2026-10-05-templates-page-design.md](../specs/2026-10-05-templates-page-design.md). Read it first: it holds the copy, the wireframe and the reasons for each choice.

> **As built (added after the build):** this plan is the record of the original intent. The build differed in these ways, all recorded in the spec:
> - Tasks 5-10 landed together because the section copy is checked against `TEMPLATES` at import, which forced the data trim before the page.
> - `PreviewDialog` keeps both tabs mounted, dismisses on a backdrop click, and the close button replaces the hash instead of going Back when the iframe has added history entries (spec §3).
> - Copy confirms with a library toast (`top-right`), not a button label; the glow is on Copy, not on the demo button (spec §5).
> - The Code tab shows six short verbatim excerpts and a folder tree instead of the snippets, backed by `scripts/check-code-tab.mjs` (spec §7), after a cleanup of `packages/monitoring` on its own branch.
> - Added: loading state, hover state, and a scroll reset between pages (`useScrollToTopOnChange`).

## Conventions for every task

- Work in `packages/site` unless a step says otherwise. Run test commands as `npx vitest run <path>` from there; `git add` paths are relative to that directory (docs live at `../../docs/...`).
- Branch: `redesign/templates-page` (already created).
- Commit with two `-m` flags, the second being exactly: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- `pnpm` is the package manager. Do not add `workspace:` ranges or imports outside `packages/site`.

## Global Constraints

- Node `>=20.19` (the site's `engines`; the start prompt and terminal fold both say "Node 20.19 or newer").
- `packages/site` stays self-contained: no `workspace:` ranges, no imports outside its own package. The README check script lives at the repo root and uses only Node built-ins.
- Voice is plain and friendly, second person. Copy for each block is fixed in spec §4; do not reword it. The two examples are the subagents' own words, truncated with an ellipsis, never reworded.
- Only finished templates are published: no "coming soon" tiles, badges or fallback images anywhere.
- Neon is spent once per template section: the `primary` "Run the live demo" button inside the accent-scoped hero. Everything after the hero (fit text, examples, start block, dialog) is neutral. The Copy button is `secondary`, never `primary`.
- Motion: the dialog fades by opacity only; with `prefers-reduced-motion` it appears with no transition. No scroll-reveal on this page.
- The page never scrolls sideways at phone width; wide code scrolls inside its own block.
- The site routes on the URL hash, so in-page `#anchor` links must not be used.
- When the same text appears more than once on the page (a template name in a heading and in the dialog title, "Copy start prompt" per template), scope Testing Library queries with `within(...)`; never rename text or weaken an assertion.
- Per the repo's CLAUDE.md, forker-facing comments in code for: the template data contract, the content contract, the `PreviewDialog` choice, and anything simulated.

## Review Focus

The spec implies these, but no task's main tests would exercise them unless listed here. Each has an owning task with a test.

1. **Unknown slug in the hash** (`#/templates/nope`): the page renders normally with no dialog and no crash. (Task 9)
2. **Clipboard API missing or rejecting** (insecure context, permission denied): the button says the copy failed and nothing throws or leaves an unhandled rejection. (Task 2)
3. **Esc must go through the parent**: the native `cancel` event is prevented and `onClose` is called, so the URL and the dialog can never disagree. (Task 3)
4. **A closed dialog leaves no iframe mounted**, so the dashboard never loads until asked for and does not keep running after close. (Tasks 3 and 8)
5. **Two templates on one page**: no duplicate ids (Accordion ids come from the item id), repeated text is queried with `within`, and only the section matching `openSlug` opens its dialog. (Tasks 6, 7 and 9)

---

### Task 1: Derived start facts

The fork command, terminal steps and start prompt are derived from the template's slug and name in one place, so they cannot drift between the prompt, the terminal fold and the README.

**Files:**
- Create: `src/content/start.ts`
- Test: `src/content/start.test.ts`

**Interfaces:**
- Produces: `forkCommand(slug: string): string`, `terminalSteps(slug: string): string[]`, `startPrompt(name: string, slug: string): string`, `NODE_MIN: string`.

- [ ] **Step 1: Commit the spec and plan**

```bash
cd ../.. && git add docs/superpowers/specs/2026-10-05-templates-page-design.md docs/superpowers/plans/2026-10-05-templates-page.md
git commit -m "docs: design spec and implementation plan for the /templates page" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
cd packages/site
```

- [ ] **Step 2: Write the failing test**

```ts
// src/content/start.test.ts
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
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run src/content/start.test.ts`
Expected: FAIL, cannot resolve `./start`.

- [ ] **Step 4: Write the implementation**

```ts
// src/content/start.ts

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
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npx vitest run src/content/start.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 6: Commit**

```bash
git add src/content/start.ts src/content/start.test.ts
git commit -m "feat(site): derive the fork command and start prompt from the template slug" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: CopyButton

**Files:**
- Create: `src/components/CopyButton.tsx`
- Test: `src/components/CopyButton.test.tsx`

**Interfaces:**
- Produces: `CopyButton({ text: string; label: string })`. Shows `label`, then "Copied" or "Copy failed" after a click. Review Focus #2.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/CopyButton.test.tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyButton } from './CopyButton';

function stubClipboard(writeText: ((text: string) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, 'clipboard', {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
}

describe('CopyButton', () => {
  afterEach(() => stubClipboard(undefined));

  it('copies the text and says so', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<CopyButton text="hello" label="Copy start prompt" />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy start prompt' }));
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard');
  });

  it('says the copy failed when the clipboard rejects', async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    render(<CopyButton text="hello" label="Copy start prompt" />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy start prompt' }));
    expect(screen.getByRole('button', { name: 'Copy failed' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Could not copy');
  });

  it('says the copy failed when there is no clipboard API at all (insecure context)', async () => {
    stubClipboard(undefined);
    render(<CopyButton text="hello" label="Copy start prompt" />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy start prompt' }));
    expect(screen.getByRole('button', { name: 'Copy failed' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/CopyButton.test.tsx`
Expected: FAIL, cannot resolve `./CopyButton`.

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/CopyButton.tsx
import { useState } from 'react';
import { Button } from 'cyberui-2045';

type CopyState = 'idle' | 'copied' | 'failed';

export interface CopyButtonProps {
  /** The text put on the clipboard. */
  text: string;
  /** The button's resting label. */
  label: string;
}

// `secondary` on purpose: a primary Button glows, and this page spends its
// one neon spot on "Run the live demo". navigator.clipboard is undefined on
// insecure origins and rejects when permission is denied; both land in the
// same catch, so the button reports failure instead of throwing.
export function CopyButton({ text, label }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={copy}>
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : label}
      </Button>
      <span className="visually-hidden" role="status">
        {state === 'copied' ? 'Copied to clipboard' : state === 'failed' ? 'Could not copy' : ''}
      </span>
    </>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/components/CopyButton.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/CopyButton.tsx src/components/CopyButton.test.tsx
git commit -m "feat(site): CopyButton that reports success and failure" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: PreviewDialog

**Files:**
- Create: `src/components/PreviewDialog.tsx`
- Test: `src/components/PreviewDialog.test.tsx`
- Modify: `src/App.css` (append a dialog block)

**Interfaces:**
- Produces: `PreviewDialog({ isOpen: boolean; onClose: () => void; title: string; children: ReactNode })`. Children are mounted only while `isOpen` is true. Review Focus #3 and #4.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/PreviewDialog.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreviewDialog } from './PreviewDialog';

function renderDialog(isOpen: boolean, onClose = vi.fn()) {
  const view = render(
    <PreviewDialog isOpen={isOpen} onClose={onClose} title="Preview title">
      <p>inside</p>
    </PreviewDialog>
  );
  const dialog = () => view.container.querySelector('dialog')!;
  return { ...view, dialog, onClose };
}

describe('PreviewDialog', () => {
  it('keeps its children out of the DOM while closed', () => {
    const { dialog } = renderDialog(false);
    expect(dialog()).not.toHaveAttribute('open');
    expect(screen.queryByText('inside')).not.toBeInTheDocument();
  });

  it('opens as a modal dialog labelled by its title', () => {
    const { dialog } = renderDialog(true);
    expect(dialog()).toHaveAttribute('open');
    expect(screen.getByText('inside')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { name: 'Preview title' });
    expect(dialog().getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('asks the parent to close on Esc instead of closing itself (the URL must stay in step)', () => {
    const { dialog, onClose } = renderDialog(true);
    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(dialog(), cancel);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(cancel.defaultPrevented).toBe(true);
    expect(dialog()).toHaveAttribute('open');
  });

  it('asks the parent to close from the close button', async () => {
    const { onClose } = renderDialog(true);
    await userEvent.click(screen.getByRole('button', { name: 'Close preview' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes and unmounts its children when isOpen goes false', () => {
    const { rerender, dialog } = renderDialog(true);
    rerender(
      <PreviewDialog isOpen={false} onClose={() => {}} title="Preview title">
        <p>inside</p>
      </PreviewDialog>
    );
    expect(dialog()).not.toHaveAttribute('open');
    expect(screen.queryByText('inside')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/PreviewDialog.test.tsx`
Expected: FAIL, cannot resolve `./PreviewDialog`.

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/PreviewDialog.tsx
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from 'cyberui-2045';

export interface PreviewDialogProps {
  isOpen: boolean;
  /** Called on Esc and on the close button. The parent owns whether the dialog is open. */
  onClose: () => void;
  title: string;
  /** Mounted only while the dialog is open, so an iframe inside never loads until asked for. */
  children: ReactNode;
}

// A native <dialog>, not cyberui-2045's Modal, on purpose. Modal v2.6.0 keeps
// aria-hidden="true" on the overlay that contains its open dialog (assistive
// technology may skip it), paints an accent border and glow that this page
// does not want, and has no size between xl (896px) and fullscreen. The
// native element gives the focus trap, Esc, focus return and inert
// background for free, so only the styling is ours (App.css, .preview-dialog).
//
// Esc is intercepted: the native `cancel` event would close the dialog behind
// the parent's back, leaving the URL (which is the open state) out of step.
export function PreviewDialog({ isOpen, onClose, title, children }: PreviewDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      className="preview-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {isOpen && (
        <>
          <header className="preview-dialog-header">
            <h2 id={titleId}>{title}</h2>
            <Button variant="ghost" size="sm" aria-label="Close preview" onClick={onClose}>
              <span aria-hidden="true">✕</span>
            </Button>
          </header>
          <div className="preview-dialog-body">{children}</div>
        </>
      )}
    </dialog>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/components/PreviewDialog.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 5: Add the styles**

Append to `src/App.css`:

```css
/* ---- Preview dialog (native <dialog>) ---- */

.preview-dialog {
  width: min(90vw, 1600px);
  height: 90vh;
  max-width: none;
  max-height: none;
  padding: 0;
  overflow: hidden;
  background: var(--color-surface);
  color: var(--color-default);
  border: 1px solid var(--color-border-default);
  border-radius: 8px;
}

/* display:flex only when open: a closed <dialog> must stay display:none. */
.preview-dialog[open] {
  display: flex;
  flex-direction: column;
  animation: preview-dialog-in 160ms ease-out;
}

.preview-dialog::backdrop {
  background: rgb(0 0 0 / 0.7);
}

.preview-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border-default);
}

.preview-dialog-header h2 {
  margin: 0;
  font-size: 1.125rem;
}

.preview-dialog-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* The page behind a modal dialog is inert but would still scroll. */
body:has(dialog[open]) {
  overflow: hidden;
}

@keyframes preview-dialog-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .preview-dialog {
    width: 100vw;
    height: 100dvh;
    border: 0;
    border-radius: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .preview-dialog[open] {
    animation: none;
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/PreviewDialog.tsx src/components/PreviewDialog.test.tsx src/App.css
git commit -m "feat(site): PreviewDialog on the native dialog element" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: TemplatePreview (the dialog's content)

**Files:**
- Create: `src/components/TemplatePreview.tsx`
- Test: `src/components/TemplatePreview.test.tsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `Template` from `src/data/templates.ts` (uses `slug`, `name`, `livePreviewPath`), `CODE_SNIPPETS` from `src/content/codeSnippets.ts`, `CodeViewer`.
- Produces: `TemplatePreview({ template: Template })`: tabs "Live preview" and "Code".

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/TemplatePreview.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplatePreview } from './TemplatePreview';
import { getTemplate } from '../data/templates';

const monitoring = getTemplate('monitoring')!;

describe('TemplatePreview', () => {
  it('shows the live preview iframe by default', () => {
    render(<TemplatePreview template={monitoring} />);
    const frame = screen.getByTitle('AI Product Monitoring live preview');
    expect(frame).toHaveAttribute('src', './live/monitoring/index.html');
  });

  it('switches to the Code tab, which replaces the iframe', async () => {
    render(<TemplatePreview template={monitoring} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Code' }));
    expect(screen.getByText('Bounded random walk — src/data/simulation.ts')).toBeInTheDocument();
    expect(screen.queryByTitle('AI Product Monitoring live preview')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/TemplatePreview.test.tsx`
Expected: FAIL, cannot resolve `./TemplatePreview`.

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/TemplatePreview.tsx
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
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/components/TemplatePreview.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Add the styles**

Append to `src/App.css`:

```css
/* ---- Dialog content: Live preview | Code ---- */

.template-preview {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem 1rem 1rem;
}

.template-preview-body {
  flex: 1;
  min-height: 0;
}

.template-preview-body iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 6px;
  background: var(--color-base);
}

.template-preview-code {
  height: 100%;
  overflow: auto;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/TemplatePreview.tsx src/components/TemplatePreview.test.tsx src/App.css
git commit -m "feat(site): TemplatePreview with Live preview and Code tabs" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Content types and the monitoring copy

**Files:**
- Modify: `src/content/types.ts` (add types; leave `CodeSnippet` and the old `CaseStudyContent` alone until Task 10)
- Create: `src/content/templateContent.ts`
- Test: `src/content/templateContent.test.ts`

**Interfaces:**
- Produces: `ExampleCase`, `TemplateContent` (types); `TEMPLATE_CONTENT: Record<string, TemplateContent>`; `contentFor(slug: string): TemplateContent` (throws if missing); `TemplateEntry = { template: Template; content: TemplateContent }`; `TEMPLATE_ENTRIES: TemplateEntry[]`.

- [ ] **Step 1: Write the failing test**

```ts
// src/content/templateContent.test.ts
import { describe, it, expect } from 'vitest';
import { TEMPLATES } from '../data/templates';
import { TEMPLATE_CONTENT, TEMPLATE_ENTRIES, contentFor } from './templateContent';

describe('template content', () => {
  it('has content for every template, so a new TEMPLATES entry cannot ship without its copy', () => {
    for (const template of TEMPLATES) {
      expect(() => contentFor(template.slug)).not.toThrow();
    }
    expect(TEMPLATE_ENTRIES.map((entry) => entry.template.slug)).toEqual(TEMPLATES.map((t) => t.slug));
  });

  it('throws a helpful error for a slug with no content', () => {
    expect(() => contentFor('nope')).toThrow(/templateContent\.ts/);
  });

  it('gives the monitoring template fit copy and two examples', () => {
    const content = TEMPLATE_CONTENT.monitoring!;
    expect(content.useIf).toHaveLength(3);
    expect(content.headsUp).toMatch(/screens, not the data connection/);
    expect(content.examples.map((example) => example.title)).toEqual(['A small shop owner', 'An LLM API developer']);
  });

  it('keeps every example request verbatim and in order', () => {
    const [shop, api] = TEMPLATE_CONTENT.monitoring!.examples;
    expect(shop!.requests).toHaveLength(5);
    expect(shop!.requests[0]).toBe(
      'Change the app name and all the text from AI monitoring to my shop. The Dashboard should show orders per day, revenue, and return rate.'
    );
    expect(api!.requests).toHaveLength(5);
    expect(api!.requests[2]).toBe(
      "instead of random data, fetch from /api/usage?range=24h. here's the json shape [paste]. make the time range buttons actually work"
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/content/templateContent.test.ts`
Expected: FAIL, cannot resolve `./templateContent`.

- [ ] **Step 3: Add the types**

Append to `src/content/types.ts`:

```ts
/** One folded example on the Templates page: a person, what they'd ask their AI, and how it went. */
export interface ExampleCase {
  /** The fold's title, e.g. "A small shop owner". */
  title: string;
  /** What they'd type to their AI, in order. The subagent's own words, never reworded. */
  requests: string[];
  /** Where they'd get stuck. Verbatim, truncated with an ellipsis if long. */
  stuck: string;
  /** How they'd know it worked. Verbatim, truncated with an ellipsis if long. */
  worked: string;
}

/** The editorial copy for one template's section. Everything else on the section is derived from the Template. */
export interface TemplateContent {
  /** Plain-language "Use this if you're building…" bullets. */
  useIf: string[];
  /** What is simulated or mock, and that the template ships screens, not a data connection. */
  headsUp: string;
  /** Completes the sentence "Probably not for you …". */
  notFor: string;
  examples: ExampleCase[];
}
```

- [ ] **Step 4: Write the content**

```ts
// src/content/templateContent.ts
import { TEMPLATES, type Template } from '../data/templates';
import type { TemplateContent } from './types';

// Plain typed content, one entry per template, keyed by the template's slug.
// To add a template's section: add its entry to TEMPLATES (src/data/templates.ts)
// and its copy here. contentFor() throws if one is missing, and a test fails
// before it can ship.
//
// The examples are not real customers. Each is an AI role-playing a person in
// a simulated interview (see docs/superpowers/specs/2026-10-05-templates-page-design.md,
// section 2), kept in the AI's own words and truncated with an ellipsis.
// Do not reword them into something tidier; that would make them marketing.
export const TEMPLATE_CONTENT: Record<string, TemplateContent> = {
  monitoring: {
    useIf: [
      'a screen to keep an eye on something: orders, usage, errors, support tickets',
      'anything made of charts, a table and a list of things that need attention',
      'a dashboard for yourself or your team',
    ],
    headsUp:
      "The data is made up, and a few buttons (time range, Acknowledge, Export CSV, Download) don't do anything yet. You get the screens, not the data connection. Your AI can help you hook up yours.",
    notFor: "if you're after a native mobile app or a landing page. (A marketing dashboard is fine.)",
    examples: [
      {
        title: 'A small shop owner',
        requests: [
          'Change the app name and all the text from AI monitoring to my shop. The Dashboard should show orders per day, revenue, and return rate.',
          'Replace the Endpoints page with an Orders table: order number, customer, product, amount, status. Make the Alerts page show returns instead.',
          'Make the data come from my real shop, not fake numbers. I use Shopify (or maybe an Excel export, not sure).',
          'Make the Acknowledge button actually mark a return as handled, and make Export CSV really download.',
          'Put this online so I can open it on my phone.',
        ],
        stuck:
          "Step 3 is the hard one. I don't know where my data \"lives\" or what an API key is, and I'm scared of pasting secrets into chat. The AI will ask me for things I can't answer.",
        worked:
          "I'm done when I open it, see three orders I recognize, the totals roughly match my shop admin, and clicking a return stays marked after refresh.",
      },
      {
        title: 'An LLM API developer',
        requests: [
          'rename this to Acme LLM API, remove the Reports page and the Alerts page for now, keep Dashboard and Endpoints',
          'my endpoints are /v1/chat, /v1/embeddings, /v1/completions. replace the fake endpoints and make the charts show requests, p95 latency, and error rate',
          "instead of random data, fetch from /api/usage?range=24h. here's the json shape [paste]. make the time range buttons actually work",
          'add a login screen, customers enter their API key and only see their own usage',
          'add a tokens used column and an errors by status code (429, 500, 400) breakdown',
        ],
        stuck:
          "I don't have a /api/usage endpoint. My logs are in Postgres plus raw nginx logs, so I'd need to write the aggregation backend first. That's the real work, and the template doesn't help with it.",
        worked:
          "I log in with a test customer's key and the numbers match what I see in my own database or logs for the same window. …",
      },
    ],
  },
};

export function contentFor(slug: string): TemplateContent {
  const content = TEMPLATE_CONTENT[slug];
  if (!content) {
    throw new Error(`No section copy for template "${slug}". Add it to TEMPLATE_CONTENT in src/content/templateContent.ts.`);
  }
  return content;
}

export interface TemplateEntry {
  template: Template;
  content: TemplateContent;
}

export const TEMPLATE_ENTRIES: TemplateEntry[] = TEMPLATES.map((template) => ({
  template,
  content: contentFor(template.slug),
}));
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npx vitest run src/content/templateContent.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add src/content/types.ts src/content/templateContent.ts src/content/templateContent.test.ts
git commit -m "feat(site): section copy and verbatim examples for the monitoring template" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: ExampleFolds

**Files:**
- Create: `src/components/ExampleFolds.tsx`
- Test: `src/components/ExampleFolds.test.tsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `ExampleCase` from `src/content/types.ts`.
- Produces: `ExampleFolds({ examples: ExampleCase[] })`: an intro note plus one `Accordion` item per example. Accordion ids are prefixed with `useId()` so two sections on a page never share ids. Review Focus #5.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/ExampleFolds.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExampleFolds } from './ExampleFolds';
import { TEMPLATE_CONTENT } from '../content/templateContent';

const examples = TEMPLATE_CONTENT.monitoring!.examples;

describe('ExampleFolds', () => {
  it('says once that the examples come from a simulated interview', () => {
    render(<ExampleFolds examples={examples} />);
    expect(screen.getAllByText(/simulated interview/)).toHaveLength(1);
  });

  it('renders one folded item per example, closed to start', () => {
    render(<ExampleFolds examples={examples} />);
    const shop = screen.getByRole('button', { name: /A small shop owner/ });
    const api = screen.getByRole('button', { name: /An LLM API developer/ });
    expect(shop).toHaveAttribute('aria-expanded', 'false');
    expect(api).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens one fold without closing the other', async () => {
    render(<ExampleFolds examples={examples} />);
    const shop = screen.getByRole('button', { name: /A small shop owner/ });
    const api = screen.getByRole('button', { name: /An LLM API developer/ });
    await userEvent.click(shop);
    await userEvent.click(api);
    expect(shop).toHaveAttribute('aria-expanded', 'true');
    expect(api).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the requests in order, then where they got stuck and how they would know', () => {
    render(<ExampleFolds examples={examples} />);
    // Closed Accordion panels stay in the DOM (inert), so scope to this fold's panel.
    const header = screen.getByRole('button', { name: /A small shop owner/ });
    const panel = document.getElementById(header.getAttribute('aria-controls')!)!;
    const requests = within(panel).getAllByRole('listitem');
    expect(requests).toHaveLength(5);
    expect(requests[0]).toHaveTextContent('Change the app name and all the text from AI monitoring to my shop.');
    expect(within(panel).getByText(/Step 3 is the hard one/)).toBeInTheDocument();
    expect(within(panel).getByText(/I'm done when I open it/)).toBeInTheDocument();
  });

  it('gives two renders on one page different ids', () => {
    render(
      <>
        <ExampleFolds examples={examples} />
        <ExampleFolds examples={examples} />
      </>
    );
    const ids = screen.getAllByRole('button', { name: /A small shop owner/ }).map((button) => button.id);
    expect(new Set(ids).size).toBe(2);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/ExampleFolds.test.tsx`
Expected: FAIL, cannot resolve `./ExampleFolds`.

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/ExampleFolds.tsx
import { useId } from 'react';
import { Accordion } from 'cyberui-2045';
import type { ExampleCase } from '../content/types';

export interface ExampleFoldsProps {
  examples: ExampleCase[];
}

// Wrapped in `.neutral-scope` by the caller: Accordion gives an expanded
// panel a neon accent border by default, and this page spends its neon once.
//
// Accordion derives its header/panel DOM ids from each item's `id`, so the
// ids are prefixed with useId(): two template sections on one page would
// otherwise share "example-0-header".
export function ExampleFolds({ examples }: ExampleFoldsProps) {
  const prefix = useId();

  const items = examples.map((example, index) => ({
    id: `${prefix}-example-${index}`,
    title: example.title,
    content: (
      <div className="example-case">
        <h4>What they&apos;d type to their AI, in order</h4>
        <ol>
          {example.requests.map((request) => (
            <li key={request}>
              <q>{request}</q>
            </li>
          ))}
        </ol>
        <h4>Where they&apos;d get stuck</h4>
        <p>
          <q>{example.stuck}</q>
        </p>
        <h4>How they&apos;d know it worked</h4>
        <p>
          <q>{example.worked}</q>
        </p>
      </div>
    ),
  }));

  return (
    <>
      <p className="template-examples-note">An AI played each of these, in a simulated interview. They are not real people.</p>
      <Accordion mode="multiple" items={items} />
    </>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/components/ExampleFolds.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 5: Add the styles**

Append to `src/App.css`:

```css
/* ---- Neutral scope: no neon after the hero ----
   The library reads --color-accent / --color-secondary for expanded
   Accordion borders and secondary Buttons. Pointing them at neutral tokens
   here keeps the page's one neon spot (the hero's "Run the live demo"). */

.neutral-scope {
  --color-accent: var(--color-border-default);
  --color-secondary: var(--color-muted);
}

/* ---- Template examples ---- */

.template-examples-note {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.55;
}

.example-case h4 {
  margin: 1rem 0 0.25rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.example-case h4:first-child {
  margin-top: 0;
}

.example-case ol {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.example-case p {
  margin: 0;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/ExampleFolds.tsx src/components/ExampleFolds.test.tsx src/App.css
git commit -m "feat(site): folded example cases with a neutral accent scope" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: StartBlock

**Files:**
- Create: `src/components/StartBlock.tsx`
- Test: `src/components/StartBlock.test.tsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `startPrompt`, `terminalSteps`, `NODE_MIN` from `src/content/start.ts`; `CopyButton`; `Accordion`.
- Produces: `StartBlock({ name: string; slug: string })`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/StartBlock.test.tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StartBlock } from './StartBlock';
import { startPrompt, terminalSteps } from '../content/start';

describe('StartBlock', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
  });

  it('copies the start prompt for this template', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<StartBlock name="AI Product Monitoring" slug="monitoring" />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy start prompt' }));
    expect(writeText).toHaveBeenCalledWith(startPrompt('AI Product Monitoring', 'monitoring'));
  });

  it('explains where to paste it and what it does', () => {
    render(<StartBlock name="AI Product Monitoring" slug="monitoring" />);
    expect(screen.getByText(/Paste it into your AI coding assistant/)).toBeInTheDocument();
    expect(screen.getByText('my-app')).toBeInTheDocument();
  });

  it('folds the full prompt and the terminal route together, closed to start', () => {
    const { container } = render(<StartBlock name="AI Product Monitoring" slug="monitoring" />);
    const fold = screen.getByRole('button', { name: /See the prompt, or use the terminal instead/ });
    expect(fold).toHaveAttribute('aria-expanded', 'false');
    const blocks = container.querySelectorAll('pre');
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toHaveTextContent(startPrompt('AI Product Monitoring', 'monitoring'));
    expect(blocks[1]!.textContent).toBe(terminalSteps('monitoring').join('\n'));
    expect(screen.getByText('Needs Node 20.19 or newer.')).toBeInTheDocument();
  });

  it('opens the fold on click', async () => {
    render(<StartBlock name="AI Product Monitoring" slug="monitoring" />);
    const fold = screen.getByRole('button', { name: /See the prompt, or use the terminal instead/ });
    await userEvent.click(fold);
    expect(fold).toHaveAttribute('aria-expanded', 'true');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/StartBlock.test.tsx`
Expected: FAIL, cannot resolve `./StartBlock`.

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/StartBlock.tsx
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
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/components/StartBlock.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Add the styles**

Append to `src/App.css`:

```css
/* ---- Start block ---- */

.template-start-copy {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.template-start-note {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.55;
}

.start-details h4 {
  margin: 1rem 0 0.25rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.start-details h4:first-child {
  margin-top: 0;
}

.start-details p {
  margin: 0.75rem 0 0;
}

.start-pre {
  margin: 0;
  padding: 0.75rem 1rem;
  overflow-x: auto;
  background: var(--color-base);
  border: 1px solid var(--color-border-default);
  border-radius: 6px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.8125rem;
  line-height: 1.5;
}

.start-pre-wrap {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/StartBlock.tsx src/components/StartBlock.test.tsx src/App.css
git commit -m "feat(site): start block with a copy button and a folded prompt and terminal route" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: TemplateSection

One template's whole section: header, screenshot frame with the overlay button, fit text, examples, start block, and its dialog.

**Files:**
- Create: `src/components/TemplateSection.tsx`
- Test: `src/components/TemplateSection.test.tsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `Template` (`src/data/templates.ts`), `TemplateContent` (`src/content/types.ts`), `PreviewDialog`, `TemplatePreview`, `ExampleFolds`, `StartBlock`.
- Produces: `TemplateSection({ template: Template; content: TemplateContent; previewOpen: boolean; onOpenPreview: () => void; onClosePreview: () => void })`. The parent decides whether the dialog is open.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/TemplateSection.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateSection } from './TemplateSection';
import { getTemplate } from '../data/templates';
import { contentFor } from '../content/templateContent';

const template = getTemplate('monitoring')!;
const content = contentFor('monitoring');

function renderSection(overrides: Partial<React.ComponentProps<typeof TemplateSection>> = {}) {
  const props = { template, content, previewOpen: false, onOpenPreview: vi.fn(), onClosePreview: vi.fn(), ...overrides };
  render(<TemplateSection {...props} />);
  return props;
}

describe('TemplateSection', () => {
  it('names the template, its accent and its tagline', () => {
    renderSection();
    expect(screen.getByRole('heading', { level: 2, name: 'AI Product Monitoring' })).toBeInTheDocument();
    expect(screen.getByText('Cyan accent')).toBeInTheDocument();
    expect(screen.getByText(template.tagline)).toBeInTheDocument();
  });

  it('opens the preview from the Run the live demo button, once', async () => {
    const props = renderSection();
    await userEvent.click(screen.getByRole('button', { name: 'Run the live demo' }));
    expect(props.onOpenPreview).toHaveBeenCalledTimes(1);
  });

  it('opens the preview from a click on the screenshot, once', async () => {
    const props = renderSection();
    await userEvent.click(screen.getByAltText('AI Product Monitoring screenshot'));
    expect(props.onOpenPreview).toHaveBeenCalledTimes(1);
  });

  it('shows the fit copy: use-if bullets, the heads-up, and who it is not for', () => {
    renderSection();
    expect(screen.getByText("Use this if you're building…")).toBeInTheDocument();
    for (const bullet of content.useIf) expect(screen.getByText(bullet)).toBeInTheDocument();
    expect(screen.getByText(/You get the screens, not the data connection/)).toBeInTheDocument();
    expect(screen.getByText(/Probably not for you/)).toBeInTheDocument();
  });

  it('includes the examples and the start block', () => {
    renderSection();
    expect(screen.getByRole('button', { name: /A small shop owner/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy start prompt' })).toBeInTheDocument();
  });

  it('mounts no iframe while the preview is closed', () => {
    renderSection({ previewOpen: false });
    expect(screen.queryByTitle('AI Product Monitoring live preview')).not.toBeInTheDocument();
  });

  it('mounts the live preview in a dialog while open, and closes it through the parent', async () => {
    const props = renderSection({ previewOpen: true });
    const dialog = document.querySelector('dialog')!;
    expect(dialog).toHaveAttribute('open');
    // The template name is also the section heading, so scope to the dialog.
    expect(within(dialog).getByRole('heading', { name: 'AI Product Monitoring' })).toBeInTheDocument();
    expect(within(dialog).getByTitle('AI Product Monitoring live preview')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close preview' }));
    expect(props.onClosePreview).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/TemplateSection.test.tsx`
Expected: FAIL, cannot resolve `./TemplateSection`.

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/TemplateSection.tsx
import { useId, type CSSProperties } from 'react';
import { Badge, Button } from 'cyberui-2045';
import type { Template } from '../data/templates';
import type { TemplateContent } from '../content/types';
import { ExampleFolds } from './ExampleFolds';
import { PreviewDialog } from './PreviewDialog';
import { StartBlock } from './StartBlock';
import { TemplatePreview } from './TemplatePreview';

export interface TemplateSectionProps {
  template: Template;
  content: TemplateContent;
  /** Whether this template's preview dialog is open. The parent owns it (it is the URL hash). */
  previewOpen: boolean;
  onOpenPreview: () => void;
  onClosePreview: () => void;
}

// One template, top to bottom: what it is, a screenshot that opens the
// running template, whether it fits, two folded examples, how to start.
//
// The template's accent hue is scoped to the hero only (name badge, frame
// and "Run the live demo"); the rest of the section sits in .neutral-scope or
// plain text, so a page of several templates has one neon spot per section.
export function TemplateSection({ template, content, previewOpen, onOpenPreview, onClosePreview }: TemplateSectionProps) {
  const headingId = useId();
  const accentStyle = {
    '--color-accent': template.accentHex,
    '--color-secondary': template.accentHex,
  } as CSSProperties;

  return (
    <section className="template-section" aria-labelledby={headingId}>
      <div className="template-hero" style={accentStyle}>
        <header className="template-section-header">
          <h2 id={headingId}>{template.name}</h2>
          <Badge variant="secondary" size="sm">
            {template.accentLabel} accent
          </Badge>
        </header>
        <p className="template-section-tagline">{template.tagline}</p>

        <div className="template-frame">
          <div className="template-frame-bar" aria-hidden="true">
            <span className="template-frame-dot" />
            <span className="template-frame-dot" />
            <span className="template-frame-dot" />
            <span className="template-frame-path">live/{template.slug}</span>
          </div>
          {/* The whole screen is clickable for mouse users; the Button inside is the
              keyboard and screen-reader target, so it stops the click from also
              reaching this handler. */}
          <div className="template-frame-screen" onClick={onOpenPreview}>
            <img src={template.screenshotSrc} alt={`${template.name} screenshot`} />
            <div className="template-frame-overlay">
              <Button
                variant="primary"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenPreview();
                }}
              >
                <span aria-hidden="true">▶</span> Run the live demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="template-fit">
        <h3>Use this if you&apos;re building…</h3>
        <ul>
          {content.useIf.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="template-headsup">
          <strong>Heads-up:</strong> {content.headsUp}
        </p>
        <p className="template-notfor">
          <strong>Probably not for you</strong> {content.notFor}
        </p>
      </div>

      <div className="template-examples neutral-scope">
        <h3>Examples: making it yours</h3>
        <ExampleFolds examples={content.examples} />
      </div>

      <StartBlock name={template.name} slug={template.slug} />

      <PreviewDialog isOpen={previewOpen} onClose={onClosePreview} title={template.name}>
        <TemplatePreview template={template} />
      </PreviewDialog>
    </section>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/components/TemplateSection.test.tsx`
Expected: PASS, 7 tests.

- [ ] **Step 5: Add the styles**

Append to `src/App.css`:

```css
/* ---- Templates page: one section per template ---- */

.templates-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-section);
}

.templates-page > h1 {
  margin: 0;
}

.template-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-block);
}

.template-hero {
  display: flex;
  flex-direction: column;
  gap: var(--space-stack);
}

.template-section-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.template-section-header h2 {
  margin: 0;
}

.template-section-tagline {
  margin: 0;
  max-width: 60ch;
  color: var(--color-muted);
  line-height: 1.55;
}

/* Window frame around the screenshot (neutral chrome). */
.template-frame {
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border-default);
  border-radius: 8px;
}

.template-frame-bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  height: 2rem;
  padding-inline: 0.75rem;
  background: var(--color-base);
  border-bottom: 1px solid var(--color-border-default);
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  color: var(--color-muted);
}

.template-frame-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-border-default);
}

.template-frame-path {
  margin-left: 0.5rem;
}

.template-frame-screen {
  position: relative;
  cursor: pointer;
}

.template-frame-screen img {
  display: block;
  width: 100%;
  height: auto;
}

/* Always visible, never hover-only: touch has no hover. */
.template-frame-overlay {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  justify-content: center;
  padding: 4rem 1rem 1.25rem;
  background: linear-gradient(to top, var(--color-base) 10%, transparent);
}

.template-fit,
.template-examples,
.template-start {
  display: flex;
  flex-direction: column;
  gap: var(--space-stack);
  max-width: 68ch;
}

.template-fit h3,
.template-examples h3,
.template-start h3 {
  margin: 0;
}

.template-fit ul {
  margin: 0;
  padding-left: 1.25rem;
  line-height: 1.55;
}

/* Information, not a warning: plain text with a neutral rule. */
.template-headsup,
.template-notfor {
  margin: 0;
  padding-left: 1rem;
  border-left: 2px solid var(--color-border-default);
  color: var(--color-muted);
  line-height: 1.55;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/TemplateSection.tsx src/components/TemplateSection.test.tsx src/App.css
git commit -m "feat(site): TemplateSection with screenshot frame, fit copy, examples and start block" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Route, preview navigation, TemplatesPage and App wiring

The hash route carries the open dialog: `#/templates/:slug` means "Templates, with this template's preview open". Opening pushes that hash; closing goes Back if the dialog was opened here, and replaces the hash if the page was reached by a link straight to it.

**Files:**
- Modify: `src/router/useHashRoute.ts`, `src/router/useHashRoute.test.ts`
- Create: `src/router/usePreviewNav.ts`, `src/router/usePreviewNav.test.tsx`
- Create: `src/pages/TemplatesPage.tsx`, `src/pages/TemplatesPage.test.tsx`
- Modify: `src/App.tsx`, `src/App.test.tsx`

**Interfaces:**
- Produces: `Route` is now `{ name: 'home' } | { name: 'templates'; openSlug?: string } | { name: 'process' } | { name: 'not-found' }`. `usePreviewNav(openSlug?: string): { open(slug: string): void; close(): void }`. `TemplatesPage({ openSlug?: string; entries?: TemplateEntry[] })`.

- [ ] **Step 1: Update the router tests (failing)**

In `src/router/useHashRoute.test.ts`, replace the two templates tests:

```ts
  it('parses #/templates as the templates page with nothing open', () => {
    window.location.hash = '#/templates';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toEqual({ name: 'templates' });
  });

  it('parses #/templates/monitoring as the templates page with that preview open', () => {
    window.location.hash = '#/templates/monitoring';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toEqual({ name: 'templates', openSlug: 'monitoring' });
  });

  it('treats a trailing slash with no slug as nothing open', () => {
    window.location.hash = '#/templates/';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toEqual({ name: 'templates' });
  });
```

Run: `npx vitest run src/router/useHashRoute.test.ts`
Expected: FAIL (the old route names).

- [ ] **Step 2: Change the router**

Replace the `Route` type and `parseHash` in `src/router/useHashRoute.ts`:

```ts
export type Route =
  | { name: 'home' }
  // `openSlug` set means "the Templates page with this template's preview
  // dialog open". The URL is the dialog's open state, so the browser's Back
  // button (Android's included) closes the dialog and a link can open it.
  | { name: 'templates'; openSlug?: string }
  | { name: 'process' }
  | { name: 'not-found' };

// Template slugs come from data (TEMPLATES), not a fixed union like
// monitoring's `ROUTES = [...] as const` — so this router parses a slug out
// of the hash instead of matching against a known tuple. Whether a slug is a
// real template is checked where it's used (TemplatesPage ignores an unknown
// one), not here.
function parseHash(hash: string): Route {
  const value = hash.replace(/^#\/?/, '');
  if (value === '') return { name: 'home' };
  if (value === 'templates') return { name: 'templates' };
  if (value.startsWith('templates/')) {
    const slug = value.slice('templates/'.length);
    return slug ? { name: 'templates', openSlug: slug } : { name: 'templates' };
  }
  if (value === 'process') return { name: 'process' };
  return { name: 'not-found' };
}
```

Run: `npx vitest run src/router/useHashRoute.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 3: Write the failing `usePreviewNav` test**

```tsx
// src/router/usePreviewNav.test.tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePreviewNav } from './usePreviewNav';

describe('usePreviewNav', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.location.hash = '';
  });

  it('opens a preview by pushing its hash', () => {
    window.location.hash = '#/templates';
    const { result } = renderHook(() => usePreviewNav(undefined));
    result.current.open('monitoring');
    expect(window.location.hash).toBe('#/templates/monitoring');
  });

  it('closes a preview it opened by going Back, so no history entry is left behind', () => {
    window.location.hash = '#/templates';
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const { result } = renderHook(() => usePreviewNav('monitoring'));
    result.current.open('monitoring');
    result.current.close();
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('closes a preview reached by a direct link by replacing the hash, never by leaving the page', () => {
    window.location.hash = '#/templates/monitoring';
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const { result } = renderHook(() => usePreviewNav('monitoring'));
    result.current.close();
    expect(back).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('#/templates');
  });

  it('forgets it opened a preview once nothing is open (a later direct link must not trigger Back)', () => {
    window.location.hash = '#/templates';
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const { result, rerender } = renderHook(({ slug }) => usePreviewNav(slug), { initialProps: { slug: undefined as string | undefined } });
    result.current.open('monitoring');
    rerender({ slug: 'monitoring' });
    rerender({ slug: undefined });
    window.location.hash = '#/templates/monitoring';
    rerender({ slug: 'monitoring' });
    result.current.close();
    expect(back).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('#/templates');
  });
});
```

Run: `npx vitest run src/router/usePreviewNav.test.tsx`
Expected: FAIL, cannot resolve `./usePreviewNav`.

- [ ] **Step 4: Write `usePreviewNav`**

```ts
// src/router/usePreviewNav.ts
import { useCallback, useEffect, useRef } from 'react';

// The preview dialog's open state is the URL hash (#/templates/:slug), so
// Back closes it. Opening pushes a history entry. Closing has two cases:
// - the dialog was opened from this page: go Back, popping the entry we
//   pushed (otherwise Back after closing would reopen the dialog);
// - the page was reached by a link straight to #/templates/:slug: there is
//   nothing to go Back to on this page, so replace the hash instead.
export function usePreviewNav(openSlug: string | undefined) {
  const openedHere = useRef(false);

  // Once nothing is open the flag is stale (the user may have used Back).
  useEffect(() => {
    if (!openSlug) openedHere.current = false;
  }, [openSlug]);

  const open = useCallback((slug: string) => {
    openedHere.current = true;
    window.location.hash = `#/templates/${slug}`;
  }, []);

  const close = useCallback(() => {
    if (openedHere.current) {
      openedHere.current = false;
      window.history.back();
    } else {
      window.location.replace('#/templates');
    }
  }, []);

  return { open, close };
}
```

Run: `npx vitest run src/router/usePreviewNav.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Write the failing `TemplatesPage` test**

```tsx
// src/pages/TemplatesPage.test.tsx
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplatesPage } from './TemplatesPage';
import { TEMPLATE_ENTRIES } from '../content/templateContent';

const monitoring = TEMPLATE_ENTRIES[0]!;
// A second, fake entry: the page must work with more than one template.
const second = {
  template: { ...monitoring.template, slug: 'second', name: 'Second Template', accentHex: '#ff00e5', accentLabel: 'Magenta', livePreviewPath: './live/second/index.html' },
  content: monitoring.content,
};

describe('TemplatesPage', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('has one h1 and one section per template', () => {
    render(<TemplatesPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Templates' })).toBeInTheDocument();
    // Not getAllByRole('region'): the library's Accordion panels are regions too.
    expect(document.querySelectorAll('section.template-section')).toHaveLength(TEMPLATE_ENTRIES.length);
  });

  it('opens a template preview by pushing its hash', async () => {
    window.location.hash = '#/templates';
    render(<TemplatesPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Run the live demo' }));
    expect(window.location.hash).toBe('#/templates/monitoring');
  });

  it('opens the matching preview when the route says so', () => {
    render(<TemplatesPage openSlug="monitoring" />);
    expect(screen.getByTitle('AI Product Monitoring live preview')).toBeInTheDocument();
  });

  it('ignores an unknown slug: the page renders, nothing opens, nothing throws (Review Focus #1)', () => {
    render(<TemplatesPage openSlug="nope" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Templates' })).toBeInTheDocument();
    expect(document.querySelector('dialog[open]')).toBeNull();
  });

  it('with two templates, opens only the one that matches and keeps ids distinct (Review Focus #5)', () => {
    render(<TemplatesPage entries={[monitoring, second]} openSlug="second" />);
    expect(screen.getByTitle('Second Template live preview')).toBeInTheDocument();
    expect(screen.queryByTitle('AI Product Monitoring live preview')).not.toBeInTheDocument();
    const sections = Array.from(document.querySelectorAll<HTMLElement>('section.template-section'));
    expect(sections).toHaveLength(2);
    // "Copy start prompt" appears once per section, so scope to each.
    for (const section of sections) {
      expect(within(section).getAllByRole('button', { name: 'Copy start prompt' })).toHaveLength(1);
    }
    const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

Run: `npx vitest run src/pages/TemplatesPage.test.tsx`
Expected: FAIL, cannot resolve `./TemplatesPage`.

- [ ] **Step 6: Write `TemplatesPage`**

```tsx
// src/pages/TemplatesPage.tsx
import { TEMPLATE_ENTRIES, type TemplateEntry } from '../content/templateContent';
import { TemplateSection } from '../components/TemplateSection';
import { usePreviewNav } from '../router/usePreviewNav';

export interface TemplatesPageProps {
  /** Slug of the template whose preview is open (from the route). An unknown slug opens nothing. */
  openSlug?: string;
  /** Overridable so a test can render more than one template. */
  entries?: TemplateEntry[];
}

export function TemplatesPage({ openSlug, entries = TEMPLATE_ENTRIES }: TemplatesPageProps) {
  const { open, close } = usePreviewNav(openSlug);

  return (
    <div className="templates-page">
      <h1>Templates</h1>
      {entries.map(({ template, content }) => (
        <TemplateSection
          key={template.slug}
          template={template}
          content={content}
          previewOpen={openSlug === template.slug}
          onOpenPreview={() => open(template.slug)}
          onClosePreview={close}
        />
      ))}
    </div>
  );
}
```

Run: `npx vitest run src/pages/TemplatesPage.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 7: Wire the route into `App`**

In `src/App.tsx`, replace the two page imports and the first two switch cases:

```tsx
import { TemplatesPage } from './pages/TemplatesPage';
```
(delete the `TemplatesIndexPage` and `TemplatePage` imports), and:

```tsx
    case 'templates':
      return <TemplatesPage openSlug={route.openSlug} />;
```
(delete the `'template'` and `'templates-index'` cases). Leave the exhaustive `never` check as is.

Replace these tests in `src/App.test.tsx`:

```tsx
  it('renders the templates page with its preview open for a known template hash', () => {
    window.location.hash = '#/templates/monitoring';
    render(<App />);
    expect(screen.getByTitle('AI Product Monitoring live preview')).toBeInTheDocument();
  });
```
and
```tsx
  it('renders the templates page for #/templates, with no preview open', () => {
    window.location.hash = '#/templates';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Templates' })).toBeInTheDocument();
    expect(screen.queryByTitle('AI Product Monitoring live preview')).not.toBeInTheDocument();
  });
```
(The "nav solid on non-home routes" test already uses `#/templates/monitoring` and still holds.)

- [ ] **Step 8: Run the whole suite and the type-check**

Run: `npx vitest run` then `npx tsc --noEmit`
Expected: the old `TemplatePage`, `TemplatesIndexPage` and `TemplateTile` tests still pass (they are deleted in Task 10), everything else PASS, `tsc` clean.

- [ ] **Step 9: Commit**

```bash
git add src/router src/pages/TemplatesPage.tsx src/pages/TemplatesPage.test.tsx src/App.tsx src/App.test.tsx
git commit -m "feat(site): one /templates page whose open preview is the URL hash" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Remove the old pages, the coming-soon handling and the case study

The data model loses `status` and `isLive`, and the files built for placeholders are deleted. Home's count sentence changes in the same commit, because it reads the removed field.

**Files:**
- Delete: `src/pages/TemplatesIndexPage.tsx`, `src/pages/TemplatesIndexPage.test.tsx`, `src/pages/TemplatePage.tsx`, `src/pages/TemplatePage.test.tsx`, `src/components/TemplateTile.tsx`, `src/components/TemplateTile.test.tsx`, `src/components/CaseStudy.tsx`, `src/content/caseStudies.ts`, `src/assets/comingSoonFallback.ts`
- Rewrite: `src/data/templates.ts`, `src/data/templates.test.ts`
- Modify: `src/pages/HomePage.tsx`, `src/pages/HomePage.test.tsx`, `src/content/types.ts`, `src/App.css`

**Interfaces:**
- Produces: `Template` without `status`; `TEMPLATES` with the single `monitoring` entry; `getTemplate(slug)`. `isLive` and `TemplateStatus` no longer exist.

- [ ] **Step 1: Update the data tests (failing)**

Replace `src/data/templates.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { TEMPLATES, getTemplate } from './templates';

describe('templates', () => {
  it('publishes only finished templates: every entry has a live build to preview', () => {
    expect(TEMPLATES.length).toBeGreaterThan(0);
    for (const item of TEMPLATES) {
      expect(item.livePreviewPath).toBe(`./live/${item.slug}/index.html`);
    }
  });

  it('looks a template up by slug', () => {
    expect(getTemplate('monitoring')?.name).toBe('AI Product Monitoring');
    expect(getTemplate('nope')).toBeUndefined();
  });

  it('every item has a distinct slug and a distinct accent hex', () => {
    expect(new Set(TEMPLATES.map((item) => item.slug)).size).toBe(TEMPLATES.length);
    expect(new Set(TEMPLATES.map((item) => item.accentHex)).size).toBe(TEMPLATES.length);
  });

  it("every item's screenshot path is relative, matching the vite base: './' convention", () => {
    for (const item of TEMPLATES) {
      expect(item.screenshotSrc.startsWith('./screenshots/')).toBe(true);
    }
  });
});
```

Replace the count test in `src/pages/HomePage.test.tsx` (the last `it`) with:

```tsx
  it('derives the template count from TEMPLATES instead of a hardcoded string', () => {
    render(<HomePage />);
    const count = TEMPLATES.length;
    expect(screen.getByText(`${count} template${count === 1 ? '' : 's'} ready.`)).toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });
```

Run: `npx vitest run src/data/templates.test.ts src/pages/HomePage.test.tsx`
Expected: FAIL (the old four-entry data and sentence).

- [ ] **Step 2: Rewrite the data**

```ts
// src/data/templates.ts

// A template is published by adding it here, and nothing else is "coming
// soon": the site lists only templates that are finished and previewable.
// To add one, you need all four of:
//   1. its package at packages/<slug>/ (self-contained; see the root README),
//   2. an entry below,
//   3. its section copy in src/content/templateContent.ts (a test fails
//      without it),
//   4. a screenshot at public/screenshots/<slug>.png, plus its build copied
//      to live/<slug>/ (scripts/sync-template-builds.mjs for local dev, the
//      deploy workflow for production).
// The root README's template table must list it too; scripts/check-templates-readme.mjs
// fails CI if the two disagree.
export interface Template {
  slug: string;
  name: string;
  tagline: string;
  /** Human label for the template's accent hue — display only. */
  accentLabel: string;
  /**
   * The template's accent hex value. Scoped to just this template's own hero
   * (name badge, screenshot frame, "Run the live demo" button) as
   * --color-accent / --color-secondary — never applied to hub chrome, which
   * stays neutral. See the design spec, Visual direction.
   */
  accentHex: string;
  /** Path to a static screenshot, relative to the site's own index.html. */
  screenshotSrc: string;
  /**
   * Path to the template's built index.html, relative to the site's own
   * index.html. In production the CI workflow copies each template's dist
   * into site/dist/live/<slug>/ (see #8); for local dev, run
   * `npm run sync-templates` first to populate public/live/<slug>/.
   */
  livePreviewPath: string;
}

export const TEMPLATES: Template[] = [
  {
    slug: 'monitoring',
    name: 'AI Product Monitoring',
    tagline: 'Request volume, latency percentiles, error rate, and a live alerts feed for a production AI API.',
    accentLabel: 'Cyan',
    accentHex: '#00fff9',
    screenshotSrc: './screenshots/monitoring.png',
    livePreviewPath: './live/monitoring/index.html',
  },
];

export function getTemplate(slug: string): Template | undefined {
  return TEMPLATES.find((item) => item.slug === slug);
}
```

- [ ] **Step 3: Change Home's sentence**

In `src/pages/HomePage.tsx`, replace the three lines that compute `liveCount`, `comingSoonCount` and `templateCountText` (and their comment) with:

```tsx
// Derived from TEMPLATES (not hardcoded) so this sentence doesn't go
// stale the moment a second template ships.
const templateCountText = `${TEMPLATES.length} template${TEMPLATES.length === 1 ? '' : 's'} ready.`;
```

- [ ] **Step 4: Delete the old files and the case-study type**

```bash
git rm src/pages/TemplatesIndexPage.tsx src/pages/TemplatesIndexPage.test.tsx src/pages/TemplatePage.tsx src/pages/TemplatePage.test.tsx src/components/TemplateTile.tsx src/components/TemplateTile.test.tsx src/components/CaseStudy.tsx src/content/caseStudies.ts src/assets/comingSoonFallback.ts
```

In `src/content/types.ts`, delete the `CaseStudyContent` interface (keep `CodeSnippet`, `ExampleCase` and `TemplateContent`).

- [ ] **Step 5: Delete the old CSS**

First confirm nothing still uses these classes:

Run: `grep -rn "back-link\|template-page\|preview-frame\|case-study\|template-tile\|templates-index" src --include=*.tsx --include=*.ts`
Expected: no matches.

Then in `src/App.css` delete these blocks, and leave `.code-viewer`, `.code-viewer-empty` and `.code-block*` (CodeViewer uses them): the `/* ---- Template detail page ---- */` block (`.template-page`, `.back-link` and its `:hover`/`:focus-visible`, `.template-page-header`, `.template-page-tagline`, `.template-page-body`, `.preview-frame` and its `::before` and `iframe`), the `/* ---- Case study ---- */` block (`.case-study*`), the `/* ---- Template tiles (Templates index) ---- */` block, and the `/* ---- Templates index ---- */` block (including its `@media (max-width: 640px)` rule for `.template-tile-large`). If the `/* ---- Code tab + case study "Key snippet" ---- */` comment still says "case study", change it to `/* ---- Code blocks ---- */`.

- [ ] **Step 6: Run everything**

Run: `grep -rn "isLive\|TemplateStatus\|coming-soon\|CaseStudyContent\|comingSoon" src`
Expected: no matches.

Run: `npx vitest run` then `npx tsc --noEmit`
Expected: all PASS, `tsc` clean.

- [ ] **Step 7: Commit**

```bash
git add -A src
git commit -m "refactor(site): drop the index, tiles, case study and coming-soon handling" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Root README and its drift check

The root README's template table must list exactly the published templates, and CI fails when it does not.

**Files:**
- Modify: `README.md` (repo root)
- Create: `scripts/check-templates-readme.mjs`, `scripts/check-templates-readme.test.mjs`
- Modify: `package.json` (repo root), `.github/workflows/checks.yml`

**Interfaces:**
- Produces: `parseTemplates(source: string): { slug: string; name: string }[]` (from `packages/site/src/data/templates.ts`), `parseReadmeRows(readme: string): { slug: string; name: string }[]`, `checkReadme(templates, rows): string[]` (one problem per mismatch; empty when fine).

Run these steps from the repository root (`cd ../..`).

- [ ] **Step 1: Write the failing test**

```js
// scripts/check-templates-readme.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTemplates, parseReadmeRows, checkReadme } from './check-templates-readme.mjs';

const TS = `
export const TEMPLATES: Template[] = [
  {
    slug: 'monitoring',
    name: 'AI Product Monitoring',
    tagline: 'x',
  },
  {
    slug: 'second',
    name: "Second Template",
  },
];`;

const README = `# t

## Templates

| Template | What it is |
|----------|------------|
| [AI Product Monitoring](packages/monitoring) | A dashboard. |
| [Second Template](packages/second) | Another. |

## Get just one template
`;

test('reads slug/name pairs from templates.ts, single or double quoted', () => {
  assert.deepEqual(parseTemplates(TS), [
    { slug: 'monitoring', name: 'AI Product Monitoring' },
    { slug: 'second', name: 'Second Template' },
  ]);
});

test('fails loudly when templates.ts has no entries it can read', () => {
  assert.throws(() => parseTemplates('export const TEMPLATES = [];'), /could not find any template/i);
});

test('reads the README table rows between "## Templates" and the next heading', () => {
  assert.deepEqual(parseReadmeRows(README), [
    { slug: 'monitoring', name: 'AI Product Monitoring' },
    { slug: 'second', name: 'Second Template' },
  ]);
});

test('no problems when the README lists exactly the published templates', () => {
  assert.deepEqual(checkReadme(parseTemplates(TS), parseReadmeRows(README)), []);
});

test('reports a template missing from the README', () => {
  const rows = parseReadmeRows(README).slice(0, 1);
  const problems = checkReadme(parseTemplates(TS), rows);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /second/);
});

test('reports a README row with no published template (a placeholder)', () => {
  const rows = [...parseReadmeRows(README), { slug: 'planned', name: 'Planned Thing' }];
  const problems = checkReadme(parseTemplates(TS), rows);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /planned/);
});

test('reports a name that differs from the site', () => {
  const rows = [{ slug: 'monitoring', name: 'AI monitoring dashboard' }, { slug: 'second', name: 'Second Template' }];
  const problems = checkReadme(parseTemplates(TS), rows);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /AI Product Monitoring/);
});
```

Run: `node --test scripts/check-templates-readme.test.mjs`
Expected: FAIL, cannot find module `./check-templates-readme.mjs`.

- [ ] **Step 2: Write the script**

```js
#!/usr/bin/env node
// Verifies that the root README's template table lists exactly the templates
// the site publishes (packages/site/src/data/templates.ts): same slugs, same
// names. The site's Templates page is the source of truth; the README is a
// copy, and a copy that lists a placeholder or misses a template is a false
// claim to anyone who finds the repo before the site.
//
// Lives at the repo root, not in packages/site, so the site package stays
// self-contained, and uses only Node built-ins so CI needs no install.
//
// It reads templates.ts as text, so it relies on each entry writing `slug:`
// and then `name:` as the next property. If you reorder them it fails loudly
// ("could not find any template") rather than passing silently.
//
// When it fails: edit the table under "## Templates" in README.md to match.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** @param {string} source contents of templates.ts */
export function parseTemplates(source) {
  const found = [...source.matchAll(/slug:\s*(['"])([^'"]+)\1,\s*name:\s*(['"])([^'"]+)\3/g)];
  if (found.length === 0) {
    throw new Error('Could not find any template (slug followed by name) in templates.ts. Did the property order change?');
  }
  return found.map((match) => ({ slug: match[2], name: match[4] }));
}

/** @param {string} readme contents of README.md */
export function parseReadmeRows(readme) {
  const lines = readme.replace(/\r\n/g, '\n').split('\n');
  const start = lines.findIndex((line) => line.trim() === '## Templates');
  if (start === -1) return [];
  const rows = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## ')) break;
    const row = line.match(/^\|\s*\[([^\]]+)\]\(packages\/([^)\s]+)\)/);
    if (row) rows.push({ slug: row[2], name: row[1] });
  }
  return rows;
}

/**
 * @param {{slug: string, name: string}[]} templates from the site
 * @param {{slug: string, name: string}[]} rows from the README
 * @returns {string[]} one problem per mismatch; empty when all is well
 */
export function checkReadme(templates, rows) {
  const problems = [];
  for (const template of templates) {
    const row = rows.find((candidate) => candidate.slug === template.slug);
    if (!row) {
      problems.push(`README.md does not list the published template "${template.slug}" (${template.name}).`);
    } else if (row.name !== template.name) {
      problems.push(`README.md names "${template.slug}" "${row.name}" but the site calls it "${template.name}".`);
    }
  }
  for (const row of rows) {
    if (!templates.some((template) => template.slug === row.slug)) {
      problems.push(`README.md lists "${row.slug}" but the site does not publish it. Planned templates belong in GitHub issues, not the table.`);
    }
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const templates = parseTemplates(readFileSync(path.join(repoRoot, 'packages', 'site', 'src', 'data', 'templates.ts'), 'utf8'));
  const rows = parseReadmeRows(readFileSync(path.join(repoRoot, 'README.md'), 'utf8'));
  const problems = checkReadme(templates, rows);
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(`README template table OK (${templates.length} template${templates.length === 1 ? '' : 's'} checked)`);
}
```

Run: `node --test scripts/check-templates-readme.test.mjs`
Expected: PASS, 7 tests.

- [ ] **Step 3: Run the script against the real README (expect it to fail)**

Run: `node scripts/check-templates-readme.mjs`
Expected: FAIL, because the current table lists four planned templates the site does not publish, and its row has no link form.

- [ ] **Step 4: Fix the README table**

In `README.md`, replace the whole table under `## Templates`:

```markdown
| Template | Status |
|----------|--------|
| AI product monitoring dashboard | ready |
| Agent/assistant control panel | planned |
| Landing page / marketing site | planned |
| Mobile-first app | planned |
| Community / social interface | planned |
```

with:

```markdown
| Template | What it is |
|----------|------------|
| [AI Product Monitoring](packages/monitoring) | Request volume, latency percentiles, error rate, and a live alerts feed for a production AI API. |

More are planned; follow [the open issues](https://github.com/patrickkuei/cyberui-templates/issues) to see what is next. The [site](https://patrickkuei.github.io/cyberui-templates/) has a live preview and a one-step start for each template that is ready.
```

(Before saving, check the deployed site URL: if the repo's GitHub Pages address differs from `https://patrickkuei.github.io/cyberui-templates/`, use the real one from the repo's Settings > Pages, or `gh api repos/patrickkuei/cyberui-templates/pages --jq .html_url`.)

Run: `node scripts/check-templates-readme.mjs`
Expected: `README template table OK (1 template checked)`.

- [ ] **Step 5: Add the scripts and the CI job**

In the root `package.json`, set `scripts` to:

```json
  "scripts": {
    "check:process-excerpts": "node scripts/check-process-excerpts.mjs",
    "check:templates-readme": "node scripts/check-templates-readme.mjs",
    "test:scripts": "node --test scripts/check-process-excerpts.test.mjs scripts/check-templates-readme.test.mjs"
  },
```

In `.github/workflows/checks.yml`, append a second job under `jobs:` (same indentation as `process-excerpts:`):

```yaml
  templates-readme:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: node --test scripts/check-templates-readme.test.mjs

      - run: node scripts/check-templates-readme.mjs
```

and extend the comment at the top of the file so it names both checks: after the existing paragraph add `# Likewise the root README's template table is a copy of the site's template list; the second job fails when they disagree.`

Run: `npm run test:scripts` then `npm run check:templates-readme`
Expected: both PASS.

- [ ] **Step 6: Commit**

```bash
git add README.md scripts/check-templates-readme.mjs scripts/check-templates-readme.test.mjs package.json .github/workflows/checks.yml
git commit -m "docs: list only published templates in the README and check it against the site" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
cd packages/site
```

---

### Task 12: Look at it in a browser, then verify everything

Nothing in Tasks 1-11 renders in a real browser. The spec leaves several judgments to this task. Do not skip it.

**Files:** none (fixes found here go in the file they belong to, each as its own commit).

- [ ] **Step 1: Run the whole suite and the production build**

Run: `npx vitest run` then `npm run build`
Expected: all tests PASS; the build finishes with no type errors.

Run (from the repo root): `npm run test:scripts && npm run check:templates-readme && npm run check:process-excerpts`
Expected: all PASS. If `check:process-excerpts` fails, an excerpt source file changed; refresh it as that script's message says.

- [ ] **Step 2: Start the site with the real template build**

Run: `npm run sync-templates` then `npm run dev`
Open the address Vite prints, then go to `#/templates`.

- [ ] **Step 3: Check each item and fix what fails**

Desktop width (about 1440px):
- [ ] The page has one h1 "Templates" and the monitoring section; the screenshot shows inside a window frame with a dark gradient and a visible "Run the live demo" button.
- [ ] **Neon check (spec §5, "revisit"):** the cyan appears only in the hero (badge, button). Judge whether it feels too tight against the screenshot. If it does, record the finding and the alternative you would try; do not silently change the design.
- [ ] **Heads-up check (spec §5, "revisit"):** the Heads-up reads as information and is not easy to skim past. If it is skimmed past, the fallback is a boxed callout; note it for the user.
- [ ] Opening a fold shows a neutral border, not yellow or cyan.
- [ ] Clicking the screenshot and the button each open the dialog at roughly 90% of the viewport; the dashboard runs inside; the Code tab shows the snippets; the URL is `#/templates/monitoring`.
- [ ] Esc closes the dialog; focus returns to where it was; the page behind does not scroll while it is open.
- [ ] Browser Back closes the dialog and stays on the Templates page; pressing Back once more leaves it.
- [ ] Reloading with the dialog open (a direct link) reopens it; closing it with the close button leaves you on `#/templates` and Back does not reopen it.
- [ ] Copy start prompt puts the prompt on the clipboard (paste it somewhere and compare to the fold's text).
- [ ] The "Copy start prompt" and fold buttons are neutral, with no glow.

Phone width (browser devtools at 390px):
- [ ] No sideways page scroll; wide `pre` blocks scroll inside their own block.
- [ ] The dialog is full-screen; the close button is reachable; Back (use the devtools back button) closes it.
- [ ] The tab bar inside the dialog is usable.

Reduced motion (devtools: emulate `prefers-reduced-motion: reduce`):
- [ ] The dialog appears with no fade.

Keyboard and screen reader basics:
- [ ] Tab reaches "Run the live demo", the folds and the Copy button in a sensible order; focus is trapped inside the open dialog.
- [ ] In the accessibility tree the dialog is exposed with the template's name (this was the reason for not using the library `Modal`).

- [ ] **Step 4: Record what you found**

Add a short "Findings from the first browser check" list to the end of `docs/superpowers/specs/2026-10-05-templates-page-design.md` (file at `../../docs/superpowers/specs/`) covering: the neon check, the Heads-up check, anything that needed a fix, and anything you could not check. State plainly what was not checked.

- [ ] **Step 5: Commit**

```bash
git add ../../docs/superpowers/specs/2026-10-05-templates-page-design.md
git commit -m "docs: record findings from the first browser check of /templates" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review notes

- **Spec coverage:** §1-2 are context only. §3 one page (Tasks 8-9), order within a section (Task 8), dialog (Tasks 3-4), Back behavior and shareable link (Task 9), constraints: add-a-template-is-data (Tasks 5, 10), single source for the fork command (Task 1) and README (Task 11), no in-page anchors (none used). §4 copy: fit, Heads-up, not-for (Task 5), start block and prompt (Tasks 1 and 7), examples (Tasks 5-6). §5: accent once, neutral Copy button, frame and always-visible overlay, Heads-up rule, dialog look, motion (Tasks 3, 6-8; checked in Task 12). §6: Accordion neutral scope (Task 6), TabNavigation (Task 4), native dialog (Task 3), removals (Task 10). "Decisions not made" are deliberately not built: no stack/license line, no "only template right now" note, no bigger Code tab; the `init` and `tiged` checks are for the human in Task 12 only as far as the prompt text goes (the plan does not run `tiged` or `init`).
- **Not covered, by design:** the library issue for `Modal`'s `aria-hidden` (needs the user's approval of the text); the license file for forks (separate issue).
- **Types:** `TemplateEntry`, `TemplateContent`, `ExampleCase`, `Template` (no `status`), `Route` (`templates` with `openSlug`), `usePreviewNav` and the component props are used with the same names in every task that touches them.
