# Daily Glimmer

Daily Glimmer is a multilingual Next.js App Router site statically exported for Cloudflare Pages. English, Simplified Chinese, and Traditional Chinese quote pages use independent date URLs, for example `/en/quote/2026-11-19`, `/zh/quote/2026-11-19`, and `/zh-TW/quote/2026-11-19`.

## Local development

Install dependencies with `npm install`, then run `npm run dev`. Production export: `npm run build`; the static site is written to `out/`.

Cloudflare Pages build settings: command `npm run build`, output directory `out`. Set `NEXT_PUBLIC_SITE_URL` to the canonical public origin before deploying; the current fallback is `https://dailyglimmer.pages.dev`.

## Daily publishing

`.github/workflows/daily-publish.yml` requests a Cloudflare Pages build daily at 00:10 in `America/New_York` (U.S. Eastern time, including daylight saving time). The workflow must be on the GitHub repository's default branch for the schedule to run. It is also available through **Actions → Daily static publish → Run workflow**.

In the production Cloudflare Pages project, create a Deploy Hook pointing to the production branch. Store its URL in GitHub under **Settings → Secrets and variables → Actions → Repository secrets** as `CLOUDFLARE_PAGES_DEPLOY_HOOK`. After a manual run, check **Deployments** in Pages for a successful build and confirm the website shows the scheduled note and photo. A successful workflow run confirms that Pages accepted the request.

## Content and rendering

`content/quotes.json` contains 14 original notes and 30 sourced quotations, including three language variants and attribution data. The build compares each note's `publishDate` to the current calendar date in `America/New_York`. A successful deployment updates the homepage, date pages, archives, and sitemap. If there is a gap in the schedule, the homepage shows the most recent published note. Add new notes and their photo records before the existing schedule runs out. `/` maps old `?lang=...#/day/day-xxx` links to the corresponding date URL.

The quote page, archive, metadata, and sitemap are statically rendered. Browser-only poster and clipboard interactions live in a client component. Static export has no request-time SSR, server API, or ISR.

## Validation

Run `npm run check` and `npm run build`. Confirm generated quote route count and sitemap entries against the current date in U.S. Eastern time. Test direct refresh on each locale route, old-link mapping, image fallback, quote copy, PNG export, and mobile layout.

## Design credit

The UI refinement on the `design/unslop-refresh` branch was guided by Unslop by Damir Sokolovsky, licensed under CC BY 4.0: https://github.com/heydamir/unslop.
