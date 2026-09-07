# NestlyCampus - Student Accommodation Finder

A production-ready platform connecting students with verified off-campus accommodation near their campus, and landlords with a centralized way to list and manage properties. Built with a secure, role-based architecture (STUDENT / LANDLORD / ADMIN) where every permission is enforced on the backend.

**"Find your place. Stay closer."**

---

## 1. Project structure

```
Student Accommodation Finder/
├── backend/                 # Express + TypeScript + Prisma + PostgreSQL API
│   ├── prisma/               # schema.prisma, migrations, seed.ts
│   ├── src/
│   │   ├── config/            # env, prisma client
│   │   ├── middleware/         # auth, role, validation, error handling, security
│   │   ├── utils/               # jwt, password, distance (haversine), apiResponse
│   │   ├── validators/          # zod schemas
│   │   ├── services/            # business logic
│   │   ├── controllers/         # request handlers
│   │   ├── routes/               # route wiring + role guards
│   │   └── app.ts / server.ts
│   └── tests/                 # Jest + Supertest (23 tests, all passing)
└── frontend/                 # Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
    ├── app/
    │   ├── (site)/              # public: home, browse, listing details, login, register
    │   ├── student/              # student dashboard & pages
    │   ├── landlord/              # landlord dashboard & pages
    │   └── admin/                  # admin dashboard & pages
    ├── components/               # shared UI (listing card, dashboard shell, forms, etc.)
    ├── services/                  # typed API client functions
    └── lib/, types/                # auth context, api client, shared types
```

## 2. Completed features

**Authentication & authorization**
- Registration (STUDENT/LANDLORD only - ADMIN never public), login, JWT auth, bcrypt password hashing, protected routes, role middleware enforced on every API route.

**Students**
- Browse/search/filter/sort accommodation (campus, price, distance, type, availability, rooms, amenities, rating), pagination, listing details, favourites, enquiries, real-time-feel messaging, reviews, reports, notifications, profile.

**Landlords**
- Registration with PENDING verification, listing CRUD (requires VERIFIED status), availability management (separate from approval), enquiries, messaging, reviews received, notifications, profile.

**Admin**
- Platform dashboard with live statistics, user management (suspend/unsuspend), landlord verification queue, listing approval/rejection queue, campus management (CRUD + activate/deactivate), report moderation, review moderation, notifications, audit logs.

**Cross-cutting**
- Server-side Haversine distance calculation (never trusts client-supplied distance), server-side search/filter/pagination, centralized error handling with consistent `{ success, data/message }` responses, rate limiting, Helmet security headers, CORS, input validation with Zod on every mutating endpoint.

## 3. Database (Prisma / PostgreSQL)

Core models: `User` (role, verificationStatus, campus/business fields), `Campus`, `Listing` (accommodationType, approvalStatus, availabilityStatus, distanceFromCampus), `ListingPhoto`, `Favourite`, `Enquiry`, `Conversation`, `Message`, `Review`, `Report`, `Notification`, `AuditLog`.

Key relationships: a `Listing` belongs to a `User` (owner) and a `Campus`; `Conversation` links a `Listing`, a student and a landlord (unique together); `Enquiry` optionally links 1:1 to the `Conversation` it started; `Favourite` and `Review` are unique per (student, listing).

## 4. API (selected endpoints)

```
POST   /api/auth/register            POST /api/auth/login          GET /api/auth/me
GET    /api/campuses                 POST/PUT /api/campuses(/:id)  [admin]
GET    /api/listings                 GET /api/listings/:id          GET /api/listings/mine [landlord]
POST   /api/listings                 PUT/PATCH/DELETE /api/listings/:id
POST   /api/favourites/:listingId    DELETE /api/favourites/:listingId   GET /api/favourites
POST   /api/enquiries                GET /api/enquiries(/:id)
GET    /api/conversations            GET/POST /api/conversations/:id/messages
POST   /api/reviews                  GET /api/reviews/listing/:id   GET /api/reviews/mine
POST   /api/reports
GET    /api/notifications            PATCH /api/notifications/:id/read
GET    /api/admin/dashboard          GET /api/admin/users            PATCH /api/admin/users/:id/suspend
GET    /api/admin/landlords(/pending) PATCH /api/admin/landlords/:id/verify
GET    /api/admin/listings           PATCH /api/admin/listings/:id/approve|reject
GET    /api/admin/reports            PATCH /api/admin/reports/:id
GET    /api/admin/reviews            DELETE /api/admin/reviews/:id
GET    /api/admin/audit-logs
```

All responses follow `{ success, data, pagination? }` or `{ success: false, message }`.

## 5. Authentication & roles

JWT (`userId`, `role`) issued on register/login, sent as `Authorization: Bearer <token>`. Every protected route runs `requireAuth` (verifies token) then `requireRole(...)` (rejects disallowed roles) - enforced server-side regardless of what the frontend hides. Ownership checks (e.g. a landlord editing only their own listing, users only accessing their own conversations) are enforced in the service layer.

## 6. Dashboards

- **Student**: search CTA, saved listings, enquiries, unread messages, notifications count, recent saved listings & enquiries.
- **Landlord**: listing counts by approval status, available rooms, enquiries/unread messages, verification status banner when unverified.
- **Admin**: platform-wide statistics (students, landlords, verification/approval queues, pending reports), recent audit activity feed.

Each has its own layout, sidebar navigation, and pages - not a shared dashboard with a different heading.

## 7. Environment variables

**backend/.env**
```
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 8. Running locally

```bash
# Backend
cd backend
npm install
cp .env.example .env        # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run prisma:seed
npm run dev                 # http://localhost:5000

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev                 # http://localhost:3000

# Backend tests
cd backend && npm test
```

### Dummy development login credentials (seeded, not real accounts)
| Role     | Email                    | Password     |
|----------|---------------------------|--------------|
| Admin    | admin@example.com         | AdminDev123! (or `ADMIN_PASSWORD` in .env) |
| Student  | student1@example.com       | Passw0rd!    |
| Landlord (verified)  | landlord1@example.com | Passw0rd! |
| Landlord (pending)   | landlord3@example.com | Passw0rd! |

## 9. Deployment

- **Frontend → Vercel**: set `NEXT_PUBLIC_API_URL` to the deployed backend URL.
- **Backend → Render** (or similar Node host): set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` (the deployed frontend URL, for CORS), `NODE_ENV=production`. Run `npx prisma migrate deploy` during release, then `npm run build && npm start`.
- **Database → Neon PostgreSQL**: create a project, copy the pooled connection string into `DATABASE_URL` on the backend host.

Ensure `CLIENT_URL` on the backend exactly matches the deployed frontend origin (CORS is locked to a single origin).

## 10. Testing

`backend/tests` - Jest + Supertest, run against a live database:

```
Test Suites: 6 passed, 6 total
Tests:       23 passed, 23 total
```

Covers: registration/login/password hashing/protected routes, role-based authorization (student blocked from creating listings, unverified landlord blocked, cross-landlord ownership protection, admin-only routes), listing validation & approval workflow & pagination, favourites (add/remove/duplicate prevention), reviews (duplicate prevention, rating aggregation), messaging (enquiry → conversation, cross-user isolation).

## 11. Remaining work / known limitations

- **Cloud image storage**: v1 uses plain image URLs per the spec (design supports adding upload infrastructure later without schema changes).
- **Real-time messaging**: messages are fetched via polling/refresh rather than WebSockets - acceptable for v1, but a natural next step (Socket.io/SSE) if live delivery is required.
- **Email notifications**: only in-app notifications are implemented; transactional email (e.g. verification results, new enquiries) would need an email provider (e.g. Resend/SendGrid) and API key.
- **Rating-based sort/filter at scale**: computed via an in-memory aggregation pass for correctness; for very large listing volumes this should move to a materialized average-rating column updated on review write.
- Nothing else was skipped - every item in the specification (roles, campuses, listing approval/availability separation, distance calculation, search/filter/sort/pagination, favourites, enquiries/messaging, reviews, reports, notifications, admin moderation, audit logs, dashboards, security, environment variables, seeding, testing) has a working implementation verified end-to-end against a live Neon PostgreSQL database and a running frontend.
