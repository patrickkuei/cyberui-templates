# Landing Page Template (`packages/landing`) — Design Spec

**Date:** 2026-10-16
**Status:** Approved by the owner on 2026-10-16. The owner answered every question under "Open questions" with "fine as proposed" (Q1-Q10), so each "proposed" decision below is now decided. This spec was drafted without interactive review before that answer, so its judgment calls are the ones listed in "Decisions I made".
**Plan:** [docs/superpowers/plans/2026-10-16-landing-page.md](../plans/2026-10-16-landing-page.md).
**Issue:** [#47](https://github.com/patrickkuei/cyberui-templates/issues/47) (item 3 of tracking issue [#1](https://github.com/patrickkuei/cyberui-templates/issues/1)).
**Builds on:** [2026-09-27-cyberui-showcase-design.md](2026-09-27-cyberui-showcase-design.md) (self-contained packages, accent-hue theming, one combined deploy), [2026-10-05-templates-page-design.md](2026-10-05-templates-page-design.md) (the `/templates` page every template is published through) and [2026-10-06-agent-panel-design.md](2026-10-06-agent-panel-design.md), the closest model: its structure, its publishing path (§10) and its honesty standard (§3.4) are reused here without being repeated in full.
**Baseline:** cyberui-2045 **2.8.0**, which the three existing packages moved to in PR #62. This spec relies on two things 2.8.0 fixed (see §7); it must not be built against 2.7.x.

## Decisions I made, and what the owner must answer

Proposed decisions (each cheap to reverse; the section with the reasoning is in brackets):

1. **Slug and package name:** `landing` / `landing-template` (mirrors `monitoring-template`, `agent-panel-template`). [§2]
2. **One long page, no router.** The other two templates are multi-route apps; a landing page is one scroll. The `ROUTES` tuple pattern does not apply, so this template's "pattern to copy" is different (§6.2). [§3.1]
3. **Nine sections, each a component:** header, hero, logo strip, features, how it works, pricing, FAQ, closing call to action with a signup form, footer. [§3.2]
4. **Two real interactions, the rest static:** the monthly/yearly pricing toggle and the FAQ accordion. Everything that would need a backend (signup, "Start free trial", plan buttons, contact link) is mock, and the page says so once. [§3.4]
5. **No images.** Visuals are cyberui-2045 components, CSS and inline SVG, so the package has no binary assets and nothing to license. [§3.2]
6. **No `recharts`, no router, no new runtime dependency** beyond `react`, `react-dom` and `cyberui-2045`. [§9]
7. **Accent is a token override in one file** (`src/theme/<hue>.css`), exactly as `violet.css` does it: `--color-secondary` and `--color-accent` together, `--color-primary` left alone. [§4]
8. **Two pull requests**, as for agent-panel: PR A is the package, PR B is the site, CI and README wiring (the Code tab's excerpts must exist in the package before CI accepts the site entry). [§10]
9. **Publishing also edits the other two templates' copy.** Both currently say "Probably not for you: … a landing page" (`packages/site/src/content/templateContent.ts:32` and `:73`). Once this ships that sentence is false and must change. [§11]

Open questions: see the end of this document. Q-numbers are referenced from the sections above.

## 1. Goal

Ship the third template: a self-contained **marketing landing page**, mostly static, that shows cyberui-2045 outside dashboards. It is the most common thing people build (issue #47), so a visitor should recognise it at once as "the page I would start from", and a forker should be able to swap the fiction for their product by editing data and copy, not layout code.

Success, in the repo's terms (spec 2026-10-05 §1):
1. A visitor can tell within one preview whether this is the shape of thing they want (a product page with pricing and a signup), and what is fake in it.
2. A forker gets a package that runs after `npx tiged … my-app && cd my-app && npm install && npm run dev` with no other setup, and whose code reads as a pattern to copy.
3. It follows the same path to publication as the first two and adds no new mechanism to the site.
4. It is responsive in a way a landing page must be: usable at 1440, 800 and 390px, checked in a real browser, not inferred from tests.

**Not in scope:** a real signup, payment or email backend; analytics; a CMS or blog; i18n; a light theme; a router or multiple pages; a cookie banner; real photography or logos; any change to cyberui-2045 (findings go to patrickkuei/CyberUI as issues, issue #47 step 4).

## 2. What the template is for

A person (founder, indie developer, a PM pitching a product) who needs a presentable page for something they are launching and wants a starting point that already has the sections everyone expects, in this library's look. The template answers "what would my product's front door look like?" with a working page, not a component inventory.

Fiction (proposed, Q1): a developer tool, **"Tessera"**, a zero-config deploy platform. Reasons: developer tools are this library's audience; the page then has natural content for every section (a code/terminal snippet, a usage-based price table, an FAQ about limits); and it does not overlap with the monitoring (AI metrics) or agent-panel (AI assistant) fictions. "Tessera" is a placeholder name, not checked against trademarks beyond the repo's existing rule that no real brand appears; a better name is welcome (Nexus and Vesper were chosen by the owner).

Package folder `packages/landing`, pnpm name `landing-template`, site name "Landing Page" (Q1).

## 3. The experience

### 3.1 Shape

One scrolling page with in-page navigation. No router and no hash routes: navigation buttons scroll to a section (`scrollIntoView`, `behavior: 'auto'` under `prefers-reduced-motion`), they do not rewrite `window.location.hash`, so the page behaves the same inside the site's preview iframe and at any deploy subpath.

### 3.2 Sections (proposed, Q4)

| # | Section | Contents | cyberui-2045 pieces (to confirm in the plan against the 2.8.0 manifest) |
|---|---|---|---|
| 1 | **Header** | Wordmark, section links, a "Start free trial" button; below `md` the links collapse into a menu | `Button`, `Drawer` (mobile menu) |
| 2 | **Hero** | Headline with one gradient phrase, one sentence, primary and secondary buttons, a terminal-style snippet showing the product in use | `GradientText`, `Button`, `Card` |
| 3 | **Logo strip** | "Teams who ship on Tessera": five invented wordmarks as text/SVG, never real brands (Q5) | `Divider` |
| 4 | **Features** | Six cards in a responsive grid, each an icon, a title, two lines | `Card` (grid via the responsive props 2.8.0 fixed) |
| 5 | **How it works** | Three steps: connect repo, push, it is live | `Steps` |
| 6 | **Pricing** | Three plans, a Monthly/Yearly toggle that really changes the prices, one highlighted plan | `Card`, `Toggle`, `Badge`, `Button` |
| 7 | **FAQ** | Six questions, one open at a time | `Accordion` |
| 8 | **Closing call to action** | One line plus an email field and a button | `FormField`, `Input`, `Button` |
| 9 | **Footer** | Link columns, a copyright line, and the one demo-honesty line (§3.4) | `Divider` |

A numbers strip (uptime, deploys per day) lives inside the hero or features, not as a tenth section; all figures are illustrative and marked so (§3.4). Testimonials are **not** included by default (Q5): invented quotes with names and faces are exactly what a forker might ship by mistake, and the honesty standard in `packages/monitoring/README.md` is the reason to leave them out.

### 3.3 The interactions

- **Pricing toggle:** Monthly/Yearly switches every price and the "billed" caption; yearly shows the saving. State is one `useState` in `PricingSection`; the plan data lives in `src/data/plans.ts` so a forker edits data, not JSX. The toggle is a real `Toggle` with a visible label, not a div.
- **FAQ:** `Accordion`, keyboard operable by the library; the question list is data in `src/data/faq.ts`.
- **Menu (below `md`):** `Drawer`, closes on link click and on Esc. Esc pressed inside the preview also closes the site's own dialog (known, spec 2026-10-05 §3); noted in the README, not worked around.
- **Smooth scroll:** only when the visitor clicks a nav link, never on load (the site's motion rule: motion answers an action or marks a first impression).

### 3.4 What is mock, and how the page says so

Real in the page: the pricing toggle, the FAQ, the mobile menu, the form's own validation (a malformed email shows an error).

Mock: signup (submitting shows a confirmation and sends nothing), every "Start free trial"/"Choose plan"/"Contact sales" button (they scroll to the signup or do nothing), all numbers and logos, all links in the footer (`href="#"`-style, which the code comments call out).

How the page says it (proposed, Q6, following the agent-panel decision that honesty comes from one persistent signal plus the README, not repeated labels): a single line in the footer, "Template demo: Tessera is fictional and the form sends nothing.", and the README's list. No banner, no "(demo)" suffixes on buttons. A comment at the form's `onSubmit` and above the plan data says the same for a forker reading code.

### 3.5 Accessibility and motion

- Landmarks (`header`, `main`, `footer`), one `h1`, headings in order, a skip link to `main`.
- Every control reachable and operable by keyboard; visible focus (the library's ring).
- Form field has a real label and an error message tied with `aria-describedby`; the confirmation is announced politely.
- Colour contrast: the accent (§4) must clear 4.5:1 on `--color-base` and `--color-surface`; the library's two open contrast issues are known and avoided or checked: CyberUI#116 (DatePicker, Image contrast; this template uses neither) and CyberUI#117 (no disabled state for a clickable Badge; no Badge here is clickable).
- Motion: one entrance at first load for the hero at most, nothing scroll-triggered (owner decision on agent-panel's page, which this template keeps); everything off under `prefers-reduced-motion`.

## 4. Theming

Same mechanism as `violet.css`: one small stylesheet imported after the library's, overriding `--color-secondary` and `--color-accent` together, leaving `--color-primary` alone, with the comment written for a forker ("change these two values to re-theme"). A test fails if any other CSS file under `src/` contains a hex literal (copied from agent-panel's `noHexColors.test.ts`).

Hues already taken: cyan (monitoring, `#00fff9`, hue 179) and violet (agent-panel, `#c084fc`, hue 270). Candidates, with contrast computed by hand from the 2.8.0 tokens (`--color-base` `#1a1a2e`, `--color-surface` `#2d2d44`):

| Candidate | Hex | Hue | on base | on surface | Concern |
|---|---|---|---|---|---|
| Orange (proposed) | `#ff8a3d` | 24 | 7.27 | 5.70 | Near the library's `warning` (`#fa0`); a warning Badge would read as accent |
| Lime | `#a3e635` | 83 | 11.31 | 8.87 | Between `accent` yellow and `success` green; may blur with success ticks in the pricing list |
| Blue | `#5b9cff` | 216 | 6.21 | 4.87 | Close to the library's `info` (`#0af`, hue 200); least distinct from cyan |
| Pink | `#ff6b9d` | 340 | 6.37 | 4.99 | Same hue as `--color-primary`, so it would merge with the primary button |

Orange is proposed because it is furthest from both shipped hues and from `primary`; this page has no warning badge, and a forker who adds one can read the caveat in the theme file's comment. (Q2)

The site's `accentHex` for this template must differ from `#00fff9` and `#c084fc`; `packages/site/src/data/templates.test.ts` already enforces distinctness.

## 5. Data and mock-data strategy

There is no engine and no state beyond the toggle and the form. All content is typed data in `src/data/`:

| File | Holds |
|---|---|
| `product.ts` | name, tagline, headline pieces, nav links, footer columns |
| `features.ts` | the six feature cards |
| `plans.ts` | `Plan[]` with monthly and yearly prices; a `Record<BillingPeriod, …>` so a new period is a compile error until every plan has it |
| `faq.ts` | the questions |

Copy lives in data, not scattered in JSX, so "swap Tessera for your product" is a data edit. The README has a "Where your content goes" section (the analogue of agent-panel's "Where your data goes") that names these files and says where to replace the mock signup with a real endpoint.

## 6. Code structure and patterns to copy

```
packages/landing/
  LICENSE            (identical to the root one)
  README.md          (the forker's documentation)
  index.html         (title, description, social tags as placeholders, with a comment)
  package.json       (name landing-template, license MIT, no workspace: ranges)
  tsconfig.json      (complete, not extended)
  vite.config.ts     (base: './')
  src/
    main.tsx  App.tsx  App.css
    components/      (one file per section + SectionHeading, FeatureCard, PlanCard, SignupForm)
    data/            (§5)
    hooks/           (usePrefersReducedMotion, copied from agent-panel)
    theme/           (the accent file + tones if needed)
    test/            (setup.ts, copied)
```

### 6.1 Patterns copied from the other templates

`usePrefersReducedMotion`, `test/setup.ts`, the `noInlineStyles` and `noHexColors` tests, the `tones.ts` idea for status colours if used. Duplication across templates stays deliberate (a shared layer would break `tiged` extraction).

### 6.2 Patterns new to this template (each needs a forker-facing comment, per CLAUDE.md)

- **Sections as a typed list.** `App.tsx` renders `SECTIONS = [...] as const` mapped to components, and the nav links derive from the same list, so adding a section without a nav entry (or the reverse) is a compile error. This is the single-page counterpart of the `ROUTES` tuple and needs the same one-line explanation.
- **Plans as `Record<BillingPeriod, …>`** (§5).
- **Mock boundaries named in code** (the form handler, the plan buttons, the footer links), matching the honesty rule in CLAUDE.md.
- **Duplicate visible text in tests.** Plan names appear in the nav, the cards and possibly a comparison row, so queries scope with `within(section)`; one comment at the first collision in the file, none repeated.

## 7. cyberui-2045 components used and what 2.8.0 gives this template

Planned: `Button`, `Card`, `Badge`, `Toggle`, `Accordion`, `Steps`, `Drawer`, `FormField`, `Input`, `Divider`, `GradientText`, `SectionTitle`. The plan confirms each against `component-manifest.json` before using it.

From the 2.8.0 changelog, relevant here:
- **Responsive props now work in the prebuilt stylesheet** (CyberUI#108). Before 2.8.0, `size={{ base: 'sm', md: 'lg' }}` had no effect above `base`, which would have made a landing page's breakpoint behaviour a workaround. This is why the template starts on 2.8.0.
- `Badge` `variant="neutral"`, `shape`, `shadow` (for the "Most popular" and "Save 20%" tags); `Tooltip` `glow` (if a tooltip is used at all; none is planned).

Anything found while building goes to patrickkuei/CyberUI as an issue (issue #47 step 4); the template never works around it silently without a comment saying so.

## 8. Testing strategy

Vitest + Testing Library + happy-dom, as in the other packages, run in CI by the `package-tests` job (#35 done). Tests assert behaviour, not markup:

- Toggle switches every price and the caption; the highlighted plan stays highlighted.
- FAQ: opening one item closes the previous; keyboard works.
- Form: malformed email shows the error and does not "send"; a valid one shows the confirmation; the confirmation is announced.
- Nav: clicking a section link scrolls that section into view (spy on `scrollIntoView`), with reduced motion respected.
- Headings: exactly one `h1`; landmarks present.
- `noInlineStyles` and `noHexColors` (copied).
- A data test: every plan has both billing periods; every nav target exists (the typed list makes this mostly a compile guarantee).

Not testable under happy-dom and therefore a **browser check, not a test**: layout at 1440, 800 and 390px, the Drawer, the sticky header, focus rings and the real accent contrast. The plan makes this a task with screenshots, as issue #47 requires.

## 9. Self-containment and forkability

Identical rules to agent-panel §9: own complete `package.json` (`license: MIT`, `cyberui-2045: ^2.8.0`, never `workspace:`), own `tsconfig.json`, own `vite.config.ts` with `base: './'`, no imports outside the package, `LICENSE` file identical to the root one, README as the forker's documentation (what it is and what is mock, commands, "Where your content goes", "Principles this code follows" as on the Code tab, "Re-theming"). Verified by the clean-room method of monitoring plan Task 9 (copy the folder outside the workspace; install with zero warnings; build; test; run) and, once merged, `npx --yes tiged patrickkuei/cyberui-templates/packages/landing my-app` for real (the site's start prompt now uses `npx --yes tiged`, PR #59).

## 10. Integration points (PR B)

Same table as agent-panel §10, with these values. Nothing here is new machinery.

| File | Change |
|---|---|
| `packages/site/src/data/templates.ts` | Add the `landing` entry: name "Landing Page", tagline, `accentLabel`, `accentHex` (distinct from the other two), screenshot and live-preview paths. `slug:` then `name:` as plain single-line quoted strings (the README check reads the file as text). |
| `packages/site/src/content/templateContent.ts` | Add the `landing` entry (`useIf`, `headsUp`, `notFor`, `examples`, `code`); **and edit the `notFor` of `monitoring` (line 32) and `agent-panel` (line 73)**: both end "…or a landing page." |
| `packages/site/src/content/codeTabs.json` | Add `landing`: principles with verbatim excerpts and the folder map (`check:code-tab` verifies each in CI). |
| `packages/site/public/screenshots/landing.png` | About 1440px wide; taken at the top of the page with the pricing toggle visible. |
| `packages/site/scripts/sync-template-builds.mjs`, `.github/workflows/deploy.yml` | The build/copy entries; `check:template-builds` fails CI if either is forgotten. |
| `README.md` (root) | A row in the Templates table (`check:templates-readme`). |
| `pnpm-lock.yaml` | A `packages/landing` importer; `deploy.yml` uses `--frozen-lockfile`. |
| site tests | `getTemplate('landing')` resolves; its screenshot exists; copy assertions. |
| `packages/site/src/content/staticHtml.ts` (line 18) | The site's meta description hard-codes "such as an AI monitoring dashboard and an agent control panel"; extend it (and its test) to name the landing page. `llms.ts` derives from `TEMPLATES` and `TEMPLATE_CONTENT` (its own comment says so) and needs no edit. The noscript list and `sitemap.xml` were not read; the plan must check whether they derive from `TEMPLATES` too. |

`check:license`, `check:code-tab`, `check:templates-readme`, `check:template-builds` and the full `pnpm -r --workspace-concurrency=1 run test` must pass. PR B says `Closes #47`; the tracking issue #1 gets its checkbox ticked by hand.

## 11. Site copy for the Templates page (proposed wording, to be fixed after Q answers)

- **Name / tagline.** "Landing Page" / "A hero, features, pricing with a working billing toggle, FAQ and a signup form for a product launch."
- **Use this if you're building…** a launch page for a product or side project; a pricing page with plans to compare; a one-screen "join the waitlist" page.
- **Heads-up.** One short friendly demo note in the style of the agent-panel decision: the product and numbers are made up and the signup sends nothing. Aim for roughly 150 characters, no list of mock parts.
- **Probably not for you** "if you're after a dashboard or a native mobile app. (A one-page portfolio is fine.)"
- **Examples (two folds).** Not written here. Same method as the others: two persona role-plays by subagents, kept verbatim and truncated with ellipses, never invented; "Where they'd get stuck" lists only obstacles the library and templates did not cause (hosting, a domain, an email provider, real payment). If the interviews cannot be run, the task stops and asks. Suggested personas: an indie developer launching a paid side project; a PM who needs a waitlist page before engineering starts.
- **Code tab principles** (each claim must be true of the shipped code): Single source of truth (content in `src/data/`), DRY, Typed and exhaustive (the `SECTIONS` list and the `Record<BillingPeriod, …>` plans), No inline styles (the test), Tested (the toggle and form), Content as data ("Swap the product by editing four files"). Folder map for `src/components`, `src/data`, `src/theme`.

## 12. Risks and what is not verified

- **Nothing here has been built or run.** This is a draft; the only measured facts are the token contrast numbers in §4 (computed by hand from the 2.8.0 stylesheet, not rendered) and the two `notFor` line numbers.
- **Component fit is assumed.** `Drawer`, `Steps`, `Accordion`, `Toggle` and `GradientText` exist in 2.8.0 (listed in its manifest) but have not been tried together in this layout; the plan must confirm their props and a11y behaviour before the design leans on them.
- **Landing pages invite a new class of fakery:** invented customers, logos and numbers. The honesty rule is the main design constraint here, not the layout.
- **Preview inside the site's dialog:** the sticky header and `scrollIntoView` inside an iframe inside a `<dialog>` are untested; the browser check must include the live preview, not just `npm run dev`.
- **SEO tags in `index.html`** are placeholders a forker must replace; the template cannot make them correct for a product it does not know.

## 13. Out of scope

Anything under "Not in scope" in §1; a library `Hero` or `Pricing` component (a separate CyberUI feature request if wanted); the mobile-first template (#48) and the community template (#49); changing issue #47's wording.

---

## Open questions for the owner

Each has my recommendation first. "Fine as proposed" is a complete answer.

**Q1. The fiction.** A developer tool called "Tessera" (a zero-config deploy platform)? Alternatives: a consumer app (a habit tracker), a physical product (a keyboard), a SaaS for non-developers (an invoicing tool). Also: is the package name `landing` / site name "Landing Page" right, or do you want a product-style name like "Product Launch Page"?

**Q2. The accent hue.** Orange `#ff8a3d` (proposed), lime `#a3e635`, blue `#5b9cff`, or another. Orange is furthest from cyan, violet and magenta but sits near the library's warning colour (§4).

**Q3. One page or several?** One scrolling page (proposed). The alternative is a small router with Home and Pricing routes, which gives the template the same `ROUTES` pattern as the other two but makes it feel less like a landing page.

**Q4. Sections.** Are the nine in §3.2 the right ones? Cut candidates: logo strip, how it works. Add candidates: a comparison table, a changelog strip, a contact form.

**Q5. Social proof.** No testimonials, and invented logo wordmarks plus a few clearly illustrative numbers (proposed), or include sample testimonials marked "sample" in the code and README?

**Q6. How loudly does the page say it is a demo?** One footer line plus the README (proposed, matching the agent-panel decision) or a visible banner or badge at the top like agent-panel's "Simulated" badge?

**Q7. Images.** None: components, CSS and inline SVG only (proposed), or include one hero image/mock screenshot (which a forker must replace and which adds an asset the licence line must cover)?

**Q8. Mobile menu.** `Drawer` below `md` (proposed), or keep the links in a horizontally scrolling row to avoid a second interaction pattern?

**Q9. Order of work.** Spec, then plan, then PR A (package), then PR B (site) as for agent-panel (proposed). Do you want me to run the two role-play interviews for the site copy before PR B, or stop and ask when we get there?

**Q10. Subagent workflow.** Same as the migration: an implementer subagent per PR, a separate reviewer subagent, and I merge when the review is clean and CI is green. Confirm that this is also what you want for the landing template, or say which step you want to review yourself.

---

## Findings from the first browser check

Written during PR A (2026-10-16), after building `packages/landing`. Tools: the built-in browser pane of the Claude desktop app (Chromium) for measurements, clicks and key presses at 1440, 800, 768, 767 and 390px; headless Microsoft Edge driven over the DevTools protocol for full-page screenshots at those widths and for `prefers-reduced-motion` emulation (the pane has no switch for it). The pane was hidden and small (509px wide), so its own screenshots were only usable at 390px; wider checks used DOM measurements and the Edge screenshots. Headless Edge cannot go below about 500px by window flag, so the 390px screenshots came from the pane or from CDP device emulation.

**Needed a fix (all in `App.css`):**
- Section headings and their lead sentences were centred under a `SectionTitle` that draws its caption and rule from the left edge, which looked misaligned. Headings, leads, the billing switch, the logo list and the steps are now left-aligned with the title.
- At 800px the three plan cards are about 232px wide and the button labels ("Start free trial", "Contact sales") wrapped to two lines, giving buttons of 48, 72 and 76px. Fixed by tightening the card padding and the label between `md` and `lg` (kept three columns; the plan's alternative of moving the breakpoint to 64rem was not needed). Blurbs got a two-line minimum height there so the prices line up.
- The filled (primary) Button has no border and the outlined one has, so side-by-side buttons differed by 4px (hero at `md` size 44 vs 48; Pro vs its neighbours 36 vs 40). A `min-height` on the hero and plan buttons levels them. (The first version used 2.75rem for the plan buttons, which still left Pro 44px against 48px from `lg` up; review nit. At 3rem the three plan buttons measure 48/48/48px at 768, 800, 1024, 1100, 1440 and 390px, and the hero buttons 48/48 below `lg` and 56/56 from it.)
- The FAQ list and the signup form were narrower columns centred on the page, so at 1440px their left edge (and their headings') sat about 160px to the right of the other sections. They are now left-aligned under a full-width heading; at 1440px the features, logos, steps, FAQ and form all start at x=161.

**Checked and held:**
- Contrast, computed from the installed 2.8.0 stylesheet and `orange.css`: accent on base 7.27:1, accent on surface 5.70:1, base on accent 7.27:1, muted on base 6.02:1, muted on surface 4.72:1, success on base 12.83:1, primary on base 4.39:1 (the far end of the headline gradient; large text, so the 3:1 bar applies).
- No stray cyan or yellow in any computed colour property on the page at rest, with the menu closed. The only magenta text is the Steps chevrons. **The open mobile menu is an exception:** the Drawer's border runs the library's `rgbGlow` animation, and in 2.8.0's stylesheet the `@keyframes rgbGlow` block that wins uses literal hex (`#ff005d`, `#00fff9`, `#0f8`, `#fffb00`), not the tokens, so the border cycles magenta, cyan, green and yellow and never shows the orange override (under `prefers-reduced-motion` it is a steady `--color-accent`, i.e. orange). An earlier version of this section said the opposite; that was wrong, because the one-off colour scan happened to sample the open menu at a magenta moment. Reported as CyberUI#124. The Drawer's "Menu" title is `--color-primary` on `--color-surface`, 3.45:1 at 18px semibold (reported as CyberUI#125); this template does not override either.
- 1440px: sticky header 65px tall (4rem plus its border), no Menu button, hero in two columns, features and plans in three columns, hero buttons 56px (the 2.8.0 responsive `size` works), horizontal Steps. Page `scrollWidth` 1425 (scrollbar).
- 800px: `scrollWidth` 785 (scrollbar), no element past the viewport, header links shown and no Menu button, hero one column, features two columns, horizontal Steps, plan cards 232px with nothing clipped.
- 768px and 767px: at 768 the links, three plan columns and horizontal Steps; at 767 the Menu button, one plan column and vertical Steps. The planner's note that Steps once showed vertical at exactly 768px did not reproduce, from a fresh load, after a resize from 390, and after a resize from 800. `Steps` decides with `window.innerWidth >= 768` and a resize listener, the same threshold as `48rem` in the stylesheet.
- 390px: `scrollWidth` 390, no element past the viewport, header is the wordmark and Menu only, hero buttons stack, the terminal's longest line was cut off ("my-app.tessera.exam", 333px of content in a 309px card; review nit, fixed: 13px type and wrapping below 30rem, now 308px in 308px with every line one row high), figures wrap, plans in one column in the order Hobby, Pro, Team, Steps vertical.
- Menu (390px): opens a right-hand dialog with "Menu", four links and the trial button, with focus inside it and `body` scroll locked. Clicking "Pricing" closes it, the scroll lands with the section top 64px under the header (clear of the sticky header, thanks to `scroll-margin-top`), `location.hash` stays empty, focus is on the section and the body scroll lock is released. Escape closes it, also when focus has left the dialog.
- Billing switch changes every price and caption and back; FAQ: Enter and Space open an answer, Down and End move between questions, one open at a time; form: an empty submit shows the error and keeps focus on the field, a valid address (typed, Enter) clears the field and shows the confirmation in the polite status line.
- Keyboard from the top: the first stop is the skip link (on screen), then the wordmark, four links, the header button and the hero buttons. Links show the browser's focus ring; the library's buttons show a 2px accent ring at half opacity plus their glow. The ring on buttons is visible but low in emphasis; not changed here.
- Reduced motion (headless Edge, CDP emulation): the hero has one `hero-in` animation without it and none with it; a nav click moves `scrollY` 78px after 60ms (smooth) without the emulation and to its final 1856px at once with it; `location.hash` empty in both.

**Library findings, reproduced and filed:** `Toggle` without an `id` has no accessible name (CyberUI#120); `Input`'s error is not announced (#121); `Steps` glyphs are not `aria-hidden` (#122); `Drawer` does not trap Tab although it is `aria-modal` (#123; Tab left the open menu for the skip link and the header); the `Drawer`'s border animation hard-codes its colours (#124) and its title is 3.45:1 on its surface (#125). Not filed: `Steps` has no static mode (a documented behaviour, a feature request, not reproduced as a defect).

**Not checked:** a screen reader; Firefox and Safari; a real touch device or a real phone (390px was an emulated viewport); hover and focus states in the colour scan; the live preview inside the site's dialog and iframe (PR B); `Modal`'s focus behaviour.

---

## Findings from checking the published page

Written during PR B (2026-10-17). Tools: the site's dev server (`vite`, port 5200) after `pnpm --filter cyberui-templates-site run sync-templates` (all three real builds), driven in headless Microsoft Edge over the DevTools protocol at 1440x900 and 390x844 (the latter with mobile emulation), with `prefers-reduced-motion` emulated both ways. The built-in browser pane was not used.

**Held, no fix needed:**
- `#/templates` shows three sections in order (monitoring, agent-panel, landing) under one h1 "Templates". The landing hero's `--color-accent` computes to `#ff8a3d`; the fit copy and the Examples compute to the library default and the neutral scope, so the orange does not leak out of the hero. Badge reads "Orange accent". No horizontal scroll at 1440 (scrollbar only) or 390 (`scrollWidth` 390).
- Home says "3 templates ready." and lists none by name.
- "Run the live demo" opens `#/templates/landing`; the orange page runs inside the dialog (iframe 1262x659 at 1440, 356x693 at 390; the dialog is full-screen at 390). The Live preview and Code tabs switch without reloading the preview (a marker set on the iframe's window survived). The Code tab shows the six principles and the six folders.
- **Spec §12's open question: `scrollIntoView` inside an iframe inside a `<dialog>`.** Clicking "Pricing" in the preview's header scrolled only the preview (`scrollY` 0 to 1856 at 1440; 0 to 3277 at 390 through the Drawer menu). The site's `scrollY` (3552 and 3054), the dialog's and the dialog body's `scrollTop` (0) and the site's hash (`#/templates/landing`) were unchanged, and the section landed 64px under the 65px sticky header. The `window.scrollTo` fallback in the plan was therefore **not** needed and `scrollToSection.ts` is untouched.
- The preview's header stays at the top while scrolling it (`top` 0 after scrolling 1200px). Inside the preview: the billing switch changes every price ($25 and $75 become $20 and $60 a month, with yearly totals), an FAQ item opens, "bob@" shows "Enter a valid email address.", a valid address shows "Thanks, you're on the list. This is a demo, so nothing was sent.". At 390 the Menu button opens the Drawer inside the preview with the four links and the trial button, and its "Pricing" link scrolls the preview (whether the Drawer closes afterwards was not asserted in this run; PR A checked it outside the dialog).
- Closing: Esc with focus on the dialog's close button, Esc after a real click inside the running preview (the site forwards it), the close button, a backdrop click and the browser's Back button all close the dialog and leave `#/templates`; loading `#/templates/landing` directly reopens it.
- Reduced motion: the dialog's `preview-dialog-in` animation is absent (opacity 1 at once), the preview has no `hero-in` animation, and a nav click lands at its final scroll position at once (2621 after 60ms) instead of 72.
- The Copy start prompt text names `npx --yes tiged patrickkuei/cyberui-templates/packages/landing my-app`, and the terminal fold shows the same command.

**Not checked:** the real production deploy (only happens after merge); `npx tiged patrickkuei/cyberui-templates/packages/landing` against the published repo (cannot run before merge); what the Copy start prompt button actually puts on the clipboard (the prompt text on the page was read, the clipboard was not); Firefox, Safari, a real phone, a screen reader.
