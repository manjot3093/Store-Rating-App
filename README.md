# Storehouse — Store Rating Platform

A full-stack web application where users submit 1–5 star ratings for registered stores. Built for the FullStack Intern Coding Challenge.

**Stack:** Express.js · PostgreSQL (Sequelize ORM) · React (Vite + Tailwind CSS) · JWT authentication

---

## ✨ Features

Everything in the spec, plus a few things that push it past the minimum:

- **Single login, three roles** — System Administrator, Normal User, Store Owner, gated by JWT + role-based middleware on every protected route.
- **Self-service signup** for normal users, with password/name/address validation enforced identically on the client and the server.
- **Admin dashboard** with live totals (users, stores, ratings) and a role-breakdown chart (Recharts).
- **Sortable, filterable data tables** everywhere the spec asks for one — click any column header to sort asc/desc; filter users by name/email/address/role and stores by name/email/address, all server-side.
- **Upsert ratings** — submitting a rating twice updates it in place instead of creating a duplicate row (enforced by a unique DB constraint on `user_id + store_id`, not just app logic).
- **Store Owner dashboard** showing the live average rating and a table of every customer who rated the store.
- **Change password** flow for every role, reusing the same password policy as signup.
- **Security hardening**: bcrypt password hashing, Helmet security headers, CORS allow-listing, per-IP rate limiting, centralized error handling with clean JSON error shapes.
- **One-command local setup** via Docker Compose (Postgres + API + frontend), or run each piece natively.
- **Seed script** that provisions a default admin plus demo store owner / normal user / store / rating so you can log in and see real data immediately — no manual data entry needed for a demo.
- Clean separation of concerns on the backend (routes → controllers → models), reusable validation utilities, and a small design system on the frontend instead of default browser styling.

---

## 🗂 Project structure

```
store-rating-app/
├── backend/
│   ├── config/db.js            # Sequelize connection
│   ├── models/                 # User, Store, Rating + associations
│   ├── middleware/              # auth (JWT + role guard), validation, error handler
│   ├── controllers/             # business logic per resource
│   ├── routes/                  # Express routers, one per resource
│   ├── utils/                   # JWT helpers, shared validators
│   ├── seed/seed.js             # creates default admin + demo data
│   └── server.js                # app entrypoint
├── frontend/
│   ├── src/
│   │   ├── api/axios.js         # HTTP client with auth interceptor
│   │   ├── context/AuthContext.jsx
│   │   ├── components/          # Layout, StarRating, StarInput, SortHeader, Modal, Alert...
│   │   ├── pages/                # one file per screen
│   │   └── utils/validation.js  # client-side mirror of server validation rules
│   └── ...
└── docker-compose.yml
```

### Database schema

```
users   (id, name, email UNIQUE, password[hash], address, role ENUM[admin,user,store_owner], timestamps)
stores  (id, name, email UNIQUE, address, owner_id -> users.id NULLABLE, timestamps)
ratings (id, user_id -> users.id, store_id -> stores.id, rating SMALLINT 1-5, timestamps,
         UNIQUE(user_id, store_id))
```

A store's overall rating and a store owner's dashboard numbers are computed on read via `AVG(rating)` rather than stored redundantly, so they're always accurate and there's nothing to keep in sync.

---

## 🚀 Getting started

### Option A — Docker (fastest)

Requires Docker + Docker Compose.

```bash
docker compose up --build
```

This starts Postgres, the API on `http://localhost:5000`, and the frontend on `http://localhost:5173`. On first run, exec into the backend container once to seed demo data:

```bash
docker compose exec backend npm run seed
```

### Option B — Run natively

**Prerequisites:** Node.js 18+, PostgreSQL 14+ running locally.

1. **Create the database**
   ```sql
   CREATE DATABASE store_ratings;
   ```

2. **Backend**
   ```bash
   cd backend
   cp .env.example .env      # edit DB credentials / JWT secret if needed
   npm install
   npm run seed               # creates admin + demo accounts (safe to re-run)
   npm run dev                 # http://localhost:5000
   ```

3. **Frontend**
   ```bash
   cd frontend
   cp .env.example .env       # points VITE_API_URL at the backend
   npm install
   npm run dev                 # http://localhost:5173
   ```

### Demo accounts (after seeding)

| Role           | Email                              | Password       |
|----------------|-------------------------------------|----------------|
| Admin          | admin@storeratings.com             | Admin@1234     |
| Store Owner    | owner.greenleaf@storeratings.com   | Owner@1234     |
| Normal User    | demo.user@storeratings.com         | DemoUser@1234  |

---

## ✅ Validation rules (enforced both client- and server-side)

| Field    | Rule                                                              |
|----------|--------------------------------------------------------------------|
| Name     | 20–60 characters                                                   |
| Address  | Max 400 characters                                                  |
| Password | 8–16 characters, ≥1 uppercase letter, ≥1 special character         |
| Email    | Standard email format                                              |
| Rating   | Integer, 1–5                                                        |

---

## 🔌 API overview

All routes are prefixed with `/api`.

| Method | Route                          | Access             | Purpose |
|--------|----------------------------------|---------------------|---------|
| POST   | `/auth/signup`                  | Public               | Register a normal user |
| POST   | `/auth/login`                   | Public               | Log in, returns JWT |
| GET    | `/auth/me`                      | Any authenticated    | Current user profile |
| PUT    | `/auth/change-password`         | Any authenticated    | Update password |
| GET    | `/admin/dashboard`              | Admin                | Totals + role breakdown |
| GET    | `/admin/users`                  | Admin                | Filter/sort users |
| GET    | `/admin/users/:id`               | Admin                | User detail (+ rating if store owner) |
| POST   | `/admin/users`                  | Admin                | Create user of any role |
| GET    | `/admin/stores`                  | Admin                | Filter/sort stores |
| POST   | `/admin/stores`                  | Admin                | Create a store, optionally link an owner |
| GET    | `/stores`                        | Normal User           | Browse/search stores + own rating |
| POST   | `/stores/:storeId/ratings`       | Normal User           | Submit or update a rating |
| GET    | `/store-owner/dashboard`         | Store Owner            | Average rating + raters list |

---

## 🧭 Design notes

The frontend intentionally avoids the "generic admin template" look — a small type system (Fraunces for display, Inter for body copy, IBM Plex Mono for data/labels) and a restrained navy/blue palette with a warm accent reserved for star ratings, to read as a purpose-built registry tool rather than a scaffolded CRUD demo.
