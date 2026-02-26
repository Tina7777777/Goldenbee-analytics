# GoldenBee Analytics

Build: Static SPA with client-side routing (History API) using Vanilla JS + Bootstrap.

## Architecture Overview

- Single HTML entry point: `index.html`
- App bootstrap: `src/main.js`
- Router: `src/router/router.js`
- Pages: one folder per screen in `src/pages/<page>/` with `<page>.js` + `<page>.css`
- Shared UI: `src/components/navbar`, `src/components/footer`, `src/components/toast`
- i18n: `src/i18n/i18n.js` with Bulgarian default (`bg`) and English fallback (`en`)

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

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Netlify

`netlify.toml` uses SPA fallback redirect:

- `/* -> /index.html (200)`

This enables direct opening of routes such as `/login` or `/dashboard` after deploy.

## Notes

- Current route guards are mock-based for phase 1 (`guest`, `auth`, `admin`).
- Navbar includes dev toggles: Mock Login / Mock Logout / Mock Admin.
- Real Supabase auth/roles will replace mock guard state in the next phase.