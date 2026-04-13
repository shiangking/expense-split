# Expense Split — Travel

Themed travel expense splitter with per-person balances, suggested settle-up payments, and offline persistence in the browser.

## Scripts

- `npm install` — install dependencies
- `npm run dev` — local development (Vite)
- `npm run build` — typecheck and production build to `dist/`
- `npm run preview` — serve the production build locally

## Publish

This is a static SPA. After `npm run build`, deploy the `dist` folder to any static host (for example [Vercel](https://vercel.com) or [Netlify](https://www.netlify.com)) with the default Vite settings: build command `npm run build`, output directory `dist`. Installable as a home-screen app via `public/manifest.webmanifest`.
