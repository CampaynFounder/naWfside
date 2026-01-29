# naWfside

Minimal scaffold for the naWfside Full MVP.

This repository contains the frontend (Next.js), backend API routes, Supabase schema, and Modal app stubs for Sound/Vibe training and inference.

See `.env.example` for required environment variables.

## Deploy to Cloudflare

This app uses [OpenNext Cloudflare](https://opennext.js.org/cloudflare).

### Recommended: Deploy as a Worker (avoids black/blank page)

OpenNext needs **ASSETS** and **WORKER_SELF_REFERENCE** bindings. Workers provide these via `wrangler.workers.jsonc`; **Pages does not**, so deploying to Pages often results in a **completely black page** (no HTML or static assets served correctly).

- **Build command:** `npm run build:pages`
- **Build output directory:** `.open-next`
- **Deploy:** Use **Workers** (not Pages): connect repo and set deploy command to `npx opennextjs-cloudflare deploy --config wrangler.workers.jsonc`, or run locally: `npm run deploy` (builds + deploys with Wrangler).

### Deploy as a Page (optional; may show black page)

If you use **Pages** (e.g. for Git integration + custom domain):

1. **Build command:** `npm run build:pages`
2. **Build output directory:** `.open-next`
3. **Framework preset:** None.

Pages runs `_worker.js` but does not inject ASSETS/WORKER_SELF_REFERENCE the same way Workers do, so you may get a black screen. If that happens, deploy as a **Worker** (see above).

### Local preview

- **Preview (Workers runtime):** `npm run preview`
- **Deploy (Worker):** `npm run deploy`

Requires Wrangler 3.99+. Workers CLI uses `wrangler.workers.jsonc`. Optional: copy `.dev.vars.example` to `.dev.vars` for local Wrangler env.

### If you see a black page (Pages or Workers)

- **Use Workers:** Deploy as a Worker with `wrangler.workers.jsonc` so ASSETS and WORKER_SELF_REFERENCE are set. Pages often does not provide these bindings.
- **Build must succeed:** This repo uses system fonts (no `next/font` Google Fonts) so the build works in CI and on Cloudflare without network to fonts.googleapis.com.
- **assetPrefix (Pages only):** `build:pages` sets `NEXT_PUBLIC_ASSET_PREFIX=/assets` so script/link URLs match where Pages serves files.

### If Pages still returns 404 for routes

- Confirm **Build output directory** is `.open-next` (not `.open-next/assets` or `out`).
- Confirm the build ran `npm run build:pages` (which copies `worker.js` → `_worker.js` and flattens assets so Pages runs the Worker and serves static files).

### Deploy as a static Page only (no SSR, no API routes)

If you only need a static site (no API routes, no SSR), you can use Next.js static export and deploy the `out` folder to Pages:

1. In `next.config.js` add `output: 'export'`.
2. Remove or stub API routes (they won’t run).
3. Ensure dynamic routes (e.g. `/producer/[id]`) have `generateStaticParams` or use client-side routing only.
4. Set Pages **Build command** to `npm run build` and **Build output directory** to `out`.

**Effort:** Medium (config + removing/stubbing server-only features). **Limitation:** No server-side APIs, no SSR, no auth that depends on the server.

