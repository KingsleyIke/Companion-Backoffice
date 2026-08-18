# Catholic Companion — Platform

> Rename this file to `CLAUDE.md` at the root of `catholic-platform`.

NestJS API + BullMQ worker + Angular back office for a Nigerian Catholic parish directory and liturgical companion. Mobile app lives in the separate `catholic-mobile` repo.

---

## Stack — locked. Do not substitute.

| Layer | Choice |
|---|---|
| Database | PostgreSQL 16 + PostGIS (hosted Supabase, **no Docker**) |
| ORM | TypeORM |
| API | NestJS 10, Node 20, TypeScript strict |
| Queue | BullMQ + Redis *(not needed until task 1.2.6)* |
| Back office | Angular 18 + Angular Material |
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
| `design/back-office/` | Building a back-office screen — read the relevant image |

Work is identified by task ID (`1.2.4`, `1.3.15`). If a prompt names one, read that task in Doc 2 Part A first.

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
- **Christmas has four distinct Mass sets; the Easter Vigil has nine.** That is why `reading_set` exists. One-set-per-date is wrong.
- **The liturgical year begins at Advent, not 1 January.**
- **Publish gate:** only `verification_status = 'verified'` readings are exposed by `/readings` or `/sync`. Enforce in the query layer. A `super_admin` may override, but `override_reason` is mandatory and the action writes to `audit_log`.
- **Reflection and personal devotion are original content** and pass through the same verification gate as scripture.
- **Mass propers (entrance antiphon, collect, prayer after communion) are Missal texts** — a different copyright holder from the Lectionary.

---

## Never do these

- **Never scrape** USCCB, Universalis, or any competitor app for readings. Prohibited by their terms and a takedown risk.
- **Never port the Figma React code.** The back office is Angular. That code is a design reference for tokens and layout only.
- **Never use the design mockups as test fixtures or seed data.** Their liturgical content is placeholder and factually wrong (see Doc 4 §4).
- **Never run a destructive migration unattended** against the dev database — there is no local copy to fall back on.
- **Never commit `.env`.** Only `.env.example` with placeholders.
- **Never log PII.** Nigeria's NDPR applies.
- **Never expose `parish_contact` rows with `is_public = false`** through a public endpoint.
- **Never run migrations through Supabase's transaction pooler** (port 6543). Use the direct/session connection on 5432 — see Doc 3 §5.2.

---

## Commands

```bash
pnpm install

npx nx serve api                    # API on :3000, Swagger at /api/docs
npx nx serve back-office            # Angular on :4200
npx nx serve worker                 # BullMQ processors

pnpm migration:generate -- <Name>   # after entity changes
pnpm migration:run
pnpm migration:revert

npx nx test api
npx nx e2e api
pnpm generate:client                # OpenAPI → Angular client
```

---

## Definition of done

- [ ] Tests written and passing
- [ ] API change reflected in OpenAPI; client regenerated
- [ ] Schema change shipped as a reversible migration
- [ ] Error and empty states handled
- [ ] No new lint warnings; strict mode clean
- [ ] `docs/` updated if behaviour changed

---

## When unsure

Ask rather than guess — specifically on:

- Anything liturgical you would have to infer
- Whether a table needs to sync
- Adding a dependency
- A schema change that touches `reading`, `liturgical_day` or `submission`

State the ambiguity and what you'd assume. Do not invent a liturgical rule.
