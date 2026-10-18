# Document 7 — Environments, Branches & Databases

**Version:** 1.0 · October 2026

> Supersedes the "no Docker" decision in Doc 3 for **local development only**. Staging and production stay on hosted Supabase exactly as Doc 3 describes.

---

## 1. One branch, one database

| Branch | Database | Who runs migrations | `NODE_ENV` |
|---|---|---|---|
| `TSK-*` feature branches | Local Docker Postgres 17 + PostGIS | You, `pnpm migration:run` | `development` |
| `snapshot-dev` | Local Docker (integration of finished tasks) | You | `development` |
| `snapshot` | Supabase **test** project | CI on push (`migrate.yml`, environment `staging`) | `staging` |
| `main` | Supabase **production** project | CI on push, **after manual approval** (environment `production`) | `production` |

Work flows `TSK-*` → `snapshot-dev` → `snapshot` → `main`, each step a pull request. Every pull request also runs every migration up, down and up again against a throwaway PostGIS container in CI, so a migration that only works one way never reaches Supabase, then runs the database constraint specs (`pnpm test:db`) against the migrated schema. CI also regenerates the OpenAPI spec and Angular client (`pnpm generate:client`) and fails if `libs/contracts` differs from what is committed.

The same migrations run in all three places. Nothing is applied by hand in a dashboard.

---

## 2. Local database

Requires Docker Desktop running.

```bash
cp .env.example .env     # already points at the local database
pnpm db:up               # builds the image on first run, waits until healthy
pnpm migration:run
npx nx serve api         # http://localhost:3000/api/v1
pnpm admin:create-super-admin   # once: an admin to sign in with (scan the TOTP QR)
npx nx serve back-office # http://localhost:4200, proxies /api to :3000
```

The back office proxies `/api` to the API so the refresh cookie stays same-origin. It keeps the access token in memory only, and a page reload restores the session from that cookie. In staging and production the back office and the API must therefore share a site (Doc 1 §7).

| Script | Does |
|---|---|
| `pnpm db:up` / `pnpm db:down` | Start / stop. Data survives a stop. |
| `pnpm db:reset` | **Deletes all local data**, recreates the database and runs migrations |
| `pnpm migration:verify` | Runs all migrations, reverts them all, runs them again |

The image is built from `postgres:17` with PostGIS added (`docker/postgres/Dockerfile`), because the official `postgis/postgis` image is amd64-only and slow on Apple Silicon. It matches the Postgres major version of new Supabase projects. If your Supabase projects report a different major version (`select version();`), change the base image to match.

### Connecting DBeaver or pgAdmin 4

Use these in either tool (pgAdmin: *Register → Server*; DBeaver: *New connection → PostgreSQL*):

| Field | Value |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Maintenance database | `companion_dev` |
| Username / Password | `companion` / `companion` |
| SSL mode | `disable` |

Tables appear under *companion_dev → Schemas → public → Tables*. TypeORM's own bookkeeping table is `migrations`.

If port 5432 is taken by another Postgres on your machine, set `LOCAL_DB_PORT=5433` in your shell before `pnpm db:up` and use that port in `.env` and your client.

These credentials are local-only: the port is bound to `127.0.0.1` and the values never appear in staging or production configuration.

---

## 3. Supabase projects

Create two projects, same region (Doc 3 §3):

| Project | Branch | GitHub environment |
|---|---|---|
| `catholic-test` | `snapshot` | `staging` |
| `catholic-prod` | `main` | `production` |

Extensions (`postgis`, `pg_trgm`) are created by a migration — no dashboard step is needed.

### GitHub configuration

Repository → Settings → Environments:

1. **`staging`** — secrets `DATABASE_URL` (transaction pooler, port **6543**) and `MIGRATION_DATABASE_URL` (direct or session connection, port **5432**), from `catholic-test`.
2. **`production`** — the same two secrets from `catholic-prod`. Under *Deployment protection rules*, add yourself as a **required reviewer**. Create this environment **before** the first push to `main`; otherwise GitHub creates it unprotected.

Repository → Settings → Variables → Actions: **`PRODUCTION_DATABASE_REF`** = the `catholic-prod` project ref. Every non-production build — including the staging migration job — refuses to start if a database URL contains it.

Until the secrets exist, `migrate.yml` logs a notice and skips. Pushes to `snapshot` and `main` stay green.

---

## 4. Running locally against Supabase

Occasionally you will want to reproduce a staging problem. Put the `catholic-test` URLs in `.env` (pooler for `DATABASE_URL`, port 5432 for `MIGRATION_DATABASE_URL`, `DATABASE_SSL=true`) and set `PRODUCTION_DATABASE_REF`. Switch back afterwards.

**Never put production credentials in `.env`.** Production is only ever migrated by CI after approval. To debug production data, restore a snapshot into the test project.

---

## 5. Rules

- **Never edit a migration once it has run on `snapshot`.** Write a new one.
- **Review destructive migrations before merging to `snapshot`.** From there CI applies them unattended.
- A migration that cannot be reverted fails CI. Fix the `down`, not the check.
- Local data is disposable. Anything worth keeping belongs in a seed script, not your Docker volume.

---

## 6. Health, logs and error tracking

| Route | Answers | Use it for |
|---|---|---|
| `GET /api/v1/health/live` | 200 while the process runs; never touches the database | Restarting a hung process |
| `GET /api/v1/health/ready` | 200 when the database answers `SELECT 1` within 2 s, otherwise 503 | **Railway's deploy health check**, so a release that cannot reach its database never takes traffic |

Both are public and left out of the OpenAPI spec.

**Logs.** One JSON line per request in staging and production (readable colour locally): request id, method, path, status and duration. Never the query string, body, headers, client address or user agent — no personal data reaches the logs (NDPR). Every response carries an `X-Request-Id` header with the same id, so a user's error report can be matched to its log line. `LOG_LEVEL` sets the minimum level (default `log`).

**Errors.** Every error response has one shape — `{ statusCode, error, message, details, requestId }`, documented as `ErrorResponseDto`. An unexpected error (anything that is not an `HttpException`) is answered with a bare `500 Internal server error`; its stack goes only to the log and Sentry.

**Sentry** (free tier, errors only — no performance tracing):

1. Create a Sentry organisation and one project, platform **Node.js** (the API). One project serves every environment; Sentry separates them by the `environment` tag (`staging`, `production`).
2. Copy the project's DSN: *Project Settings → Client Keys (DSN)*. It looks like `https://<public-key>@o<org>.ingest.sentry.io/<project>`. The DSN only allows sending events, but keep it in the host's secrets rather than in git.
3. In the hosting platform, set `SENTRY_DSN` for staging and production, and optionally `SENTRY_RELEASE` to the deployed commit (on Railway, `${{RAILWAY_GIT_COMMIT_SHA}}`).
4. Leave `SENTRY_DSN` unset locally and in CI, so nothing is reported from them.

Only unexpected (5xx) errors are reported. Before anything leaves the server, Sentry's data collection is switched off for user details, cookies, headers, request bodies and query strings, and the event is scrubbed again — the refresh cookie, passwords and emails are never sent.
