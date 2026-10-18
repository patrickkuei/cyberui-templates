# Mobile-First App Template (`packages/mobile-app`) — Design Spec

**Date:** 2026-10-17 (revised 2026-10-18)
**Status:** Approved by the owner on 2026-10-18. The owner chose a **home device controller** for Q1 (the first draft proposed a pantry tracker; the owner asked whether it suited cyberui and picked this instead), then answered Q2 to Q10 with "go your recommend", so every "proposed" decision below is now decided, including the placeholder name "Kestrel" and the site name "Mobile App". See "Owner answers" at the end.
**Redesign (2026-10-18, after shipping):** the owner looked at the running app and decided on a redesign. The section "Redesign, 2026-10-18" below records what was decided and supersedes the screens, the device sheet, the Scenes tab, the Drawer and the copy described in the sections it names; those sections stay, marked "Superseded", because they record why the first version was built the way it was.
**Plan:** [docs/superpowers/plans/2026-10-18-mobile-app.md](../plans/2026-10-18-mobile-app.md) (20 tasks: PR A is Tasks 1-14, PR B is Tasks 15-20), shipped as PRs #67, #68 and #69. **Redesign plan:** [docs/superpowers/plans/2026-10-19-mobile-app-redesign.md](../plans/2026-10-19-mobile-app-redesign.md) (PR C is the package, PR D is the site).
**Issue:** [#48](https://github.com/patrickkuei/cyberui-templates/issues/48) (item 4 of tracking issue [#1](https://github.com/patrickkuei/cyberui-templates/issues/1)).
**Builds on:** [2026-09-27-cyberui-showcase-design.md](2026-09-27-cyberui-showcase-design.md) (self-contained packages, accent-hue theming, one combined deploy), [2026-10-05-templates-page-design.md](2026-10-05-templates-page-design.md) (the `/templates` page every template is published through), [2026-10-06-agent-panel-design.md](2026-10-06-agent-panel-design.md) (hash routes, the honesty standard, the phone fixes that came late) and [2026-10-16-landing-page-design.md](2026-10-16-landing-page-design.md), the closest model for this document's shape, its PR split and its publishing path (§10), which are reused here without being repeated in full.
**Baseline:** cyberui-2045 **2.8.0** (what the three shipped templates use; it is also the latest on npm). Everything about the library below was read from the published 2.8.0 package (`npm pack cyberui-2045@2.8.0`, its typings, compiled components and stylesheet), not from memory.

## Redesign, 2026-10-18

**Status:** decided by the owner on 2026-10-18, after a design discussion, with the first version already shipped (PR #67 this spec and its plan, #68 the package, #69 the site). The template is redesigned in place: same slug (`mobile-app`), same package, same site entry, same fiction ("Kestrel", a home device controller), same accent. **Nothing in this section is open**; where the plan found a real contradiction or a gap it says so under "Found while planning" below, and does not reopen a decision.

How to read the rest of this document: the sections from "Decisions I made" to "Out of scope" describe the first version. Each one that no longer describes the template carries a "Superseded (2026-10-18 redesign)" note that says what replaced it and where. Nothing was deleted. The "Findings" sections at the end are measurements of the first version and stay as the record of it; the redesign appends its own.

### What the owner said, and why

The owner looked at the running app and said the design is bad. Four things were named, and the first is a measured defect, not a taste:

1. **The switch is broken.** On Settings the `Toggle`'s knob sits 6px too high and pokes out of the track. The library draws the knob (the track's `::after`, `absolute; top: 2px`) against the `<label>` that wraps the switch, because it makes the label `relative` and leaves the track `static`. This template's `.touch-switch label { min-height: var(--touch) }` (spec §3.5, the 44px rule) stretched the label to 44px around a 32px track, so the knob rode at the label's top. Reproduced before the redesign was planned (headless Edge 155, 390px touch viewport, the shipped build): label 44px high, track 32px high, the knob's vertical centre 6.0px above the track's, measured from the CSS and from the pixels of a screenshot. Adding `position: relative` to the track put it at 0.0px. The first browser check never looked at the knob, only at the sizes; see "Findings from the redesign" (to be added by PR C) for the guard that now does.
2. **A list of identical cards.** Every device was the same bordered card with the same parts in the same places: an icon, a name, a status badge, a detail and a switch. Nothing said what mattered, and an off lamp and a lamp at 70% looked alike except for a 32px switch.
3. **A status badge on everything.** "Online" in green on every healthy device made the one exception (a low battery, an offline hub) the least visible thing on screen.
4. **A tiny switch.** The library's `Toggle` is 64 by 32px at its largest, the biggest thing on the row was the row, and the control that matters most on a phone was the smallest.

The cause of the first, which the owner did not name: spec §3.5 asked for a 44px hit area as a wrapper around controls that stay small, and the one place that wrapper changes the control's own layout (the switch's label) was never looked at, only its size was measured.

### What the owner showed, and what was taken from it

The owner showed three smart-home app designs. **Principles were taken, not looks.** What carried over from them: **place before device** (you move around by room, and rooms come with counts); **two depths** (a home screen to glance at, one full page per device to control); a **hero object whose appearance shows its state** (the thing you control is drawn big, and drawn differently when it is on); **big numerals** (the value is the typography); **an accent that means "on"**; and an **inline shortcut with the detail one tap deeper** (flip it from the list, open it to do more). What did **not** carry over: photographs and illustrations (this package ships no images, and the repo's rule is that a template has none to license), soft glass and blur, charts (the redesign has none in version 1), profile and account screens, and small switches, which were exactly what was wrong.

### The principles

- **Place before device.** Rooms are navigation: a chip per room with its count, rooms as headings on Home, and a Rooms screen.
- **Two depths.** Home is for a glance and a quick switch. A device's own page is for everything else.
- **Light is state.** A device that is on is lit in the accent; one that is off is dark. There is no "Online" badge anywhere. Status shows only by exception: a small amber mark for a low battery or a weak signal, a dashed muted row for a link that is down, and one sentence at the top of Home ("5 on, 1 needs attention"; needs attention means a weak or lost link, or a low battery).
- **Numbers are the typography.** One big tabular numeral per thing. Sentence case, no all-caps labels, no meta strings joined with dots except where something truly is a list.
- **Boldness in one place.** Each device's drawing is its own hand-drawn inline SVG (four kinds: light, plug, thermostat, sensor; no images and no binary assets), and it really glows in proportion to the device's level. Everything else is quiet: buttons are flat.
- **Motion only answers a tap,** and is off under `prefers-reduced-motion`.
- **Fake data is fine, as in the monitoring template, but there are no charts in version 1.** The app still says, once and persistently, what is mock (the "Demo" badge, the README, and a line on the Scan screen), and still contains no network, Bluetooth or storage code (the `noNetworkOrStorage` guard stays).

### Screens and routes

Hash routes with the `ROUTES` tuple pattern kept. The bottom nav is **Home | Rooms | Settings**. The **Scenes tab and the bottom sheet (`Drawer`) are removed.**

| Route | Screen | What it is |
|---|---|---|
| `#/devices` | **Home** (tab) | One summary sentence. Room filter chips with counts (All, Living room, ...), scrolling sideways inside their own row. Devices grouped under sentence-case room headings with a count and a "Turn off" button for the whole room ("Living room: 2 of 3 on"). Each device is a **row**: a 48px glyph that is itself the quick power button (lit when on), the name, one value at the right (70%, On, 21.5°), and for a dimmable a thin level bar under the row. Tapping the rest of the row opens the device page. The glyph button and the link are siblings, never nested. A device that is lost or offline is a dashed, muted row with the word "Lost" or "Offline"; a low battery gets a small amber mark; a sensor shows its reading as the whole row and has no power button. "Add device" at the end. |
| `#/device/:id` | **Device page** (pushed) | A large glowing glyph, the name, the room, one big numeral. **Light:** a wide `Slider`, a full-width Power button, and a "Scenes" row of fixed presets (Reading 80, Movie 25, Night 5). **Thermostat:** the target ("19.5°") with 48px minus and plus buttons and a `Slider` (the unit follows Settings, stored in °C), and fixed presets Heat, Eco, Off. **Plug:** a Power button only. **Sensor:** the reading, and a plain note that there is nothing to control. **Every device:** a Link panel with four-level signal bars, latency in ms, and Disconnect (or Reconnect when the link is down), and Remove device at the bottom. A device that is lost or offline shows a dim glyph, the sentence "Lost. Controls are unavailable.", Reconnect and Remove, and nothing else. |
| `#/rooms` | **Rooms** (tab) | A card per room: how many devices are on, a derived fake power figure in W (each light and plug carries a fake wattage in the data; the room's total is derived, never stored), a "Turn off" button, and a chevron that opens Home filtered to that room. An "Add room" button. |
| `#/add-room` | **Add room** (pushed) | One field, the name (no icon picker). Required, unique ignoring case, a maximum length. A room can be removed only while it is empty, with a plain message otherwise. |
| `#/add` | **Add device / Connect** (pushed) | Scan, Pick, Link, then name and room. The scan starts **only after a tap** (a button), shows a progress bar and a pulse, and under `prefers-reduced-motion` shows a static "Scanning…" line instead of motion; the result is a fixed list of "nearby" devices with signal bars. Pick: rows of 44px or more, one tap links. Link: a checklist of handshake steps (found, pairing code, securing link, ready) with a progress bar. A manual fallback, "Enter a code instead", keeps the six-letter-or-digit pairing code form. A line on the Scan screen says the scan is scripted and nothing is discovered. |
| `#/settings` | **Settings** (tab) | The same content as before (unit, the two flags, About with the disclosure), with standard-size labelled switches. |

**The device page hides the bottom nav** (the owner left this to the plan). Reason: it is the second depth, with its own Back, and a full-width Power button and a row of presets at the bottom of a short phone screen should not compete with a second bar; it is the same rule Add device already followed, and it gives back 56px of a 568px screen at 320. The cost is that moving to another room takes a Back first, which is what a pushed page means.

**Connect lives behind a small adapter**, `src/connection/`, exposing `scan()` and `link(id)` (promises with progress callbacks and an `AbortSignal`) and shipping a scripted implementation. It is commented as the seam where a real Web Bluetooth, MQTT or WebSocket implementation goes (the pattern-to-copy rule in the repo `CLAUDE.md`). **Reconnect uses the same Link steps.** Outcomes are scripted per device in the data, and **exactly one device deliberately fails** ("No response from the hub", the Hall light, which is also the one device that starts lost) so the failure state is visible without breaking anything. The tests run the scan and the link on fake timers.

### The look in numbers, and the theme

- **Accent stays blue `#5b9cff`**; the theme file's values do not change (its comment is reworded, since it described the status badges that are gone). The glyph's glow uses tokens only (no hex literals; colours through CSS variables), so the `noHexColors` guard still holds and a re-theme reaches the glow.
- **New contrast facts** (computed from the 2.8.0 tokens and measured in the browser by the plan): text pairs are unchanged and pass 4.5:1; the amber and red marks pass on base and surface; the one library failure (`Button variant="danger"` text on its own surface, 4.13:1, CyberUI#128) is still there. A glyph's lines sit on the glow it makes, so they need 3:1 as a graphic: the text colour (`--color-default`) was 2.45:1 at the brightest glow and fails, white (`--color-white`) is 3.23:1, and the glow is capped (accent at 80% under a 40% body) to keep it there.
- **The switch is fixed** for the Settings toggles by making the track the knob's positioned ancestor (`.touch-switch input + div { position: relative }`), keeping the 44px label as the hit area. A guard test of the `phoneRules` kind keeps the rule, and a browser measurement (the knob's centre from the CSS and from a screenshot's pixels against the track's, at 320, 390 and 800px, on and off) is the check that actually sees it. Whether a small CyberUI issue is warranted is decided in the plan's findings task; nothing is filed from here.

### The Drawer is no longer used

The device sheet was the only user. The README's "Known limits" for CyberUI#123, #124, #125 and #130 (all `Drawer`) are reworded to say the template no longer depends on `Drawer`; the issues stay open and valid, and a forker who adds a `Drawer` will meet them. The other cited issues are kept and re-checked against `gh issue view`. The old device sheet, the Scenes data and screen, the scene tests and every comment about the Drawer are removed or rewritten, with no dead code left.

### What this changes in the rest of the document

| Original | What replaced it |
|---|---|
| §1 and §2 (goal, fiction) | Unchanged. |
| §3.1 routes | The tuple is `['devices', 'device', 'rooms', 'settings', 'add', 'add-room']`; `device` takes the device id as its second path segment. |
| §3.2 screens, the device sheet | The table above. |
| §3.3 bottom nav | Three tabs, Home, Rooms and Settings; hidden on every pushed screen (the device page, Add device, Add room). |
| §3.4 swipe | Still no swipe (Q4 stands). The bottom sheet half of Q4 is replaced by the device page. |
| §3.5 phone rules | All stay, with two changes: the bottom-sheet rules (safe-area padding of the sheet, the Drawer's glow, a `Slider` inside a scrolling sheet) no longer apply, and a rule is added for the switch's knob (above). |
| §3.6 what is mock | Three signals plus the README: the Demo badge, the Settings sentence, and a line on the Scan screen. The confirmation after pairing no longer carries the demo sentence (it only says what was added). |
| §5 data | Rooms are data and can be added and removed; devices carry a link state, a signal, a latency and (lights and plugs) a wattage; presets and the "nearby" list are data; scenes are gone. |
| §7 `Drawer` rows | The template no longer uses it (above). §7.1's four feature requests stand (#131 to #134 are filed). |
| §8 testing | The same strategy, with the scan and the link tested on fake timers and the glow, the summary figures and the rooms covered by tests. |
| §10 and §11 | See the notes at those sections: a new Code tab, new copy, a new screenshot, and **two new persona interviews**, because the two published examples were written for the first version (they mention scenes, the Add device form and the bottom sheet) and would now be stale. |

### Found while planning (none reopens a decision)

- **CI puts the Code tab's data into PR C, not PR D.** The `code-tab` job checks every excerpt in `packages/site/src/content/codeTabs.json` against the package on every pull request, and four of the first version's six excerpts no longer match the redesigned package (the reducer's header comment, the `ROUTES` tuple, the Add device test and the starting devices; checked while planning). A package-only PR C would therefore be red. The JSON (data only, regenerated by a script from the real files) moves into PR C; PR D keeps the tagline and copy, the screenshot and the two examples. Between the two merges the live site shows the new app under the old tagline and the old examples, so PR D should follow at once.
- **"Lost" and "Offline" are two states, not one.** The owner's text uses both words, so a link that dropped by itself is **lost** and one the person disconnected is **offline**. Both count as "needs attention" and both give the same dashed row and the same page; the sentence reads "Lost. Controls are unavailable." or "Offline. Controls are unavailable."
- **A plug has no level and a sensor has no power, but every glyph must glow.** The glow level is defined per kind: a light by its level, a plug at one fixed brightness while on, a thermostat by its target across its range, a sensor a faint steady glow while it is reachable, and anything whose link is down dark. A light's wattage is also scaled by its level, so dimming a lamp lowers its room's figure; the owner said only that the room's total is derived.
- **A room can only be emptied by removing its devices.** There is no way to move a device to another room (not asked for), so the plain message for a room that still has devices can only say "Remove them first".
- **The library fights two of the principles and the plan overrides it, with comments:** `Button` is uppercase and glows at rest (sentence case and "boldness in one place"), and it, `Toggle`, `Slider`, `RadioGroup`, `Input` and `Badge` all animate under `prefers-reduced-motion` (the plan measures 0.1s to 0.3s). One rule each in the stylesheet undoes them.
- **The library's `accent` `Slider` fills with a gradient that ends in magenta,** which contradicts "accent means on"; the plan sets a solid accent fill.
- **Row values read "70%", not "70 %"** (the owner's examples have a space; a space before a percent sign reads as a typo in English).
- **The device page's numeral for a plug is its draw in watts** ("85 W" while on), because a plug has nothing else to say.
- **Smaller readings** (a level or a target also switches a light or a thermostat on, so a slider never shows a level on a dark glyph; the room filter lives in app state so Rooms can set it and Home can read it; a notice persists until it is dismissed or the person moves to another tab; one reduced-motion rule switches off the library's transitions too) are listed with the others in the plan's Self-review, under "Deviations and readings".

## Decisions I made, and what the owner must answer

> **Superseded in part (2026-10-18 redesign).** Proposed decisions 3 (the four screens), 4 (the route list), 6 (the bottom sheet) and 8 (the pairing confirmation) below are replaced by "Redesign, 2026-10-18" above. The rest stands, including decision 13 (the phone frame); only the screenshot that goes with it is retaken.

Decided by the owner:

- **Fiction (Q1, 2026-10-18): a home device controller.** Reasons, so a later reader knows why: the neon look suits a control surface better than a household list; its core controls (`Toggle`, `Slider`, `Badge`) are exactly the ones that fall below 44px on a phone in 2.8.0, so the template stresses the library's small-screen gaps harder than any other candidate; its status colours (online, low battery, offline) are real and meaningful; and what is mock is easy to state (it controls nothing). [§2]
- **Upstream feature requests (2026-10-18):** the phone gaps this template exposes get filed on patrickkuei/CyberUI as feature requests. See §7.1 for the list and for when they are filed.

Proposed decisions (each cheap to reverse; the section with the reasoning is in brackets):

1. **Slug and package name:** `mobile-app` / `mobile-app-template`, site name "Mobile App". [§2]
2. **The device controller is called "Kestrel"** (a placeholder name, see §2). [§2]
3. **Four screens, three of them tabs:** Devices (a list with a switch on each row), Scenes (one-tap presets), Settings, plus **Add device** (a pairing form) pushed on top of Devices. The primary flow is Devices, then Add device, then back to Devices with the new device in the list. [§3.2]
4. **Hash routes, like monitoring and agent-panel:** `#/devices`, `#/scenes`, `#/settings`, `#/add`, built on the `ROUTES = [...] as const` tuple so a fifth screen cannot be added without its title and component. Back on a phone then closes Add device, which is what a phone user expects. [§3.1]
5. **Bottom navigation is hand-built** from native links and the template's own CSS. cyberui-2045 has no bottom bar; `TabNavigation` is a top tab strip. This is an upstream feature request (§7.1), not something to work around quietly. [§3.3, §7]
6. **Tap, not swipe.** A row's switch is on the row; tapping the row opens a bottom sheet (`Drawer side="bottom"`) with the device's controls. cyberui-2045 has no gesture support (2.8.0 is the latest release and has none), so swipe would mean template-owned pointer-event code. [§3.4, Q4]
7. **Nothing is saved, nothing is sent.** State lives in memory (one reducer); a reload restores the starting data. [§5, Q5]
8. **One persistent signal for what is mock:** a small "Demo" badge in the app bar, plus the README, plus the confirmation after pairing a device. No repeated "(simulated)" labels. [§3.6, Q6]
9. **No images, no new runtime dependency** beyond `react`, `react-dom` and `cyberui-2045`: inline SVG icons (the landing and agent-panel `icons/` pattern), no router library, no chart library, and no Bluetooth, camera or network code at all. [§9]
10. **Accent: blue `#5b9cff`**, a two-token override in one file, exactly as `orange.css` and `violet.css` do it. [§4, Q2]
11. **Two pull requests** as for landing: PR A is the package (with the browser check at 320, 390 and 800px), PR B is the site entry, copy, two verbatim role-play examples, Code tab, screenshot and wiring. [§10]
12. **`notFor` is written about this template's own limits** (owner rule, 2026-10-16), and may be omitted. [§11]
13. **The site gets one small new capability, an optional phone-sized frame for the live preview**, because the preview dialog is about 1260px wide and the template would otherwise be shown at its widest layout. This is new site behaviour, so it is a question, not a given. [§10.1, Q3]

Open questions: see the end of this document. Q-numbers are referenced from the sections above.

## 1. Goal

Ship the fourth template: a self-contained **app designed for a phone first**, with the things a phone app has and a dashboard or a landing page does not: bottom navigation, a screen you push and pop, a list you act on with a thumb, a form that has to work with an on-screen keyboard, and layout that respects the notch, the home indicator and the browser's collapsing toolbar. It is also, deliberately, the template that **shakes out the library's small-screen behaviour** (issue #48): the agent panel's phone bugs were found late and by hand, so here 320 to 390px is the main case and anything the library gets wrong there goes upstream to patrickkuei/CyberUI.

Success, in the repo's terms (spec 2026-10-05 §1):
1. A visitor can tell within one preview whether this is the shape of thing they want (a small control app used one-handed), and what is fake in it.
2. A forker gets a package that runs after `npx tiged … my-app && cd my-app && npm install && npm run dev` with no other setup, and whose code reads as patterns to copy (the route tuple, the reducer, the touch-target and safe-area rules).
3. It follows the same path to publication as the first three and adds as little new site machinery as possible (§10).
4. It holds at **320, 390 and 800px**, checked in a real browser at each width, not inferred from tests.

**Not in scope:** talking to real devices (no Bluetooth, no network, no MQTT or Matter), accounts, sync, push notifications, camera or QR scanning, offline support or a service worker, installing as a PWA (no manifest), localStorage persistence, i18n, a light theme, native-app packaging, any change to cyberui-2045 (findings go to patrickkuei/CyberUI as issues).

## 2. What the template is for

A person (a developer, a hobbyist, a designer) who wants to build the front end of a small control app that people will hold in one hand, and wants a starting point that already solves the phone-specific parts in this library's look. The template answers "what does a cyberui app feel like in a thumb's reach?" with a working app.

Fiction (decided, Q1): **"Kestrel"**, a hub that controls a household's devices: lights, plugs, a thermostat and sensors. Reasons it fits this library and this issue:
- A control surface is where cyberpunk styling reads naturally (state, glow, status), unlike a cosy household list.
- It is built from the controls that matter most on a phone: a `Toggle` on every row, a `Slider` for brightness and temperature, `Badge` for status. In 2.8.0 `Toggle` renders 28px high and `Slider` is a thin track, so the template exercises the library's weakest phone spots (§3.5).
- Real status colours: online (success green), low battery (warning amber), offline (error red), so the accent has to stay clear of them (§4).
- It does not overlap the monitoring (AI metrics), agent-panel (AI assistant) or landing (developer-tool marketing) fictions, though monitoring is also a "status" template; the difference is that here the user acts on devices with a thumb.
- What is mock is easy to say in one sentence: it controls nothing.

"Kestrel" is a placeholder, not checked against trademarks beyond the repo's rule that no real brand appears; a better name is welcome. Device names are generic ("Desk lamp", "Hall thermostat"), with no vendor, protocol or product names.

Alternatives considered: a **pantry tracker** (the first draft; its status colours are good, but it fits the neon look poorly and does not stress `Toggle` and `Slider`), a **habit tracker** (the most expected, but its "done" state is a green tick next to a lime accent and it has few states to show), a **delivery tracker** (a natural fit for `Steps`, but a live map is the most "looks real" thing and needs the most disclaimers).

Package folder `packages/mobile-app`, pnpm name `mobile-app-template`, site name "Mobile App" (the name is still open, Q1's second half).

## 3. The experience

### 3.1 Shape and routing

> **Superseded in part (2026-10-18 redesign).** The tuple is now `['devices', 'device', 'rooms', 'settings', 'add', 'add-room']` (a device's page is `#/device/:id`), and Home is `#/devices`. The pattern, the default route, the fallback, the Back behaviour and the focus rule below stand; "Add device" is one of three pushed screens now (`leaveAdd` became `leave`).

One app shell: an app bar at the top, the screen in the middle, bottom navigation at the foot. Routes are hash routes via a `useHashRoute` hook with `ROUTES = ['devices', 'scenes', 'settings', 'add'] as const` and `Route = (typeof ROUTES)[number]`, with `Record<Route, …>` maps for titles and screens, the same pattern monitoring and agent-panel document in their source (CLAUDE.md names it). The default route is `devices`. An unknown hash falls back to `devices`.

Why hash routes here, unlike landing: this is a multi-screen app, and the phone's Back must pop **Add device** rather than leave the page. The site's preview dialog already copes with an iframe that pushes hash entries (spec 2026-10-05, `usePreviewNav`), as monitoring and agent-panel prove.

Focus and announcements: on a route change focus moves to the screen's `h1` (the route title) so a keyboard or screen-reader user is not left on the link they pressed. This is the one place the template does more than the others, and gets a comment.

### 3.2 Screens (proposed, Q7)

> **Superseded (2026-10-18 redesign).** The table and "The device sheet" below describe the first version: a Devices list of identical rows with a status badge and a switch, a pushed Add device form, a Scenes tab and a bottom sheet. They are replaced by "Screens and routes" in "Redesign, 2026-10-18" (Home, a device page, Rooms, Add room, Connect, Settings). Kept as the record of what shipped in #68.

| # | Screen | What it shows | cyberui-2045 pieces (to confirm in the plan against the 2.8.0 manifest) |
|---|---|---|---|
| 1 | **Devices** (tab) | Devices grouped by room (Living room, Bedroom, Hall). Each row: icon, name, a status `Badge` (Online, Low battery, Offline) and a `Toggle` for on/off; sensors have no toggle and show a reading instead. Offline devices show a disabled toggle. An "Add device" button reachable with the thumb. Tapping a row opens the device sheet. | `Card` or plain list rows, `Badge`, `Toggle`, `Drawer side="bottom"`, `Button` |
| 2 | **Add device** (pushed, not a tab) | A pairing form: name, room, type, and a 6-character pairing code. Save returns to Devices with the device added and a confirmation. Cancel and the system Back return without saving. | `Input`, `Select` or `RadioGroup`, `Button`, a status line or `Notification` |
| 3 | **Scenes** (tab) | Three presets ("Good night", "Morning", "Away"). Applying one changes several devices at once and says which ones changed. | `Card`, `Button`, `Badge` |
| 4 | **Settings** (tab) | A temperature unit choice (°C or °F, which really changes how thermostats display), two toggles ("Alert me when a device goes offline", "Remote access"), and an About block with the mock disclosure. | `Toggle`, `RadioGroup` or `Select`, `Divider` |

**The device sheet** (opened from a Devices row) is a bottom sheet with the device's controls: a `Slider` for brightness (lights) or target temperature (thermostat), the same on/off `Toggle`, and a visible **Remove device** button. This is the template's list-action pattern: every control is a visible, labelled element, so nothing depends on a gesture or on hover.

The bottom sheet is a `Drawer` with `side="bottom"`; the library's open Drawer findings matter here and are listed in §7.

### 3.3 Bottom navigation

> **Superseded in part (2026-10-18 redesign).** The three links are now Home, Rooms and Settings, and the bar is hidden on every pushed screen (a device's page, Add device, Add room), not only on Add device. Everything about how it is built (native anchors, `aria-current`, sticky in the column, safe-area padding, 44px or more) stands.

A `<nav aria-label="Main">` with three links (Devices, Scenes, Settings), each an icon over a label, current page marked `aria-current="page"`. Built from native anchors styled with the template's CSS, because no library component fits (§7). It is fixed at the foot of the app shell, not of the document, and pads itself by `env(safe-area-inset-bottom)`. Each link is at least 44px high and a third of the width (§3.5). The Add button is not a fourth tab; it is a primary `Button` in the Devices screen, so the nav stays three items (more than five breaks at 320px; three leaves room).

The nav is hidden on the Add device screen (a form with the on-screen keyboard open should not carry a fixed bar over the fields); that screen has its own app-bar Back and a Save button.

### 3.4 Interactions that are real, and the one decision about gestures

> **Superseded in part (2026-10-18 redesign).** Scenes, the device sheet and the single "Add device" form no longer exist; the real interactions are listed under "Screens and routes" in the redesign. The decision below to leave out swipe stands unchanged: the quick switch on a row is the glyph button and the detail is one tap deeper, on the device's page.

Real in the app: switching tabs, flipping a device's switch, moving a slider (brightness, target temperature) in the sheet, applying a scene (it changes several devices in memory), changing the temperature unit, pairing a device (with validation: a name is required and the code must be six letters or digits), removing a device, and the Settings toggles changing their own state.

**Swipe is left out (Q4).** Swipe-to-reveal is the interaction people picture first in a phone list, and issue #48 lists "swipe or tap actions". Against it: cyberui-2045 has no gesture component (2.8.0 is the latest release; a search of its source finds none), so the template would carry its own pointer-event code (pointerdown/move/up with a threshold, scroll-vs-swipe disambiguation, `touch-action`), which happy-dom cannot exercise; a swipe is invisible, so every row would need the same actions as visible controls anyway for keyboard and switch users; and the on-row switch plus the sheet already give the thumb large targets. If the owner wants swipe, either it is added on top of the sheet as an enhancement (the sheet remains the accessible path), at the cost of one hook and a browser-only test, or a swipeable row is built upstream first (a new CyberUI feature and release, which would block this template on it; §7.1 files it as a request either way).

### 3.5 Phone rules the template follows, each with a way to check it

> **Superseded in part (2026-10-18 redesign).** The rules stand except these: the bottom-sheet rules (the sheet padding itself for the home indicator, the `Drawer`'s glow, a `Slider` inside a scrolling sheet) no longer apply because there is no sheet; the **touch-target rule gained a failure it did not foresee**: stretching a library control's label to 44px moved the `Toggle`'s knob 6px out of its track (see "What the owner said"), so every wrapper rule must also be looked at in a browser, and a rule for the knob is added; and reduced motion now also switches off the library's own transitions, which the first version left running.

These are the issue's list, made concrete. The plan turns each into a task or a test.

- **Touch targets of at least 44 by 44 CSS pixels** for every control. Facts from the 2.8.0 class names (computed, not yet measured in a browser; the plan's first browser task measures them): `Button` `md` is `py-2` plus a `text-lg` line (1.75rem), so about **44px** for the borderless primary and **48px** for the outlined variants; `sm` is about **28/32px**, below the bar, so this template does not use `sm`. `Toggle` is a **28px**-high track at `md` and **32px** at `lg`, and `Checkbox` is **20px** at `md` and **24px** at `lg`: all below 44px, and `Toggle` is on every row of this template. So each is wrapped in a row whose whole label is the hit area and at least 44px high, and the template does not rely on the bare control. `Slider` sizes were not read; the plan measures its thumb and track and, if the thumb is under 44px, makes the surrounding row the touch target. A test cannot measure layout under happy-dom, so this is a browser check at 320 and 390px (and the CSS carries `min-height: 2.75rem` on the wrapping rows so the rule is greppable).
- **Safe-area insets.** `index.html` sets `viewport-fit=cover` and the app bar, bottom nav and sheet pad themselves with `env(safe-area-inset-*)`. Neither the library nor a desktop browser exercises this: **2.8.0's stylesheet contains no `env(safe-area-inset-*)` and no `dvh`/`svh`/`lvh`**, so a `Drawer` bottom sheet does not pad itself for the home indicator and the template pads the sheet's content. I cannot verify real inset values without a notched device or Chromium's safe-area emulation; the plan tries the latter and the spec's findings section records what was and was not verified (§12).
- **`dvh`, not `vh`.** The app shell is `min-height: 100dvh` (with a `100vh` fallback written first), so the browser's collapsing toolbar does not leave the nav under the fold. In 2.8.0 `100vh` appears only in `Image`'s utilities and in two decorative keyframes (`scan`, `signal-glitch-vertical-sweep`); `Drawer` and `Modal` use `fixed inset-0`, which is fine on phones.
- **Reduced motion.** The route change, the sheet and any list animation are off or instant under `prefers-reduced-motion` (copy `usePrefersReducedMotion` from landing/agent-panel). No scroll-triggered motion (owner rule).
- **No hover-only controls.** Every action is visible. Hover styles may enhance but never carry meaning. The library gates its `hover:` rules in `@media (hover: hover)` (that block appears in its stylesheet; I did not check every rule), so a touch tap should not leave sticky hover on buttons; the browser check at 390px with touch emulation looks for it.
- **The on-screen keyboard.** Inputs use the right `type` and `inputmode` (`autoCapitalize="characters"` and `autoComplete="off"` on the pairing code), and the Add screen's Save button must remain reachable with the keyboard open (a sticky footer inside the screen, not a fixed bar over the fields). Verified in the browser at 390px only as far as an emulated viewport can; a real keyboard is **not** checked.
- **Text and zoom.** Body text at least 16px so iOS Safari does not zoom on focus; layout survives 200% text zoom and 320px without sideways scroll (`scrollWidth` equals the viewport).
- **Landmarks and focus.** `header`, `main`, `nav`; one `h1` per screen; a skip link; visible focus on every control. `Toggle` variants are `primary` (magenta), `secondary` and `accent`: the template uses `accent` so "on" reads in the template's colour, not the library's magenta.

### 3.6 What is mock, and how the app says so

> **Superseded in part (2026-10-18 redesign).** The app says it in three places and the README: the "Demo" badge (unchanged), the Settings sentence (unchanged), and a line on the Scan screen ("This scan is scripted: nothing is discovered."), which replaces the sentence that used to end the pairing confirmation. Pairing is now a scripted scan and link; the list below applies with "pairing" read that way, and with the signal, latency, battery and wattage added to what is invented.

Real in the app: everything in §3.4. Mock:

- **The devices themselves.** There are none. Switching, sliding and applying a scene change in-memory state only; nothing is sent to anything. The template contains no Bluetooth, WebSocket, fetch or other network code, and a test asserts it does not call `fetch` or `navigator.bluetooth`.
- **Pairing.** Any six letters or digits are accepted as a pairing code; nothing is discovered or paired.
- **Status.** Online, low battery and offline are fixed in the starting data, not detected. A device never goes offline by itself.
- **Alerts and remote access.** "Alert me when a device goes offline" and "Remote access" are stored in memory; no notification is ever scheduled, requested or shown (the template never calls the Notification API or asks for permission), and there is no remote access.
- **Persistence.** Reloading restores the starting data; devices you pair are lost.
- **The data.** The devices, rooms and readings are invented.

How the app says it (proposed, Q6, following the agent-panel and landing decision that honesty is one persistent signal plus the README, not repeated labels): a small **"Demo" badge** in the app bar, always visible, with the full sentence ("Template demo: Kestrel is fictional and controls nothing.") in the Settings About block and in the confirmation shown after pairing a device (the moment a person has typed something). No banner and no "(demo)" suffixes on buttons. A comment at the reducer, the settings handlers and the pairing handler says the same for a forker.

## 4. Theming

Same mechanism as `orange.css` and `violet.css`: one small stylesheet imported after the library's, overriding `--color-secondary` and `--color-accent` together, leaving `--color-primary` alone, with the comment written for a forker. A test fails if any other CSS file under `src/` contains a hex literal (landing's test, which reads the CSS from disk; `import.meta.glob(..., '?raw')` returns empty strings under Vitest and would pass vacuously).

Hues already taken: cyan (monitoring `#00fff9`, hue 179), violet (agent-panel `#c084fc`, 270) and orange (landing `#ff8a3d`, 24). The library's own `primary` is hue 338. Contrast computed from the 2.8.0 tokens (`--color-base` `#1a1a2e`, `--color-surface` `#2d2d44`, `--color-inverse` `#1a1a2e`; the primary Button's fill is `--color-accent` to `--color-secondary` with `--color-inverse` text, which is the same figure as "on base" below). Text must reach 4.5:1 on both base and surface:

| Candidate | Hex | Hue | on base | on surface | Concern |
|---|---|---|---|---|---|
| Blue (proposed) | `#5b9cff` | 216 | 6.21 | 4.87 | Closest shipped hue is cyan (37 degrees away), and the library's `info` (`#0af`, hue 200) is near; this template has no info state |
| Lime | `#a3e635` | 83 | 11.31 | 8.87 | Between the library's yellow accent and `success` green (`#00ff9e`, hue 157): it would blur with the "Online" status here |
| Sky | `#38bdf8` | 198 | 7.96 | 6.24 | Almost the library's `info` colour and 19 degrees from cyan |
| Indigo | `#818cf8` | 234 | 5.72 | **4.48** | Fails 4.5:1 on surface |
| Rose red | `#ff6b6b` | 0 | 6.15 | 4.82 | 22 degrees from `primary` and next to `error`; would read as an "Offline" device |
| Pink | `#ff6b9d` | 340 | 6.37 | 4.99 | Same hue as `--color-primary`: merges with the primary colour |

Blue is proposed because it is the only candidate clear of all three status colours the template uses (success green, warning amber, error red) and of the magenta primary, with contrast above 4.5 on both surfaces; the price is that on the Templates page its badge sits nearer to monitoring's cyan than orange or violet do, which the page's own text labels ("Blue accent") soften. (Q2) If the owner prefers more distance from cyan, lime is the alternative, but it would be confused with the "Online" badge.

`packages/site/src/data/templates.test.ts` already enforces that `accentHex` values are distinct.

## 5. Data and mock-data strategy

> **Superseded in part (2026-10-18 redesign).** The single reducer, the action union, the `Record<…>` rule and "temperatures are stored in °C" stand. What changed: `scenes.ts` is gone; rooms are data and can be added and removed (state holds them); a device carries a link state (`connected`, `lost`, `offline`), a signal (0 to 4 bars), a latency, and (lights and plugs) a wattage, and `DeviceStatus` is gone; presets (`presets.ts`) and the scripted "nearby" list with its one scripted failure (`nearby.ts`) are data; and a room's power figure is derived in `utils/summary.ts`, never stored. See the plan for the files.

State is a single `useReducer` in `App.tsx` (devices, settings), exposed through props, not a context library or a store; the reducer's action type is a discriminated union, so an unhandled action is a compile error. Starting data and the copy live in `src/data/`:

| File | Holds |
|---|---|
| `devices.ts` | the starting devices: id, name, room, `DeviceKind` (`light`, `plug`, `thermostat`, `sensor`), status, on/off, brightness or target temperature or reading |
| `scenes.ts` | the three scenes, each a list of device changes by id |
| `settings.ts` | the defaults |
| `product.ts` | the app name, route titles, tab labels, the disclosure sentence |

Everything keyed by a union is a `Record<…>`: `Record<DeviceStatus, …>` for badge label and tone, `Record<DeviceKind, …>` for icon and which controls the sheet shows, so adding a device kind without its controls is a compile error. Temperatures are stored in °C and converted for display by a small `units.ts` utility with tests. The starting data contains at least one device of every kind and every status (including one offline and one low-battery device) so every state is visible without interaction.

The README gets a "Where your data goes" section (as agent-panel's does) naming these files and the reducer as the place to put a real data layer or device protocol.

## 6. Code structure and patterns to copy

> **Superseded in part (2026-10-18 redesign).** The folder tree below is the first version's. The redesign adds `src/connection/` (the adapter seam and its scripted implementation) and `src/utils/` grows (`summary.ts`, `glow.ts`); `components/` loses `DeviceSheet` and `StatusBadge` and gains `Glyph`, `SignalBars` and `LinkRun`; `screens/` becomes Home, Device, Rooms, Add room, Add device and Settings. The patterns to copy (§6.1, §6.2) stand, with these additions that need a forker-facing comment: the `Connection` seam, the glow level as one pure number, and the track-as-positioned-ancestor rule for the switch's knob.

```
packages/mobile-app/
  LICENSE            (identical to the root one)
  README.md          (the forker's documentation)
  index.html         (viewport-fit=cover, theme-color, a comment about both)
  package.json       (name mobile-app-template, license MIT, no workspace: ranges)
  tsconfig.json      (complete, not extended)
  vite.config.ts     (base: './')
  src/
    main.tsx  App.tsx  App.css
    router/          (useHashRoute.ts with the ROUTES tuple)
    screens/         (DevicesScreen, AddDeviceScreen, ScenesScreen, SettingsScreen)
    components/      (AppBar, BottomNav, DeviceRow, DeviceSheet, StatusBadge, TouchRow ...)
    state/           (reducer.ts and its action types)
    data/            (§5)
    utils/           (units.ts)
    hooks/           (usePrefersReducedMotion, copied)
    icons/           (inline SVG, as in landing)
    theme/           (the accent file)
    test/            (setup.ts, copied)
```

### 6.1 Patterns copied from the other templates

`useHashRoute` with the `ROUTES` tuple and `Record<Route, …>` maps (monitoring, agent-panel), `usePrefersReducedMotion`, `test/setup.ts`, the `noInlineStyles` and `noHexColors` tests, the `icons/` approach. Duplication across templates stays deliberate (a shared layer would break `tiged` extraction).

### 6.2 Patterns new to this template (each needs a forker-facing comment, per CLAUDE.md)

- **A touch-target wrapper** (the `TouchRow`-style component for `Toggle`, `Checkbox` and `Slider` rows): why the bare control is too small, and that the label row, not the control, is the hit area.
- **Safe-area and `dvh` rules in one place** (a small block in `App.css` or a utility class), explaining that the library does neither.
- **The reducer's action union** as the single place state changes, and where a real device protocol would plug in.
- **Route-change focus management**, and why.
- **Mock boundaries named in code** (the reducer, the scene application, the pairing handler, the settings toggles), matching the honesty rule in CLAUDE.md.
- **Duplicate visible text in tests:** device names appear in the list, the sheet and scene results, and tab labels appear in the nav and as screen titles; scope queries with `within(...)`, with one comment at the first collision in a file (CLAUDE.md's rule, never rename text to dodge it).

## 7. cyberui-2045 components used, and library issues that matter on a phone

> **Superseded in part (2026-10-18 redesign).** The redesigned template **does not use `Drawer`, `Badge` for status, `Card`, `Divider` or `SectionTitle`** (it keeps `Badge` for the "Demo" label). It uses `Button`, `Input`, `Select`, `RadioGroup`, `Slider` and `Toggle`. The issue table below is therefore re-read as follows: #123, #124, #125 and #130 (all `Drawer`) are no longer worked around by the template, are still open and valid, and are now only a README note for a forker who adds a `Drawer`; #120, #121, #126, #127, #128, #129 and the four feature requests #131 to #134 stand. §7.1 is unchanged.

Planned: `Button`, `Badge`, `Card`, `Drawer`, `Input`, `Select` or `RadioGroup`, `Toggle`, `Slider`, `Divider`, `SectionTitle`, and possibly `Notification`. All are in the 2.8.0 manifest (33 components). The plan's first task confirms each prop against the published typings; this spec has read `Drawer` (`side` accepts `left | right | top | bottom`; `size` `sm | md | lg | xl | full`; `variant` `default | danger`; `ariaLabel`, `className`, `overlayClassName`), `TabNavigation` (`mode` `scroll | wrap | dropdown | collapsible`, responsive `size`), `Toggle` (`variant` `primary | secondary | accent`, responsive `size`, spreads input attributes so `disabled` and `id` work), `Checkbox`, `Notification`, `DropdownMenu` and `Slider` (`min`, `max`, `step`, `value`, `onValueChange`, `variant`, responsive `size`, `label`, `showValue`, `formatValue`, `ariaLabel`). Responsive props work in the prebuilt stylesheet since 2.8.0 (CyberUI#108), so `size={{ base: 'md', lg: 'lg' }}` is usable.

Open library issues (patrickkuei/CyberUI, all open on 2026-10-17) and what they cost this template, since it leans on Drawer, Toggle and Input more than landing did:

| Issue | Effect on this template | Proposed handling |
|---|---|---|
| #123 Drawer has no focus trap although `aria-modal` | The device sheet is the template's main overlay; Tab can leave it into the page behind | Work around with a comment citing the issue (as landing does) only if a small, honest workaround exists; otherwise document it in the README's known limits (Q8) |
| #124 Drawer's `rgbGlow` border hard-codes colours | A **bottom sheet is large on a phone**, so a border cycling magenta, cyan, green and yellow on a blue-themed app is far more visible than landing's side menu was | The Drawer accepts `className` and `overlayClassName`; the plan tests whether a class can neutralise the animation (a steady `--color-accent` border) without hacking library internals. If it cannot, say so in a comment and in Q8 |
| #125 Drawer title is 3.45:1 on its surface | The sheet title | Pass no `title`; render our own heading in the sheet content with a token that passes, and set `ariaLabel` |
| #120 `Toggle` without `id` has no accessible name | Devices, Settings use it on most rows | Always pass an `id`; comment once (landing does) |
| #121 `Input` errors are not announced | The pairing form's validation | Move focus to the first invalid field on submit and keep an `aria-live` status line; comment once |
| #122 `Steps` glyphs not `aria-hidden` | Not used here | None |
| #116, #117 (DatePicker/Image contrast, clickable Badge without a disabled state) | Not used: there is no date field and no `Badge` is clickable | None |

Findings from reading 2.8.0 for this spec, **not yet reproduced in a browser and therefore not filed**: no bottom-navigation component exists (`TabNavigation` is a top strip); the stylesheet has no safe-area or `dvh`/`svh` support; `Toggle` and `Checkbox` render below 44px at every size; there is no gesture or swipe support. The template never silently works around a finding: it gets a comment, and an issue is filed on patrickkuei/CyberUI only after reproducing it and checking the existing list (the handoff's rule).

### 7.1 Upstream feature requests to file (owner request, 2026-10-18)

The owner asked that the phone features cyberui-2045 lacks be filed on patrickkuei/CyberUI. They are feature requests, so each is filed with the evidence this template produces, not as a guess:

| Request | Evidence this template should supply |
|---|---|
| A bottom navigation component (3 to 5 items, `aria-current`, safe-area padding) | The hand-built `BottomNav` and the problems it solved |
| Safe-area and `dvh` support (padding utilities or a prop on `Drawer`, app-shell helpers) | The measured behaviour of the bottom sheet against a notch or home indicator, with the emulation method and its limits (§12) |
| A touch-size option for `Toggle`, `Checkbox` and `Slider` (a 44px hit area without a bigger visual) | The measured sizes at 320 and 390px and the wrapper that had to be written |
| A swipeable row and/or a bottom-sheet action list (a gesture component with a keyboard alternative built in) | What the template does instead and what it costs, and the answer to Q4 |

**When:** during PR A, after the browser check has measured and reproduced the evidence, and after checking the open issue list (#116 to #125 today) for duplicates, in the same pass that files defects (spec 2026-10-16's "Library findings, reproduced and filed"). The filed issue numbers are recorded in this spec's findings section. They are not filed before then, so no issue is opened on a guess; if the owner wants them filed earlier, say so.

## 8. Testing strategy

> **Superseded in part (2026-10-18 redesign).** The strategy stands. The list below is the first version's: the device sheet, scenes and the single Add device form are gone, and the redesign tests, in their place, the room filter and its counts, the summary sentence, the glow level and halo for every kind, the rooms and their rule for removal, the presets, the scan and the link (on fake timers, including the one that fails), the Link panel, the reducer's every action, and the guards (`phoneRules` gains the knob rule, sentence case, flat buttons and reduced motion). The plan lists them task by task. A layout test still cannot see a knob: the browser measurement does.

Vitest + Testing Library + happy-dom, run in CI by the `package-tests` job. Tests assert behaviour, not markup:

- **Router:** the hash selects the screen; an unknown hash falls back to Devices; Back from Add device returns to Devices; the bottom nav marks the current page with `aria-current`.
- **Devices:** flipping a row's switch changes only that device; an offline device's switch is disabled; a sensor has no switch.
- **Device sheet:** the slider changes brightness or target temperature; "Remove device" removes it and closes the sheet; the sheet closes on Escape.
- **Add device:** an empty name shows the error and keeps focus on the field; a pairing code that is not six letters or digits is rejected; a valid submit adds the device to the list and shows the confirmation (which names the demo).
- **Scenes:** applying a scene changes exactly the devices it lists and reports them.
- **Settings:** the unit choice changes how a thermostat's temperature is displayed (and the stored value stays in °C); each toggle changes its own state only.
- **Mock honesty:** the "Demo" badge and the disclosure sentence are present; `fetch`, `navigator.bluetooth` and the Notification API are never called (spies).
- **Data:** every `DeviceKind` and every `DeviceStatus` appears in the starting data.
- **Headings and landmarks:** one `h1` per screen; `header`, `main`, `nav`.
- `noInlineStyles` and `noHexColors` (copied; the latter reads CSS from disk).

Not testable under happy-dom and therefore a **browser check, not a test**: layout and sideways scroll at 320, 390 and 800px, touch-target sizes, the fixed nav and sheet against safe areas and the collapsing toolbar, focus rings, the real accent contrast, hover behaviour under touch emulation, and the preview inside the site's dialog. The plan makes this a task with screenshots, as issue #48 requires, and the spec gets a "findings" section as landing's did.

## 9. Self-containment and forkability

Identical rules to landing and agent-panel §9: own complete `package.json` (`license: MIT`, `cyberui-2045: ^2.8.0`, `vitest: ^4.1.12` or later, never `workspace:`), own `tsconfig.json`, own `vite.config.ts` with `base: './'`, no imports outside the package, a `LICENSE` identical to the root one, and a README that is the forker's documentation (what it is and what is mock, commands, "Where your data goes", "Principles this code follows" as on the Code tab, "Re-theming", and a short "Phone checklist" naming the rules in §3.5 and the library issues in §7). Verified by the clean-room method (copy the folder outside the workspace; plain `npm install` with zero warnings; build; test; run) and, once merged, `npx --yes tiged patrickkuei/cyberui-templates/packages/mobile-app my-app` for real. The package is **added to the `fork-install` matrix** in `.github/workflows/checks.yml`.

## 10. Integration points (PR B)

> **Redesign, 2026-10-18 (PR D).** Everything in this table already exists on `main`; the redesign touches these rows only: **`templateContent.ts`** (a new tagline in `templates.ts`, new `useIf`, a reviewed `headsUp`, a reworded `notFor` about the template's own limits, and **two new examples** from two new persona interviews, since the published two were written for scenes, the Add device form and the bottom sheet); **`codeTabs.json`** (excerpts re-copied verbatim from the new source, `ROUTES` among them, and the folder map with `src/connection`; **this one lands in PR C**, because CI's `code-tab` job checks it on every PR and the package PR would be red without it); **the screenshot** (retaken from the redesigned app, in the same 390 by 740 frame on a 1440 by 900 canvas); the **README rows** (the root table and the package's own); and a **live-site check** of the deployed page. `check:code-tab` cannot pass until PR C is merged, as before.

Same table as landing §10, with these values. The one new item is §10.1.

| File | Change |
|---|---|
| `packages/site/src/data/templates.ts` | Add the `mobile-app` entry: name "Mobile App", tagline, `accentLabel` "Blue" (pending Q2), `accentHex` (distinct from the other three), screenshot and live-preview paths. `slug:` then `name:` as plain single-line quoted strings (the README check reads the file as text). |
| `packages/site/src/content/templateContent.ts` | Add the `mobile-app` entry (`useIf`, `headsUp`, optional `notFor`, `examples`, `code`). |
| `packages/site/src/content/codeTabs.json` | Add `mobile-app`: principles with verbatim excerpts and the folder map (`check:code-tab` verifies each in CI). |
| `packages/site/public/screenshots/mobile-app.png` | Taken from the phone-sized frame or a 390px capture (Q3); it must look like a phone app, not a wide page. |
| `packages/site/scripts/sync-template-builds.mjs`, `.github/workflows/deploy.yml` | The build and copy entries; `check:template-builds` fails CI if either is forgotten. |
| `.github/workflows/checks.yml` | Add the package to the `fork-install` matrix. |
| `README.md` (root) | A row in the Templates table (`check:templates-readme`). |
| `pnpm-lock.yaml` | A `packages/mobile-app` importer; `deploy.yml` uses `--frozen-lockfile`. |
| site tests | `getTemplate('mobile-app')` resolves; its screenshot exists; copy assertions. |
| `packages/site/src/content/staticHtml.ts` | The hard-coded meta description names the templates; extend it and its test. `llms.ts`, the noscript list and the sitemap derive from `TEMPLATES`. |

`check:license`, `check:code-tab`, `check:templates-readme`, `check:template-builds`, `check:process-excerpts`, `test:scripts` and `pnpm -r --workspace-concurrency=1 run test` must pass. PR B says `Closes #48`; the tracking issue #1 gets its checkbox ticked by hand. PR A says `Refs #48`. PR B cannot pass `check:code-tab` until PR A is merged (its excerpts must exist in the package).

### 10.1 Showing a phone-first template in the preview dialog (new site behaviour, Q3)

Today the live preview is an `<iframe>` filling the dialog (about 1262 by 659px at a 1440px window; full screen at 390px). Its media queries respond to the **iframe's** width, so without a frame this template would show its widest layout in the one place most visitors look at it, which undersells the thing it exists to show.

Proposed: an optional field on `Template`, `previewFrame?: 'phone'`. When set, `TemplatePreview` renders the iframe in a centred box of 390 CSS pixels wide (height limited by the dialog, with its own scroll), with the tab strip and the Code tab unchanged; below 640px the dialog is already full screen, so the frame is dropped there and the template runs at the visitor's real width. Because the iframe really is 390px wide, the template's phone layout is what runs, not a simulation of it (no `transform`, no fake device chrome beyond a border). The existing iframe behaviour (Esc forwarding, no reload when switching tabs, the `usePreviewNav` hash handling) is untouched; the work is a field, one conditional class, ~15 lines of CSS and tests.

Alternatives: (a) no site change and let the template cap itself at a phone-width column when wide (`max-width: 30rem; margin-inline: auto`), which works with no new site behaviour but makes the template look like it ignores the 800px case issue #48 asks to be checked; (b) a toggle in the preview to flip between phone and wide, more flexible but more UI. The recommendation is the frame with no toggle.

## 11. Site copy for the Templates page (proposed wording, to be fixed after the answers)

> **Superseded in part (2026-10-18 redesign).** The wording below is what shipped. The redesign changes: the **tagline** ("A home device controller built for a phone: rooms, a glowing glyph for every device, a full page to control each one and a scan-and-link flow to add more."); the third **use-if** line (rooms, things you switch and dim, a connect flow and a few settings); **`notFor`**, which also names the scan ("if you need to find or talk to real devices, or install it on a phone. The devices and the scan are made up, and it's a web page with no saved data."); the **Code tab** (see below; its JSON ships with the package in PR C); and the **examples**, which are re-run with two new subagent interviews whose brief describes the redesigned app, saved whole outside the repository, quoted verbatim with ellipses, and checked by script; "Where they'd get stuck" still lists only obstacles the library and the template did not cause, with no remarks about the template or the demo, and the labels still say "they". If an interview cannot give two examples that qualify, PR D stops and reports instead of writing one. The heads-up is unchanged: it is still true. The Code tab's principles: Single source of truth, Typed and exhaustive (the `ROUTES` tuple), **Light is state** (the one function that turns a device into a glow), **A seam for the real thing** (the `Connection` interface), No inline styles, Tested, and Phone rules in one place (now including the switch's knob); "Content as data" leaves the tab (the README table still has it).

- **Name / tagline.** "Mobile App" / "A home device controller built for a phone: bottom navigation, on/off switches and sliders in a list, one-tap scenes and a pairing form."
- **Use this if you're building…** a small control app people will use on their phone; the front end of an app you will later connect to real devices or a backend; something with a list, switches, a form and a few settings.
- **Heads-up.** One short friendly demo note in the agent-panel style (roughly 150 characters, no list of mock parts): the home and its devices are made up, and nothing is controlled or sent.
- **Probably not for you** (optional; own limits only, per the owner's rule): "if you need to talk to real devices or install it on a phone. The devices are made up, and it's a web page with no saved data." Leave out if the owner prefers no line.
- **Examples (two folds).** Not written here. Same method as the others: two persona role-plays by subagents, saved whole to a file and quoted verbatim with ellipses, never invented, checked by a script that every piece is found word for word; "Where they'd get stuck" lists only obstacles the library and templates did not cause (a device protocol such as MQTT or Matter, an account system, app-store or home-screen installation, real notifications), and no remarks about the template or demo themselves; labels say "they". Suggested personas: a hobbyist building a controller for their own home-lab or smart plugs; a designer prototyping a device app to show a client.
- **Code tab principles** (each claim must be true of the shipped code): Single source of truth (state in one reducer, content in `src/data/`), Typed and exhaustive (the `ROUTES` tuple, the action union, `Record<DeviceKind, …>`), No inline styles (the test), Tested (pairing, the sheet and scenes), Phone rules in one place (touch targets, safe areas, `dvh`). Folder map for `src/screens`, `src/components`, `src/state`, `src/data`, `src/theme`.

## 12. Risks and what is not verified

- **Nothing here has been built or run.** The measured facts are: the token contrast numbers in §4 (computed from the 2.8.0 stylesheet's token values, not rendered); that 2.8.0 is the latest published release and the CyberUI source has no swipe or gesture code; that 2.8.0's CSS has no `env(safe-area-inset-*)` and no `dvh`/`svh`/`lvh`, that `100vh` appears only in `Image`'s utilities and two decorative keyframes, and that `@media (hover:hover)` blocks exist (all by searching the published stylesheet); the `Drawer`, `TabNavigation`, `Toggle`, `Checkbox`, `Notification`, `DropdownMenu` and `Slider` props (read from the typings); and the `Button`, `Toggle` and `Checkbox` size classes (read from the compiled components). The 44px figures are arithmetic from those classes, not layout measurements, and `Slider`'s dimensions were not read.
- **Component fit is assumed.** `Drawer side="bottom"` has not been tried with a slider inside a safe-area-padded sheet; whether `className` can calm the glow animation (#124) is unknown; a `Slider` in a scrolling sheet on touch (does dragging fight with scrolling?) was not examined and could be a real finding; `Select` and `RadioGroup` on a phone (the native picker versus the library's listbox) were not read and decide how Add device is built.
- **A real phone is out of reach.** The checks are an emulated 320, 390 and 800px viewport in a desktop browser. Safe-area insets, the on-screen keyboard resizing the viewport, iOS Safari's collapsing toolbar and real touch behaviour are not verifiable that way; the findings section must say so (as landing's did) and the README must not claim them as tested.
- **The preview frame is new site behaviour** and carries the usual risk of scope creep on the site package (§10.1, Q3).
- **Gestures:** if Q4 is answered "include swipe", the risk moves to a hook that can only be checked in a browser.
- **Touch-target wrappers** can look like extra padding to a forker and be "cleaned up" later; the comment and a CSS-greppable `min-height` rule are the guard, not a test.
- **A control app invites fakery of its own:** vendor names, protocols, "connected" states and live readings. The data uses generic names and fixed readings, the template has no network code, and a test guards it.

## 13. Out of scope

Anything under "Not in scope" in §1; building a library `BottomNav`, `SwipeableRow` or `BottomSheet` component in this repo (they are CyberUI feature requests, §7.1); the community template (#49); changing issue #48's wording.

---

## Owner answers (2026-10-18)

> **Overridden in part by the redesign (2026-10-18, later the same day).** Q4's "bottom sheet" half (the sheet is replaced by a device page), Q7 (the four screens), and Q8 (the Drawer comments and known-limits note, since the template no longer uses `Drawer`) no longer describe the template. Q1 to Q3, Q5, Q6, Q9 and Q10 stand, and Q2's blue is kept.

The owner answered Q1 by choosing the device controller, and Q2 to Q10 with "go your recommend". The recommendation in each question below is therefore the decision:

| Q | Decided |
|---|---|
| Q1 | Home device controller. Name "Kestrel" and site name "Mobile App" as proposed. |
| Q2 | Blue `#5b9cff`. |
| Q3 | The optional `previewFrame: 'phone'` on `Template` (a 390px frame, no toggle); PR B touches the site's components for it. |
| Q4 | Tap and bottom sheet, no swipe; swipe is filed upstream as a feature request (§7.1). |
| Q5 | Nothing saved. |
| Q6 | A "Demo" badge in the app bar, the sentence in Settings and the pairing confirmation, and the README. |
| Q7 | Devices, Add device, Scenes, Settings. |
| Q8 | Comment citing the open Drawer issues plus a README "known limits" note; do not wait for a release. |
| Q9 | One centred content column with the same bottom nav at 800px and above. |
| Q10 | The landing path as written. The two role-play interviews for the site copy run just before PR B (the handoff method), with no further stop to ask unless an interview cannot be run. |

**Deviations found while planning.** Building the package for the plan showed that a few details in this spec do not hold or are better done differently (for example the bottom nav is `position: sticky` in the app column rather than fixed, `Notification` is not used because its close button is 20px, and the sheet's controls are an exhaustive `switch` over the device kind). They are listed one by one in the plan's "Self-review notes"; where the two differ, the plan is the later and more exact statement.

## Open questions for the owner (as asked)

Each has my recommendation first. "Fine as proposed" is a complete answer.

**Q1. (Decided 2026-10-18: a home device controller.)** Still open: the placeholder name "Kestrel", and whether "Mobile App" is the right site name or you want something like "Device Controller".

**Q2. The accent hue.** Blue `#5b9cff` (proposed: contrast 6.21 on base and 4.87 on surface, clear of the online, low-battery, offline and primary hues, but nearer to monitoring's cyan than orange or violet are), or lime `#a3e635` (more distinct from cyan, but it blurs with the "Online" status colour).

**Q3. A phone-sized frame in the site's preview dialog.** Add the optional `previewFrame: 'phone'` to `Template` so the live demo runs in a 390px-wide frame (proposed, §10.1), or leave the site alone and have the template cap itself to a phone-width column on wide screens, or add a phone/wide toggle to the preview? Also: is it fine that this makes PR B touch the site's own components, not only its data and copy?

**Q4. Swipe.** Tap the row's switch or open the bottom sheet, with no swipe gestures (proposed, §3.4), or also add swipe-to-reveal as an enhancement on top of the sheet (template-owned code), or wait for an upstream swipeable row (blocks this template on a CyberUI release)?

**Q5. Persistence.** Nothing saved; a reload restores the starting data (proposed, consistent with agent-panel and "nothing looks like a sync"), or keep devices in `localStorage` so the demo feels like an app (a small honesty cost: the template would then need to say what is saved where)?

**Q6. How the app says it is a demo.** A small "Demo" badge in the app bar, the full sentence in Settings and in the pairing confirmation, and the README (proposed), or only the Settings sentence and README, or a visible line on every screen?

**Q7. Screens.** Are Devices, Add device, Scenes and Settings the right four (proposed)? Cut candidates: Scenes (leaves Devices, Add device, Settings, with the cross-device behaviour dropped); add candidates: an Activity log screen (a list of recent changes, all generated by the user's own taps), a rooms screen.

**Q8. Known library gaps.** Where a library issue stays open at build time (the Drawer focus trap #123, its hard-coded glow colours #124), is a comment citing the issue plus a README "known limits" note acceptable (proposed, as landing did), or should the template wait for a cyberui-2045 release that fixes them before PR A?

**Q9. Wide screens.** At 800px and above, keep one centred content column of readable width with the same bottom nav (proposed, smallest scope), or switch to a side rail for navigation (a better tablet experience, more CSS and more to check)?

**Q10. Order of work and workflow.** Spec, then plan (written by a subagent that reads this spec, the landing plan and the real 2.8.0 typings), then PR A (an implementer subagent in its own worktree, then an independent read-only reviewer that mutation-tests the tests and checks the browser at 320, 390 and 800px; the upstream feature requests in §7.1 are filed from its evidence), merge when CI is green, then PR B, then a check of the live site (proposed, the path that worked for landing). Confirm this, and say whether I should run the two role-play interviews for the site copy before PR B or stop and ask when we get there.

---

## Findings from the first browser check

Written during PR A (2026-10-18), after building `packages/mobile-app` from the plan. Tools: headless Microsoft Edge 155.0.4283.62 on Windows 11, driven over the DevTools protocol by `puppeteer-core` 24.43.1 against the template's dev server (Vite 7.3.6, Node 20.20.2), with device emulation: touch input, mobile viewports of 320x568, 390x844 and 800x900 (the 800px runs without touch), `Emulation.setSafeAreaInsetsOverride` (47px top, 34px bottom), and `prefers-reduced-motion` both ways. Screenshots of every screen at 390 and 320px, of the sheet at 320, 390 and 800px, and of Add device with its errors were read by eye. The scripts are the ones in the plan (`contrast.mjs`, `browser-check.mjs`, `measure-shipped.mjs`, `colour-scan.mjs`), plus two small extra ones for the checklist in the plan's Step 5 and for the library reproductions below; all were kept outside the repository. The Claude Browser pane was not used for measuring.

**Needed a fix:** nothing. The numbers the plan predicted came out identically (each line below is from this run), so no code changed because of the check. Three statements in the plan or in this spec turned out to be imprecise, and are corrected here and where they are used:
- `Toggle`'s focus classes are `peer-focus:ring-primary`, `peer-focus:ring-secondary` and `peer-focus:ring-accent` (one per variant) plus `peer-focus:outline-none`, and no ring width, not only `ring-accent` as the plan's candidate text said. CyberUI#126 uses the real class names.
- §12's "`100vh` appears only in `Image`'s utilities and two decorative keyframes" is incomplete: it also appears in `Modal` (its `fullscreen` size sets `height: "100vh"` inline), in the `h-screen` and `min-h-screen` utilities and in three keyframe offsets. The point stands (no `dvh`, `svh`, `lvh` or `env(` anywhere); CyberUI#132 lists them exactly.
- The plan's feature-request text said the library's bottom `Drawer` content "runs to the bottom edge". It has the body's own `p-6` (24px) and nothing for the inset, so with a 34px inset the last control would end 10px inside the indicator area. CyberUI#132 says that.

**Checked and held:**
- Contrast, computed from the installed 2.8.0 stylesheet and `blue.css`: accent on base 6.21:1, accent on surface 4.87:1, base on accent 6.21:1, muted on base 6.02:1, muted on surface 4.72:1, default on base 12.92:1, default on surface 10.13:1, base on success 12.83:1, base on warning 8.94:1, base on error 5.27:1. Two library pairs fail, as predicted: the red text of the `danger` Button on the surface 4.13:1 (CyberUI#128) and the Drawer title 3.45:1 (CyberUI#125; the sheet draws its own heading).
- No sideways scroll: `scrollWidth <= innerWidth` and no element past the right edge on Devices, Scenes, Settings and Add device at 320, 390 and 800px.
- Touch targets at 390px, measured: the Add device button 358x44, a device row's main button 276x68, a switch's hit area 64x44, a bottom nav tab 130x61.5, a Settings radio option 47.1x44, a Settings switch row 358x44, Input 358x52, Select 358x52, Save device 358x44, Back 80.3x44. As shipped, with the template's rules switched off: Toggle `lg` track 64x32, radio option 47.1x20, Slider track 12px and thumb 24x24, no `touch-action` on any slider part (`auto`).
- Hover under touch emulation: `(hover: hover)` is false; a tap on a row opened the sheet and, after closing it, the row's background was `rgba(0, 0, 0, 0)` (nothing stuck).
- The device sheet at 390x844 with 47px and 34px insets: `animation-name: none`, a steady `rgb(91, 156, 255)` border (the library's `rgbGlow` is off, CyberUI#124), padding-bottom 34px, 402px high, its Done button ends at 786 of 844 (34px clear), the bottom nav pads 34px and the app bar 47px. At 320x568 the sheet is 368px high and does not scroll. At 800px the column is 480px wide at x=152.5 and the sheet is the same 480px at the same x.
- Slider by touch inside a sheet that can scroll (390x300, 120px leftward drag drifting 30px down): 70 to **35** with `touch-action: none` on `.touch-slider` as built, 70 to **65** with it forced back to `auto` (CyberUI#127). `sheetCanScroll` was true, so the sheet was scrollable in both runs.
- Closing the sheet from Done, Escape and a tap on the backdrop: the dialog is gone, `document.body.style.overflow` is back to `''`, and focus is on the row's button that opened it (`device-open-desk-lamp`), by the screen's own focus code.
- Keyboard: the first Tab stop is the skip link, then a row button with a 2px blue outline, then the switch (the switch's track draws our 2px outline; without it nothing would, see CyberUI#126). Tabbing past Done leaves the open sheet (focus goes to `body`, then the skip link, then the page behind it): no focus trap, as CyberUI#123 says.
- Reduced motion: this template's own CSS has no transitions or animation under `prefers-reduced-motion: reduce` (the nav tabs' and rows' `transition-duration` is `0s` with it and `0.15s` without). The library still animates some things under it (measured in the review-fix pass below): the Toggle track 0.3s and its knob 0.15s, the primary Button 0.3s, Badge 0.15s, and the Drawer swaps its 0.3s slide for a 150ms opacity fade.
- Add device: an empty Save leaves focus on Device name with `aria-invalid="true"` and both messages shown ("Enter a name for the device." and the pairing-code one); a valid Save lands on `#/devices`, shows "Added Shelf lamp to Living room. Template demo: Kestrel is fictional and controls nothing.", the bottom nav is back, and focus is on the screen title. The bottom nav is absent on Add device.
- Scenes: Good night reports "Good night applied. Changed: Desk lamp, TV plug, Fan plug, Hall thermostat. Offline, so not changed: Hall light." Settings: choosing °F makes the Hall thermostat row read "Target 68 °F". The skip link focuses `main` and leaves `location.hash` as it was.
- Colour scan (computed colours at rest): no cyan or yellow and no magenta text on any of the four screens or on the open sheet. Magenta that remains on purpose: the slider fill's far end (the library's `accent` variant is a gradient to `--color-primary`), and the glow around the primary Buttons (`box-shadow` `rgb(255, 0, 93)`, the library's primary colour, which this template leaves alone).

**Library findings, reproduced and filed** (see the next section). **Clean room** (Task 12): the package copied outside the workspace, plain `npm install` on Node 20.20.2 and npm 10.8.2 added 128 packages with no warnings, the build passed and 154 tests in 23 files passed; the dev server answered 200; the standalone check found no `workspace:` range and no import leaving the package; and all 26 mutations of the mutation script were caught by a test.

**Not checked:** a real phone and a real finger (emulated touch events are not a finger); real safe-area insets and how a real notch or home indicator looks (the insets were emulated values); the on-screen keyboard resizing the page (the Save row is sticky inside the form and cannot be confirmed above a real keyboard); iOS Safari's collapsing toolbars, and any WebKit or Firefox browser (`.device-sheet`'s `height: auto` inside the library's flex column is the layout most at risk there); a screen reader (VoiceOver, TalkBack, NVDA); the template inside the site's preview dialog (PR B); `npx tiged` against the published repository (only after merge); the real deploy.

---

## Library findings, reproduced and filed

Written during PR A (2026-10-18). Each defect was reproduced in a scratch Vite app that contains only cyberui-2045 2.8.0 (the latest published version, `npm view cyberui-2045 version`), in headless Edge 155 with touch emulation where touch matters. The open list was read just before filing (#116, #117, #119 to #125 were open, and searches for each topic found nothing relevant; #30's description of the shared dialog behaviour is cited from the Drawer finding).

| Issue | Kind | What was reproduced |
|---|---|---|
| [CyberUI#126](https://github.com/patrickkuei/CyberUI/issues/126) | defect | `Toggle`: tab to it; the input matches `:focus-visible`, the track (`input.nextElementSibling`) computes `box-shadow: none` and `outline-style: none`; the classes have a ring colour per variant but no ring width |
| [CyberUI#127](https://github.com/patrickkuei/CyberUI/issues/127) | defect | `Slider` in a scrollable box: `touch-action` is `auto` on the thumb and track; a 120px touch drag drifting 30px down ends at 65 from 70, and at 35 with `touch-action: none` on the scroller |
| [CyberUI#128](https://github.com/patrickkuei/CyberUI/issues/128) | defect | `Button variant="danger"`: `rgb(255, 79, 79)` on `rgb(45, 45, 68)`, 18px bold, 4.13:1 (a lighter error such as `#ff6666` is 4.68:1) |
| [CyberUI#129](https://github.com/patrickkuei/CyberUI/issues/129) | defect | `Select` with `error`: no `aria-invalid`, no `aria-describedby`, no `id` on the message (`Input` has all three) |
| [CyberUI#130](https://github.com/patrickkuei/CyberUI/issues/130) | defect | `Drawer`: opened with the keyboard, closed by Escape focus returns to the opener; closed by the parent setting `isOpen` to false the dialog is gone within 30ms and focus is on `BODY` |
| [CyberUI#131](https://github.com/patrickkuei/CyberUI/issues/131) | feature request | Bottom navigation (evidence: `BottomNav`, the sticky bar, three 130x61.5 tabs at 390px, `aria-current`) |
| [CyberUI#132](https://github.com/patrickkuei/CyberUI/issues/132) | feature request | Safe-area and `dvh` support (evidence: 0 occurrences of `env(`, `dvh`, `svh`, `lvh`; the bottom Drawer's classes and measured padding; the sheet block that fixes it, with 34px of emulated inset and the method) |
| [CyberUI#133](https://github.com/patrickkuei/CyberUI/issues/133) | feature request | Touch-size option for `Toggle`, `Checkbox`, `Slider`, `RadioGroup` (evidence: the as-shipped sizes above, the `TouchRow` wrapper and the markup it depends on) |
| [CyberUI#134](https://github.com/patrickkuei/CyberUI/issues/134) | feature request | Swipeable row and/or bottom-sheet action list with a keyboard alternative (evidence: no gesture code in 2.8.0, what the template does instead and what it costs) |

Dropped, with the reason: nothing was dropped. The plan's optional fifth defect (the Drawer and `isOpen`) was reproduced, and nothing in the 2.8.0 package documents it as intended (the `Drawer` JSDoc says it shares `Modal`'s focus-restore behaviour, which a comment on the issue quotes; `Modal` itself was not tested for the same case), so it was filed as #130 with the "if this is intended, say so in the docs" alternative stated. Not filed because it is already open: the Drawer's missing focus trap (#123, reproduced again by tabbing past Done), its hard-coded glow (#124) and its low-contrast title (#125). The template's comments and README now cite these numbers (`grep -rn "CyberUI#" src README.md`); each cited number was checked against the issue it names.

---

## Findings from the independent review of PR A, and what was done about them

Written during PR A (2026-10-18), after a read-only reviewer approved the PR with nits. The reviewer's measurements were re-measured where CSS changed (headless Edge 155, the same method as the first browser check; the numbers are from this pass).

**Fixed (each with a test that was shown to fail against the mutation that undoes the fix):**
- **A 30-character unbroken device name overflowed.** `Wwwwwwwwwwwwwwwwwwwwwwwwwwwwww` made the page scroll sideways at 320px (the reviewer measured `scrollWidth` 369) and widened the sheet to 369px, because only `.device-name` had `overflow-wrap: anywhere`. It is now on `.notice-text`, `.sheet-title` and `.scene-result` too. Re-measured at 320px with that name added to Hall: `scrollWidth` 320 on Devices (with the pairing notice showing), Scenes, Settings and Add device, no element past the right edge, the sheet 320px wide at x=0. The Add form already caps the name at 30 characters (`maxLength`). `phoneRules.test.ts` now checks all four rules.
- **`touch-action: manipulation` did not reach the sheet.** The rule was `.app :is(...)`, and the Drawer is rendered in a portal on `<body>`, outside `.app`. The selector now also names `.device-sheet`. Computed in the open sheet: the Done button and the Power switch's label are `manipulation` (they were `auto`); the nav tab and the row button still are.
- **The skip link was 187x40 when shown**, under 44px. It now has `min-height: var(--touch)`: 187.2x44.
- **Scenes with no devices** read "Good night applied. Nothing needed changing." They now read "Good night: no devices to change." (with a test).
- **Tests added for survivors:** a whitespace-only device name; Cancel with a complete, valid form (it would have been caught turning into a submit button); `tabindex="-1"` on the screen title and on `<main>` (happy-dom focuses anything, so removing it would not fail any behavioural test, while a real browser would stop focusing them); a thermostat that is off reads "Off"; the status badge colours (success, warning, error); `aria-haspopup="dialog"` on the row button; the accent variant of the switch (observed as the library's `peer-checked:bg-accent` class on the track); `novalidate` on the form; the slider's widened hit areas (the `::before` rules with their `inset`); the keyboard focus ring rule for the app bar Back button, row buttons and nav tabs. Deleting those rules had survived before.
- **Wording:** `DeviceRow`'s comment said a row switch needs an `id` to be named. Checked in a test run: with an `aria-label` it is named without an id; a visible `label` without an id leaves it unnamed (CyberUI#120). The comment and README now say that, and that the row's id is kept so every switch is built the same way. The README's reduced-motion row said the library's Drawer honours the setting; it now says what is true, below.

**Reduced motion, measured (Chromium with `prefers-reduced-motion: reduce`):** this template's own CSS has no transition or animation (`0s`). The library still animates: the Toggle track 0.3s and its knob 0.15s, the primary Button 0.3s, Badge 0.15s. The Drawer replaces its 0.3s slide with a 150ms opacity fade (computed `transition: opacity 0.15s`, no transform and no animation under reduce; `transform 0.3s` without it), and its glow with a steady border. The template does not override these; the README's Known limits says so.

**Observed behaviour, not changed (the reviewer's findings):** the pairing confirmation persists across screens until Dismiss, and the last scene result persists on the Scenes screen (and is re-described from the current devices, so it leaves out devices removed since).

**Reviewer's survivors that were not guarded, on purpose:**
- The `^` and `$` anchors of `CODE_PATTERN` in `AddDeviceScreen.tsx`: equivalent to the input's `maxLength` of 6, so the mutants cannot be told apart through the UI.
- `globalThis.fetch?.()` (or any indirection) bypasses the static scan in `noNetworkOrStorage.test.ts`, which matches `fetch(`. The runtime spy in `App.test.tsx` would catch such a call only if the code path runs during that test. The static test is a net, not a proof.
- The focus ring of the primary Button is unconfirmed: the library draws a 2px accent ring at 50% alpha on an accent fill, which may be hard to see. Not changed here, not measured.

**What the reviewer could not check:** a real phone and a real finger; WebKit and Firefox; a screen reader; the template inside the site's preview dialog (PR B). These are on the "not checked" list above and stay there.

---

## Findings from checking the published page

Written during PR B (2026-10-18). Tools: the site's dev server (`vite`, port 5201) after `pnpm --filter cyberui-templates-site run sync-templates` (all four real builds), driven in headless Microsoft Edge 155 over the DevTools protocol by `puppeteer-core` 24.43.1 at 1440x900 and, with touch and mobile emulation, 390x844, with `prefers-reduced-motion` emulated both ways. The Claude Browser pane (a small 800x455 window) was used to look at the page and to try the Copy button, nothing was measured in it. The scripts (`site-check.mjs` from the plan, plus `layout-check.mjs`, `dialog-check.mjs` and `phone-page-check.mjs` written for this pass) and the two role-play interview files were kept outside the repository.

**Held, no fix needed:**
- `#/templates` shows four sections in order (monitoring, agent-panel, landing, mobile-app) under one h1 "Templates". The Mobile App badge reads "Blue accent", and its screenshot, "Run the live demo" and Copy start prompt are blue. The fit copy, the Heads-up and the example folds are neutral (looked at, not computed). Home says "4 templates ready." No sideways scroll at 1440 (`scrollWidth` 1425 with the scrollbar) or at 390 (`scrollWidth` 390, also with every example fold open).
- The screenshot (1440x900, 39 KB) shows the phone-framed app near the top, the dark gradient below it and the visible "Run the live demo" button under the nav, not over it.
- The phone frame, measured by `getBoundingClientRect` (the iframe's border box, so its own viewport is 388px: `innerWidth` 388):

  | Window | Dialog | Iframe | Centred in the preview body |
  |---|---|---|---|
  | 1440 | 1296x810 | **390x659** | yes (left and right gaps equal) |
  | 800 | 720x810 | 390x659 | yes |
  | 641 | 577x810 | 390x659 | yes |
  | 640 | 640x900, full screen | 608x751, no frame | n/a |
  | 600 | 600x900, full screen | 568x751, no frame | n/a |
  | 390 (touch) | 390x844, full screen | 358x695, no frame | n/a |

  The loading cover has the same box as the iframe (390x659 at x=517.5) while the preview loads. At 390 the app inside the preview runs at the visitor's width (`innerWidth` 356, `scrollWidth` 356).
- `site-check.mjs` printed exactly what the plan expected: frame 390; Add device changes the iframe's hash (`#/add`) and not the site's; saving returns to Devices inside the iframe with the dialog still open and the pairing notice shown; the dialog's close button still closes it after the iframe's history changed (`#/templates`); Esc pressed inside the app closes the dialog; Esc with the device sheet open closes the sheet and the dialog together (the README says so); a switch left off before the Code tab was still off after Live preview (the preview is not reloaded); the Code tab has six principles and nine tree lines.
- Dialog: "Run the live demo" opens `#/templates/mobile-app`, and Back closes it and stays on `#/templates`; a backdrop click, Esc on the dialog and the close button close it; loading `#/templates/mobile-app` directly, or reloading with it open, reopens it.
- Reduced motion: the dialog's `preview-dialog-in` animation is `none` under `reduce` and present without it; inside the preview the nav tab and row transitions are `0s` and no animation is running.
- The Code tab was read in the dialog: six principles with their excerpts, then the folder map of eight folders. Every excerpt is verbatim from the merged package (`check:code-tab`).
- The Copy start prompt text on the page (the fold shows the same `startPrompt(name, slug)` the button copies) names `npx --yes tiged patrickkuei/cyberui-templates/packages/mobile-app my-app`.

**Verbatim check of the examples:** the two interviews were run by subagents before this pass and saved whole and unedited outside the repository. The plan's `check-verbatim.mjs` printed `verbatim check OK (2 examples)` against the example text as it is shipped in `templateContent.ts` (the shipped data was dumped from the module and checked, not only the draft JSON), and it fails with the offending words when one word of a request is changed. Left out on purpose, by the owner's rule that "Where they'd get stuck" may only list what the library and the template did not cause: the hobbyist's remarks that the demo's data is spread over several files and that the sheet's readings are made up, and that `localStorage` is per phone (not caused by the template, but not one of the listed kinds of obstacle, so left out); the designer's remarks about which file is "the design", that the neon look is deep in the library, that the sheet may be shared by every device type, that the template says nothing is saved, the icons, the terminal and Node (not caused by the template, left out as outside the listed kinds) and the licensed brand font.

**Not checked:** the real production deploy (only happens after merge: the first time the production build is served from a subpath, the template's `base: './'` and the iframe's relative URL must resolve); `npx tiged patrickkuei/cyberui-templates/packages/mobile-app` against the published repository (cannot run before merge); what Copy start prompt actually puts on the clipboard (both Chromium windows used here refuse clipboard writes, so the site showed its own "Couldn't copy" fallback; the prompt text was read from the fold instead); the phone-sized frame in Firefox and Safari; a real phone, real safe-area insets and the on-screen keyboard; a screen reader.

---

## Findings from the redesign

Written during PR C (2026-10-19), after building the redesigned `packages/mobile-app` from the plan (`docs/superpowers/plans/2026-10-19-mobile-app-redesign.md`, Tasks 1 to 15). Tools: headless Microsoft Edge 155.0.4283.62 on Windows 11, driven over the DevTools protocol by `puppeteer-core` 24.43.1 (with `pngjs` 7.0.0 to read screenshot pixels) against the template's dev server (Vite 7.3.6, Node 20.20.2, npm 10.8.2, pnpm 10.34.2, cyberui-2045 2.8.0), with device emulation: touch input, mobile viewports of 320x568, 390x844 and 800x900 (the 800px runs without touch), and `prefers-reduced-motion` both ways. Screenshots of every screen, every step of Add device, the failed link, and a sheet of the glow at ten states were read by eye. The scripts are the ones in the plan, kept outside the repository, plus one small extra (`min-target.mjs`) that reports the smallest control. The Claude Browser pane was not used for measuring.

**The switch bug, reproduced before the fix and measured after.** Run against the shipped first version (Task 1), the knob check failed with the knob **6.0px above** the middle of the track on both Settings switches, from the CSS and from the pixels of a screenshot, and named the cause in one word: the knob's positioned ancestor was the `label`. After the redesign's one rule (`.touch-switch input + div { position: relative }`) the same measurement on both switches, on and off, at 320, 390 and 800px (twelve readings), gave **0.0px from the CSS and 0.0px from the pixels**, with the track as the positioned ancestor. A bare page with only the library's stylesheet, the markup its `Toggle` renders and one consumer rule (`label { min-height: 44px }`) reproduces it with nothing of this template on the page: the knob is 0 off-centre as shipped and **-6.0px** with the taller label (`label.relative`, track `static`, knob `after:absolute after:top-[2px]`).

**Needed a fix:** nothing beyond the switch rule itself. The numbers the plan predicted came out identically, so no code changed because of the browser check.

**Checked and held, with the numbers from this run:**
- No sideways scroll: `scrollWidth <= innerWidth` and no element past the right edge (the chips' own row excepted) on 10 screens (Home, five device pages, Rooms, Settings, Add device, Add room) at 320, 390 and 800px: 30 of 30 pairs. A 30-character unbroken device name (`Wwwwwwwwwwwwwwwwwwwwwwwwwwwwww`) at 320px: Home and its device page both fine.
- Touch targets: every control at least 44 by 44 on every screen at 390 and 320px (20 screen and width pairs) and on every step of Add device (start, scanning, results, link, details, code), with the label of each switch and radio and the slider's track band and thumb zone read from the computed `::before` offsets. The smallest native control found is 44.0px high (the "All 9" chip, 65.7x44 at both widths); the skip link when shown is 187.2x44. The check was shown to fail: with the chips' `min-height` at `2rem` it reports `button "All 9" 65.7x32.0` (plan author's run).
- Contrast, computed from the installed 2.8.0 stylesheet and `blue.css` (identical to the plan): default on base 12.92:1, default on surface 10.13:1, muted on base 6.02:1, muted on surface 4.72:1, accent on base 6.21:1, accent on surface 4.87:1, inverse on accent 6.21:1, warning on base 8.94:1 and on surface 7.01:1, error on base 5.27:1. The one failure is the library's `danger` Button, error on surface **4.13:1** (CyberUI#128, already filed). The glow: the glyph's white lines are 3.23:1 on the lit body at full level (worst case), 3.63:1 on the halo centre, 5.01:1 at mid level; the text colour would be 2.45:1, which is why a lit glyph is drawn in white.
- The glow is proportional: the mean blue value of the ring around a light's glyph is 61.2 at 5%, 61.8 at 25%, 75.0 at 50%, 103.6 at 75% and 131.8 at 100%, against 55.8 for the same light switched off; a plug on is 89.7, the thermostat 107.4, a sensor 49.4 and a lost light 53.1. The sheet was looked at: the halo widens and brightens with the level, the lit lines are white, the off light is muted, the lost one is dashed and dark.
- Keyboard: Tab through every screen and every step of Add device, with the library's 300ms transitions switched off so a ring is read at full size: Home 26 stops, a light's page 9, a thermostat's 10, a lost light's 4, a sensor's 4, Rooms 13, Settings 7, Add device 4, Add room 5; Add device scanning 1, results 6, link 1, name and room 4, code 3: **0 stops without a visible indicator**. Operated by keyboard alone: Space on a glyph power button flipped it, Enter on a row link opened the device page and put focus on its title, the arrows and End on the slider moved it (the Floor lamp's 35 became 45 after two arrow presses, and 100 after End), Space on a Settings switch flipped it, an arrow on the unit radios chose the other one, Enter in Add room added the room and returned to Rooms with the notice.
- Reduced motion: with `reduce`, the chips', nav tabs' and halo's transitions are `0s`, the scan's pulse has `animation-name: none`, the "Scanning…" line and the progress bar are still there, and one still ring remains (opacity 0.6); the scan over every screen found no element or pseudo-element with a transition or animation longer than 0 (the library's included). With `no-preference` the chips transition in 0.15s, the halo in 0.2s and the pulse animates. The "before" figures (the library's Button at 0.3s, the Toggle track at 0.3s and its knob at 0.15s, the Slider 0.1 to 0.15s, the RadioGroup 0.2s, Input 0.3s, Badge 0.15s) are the plan author's, not repeated here without the block.
- The look: no resting box-shadow on the Add device button (every shadow layer transparent), no `text-transform: uppercase` on any text on Home, no "Online" anywhere, no pink glow under a button.

**Library findings.** The knob is the one new finding of the redesign: **to file, not yet filed**, and by the owner's say-so only (nothing was filed and no issue or comment was touched in this pass). The proposed defect on patrickkuei/CyberUI is `Toggle: the knob is positioned against the <label>, so a taller or padded label displaces it out of the track`: version 2.8.0, the bare-page numbers above (0 as shipped, -6.0 with `label { min-height: 44px }`), the cause, the one-line fix to suggest (make the track `relative` instead of the label, which leaves the shipped layout identical), the alternative (document that the label must not be sized), this template's workaround and the browser check that found it, and a comment on #133 saying a touch-size option must keep the knob on the track. Searches of the existing issues for "knob" and "Toggle" found nothing about it (#120, #126 and #133 are about the accessible name, the focus ring and the touch size). When it is filed, its number replaces "Not yet filed upstream." in the README's last Known limit and goes in the comment above `.touch-switch input + div` in `App.css`. Nothing else is a new library finding: the Button's uppercase, resting glow and 300ms ring, and the library's animations under reduced motion, are design choices this template overrides (one line each in the README's Known limits), and the `Slider`'s magenta-ended fill is the `accent` variant doing what its name says. Every `CyberUI#` number cited in the README and in `src` (#120, #121, #126 to #133, and #123 to #125 and #130 in the README's Drawer note, #134 in its feature-request sentence) was checked against the open issue it names.

**Clean room** (Task 13): the package copied outside the workspace, plain `npm install` on Node 20.20.2 and npm 10.8.2 added 128 packages with no warnings and no errors, the build passed and **316 tests in 28 files** passed; the dev server answered 200; the standalone check found no `workspace:` range and no import leaving the package; the LICENSE is identical to the root one; `package.json` and `pnpm-lock.yaml` are unchanged. **Mutation run:** all **87** hand-made mutations of the plan's script were caught by a test on the first run on this copy (no survivors, nothing strengthened in this pass; the strengthening that brought the list to 87 was done while the plan was written).

**Code tab:** before the package was re-copied, `check:code-tab` failed on four principles of the first version's entry, as the plan predicted (the reducer's header comment, the `ROUTES` tuple, the Add device test and the starting devices); the entry was regenerated from the real files and `code tab OK (4 templates checked)` follows. The site's own tests (183 in 30 files) and build still pass.

**Not checked:** a real phone and a real finger (emulated touch events are not a finger); real safe-area insets on a notched device (the app bar, the bottom nav and the forms' button row pad themselves with `env(safe-area-inset-*)`, and a desktop window always reads 0); the on-screen keyboard resizing the page (the button row is sticky inside the form and cannot be confirmed above a real keyboard); iOS Safari's collapsing toolbars (so `dvh` and the sticky nav against a moving toolbar), and any other WebKit or Firefox browser (the glow's `overflow-x: clip` and an SVG radial gradient in a clipped tile are the layouts most at risk); a screen reader (VoiceOver, TalkBack, NVDA); the template inside the site's preview dialog with the new routes (PR D); real CI and the real deploy; `npx tiged` against the published repository (only after merge). The site's tagline, copy, screenshot and the two examples are still the first version's until PR D.

### Review round (PR C, 2026-10-19)

An independent reviewer mutation-tested the PR (196 mutations: 182 caught, 14 survived) and checked it in a browser. What was found, and what was done, with the numbers from the re-run (the same tools and method as above, headless Edge 155.0.4283.62):

**Fixed, each with a test that was seen to fail first:**
- **The screens trusted the `Connection` to honour its `AbortSignal`.** A `Connection` that ignores the signal could report progress, success or failure for a link that was cancelled, replaced (another id) or unmounted, and move a cancelled scan or link on to the next step. `LinkRun` and `AddDeviceScreen` now check `controller.signal.aborted` in every callback, and the contract in `connection/types.ts` and the README reads "should honour the signal; the screens defend anyway". Tests use a `Connection` that ignores the signal: an id changing from `a` to `b` mid-link, an unmount, Cancel on the Link step (does not reach "Name the device"), a cancelled scan answering late with a result, a failure, or progress for the next scan's bar.
- **A scan that failed for any other reason left "Scanning…" forever and an unhandled rejection** (the catch re-threw). It now shows "The scan failed: <message>" with Try again and "Enter a code instead", like the link's failure (one new line of copy, `CONNECT_COPY.scanFailed`). `LinkRun` already used a `LinkError`'s step for the failed row; a test now covers a `LinkError` at a step the connection never reported, and one covers the settle timer when the screen is left after the link finished but before it settled.
- **Focus obscured by the sticky bars (WCAG 2.4.11).** Tab to "Add room" on Rooms at 390x844 left its focus ring under the bottom nav (control 797.6 to 841.6, nav from 781.5) and a click at its centre landed on the nav. `html` now has `scroll-padding-top` (4rem plus the top inset) and `scroll-padding-bottom` (5rem plus the bottom inset), with a guard in `phoneRules.test.ts`. After: Add room at 390x844 sits at 713.6 to 757.6 (nav from 781.5) with the ring clear and the click landing on it; the Bedroom sensor's link at 800x600 and Add device at 320x568 likewise (all three: ring inside the band between the app bar and the nav, click lands on the control).
- **`.hero-room` clipped a 24-character unbroken room name at 320px** (the text ran from -32.8 to 352.8 inside a clipping `.hero`). `.hero-room`, `.hero-caption` and `.down-note` now have `overflow-wrap: anywhere` and are on the must-wrap list in `phoneRules.test.ts`; after, the text spans 23.5 to 296.5 and `scrollWidth` is 320.
- **Test gaps (the other survivors):** `leave()` asserted as a `replace` (not `assign`); no Back button on Home, Rooms or Settings (and one on the three pushed screens); a scanned device keeps its signal (the Garage sensor, one bar, shows "Weak signal" on Home). These and the new ones were re-proved by mutation in a copy outside the repo: **19 mutations, 19 caught** (the reviewer's #61, #71, #125, #133 and #136, the contract checks above, and the new guards). The first run had 2 survivors, both weak tests of my own (a late scan failure after Cancel, and a late progress call into the next scan), which were strengthened until caught.
- **Nits:** `devicePath`'s comment no longer says Rooms builds it; `index.html` no longer mentions the device sheet and has an empty icon (no `/favicon.ico` 404); the thermostat's target is announced from a polite live region of visually hidden text with the drawn numeral hidden from assistive technology (an `aria-label` on a `<p>` is not reliably announced); the reducer enforces the 24-character room name limit; `.glyph-button:hover` no longer tints the static tile of a sensor or a nearby device; `noHexColors.test.ts` also rejects `rgb()`, `rgba()`, `hsl()`, `hsla()`, `hwb()`, `lab()`, `lch()`, `oklab()` and `oklch()` outside `theme/blue.css` (the stylesheet had none, so no exception was needed); the README no longer tells the history of the `Drawer`.

**Skipped:** nothing. No design call was needed.

**Re-measured after the fixes:** `tsc` clean and `vite build` clean; **340 tests in 28 files** (316 before this round); site tests 183 in 30 files; `check:code-tab`, `check:license`, `check:templates-readme`, `check:process-excerpts`, `check:template-builds` and `test:scripts` (33) pass; `pnpm install --frozen-lockfile` succeeds; a clean-room `npm install` (Node 20.20.2, npm 10.8.2, 128 packages, no warnings) builds and passes all 340 tests. In the browser: 30 of 30 no-sideways-scroll pairs at 320, 390 and 800px, every control still 44px or more (smallest 44.0px high, the "All 9" chip, at 320 and 390; 26 of 26 screen and width pairs), the knob still 0.0px from the CSS and from the pixels on both switches, on and off, at all three widths, 97 Tab stops with none lacking a visible focus ring, no element still animating under `prefers-reduced-motion: reduce`, and the glow still growing with the level. Not checked again, still: a real phone, WebKit and Firefox, a screen reader (so the thermostat's live region is verified in markup and in tests, not heard), the on-screen keyboard.

---

## Findings from checking the redesigned Mobile App on the site

Written during PR D (2026-10-19), after PR C (#71) was merged. Tools: the site's dev server (`vite`, port 5201) after `pnpm --filter cyberui-templates-site run sync-templates` (all four real builds), driven in headless Microsoft Edge 155 over the DevTools protocol by `puppeteer-core` 24.43.1 at 1440x900 and, with touch and mobile emulation, 390x844, with `prefers-reduced-motion` emulated both ways. The scripts (`site-check.mjs` and `layout-check.mjs` from the plan, plus `extra-check.mjs` and `back-check.mjs` for the items those do not cover), the two interview files and the draft and shipped example JSON were kept outside the repository.

**Examples.** The two persona interviews (a home-lab hobbyist, a designer prototyping for a client) were role-plays by language-model subagents run by the coordinator from the plan's brief, saved whole and unedited outside the repository. The plan's `check-verbatim.mjs` printed `verbatim check OK (2 examples)` with no warning against the draft JSON and again against the data dumped from the built `templateContent.ts` (the two are identical). Left out on purpose, by the owner's rule that "Where they'd get stuck" may only list what the library and the template did not cause: from the hobbyist, that the app is a demo front end with nothing in it that talks to anything (a remark about the template), that the scan cannot discover anything from a browser (the passage is about the template's scan flow, so left out although the underlying browser limit is not the template's fault), and that the signal figure, Disconnect and Reconnect and the scenes assume the fiction; from the designer, that nothing is saved when the page is reloaded, that a new device does not persist, that a blind or a speaker has no page of its own, that the colour may be scattered or fixed by the library, and the vocabulary of the AI's answers (not one of the listed kinds of obstacle, as in the first version's review). From "how they'd know it worked": the hobbyist's closing line about recognising the demo by its made-up numbers, the designer's closing clause about telling the client the hub and devices are made up, and, in the hobbyist's first "how they'd know it worked" point, a clause about wifi and the side of the room that did not make sense (cut with an ellipsis, the rest of the point is unchanged). The requests are kept whole: a few of them ask the AI what is real and what is made up, or mention "the demo", as the first version's examples did; they are what the person types, not a remark about the template, but this is a judgment for the owner.

**Test wording changed from the plan.** The plan's test `describes the redesigned mobile app everywhere, not the first one` rejects the phrase "one-tap scenes". The designer's request (verbatim) says "rename the three one-tap scenes to Reading, Movie and Night" on the light page, which is the redesigned app's presets (the interview brief itself says "three one-tap scenes"). In the first version the same words described a Scenes tab. So the phrase is not stale in the examples; it stays on the tagline test (where it was the first version's feature list) and was taken off the test that reads the examples.

**Held, no fix needed:**
- The screenshot (1440x900, 55 KB) is the redesigned app in the 390x740 frame: the app bar with "Back" and "Demo", the glowing bulb, "Desk lamp", "Living room", "70%", a solid blue slider, "Turn off", the three presets under "Scenes" and the top of the Link panel; no Devices list, no status badge, no cyan, yellow or pink. On the Templates page it loads at its natural 1440x900, with the "Run the live demo" button visible under it.
- `#/templates`: four sections in order under one h1 "Templates", the new tagline, three use-if lines (the third mentions rooms), the Heads-up and "Probably not for you" read as intended, the two example folds are the new ones and mention no bottom sheet, pairing form, Scenes tab or Add device form, the labels say "they", the start prompt names `packages/mobile-app` and the terminal fold shows `npx --yes tiged patrickkuei/cyberui-templates/packages/mobile-app my-app`. Home says "4 templates ready." and lists no template by name. No sideways scroll at 1440 (`scrollWidth` 1425 with the scrollbar) or at 390 (390).
- The dialog at 1440: the iframe is 390 wide and centred (gaps 436 and 436). `site-check.mjs` printed exactly what the plan expected: a row opens `#/device/desk-lamp` inside the iframe with the site's hash unchanged and no bottom nav; Back in the app returns to Home with the dialog open; Add device through the scripted scan and link (real timers) returns to Home with "Added Shelf lamp to Living room." and the new row; the dialog's own close button still closes it after the iframe's history changed; Esc pressed inside the app closes it on Home and on a device's page; a switch left off before the Code tab is still off after Live preview; the Code tab has seven principles (Single source of truth, Typed and exhaustive, Light is state, A seam for the real thing, No inline styles, Tested, Phone rules in one place) and a ten-line folder tree with `src/connection`. Also: reloading with the dialog open reopens it, browser Back closes it and stays on `#/templates`, a backdrop click and Esc on the dialog close it.
- Reduced motion: the dialog's entry animation is `none` and nothing under `.app` in the preview has a transition or an animation.
- At 390 with touch: the dialog is full screen (390x844), the preview is 358x695 with no frame and the app inside runs at the visitor's width (`innerWidth` 356, no sideways scroll), a device's page opens inside the iframe (`#/device/floor-lamp`, site hash unchanged, no sideways scroll) and Back returns to Home.

**Not checked:** the real production deploy (only happens after merge: the first time the redesigned build is served from a subpath, and whether the live preview serves the new build and not a cached first version); `npx tiged patrickkuei/cyberui-templates/packages/mobile-app` against the published repository (after merge); the Copy start prompt's clipboard write (headless Edge); the phone-sized frame in Firefox and Safari; a real phone, real safe-area insets and the on-screen keyboard; a screen reader. Two monitoring tests (`App.actionPanel` and `App` default route) timed out once at Vitest's 5 s limit in the first serial run of the whole suite and passed in the rerun of the whole suite and when run alone, as the plan warns for a loaded machine.
