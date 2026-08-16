# tejasnafde.github.io

Shared cross-project conventions (GCP accounts, OAuth consent branding, Secret
Manager inventory, Cloudflare identity and DNS, writing style) live in
`~/Desktop/projects/CLAUDE.local.md`.

@/Users/tejas/Desktop/projects/CLAUDE.local.md

Astro site: resume, projects, blog. **This is what serves the apex,
<https://tn07.dev>** - despite the repo name.

## Commands

- `npm run dev`, `npm run build` (output: `dist/`)
- Blog posts live in `src/content/blog/*.md` and need `status: published` to
  appear. All three current posts are `draft`, which is why only two pages build.
  That is expected, not a broken build.

## Deploying: merging to `main` deploys

`.github/workflows/deploy.yml` builds and ships to the Cloudflare **Pages**
project `tn07` on every push to `main`, so a merged PR goes live at `tn07.dev`.

Two non-obvious things in that workflow, both of which caused real incidents:

- **`--branch main` is mandatory** on `wrangler pages deploy`. Wrangler picks the
  Pages environment from the git branch it detects, so without it a run publishes
  a *preview* alias while production keeps serving the old build, and reports
  success either way.
- **It also republishes to GitHub Pages**, and that is not vestigial.
  `tejasnafde.github.io` 301s to `home.tn07.dev` (which then 301s to the apex),
  and GitHub only serves that redirect while a Pages deployment is published. If
  nothing publishes, the redirect survives only on a stale build until it is
  pruned, and old resume links start 404ing. That is also why
  `pages-build-deployment` used to fail on every push.

`CLOUDFLARE_API_TOKEN` on this repo is a **shared deploy token used by three
repos** (since 2026-08-15): here, `board-game-sim`, and `job-finder-app`
(scout). It carries Account > Cloudflare Pages > Edit AND Account > Workers
Scripts > Edit, because scout ships a Worker and Pages rights alone get a 403
on the Workers API.

It deliberately has **no DNS rights**. The DNS token is a separate credential
in Secret Manager used by `tn07-site/dns.sh`. Keep those apart: a compromised
CI secret must not be able to repoint the domain.

**Rotating it is a three-repo job.** Cloudflare never re-displays a token value
and GitHub secrets are write-only, so it cannot be copied between repos after
the fact. Roll it, then set it everywhere in one go:

```sh
for r in tejasnafde/tejasnafde.github.io tejasnafde/board-game-sim tejasnafde/job-finder-app; do
  gh secret set CLOUDFLARE_API_TOKEN -R $r --body 'cfat_NEW'
done
```

Skip one and that repo fails its next deploy.

Manual deploy, if ever needed:

```sh
npm run build
npx wrangler pages deploy dist --project-name tn07 --branch main
```

## /privacy is load-bearing

`public/privacy/index.html` is the privacy policy for the **shared** Google OAuth
consent screen used by every personal project in `teejayproject`, and a
verification reviewer reads it against the real scope request. Astro copies it
verbatim into the build, and the workflow fails the deploy if
`dist/privacy/index.html` is missing.

There is exactly one copy. The old `tn07-site/public/privacy/` duplicate was
deleted rather than left to drift. **If any app adds an OAuth scope, update this
file.**

## Conventions

No em dashes, no emoji in UI copy (see the shared doc). Note the existing source
still contains 7 em dashes from before that rule; a redesign is pending, so they
are knowingly left alone rather than fixed piecemeal.
