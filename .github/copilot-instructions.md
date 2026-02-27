# Copilot Instructions — GoldenBee-Analytics

## 1) Project Identity
GoldenBee-Analytics is a capstone beekeeping registry and hive journal application.

Primary goals:
- Manage beekeeper accounts and authentication.
- Manage apiaries and hives.
- Record hive inspection entries with auto-generated date.
- Upload and manage hive photos in Supabase Storage.
- Support partially public beekeeper profiles (opt-in visibility).
- Show apiary analytics (brood frames distribution, queen status, honey levels, etc.).
- Export structured JSON data (PDF export planned for future phase).

## 2) Mandatory Tech Stack
Use only the following unless explicitly approved in project scope updates:
- Frontend: HTML, CSS, JavaScript, Bootstrap.
- Backend services: Supabase (Auth, PostgreSQL, Storage).
- Tooling: Node.js, npm, Vite.
- Module system: ES6 modules.

Hard constraints:
- NO React.
- NO Vue.
- NO TypeScript.

## 3) Architecture & Organization Rules
This is a static SPA with client-side routing. Keep each screen (page) in a separate module/file and maintain modular boundaries.

Modular design requirements:
- Use a modular code structure with separate files for components, pages, and feature-specific logic.
- Use ES6 modules consistently to organize and compose application code.
- Keep page-level code reusable where practical (shared layout blocks, shared form handlers, shared validators).

Recommended structure:
- `pages/` — page entry scripts and page-specific logic.
- `services/` — Supabase access, data operations, auth/session APIs.
- `components/` — reusable UI components.
- `utils/` — helpers, formatters, validators, constants.
- `styles/` — CSS organization (global + page/component-specific).
- `lib/` — third-party initialization (e.g. supabaseClient.js)
- `router/` — client-side routing logic and route guards

Rules:
- Use small focused modules.
- Avoid monolithic files.
- Separate UI rendering, business logic, and data access.
- Prefer pure utility functions where possible.
- Keep imports explicit and avoid circular dependencies.

## 4) Feature Scope Requirements
Implement and maintain support for:
1. Register and login flows.
2. Apiary creation and management.
3. Hive creation inside apiaries.
4. Hive inspection entries with auto-generated date.
5. Photo upload integration with Supabase Storage.
6. Beekeeper profile management with opt-in public visibility.
7. Apiary analytics dashboard.
8. Structured JSON export.

Future-planned (not required to fully implement now):
- PDF export.
- Voice input via Web Speech API / replaceable speech-to-ML module.

## 5) Database Standards (Supabase/PostgreSQL)
Required tables:
- `profiles`
- `user_roles`
- `apiaries`
- `hives`
- `hive_entries`
- `photos`
- All dates for hive inspection entries must be generated server-side or validated before insert.

Data and schema rules:
- Use RLS on all user data tables.
- Write explicit policies for owner/admin access.
- Store role information in `user_roles` using a roles enum.
- Keep migration files deterministic and reversible where possible.
- All schema changes must be implemented via Supabase CLI migrations stored under `supabase/migrations/`.
- Never modify the schema directly from Supabase Dashboard.
- Never edit existing migration files after they are applied; always create a new migration.
- Local migration files must be committed to Git.

## 6) Authentication, Authorization, and Route Protection
- Use Supabase Auth for registration, login, logout, and session management.
- Implement role-based access (`user`, `admin`) via `user_roles`.
- Protect page access and actions based on:
  - authenticated session status
  - role permissions
- Enforce auth/role checks both in frontend flow and DB policies.

## 7) UI/UX Guidelines
Minimum screens to support:
- Home
- Login
- Register
- Dashboard
- Hive Details
- Analytics
- Admin

UI rules:
- Use HTML, CSS, Bootstrap, and Vanilla JavaScript for frontend implementation.
- Responsive for desktop and mobile.
- Use Bootstrap components and utility classes.
- Use semantic HTML structure and accessible form patterns.
- Maintain a consistent color palette and typography across all screens.
- Use icons and visual indicators for hive health/status where appropriate.
- Use subtle visual effects and clear cues only when they improve usability.
- Keep interactions clear and accessible.

## Internationalization (i18n) & Language Policy
- UI language: Bulgarian (bg) by default (all labels, buttons, messages, headings shown to users).
- Codebase language: English only (file/folder names, function/variable names, comments).
- Documentation: README in English (for GitHub/capstone reviewers). Optional separate user-facing Bulgarian help later.

i18n implementation rules:
- Do NOT hardcode user-facing strings inside JS logic or services.
- Use a lightweight in-house i18n module (no frameworks):
  - `src/i18n/i18n.js` provides `t(key)` and `setLanguage(lang)`.
  - Dictionary files: `src/i18n/bg.js`, `src/i18n/en.js` (more languages may be added later).
- Persist selected language in `localStorage` (key: `gba_lang`).
- Default language: `bg`.
- If a translation key is missing, fallback to Bulgarian (bg) and log a warning in console (English log).
- Keep translation keys stable and structured (e.g. `nav.*`, `auth.*`, `profile.*`, `hiveEntry.*`, `errors.*`).

## 8) Pages and Navigation (Static SPA with client-side routing)
- Build as a static SPA with a single HTML entry point: `index.html`.
- Use a lightweight custom client-side router in `src/router/router.js` (no frameworks).
- Keep each screen (page) in a separate folder and file set:
  - `src/pages/<page>/<page>.js`
  - `src/pages/<page>/<page>.html` (template)
  - `src/pages/<page>/<page>.css` (page styles)

Routes (URLs) must represent different screens:
- `/` (Home)
- `/login`
- `/register`
- `/dashboard`
- `/profile`
- `/apiary?id=:id`
- `/hive?id=:id`
- `/analytics`
- `/admin`

Routing rules:
- Navigation must be URL-driven using the History API (pushState + popstate) without full page reload.
- The router must implement a clear lifecycle: resolve route → render view → initialize logic.
- Use query parameters (e.g. `?id=`) for entity identification.
- Validate required query parameters (e.g. `id`) and redirect to Not Found if invalid or missing.
- Render a dedicated Not Found screen for unknown routes.

### Route Protection Matrix
| Route | Access | Notes |
|---|---|---|
| `/`, `/login`, `/register` | Public | If authenticated, redirect away from auth routes to `/dashboard`. |
| `/dashboard`, `/profile`, `/apiary?id=:id`, `/hive?id=:id`, `/analytics` | Authenticated (`user` or `admin`) | Guard in router + enforce ownership in DB via RLS. |
| `/admin` | Authenticated + `admin` role | Guard in router and enforce via DB policies/RLS. |
| `*` (unknown) | Public | Render Not Found screen. |

## 9) Future Voice Input Integration (Architecture Readiness)
Prepare extension points now:
- Keep speech parsing in a dedicated module boundary.
- Do not couple voice parsing directly to UI components.
- Expose an interface-style contract so implementation can switch from Web Speech API to an ML model later.
- Keep command intent mapping isolated and testable.

## 10) Code Quality Standards
- Follow clean code principles.
- Use meaningful names for files, functions, and variables.
- Keep functions short and focused.
- Avoid duplication; extract reusable helpers.
- Handle errors explicitly (auth, network, storage, DB operations).
- Do not introduce dead code or speculative abstractions.

## 11) Documentation & Capstone Compliance
- Keep `README.md` updated with:
  - setup instructions
  - environment variables
  - run/build commands
  - architecture summary
  - feature checklist
- Keep implementation aligned with capstone requirements at all times.
- Any feature tradeoff must be documented in README and/or project notes.
Build: Static SPA with client-side routing.

## 12) Delivery Checklist for AI-Assisted Changes
Before finalizing any change:
1. Verify feature scope alignment.
2. Verify module boundaries are preserved.
3. Verify RLS/auth/role impact.
4. Verify responsive UI behavior.
5. Verify no forbidden stack additions (React/Vue/TypeScript).
6. Update README when behavior/setup changes.

---

When generating code for this project, prioritize clarity, modularity, security (RLS + role checks), and strict adherence to capstone scope and stack constraints.