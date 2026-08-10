# Handoff: `--accent-subtle` does not follow `--accent`

Written 2026-08-09 by the scout session. The change is **already made and left
uncommitted** in `public/design/tokens.css`. It needs a review and a deploy
decision from whoever owns the design system.

## The bug

`--accent-subtle` was three hardcoded literals rather than a value derived from
`--accent`:

| Line | Selector | Old value |
|---|---|---|
| 70 | `:root`, `[data-theme='light']` | `rgb(91 75 138 / 0.10)` |
| 87 | `[data-theme='dark']` | `rgb(167 139 250 / 0.14)` |
| 107 | `@media (prefers-color-scheme: dark)` | `rgb(167 139 250 / 0.14)` |

Those two colours are exactly the DEFAULT `--accent` (`#5B4B8A` light,
`#A78BFA` dark). So the token was correct for a site that does not override the
accent, and silently wrong for every site that does. The whole point of the
four-override contract in STYLE.md is that one accent value defines the app's
identity, and `--accent-subtle` quietly opted out of it.

How it showed up: scout's selected filter chip rendered a violet wash on a teal
app. Confirmed in a browser, not by eye:

```
--accent        #14B8A6
--accent-subtle rgb(91 75 138 / 0.10)   <- Someday's violet
```

## The fix, already applied

```css
/* line 70, light */
--accent-subtle: color-mix(in srgb, var(--accent) 10%, transparent);
/* lines 87 and 107, dark */
--accent-subtle: color-mix(in srgb, var(--accent) 14%, transparent);
```

Alpha values are unchanged (10% light, 14% dark), so only the hue moves. For a
site using the default accent the computed colour is identical to before.

Verified in headless chromium against scout, both themes:

```
light -> color(srgb 0.078 0.722 0.651 / 0.1)    ( #14B8A6 at 10% )
dark  -> color(srgb 0.078 0.722 0.651 / 0.14)   ( #14B8A6 at 14% )
```

## Blast radius: smaller than it first looks

Only two things load the shared `tn07.dev/design/tokens.css` at all:

| Consumer | Accent | Effect |
|---|---|---|
| `board-game-sim/packages/web-client` | `#5B8DEF` blue | **Real visual change.** Uses `--accent-subtle` in 18 places: chips, panels, hover fills, one gradient, one `box-shadow` ring. Blue-tinted instead of violet-tinted. This is the one to look at before deploying. |
| `scout/web` | `#14B8A6` teal | Fixes the reported bug. Not deployed yet. |

Everything else that mentions `--accent-subtle` (switchboard, feature-x, celliq,
watchwithmi's brutalist theme, the tejasnafde.github.io Astro site) defines its
OWN copy of the token locally and never loads the shared file, so none of them
are affected. An earlier note from this session claimed Follymarket, Marvel,
WatchWithMi and tn07.dev were affected. **That was wrong** and this table
supersedes it.

`board-game-sim` line 945 is worth one specific look:

```css
background: linear-gradient(135deg, var(--accent-subtle) 0%, rgba(0, 180, 220, 0.12) 100%);
```

It gradients `--accent-subtle` into a hardcoded cyan. That gradient was
violet-to-cyan and becomes blue-to-cyan, which is probably what was intended,
but it is the one place the change alters a colour relationship rather than a
single fill.

## Things worth deciding

1. **Is `color-mix` acceptable here?** Baseline across Chrome/Edge 111+, Safari
   16.2+, Firefox 113+, so it has been widely available since 2023. There is no
   fallback declaration: a browser without support drops the declaration and
   `--accent-subtle` becomes invalid, so those backgrounds render transparent
   rather than wrong. If you want a floor, add the old literal on the line above
   as a fallback.
2. **Should the alphas stay split 10/14?** They were chosen for the violet.
   A brighter accent at 14% in dark mode may read heavier than the violet did.
   Worth eyeballing board-game-sim before shipping.
3. **Does STYLE.md need a line about it?** The four-override table says nothing
   about which tokens derive from `--accent`. Now that one does, it is worth
   saying so, or the next person re-hardcodes it.

## Deploying

`public/design/tokens.css` is served from `tn07.dev/design/tokens.css`, and every
consumer loads it live, so a deploy changes board-game-sim the moment it lands.
There is no cache-busting on that URL.

```sh
cd ~/Desktop/projects/tejasnafde.github.io
npm run build
npx wrangler pages deploy dist --project-name tn07 --branch main   # --branch or it is a preview
```

## Heads up on the repo state

`tejasnafde.github.io` had a **large amount of uncommitted work already in the
tree** before this change: `astro.config.mjs`, `package.json`,
`src/layouts/`, `src/pages/`, `src/styles/global.css`, and `public/design/`
plus `public/ring.js` were untracked entirely. Do not `git add -A` here. The
only files this session touched are:

- `public/design/tokens.css` (this fix)
- `public/design/STYLE.md` (cleared the `(todo)` marker on the scout row)
- `public/ring.js` (added the scout entry)

## Resolution (2026-08-09, design-system session)

Reviewed, accepted, and deployed. Decisions on the three questions:

1. `color-mix` accepted without a fallback literal. The failure mode in a
   pre-2023 browser is a transparent wash, which is quieter than the wrong
   brand color would be.
2. Alphas stay 10/14. Verified computed values on the local board-game-sim
   retrofit: same alpha, hue follows the app accent. Note the LIVE
   gaming.tn07.dev does not consume the shared file at all (old inline-CSS
   build), so the deploy changed nothing already shipped. The blast-radius
   table above describes local retrofits, not production.
3. STYLE.md now documents that `--accent-subtle` derives from `--accent` and
   that `--accent-ink` assumes the twin pattern.

**Ordering rule learned during this deploy, for every consumer:** do not delete
your local `--accent-subtle` override in the same deploy that first ships the
derived token. The apex edge cache propagates per file, so for a short window
new HTML runs against the old tokens.css and the wash renders violet again.
Ship (or verify) the shared token first, then remove local copies.

## Repro, if you want to see it before and after

```sh
cd ~/Desktop/projects/scout/web/public && python3 -m http.server 8899 &
cd ~/Desktop/projects/scout/web
node test/screenshot.mjs                     # live tokens: violet chip
TOKENS=~/Desktop/projects/tejasnafde.github.io/public/design/tokens.css \
  node test/screenshot.mjs                   # patched tokens: teal chip
# screenshots land in web/test/screenshots/
```
