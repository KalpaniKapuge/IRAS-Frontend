# IRAS Frontend

Frontend for the **Intelligent Recruitment Automation System** — an AI-powered recruitment
platform covering job description generation, resume parsing, candidate ranking, skill-gap
analysis, automated job-candidate matching, candidate feedback, and a recruitment-specific
chatbot, built for Candidate, Employer, and Admin workflows.

## Stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** with a full HSL-based design token system (light / dark / system theme)
- **Radix UI primitives**, composed shadcn-style, in `src/components/ui`
- **Zustand** for both client state (theme, UI, auth) and server state per feature
- **React Router v6** with role-based route guards
- **Axios** API client with JWT bearer auth and centralized error normalization
- **Recharts** for the admin analytics dashboard

## Architecture

Feature-based structure — each business capability owns its types, API calls, state, and UI:

```
src/
  app/              Router, route guards
  components/ui/    Radix-based design system primitives (Button, Dialog, Table, ...)
  components/shared/ App-specific shared components (StatusBadge, EmptyState, StatCard, ...)
  components/layout/ Sidebar, Topbar, AppShell, mobile nav
  config/           Role-based navigation config
  features/
    auth/
    candidate-profile/
    employer-profile/
    resumes/
    jobs/
    applications/
    feedback/
    skill-gaps/
    job-matches/
    skill-taxonomy/
    chat/
    notifications/
    admin-users/
    admin-jobs/
    admin-reports/
    knowledge-base/
    system-status/
    audit-logs/
    dashboard/
  hooks/            Cross-cutting hooks (debounce, ...)
  lib/               api-client, utils, format, chart-colors
  stores/            App-wide Zustand stores (theme, ui)
  types/             Enum mirrors of the backend + shared DTO helpers
```

Each feature folder follows the same shape: `types.ts` → `api.ts` → `store.ts` (when the
feature needs shared/cross-page state) → `components/` → `pages/`.

## Getting started

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your IRAS.API instance
npm run dev
```

The backend (IRAS.API, ASP.NET Core) must be running and reachable at `VITE_API_BASE_URL`.
CORS and HTTPS dev certificates must be configured on the API side for local development.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) and produce a production build
- `npm run preview` — preview the production build locally

## Theming

Colors are defined once as HSL CSS variables in `src/index.css` (`:root` for light, `.dark`
for dark) and consumed everywhere via Tailwind's `hsl(var(--token))` color extensions in
`tailwind.config.ts` — there are no hard-coded colors in components. Theme preference (light /
dark / system) is persisted via `useThemeStore` (`src/stores/theme-store.ts`) and applied
before first paint via an inline script in `index.html` to avoid a flash of incorrect theme.
