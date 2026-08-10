# Handover: fix the accent and type-scale contracts in tokens.css

> **STATUS 2026-08-10: issues 1, 2, 4, 5 and 6 are FIXED. Issue 3 is open.**
> Verified and applied in a later session. See "What was done" at the bottom
> before you act on anything above it. Issue 3 (the `--text-*` to `--fs-*`
> rename) is the only item still outstanding, and it is deliberately deferred.

Repo: `~/Desktop/projects/tejasnafde.github.io`
Files: `public/design/tokens.css`, `public/design/STYLE.md`
Live: <https://tn07.dev/design/tokens.css>

## Read first

1. <https://tn07.dev/design/STYLE.md> - the contract you own.
2. <https://tn07.dev/design/handovers/watchwithmi.md> - the brief that surfaced this.

Found while converting WatchWithMi. That app is committed on branch
`retheme/tn07-tokens` and is complete except for issue 1, which it cannot fix
locally without the fifth override STYLE.md forbids. Every number below is
measured, not estimated.

## 1. The light theme has no accent twin (blocker)

The light block sets `--accent-ink: #FFFFFF` but never sets `--accent`, so light
mode paints with whatever raw identity colour the app declared. The dark block
does set a twin, but hardcodes it.

Every registered accent as text on light `--bg` `#F7F6F4`:

| App | `--accent` | Ratio | |
|---|---|---|---|
| Someday | `#5B4B8A` | 6.90:1 | passes |
| Marvel syllabus | `#FF5A1F` | 2.89:1 | fails |
| Board Game Sim | `#5B8DEF` | 2.99:1 | fails |
| Follymarket | `#A78BFA` | 2.52:1 | fails |
| WatchWithMi | `#FF7A5C` | 2.37:1 | fails |
| scout web | `#14B8A6` | 2.30:1 | fails |
| tn07.dev | `#C9A84C` | 2.12:1 | fails |

Six of seven fail. `--accent-ink` `#FFFFFF` on the accent fill fails too, so an
accent-filled button has an unreadable label in light mode.

This is not a per-app mistake. The apps followed the contract; the contract has
no slot for a light-mode value.

## 2. The dark twin is unreachable, which is why nobody noticed

```css
[data-theme='dark'] { --accent: #A78BFA; }   /* specificity 0,0,1,0 */
:root            { --accent: <app value>; }  /* specificity 0,0,1,0 */
```

Equal specificity, so source order decides. STYLE.md's "Start here" puts the
tokens `<link>` before the app stylesheet, so the app always wins and the dark
twin never applies to anything. The hardcoded `#A78BFA` is also Follymarket's
accent, which is the same fixed-violet bug already fixed once for
`--accent-subtle`. The comment recording that fix is four lines above it.

Because the twin never applies, `--accent-ink: #0A0A0C` in the dark block is
paired with the app's own accent instead of a light twin. That works for the
warm and bright accents and breaks for the dark one:

| App | `#0A0A0C` on its accent | |
|---|---|---|
| tn07.dev | 8.66:1 | passes |
| scout web | 7.95:1 | passes |
| WatchWithMi | 7.71:1 | passes |
| Marvel syllabus | 6.34:1 | passes |
| Someday | 2.65:1 | fails |

### Suggested fix

Keep identity in one place, let the token file do the switching, and delete the
hardcoded violet:

```css
:root {
  --accent: #DB2800;        /* light mode. Must pass 4.5:1 on --bg */
  --accent-dark: #FF7A5C;   /* dark mode twin. Must pass 4.5:1 on dark --bg */
}
[data-theme='dark'] { --accent: var(--accent-dark); }
```

The existing `--accent-ink` values then become correct by construction: white on
a dark light-mode accent, near-black on a light dark-mode accent. STYLE.md's
"override four" becomes "override four, one of which is a pair", and its accent
table needs a second column.

Twins that clear 4.5:1 on `--bg`, same hue and saturation, darkened until they
pass. Treat as a starting point, not a mandate:

| App | light `--accent` | dark `--accent-dark` |
|---|---|---|
| Someday | `#5B4B8A` (unchanged) | needs a lighter twin, currently fails |
| Follymarket | `#7A50F7` | `#A78BFA` |
| Marvel syllabus | `#D33700` | `#FF5A1F` |
| tn07.dev | `#876E29` | `#C9A84C` |
| Board Game Sim | `#2869EA` | `#5B8DEF` |
| scout web | `#0E7F73` | `#14B8A6` |
| WatchWithMi | `#DB2800` | `#FF7A5C` |

## 3. The type scale collides with Tailwind v4 and silently dies

`--text-xs` through `--text-3xl` are exactly Tailwind v4's font-size theme
namespace. Any app on Tailwind v4 hits this:

- Map the tokens through `@theme inline` and `--text-xs: var(--text-xs)` is
  emitted into `:root`. It is self-referential, so the whole scale resolves to
  nothing. Confirmed by reading the compiled CSS.
- Omit the mapping and Tailwind writes its own defaults into `:root`, which
  overwrite the token values and quietly resize `.label` and every element rule
  the token file sets.

WatchWithMi works around it by restating the seven values as literals, which
means it now silently drifts from this file. `--font-mono` has the same
collision; it is harmless only because both sides resolve to JetBrains Mono.

Suggested fix: rename to a namespace Tailwind does not own, for example
`--fs-xs` through `--fs-3xl`, and `--ff-body` / `--ff-mono`. That is a breaking
rename, so it wants one pass across all apps.

## 4. The semantic trio has no ink token

`--accent-ink` exists; `--pos-ink`, `--neg-ink` and `--warn-ink` do not. White
on any of the three fails in both themes:

| | light | dark |
|---|---|---|
| white on `--neg` | 4.19:1 | 2.95:1 |
| white on `--warn` | 3.60:1 | 1.61:1 |
| white on `--pos` | 3.01:1 | 1.62:1 |

So a filled destructive button cannot be built from these tokens. WatchWithMi
avoided it by using outline plus `text-destructive` everywhere, and shadcn's
stock `destructive` variant is now unreachable in that app because its
hardcoded `text-white` is 2.95:1 on the dark `--neg`.

Either add the three ink tokens, or state in STYLE.md that the trio is
text-and-border only and never a fill.

## 5. `.label` uses `--ink-3`, which fails on every surface

STYLE.md says `--ink-3` "is for decoration and non-essential labels; it does not
pass". But `.label` is the prescribed pattern for micro-labels, and those get
read: they are section headings, field labels and status flags.

| | worst of bg / surface / raised |
|---|---|
| light `--ink-3` `#8B8598` | 3.07:1 |
| dark `--ink-3` `#6B6A75` | 3.25:1 |

Moving `.label` to `--ink-2` fixes it with no other change:

| | worst of bg / surface / raised |
|---|---|
| light `--ink-2` `#5A5566` | 6.20:1 |
| dark `--ink-2` `#9C9BA6` | 6.31:1 |

## 6. The 44x44 rule has no carve-out for inline targets

STYLE.md makes 44x44 non-negotiable. That is WCAG 2.5.5 at AAA. The AA
requirement, 2.5.8, is 24x24 and explicitly exempts inline targets.

A chat reaction chip at 44px is taller than the message line it annotates.
WatchWithMi ships those at 28px and says so in a comment. Either add an inline
exception at 24px or expect every app to write the same local exception.

## Definition of done

- Every accent in the STYLE.md table passes 4.5:1 on `--bg` in both themes.
- The hardcoded `#A78BFA` in the dark block is gone.
- The type scale survives a Tailwind v4 build without a per-app workaround.
- The STYLE.md accent table has a light column and a dark column.
- `.label` passes 4.5:1 on all three surfaces.
- STYLE.md says whether the semantic trio may be used as a fill.

Changing 1 or 3 is a breaking change for every adopted app. WatchWithMi is the
cheapest to re-verify: `npm run build` in `frontend/`, then check `--accent` and
the type scale in the compiled CSS.

---

## Verification addendum (2026-08-10, separate session)

Every contrast ratio above was recomputed independently (WCAG 2.x relative
luminance). All 30 numbers reproduce exactly, including the suggested twin
table (all light twins land at 4.50-4.53:1, all dark twins pass).
`.label: --ink-3` is at tokens.css line 157. The 44x44 rule with no inline
carve-out is at STYLE.md line 128. The Tailwind v4 collision is confirmed by
WatchWithMi's own workaround comment in `frontend/src/app/globals.css`
(Tailwind `^4` in its package.json).

One correction to issue 2. "The dark twin never applies to anything" is true
only for the explicit `[data-theme='dark']` path. The auto path is worse:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) { --accent: #A78BFA; ... }  /* 0,2,0 */
}
:root { --accent: <app value>; }                              /* 0,1,0 */
```

`:root:not([data-theme='light'])` has HIGHER specificity than the app's
`:root` override, so it wins regardless of source order. A first-time visitor
with system dark mode and no stored theme (so no `data-theme` attribute) gets
Follymarket violet on every site. Readable (7.27:1 on dark `--bg`), but the
wrong brand everywhere except Follymarket. The suggested fix already cures
this path too: `--accent: var(--accent-dark)` resolves to the app's own
`:root` value, so delete the hardcoded violet from BOTH dark blocks (line 77
and line 97).

Same class of bug to sweep for while in there: the media-query block restates
every dark value at 0,2,0 specificity, so ANY future per-app override of a
themed token (not just `--accent`) silently loses in auto-dark. Consider
`[data-theme='dark'], :root:not([data-theme='light'])` sharing one block that
only uses `var()` indirection for anything an app may override.

Also confirmed: STYLE.md's own identity table already records a dark twin for
interview-taker (`#2563EB` / `#60A5FA`), so the contract was already leaking
toward pairs before this note. Issue 1's fix formalises what one app did ad hoc.

---

## What was done (2026-08-10)

### Fixed

**Issue 1 and 2, the accent contract.** `--accent` is no longer an app override.
Apps now declare a pair, `--accent-light` and `--accent-dark`, and tokens.css
derives `--accent` from them in each theme block. Both hardcoded `#A78BFA`
literals are gone (the `[data-theme='dark']` block and the auto-dark media
block). The contract is now five overrides, not four.

This also removed a local workaround from **every** adopted app. All four had
independently discovered the 0,2,0 specificity trap and re-asserted their accent
inside the tokens' own dark selectors, each with a comment saying the fix
belonged upstream. Those blocks are deleted:

| App | File | What went away |
|---|---|---|
| tn07.dev | `src/styles/global.css` | `:root[data-theme='dark']` re-assert |
| Board Game Sim | `packages/web-client/app/app.css` | two blocks, plus a hardcoded `--accent-subtle` |
| interview-taker | `index.html` | `[data-theme='dark']` twin line |
| scout web | `web/public/style.css` | the `:root:not([data-theme='light'])` selector match |
| WatchWithMi | `frontend/src/app/globals.css` | nothing to remove; it was the blocked app |

Registered pairs, all measured at 4.5:1 or better on their own `--bg`, with
`--accent-ink` passing on the fill in both themes:

| App | light | dark | light ratio | dark ratio |
|---|---|---|---|---|
| Someday | `#5B4B8A` | `#9A8ACB` | 6.90 | 6.47 |
| Follymarket | `#7A50F7` | `#A78BFA` | 4.50 | 7.27 |
| Marvel syllabus | `#D33700` | `#FF5A1F` | 4.50 | 6.34 |
| tn07.dev | `#856A1D` | `#C9A84C` | 4.77 | 8.66 |
| WatchWithMi | `#DB2800` | `#FF7A5C` | 4.51 | 7.71 |
| Board Game Sim | `#2869EA` | `#5B8DEF` | 4.52 | 6.12 |
| Switchboard | `#006CE8` | `#58A6FF` | 4.51 | 7.83 |
| interview-taker | `#2563EB` | `#60A5FA` | 4.79 | 7.78 |
| scout web | `#0E7F73` | `#14B8A6` | 4.52 | 7.95 |

Someday's dark twin is `#9A8ACB`, not the `#806FB1` a 4.5 search returns:
`#806FB1` lands at exactly 4.55 both ways with no headroom.

**Issue 4, the semantic fill.** Added one token, `--sem-ink: #0A0A0C`, not
three. Near-black passes on all three semantic fills in both themes, worst case
4.72:1 on light `--neg`, so the answer is identical for `--pos`, `--neg` and
`--warn` and three names would be three ways to say one thing. STYLE.md hard
rule 3 now says text on a semantic fill is `--sem-ink` and never white, and
calls out shadcn's `destructive` variant by name.

**Issue 5, `.label`.** Moved to `--ink-2`. STYLE.md's accessibility section now
says `--ink-3` is decoration only and that micro-labels are not decoration.

**Issue 6, tap targets.** STYLE.md now carves out inline targets at 24x24 per
WCAG 2.5.8, and holds standalone controls at 44x44.

### Corrected

The note said the dark twin "never applies to anything". True for the explicit
`[data-theme='dark']` path only. The auto-dark block uses
`:root:not([data-theme='light'])`, specificity 0,2,0, which OUTRANKS an app's
`:root` regardless of source order, so it did apply: a first visit in system
dark mode with no stored theme painted every site Follymarket violet. Readable
at 7.27:1, but the wrong brand. All four app workarounds existed because of
this path, which is the strongest evidence the note's diagnosis was right in
substance. tokens.css now carries a comment explaining why every
app-overridable token in that block must resolve through a `var()`.

### Verified

Astro build passes. WatchWithMi `npm run build` passes; its compiled CSS shows
`--accent-light:#db2800` and `--accent-dark:#ff7a5c`, and no `--accent`
literal, which is correct because tokens.css supplies it at runtime. No
`--accent:` override remains in any adopted app. All 30 ratios in the original
note reproduce exactly.

### Still open: issue 3, the type-scale rename

Deferred on purpose, with the cost measured rather than guessed. The rename
touches roughly 90 `var(--text-*)` references across four apps:

| App | `--text-*` references |
|---|---|
| interview-taker | 37 |
| tn07.dev | 32 |
| scout web | 20 |
| Board Game Sim | 1 |
| WatchWithMi | 0 (uses literals) |

The only app that actually collides is WatchWithMi, the one Tailwind v4 app,
and it already has a working documented workaround. So the rename is a
90-reference sweep across four repos to fix a problem that currently breaks
nothing. It becomes urgent the moment a second Tailwind v4 app adopts the
tokens, and it should be done as one deliberate pass, not bundled into an
unrelated change. WatchWithMi's literal `@theme` block can be deleted in that
same pass.

Note the adoption status, which the original note did not record: **Someday,
Follymarket, Marvel syllabus and Switchboard have not adopted tokens.css at
all.** Their rows in the STYLE.md table are intended pairs, not live values.
Marvel syllabus still runs its own self-contained token file. That is worth
knowing before anyone counts a rename's blast radius.

### Not deployed

All changes are working-tree only, in five repos, uncommitted. `tokens.css` is
served from `tejasnafde.github.io/public/`, so the other four apps keep seeing
the OLD token file until that repo is built and deployed to Cloudflare Pages
with `--branch main`. Deploy tn07.dev first, then the apps, or each app will
briefly render its light accent through a token file that has no
`--accent-light` slot and fall back to tn07 ochre.
