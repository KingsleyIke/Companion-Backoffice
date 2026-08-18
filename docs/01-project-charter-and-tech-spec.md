# Document 1 — Project Charter & Technical Specification

**Project:** Nigerian Catholic Church Directory & Liturgical Companion
**Document owner:** Kings (kokoye@seamfix.com)
**Version:** 1.0 · August 2026
**Audience:** Incoming developers, technical leads, contractors

> Read this document first. It tells you *what* we are building and *what to build it with*.
> Document 2 tells you *how the work is broken down* and *what the data looks like*.

---

## 1. Project overview

### 1.1 What this is

A mobile application (Android + iOS) serving Nigerian Catholics two things:

1. **A liturgical companion** — the daily Mass readings, the liturgical calendar, feast days, saints, and prayers, all working fully offline.
2. **A national parish directory** — every Catholic parish and outstation in Nigeria, searchable, mapped, with Mass times and directions.

Supported by a **web back office** where administrators upload liturgical content, manage parish records, and moderate user-submitted contributions.

### 1.2 The problem

There is no single, reliable, current directory of Catholic parishes in Nigeria. Finding Mass times in an unfamiliar city means phoning around. Daily readings are scattered across websites that require a data connection — often unavailable inside a church building.

### 1.3 What success looks like

| Horizon | Measure |
|---|---|
| Launch | **One diocese fully verified and published**, 12 months of readings verified, live on both stores |
| Launch + 6 months | 10+ dioceses published, seeding order driven by user interest data |
| Year 1 | 20,000+ downloads, DAU/MAU above 25% |
| Year 2 | Contributions sustaining data freshness without central data entry |
| Ongoing | Self-funding through donations, sponsorship and ads |

### 1.4 Users

| Type | Auth | Can do |
|---|---|---|
| **Visitor** | None | Everything read-only: readings, calendar, prayers, parish directory, maps, notifications |
| **Registered user** | Email / Google / Apple | Follow parishes, sync preferences, apply to contribute |
| **Contributor** | Approved by admin | Propose parish additions and edits, upload gallery images, post announcements |
| **Content editor** | Back office | Upload readings, prayers, feasts |
| **Diocese admin** | Back office | Everything above, scoped to one diocese; approve submissions in their diocese |
| **Super admin** | Back office | Full access, create admins, manage roles |

> **Design rule:** the app must be fully useful with **no account at all**. Authentication is only required to contribute. Do not gate readings or the directory behind a login.

### 1.5 Explicitly out of scope (v1–v2)

Livestreaming Mass · in-app donations to individual parishes · chat or social features · confession booking · multi-country support. The schema should not actively prevent these, but no effort goes toward them.

---

## 2. Architecture

### 2.1 Shape

```
┌──────────────────┐     ┌──────────────────┐
│  Flutter mobile  │     │ Angular back     │
│  (iOS + Android) │     │ office (web)     │
│                  │     │                  │
│  Drift / SQLite  │     │                  │
│  local-first     │     │                  │
└────────┬─────────┘     └────────┬─────────┘
         │  generated OpenAPI clients │
         └──────────────┬─────────────┘
                        ▼
              ┌───────────────────┐
              │   NestJS API      │
              │   (Node, TS)      │
              └─────────┬─────────┘
                        │
     ┌──────────┬───────┼────────┬────────────┐
     ▼          ▼       ▼        ▼            ▼
┌─────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────────┐
│Postgres │ │Redis │ │  R2  │ │ FCM  │ │  Firebase  │
│+PostGIS │ │BullMQ│ │images│ │ push │ │Remote Config│
│(Supabase)│ │      │ │audio │ │      │ │  flags     │
└─────────┘ └──────┘ └──────┘ └──────┘ └────────────┘
```

No Docker. All infrastructure is hosted from the first commit — see Document 3.

### 2.2 Core principles

1. **Offline-first on mobile.** SQLite is the source of truth for the UI. The network only ever syncs it. No screen may show a spinner waiting on the network for readings, prayers or calendar data.
2. **Contributions are proposed changes, never direct writes.** A submission stores a payload and a diff; approval applies it. This gives audit trail, rollback and contributor scoring for free.
3. **The API contract is generated, not written.** NestJS decorators produce an OpenAPI spec; both clients are generated from it. A breaking change becomes a compile error, not a production bug.
4. **Storage is provider-agnostic.** All object storage goes through the S3 API, so the provider is an environment variable.
5. **Everything user-visible is remotely configurable.** Ad slots, feature flags, kill switches and donation bank details live in Firebase Remote Config so they change without an app release.
6. **New capability is data, not schema.** Modules, notification types and devotions are rows in registries — `app_module`, `notification_topic`, `content_collection`. Adding the Rosary, Stations of the Cross or a 3pm Divine Mercy reminder must never require a migration or a release. See Document 2, Part B0.

---

## 3. Technology stack

### 3.1 Summary

| Layer | Technology | Why |
|---|---|---|
| Database | **PostgreSQL 16 + PostGIS 3.4** | Native geospatial indexing for "nearest parish"; relational integrity for the moderation workflow |
| ORM | **TypeORM** | Mature migrations, raw-SQL escape hatch for PostGIS queries |
| Backend | **NestJS 10 (Node 20, TypeScript)** | Modular structure that survives a broad codebase; DI model mirrors Angular |
| Queue | **BullMQ + Redis 7** | Notification fan-out, image processing, scheduled jobs |
| Back office | **Angular 18 + Angular Material** | Shares NestJS's architectural model — one mental model across both |
| Mobile | **Flutter 3.x (Dart)** | Best-in-class offline story via Drift; consistent rendering; single codebase |
| Local DB | **Drift (SQLite)** | Type-safe, reactive queries, ships a pre-built seed database |
| Object storage | **Cloudflare R2** | Zero egress cost — decisive for an image- *and audio*-heavy app |
| Push | **Firebase Cloud Messaging** | Free at any volume, both platforms |
| Maps | **MapLibre GL + Protomaps** | No API keys, no per-tile billing |
| Calendar source | **Annual Ordo import** (no library) | The approved Nigerian Ordo is the authority; a General-Roman-Calendar library would be overridden constantly |
| Readings source | **Lectionary vols 1–3, manually entered / bulk uploaded** | No computation, no third-party API, no scraping |

### 3.2 Per-process tooling

This is the table to consult when you pick up a task and need to know what to reach for.

| # | Process | Server side | Client side |
|---|---|---|---|
| 1 | **Nearest-parish search** | PostGIS `ST_DWithin` + KNN `<->` operator, GIST index, TypeORM raw query | `geolocator` for device position |
| 2 | **Map display** | Serve `nigeria.pmtiles` from R2 | `maplibre_gl` (Flutter) / `maplibre-gl-js` (Angular) |
| 3 | **Directions** | None | `url_launcher` → Google/Apple Maps deep link |
| 4 | **Offline storage** | — | `drift` + `sqlite3_flutter_libs`; pre-built `.db` bundled as an asset |
| 5 | **Delta sync** | Custom `/sync` endpoints, `updated_at` + soft deletes | `dio` + background isolate |
| 6 | **Image upload** | Presigned PUT via `@aws-sdk/client-s3`; `sharp` resize in a BullMQ worker | `image_picker`, `dio` direct-to-R2 upload |
| 7 | **Push notifications** | `firebase-admin`, batched ≤500 tokens, BullMQ retry | `firebase_messaging`, `flutter_local_notifications` |
| 8 | **Scheduled reminders** | BullMQ delayed + repeatable jobs; nightly planner computes tomorrow's sends | Local timezone stored per device |
| 9 | **Liturgical calendar** | Annual Ordo spreadsheet import (`exceljs`); persisted, never computed | Read from local SQLite |
| 9b | **Readings ingestion** | `exceljs` (xlsx), `csv-parse`, `mammoth` (docx) → normalised intermediate → dry-run → commit with reversible batch | — |
| 10 | **Authentication** | `@nestjs/passport` + `passport-jwt`, `argon2` hashing, refresh rotation | `google_sign_in`, `sign_in_with_apple`, `flutter_secure_storage` |
| 11 | **Authorization** | Custom `RolesGuard` + diocese-scope guard | Route guards (Angular) |
| 12 | **Admin data grids** | Paginated, filterable endpoints | Angular Material Table, or PrimeNG for heavier grids |
| 13 | **API client generation** | `@nestjs/swagger` emits OpenAPI 3 | `ng-openapi-gen` (Angular), `openapi-generator` dart-dio (Flutter) |
| 14 | **Rich text (readings)** | Sanitised HTML stored in Postgres (`sanitize-html`) | `flutter_widget_from_html_core` |
| 15 | **Text search** | Postgres full-text `tsvector` + GIN index. **No Elasticsearch.** | SQLite FTS5 for offline search |
| 16 | **Image moderation** | Google Cloud Vision SafeSearch or AWS Rekognition before human queue | — |
| 17 | **Validation** | `class-validator` + `class-transformer` on DTOs | Angular reactive forms; Dart model validation |
| 18 | **Donations** | None — bank account details served from Remote Config | Static "Support Us" screen; copy-to-clipboard. Paystack deferred to Phase 5 |
| 18b | **Audio playback** *(Phase 3)* | Audio in R2, byte-range requests | `just_audio` + `audio_service` for background/lock-screen; chaptered seek via `content_item.audio_start_ms` |
| 19 | **Ads** | — | `google_mobile_ads`, gated by Remote Config |
| 20 | **Feature flags** | — | `firebase_remote_config` |
| 21 | **Analytics & crash** | — | `firebase_analytics`, `firebase_crashlytics` |
| 22 | **Testing** | `jest` + `supertest`, Testcontainers for Postgres | `flutter_test`, `integration_test`; `jest` for Angular |
| 23 | **CI/CD** | GitHub Actions → Railway/Fly.io buildpack | GitHub Actions + `fastlane` / Gradle Play Publisher → **Play internal track on every merge** |
| 24 | **Local dev** | Hosted Supabase dev project — no containers | Android emulator, iOS simulator |

### 3.3 Rejected alternatives

Recorded so nobody relitigates them.

| Rejected | Instead of | Reason |
|---|---|---|
| Firebase / Firestore as primary DB | Postgres + PostGIS | Geo queries need geohash workarounds; moderation joins are painful; read-based pricing |
| Firebase Storage | Cloudflare R2 | Egress billing scales with success; ~$120/mo at 1TB vs $0 |
| Google Maps SDK | MapLibre + Protomaps | Per-load billing and API key management for zero benefit |
| React / Next.js back office | Angular | Angular mirrors NestJS's DI and module model — one mental model for a small team |
| Ionic for mobile | Flutter | Webview rendering degrades on the long, content-heavy scrolling that *is* this app |
| Elasticsearch | Postgres FTS | Enormous operational overhead for a dataset of thousands of rows |
| romcal (or any calendar library) | Annual Ordo import | Computes the *General* Roman Calendar, which Nigeria's particular calendar overrides. Generate-then-correct permanently risks the app disagreeing with the printed Ordo. |
| Scraping USCCB / Universalis / competitor apps | Licensed Lectionary text, entered | Prohibited by their terms, breaks without warning, and redistributing licensed scripture is a takedown risk |
| Computing readings from citations + a Bible text table | Storing Lectionary text directly | Its only benefit was cheap translation-swapping. The Lectionary *is* the authority — you will never swap. |

---

## 4. Repository structure

Two repositories.

### 4.1 `catholic-platform` (NX monorepo)

```
catholic-platform/
├── apps/
│   ├── api/                    # NestJS REST API
│   │   └── src/modules/        # auth, parishes, readings, calendar,
│   │                           # submissions, notifications, media, admin
│   ├── worker/                 # BullMQ processors (push, images, sync planner)
│   └── back-office/            # Angular admin SPA
├── libs/
│   ├── entities/               # TypeORM entities — single source of schema truth
│   ├── dto/                    # Shared DTOs with class-validator decorators
│   ├── contracts/              # Generated OpenAPI types
│   └── common/                 # Guards, interceptors, filters, utils
├── migrations/
├── .env.example                # placeholders only — real values never committed
├── templates/                  # Ordo + readings XLSX upload templates
└── seed/                       # OSM parish import, content fixtures, OCR utility
```

### 4.2 `catholic-mobile` (Flutter)

```
catholic-mobile/
├── lib/
│   ├── core/                   # DI, routing, theme, config
│   ├── data/
│   │   ├── local/              # Drift database, DAOs, migrations
│   │   ├── remote/             # Generated API client
│   │   └── sync/               # Delta sync engine
│   ├── features/               # readings, calendar, parishes, prayers,
│   │                           # notifications, contribute, settings
│   └── shared/                 # Widgets, formatters, extensions
├── assets/
│   ├── seed.db                 # Pre-built SQLite — readings, prayers, parishes
│   └── nigeria.pmtiles         # Optional bundled basemap
└── test/ · integration_test/
```

**Feature-first, not layer-first.** Everything for "readings" lives under `features/readings`.

---

## 5. Environments

| Env | Database | Storage | Hosting | Purpose |
|---|---|---|---|---|
| **local** | Supabase `catholic-dev` (hosted) | R2 dev bucket | App runs natively on your Mac | Development. Zero cost, no containers. |
| **staging** | Supabase free project | R2 (staging bucket) | Railway | Internal QA, TestFlight builds |
| **production** | Supabase Pro | R2 | Railway/Fly.io | Live |

Mobile flavours: `dev`, `staging`, `prod` — separate bundle IDs so all three can coexist on one device.

**No shared environment file.** `.env.example` is committed; real secrets live in the host's secret manager.

---

## 6. Conventions

### 6.1 Code

- **TypeScript strict mode on.** No `any` without a comment justifying it.
- **Dart:** `flutter_lints` plus `prefer_const`, `avoid_dynamic_calls`.
- **Formatting:** Prettier + ESLint (TS), `dart format` (Dart). Enforced in CI, not in review.
- **Naming:** `snake_case` database, `camelCase` TypeScript/Dart, `kebab-case` files and URLs.

### 6.2 Git

- Branches: `main` (production) ← `develop` ← `feature/*`, `fix/*`
- Conventional Commits (`feat:`, `fix:`, `chore:`) — drives changelog generation
- PRs require: passing CI, one approval, no direct pushes to `main`

### 6.3 API

- Versioned: `/api/v1/...`
- Plural resource nouns: `/parishes`, `/readings`
- Cursor pagination on every list endpoint (offset pagination breaks on live-updating data)
- Errors use RFC 7807 Problem Details
- Every endpoint documented with `@ApiOperation` — the spec is the contract

### 6.4 Database

- **Every table** carries `id` (UUID v7), `created_at`, `updated_at`, `deleted_at` (soft delete), `created_by`, `updated_by`.
- `updated_at` and `deleted_at` are **mandatory** — the mobile delta sync depends on them. A table without them cannot sync. Three infrastructure tables are documented exceptions (`audit_log`, `content_version`, `parish_follow`) — see Document 2, Part B. Any *new* exception needs a written justification in the PR.
- Migrations are always reversible. Never edit a migration that has run in staging.
- Schema changes follow expand → migrate → contract for zero downtime.

### 6.5 Testing

| Layer | Minimum |
|---|---|
| API | Unit tests on services; integration tests on every endpoint with Testcontainers |
| Worker | Unit tests on every processor, including retry paths |
| Back office | Component tests on forms and approval flows |
| Mobile | Widget tests on core screens; integration test covering the full offline path |

Non-negotiable: **an integration test that launches the app with the network disabled and asserts today's readings render.** That is the product's core promise.

---

## 7. Security baseline

- Argon2id password hashing. Never bcrypt, never MD5, never plaintext.
- JWT access tokens (15 min) + rotating refresh tokens (30 days), revocable server-side.
- Back office requires TOTP MFA for `super_admin`.
- Rate limiting on auth, submission and upload endpoints (`@nestjs/throttler`).
- All user-supplied HTML sanitised server-side on write, never trusted on read.
- Uploads: presigned URLs only, content-type allowlist, size cap, automated safety scan before human review.
- Diocese-scoped admins enforced in a guard **and** in the query layer — never in the UI alone.
- Full audit log on every approve/reject/delete.
- No PII in logs. Nigeria's NDPR applies.
- Secrets never committed. Rotate on any contractor offboarding.

---

## 8. Third-party accounts required

| Service | Cost | Needed by | Notes |
|---|---|---|---|
| **Google Play Console** | $25 once | **Phase 0, task 0.5 — first task in the project** | Internal testing starts in week one; closed-test's 14-day clock opens at milestone 1.5 |
| **Apple Developer Program** | $99/year | Phase 1, milestone 1.7 | Delay; the annual clock starts on payment |
| Firebase project | Free (Spark) | Phase 1 | FCM, Remote Config, Analytics, Crashlytics only |
| Cloudflare (R2 + Pages) | ~$1/mo | Phase 1 | Storage + back office hosting |
| Supabase | Free → $25/mo | Phase 1 | Managed Postgres + PostGIS |
| Railway or Fly.io | ~$5–20/mo | Phase 1 | API + worker containers |
| Paystack | % per transaction | **Phase 5 — deferred** | Not needed at launch; bank details shown instead |
| Sentry | Free tier | Phase 1 | Backend error tracking |
| AdMob | Revenue share | Phase 2 | **Block gambling, loans, dating, alcohol** |
| Google Cloud Vision | ~$1.50/1000 images | Phase 2 | Automated image moderation |

---

## 9. Domain glossary

**Read this if you are not Catholic.** Getting these wrong produces bugs that are invisible to you and glaring to every user.

| Term | Meaning |
|---|---|
| **Parish** | A local church community with a designated priest. The primary entity in the directory. |
| **Outstation** | A smaller worship centre attached to a parish, without its own resident priest. Common in rural Nigeria. Model as a parish with a `parent_parish_id`. |
| **Deanery** | A cluster of parishes within a diocese. |
| **Diocese** | A region under a bishop. An **archdiocese** is led by an archbishop. Nigeria has ~60. |
| **Ecclesiastical province** | A group of dioceses under a metropolitan archdiocese. |
| **Lectionary** | The official book of scripture readings assigned to each day. **Copyrighted.** |
| **Liturgical year** | Begins on the First Sunday of Advent, *not* 1 January. |
| **Sunday cycle (A/B/C)** | Sunday readings rotate on a three-year cycle. |
| **Weekday cycle (I/II)** | Weekday readings rotate on a two-year cycle. Year I is odd-numbered years. |
| **Season** | Advent, Christmas, Ordinary Time, Lent, Triduum, Easter. Determines liturgical colour. |
| **Solemnity / Feast / Memorial / Optional Memorial** | Ranks of celebration, in descending order of importance. Rank determines which observance wins when two fall on the same date — this is `precedence`, and it is genuinely intricate. **Never infer it. The Ordo has already resolved it for every date — transcribe, don't compute.** |
| **Ordo** | The annual book giving, for every date, the celebration, rank, colour, cycle and readings references for a particular country. **The single source of truth for this project's calendar.** |
| **Lectionary vols 1–3** | The books containing the actual reading texts. Vol 1 Sundays, Vol 2 weekdays, Vol 3 saints and ritual Masses (broadly — confirm against your editions). **The single source of truth for readings text.** |
| **Holy Day of Obligation** | A day Catholics are required to attend Mass. Varies by country — Nigeria's list differs from Rome's default. |
| **Proper** | Texts specific to a particular celebration, as opposed to the general ones. |
| **Sanctoral cycle** | The calendar of saints' days, fixed to dates. |
| **Temporal cycle** | Seasons and Sundays, most of which move with Easter. |
| **Vigil Mass** | Saturday evening Mass fulfilling the Sunday obligation. Needs its own reading set and its own schedule entry. |
| **Ordinary** | Parts of the Mass that do not change day to day. |

**Two traps for developers:**

1. **Christmas and Easter have multiple distinct Mass sets** on the same date (Vigil / Night / Dawn / Day), each with different readings. A one-reading-set-per-date model is wrong. This is why `reading_set` exists as a separate table.
2. **The liturgical date is not the calendar date.** Liturgical days begin at sunset on the preceding evening. A Saturday-evening Vigil Mass uses Sunday's readings.

---

## 10. Definition of done

A task is complete when:

- [ ] Code merged to `develop` via reviewed PR
- [ ] Tests written and passing in CI
- [ ] API changes reflected in OpenAPI; clients regenerated
- [ ] Database changes shipped as a reversible migration
- [ ] Offline behaviour verified with the network disabled (mobile)
- [ ] Error and empty states handled
- [ ] No new lint warnings
- [ ] Documentation updated if behaviour changed

---

## 11. Handover checklist

Before any developer is considered onboarded:

- [ ] Access to the Supabase `catholic-dev` project confirmed; PostGIS extension verified
- [ ] API runs on their machine against the hosted dev database
- [ ] They are on the Play internal-testing tester list and can install the current build
- [ ] Back office runs and logs in
- [ ] Flutter app builds and runs on an emulator
- [ ] They have read this document and Document 2 in full
- [ ] They understand the glossary in §9 — quiz them on Vigil Masses
- [ ] Access granted: repos, Firebase, Cloudflare, Supabase, staging
