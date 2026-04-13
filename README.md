# Expense Split — Travel

Themed travel expense splitter with per-person balances, suggested settle-up payments, and offline persistence in the browser.

## Scripts

- `npm install` — install dependencies
- `npm run dev` — local development (Vite)
- `npm run build` — typecheck and production build to `dist/`
- `npm run preview` — serve the production build locally

## Publish

This is a static SPA. After `npm run build`, deploy the `dist` folder to any static host (for example [Vercel](https://vercel.com) or [Netlify](https://www.netlify.com)) with the default Vite settings: build command `npm run build`, output directory `dist`. Installable as a home-screen app via `public/manifest.webmanifest`.

## Cloud sync (Supabase)

Optional cross-device sync stores the full trip (`PersistedState` JSON) in Supabase per signed-in user.

1. In the [Supabase SQL editor](https://supabase.com/dashboard), run the migration in `supabase/migrations/20260215120000_expense_split_state.sql` (creates `expense_split_state` and RLS policies).
2. **Authentication → Sign in / Providers**: enable **Anonymous** (recommended for instant sync) and/or **Email** (use the **same email** on each device so every device shares one `auth.users` row and one trip).
3. **Authentication → URL configuration**: add your production URL (and `http://localhost:5173` for local dev) to **Redirect URLs** so magic links work.
4. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from **Project Settings → API**. On Vercel, add the same variables for Production (and Preview if you use it), then redeploy.
5. Optional: **Database → Publications → `supabase_realtime`** — include `public.expense_split_state` so updates propagate immediately between open tabs; without this, sync still works on reload and after each save.

If the env vars are missing, the app behaves as before (local storage only).
