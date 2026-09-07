# NestlyCampus - Frontend

Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui frontend for the Student Accommodation Finder platform.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui (Base UI primitives)
- Client-side JWT auth via React Context (`lib/auth-context.tsx`)

## Project structure
```
frontend/
├── app/
│   ├── (site)/         # public pages: home, browse, listing details, login, register
│   ├── student/         # student dashboard + pages (protected, role=STUDENT)
│   ├── landlord/         # landlord dashboard + pages (protected, role=LANDLORD)
│   └── admin/             # admin dashboard + pages (protected, role=ADMIN)
├── components/
│   ├── ui/               # shadcn/ui primitives
│   ├── layout/            # navbar, footer, dashboard shell
│   └── ...                # listing-card, listing-form, conversations-view, etc.
├── services/             # typed API client functions per resource
├── lib/                   # api-client, auth-context, format helpers, utils
├── types/                 # shared TypeScript types mirroring backend models
```

## Setup
```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

Runs on `http://localhost:3000`. Requires the backend API to be running (see `../backend/README.md`).

## Environment variables
- `NEXT_PUBLIC_API_URL` - base URL of the backend API (e.g. `http://localhost:5000/api`)

## Scripts
```bash
npm run dev      # start dev server
npm run build    # production build
npm start        # run production build
npm run lint     # ESLint
```

## Authorization model
The frontend uses `ProtectedRoute` (`components/protected-route.tsx`) to gate `/student`, `/landlord` and `/admin` routes by role for user experience purposes only. **All real authorization is enforced by the backend** - every API request is independently validated against the authenticated user's role and resource ownership, so URL manipulation or DevTools tampering cannot bypass access control.

## Design
Warm, professional "housing platform" palette (terracotta primary + deep teal accent) defined in `app/globals.css`. Built mobile-first with responsive grids, loading/empty/error states, and toast feedback (via `sonner`) for every mutating action.
