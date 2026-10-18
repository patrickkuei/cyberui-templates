# Kestrel mobile app (template)

A phone-first home device controller built with [cyberui-2045](https://www.npmjs.com/package/cyberui-2045): a Home screen of rooms and devices where each device's drawing glows with how much it is on, a full page per device, rooms with a power figure, a connect flow (scan, pick, link, name) and settings. Kestrel is a fictional hub: swap in your own app by editing the files in `src/data/`.

**Nothing here is connected to anything: no device is controlled, nothing is discovered or paired, nothing is sent or saved.** The app says so in three places: a small "Demo" badge in the app bar, a sentence in Settings ("Template demo: Kestrel is fictional and controls nothing."), and a line on the Scan screen ("This scan is scripted: nothing is discovered."). Delete those when you make the app real.

- **Real:** the bottom navigation and the hash routes (Back closes a device's page, Add device and Add room), every switch, slider, preset and button (they change the in-memory state, and every screen follows), the room filter, rooms you add and remove (a room can only be removed while it is empty), the temperature unit (Celsius is stored, Fahrenheit is only how it is shown), and the forms' own validation (a room needs a unique name, a device needs a name, a pairing code is six letters or numbers).
- **Mock:** the devices and everything about them (their link, signal, latency, battery and wattage are fixed, nothing is measured, and a room's power figure is derived from the invented wattages), the scan and the link (they wait on timers and return a fixed list, see `src/connection/`; the Hall light is scripted to fail so the failure state can be seen), the two settings switches ("Alert me when a device goes offline" and "Remote access" are remembered in memory; no notification is ever scheduled or requested), and all the names and readings. A reload puts the starting data back.
- **Images:** none. The visuals are cyberui-2045 components, CSS and inline SVG, so the package has no image files to replace or license.

```bash
npm install && npm run dev   # start the dev server
npm run build                # type-check and build to dist/
npm test                     # run the test suite
```

Requires Node 20.19 or newer. On a phone, open the dev server's address (`npm run dev -- --host`) or the built page; a desktop browser with its device toolbar is fine for the layout.

## The design in six lines

- **Place before device.** Rooms are how you move around: a chip per room with its count, rooms as headings, and a Rooms screen.
- **Two depths.** Home is for glancing and flipping a switch; a device's own page (`#/device/desk-lamp`) is for everything else.
- **Light is state.** A device that is on is lit in the accent, in proportion to its level; a device that is off is dark. There is no "Online" badge anywhere: status shows only by exception (a small amber mark, a dashed row).
- **Numbers are the typography.** One big tabular numeral per thing, sentence case, no all-caps labels.
- **Boldness in one place.** The glyphs glow ([src/components/Glyph.tsx](src/components/Glyph.tsx), [src/utils/glow.ts](src/utils/glow.ts)); the buttons are flat.
- **Motion only answers a tap,** and is off under `prefers-reduced-motion`.

## Re-theming

The blue accent is two color tokens in [src/theme/blue.css](src/theme/blue.css), imported right after the library's stylesheet in [src/main.tsx](src/main.tsx). cyberui-2045's components read those tokens, so changing the two values re-themes the whole app, the glow included. `--color-primary` (magenta) is left alone on purpose. In this app the accent means "on" (a lit glyph, a lit value, the selected chip) and the library's own amber and red mean "look at this" (a low battery, a weak signal, a lost device), so keep your accent clear of those; the file's comment has the contrast numbers for this blue. Check 4.5:1 for text on both `--color-base` and `--color-surface` when you pick another, and 3:1 for the white lines of a lit glyph on the brightest the glow gets (the accent at 80% under a 40% body: the comment above `.glyph--lit` in [src/App.css](src/App.css) has the figure, 3.2:1 for this blue). Two library quirks to know when you add components: `Select`'s default variant glows magenta where `Input`'s uses the accent (this app uses `variant="secondary"` on `Select`), and the library's `Slider` fills with a gradient that ends in magenta (App.css sets a solid accent).

## Where your data goes

Everything the app says that is not a device comes from files you can edit without touching a component:

- [src/data/devices.ts](src/data/devices.ts): the starting rooms and devices, each with a room, a kind (`light`, `plug`, `thermostat` or `sensor`), a link state, a signal and a latency. A light or plug carries a wattage; a room's total is derived from them ([src/utils/summary.ts](src/utils/summary.ts)) and never stored.
- [src/data/presets.ts](src/data/presets.ts): the fixed presets (Reading, Movie and Night for lights; Heat, Eco and Off for the thermostat).
- [src/data/nearby.ts](src/data/nearby.ts): the devices the scripted scan "finds", and which link is scripted to fail.
- [src/data/settings.ts](src/data/settings.ts): the settings' defaults.
- [src/data/product.ts](src/data/product.ts): the app's name, the screen titles, and the words on every screen.

State is one `useReducer` in [src/App.tsx](src/App.tsx), and [src/state/reducer.ts](src/state/reducer.ts) is the only place it changes: every change is an `Action` in a union, so an action without a case is a compile error. That reducer is the whole mock backend. To connect a real hub, send the request where the action is dispatched (or in an effect that watches the state) and keep the reducer for the instant update. To add a screen, add its id to `ROUTES` in [src/router/useHashRoute.ts](src/router/useHashRoute.ts): the compiler then lists what is still missing (a screen in `src/App.tsx`, a title in `src/data/product.ts` and, for a pushed screen, the tab it returns to). A new device kind is the same: add it to `KindFields` in [src/data/types.ts](src/data/types.ts) and the compiler lists its drawing, label and controls.

Before you publish, replace the title, description and theme colour in [index.html](index.html). They describe the fictional product, and link previews read them, not your React code.

### Making Add device and Reconnect real: the Connection

Scanning and linking go through one small interface, `Connection` in [src/connection/types.ts](src/connection/types.ts): `scan()` and `link(id)`, each a promise with a progress callback and an `AbortSignal`. [src/connection/scripted.ts](src/connection/scripted.ts) is the shipped implementation: it waits on timers and returns the fixed list. It is the seam where a real implementation goes (the browser's Web Bluetooth API, an MQTT or WebSocket client, your own backend): write another `Connection`, pass it as `<App connection={...} />` in `src/main.tsx`, and the Scan, Link and Reconnect screens keep working because they only call those two methods and draw what the callbacks report. Put that code somewhere [src/noNetworkOrStorage.test.ts](src/noNetworkOrStorage.test.ts) does not look, or remove the names you now need from its list on purpose.

Two things that are deliberate and easy to trip over. Routes are hash routes (`#/rooms`), so the app works on any static host and inside an iframe, and the browser's Back button closes a pushed screen instead of leaving the app. And a scan only starts when someone presses Start scan.

## Phone checklist

The rules this template follows, where each lives, and how to check it. Layout cannot be tested without a browser, so most of these are checked by looking.

| Rule | Where it is | How to check it |
|---|---|---|
| Touch targets of at least 44 by 44 CSS pixels | `--touch` and the `.touch-*` rules in [src/App.css](src/App.css); [src/components/TouchRow.tsx](src/components/TouchRow.tsx) explains why (cyberui-2045's `Toggle`, `Checkbox`, `RadioGroup` rows and `Slider` are smaller than 44px as shipped). Rows, chips, presets and the glyph power button (48px) are sized in the same file | In the browser's inspector, hover each control and read its size; [src/phoneRules.test.ts](src/phoneRules.test.ts) fails if a rule is deleted |
| A switch's knob sits inside its track | `.touch-switch input + div { position: relative }` in [src/App.css](src/App.css): the library draws the knob against the nearest positioned element, which is the `<label>`, and the 44px label would otherwise lift the knob 6px out of the 32px track | Open Settings and look at both switches, on and off; the knob must be centred on the track. A test cannot see this: [src/phoneRules.test.ts](src/phoneRules.test.ts) only checks the rule is still there |
| Safe-area insets | `viewport-fit=cover` in [index.html](index.html); `env(safe-area-inset-*)` on the app bar, bottom nav and the forms' button row in [src/App.css](src/App.css). The library adds none | A phone with a notch or home indicator, or your browser's device emulation with safe areas; a desktop window always reads 0 |
| `dvh`, not `vh` | `.app` in [src/App.css](src/App.css), with a `vh` fallback written first | Scroll a phone's browser so its toolbar collapses; the bottom nav must stay on screen |
| No hover-only controls, no sticky hover | Every `:hover` in [src/App.css](src/App.css) is inside `@media (hover: hover)`; every action is a visible control | Emulate touch and tap a row; nothing may stay highlighted |
| Reduced motion | One block at the end of [src/App.css](src/App.css) sets every transition and animation under `.app` to 0s, the library's included; this template's own transitions and the scan's pulse are inside `no-preference`. The scan keeps its progress bar and its "Scanning…" line | Turn on "reduce motion" in the system or the browser's rendering tools and start a scan |
| The on-screen keyboard | The forms' fields are 16px (iOS does not zoom them), use `autoCapitalize`/`autoComplete` and `enterKeyHint`, and the button row is sticky inside the form rather than a fixed bar | Focus a field on a real phone and check Add device and Add room stay reachable |
| No sideways scroll | One column, `max-width: 30rem`, centred on wide screens; every place that prints a device name (up to 30 characters with no break) may wrap anywhere; the room chips scroll sideways inside their own row, and nothing else does; the glow's overflow is clipped on a device's page | Add a device named with 30 `W`s, then compare `document.documentElement.scrollWidth` with the window width at 320, 390 and 800px |
| Keyboard operation | Every control is a native element or a library component; the ones that are not the library's draw their own focus ring (one rule in [src/App.css](src/App.css)) | Tab through every screen: each stop must show a ring; Space flips a glyph power button, Enter opens a row |
| Contrast | Text is 4.5:1 or better on `--color-base` and `--color-surface`; the lit glyph's white lines are 3.2:1 on the brightest glow | The figures are in the comments of [src/theme/blue.css](src/theme/blue.css) and [src/App.css](src/App.css) |

It was measured in desktop Chromium (Microsoft Edge) with device emulation: viewports of 320, 390 and 800px, touch input and reduced motion, and by pressing Tab through every screen. **Not checked:** a real phone, iOS Safari and other WebKit or Firefox browsers, real safe-area insets, the on-screen keyboard resizing the page, a screen reader. Do those before you rely on them.

## Known limits (cyberui-2045 2.8.0)

These are in the library, not in this template, and the template does not work around them silently. Where one is filed upstream it is listed with its issue on [patrickkuei/CyberUI](https://github.com/patrickkuei/CyberUI/issues).

- **This template does not use `Drawer`.** An earlier version had a bottom sheet and met four open problems with it, which are still open and still valid, so if you add a `Drawer` you will meet them too: it does not trap Tab although it is `aria-modal` (CyberUI#123), its border animation cycles through hard-coded colors and ignores the accent (CyberUI#124), its own title is 3.45:1 on its surface (CyberUI#125), and setting its `isOpen` to false yourself restores no focus (CyberUI#130).
- **`Toggle` has no accessible name unless it has an `aria-label`, or an `id` that its visible `label` can point at.** The Settings switches have a visible `label` and its `id`. (CyberUI#120)
- **`Input` does not announce a new error**, so a failed Save moves focus to the first field with a problem. (CyberUI#121)
- **`Toggle` draws no keyboard focus indicator** (its focus classes set a ring color but never a width), so `.touch-switch input:focus-visible + div` in [src/App.css](src/App.css) draws one. (CyberUI#126)
- **`Slider` sets no `touch-action`**, so a touch drag that drifts a little up or down inside something that can scroll is cancelled by the browser part-way; the `.touch-slider` wrapper in [src/App.css](src/App.css) sets `touch-action: none`. (CyberUI#127)
- **`Select` does not tie its `error` to the field** (no `aria-invalid`, no `aria-describedby`), so no form here gives a `Select` an error. (CyberUI#129)
- **There is no bottom navigation, no safe-area or `dvh` support, no way to make `Toggle`, `Checkbox` or `Slider` touch-sized, and no swipeable row**, so this template hand-builds the first, writes the safe-area and `dvh` rules itself, wraps the small controls in `TouchRow`, and has no swipe. These are filed upstream as feature requests. (CyberUI#131 bottom navigation, #132 safe-area and `dvh`, #133 touch-size, #134 swipe and action sheet)
- **The `Remove device` button is the library's `danger` variant**, whose red text is 4.13:1 on its own surface (it is 18px bold, which is not "large text" for the WCAG 3:1 allowance). (CyberUI#128)
- **The library animates its Buttons, `Toggle`, `Slider`, `RadioGroup`, `Input` and `Badge` under `prefers-reduced-motion`** (measured: 0.1s to 0.3s), so this template's stylesheet switches every transition and animation under `.app` off for people who ask for less motion.
- **A `Toggle` is only as tall as its track,** and the knob is positioned against the `<label>` around it, not the track. Anything that stretches the label (this template's 44px touch rule) lifts the knob out of the track; App.css makes the track the positioned element to put it back. Not yet filed upstream.

## Principles this code follows

| Principle | Where to see it |
|---|---|
| **Single source of truth** | The list of screens is `ROUTES` in [src/router/useHashRoute.ts](src/router/useHashRoute.ts), and all app state changes in one reducer, [src/state/reducer.ts](src/state/reducer.ts). The devices, rooms, presets and words live in [src/data/](src/data/), and every figure the screens show about several devices (how many are on, a room's watts, the sentence at the top of Home) is derived from the devices in [src/utils/summary.ts](src/utils/summary.ts). |
| **Typed and exhaustive** | `Route` is derived from `ROUTES`, and `Record<Route, …>` maps in [src/App.tsx](src/App.tsx) and [src/data/product.ts](src/data/product.ts) turn "added a screen but forgot its page or title" into a compile error. The reducer's `Action` union is checked with `assertNever`, and drawings and labels are `Record<DeviceKind, …>`. |
| **No inline styles, no stray colors** | All styling is in CSS classes, and even the glow's brightness is an SVG attribute. [src/noInlineStyles.test.ts](src/noInlineStyles.test.ts) fails if a `style={...}` prop appears, and [src/noHexColors.test.ts](src/noHexColors.test.ts) fails if any stylesheet other than `blue.css` contains a hex color. |
| **Nothing sent, nothing saved** | [src/noNetworkOrStorage.test.ts](src/noNetworkOrStorage.test.ts) fails if the source gains a network, Bluetooth, notification or storage call, and [src/App.test.tsx](src/App.test.tsx) checks that using the app never reaches `fetch`, Bluetooth or notifications. |
| **A seam where the real thing goes** | Scanning and linking sit behind the `Connection` in [src/connection/types.ts](src/connection/types.ts), with a scripted implementation in [src/connection/scripted.ts](src/connection/scripted.ts) that the tests run on a fake clock. |
| **Phone rules in one place** | The touch-target, switch-knob, safe-area, `dvh`, hover and motion rules are in [src/App.css](src/App.css), each with its reason, and [src/phoneRules.test.ts](src/phoneRules.test.ts) fails when one is deleted. |
| **Tested** | A test file sits next to each screen, component, icon set, data file with logic and helper, covering behavior (the room filter, presets, the scan and link steps, the failed link, adding and removing rooms, the unit change, the routes and focus) rather than markup. The exceptions are `src/main.tsx`, the stylesheets, the type-only `src/data/types.ts` and `src/connection/index.ts`, and `ScreenTitle` and `src/data/settings.ts`, which `src/App.test.tsx` and the Settings tests exercise. |
