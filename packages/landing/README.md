# Tessera landing page (template)

A one-page marketing site for a product launch (a hero, a logo strip, features, how it works, pricing with a monthly/yearly switch, an FAQ, a signup form and a footer) built with [cyberui-2045](https://www.npmjs.com/package/cyberui-2045). Tessera is a fictional deploy platform: swap in your own product by editing the files in `src/data/`.

**Nothing here is connected to anything: no signup is sent, no plan is billed, no link goes anywhere.** The page says so once, in a line in the footer ("Template demo: Tessera is fictional and the form sends nothing."). Delete that line when you make the page real.

- **Real:** the Monthly/Yearly switch (it changes every price and caption), the FAQ (one answer open at a time), the menu that replaces the header links on narrow screens, and the signup form's own validation (a malformed email shows an error and does not "send").
- **Mock:** the signup form (a valid email shows a confirmation and nothing is sent), every "Start free trial", "Get started" and "Contact sales" button (they scroll to the signup form), all the footer links (they do nothing), and every number, logo name, plan, price and answer. The company names in the logo strip are invented placeholders; do not ship them.
- **Images:** none. The visuals are cyberui-2045 components, CSS and inline SVG, so the package has no image files to replace or license.

```bash
npm install && npm run dev   # start the dev server
npm run build                # type-check and build to dist/
npm test                     # run the test suite
```

Requires Node 20.19 or newer.

## Re-theming

The orange accent is two color tokens in [src/theme/orange.css](src/theme/orange.css), imported right after the library's stylesheet in [src/main.tsx](src/main.tsx). cyberui-2045's components read those tokens, so changing the two values re-themes the whole page. `--color-primary` (magenta, the far end of the headline's gradient) is left alone on purpose. When you pick a new accent, check that it reaches 4.5:1 contrast on both `--color-base` and `--color-surface`; the file's comment has the numbers for this orange, and says why it sits close to the library's `warning` colour. One thing to know when you add your own `Card`: the library gives it magenta body text by default, so give it the `card-surface` class as the existing cards do (see [src/App.css](src/App.css)).

## Where your content goes

Everything the page says comes from four files, so most of "make it mine" is a data edit:

- [src/data/product.ts](src/data/product.ts): the product name, headline, hero text, the three figures, the logo names, the three steps, every section's heading, the signup copy, the nav labels, the footer columns and the demo line.
- [src/data/features.ts](src/data/features.ts): the six feature cards (an icon name, a title, two lines).
- [src/data/plans.ts](src/data/plans.ts): the plans, each with a price for every billing period.
- [src/data/faq.ts](src/data/faq.ts): the questions and answers.

To make the signup real, replace the comment block in `onSubmit` in [src/components/SignupForm.tsx](src/components/SignupForm.tsx) with your request, and show the confirmation only after it succeeds. To make the plan buttons real, change `onSelect` in [src/components/PricingSection.tsx](src/components/PricingSection.tsx) to go to checkout. To add a section, add its id to `SECTIONS` in [src/sections.ts](src/sections.ts): the compiler then lists what is still missing (a component in `src/App.tsx`, a heading in `SECTION_COPY` and a nav decision in `NAV_LABELS`, both in `src/data/product.ts`).

Before you publish, replace the title, description and social tags in [index.html](index.html). They describe the fictional product, and link previews read them, not your React components.

Two things that are deliberate and easy to trip over. Nav links scroll with `scrollIntoView` and never write `location.hash` (see [src/utils/scrollToSection.ts](src/utils/scrollToSection.ts)), so the page behaves the same inside an iframe or under any deploy subpath. And pressing Escape closes the mobile menu; if you embed this page in another page that also closes on Escape, both close.

## Principles this code follows

| Principle | Where to see it |
|---|---|
| **Single source of truth** | The order of the sections is the `SECTIONS` list in [src/sections.ts](src/sections.ts). The advertised yearly saving is one number, `YEARLY_SAVING_PCT` in [src/data/plans.ts](src/data/plans.ts), which the "Save 20%" tag displays and [src/data/plans.test.ts](src/data/plans.test.ts) checks every paid plan against. |
| **DRY** | Every section's heading and lead sentence go through one component, [src/components/SectionHeading.tsx](src/components/SectionHeading.tsx), which reads its words from `SECTION_COPY`. Every `<section>`'s id, label and focus behavior come from `sectionProps` in [src/sections.ts](src/sections.ts). |
| **Typed and exhaustive** | `Record<SectionId, …>` maps in [src/App.tsx](src/App.tsx) and [src/data/product.ts](src/data/product.ts) turn "added a section but forgot its component, heading or nav decision" into a compile error. Plan prices are a `Record<BillingPeriod, number>` in [src/data/plans.ts](src/data/plans.ts), so a new billing period fails to compile until every plan has a price for it. |
| **No inline styles, no stray colors** | All styling is in CSS classes. [src/noInlineStyles.test.ts](src/noInlineStyles.test.ts) fails if a `style={...}` prop appears, and [src/noHexColors.test.ts](src/noHexColors.test.ts) fails if any stylesheet other than `orange.css` contains a hex color. |
| **Content as data** | The page's words live in [src/data/](src/data/), not in JSX. Components take a plan, a feature or a question as a prop and render it. |
| **Tested** | A test file sits next to each component, data file and helper, covering the behavior (the billing switch, the FAQ, the menu, the form's validation and confirmation, the scroll-to-section links) rather than the markup. The exceptions are `src/main.tsx`, `src/sections.ts` (exercised through [src/App.test.tsx](src/App.test.tsx)) and the stylesheets. |
