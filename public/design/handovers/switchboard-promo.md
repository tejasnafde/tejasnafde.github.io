# Handover: build the Switchboard promo site

New site. Does not exist yet. The goal is SEO and downloads.

Repo: `~/Desktop/projects/switchboard` (the app itself, v0.8.14)
Hostname: `switchboard.tn07.dev` - **already live, already taken, see below**
Product line: "The unified workspace for developers who run agents, terminals,
and chats."

## Read first

1. <https://tn07.dev/design/STYLE.md> - the house style. Obey it.
2. <https://tn07.dev/design/tokens.css> - the shared tokens.
3. <https://tn07.dev/design/handovers/new-site.md> - the general new-site rules.

## The constraint that decides your architecture

`switchboard.tn07.dev` is served by the Worker in
`~/Desktop/projects/tn07-site/workers/switchboard-apk/`. Read
`src/index.js` before you write anything. Today it does exactly two things:

- `GET /apk` resolves the newest GitHub release asset ending in `.apk` and 302s
  to it, cached 5 minutes in `caches.default`.
- **Every other path 302s to the GitHub releases page.**

So there is no room for a promo site until that Worker changes. You must not
break `/apk`: it is the stable download URL, the Android app's self-update
checks it, and it is what any existing link points at.

The correct pattern is already used twice on this account: a Worker that serves
static files from Workers Assets and keeps its special paths. `follymarket`
does exactly this (static assets plus `/api/*` proxied). Copy that shape:

- `/apk` keeps its current behaviour, unchanged, including the cache.
- `/` and everything else serves the promo site from Workers Assets.
- Remove the catch-all redirect to GitHub last, once assets are proven to serve.

`wrangler.toml` already has `custom_domain = true`, so the DNS record is owned by
Cloudflare. **Do not touch `switchboard` with `dns.sh`.** The Worker and `dns.sh`
will fight over the record. That warning is already written in the toml.

## Your identity

```css
:root {
  --accent: #58A6FF;   /* the app's own accent, from its global.css */
  --r: 6px;            /* matches the app's --radius */
  --font-body: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}
```

Add a `Switchboard` row to the table in `STYLE.md` in the same change.

The desktop app's real tokens are in
`switchboard/src/renderer/styles/global.css` (a GitHub-dark palette: `#0a0a0a`
surfaces, `#58a6ff` accent, `#e2e8f0` text, JetBrains Mono). The promo site
should feel like the product without copying the app chrome. Use the accent and
the mono font; do not rebuild the titlebar.

## SEO is the point, so treat it as the feature

A promo site that is beautiful and unindexed has failed. Non-negotiable:

- **Static HTML.** No client-side rendering for the content that must be
  indexed. Follymarket proves a real app works zero-build; a promo page
  certainly does. Server-rendered or plain HTML only.
- **One `<h1>`**, and it names the product and what it does. Headings nest in
  order, no level skipped.
- `<title>` under 60 characters, `<meta name="description">` under 155, both
  written for a human, not stuffed.
- `<link rel="canonical" href="https://switchboard.tn07.dev/">`.
- Open Graph and Twitter card tags, with a real `og:image` at 1200x630. A link
  posted anywhere should preview properly.
- **JSON-LD `SoftwareApplication`** with `name`, `description`,
  `applicationCategory`, `operatingSystem` (Windows, macOS, Linux, Android),
  `offers` priced 0, and `downloadUrl` pointing at `/apk`.
- `sitemap.xml` and `robots.txt`. There is a `robots.txt` on the apex already;
  this hostname needs its own.
- Real content, not a hero and nothing else. Search engines rank pages that
  answer a question. Cover: what problem it solves, what an agent workspace is,
  the IAP tunnel capability, screenshots with real `alt` text, platform
  downloads, and an FAQ.
- Images served in a modern format, sized, and lazy-loaded below the fold.
  Never ship a layout shift: set width and height on every image.
- Lighthouse: aim for 100 on SEO and Accessibility, and green Core Web Vitals.
  State the scores in your report.

## Content facts you may use

- Version 0.8.14 at time of writing. Do not hardcode a version in copy that will
  rot; read it or omit it.
- The Android APK download is `https://switchboard.tn07.dev/apk`.
- Source: <https://github.com/tejasnafde/switchboard>.
- Its distinguishing capability: it reaches work VMs over Google Cloud IAP
  WebSocket tunnels, so it needs no VPN and no routable SSH port.

Do not invent features. If you cannot verify a claim from the repo's README,
CHANGELOG or source, leave it out.

## Definition of done

- `/apk` behaves exactly as before. Test it explicitly and show the 302 target.
- The promo site serves at `/` on the same hostname.
- Tokens imported, four overrides, row added to the `STYLE.md` table.
- `<script src="https://tn07.dev/ring.js" defer></script>` before `</body>`,
  and a `switchboard` entry added to `APPS` in
  `tejasnafde.github.io/public/ring.js` with `cat: 'tools'`.
- Light and dark both usable, no flash on load.
- No em dashes, no emoji.
- Do not deploy. Leave the diff for review, and say what the deploy command
  would be.
