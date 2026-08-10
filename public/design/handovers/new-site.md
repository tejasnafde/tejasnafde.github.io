# Handover: build a new tn07 site

Use this for any site that does not exist yet. Fill the four blanks at the top,
then hand the whole file to the agent.

```
PROJECT:     <repo dir under ~/Desktop/projects>
HOSTNAME:    <name>.tn07.dev
WHAT IT IS:  <one sentence>
CATEGORY:    play | tools | read
```

## Read first

1. <https://tn07.dev/design/STYLE.md> - the house style. Obey it.
2. <https://tn07.dev/design/tokens.css> - the shared tokens.

## Start from the tokens, not from a blank page

```html
<link rel="stylesheet" href="https://tn07.dev/design/tokens.css">
<script src="https://tn07.dev/ring.js" defer></script>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400..700&family=JetBrains+Mono:wght@400;600&display=swap">
```

Then pick your identity: one accent, one card radius, a body font and a mono
font. Four overrides, nothing else. Choose an accent that no existing site uses:

| Taken | By |
|---|---|
| `#5B4B8A` | Someday |
| `#A78BFA` | Follymarket |
| `#FF5A1F` | Marvel |
| `#C9A84C` | tn07 home |
| `#FF7A5C` | WatchWithMi |
| `#5B8DEF` | Board Game Sim |

Add your entry to the table in `STYLE.md` in the same change.

## Choose the simplest stack that works

Reach for a framework only when something needs it. Evidence from the existing
sites:

- **Follymarket** is a full prediction market: static `index.html`, a hash
  router in one `app.js`, one `style.css`, zero build step, zero dependencies.
  It is the best-performing and most maintainable site in the set.
- **Marvel syllabus** is 19 pages of dense content: plain HTML plus one 257-line
  `app.css`. No generator.
- **Someday** and **WatchWithMi** use Next.js, and both carry a dependency tree
  and a build pipeline that their feature set does not obviously require.

Default to static HTML plus one stylesheet. Justify anything more before adding
it. If the app needs auth, realtime or server rendering, say which, then pick.

## Rules that are not negotiable

- No em dashes (U+2014). Use ` - `, a comma, or two sentences.
- No emoji or dingbats in UI copy.
- One accent. Semantic green, red and amber carry meaning and never decorate.
- Never hardcode a colour. If it is not `var(--...)`, it is wrong.
- Spacing from `--sp-1` to `--sp-8`. No raw pixel padding.
- Mono for labels, keys, ids and code. Never for body copy.
- `.num` on any digit a reader compares to another digit.
- Light and dark both work, set from an inline script before first paint.
- Keyboard focus visible everywhere. Never `outline: none`.
- Tap targets 44x44 minimum. Icon-only buttons carry an `aria-label`.

## Joining the ring

A new site is not discoverable until it is in the ring. Two steps:

1. Add the `<script src="https://tn07.dev/ring.js" defer></script>` tag.
2. Add an entry to `APPS` in `tejasnafde.github.io/public/ring.js` with `host`,
   `name`, `cat` and a blurb under about 45 characters, then deploy that repo.
   Nothing else needs redeploying: every site pulls the same file.

The bar shows at most 3 apps plus an "All" link, so the list can grow without
the bar growing. It never links to the site it is on.

`rashi.tn07.dev` is deliberately excluded and must stay excluded. It is personal,
not a product.

## Getting a hostname

```sh
cd ~/Desktop/projects/tn07-site
./dns.sh list
```

Then, depending on what serves it:

- **Cloudflare Pages**: attaching the custom domain does NOT create the DNS
  record. Attach the domain, then
  `./dns.sh add <sub> CNAME <project>.pages.dev --proxied`.
- **Workers**: a route with `custom_domain = true` self-wires its own record.
- **Cloud Run**: cannot sit behind a plain proxied CNAME. It routes by Host
  header and 404s. Front it with a Worker that rewrites Host, and rewrite
  `Location` headers on the way back.

There is no wildcard certificate. Expect about 15 minutes of
`sslv3 alert handshake failure` on a new hostname. That is normal.

Finally, record what the hostname serves:

```sh
./dns.sh docs        # regenerates the table in CLAUDE.local.md
```

Add your hostname to the `SERVES` map in `dns.sh`, or the generated table marks
it **UNDOCUMENTED**.

## Definition of done

- Tokens imported, exactly four overrides, entry added to the `STYLE.md` table.
- Ring script present, and an `APPS` entry added in the home repo.
- Light and dark both usable, no flash on load.
- Hostname live over HTTPS, and `./dns.sh docs --check` passes.
- No em dashes, no emoji.
- Do not deploy other repos. Leave diffs for review.
