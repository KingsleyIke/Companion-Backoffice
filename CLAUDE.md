# Catholic Companion — Platform

NestJS API + BullMQ worker + Angular back office for a Nigerian Catholic parish directory and liturgical companion. Mobile app lives in the separate `catholic-mobile` repo.

---

## Stack — locked. Do not substitute.

| Layer | Choice |
|---|---|
| Database | PostgreSQL 17 + PostGIS — local Docker for development, Supabase for staging and production (Doc 7) |
| Monorepo | Nx 23, pnpm |
| ORM | TypeORM 1.x |
| API | NestJS 11, Node 24 LTS, TypeScript 6 strict |
| Queue | BullMQ + Redis *(not needed until task 1.2.6)* |
| Back office | Angular 22 + Angular Material |
| Storage | Cloudflare R2 via the S3 API |
| Push | FCM via `firebase-admin` |
| Calendar | **Annual Ordo import. No calendar library.** |

If a task seems to need a different tool, say so and stop — don't introduce it.

---

## Read these before starting work

Located in `docs/`:

| Doc | Read it when |
|---|---|
| `01-project-charter-and-tech-spec.md` | Onboarding. Architecture, conventions, **§9 domain glossary** |
| `02-work-breakdown-and-data-model.md` | **Every task.** Task IDs, full schema, API surface, sync strategy |
| `03-day-one-setup-no-docker.md` | Environment problems, Supabase connection issues |
| `04-ui-review-and-reconciliation.md` | Anything UI-facing. Decisions taken, missing screens |
| `07-environments-and-databases.md` | Branch → database mapping, local Docker database, Supabase and CI setup |
| `design/back-office/` | Building a back-office screen — read the relevant image |

Work is identified by task ID (`1.2.4`, `1.3.15`). If a prompt names one, read that task in Doc 2 Part A first.

---

## Branches

Every branch is named `TSK-<task-number>-<task-to-be-done>`:

- `<task-number>` is the Doc 2 Part A task ID, dots kept: `1.2.9`. When a branch covers several tasks, use the first ID.
- `<task-to-be-done>` is a short kebab-case summary of the work.

Examples: `TSK-1.1.4-church-hierarchy-schema`, `TSK-1.4.3-delta-sync-engine`.

When asked to create a branch, build the name from the task ID and branch from `snapshot-dev` unless told otherwise. Work flows `TSK-*` → `snapshot-dev` → `snapshot` → `main`, each step a pull request. If no task ID applies, ask for one rather than inventing a number.

---

## Working agreement

These apply to every task, whether or not the prompt repeats them.

- **Never commit.** Leave every change uncommitted so it can be reviewed in the IDE, and finish with a suggested commit message (Conventional Commits). Push or open pull requests only when explicitly asked, and only what has already been committed.
- **No Claude attribution.** No `Co-Authored-By` trailer in commit messages, suggested or real, and no "Generated with Claude Code" line in pull request descriptions.
- **Never invent liturgical data.** Feast days, dates, ranks, colours and readings come only from the imported Ordo and Lectionary. If a task needs them, stop and ask.
- **Never seed, fixture or test from the design mockups.** Their liturgical content is placeholder and factually wrong (Doc 4 §4, Doc 6 §3).
- **Hold every code change to the thermo-nuclear quality bar before handing it over.** After implementing, review your own diff the way `/thermo-nuclear-code-quality-review` would, and fix what it finds rather than only reporting it:
  - Look for the restructuring that deletes complexity (fewer branches, helpers, modes or layers), not a tidier version of the same idea.
  - No file goes from 1000 lines or fewer to more than 1000. Decompose first.
  - No ad-hoc conditionals or special cases bolted onto unrelated flows. Give the logic its own abstraction.
  - No thin wrappers, pass-through helpers, unnecessary casts, `any`, `unknown` or optionality that hides the real contract.
  - Logic lives in the layer that owns the concept. Reuse existing helpers instead of writing near-duplicates.
  - No needlessly sequential orchestration and no updates that can leave state half-applied.

  End the hand-over with a short **Quality review** note: what was simplified, and any finding deliberately left, with the reason. For a formal review before a pull request, run `/thermo-nuclear-code-quality-review`.

---

## Hard rules

1. **`synchronize: false`. Always.** TypeORM's synchronize silently drops columns. Every schema change is a migration.
2. **Every table extends `BaseEntity`** — `id` (UUID v7), `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`. Three documented exceptions only (`audit_log`, `content_version`, `parish_follow`). A new exception needs written justification in the PR.
3. **`updated_at` and `deleted_at` are load-bearing.** Mobile delta sync depends on them. A table without them cannot sync.
4. **Migrations are reversible.** Never edit a migration that has run anywhere but your own machine.
5. **`/api/v1` prefix on every route.**
6. **The OpenAPI spec is the contract.** Decorate every endpoint with `@ApiOperation` and DTOs. **Never hand-write client code** — regenerate.
7. **Feature-first folders**: `src/modules/parishes/{parishes.controller.ts, .service.ts, dto/, domain/}`. Not `controllers/`, `services/`.
8. **Soft delete + `status` enum. Never hard delete** domain rows.
9. **Typed config only.** One `environment.ts` validated at boot. No inline `process.env`.
10. **Money as integer minor units (kobo).** Never floats.
11. **Cursor pagination** on list endpoints. Offset pagination breaks on live data.
12. **Argon2id** for passwords. Never bcrypt, never plaintext.
13. **Diocese scoping is enforced in the query layer**, not the UI. A Lagos admin must not be able to approve Enugu submissions even by crafting a request.

---

## Liturgical domain — errors here are visible to every user

Read Doc 1 §9 in full. The traps:

- **The Ordo is the sole calendar authority.** Never compute, infer, or derive a liturgical calendar. Every `liturgical_day` row traces to an imported Ordo page.
- **Never infer feast precedence.** The Ordo has already resolved it for every date. Transcribe, don't compute.
- **A Vigil Mass is Saturday evening but fulfils the Sunday obligation.** Store `day_of_week = 6`, `type = 'vigil'`; display under Sunday.
- **Christmas has four distinct Mass sets; Easter has a Vigil Mass and a Mass during the Day.** That is why `reading_set` exists. One-set-per-date is wrong. The Easter Vigil itself is one set with up to nine readings, ordered by `reading.sequence`.
- **The liturgical year begins at Advent, not 1 January.**
- **Publish gate:** only `verification_status = 'verified'` readings are exposed by `/readings` or `/sync`. Enforce in the query layer. A `super_admin` may override, but `override_reason` is mandatory and the action writes to `audit_log`.
- **Reflection and personal devotion are original content** and pass through the same verification gate as scripture.
- **Mass propers (entrance antiphon, collect, prayer after communion) are Missal texts** — a different copyright holder from the Lectionary.

---

## Never do these

- **Never scrape** USCCB, Universalis, or any competitor app for readings. Prohibited by their terms and a takedown risk.
- **Never port the Figma React code.** The back office is Angular. That code is a design reference for tokens and layout only.
- **Never use the design mockups as test fixtures or seed data.** Their liturgical content is placeholder and factually wrong (see Doc 4 §4).
- **Never merge a destructive migration to `snapshot` unreviewed** — CI applies it to Supabase unattended from there.
- **Never commit `.env`.** Only `.env.example` with placeholders.
- **Never log PII.** Nigeria's NDPR applies.
- **Never expose `parish_contact` rows with `is_public = false`** through a public endpoint.
- **Never run migrations through Supabase's transaction pooler** (port 6543). Use the direct/session connection on 5432 — see Doc 3 §5.2.

---

## Commands

```bash
pnpm install
cp .env.example .env                # points at the local Docker database
pnpm db:up                          # start local Postgres + PostGIS

npx nx serve api                    # API on :3000 under /api/v1
npx nx serve back-office            # Angular on :4200
npx nx serve worker                 # BullMQ processors (from task 1.2.6)

pnpm migration:generate -- <Name>   # after entity changes
pnpm migration:create -- <Name>     # empty migration, for SQL TypeORM can't diff
pnpm migration:run
pnpm migration:revert
pnpm migration:show
pnpm migration:verify               # up, down, up — what CI runs on every PR
pnpm test:db                        # database constraint specs, against a migrated database

pnpm lint && pnpm test && pnpm build   # what CI runs, after pnpm format:check
npx nx e2e api-e2e
pnpm generate:spec                  # NestJS decorators → libs/contracts/openapi.json (no database needed)
pnpm generate:client                # generate:spec, then the Angular client into libs/contracts; CI fails if stale
```

**Generated migrations can need hand edits** — review every generated file for them:

- A Postgres enum shared by several tables (`record_status`, `liturgical_color`, …) is emitted as one `CREATE TYPE` / `DROP TYPE` per table. Keep one `CREATE` before the first table that uses it and one `DROP` after the last table is dropped.
- A generated column writes a `typeorm_metadata` row with the local database name hardcoded. Use `current_database()` and `current_schema()` instead (see the `parish` and `content_collection` migrations).
- A rename is generated as a new table or column, orphaning the old one. Write it as `RENAME`, including constraint names (see `ReviewFixes`).

Entities live in `libs/entities` and must be added to its `ENTITIES` array. Migrations live in `migrations/`. Tables and columns are snake_case via `SnakeNamingStrategy`, so entity properties stay camelCase.

---

## Definition of done

- [ ] Tests written and passing
- [ ] API change reflected in OpenAPI; client regenerated
- [ ] Schema change shipped as a reversible migration
- [ ] Error and empty states handled
- [ ] No new lint warnings; strict mode clean
- [ ] `docs/` updated if behaviour changed
- [ ] Self-reviewed against the thermo-nuclear quality bar (Working agreement); findings fixed or explained

---

## When unsure

Ask rather than guess — specifically on:

- Anything liturgical you would have to infer
- Whether a table needs to sync
- Adding a dependency
- A schema change that touches `reading`, `liturgical_day` or `submission`

State the ambiguity and what you'd assume. Do not invent a liturgical rule.
