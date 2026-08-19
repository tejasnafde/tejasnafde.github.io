# tn07 installed-app contract

This file extends the visual contract in
[`STYLE.md`](https://tn07.dev/design/STYLE.md) for installed applications. It
is not a second design system. It adds mechanics that CSS cannot express and
must not restate colors, spacing values, type sizes, radii or motion values.

Tokens: <https://tn07.dev/design/tokens.css>

## Precedence and discovery

The order is mechanical:

1. The consuming repo's `AGENTS.md` or `CLAUDE.md` points to these contracts.
2. `STYLE.md` owns visual identity, semantic roles and shared values.
3. This file owns installed-shell and platform behavior.
4. A local component may implement those rules but may not redefine them.

If the two contracts appear to disagree, `STYLE.md` wins for visual decisions
and this file wins only for native shell mechanics. Fix the shared contract
instead of adding a local exception.

## Pick rules by rendering technology

- A browser, PWA, Electron renderer or WebView follows `STYLE.md`, including
  its "Mobile web and browser-engine apps" section.
- React Native, Expo, SwiftUI and Jetpack Compose follow the native-widget
  rules below.
- A hybrid app follows both, each inside its own rendering layer.

Product category does not decide the contract. Rendering technology does.

## Identity and tokens

Every installed product registers the same five identity choices in the table
in `STYLE.md`: light accent, dark accent, card radius, body font and mono font.
The app icon and store artwork use that identity, but never create a second
accent.

Native adapters map the shared semantic names, not copied prose:

- surfaces: `bg`, `surface`, `raised`
- separators: `line`, `line-2`
- text: `ink`, `ink-2`, `ink-3`
- identity: `accent`, `accent-subtle`, `accent-ink`
- status: `pos`, `neg`, `warn`, `sem-ink`
- layout: `sp-1` through `sp-8`
- motion: `dur-1` through `dur-3`, plus `ease`
- type: the shared scale, including `text-input`

Do not copy raw token values into this file. Each platform adapter must include
a generated snapshot or automated parity check against the shared token source.
Add an emitter only when a real platform consumes it. Do not generate unused
Swift, Kotlin or TypeScript packages speculatively.

Installed apps must bundle the token adapter and required fonts. They must not
need `tn07.dev` or Google Fonts to launch offline.

## System surfaces and safe areas

- Background material may extend behind status and navigation bars. Text,
  controls and drag targets remain inside the platform safe area.
- Derive system-bar appearance from the active `bg` token and update it when
  the theme changes. Do not maintain a separate system-bar palette.
- Sheets, popovers and modals use the same three-surface hierarchy from
  `STYLE.md`. Platform containers do not create a fourth surface.
- On foldables and resizable desktop windows, layout follows the available
  content region rather than a model-name breakpoint.

## Keyboard and focus

- A focused field, its validation message and its primary action remain visible
  when the software keyboard opens.
- Resize or scroll the content region. Do not move the whole app with a fixed
  translation that ignores safe-area or keyboard insets.
- Restore the prior scroll position when the keyboard closes unless the user
  deliberately navigated elsewhere.
- Hardware-keyboard focus is visible. Directional focus order follows reading
  order on desktop, TV and accessibility input devices.

## Touch, pointer and feedback

- Standalone controls use the target sizes and inline exception defined once in
  `STYLE.md`. This file does not carry a second number.
- Every action has visible pressed feedback. Haptics may reinforce a completed
  state change but never replace visual or spoken feedback.
- Hover is an enhancement for a detected pointer. It never contains the only
  explanation or action.
- Long-press selection remains available for user content. Disable selection
  only for control labels and drag handles.
- Gesture regions preserve the platform's back gesture, system navigation and
  accessible alternatives.

## Type and accessibility

- Respect Dynamic Type or the platform font-scale setting. Text containers grow
  instead of clipping at a fixed height.
- The product body font must include system fallbacks. Platform text controls
  may use the system font when required for legibility or input behavior.
- Icons and custom controls expose accessible names, roles, values and state.
- Color never carries state alone. The semantic word, icon or spoken label is
  present with it.
- Map reduced-motion and increased-contrast preferences into the shared motion
  and semantic system. Do not maintain accessibility-only brand colors.

## Verification evidence

Real-device verification is workflow, not a visual token. Record it in the app
handover beside the rule it proves, using device, OS version and date. The
template lives at
[`handovers/new-app.md`](https://tn07.dev/design/handovers/new-app.md).

## When you disagree with this file

Change this file or `STYLE.md`. Do not create a third contract in an app repo.
