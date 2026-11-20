# Daily Glimmer

Daily Glimmer is a multilingual Next.js App Router site statically exported for Cloudflare Pages. English, Simplified Chinese, and Traditional Chinese quote pages use independent date URLs, for example `/en/quote/2026-11-19`, `/zh/quote/2026-11-19`, and `/zh-TW/quote/2026-11-19`.

## Local development

Install dependencies with `npm install`, then run `npm run dev`. Production export: `npm run build`; the static site is written to `out/`.

Cloudflare Pages build settings: command `npm run build`, output directory `out`. Set `NEXT_PUBLIC_SITE_URL` to the canonical public origin before deploying; the current fallback is `https://dailyglimmer.pages.dev`.

## Daily publishing

`.github/workflows/daily-publish.yml` runs at 00:10 UTC and can also be started manually. Add the Cloudflare Pages Deploy Hook URL as the GitHub repository secret `CLOUDFLARE_PAGES_DEPLOY_HOOK`. The hook triggers a fresh static build, which adds newly published date pages to the archive and sitemap. The workflow fails clearly when the secret is missing.

## Content and rendering

`content/quotes.json` contains 14 original notes and 30 sourced quotations, including three language variants and attribution data. Only entries published by the UTC build date are generated into quote pages, archives, and the sitemap. `/` is a compatibility entry that maps old `?lang=...#/day/day-xxx` links to the corresponding date URL.

The quote page, archive, metadata, and sitemap are statically rendered. Browser-only poster and clipboard interactions live in a client component. Static export has no request-time SSR, server API, or ISR.

## Validation

Run `npm run check` and `npm run build`. Confirm generated quote route count and sitemap entries against the current UTC date. Test direct refresh on each locale route, old-link mapping, image fallback, quote copy, PNG export, and mobile layout.
