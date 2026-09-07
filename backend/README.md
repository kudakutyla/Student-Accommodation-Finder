# NestlyCampus - Backend API

Node.js + Express + TypeScript + Prisma + PostgreSQL backend for the Student Accommodation Finder platform.

## Stack
- Express.js + TypeScript
- Prisma ORM + PostgreSQL (Neon-compatible)
- JWT authentication + bcryptjs password hashing
- Zod request validation
- Helmet, CORS, rate limiting

## Project structure
```
backend/
├── prisma/
│   ├── schema.prisma      # Database models & enums
│   └── seed.ts             # Development seed data
├── src/
│   ├── config/             # env, prisma client
│   ├── middleware/          # auth, roles, validation, error handling, security
│   ├── utils/               # jwt, password, distance (haversine), apiResponse, asyncHandler
│   ├── validators/          # zod schemas per module
│   ├── services/            # business logic
│   ├── controllers/         # thin request handlers
│   ├── routes/               # route wiring + role guards
│   ├── app.ts / server.ts
├── tests/                   # Jest + Supertest test suite
```

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, etc.
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

The API runs on `http://localhost:5000` by default. Health check: `GET /health`.

## Environment variables
See `.env.example`:
- `DATABASE_URL` - PostgreSQL connection string (Neon or any Postgres instance)
- `JWT_SECRET` - long random secret for signing JWTs
- `JWT_EXPIRES_IN` - token lifetime (default `7d`)
- `PORT` - server port (default `5000`)
- `CLIENT_URL` - allowed CORS origin (the frontend URL)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` - used only by the seed script to create the first admin account

## Scripts
```bash
npm run dev             # start dev server (ts-node-dev)
npm run build            # compile TypeScript to dist/
npm start                # run compiled server
npm test                 # run Jest test suite
npm run prisma:migrate   # create/apply a migration
npm run prisma:seed      # seed development data
npm run prisma:studio    # open Prisma Studio
```

## Testing
`npm test` runs Supertest-driven integration tests against a real database connection (configured via `DATABASE_URL`), covering:
- Authentication (registration, login, password hashing, protected routes)
- Authorization (role-based access control, ownership checks, unverified landlord restrictions)
- Listings (validation, approval workflow, search/pagination)
- Favourites (add/remove/duplicate prevention)
- Reviews (creation, duplicate prevention, rating aggregation)
- Messaging (enquiry → conversation flow, cross-user conversation isolation)

## Security notes
- Passwords hashed with bcryptjs (12 salt rounds).
- JWTs carry only `userId` and `role`; every protected route re-verifies the role and, where applicable, resource ownership server-side.
- Public registration only allows `STUDENT` or `LANDLORD`; `ADMIN` accounts are created via the seed/bootstrap script only.
- Distance from campus is always computed server-side (Haversine formula) - client-supplied distance is never trusted.
- Centralized error handler never leaks stack traces in production responses.
