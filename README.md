# GoldenBee Analytics

GoldenBee Analytics is a capstone multi-page beekeeping registry and hive journal application.
It follows a classic modular website architecture: each page has its own HTML file and JS entry module, with shared components and Supabase services split into focused files.

## Overview

- Manage beekeeper authentication with Supabase Auth.
- Organize apiaries and hives.
- Track hive inspection entries with validated dates.
- Upload and manage hive photos in Supabase Storage.
- Keep profile visibility opt-in for public profile use cases.
- Provide an analytics page for operational beekeeping indicators.
- Support JSON export flow (PDF export planned in future phase).

## Feature Checklist

- [x] Multi-page architecture (no SPA routing)
- [x] Dedicated page entry module per HTML page
- [x] Shared navbar/footer/toast component modules
- [x] Lightweight i18n module (`bg` default, `en` ready)
- [x] Supabase client/service placeholders wired for future data features
- [x] Vite + npm development and production build setup
- [ ] Full production CRUD flows for apiaries/hives/hive entries
- [ ] Full RLS policy implementation in migrations
- [ ] PDF export
- [ ] Voice input integration

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
- fallback/not found → `404.html`

## Folder Structure

```text
.
├── 404.html
├── admin.html
├── analytics.html
├── apiary.html
├── dashboard.html
├── hive.html
├── index.html
├── login.html
├── profile.html
├── register.html
├── src/
│   ├── assets/
│   │   └── img/
│   ├── components/
│   │   ├── footer/
│   │   │   ├── footer.css
│   │   │   └── footer.js
│   │   ├── navbar/
│   │   │   ├── navbar.css
│   │   │   └── navbar.js
│   │   └── toast/
│   │       ├── toast.css
│   │       └── toast.js
│   ├── i18n/
│   │   ├── bg.js
│   │   ├── en.js
│   │   └── i18n.js
│   ├── pages/
│   │   ├── admin/ (admin.js, admin.css)
│   │   ├── analytics/ (analytics.js, analytics.css)
│   │   ├── apiary/ (apiary.js, apiary.css)
│   │   ├── dashboard/ (dashboard.js, dashboard.css)
│   │   ├── hive/ (hive.js, hive.css)
│   │   ├── home/ (home.js, home.css)
│   │   ├── login/ (login.js, login.css)
│   │   ├── notfound/ (notfound.js, notfound.css)
│   │   ├── profile/ (profile.js, profile.css)
│   │   └── register/ (register.js, register.css)
│   ├── services/
│   │   ├── authService.js
│   │   └── supabaseClient.js
│   ├── styles/
│   │   ├── app.css
│   │   └── variables.css
│   └── utils/
│       ├── appSetup.js
│       └── dom.js
├── netlify.toml
├── package.json
└── vite.config.js
```

## Supabase Setup

### Environment Variables

Create `.env` in project root:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Required Tables

- `profiles`
- `user_roles`
- `apiaries`
- `hives`
- `hive_entries`
- `photos`

### Storage Bucket

- Create bucket for hive photos (example: `hive-photos`).
- Use user-scoped object paths (example: `user_id/apiary_id/hive_id/file.jpg`).
- Enforce access with Storage policies aligned to Auth + roles.

### Migrations and Policies

- Use SQL migrations for every schema change.
- Do not edit old migrations after commit; add a new migration instead.
- Enable and enforce RLS on all user data tables.
- Add owner/admin policies for read/write behavior.

## Development / Build / Deploy

### Local Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

### Netlify Deploy

1. Push repository to Git provider.
2. Create a Netlify site from the repo.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in Netlify site settings.
6. Ensure `netlify.toml` redirects/headers are kept in sync with page URLs.

## Notes / Future Work

- UI language defaults to Bulgarian via `src/i18n/i18n.js` and can switch language using `setLanguage(lang)`.
- Keep user-facing text in dictionary files (`src/i18n/bg.js`, `src/i18n/en.js`) instead of hardcoding strings in services/logic.
- Voice input integration is planned and should live in a dedicated speech module boundary.
- PDF export is planned for a future delivery after JSON export flow is finalized.