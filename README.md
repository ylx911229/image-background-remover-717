# Clearcut — Image Background Remover

A fast, privacy-conscious image background remover built with Next.js, Tailwind CSS, Remove.bg, and Cloudflare Workers.

## What is included

- Drag-and-drop JPG/PNG upload with a 22 MB client and server limit
- Browser-memory previews with no image persistence
- Streaming Cloudflare Worker proxy to Remove.bg
- Cloudflare Turnstile and native Worker rate-limit support
- Original/result comparison slider and transparent PNG download
- Responsive landing page, FAQ, privacy policy, terms, sitemap, and robots rules
- Privacy-safe product event logs without image bodies or file names

The full product requirements are in [`docs/MVP-PRD.md`](docs/MVP-PRD.md).

## Local development

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add a Remove.bg API key to `.env.local` to test real processing:

```dotenv
REMOVE_BG_API_KEY=your_remove_bg_api_key
```

Turnstile is optional locally. To enable it, add both values:

```dotenv
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key
```

## Validation

```bash
npm run lint
npm run build
npm run cf:build
```

## Cloudflare deployment

Authenticate Wrangler, then add the production secrets:

```bash
npx wrangler secret put REMOVE_BG_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` for the production build, then deploy:

```bash
npm run deploy
```

The Worker rate limiter is configured in `wrangler.jsonc` for three background-removal requests per minute per key. Uploaded images are streamed to Remove.bg and are never written to R2, KV, D1, local storage, or application logs.
