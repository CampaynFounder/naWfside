# naWfside

Minimal scaffold for the naWfside Full MVP.

This repository contains the frontend (Next.js), backend API routes, Supabase schema, and Modal app stubs for Sound/Vibe training and inference.

See `.env.example` for required environment variables.

## Deploy to Cloudflare

The app is configured for [Cloudflare Workers](https://developers.cloudflare.com/workers/) via [OpenNext Cloudflare](https://opennext.js.org/cloudflare).

- **Local preview (Workers runtime):** `npm run preview`
- **Deploy:** `npm run deploy` (builds then deploys with Wrangler)
- **Upload only (no deploy):** `npm run upload`

For **Cloudflare Pages** (Git): set **Build command** to `npm run build:pages` and **Build output directory** to `.open-next/assets`. The repo includes `wrangler.toml` with `pages_build_output_dir` so Pages finds the output; do not use `out` unless you switch to a static export.

For Workers (CLI): run `npm run deploy` after `npm ci`. Use Node 18+ and set env vars (e.g. Supabase, Stripe) in the Cloudflare project.

Requires Wrangler 3.99+. **Pages** reads `wrangler.toml` only (no ASSETS binding). **Workers** CLI uses `wrangler.workers.jsonc`. Optional: copy `.dev.vars.example` to `.dev.vars` for local Wrangler env.

