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
   - **Root directory:** leave **empty** (so `wrangler.jsonc` at repo root is available).
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Deploy command:** `cd "$(git rev-parse --show-toplevel)" && npx opennextjs-cloudflare deploy --config wrangler.jsonc`
   - **Build output directory:** leave empty.
4. **Environment variables:** add `CLOUDFLARE_API_TOKEN` (or use the dashboard’s Wrangler auth).
5. Ensure the branch Cloudflare builds from has `wrangler.jsonc` (commit and push).
6. Save and deploy.

**If you see “Could not read file: wrangler.jsonc”:** Set **Root directory** to empty, use the Deploy command above (it `cd`s to repo root first), and ensure `wrangler.jsonc` is committed and pushed on the build branch.
