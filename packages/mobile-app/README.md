# Kestrel mobile app (template)

A phone-first home device controller (a list of devices with a switch on each row, a bottom sheet of controls, one-tap scenes, a pairing form and a few settings) built with [cyberui-2045](https://www.npmjs.com/package/cyberui-2045). Kestrel is a fictional hub: swap in your own app by editing the files in `src/data/`.

**Nothing here is connected to anything: no device is controlled, nothing is paired, nothing is sent or saved.** The app says so with a small "Demo" badge in the app bar, in Settings, and in the confirmation shown after you pair a device ("Template demo: Kestrel is fictional and controls nothing."). Delete those when you make the app real.

- **Real:** the bottom navigation and the hash routes (Back closes Add device), every switch and slider (they change the in-memory state, and the rows follow), the temperature unit (Celsius is stored, Fahrenheit is only how it is shown), applying a scene (it changes several devices and says which), removing a device, and the pairing form's own validation (a name is required and the code must be six letters or numbers).
- **Mock:** the devices, their status (online, low battery and offline are fixed, nothing is detected), pairing (any six letters or numbers are accepted and dropped), the two settings switches ("Alert me when a device goes offline" and "Remote access" are remembered in memory; no notification is ever scheduled or requested), and all the names and readings. A reload puts the starting data back.
- **Images:** none. The visuals are cyberui-2045 components, CSS and inline SVG, so the package has no image files to replace or license.

```bash
npm install && npm run dev   # start the dev server
npm run build                # type-check and build to dist/
npm test                     # run the test suite
```

Requires Node 20.19 or newer. On a phone, open the dev server's address (`npm run dev -- --host`) or the built page; a desktop browser with its device toolbar is fine for the layout.

## Re-theming

The blue accent is two color tokens in [src/theme/blue.css](src/theme/blue.css), imported right after the library's stylesheet in [src/main.tsx](src/main.tsx). cyberui-2045's components read those tokens, so changing the two values re-themes the whole app. `--color-primary` (magenta) is left alone on purpose. The app shows device status in the library's own green, amber and red, so keep your accent clear of those; the file's comment has the contrast numbers for this blue (check 4.5:1 on both `--color-base` and `--color-surface` when you pick another). Two library quirks to know when you add components: `Card` gives its body text the magenta primary color (the `card-surface` class in [src/App.css](src/App.css) resets it), and `Select`'s default variant glows magenta where `Input`'s uses the accent (this app uses `variant="secondary"` on `Select`).

## Where your data goes

Everything the app says that is not a device comes from files you can edit without touching a component:

- [src/data/devices.ts](src/data/devices.ts): the starting devices, each with a room, a kind (`light`, `plug`, `thermostat` or `sensor`) and a status.
- [src/data/scenes.ts](src/data/scenes.ts): the three scenes, each a list of changes by device id.
- [src/data/settings.ts](src/data/settings.ts): the settings' defaults.
- [src/data/product.ts](src/data/product.ts): the app's name, the screen titles, the form's words and the demo sentence.

State is one `useReducer` in [src/App.tsx](src/App.tsx), and [src/state/reducer.ts](src/state/reducer.ts) is the only place it changes: every change is an `Action` in a union, so an action without a case is a compile error. That reducer is the whole mock backend. To connect a real hub, send the request where the action is dispatched (or in an effect that watches the state) and keep the reducer for the instant update. Pairing is in [src/screens/AddDeviceScreen.tsx](src/screens/AddDeviceScreen.tsx): the comment in `onSubmit` says where your pairing request goes, and the device should be added only once it succeeds. To add a screen, add its id to `ROUTES` in [src/router/useHashRoute.ts](src/router/useHashRoute.ts): the compiler then lists what is still missing (a screen in `src/App.tsx` and a title in `src/data/product.ts`). A new device kind is the same: add it to `KindFields` in [src/data/types.ts](src/data/types.ts) and the compiler lists its icon, label and sheet controls.

Before you publish, replace the title, description and theme colour in [index.html](index.html). They describe the fictional product, and link previews read them, not your React code.

Two things that are deliberate and easy to trip over. Routes are hash routes (`#/scenes`), so the app works on any static host and inside an iframe, and the browser's Back button closes Add device instead of leaving the app. And pressing Escape closes the device sheet; if you embed this app in a page that also closes on Escape, both close.

## Phone checklist

The rules this template follows, where each lives, and how to check it. Layout cannot be tested without a browser, so most of these are checked by looking.

| Rule | Where it is | How to check it |
|---|---|---|
| Touch targets of at least 44 by 44 CSS pixels | `--touch` and the `.touch-*` rules in [src/App.css](src/App.css); [src/components/TouchRow.tsx](src/components/TouchRow.tsx) explains why (cyberui-2045's `Toggle`, `Checkbox`, `RadioGroup` rows and `Slider` are smaller than 44px as shipped) | In the browser's inspector, hover each switch, slider and nav tab and read its size; [src/phoneRules.test.ts](src/phoneRules.test.ts) fails if a rule is deleted |
| Safe-area insets | `viewport-fit=cover` in [index.html](index.html); `env(safe-area-inset-*)` on the app bar, bottom nav, Save row and device sheet in [src/App.css](src/App.css). The library adds none | A phone with a notch or home indicator, or your browser's device emulation with safe areas; a desktop window always reads 0 |
| `dvh`, not `vh` | `.app` in [src/App.css](src/App.css), with a `vh` fallback written first | Scroll a phone's browser so its toolbar collapses; the bottom nav must stay on screen |
| No hover-only controls, no sticky hover | Every `:hover` in [src/App.css](src/App.css) is inside `@media (hover: hover)`; every action is a visible control | Emulate touch and tap a row; nothing may stay highlighted |
| Reduced motion | The only transitions are under `prefers-reduced-motion: no-preference`; the library's Drawer honours the setting itself | Turn on "reduce motion" in the system or the browser's rendering tools |
| The on-screen keyboard | The form's fields are 16px (iOS does not zoom them), use `autoCapitalize`/`autoComplete` and `enterKeyHint`, and the Save row is sticky inside the form rather than a fixed bar | Focus a field on a real phone and check Save stays reachable |
| No sideways scroll | One column, `max-width: 30rem`, centred on wide screens | Compare `document.documentElement.scrollWidth` with the window width at 320, 390 and 800px |

It was measured in desktop Chromium (Microsoft Edge) with device emulation: viewports of 320, 390 and 800px, touch input, safe-area insets and reduced motion. **Not checked:** a real phone, iOS Safari and other WebKit or Firefox browsers, the on-screen keyboard resizing the page, a screen reader, and how a real notch or home indicator looks. Do those before you rely on them.

## Known limits (cyberui-2045 2.8.0)

These are in the library, not in this template, and the template does not work around them silently. Where one is filed upstream it is listed with its issue on [patrickkuei/CyberUI](https://github.com/patrickkuei/CyberUI/issues).

- **The device sheet is a `Drawer`, which does not trap Tab** although it is `aria-modal`: Tab can move into the page behind it. Escape and Done still work. (CyberUI#123)
- **The Drawer's border animation cycles through hard-coded colors** and ignores the accent; `.device-sheet` in [src/App.css](src/App.css) holds it at a steady accent border instead. (CyberUI#124)
- **The Drawer's own title is 3.45:1 on its surface**, so the sheet writes its own heading and passes no `title`. (CyberUI#125)
- **`Toggle` has no accessible name unless it has an `id`** (for its visible label) or an `aria-label`; every switch here has both. (CyberUI#120)
- **`Input` does not announce a new error**, so a failed Save moves focus to the first field with a problem. (CyberUI#121)
- **`Toggle` draws no keyboard focus indicator** (its focus classes set a ring color but never a width), so `.touch-switch input:focus-visible + div` in [src/App.css](src/App.css) draws one. (CyberUI#126)
- **`Slider` sets no `touch-action`**, so a touch drag that drifts a little up or down inside something that can scroll (the device sheet on a short screen) is cancelled by the browser part-way; the `.touch-slider` wrapper in [src/App.css](src/App.css) sets `touch-action: none`. (CyberUI#127)
- **`Select` does not tie its `error` to the field** (no `aria-invalid`, no `aria-describedby`), so the Add device form never gives a `Select` an error. (CyberUI#129)
- **Setting a `Drawer`'s `isOpen` to false yourself restores no focus**, unlike Escape, so the Devices screen puts focus back on the row that opened the sheet. (CyberUI#130)
- **There is no bottom navigation, no safe-area or `dvh` support, no way to make `Toggle`, `Checkbox` or `Slider` touch-sized, and no swipeable row**, so this template hand-builds the first, writes the safe-area and `dvh` rules itself, wraps the small controls in `TouchRow`, and uses a bottom sheet instead of swipe. These are filed upstream as feature requests. (CyberUI#131 bottom navigation, #132 safe-area and `dvh`, #133 touch-size, #134 swipe and action sheet)
- **The `Remove device` button is the library's `danger` variant**, whose red text is 4.13:1 on the sheet's surface (it is 18px bold, which is not "large text" for the WCAG 3:1 allowance). (CyberUI#128)

## Principles this code follows

| Principle | Where to see it |
|---|---|
| **Single source of truth** | The list of screens is `ROUTES` in [src/router/useHashRoute.ts](src/router/useHashRoute.ts), and all app state changes in one reducer, [src/state/reducer.ts](src/state/reducer.ts). The device list, scenes and words live in [src/data/](src/data/). |
| **Typed and exhaustive** | `Route` is derived from `ROUTES`, and `Record<Route, …>` maps in [src/App.tsx](src/App.tsx) and [src/data/product.ts](src/data/product.ts) turn "added a screen but forgot its page or title" into a compile error. The reducer's `Action` union is checked with `assertNever`, and icons, labels and status badges are `Record<DeviceKind, …>` or `Record<DeviceStatus, …>`. |
| **No inline styles, no stray colors** | All styling is in CSS classes. [src/noInlineStyles.test.ts](src/noInlineStyles.test.ts) fails if a `style={...}` prop appears, and [src/noHexColors.test.ts](src/noHexColors.test.ts) fails if any stylesheet other than `blue.css` contains a hex color. |
| **Nothing sent, nothing saved** | [src/noNetworkOrStorage.test.ts](src/noNetworkOrStorage.test.ts) fails if the source gains a network, Bluetooth, notification or storage call, and [src/App.test.tsx](src/App.test.tsx) checks that using the app never reaches `fetch`, Bluetooth or notifications. |
| **Phone rules in one place** | The touch-target, safe-area, `dvh`, hover and motion rules are in [src/App.css](src/App.css), each with its reason, and [src/phoneRules.test.ts](src/phoneRules.test.ts) fails when one is deleted. |
| **Tested** | A test file sits next to each screen, component, icon set, data file with logic and helper, covering behavior (pairing and its validation, the device sheet, scenes, the unit change, the routes and focus) rather than markup. The exceptions are `src/main.tsx`, the stylesheets, the type-only `src/data/types.ts`, and `ScreenTitle` and `src/data/settings.ts`, which `src/App.test.tsx` and the Settings tests exercise. |
