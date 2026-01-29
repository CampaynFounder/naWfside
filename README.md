# naWfside

Minimal scaffold for the naWfside Full MVP.

This repository contains the frontend (Next.js), backend API routes, Supabase schema, and Modal app stubs for Sound/Vibe training and inference.

See `.env.example` for required environment variables.

## Deploy to Cloudflare

This app uses [OpenNext Cloudflare](https://opennext.js.org/cloudflare). You can deploy as **Pages** or as a **Worker**.

### Why Pages was 404 before

OpenNext produces (1) **static assets** (`.open-next/assets`) and (2) a **Worker** (`.open-next/worker.js`) that handles all routes and SSR. If you only deploy the **assets** folder to Pages, Cloudflare serves static files but **no Worker runs** — so every request (including `/`) returns **404**. To deploy as a Page, the **whole** `.open-next` output must be deployed so that Pages can run the Worker (`_worker.js`).

### Deploy as a Page (recommended for Git + custom domain)

1. In [Cloudflare](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → connect your Git repo.
2. **Build settings:**
   - **Build command:** `npm run build:pages`
   - **Build output directory:** `.open-next` (from `wrangler.toml`; do not use `out` or `.open-next/assets` only).
3. After each build, `build:pages` produces `.open-next/` and copies `worker.js` → `_worker.js` so Pages runs the Worker. Set env vars in the Pages project.
4. Add a custom domain (e.g. `beats.juukjunt.com`) in the Pages project **Custom domains**.

### Deploy as a Worker (alternative)

- Use **Workers** (not Pages) in the dashboard, connect the repo, then:
  - **Build command:** `npm run build:pages`
  - **Deploy command:** `npx opennextjs-cloudflare deploy --config wrangler.workers.jsonc`
- Or locally: `npm run deploy` (builds + deploys with Wrangler).

### Local preview

- **Preview (Workers runtime):** `npm run preview`
- **Deploy (Worker):** `npm run deploy`

Requires Wrangler 3.99+. Workers CLI uses `wrangler.workers.jsonc`. Optional: copy `.dev.vars.example` to `.dev.vars` for local Wrangler env.

### If Pages returns 404 for `/_next/static/*` (chunks, CSS, fonts)

The build flattens `.open-next/assets/` into `.open-next/` so that `_next` is at the ASSETS root and the Worker can serve `/_next/static/chunks/...` correctly. If you still see 404s for static assets, deploy as a **Worker** instead (see above); Workers bind ASSETS to `.open-next/assets` directly and avoid path mismatches.

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

