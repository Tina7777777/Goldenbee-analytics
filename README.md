# GoldenBee Analytics

Build: Static SPA with client-side routing (History API) using Vanilla JS + Bootstrap.

## Architecture Overview

- Single HTML entry point: `index.html`
- App bootstrap: `src/main.js`
- Router: `src/router/router.js`
- Pages: one folder per screen in `src/pages/<page>/` with `<page>.js` + `<page>.css`
- Shared UI: `src/components/navbar`, `src/components/footer`, `src/components/toast`
- i18n: `src/i18n/i18n.js` with Bulgarian default (`bg`) and English fallback (`en`)

## Project Structure

```text
goldenbee-analytics/
├─ .env.example
├─ index.html
├─ netlify.toml
├─ package.json
├─ README.md
├─ vite.config.js
├─ src/
│  ├─ main.js
│  ├─ assets/
│  │  └─ img/
│  ├─ components/
│  │  ├─ footer/
│  │  │  ├─ footer.css
│  │  │  └─ footer.js
│  │  ├─ navbar/
│  │  │  ├─ navbar.css
│  │  │  └─ navbar.js
│  │  └─ toast/
│  │     ├─ toast.css
│  │     └─ toast.js
│  ├─ i18n/
│  │  ├─ bg.js
│  │  ├─ en.js
│  │  └─ i18n.js
│  ├─ pages/
│  │  ├─ admin/ (admin.js, admin.css)
│  │  ├─ analytics/ (analytics.js, analytics.css)
│  │  ├─ apiary/ (apiary.js, apiary.css)
│  │  ├─ dashboard/ (dashboard.js, dashboard.css)
│  │  ├─ hive/ (hive.js, hive.css)
│  │  ├─ home/ (home.js, home.css)
│  │  ├─ login/ (login.js, login.css)
│  │  ├─ notfound/ (notfound.js, notfound.css)
│  │  ├─ profile/ (profile.js, profile.css)
│  │  └─ register/ (register.js, register.css)
│  ├─ router/
│  │  └─ router.js
│  ├─ services/
│  │  ├─ authService.js
│  │  ├─ mockAuth.js
│  │  └─ supabaseClient.js
│  ├─ styles/
│  │  ├─ app.css
│  │  └─ variables.css
│  └─ utils/
│     ├─ appSetup.js
│     └─ dom.js
└─ supabase/
	├─ config.toml
	└─ migrations/
```

## Routes

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/profile`
- `/apiary?id=:id`
- `/hive?id=:id`
- `/analytics`
- `/admin`
- unknown route -> Not Found screen

### Home and Dashboard behavior

- `/` is a public beekeepers directory (profiles with `is_public_profile=true`).
- Guests can search the directory by beekeeper name and public location.
- Authenticated users are redirected from `/` to `/dashboard`.
- `/dashboard` contains the logged-in summary and recent activity view.
- Guest navbar shows only Home + Login/Register.

### Admin moderation

- Admin page includes a public-profile moderation list with a `Hide` action (`is_public_profile=false`).
- RLS policies for this are included in migration:
	- `supabase/migrations/20260302000100_profiles_admin_moderation.sql`

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npx supabase link --project-ref fphxrlinpnxritpflqxu
```

## Netlify

`netlify.toml` uses SPA fallback redirect:

- `/* -> /index.html (200)`

This enables direct opening of routes such as `/login` or `/dashboard` after deploy.

## Notes

- Current route guards are mock-based for phase 1 (`guest`, `auth`, `admin`).
- Navbar includes dev toggles: Mock Login / Mock Logout / Mock Admin.
- Real Supabase auth/roles will replace mock guard state in the next phase.