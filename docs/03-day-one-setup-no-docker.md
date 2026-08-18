# Document 3 — Day One Setup (No Docker)

**Project:** Nigerian Catholic Church Directory & Liturgical Companion
**Version:** 1.0 · August 2026

> **Reading of the requirement:** no Docker, no local database or Redis installation. Develop directly against hosted managed services from the first commit, so there is never a migration from "local setup" to "real setup".
>
> This is a legitimate approach and it is what this document describes. Trade-offs in §2 — read them before committing.

---

## 1. The approach

**You develop against the same platforms you will run in production, from commit one.** Two separate Supabase projects — one for development, one for production — and the application code runs natively on your Mac via `npm`/`ng`/`flutter`. No containers, no `docker-compose`, nothing to install beyond language toolchains.

```
Your Mac                              Hosted (free tiers)
┌────────────────────────┐            ┌──────────────────────────┐
│ NestJS API   (node)    │───────────►│ Supabase: catholic-dev   │
│ Angular      (ng serve)│            │   Postgres 16 + PostGIS  │
│ Flutter      (emulator)│───────────►│ Cloudflare R2: dev bucket│
└────────────────────────┘            │ Firebase: FCM, Remote Cfg│
                                      └──────────────────────────┘
```

**Why this means no rework later:** you are already on Postgres 16 with PostGIS, already on R2's S3 API, already on real FCM. There is no local-to-cloud translation step, because there is no local. Going to production is creating a second Supabase project and pointing a different `.env` at it.

---

## 2. Honest trade-offs

| | Hosted-only (this doc) | Docker locally |
|---|---|---|
| Setup time | ~1 hour, all in browsers | ~2 hours, one-time |
| Works offline | **No** | Yes |
| Query latency | 50–200ms to Supabase | ~1ms |
| Migration risk later | None | None (same Postgres version) |
| Free-tier limits | 500MB DB, project pauses after 7 days idle | None |
| Onboarding a 2nd dev | Give them credentials | `docker-compose up` |
| Risk of touching prod data | **Real — mitigate deliberately** | Zero |

**The one that will actually annoy you:** no offline development. Every query, every migration, every API restart needs a live connection. On an unreliable connection that is a real productivity tax, and it is the reason most teams keep a local database. You are trading offline capability for setup simplicity.

**The one that could hurt you:** with no local database, `.env` is the only thing standing between a dev session and production data. §7 covers mitigation. Take it seriously.

> If you later want the offline capability, adding local Postgres is **not rework** — same version, same migrations, one changed connection string. This decision is reversible in an afternoon. Do not over-think it.

---

## 3. Accounts to create

Work through these in a browser before touching any code. ~45 minutes.

| # | Service | What to create | Cost |
|---|---|---|---|
| 1 | **GitHub** | Two private repos: `catholic-platform`, `catholic-mobile` | Free |
| 2 | **Supabase** | Project `catholic-dev`, region **eu-west-1 (Ireland)** or **eu-central-1** — closest to Nigeria with good routing. Save the DB password immediately. | Free |
| 3 | **Cloudflare** | R2 bucket `catholic-dev`. Create an API token scoped to that bucket only. | Free ≤10GB |
| 4 | **Firebase** | Project `catholic-app`. Enable Cloud Messaging, Remote Config, Analytics, Crashlytics. **Stay on the Spark (free) plan** — you are not using Firebase Storage. | Free |
| 5 | **Google Play Console** | Developer account. **Do this now** — the 14-day closed-test clock is the longest lead-time item in the project. | **$25** |
| 6 | **Sentry** | Project for the API | Free |

**Do not create yet:**

- **Apple Developer ($99/yr)** — the annual clock starts on payment. You need it at task 1.7.5, roughly month 7. Xcode's free personal team lets you run on your own iPhone until then.
- **Redis** — you have no queue work until task 1.2.6 (image resize). Skip it for now; see §8.
- **Supabase production project** — create it when you first deploy, not before.
- **AdMob** — Phase 2.

---

## 4. Local toolchain

Everything via Homebrew. No containers.

```bash
# Node 20 + package manager
brew install node@20 pnpm
node --version    # expect v20.x

# CLIs
pnpm add -g @angular/cli @nestjs/cli

# Flutter — fvm pins the SDK version per project, worth it
brew tap leoafarias/fvm && brew install fvm
fvm install stable && fvm global stable

# Mobile IDEs
brew install --cask android-studio
# Xcode from the App Store (large — start the download now)
```

Then in Android Studio: SDK Manager → install an Android 14 (API 34) system image and create an emulator. In Xcode: Settings → Platforms → install an iOS simulator runtime.

```bash
flutter doctor    # resolve everything before writing Dart
```

> Versions drift. If a command has changed, trust the tool's own docs over this file.

---

## 5. Supabase configuration

### 5.1 Enable PostGIS

Not on by default. Supabase dashboard → SQL Editor:

```sql
create extension if not exists postgis;
create extension if not exists pg_trgm;   -- fuzzy parish-name search

select postgis_version();                 -- confirm
```

### 5.2 Connection strings — the gotcha that will cost you an afternoon

Supabase exposes more than one connection endpoint, and **they are not interchangeable**:

| Endpoint | Port | Use for |
|---|---|---|
| **Direct connection** | 5432 | TypeORM **migrations** |
| **Session pooler** | 5432 | Migrations, if direct fails (IPv6-only networks) |
| **Transaction pooler** | 6543 | The **running application** |

**Migrations must not run through the transaction pooler.** It does not support the prepared statements and advisory locks TypeORM's migration runner needs — you get confusing lock timeouts and half-applied migrations rather than a clean error.

So keep two variables:

```env
# .env.development  — NEVER commit
DATABASE_URL=postgresql://postgres.<ref>:<pwd>@<host>:6543/postgres   # app
MIGRATION_DATABASE_URL=postgresql://postgres:<pwd>@<host>:5432/postgres # migrations
DATABASE_SSL=true
```

Copy the exact host strings from your project's **Connection** settings — Supabase has changed these more than once, so the dashboard is authoritative, not this document.

### 5.3 Two projects, never one

Create `catholic-prod` only when you first deploy. Until then there is exactly one database and no way to confuse them.

---

## 6. Scaffold the repositories

### 6.1 Platform monorepo

```bash
npx create-nx-workspace@latest catholic-platform \
  --preset=apps --packageManager=pnpm
cd catholic-platform

pnpm add -D @nx/nest @nx/angular @nx/js

npx nx g @nx/nest:app api
npx nx g @nx/angular:app back-office --style=scss --routing=true
npx nx g @nx/js:lib entities  --directory=libs/entities
npx nx g @nx/js:lib dto       --directory=libs/dto
npx nx g @nx/js:lib common    --directory=libs/common

pnpm add @nestjs/typeorm typeorm pg @nestjs/config @nestjs/swagger
pnpm add class-validator class-transformer argon2 @nestjs/passport passport-jwt
pnpm add -D @types/passport-jwt
```

### 6.2 Mobile

```bash
flutter create --org ng.catholicapp --platforms=android,ios catholic_mobile
cd catholic_mobile
flutter pub add drift sqlite3_flutter_libs path_provider dio \
  geolocator url_launcher firebase_core firebase_messaging \
  flutter_secure_storage
flutter pub add --dev drift_dev build_runner
```

---

## 7. Protecting production from yourself

With no local database this is your only line of defence. Build it on day one.

1. **`.env` files are never committed.** `.gitignore` them before the first commit. Commit `.env.example` with placeholder values only.
2. **Production credentials never land on your development machine.** They live in Railway's secret manager. If you must debug production, pull a snapshot into the dev project rather than connecting to prod.
3. **Guard on boot.** In `main.ts`, refuse to start if the environment looks wrong:

```ts
if (env.NODE_ENV !== 'production' && env.DATABASE_URL.includes(PROD_PROJECT_REF)) {
  throw new Error('Refusing to start: dev build pointed at production database');
}
```

4. **Never `synchronize: true`.** See §9.1 — this is the single most destructive default in TypeORM.

---

## 8. Defer Redis

You have no queue work until **task 1.2.6** (image resize on upload), roughly six weeks in. Skip Redis entirely until then — one less moving part while you get the schema and auth right.

When you do need it, **do not use a pay-per-command Redis** (Upstash's request-billed tier). BullMQ holds blocking reads open and polls constantly; per-command billing burns a free allowance in hours. Pick a memory-limited free tier instead — **Redis Cloud's free 30MB plan** — or a small Railway Redis add-on for a few dollars a month.

---

## 9. The eight decisions that prevent rework

This is the real answer to *"how do I start so I don't come back later and update everything."* None of these cost meaningful time on day one. All are expensive after 5,000 lines of code.

### 9.1 `synchronize: false`, always

```ts
// libs/common/src/database/data-source.ts
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  synchronize: false,          // ← NEVER true. Not even "just for now".
  migrationsRun: false,
  entities: [/* from libs/entities */],
  migrations: ['migrations/*.ts'],
};
```

TypeORM's `synchronize` silently drops columns to match entities. It will eventually delete a column with real data in it, and there is no undo. **Every schema change is a migration from the very first table.**

### 9.2 Audit columns on a base entity, from table one

```ts
export abstract class BaseEntity {
  @PrimaryColumn('uuid') id: string;                    // UUID v7
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamptz' }) deletedAt: Date | null;
  @Column({ type: 'uuid', nullable: true }) createdBy: string | null;
  @Column({ type: 'uuid', nullable: true }) updatedBy: string | null;
}
```

**`updatedAt` and `deletedAt` are what make offline delta sync possible.** Adding them to twenty populated tables later means twenty migrations plus a backfill with no real timestamps to backfill *from*. Every table extends this from the start. (Three documented exceptions in Doc 2 Part B.)

### 9.3 UUID v7, not auto-increment, not v4

Time-ordered, so they index well and sort chronologically for free. Sequential integers leak your record counts and collide when merging imported data.

### 9.4 `/api/v1` from the first endpoint

```ts
app.setGlobalPrefix('api/v1');
```

Adding a version prefix after mobile clients are in the wild means supporting both paths indefinitely.

### 9.5 Typed config object, never scattered `process.env`

One `environment.ts` that parses and validates every variable at boot, and fails loudly if one is missing. `process.env.FOO` sprinkled through 40 files is the thing you will most regret.

### 9.6 OpenAPI generation wired before the second endpoint

Set up `@nestjs/swagger` and both client generators while there is exactly one endpoint to verify against. Retrofitting generated clients over hand-written API services means rewriting every call site.

### 9.7 Feature-first folders

```
api/src/modules/parishes/{parishes.controller.ts, .service.ts, dto/, domain/}
```
Not `controllers/`, `services/`, `models/`. Reorganising a layer-first tree at 30 modules is a week of merge conflicts.

### 9.8 Soft delete + `status` enum, never hard delete

Contributors will propose changes to records; admins will reverse decisions. `status` (`draft`/`published`/`archived`) plus `deletedAt` gives you that. Hard deletes lose data you will later need for the audit trail.

---

## 10. First week — prove the loop

Do not build features yet. Prove the pipeline end to end with one table.

| Day | Goal |
|---|---|
| 1 | All accounts created, `flutter doctor` clean, both repos scaffolded and pushed |
| 2 | Base entity + typed config + datasource. `diocese` entity. First migration runs against `catholic-dev`. Verify the table in Supabase Studio. |
| 3 | `GET /api/v1/dioceses` returns real rows. Swagger UI renders. Generate the Angular client from the spec. |
| 4 | Back office lists dioceses using the **generated** client. Admin login with argon2 + JWT. |
| 5 | Flutter app calls the same endpoint via its generated client and writes results into Drift. Kill the network — data still renders from SQLite. |

**When day 5 works, you have proven every risky part of the architecture**: hosted Postgres, migrations, generated contracts, both clients, and offline persistence. Everything after that is repeating a known-good pattern.

Resist building the calendar or the parish map before this loop closes. A broken sync engine discovered in month 4 is the one thing that could genuinely cost you the project.

---

## 11. What you add later — and why it is not rework

| Added at | What | Why it isn't rework |
|---|---|---|
| Task 1.2.6 | Redis + BullMQ | New module, no schema change |
| First deploy | `Dockerfile` for API + worker | ~15 lines; Railway needs it to build. Deployment concern, not local dev. |
| First deploy | `catholic-prod` Supabase project | Same migrations, different URL |
| Task 1.7.5 | Apple Developer account | Signing config only |
| Phase 2 | AdMob, Vision moderation | New integrations |
| Any time | Local Postgres, if you want offline dev | Same version, same migrations, one env var |

**Nothing in this list requires revisiting a decision from §9.** That is the test of whether you started correctly.

---

## 12. If you actually meant "no Docker, but still local"

If the intent was to install Postgres natively rather than avoid local infrastructure altogether:

```bash
brew install postgresql@16 postgis redis
brew services start postgresql@16
brew services start redis
createdb catholic_dev
psql catholic_dev -c "create extension postgis;"
```

Everything in §9 applies unchanged — those decisions are independent of where the database runs. You get offline development and ~1ms queries, at the cost of Homebrew Postgres upgrades occasionally breaking on macOS updates. Also perfectly valid; pick based on how much you value working without a connection.
