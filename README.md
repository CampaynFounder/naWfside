# naWfside

Minimal scaffold for the naWfside Full MVP.

This repository contains the frontend (Next.js), backend API routes, Supabase schema, and Modal app stubs for Sound/Vibe training and inference.

See `.env.example` for required environment variables.

## Deploy to Cloudflare (Workers only)

This app uses [OpenNext Cloudflare](https://opennext.js.org/cloudflare). **Deploy as a Worker** — the config is `wrangler.jsonc` (main, assets, services). Pages is not supported for this stack (missing bindings → black page).

### From your machine

1. Build and deploy in one step:
   ```bash
   npm run deploy
   ```
2. Set `CLOUDFLARE_API_TOKEN` (create at [Create API Token](https://dash.cloudflare.com/profile/api-tokens) with “Edit Cloudflare Workers”).
3. Optional: copy `.dev.vars.example` to `.dev.vars` for local env; `npm run preview` runs the app locally in the Workers runtime.

### From Cloudflare dashboard (Git)

1. **Workers & Pages** → **Create** → **Worker** → **Connect to Git** (not “Pages”).
2. Pick this repo and branch.
3. **Build settings:**
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Deploy command:** `npx opennextjs-cloudflare deploy --config wrangler.jsonc`
   - **Build output directory:** leave empty.
4. **Environment variables:** add `CLOUDFLARE_API_TOKEN` (or use the dashboard’s Wrangler auth).
5. Save and deploy.

**Important:** The deploy command must include `--config wrangler.jsonc` so Wrangler uses this repo’s Worker config. Otherwise the build environment can inject a Pages config and you’ll see: “Workers-specific command in a Pages project”.
