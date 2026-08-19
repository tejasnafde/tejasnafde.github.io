# tn07 house style

Every site under `tn07.dev` obeys this file. A new site starts by copying the
two lines in "Start here" and nothing else. Installed apps inherit this visual
contract and add platform mechanics from
[`APP_STYLE.md`](https://tn07.dev/design/APP_STYLE.md).

Tokens: <https://tn07.dev/design/tokens.css>

## Start here

```html
<link rel="stylesheet" href="https://tn07.dev/design/tokens.css">
<script src="https://tn07.dev/ring.js" defer></script>
```

Fonts, if you use the defaults:

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400..700&family=JetBrains+Mono:wght@400;600&display=swap">
```

## The one idea

Sites here are different products, so they must not look identical. They must
look **related**. The token file gives every site the same skeleton: the same
surface ramp, the same ink ramp, the same spacing, the same motion, the same
meaning for green and red. A site then overrides **five** variables to be
itself:

```css
:root {
  --accent-light: #0E7F73;                 /* your accent, light mode */
  --accent-dark: #14B8A6;                  /* your accent, dark mode */
  --r: 4px;                                /* your card radius */
  --font-body: 'Space Grotesk', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

Override those five. Do not override the ink ramp, the surface ramp, the
spacing scale or the motion tokens. That is the whole contract. If your site
needs a sixth override, the token file is missing something: fix the token
file, not your app.

**The accent is a pair, and this is not optional.** One colour cannot pass
4.5:1 on both a near-white and a near-black page. Six of the first seven
accents registered here failed on light `--bg`, because the contract used to
have one slot. Declare a dark shade for light mode and a light shade for dark
mode, and never set `--accent` yourself: the token file derives it per theme.

Three tokens then follow your pair so you do not touch them:

- `--accent` is `--accent-light` in light mode and `--accent-dark` in dark.
- `--accent-subtle` derives from `--accent` via `color-mix` (10% light, 14%
  dark). Do not hardcode a wash color; it will drift the first time the accent
  changes.
- `--accent-ink` (text on an accent fill) is white in light mode and near-black
  in dark. Follow the pair rule and it is correct by construction. It was not,
  while a single accent was allowed.

Current identities. Both columns must pass 4.5:1 on their own `--bg`:

| App | `--accent-light` | `--accent-dark` | `--r` | Body font |
|---|---|---|---|---|
| Someday | `#5B4B8A` | `#9A8ACB` | `20px` | DM Sans |
| Follymarket | `#7A50F7` | `#A78BFA` | `12px` | Inter |
| Marvel syllabus | `#D33700` | `#FF5A1F` | `2px` | Space Grotesk |
| tn07.dev | `#856A1D` | `#C9A84C` | `8px` | DM Sans |
| WatchWithMi | `#DB2800` | `#FF7A5C` | `14px` | DM Sans |
| Board Game Sim | `#2869EA` | `#5B8DEF` | `10px` | Space Grotesk |
| Switchboard (promo, todo) | `#006CE8` | `#58A6FF` | `6px` | DM Sans |
| interview-taker | `#2563EB` | `#60A5FA` | `10px` | DM Sans |
| scout web | `#0E7F73` | `#14B8A6` | `12px` | DM Sans |
| Radix (app first, promo todo) | `#8A2C62` | `#F078B0` | `16px` | Instrument Sans |

Two accents must never be reused. Add your row here in the same change that
picks one. Handover briefs for the sites still to be redone live in
[`handovers/`](https://tn07.dev/design/handovers/new-site.md).

Rows for Someday, Follymarket, Marvel syllabus and Switchboard are the intended
pairs; those four apps have not adopted the token file yet, so nothing reads
them. Use them when you convert each app.

## Hard rules

1. **No em dashes (U+2014).** Use ` - `, a comma, or two sentences.
2. **No emoji, no dingbats, no tick or cross glyphs** in UI copy.
3. **One accent per app**, as a light/dark pair. A second accent is a bug.
   Semantic green, red and amber are not accents; they carry meaning and never
   decorate. Text on a `--pos` / `--neg` / `--warn` fill is `--sem-ink`, never
   white: white is 3.01:1 on light `--pos` and 1.61:1 on dark `--warn`. That
   includes shadcn's stock `destructive` variant, which hardcodes `text-white`
   and must be overridden.
4. **Never hardcode a color.** If it is not a `var(--...)`, it is wrong.
5. **Spacing comes from `--sp-1` to `--sp-8`.** No raw `padding: 13px`.
6. **Three durations only** (`--dur-1/2/3`) and **one easing** (`--ease`).
7. **Borders are hairlines**: `1px solid var(--line)`. Use `--line-2` only to
   raise one element above its neighbours.
8. **Mono is for labels, keys, ids, code and nothing else.** Body copy in mono
   is the single fastest way to look like every other developer portfolio.
9. **Tabular numerals on any digit a reader compares** to another digit.
   Prices, scores, counts, timestamps. Add the `.num` class.
10. **Dark and light both work.** Set `data-theme` on `<html>` from
    `localStorage` in an inline script before first paint, or the page flashes.

## Depth

Three surfaces, in this order, and never a fourth:

- `--bg` is the page. Nothing else uses it.
- `--surface` is a card, a panel, a sheet.
- `--raised` is a thing on top of a card: a hover state, an input, a nested row.

Separate surfaces with `--line`, not with a shadow. `--shadow` is for things
that genuinely float above the page: a modal, a popover, the ring bar. A card
sitting in a grid does not float.

## Type

Sizes come from `--text-xs` to `--text-3xl`. Between them there is nothing.
Form controls use the dedicated `--text-input` token, which is `16px` so iOS
browser engines do not zoom the page when a field receives focus.

Headings get `--track-head` (tight). Body gets `--track-body`. Uppercase mono
labels get `--track-label` (loose) or they turn into a smudge.

`p` is capped at `--measure` (68ch) by the token file. Do not widen it.

## Motion

Motion tells the user where a thing came from. It is not decoration.

- `--dur-1` hover and focus. The user must not perceive a wait.
- `--dur-2` toggles, small reveals, tab changes.
- `--dur-3` sheets, drawers, page-level transitions.

Animate `transform` and `opacity`. Animating `height`, `top` or `width` makes
the browser lay out the page on every frame and the animation stutters.

`prefers-reduced-motion` is already handled in the token file. Do not defeat it.

## Accessibility, non-negotiable

- Every interactive element reaches keyboard focus and shows the focus ring.
  The token file styles `:focus-visible`. Never write `outline: none`.
- Tap targets are 44x44px minimum, including the invisible padding. **One
  exception:** a target inline in a line of text may go to 24x24, which is what
  WCAG 2.5.8 requires at AA and it exempts inline targets outright. A chat
  reaction chip at 44px is taller than the message it annotates. Standalone
  controls, buttons, nav items and icon buttons get the full 44.
- Body text holds 4.5:1 contrast against its surface. `--ink-3` is for
  decoration only: it is 3.07:1 on light `--bg` and never holds text a user
  reads. Micro-labels are not decoration, so `.label` uses `--ink-2` (6.20:1).
- An icon-only button carries an `aria-label`.
- Color never carries meaning alone. Green plus the word, not green alone.

## Mobile web and browser-engine apps

This section applies to websites, PWAs, Electron renderers and WebViews. Native
widget layers use `APP_STYLE.md`. A hybrid app follows each contract in the
layer where it runs.

- Opt into safe-area values with
  `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
  Extend backgrounds under system chrome, then inset interactive content with
  `env(safe-area-inset-*)` and a spacing-token fallback.
- A viewport-filling app shell starts at `min-height: 100svh` and may enhance
  to `100dvh`. Do not make ordinary document pages viewport-height layouts.
- Inputs, textareas and selects use `font-size: var(--text-input)`.
- Hover presentation lives inside
  `@media (hover: hover) and (pointer: fine)`. Focus and pressed states remain
  available on every input modality.
- Do not disable `-webkit-tap-highlight-color` globally. Remove it only from a
  real button or link that already has equally clear pressed feedback.
- Do not apply `touch-action` globally. `manipulation` is for compact controls
  with no reading content. `pan-y` is for custom horizontal gesture surfaces
  that preserve vertical page scrolling.
- `overscroll-behavior: none` is for an immersive app shell whose own gesture
  conflicts with browser pull-to-refresh. It is not a promo-site default.
- `user-select: none` is for control labels and drag handles, never body copy.
- When a user-selected theme can differ from the OS theme, update
  `<meta name="theme-color">` from the resolved `--bg` token. A media-only meta
  pair will show the wrong browser chrome for an explicit override.

Rules that depend on mobile-browser behavior must carry a dated real-device
verification note in the task handover. "Tested responsively" is not evidence.

## The ring

`ring.js` puts a small bar at the bottom of the page that links the other
live apps. It is how a Follymarket visitor finds Someday.

It is one hosted script, so the app list lives in one file and every site
updates without a redeploy. It skips the site it is already on, hides for 30
days once dismissed, uses a shadow root so no host CSS can reach it, and reads
`--accent` from the host page so it matches whatever site it is on.

To add an app to the ring, edit `APPS` at the top of `public/ring.js` in
`tejasnafde.github.io` and deploy that repo. Nothing else.

## When you disagree with this file

Change this file. Do not add a local exception. `APP_STYLE.md` is a derivative
platform contract, not a parallel visual guide.
