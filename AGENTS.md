<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Artemis Web

Next.js 16 (Turbopack) frontend for the Artemis job platform. Job search, company profiles, user onboarding, and dashboard.

## Tech Stack
- **Next.js 16.2.6** (App Router, Turbopack) + **React 19.2.4**
- **Tailwind CSS v4** with **shadcn/ui** (Base UI components, base-nova style)
- **TypeScript 5**

## Commands
```bash
npm run dev      # Dev server (port 3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Project Structure
```
src/
  app/
    layout.tsx           -- Root layout (AuthProvider, Space Grotesk font)
    page.tsx             -- Landing page (unauthenticated search)
    login/               -- Login page
    signup/              -- Signup page
    forgot-password/     -- Forgot password flow
    onboarding/          -- Multi-step profile setup wizard
    dashboard/           -- Authenticated: search, jobs/[id], companies/[slug], saved, profile
  components/
    ui/                  -- shadcn/ui primitives (button, card, dialog, etc.)
    job-card.tsx, search-bar.tsx, tag-input.tsx, user-nav.tsx, job-detail-dialog.tsx
  hooks/                 -- use-mobile.ts (responsive detection)
  lib/
    api.ts               -- API client (calls artemis-api Go backend)
    auth-context.tsx      -- Auth provider (context + hook)
    master-lists.ts       -- Static data (skills, roles, industries)
    mock-data.ts          -- Development mock data
    recent-views.ts       -- Browser storage for recent job views
    utils.ts              -- Shared utilities
```

## Routes
| Route | Type | Auth |
|-------|------|------|
| `/` | Static | No |
| `/login`, `/signup`, `/forgot-password` | Static | No |
| `/onboarding` | Static | No (wizard, redirects to dashboard after) |
| `/dashboard` | Static | Yes |
| `/dashboard/search`, `/dashboard/saved`, `/dashboard/profile` | Static | Yes |
| `/dashboard/jobs/[id]` | Dynamic | Yes |
| `/dashboard/companies/[slug]` | Dynamic | Yes |

## Patterns
- Auth state via React Context (`AuthContext` in `lib/auth-context.tsx`), consumed with `useAuth()` hook.
- API calls go through `lib/api.ts` which constructs fetch requests to the Go backend.
- Components use `cn()` from `lib/utils.ts` for Tailwind class merging.
- The onboarding flow is a multi-step wizard — users can upload a resume for AI parsing or fill manually.
