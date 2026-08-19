# Handover: retheme WatchWithMi

Repo: `~/Desktop/projects/watchwithmi`
Live: <https://watchwithmi.tn07.dev>

## Read first

1. <https://tn07.dev/design/STYLE.md> - the house style. Obey it.
2. <https://tn07.dev/design/tokens.css> - the shared tokens.

Do not change any other repo. Do not deploy. Report back when the diff is ready.

## Your identity

```css
:root {
  --accent-light: #DB2800;
  --accent-dark: #FF7A5C; /* warm, reads as a projector in a dark room */
  --r: 14px;
  --font-body: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}
```

Override those five and nothing else. If you think a sixth override is needed,
the token file is missing something: say so and stop, do not add a local
exception.

## What is wrong now

The frontend is Next.js 15.3.4 + React 19 + Tailwind v4 + shadcn/ui
(`new-york`, base `neutral`). On top of that sits
`frontend/src/styles/theme-brutalist.css`, applied via
`<html data-theme="brutalist">` in `frontend/src/app/layout.tsx`.

1. **It is the default AI-generated look.** Pure `#000000` background, pure
   `#ffffff` accent and borders, Archivo Black display, hard offset shadows
   (`6px 6px 0`). Every model that is asked for a "bold" UI produces this. That
   is the actual complaint: the design is not bad in isolation, it is
   indistinguishable.
2. **`[data-theme="brutalist"] * { border-radius: 0 !important }`** nukes every
   radius in the app with a universal selector and `!important`. Delete this
   line. It is the single hardest thing to work around later.
3. **The shadcn token block is dead weight.** `globals.css` defines a full oklch
   palette (`--background oklch(1 0 0)`, `--primary oklch(0.205 0 0)`,
   `--radius 0.625rem`, and the derived sm/md/lg/xl radii) that the brutalist
   theme overrides at runtime with `!important`. Two token systems, one of them
   inert. Pick one. Keep shadcn's, and drive it from the shared tokens.
4. **Three display fonts fight each other**: Archivo Black, IBM Plex Mono and
   Space Mono are imported from Google Fonts, while `layout.tsx` still loads
   Geist and Geist Mono as `--font-geist-sans`/`--font-geist-mono` and then
   overrides them. Remove the unused ones. Every font you keep is a render-blocking
   download the user pays for.
5. **Mono is used for body copy.** House style rule 8 forbids it. Mono is for
   labels, keys, ids and code.
6. **There is no light theme.** `@custom-variant dark` exists in `globals.css`
   but is moot, because brutalist is always black. Wire `data-theme` properly.

Files to work in:
`frontend/src/app/globals.css`, `frontend/src/styles/theme-brutalist.css`
(delete it or reduce it to the five overrides), `frontend/src/app/layout.tsx`,
`components.json`.

## What the sites that work do right

- **Follymarket** (`follymarket/web/style.css`) - a three-step ink ramp
  (`--ink #edecef`, `--ink-2 #9c9ba6`, `--ink-3 #6b6a75`) instead of two
  hard-contrast values. Copy that idea. It is what makes text hierarchy readable
  without shouting. It also sets `font-variant-numeric: tabular-nums` on figures
  and tightens headline tracking to `-0.021em`.
- **Someday** (`someday/someday-web/app/globals.css`) - sets `data-theme` from an
  inline script before hydration, so the page never flashes the wrong theme. Copy
  that script exactly. WatchWithMi needs it once it has two themes.
- **Marvel syllabus** (`marvel-syllabus/site/assets/app.css`) - its light theme is
  a genuinely different material (newsprint), not an inverted dark theme. Aim for
  that, not for `#fff` on `#000` flipped.

## Specific to this app

Rooms, chat and sync mean timestamps and counts everywhere. Put `.num` on all of
them, or the columns jitter as digits change.

WebSocket state means this service runs `--max-instances=1`. That is unrelated to
your work, but do not touch the Cloud Run flags.

## Definition of done

- `tokens.css` imported, five overrides set, no other token redefined.
- No `!important`, no universal-selector resets.
- Light and dark both usable, no flash on load.
- `<script src="https://tn07.dev/ring.js" defer></script>` before `</body>`.
- No em dashes, no emoji anywhere in code or copy.
- Keyboard focus visible on every control. Never `outline: none`.
- `npm run build` passes in `frontend/`.

Note that pushing to `main` deploys this repo through CI, with a pytest gate and
then both services. Do not push. Leave the diff for review.
