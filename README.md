# Expense Split — Travel

Themed travel expense splitter with per-person balances, suggested settle-up payments, and optional **shared-trip** cloud sync via Supabase (invite link, no email login).

## Scripts

- `npm install` — install dependencies
- `npm run dev` — local development (Vite)
- `npm run build` — typecheck and production build to `dist/`
- `npm run preview` — serve the production build locally

## Publish

This is a static SPA. After `npm run build`, deploy the `dist` folder to any static host (for example [Vercel](https://vercel.com) or [Netlify](https://www.netlify.com)) with the default Vite settings: build command `npm run build`, output directory `dist`. Installable as a home-screen app via `public/manifest.webmanifest`.

## Shared trips (Supabase invite links)

With `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set, the app opens a **landing page**: start a new trip or paste a trip UUID. Each trip gets a URL like `https://yoursite.com/?trip=<uuid>`. **Copy invite link** shares that URL—anyone with it can read and edit the same trip from their own device. There is **no per-user login**; the UUID is the only gate, so treat the link like a password.

1. In the [Supabase SQL editor](https://supabase.com/dashboard), run **`supabase/migrations/20260216123000_shared_trips.sql`** (creates `shared_trips` and RPCs `create_shared_trip`, `get_shared_trip`, `save_shared_trip`). You do **not** need Anonymous or Email auth for this flow.
2. Copy `.env.example` to `.env` and set the two `VITE_*` variables from **Project Settings → API**. Add the same keys on Vercel and redeploy.
3. Keep your production URL **publicly reachable** (turn off Vercel **Deployment Protection** for that URL if magic links or simple visits were blocked before).

Older migration `20260215120000_expense_split_state.sql` was for per-user auth sync and is **not** used by the current app.

If the env vars are missing, the app uses **local storage only** (single-device, legacy `expense-split-v1` key).
