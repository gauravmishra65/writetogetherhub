# writetogetherhub

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-rgxfu7me)

## Deployment (GitHub Pages)

Pushes to `main` build and publish the site through `.github/workflows/deploy.yml`:
tests run, `npm run build` builds with Vite, then `scripts/spa-fallback.mjs` gives every
route its own `index.html` plus a `404.html` (GitHub Pages has no server-side rewrites,
so React Router deep links need these). `public/CNAME` keeps the custom domain
`writetogetherhub.com`.

- Routes are listed in `scripts/spa-fallback.mjs`; **add any new route in `src/App.tsx` there too.**
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set in the workflow. They are public by design;
  data access is enforced by Supabase row-level security.
- Supabase Edge Functions (`supabase/functions/*`) are deployed separately to the Supabase project.
