# GoldenBee Analytics

Classic multi-page Vite application (Vanilla JS + Bootstrap) for beekeeping registry and hive journal workflows.

## Tech Stack
- HTML, CSS, Vanilla JavaScript (ES modules)
- Bootstrap + Bootstrap Icons
- Supabase (Auth, PostgreSQL, Storage)
- Vite + npm

## Pages
- `/` → `index.html`
- `/login` → `login.html`
- `/register` → `register.html`
- `/dashboard` → `dashboard.html`
- `/profile` → `profile.html`
- `/apiary?id=:id` → `apiary.html`
- `/hive?id=:id` → `hive.html`
- `/analytics` → `analytics.html`
- `/admin` → `admin.html`
- fallback/not-found → `404.html`

## Setup
1. Install dependencies:
   - `npm install`
2. Create environment file:
   - copy `.env.example` to `.env`
   - set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Run development server:
   - `npm run dev`
4. Build production bundle:
   - `npm run build`
5. Preview build locally:
   - `npm run preview`

## Project Structure
- `src/lib` — external client initialization (Supabase)
- `src/services` — auth and data services
- `src/components` — shared UI components (navbar/footer/toast)
- `src/utils` — utility helpers
- `src/pages/*` — one folder per page, each with `init` function
- `src/styles/app.css` — shared app styles

## Notes
- Each HTML page imports only its own page module.
- Shared components are imported from page modules.
- Netlify config uses explicit per-page redirects (no SPA catch-all).