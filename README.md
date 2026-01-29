# naWfside

Minimal scaffold for the naWfside Full MVP.

This repository contains the frontend (Next.js), backend API routes, Supabase schema, and Modal app stubs for Sound/Vibe training and inference.

See `.env.example` for required environment variables.

## Deploy to Cloudflare

The app is configured for [Cloudflare Workers](https://developers.cloudflare.com/workers/) via [OpenNext Cloudflare](https://opennext.js.org/cloudflare).

- **Local preview (Workers runtime):** `npm run preview`
- **Deploy:** `npm run deploy` (builds then deploys with Wrangler)
- **Upload only (no deploy):** `npm run upload`

For Git-based deploys, connect this repo in the Cloudflare dashboard (Workers & Pages). Use build command `opennextjs-cloudflare build` and ensure Node 18+ and `npm ci` (or `npm install`) run first. Set any env vars (e.g. Supabase, Stripe) in the Cloudflare project settings.

Requires Wrangler 3.99+ and a `wrangler.jsonc` (included). Optional: copy `.dev.vars.example` to `.dev.vars` for local Wrangler env.

