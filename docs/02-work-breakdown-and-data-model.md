# Document 2 — Work Breakdown & Data Model

**Project:** Nigerian Catholic Church Directory & Liturgical Companion
**Version:** 2.3 · August 2026
**Audience:** Developers implementing the work

> Read Document 1 for context and stack, Document 3 for environment setup, **Document 4 for the UI review that produced this revision**.
> This document tells you *what to build, in what order, and what data backs it*.

### Changes in v2.3 — retrofitted to the UI designs

Three decisions taken (Doc 4 §2):

| Decision | Effect |
|---|---|
| **Verification gate kept, with super-admin override** | Four states retained. Super admin may publish below `verified` with a **mandatory reason** written to `audit_log`. `auto_publish_readings` restricted to super admin. |
| **User tables stay split** | `admin_user` and `app_user` remain separate. The prototype's single "All Users" grid is replaced by three screens (task 1.2.13). |
| **Mass-set selector added** | Day-centric reading editor gains multi-set support, so Christmas and the Easter Vigil work. |

| New schema | Reason |
|---|---|
| `parish_contact` (with `contact_group`), `parish_activity`, `parish_gallery_album` | Parish form has clergy *and* pastoral team, an activities repeater, and explicit gallery albums |
| `mass_proper`, `psalm_stanza`, reflection + devotion + closing lines | "Before the Readings" / "After Communion" sections |
| `content_item_translation` | Benediction's English / Latin / Both toggle |
| `content_collection.diocese_id` | Stations exists in four versions, two diocese-specific |
| `notification_inbox_item` | In-app notification inbox — absent from v2.2 entirely |
| `app_setting` | Settings screen incl. maintenance mode |
| `liturgical_color` **+ `gold`** | Design offers it; the enum lacked it |
| **Bulk upload UI** (task 1.3.15) | Not designed at all; ~40% of milestone 1.3's value |

**Phase 1 → ~1,376h. Launch ~month 11.** Doc 4 §7 lists two clean 50h deferrals if the date matters more.

### Changes in v2.2 — diocese-by-diocese rollout

| Change | Impact |
|---|---|
| **Launch no longer waits for national seeding** | Phase 1 exit is **one complete, verified diocese** — not 3,000 parishes. Removes the largest schedule risk in the project. |
| **Diocese publication states** | `hidden` / `in_progress` / `published`. The directory only ever shows published dioceses, so thin coverage reads as *rollout in progress*, not *broken app*. |
| **Coverage UI + demand signalling** | Users see what's covered and can register interest in their own diocese — which tells you where to seed next. |
| **Anonymous "suggest my parish"** | A no-account submission path in Phase 1, so launch-day coverage gaps become a data pipeline instead of an uninstall. |
| Phase 1 → ~1,136h | +42h across 1.2 and 1.5 |

### Changes in v2.1

| Change | Impact |
|---|---|
| **romcal removed** | Replaced by an annual **Ordo import** (1.3.1). The approved Nigerian Ordo is the sole calendar authority. |
| **Readings are entered, never computed** | Day-by-day editor plus bulk upload in XLSX/CSV/JSON/DOCX, sourced from Lectionary vols 1–3 against the Ordo |
| **Import batches are reversible** | New `liturgical_year_import`, `reading_import_batch` — a bad 90-day upload rolls back in one action |
| **Verification workflow** | New states on `reading`; nothing below `verified` reaches production; two-person sign-off for Sundays and solemnities |
| **OCR ingestion utility** | Offline script, not a back-office feature. OCR accelerates transcription; humans remain the source of truth |
| `bible_verse` / `reading_citation` proposal **withdrawn** | Its value was cheap translation-swapping. The Lectionary is the authority — you will never swap. Text stored directly. |
| Phase 1 → ~1,094h | +52h in milestone 1.3 |

### Changes in v2.0

| Change | Impact |
|---|---|
| **No Docker** — hosted services from commit one | 1.1.2 replaced; local infra removed throughout |
| **Internal testing from week one** | New task 1.1.9; store setup moved from month 7 to week 1 |
| **No Paystack** — bank account details shared instead | 1.7.2 reduced; `donation` table deferred to Phase 5 |
| **Extensibility spine added** | New Part B0. Rosary, Stations, Divine Mercy, trivia, history and audio become *data*, not schema changes |
| **Audio as first-class** | New Phase 3; `media_asset` extended; chaptered playback supported |
| **Country-aware schema** | `country` table added; Nigeria-only product, multi-country-ready data |
| Phases resequenced | Now 0–5 |

---

## Effort summary

| Phase | Scope | Effort | Duration @ 30 hrs/week | Cumulative |
|---|---|---|---|---|
| 0 | Clear the blockers | ~70h | 3–4 weeks (parallel) | Month 1 |
| 1 | Readings, directory, back office | **~1,376h** | 10.5 months | **Month 11 — launch** |
| 2 | Contributions & moderation | ~632h | 5 months | Month 16 |
| 3 | Devotions & audio | ~320h | 2.5 months | Month 19 |
| 4 | Engagement & knowledge | ~460h | 3.5 months | Month 22 |
| 5 | Catechism & monetisation | ~320h | 2.5 months | Month 25 |
| **Total** | | **~3,178h** | **~25 months** | |

> **Launch scope is fixed; coverage is not.** Phase 1 ships the full parish directory *feature* with as little as one diocese populated. Admins then add dioceses continuously from the back office — that is normal operations, not a release. This decision does not move the launch date (engineering hours still bind it) but it removes the risk that **data** becomes the binding constraint, which is what would otherwise happen the moment engineering moves faster than expected.

Halve elapsed time with a second developer on the mobile track. See Document 4 on what AI assistance realistically compresses.

---

# PART A — WORK BREAKDOWN STRUCTURE

---

## Phase 0 — Clear the blockers · ~70h

| ID | Task | Effort | Owner | Blocks |
|---|---|---|---|---|
| 0.1 | Obtain written lectionary/Bible text permission | 20h | PM | **All content work** |
| 0.2 | **Obtain the approved Nigerian Ordo + Lectionary vols 1–3**; confirm obligation days | 8h | PM | 1.3.1 |
| 0.3 | Extract & clean OSM parish dataset for Nigeria | 16h | Dev | 1.2.4 |
| 0.4 | Compile diocese list (60+) from GCatholic / Catholic-Hierarchy | 8h | PM | 1.2.1 |
| 0.5 | Register Google Play account ($25) | 2h | PM | **1.1.9 — do first** |
| 0.6 | Draft privacy policy & terms | 8h | PM | 1.1.9 |
| 0.7 | Open diocesan / CBCN endorsement conversations | 8h | PM | — |

**Exit:** written content permission secured; 3,000+ raw parish records ready to clean; Play Console account live.

> **0.1 is a hard gate on content.** It does not block engineering — start 1.1 in parallel.
> **0.5 is now the first task in the project.** Internal testing depends on it.

---

## Phase 1 — Readings, directory & back office · ~1,376h

### 1.1 Foundations · 150h

| ID | Task | Effort |
|---|---|---|
| 1.1.1 | NX monorepo scaffold, lint, format, CI pipeline | 16h |
| 1.1.2 | **Provision hosted dev environment** — Supabase `catholic-dev` (PostGIS enabled), R2 dev bucket, Firebase project, typed env config | 8h |
| 1.1.3 | TypeORM datasource, migration tooling, `BaseEntity` with audit columns | 12h |
| 1.1.4 | Full schema v1 + initial migration (Part B) | 28h |
| 1.1.5 | Admin auth: login, refresh rotation, forgot password, argon2 | 20h |
| 1.1.6 | RBAC — `RolesGuard` + diocese-scope guard | 16h |
| 1.1.7 | Swagger/OpenAPI + client generation for both clients | 12h |
| 1.1.8 | Health checks, structured logging, Sentry, global error filter | 12h |
| 1.1.9 | **Internal testing pipeline** — signing keys, Play internal track, CI auto-upload (Gradle Play Publisher / fastlane), tester group | 14h |
| 1.1.10 | **Design tokens** — `tokens.scss` + `theme.dart` are **already written** (Doc 6). Remaining work: approve the DERIVED values, replace `#2196f3` with `$blue-700` in all text/links (it fails WCAG AA at 3.12:1), and remove every hardcoded colour from components | 12h |

**Exit:** an admin logs in over a documented, generated API against a migrated hosted database — **and a Flutter skeleton is installable from the Play internal track.**

> **1.1.9 ships a near-empty app to the internal track in week one.** This is deliberate. Store configuration, signing, and the upload pipeline are the things that reliably surprise people at the end of a project. Discover them now, when nothing depends on them, and every subsequent build reaches testers automatically.
>
> **Play track distinction:** *internal testing* allows up to 100 testers with no waiting period. *Closed testing* is where the 12-tester / 14-consecutive-day requirement applies to personal developer accounts. Start internal now; open the closed track around milestone 1.5 so its 14 days expire long before you want to launch.

### 1.2 Back office — parishes · 234h

| ID | Task | Effort |
|---|---|---|
| 1.2.1 | Hierarchy CRUD: country → province → diocese → deanery | 24h |
| 1.2.2 | Parish CRUD with map picker for coordinates | 32h |
| 1.2.3 | Outstation handling (`parent_parish_id`) | 12h |
| 1.2.4 | **CSV bulk import** with validation, dry-run and error report | 28h |
| 1.2.5 | Mass schedule editor (recurring + language + type) | 24h |
| 1.2.6 | Media upload — presigned URLs, resize worker, gallery management | 24h |
| 1.2.7 | Parish list: search, filters, pagination, publish/unpublish | 6h |
| 1.2.8 | **Diocese rollout console** — publication state, verified-parish counts, coverage notes, rollout priority ordered by user demand | 10h |
| 1.2.9 | **Parish contacts + pastoral team** — one repeater, two groups (`clergy` / `pastoral_team`), with per-contact `is_public` | 16h |
| 1.2.10 | **Church activities** — repeater with free-text schedule; mobile two-column display | 16h |
| 1.2.11 | **Gallery albums** — album CRUD, album-grouped upload, mobile album viewer | 20h |
| 1.2.12 | Social links repeater | 4h |
| 1.2.13 | **User screens (split model)** — Admins CRUD · App Users read-only + suspend/promote · Contributor Applications queue | 18h |

> **1.2.4 is the highest-leverage task in the project.** It unblocks parallel data seeding. Prioritise it.
>
> **1.2.8 is what makes launching on one diocese safe.** A diocese moves `hidden → in_progress → published`, and only `published` dioceses are ever visible to the app. Data entry for the next diocese happens in the open without leaking half-finished records to users, and the console shows the seeding team which diocese users are actually asking for next.

### 1.3 Back office — liturgical & devotional content · 292h

**No romcal. The approved Nigerian Ordo is the sole calendar authority; Lectionary vols 1–3 are the sole readings authority.**

| ID | Task | Effort |
|---|---|---|
| 1.3.1 | **Ordo import** — annual XLSX/CSV upload of the liturgical-year scaffold (date, season, week, cycle, colour, celebration, rank, obligation). Dry-run, per-row validation, commit, rollback | 24h |
| 1.3.2 | Calendar validation rules — cycle continuity, season boundaries, obligation-day sanity checks | 8h |
| 1.3.3 | **Day-by-day readings editor** — select a date, add reading sets (incl. multi-Mass days), enter each reading with citation, heading, psalm response, body | 36h |
| 1.3.4 | **Bulk readings upload** — XLSX/CSV/JSON/DOCX parsers → normalised intermediate; dry-run with per-row error report; preview diff; commit; **batch rollback** | 44h |
| 1.3.5 | Saints CRUD with biographies and images | 16h |
| 1.3.6 | **Generic content framework** — categories, collections, ordered items; admin editor with drag-reorder and nesting | 42h |
| 1.3.7 | Publish workflow + content versioning for sync | 6h |
| 1.3.8 | **Verification workflow** — state machine, proofread/verify actions, two-person sign-off for Sundays & solemnities, publish gate | 12h |
| 1.3.9 | **OCR ingestion utility** — offline script: scan → OCR → parse into the upload template. *Not* a back-office feature | 24h |
| 1.3.10 | **Mass propers** — entrance antiphon, collect, prayer after communion; form fields + renderer | 16h |
| 1.3.11 | **Psalm stanzas** — structured repeater; renderer inserts the response between stanzas | 10h |
| 1.3.12 | Reflection + personal devotion + closing/intro lines | 6h |
| 1.3.13 | **Mass-set selector** — multiple sets per date (Vigil / Night / Dawn / Day) in the day-centric editor | 16h |
| 1.3.14 | **Super-admin publish override** — mandatory reason, audit trail, restricted auto-publish | 8h |
| 1.3.15 | **Bulk upload UI** — *undesigned; design and build*: Ordo import, readings import (4 formats + template download), parish CSV, import history with rollback, verification queue | 24h |

#### Rules for this milestone

**1.3.1 — why an Ordo import instead of a calendar library.** romcal computes the General Roman Calendar, which Nigeria's particular calendar overrides. Rather than generate-then-correct — and permanently risk the app disagreeing with the printed Ordo — the Ordo *is* the input. One spreadsheet per liturgical year, ~365 rows, roughly 8 hours of annual data entry. The trade-off is that no liturgical data exists for a year not yet imported, which is correct: the Ordo for that year doesn't exist either.

**1.3.4 — steer data entry to spreadsheets.** All four formats are accepted, but publish an **XLSX template** and train people on it: one row per reading, columns `date`, `mass_type`, `cycle`, `reading_type`, `sequence`, `citation`, `heading`, `psalm_response`, `body`, `source_reference`. DOCX is parsed into the same normalised structure and never trusted for formatting — free-form Word documents are where structure goes to die, because every contributor invents their own conventions.

**Two non-negotiables on any bulk upload:** a dry-run producing a per-row error report before anything commits, and a persisted batch record so a bad file spanning 90 days rolls back in one action.

**1.3.8 — nothing below `verified` syncs to a device.** OCR lands at roughly 95–98% character accuracy, which across ~5,000 readings is thousands of errors. Treat OCR as a transcription accelerator and humans as the source of truth. Sundays and solemnities require two different people to sign off. A silently wrong Sunday Gospel is the worst defect this app can ship — it loses every parish at once.

**1.3.6 is the "provisions for later" task.** Built once, it carries short prayers now, and later the Rosary, Stations of the Cross, Divine Mercy, novenas, litanies and any devotion not yet thought of — as **seeded data plus a renderer**, with no schema change and no migration. Do not skip it to save six days. See Part B0.

> **Copyright reminder:** owning the Lectionary volumes does not grant the right to digitise and republish them. Scanning your own copy is still reproduction. Task 0.1 permission remains a hard gate on publishing any of this.

### 1.4 Mobile — readings & content core · 290h

| ID | Task | Effort |
|---|---|---|
| 1.4.1 | Flutter scaffold: DI, routing, theming, flavours | 24h |
| 1.4.2 | Drift schema mirroring server tables + migrations | 24h |
| 1.4.3 | **Delta sync engine** — manifest, per-resource pull, transactional apply | 40h |
| 1.4.4 | Pre-built `seed.db` generation in CI, bundled as an asset | 16h |
| 1.4.5 | **Server-driven home screen** from the module registry | 24h |
| 1.4.6 | Calendar — month/week views, feast per day, colour coding | 32h |
| 1.4.7 | Daily readings — HTML rendering, font sizing, day navigation | 28h |
| 1.4.8 | **Generic content renderer** — sequential and single-item collections, driven by `content_collection.type` | 28h |
| 1.4.9 | Short prayers seeded through the generic framework; FTS5 search | 12h |
| 1.4.10 | **Manual "Sync Readings Now" + sync status UI** — last-synced, what's cached, how far ahead | 12h |
| 1.4.11 | **In-app notification inbox** — All/Unread tabs, day grouping, read state, per-item delete, mark-all-read, backfill endpoint *(deferrable to Phase 2)* | 30h |
| 1.4.12 | **Language toggle renderer** — English / Latin / Both via `content_item_translation` *(deferrable to Phase 3)* | 20h |

> **1.4.3 is the hardest task in Phase 1.** Assign it to your strongest developer.
> **1.4.8 is what makes Phase 3 cheap.** One renderer that walks an ordered item tree handles the Rosary's decades, the 14 Stations, and the Divine Mercy chaplet. Get it right with prayers, and each later devotion is days rather than weeks.

### 1.5 Mobile — parish directory · 172h

| ID | Task | Effort |
|---|---|---|
| 1.5.1 | Parish list — search, filters (diocese/state/language), sort | 28h |
| 1.5.2 | Parish detail — info, Mass times, gallery, contact actions | 28h |
| 1.5.3 | Map view — MapLibre, Protomaps basemap, clustered markers | 32h |
| 1.5.4 | **Nearest-parish** — location permission, PostGIS query, distance | 24h |
| 1.5.5 | Directions deep-link to Google/Apple Maps | 8h |
| 1.5.6 | Offline parish cache + image caching strategy | 20h |
| 1.5.7 | **Coverage UI** — published-diocese filter, honest "we don't cover your area yet" empty states, coverage map, register-interest-in-my-diocese | 16h |
| 1.5.8 | **Anonymous "suggest my parish"** — no-account submission with optional contact details, feeding the same moderation queue | 16h |

> Open the Play **closed** testing track at the start of this milestone so the 14-day clock runs during development.

#### Why 1.5.7 and 1.5.8 exist

Launching on one diocese means most early users open the directory and find nothing near them. Handled badly, that is an uninstall and a one-star review. Handled well, it is your seeding roadmap.

**1.5.7** — never show an empty list. Show which dioceses are covered, say plainly that the rest are coming, and let the user tap to register interest in theirs. Those taps are a demand ranking that tells you which diocese to seed next — far better than guessing.

**1.5.8** — a user whose parish is missing can submit it there and then, with no account and no contributor approval. It writes to the existing `submission` table (`submitter_user_id` is nullable) and lands in the same admin queue. This turns your biggest launch weakness into an inbound data pipeline from day one, and it is the one piece of the contribution system genuinely worth pulling forward from Phase 2.

### 1.6 Notifications — topic-driven · 130h

| ID | Task | Effort |
|---|---|---|
| 1.6.1 | Device registration, FCM token lifecycle, invalid-token pruning | 20h |
| 1.6.2 | BullMQ fan-out — ≤500-token batches, retry, receipts | 28h |
| 1.6.3 | Nightly planner job — computes tomorrow's sends per timezone | 24h |
| 1.6.4 | **Topic registry + self-rendering settings screen** | 34h |
| 1.6.5 | Feast reminders with rank threshold and lead days | 12h |
| 1.6.6 | Holy-day-of-obligation reminders; scheduled devotion reminders | 12h |

> **1.6.4 is the second "provisions for later" task.** Notification types are **rows in `notification_topic`**, not columns and not code. The settings screen renders itself from whatever topics the server returns. Adding "Divine Mercy at 3pm" or "Rosary reminder" later is an INSERT plus a planner rule — **no app release**. A wide preference table with one boolean per feature cannot do this, which is exactly why v1.0's design was replaced.

### 1.7 Launch prep · 108h

| ID | Task | Effort |
|---|---|---|
| 1.7.1 | Side drawer — about, contact, share, powered by | 16h |
| 1.7.2 | **"Support Us" screen — bank account details from Remote Config** | 6h |
| 1.7.3 | Ad slot components, **disabled** via Remote Config | 20h |
| 1.7.4 | Analytics + Crashlytics instrumentation | 12h |
| 1.7.5 | Store assets, listings, screenshots, production submission | 18h |
| 1.7.6 | Offline QA pass, accessibility, low-end device testing | 24h |
| 1.7.7 | **`app_setting` + maintenance mode** — settings screen, plus the mobile blocking screen it implies | 12h |

> **1.7.2:** static bank details, rendered from Remote Config so account numbers can change without a release. No payment gateway, no PCI surface, no webhooks, no `donation` table. **Do not hardcode the account number in the app** — a compromised or outdated account number you cannot change remotely is a serious problem.
>
> Internal and closed testing already ran continuously from 1.1.9, so 1.7.5 is production submission only.

**Phase 1 exit:**

- **At least one diocese complete, verified and `published`** — every parish and outstation, coordinates confirmed, Mass times current. Quality over coverage: one trustworthy diocese beats twenty half-entered ones.
- A written **rollout order** for the remaining dioceses, seeded from user interest data
- One full liturgical year of Ordo imported; 12 months of readings at `verified`
- Both stores approved
- Readings render in airplane mode
- A real push delivered on a real feast day
- Uncovered areas show honest coverage messaging, never an empty list
- Module registry and notification topics both proven to add an item without an app release

> **What is explicitly *not* required to launch:** national parish coverage. Adding dioceses is continuous back-office work that runs for months after launch. Blocking release on it was the single largest schedule risk in v2.1.

---

## Phase 2 — Open contributions · ~632h

### 2.1 User accounts · 82h
Signup/login/forgot password (40h) · Google + Apple sign-in (20h) · profile & account deletion (10h) · **signup rework — drop required gender, add consent, add parish affiliation, add pending-approval state (12h)**

### 2.2 Contributor application · 50h
Application flow (16h) · admin review queue (20h) · status notifications (14h)

### 2.3 Submission engine · 130h
Submission entity + lifecycle (32h) · **diff generation & apply-on-approve** (40h) · attachments (20h) · rate limiting & spam prevention (20h) · withdrawal & resubmission (18h)

### 2.4 Contributor actions (mobile) · 120h
Suggest new parish/outstation (32h) · propose info update (28h) · gallery upload (28h) · post announcement (20h) · my-submissions status view (12h)

### 2.5 Approval back office · 130h
Queues per category (32h) · **side-by-side diff review UI** (40h) · approve/edit/reject with reason (24h) · bulk actions (16h) · moderation dashboard (18h)

### 2.6 Admin hierarchy · 60h
Sub-admin creation (16h) · granular permissions (20h) · diocese scoping enforcement (16h) · convert contributor → admin (8h)

### 2.7 Announcements & ads · 60h
Follow-a-parish (12h) · announcement push fan-out (20h) · announcement moderation (12h) · **enable AdMob with category blocking + Remote Config gating** (16h)

**Exit:** median approval under 48h · 100+ approved contributions · zero unmoderated content in production.

---

## Phase 3 — Devotions & audio · ~320h

Everything here is **content plus a renderer**. The schema does not change.

| ID | Task | Effort | Notes |
|---|---|---|---|
| 3.1 | **Audio infrastructure** — player service, background playback, lock-screen controls, chaptered seek, download manager, per-collection offline opt-in | 90h | Cross-cutting; build first |
| 3.2 | **Rosary** — nested renderer (mystery → decade → prayer), repeat counts, day-of-week mystery selection, audio | 60h | Data + renderer only |
| 3.3 | **Stations of the Cross** — 14 stations, image per station, reflections, chaptered audio | 50h | Data + renderer only |
| 3.4 | **Divine Mercy Chaplet** — ordered prayers with repeats, 3pm reminder topic, audio | 40h | Data + renderer only |
| 3.5 | Novenas & litanies | 30h | Data only |
| 3.6 | **Readings audio** — streaming with optional download, daily ingest workflow | 50h | See audio note below |

### Audio — read before starting 3.1

- **Two patterns, both supported.** One file per item, *or* one long file with per-item `audio_start_ms`/`audio_end_ms`. Prefer the second for Stations and the Rosary — a single 20-minute download that seeks by chapter beats 14 separate requests.
- **Downloads are always opt-in, per collection.** Never auto-download audio. Nigerian data is metered and users will uninstall over it.
- **Readings audio is a recurring content operation, not a build task.** 365 recordings a year at ~5MB each is ~1.8GB annually, plus someone recording daily. Stream by default, download on request. Do not bundle audio in `seed.db` — it would push the APK past Play's limits.
- **R2's zero egress is now doing serious work.** Audio streaming on a per-GB-egress provider would be the largest line item in the project.

---

## Phase 4 — Engagement & knowledge · ~460h

| ID | Task | Effort |
|---|---|---|
| 4.1 | **Trivia** — schema, question bank, gameplay, scoring, streaks, categories, difficulty | 90h |
| 4.2 | **Catholic history** — long-form articles, series, images, offline reading, bookmarks | 70h |
| 4.3 | Hymnal — offline, searchable by number/title/first line, optional audio | 140h |
| 4.4 | Points & recognition — ledger, leaderboard, contributor eligibility view | 90h |
| 4.5 | News feed — diocesan and national | 70h |

---

## Phase 5 — Catechism & monetisation · ~320h

| ID | Task | Effort |
|---|---|---|
| 5.1 | Catechism *(copyright Libreria Editrice Vaticana — permission required)* | 110h |
| 5.2 | Catholic doctrine reference | 50h |
| 5.3 | Enhanced parish listings (paid tier for parishes/dioceses) | 70h |
| 5.4 | Direct sponsorship slots | 30h |
| 5.5 | Supporter tier IAP — removes ads, unlocks extras | 40h |
| 5.6 | **Paystack donations** — deferred from Phase 1 | 20h |

---

# PART B — DATA MODEL

PostgreSQL 16 + PostGIS. UUID v7 primary keys.

**Every table** carries: `id`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`.
`updated_at` and `deleted_at` are **mandatory** — delta sync depends on them.

**Three documented exceptions**, infrastructure rather than domain data, never synced:

| Table | Exception | Why |
|---|---|---|
| `audit_log` | No `updated_at`, `deleted_at`, `updated_by` | Append-only by design |
| `content_version` | Natural PK (`resource`), no `id` or `deleted_at` | It *is* the sync manifest |
| `parish_follow` | Composite PK, no `deleted_at` | Join table; unfollow is a hard delete |

---

## B0. The extensibility spine ★ read this first

Three data-driven registries. Together they are the answer to *"make provisions to easily integrate all these later."*

**The rule: a new module, a new notification type, or a new devotion must be an INSERT — never a migration and never an app release.**

### `country`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `iso_code` | char(2) | `NG` — unique |
| `name` | varchar(80) | |
| `default_locale` | varchar(10) | `en-NG` |
| `default_timezone` | varchar(40) | `Africa/Lagos` |
| `currency_code` | char(3) | `NGN` |
| `is_active` | boolean | **Nigeria only at launch** |

> Product is Nigeria-only; the schema is not. `diocese`, `bible_translation`, `liturgical_day` and `content_collection` all carry `country_id`. Adding Ghana later is seeding rows, not migrating a live schema — and Bible translation licences are **territorial**, so this separation is a legal requirement as much as a technical one.

### `app_module` — server-driven navigation
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `key` | varchar(60) | `rosary`, `stations`, `trivia`, `history` — unique |
| `title`, `subtitle` | varchar | display text |
| `icon` | varchar(60) | icon identifier the client resolves |
| `route` | varchar(120) | client route or `content_collection` slug |
| `group` | enum | `home_primary` \| `home_secondary` \| `drawer` \| `bottom_nav` |
| `sort_order` | smallint | |
| `is_enabled` | boolean | |
| `badge_text` | varchar(20) | e.g. "New", "Coming soon" |
| `min_app_version` | varchar(20) | **hide from older clients that cannot render it** |
| `country_id` | uuid | FK, nullable = all countries |

> The home screen and drawer are **rendered from this table**. Ship "Rosary — Coming soon" as a disabled row, flip `is_enabled` when the content lands. `min_app_version` is what makes this safe: a v1.0 client never sees a module only v1.4 can render.

### `notification_topic` — notification types as data
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `key` | varchar(60) | `daily_readings`, `feast_day`, `obligation`, `divine_mercy_3pm`, `rosary_reminder` — unique |
| `name`, `description` | varchar | shown in settings |
| `category` | enum | `liturgical` \| `devotional` \| `parish` \| `system` |
| `default_enabled` | boolean | |
| `supports_time` | boolean | render a time picker |
| `supports_lead_days` | boolean | render a days-before stepper |
| `supports_frequency` | boolean | render daily/weekly/custom |
| `supports_rank_threshold` | boolean | feast topics only |
| `sort_order` | smallint | |
| `min_app_version` | varchar(20) | |

### `device_notification_subscription`
`device_id` (FK) · `topic_id` (FK) · `enabled` · `delivery_time` (time) · `lead_days` (smallint) · `frequency` (enum) · `rank_threshold` (enum) · `days_of_week` (jsonb) · `sound_enabled` · `settings` (jsonb, topic-specific overflow)

**Unique:** `(device_id, topic_id)`

> **The settings screen has no hardcoded list.** It fetches topics, groups them by `category`, and renders a control per `supports_*` flag. "Divine Mercy at 3pm" and "Rosary reminder" cost one INSERT each and a planner rule. This replaces v1.0's wide `notification_preference` table, which needed a migration plus a release per new toggle.

### `content_category`
`id` · `parent_category_id` (self-FK) · `name` · `slug` · `icon` · `sort_order` · `display_style` (`list`\|`grid`\|`carousel`) · `country_id`

### `content_collection` ★ carries every devotion
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `category_id` | uuid | FK |
| `type` | enum | `prayer` \| `prayer_set` \| `rosary` \| `stations` \| `chaplet` \| `novena` \| `litany` \| `devotion` \| `article` |
| `slug` | varchar(140) | unique |
| `title`, `subtitle` | varchar | |
| `description_html` | text | |
| `is_sequential` | boolean | true = stepper UI, false = single document |
| `supports_audio` | boolean | |
| `audio_media_id` | uuid | FK — full-collection recording for chaptered playback |
| `cover_media_id` | uuid | FK |
| `estimated_minutes` | smallint | |
| `language` | varchar(10) | |
| `country_id` | uuid | FK, nullable |
| `liturgical_season` | enum | nullable — e.g. Stations surface during Lent |
| **`diocese_id`** | uuid | FK, nullable — **diocese-specific devotions** |
| **`days_of_week`** | jsonb | e.g. `[1,6]` for "Mondays & Saturdays" (Rosary mysteries) |
| `parent_collection_id` | uuid | self-FK — tabs (Rosary = Prayers / Mysteries / Litany) |
| `sort_order` | smallint | |
| `status` | enum | `draft` \| `published` \| `archived` |
| `search_vector` | tsvector | GIN |

### `content_item` — ordered, nestable steps
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `collection_id` | uuid | FK |
| `parent_item_id` | uuid | self-FK — **nesting** (mystery → decade → prayer) |
| `sequence` | smallint | order within parent |
| `item_type` | enum | `station` \| `mystery` \| `decade` \| `prayer` \| `reflection` \| `scripture` \| `antiphon` \| `response` \| `heading` |
| `title` | varchar(200) | |
| `body_html` | text | |
| `reflection_html` | text | nullable |
| **`prayer_html`** | text | nullable — Stations show Scripture + Reflection + **Prayer** as three blocks |
| **`response_text`** | varchar(300) | nullable — litany two-column: `title` is the invocation, this is the response |
| `scripture_citation` | varchar(120) | nullable |
| `repeat_count` | smallint | default 1 — "Hail Mary ×10" |
| `image_media_id` | uuid | FK — station artwork |
| `audio_media_id` | uuid | FK — per-item audio, if not using collection audio |
| `audio_start_ms` | int | **chapter offset into the collection recording** |
| `audio_end_ms` | int | |
| `metadata` | jsonb | type-specific overflow |

**Indexes:** `(collection_id, parent_item_id, sequence)` · `(collection_id, item_type)`

### `content_item_translation` — parallel language text
`id` · `item_id` (FK) · `language` (varchar 10) · `title` · `body_html` · `response_text`

**Unique:** `(item_id, language)`

> Benediction has an **English / Latin / Both** toggle. A single `language` column on the collection can't express parallel text. A table rather than two columns because Igbo, Yoruba and Hausa are already in your `mass_schedule` language enum — you will want them, and two columns would become six.

> **What this models without any schema change:**
>
> | Devotion | Collection | Items |
> |---|---|---|
> | Short prayer | `type=prayer`, `is_sequential=false` | one item |
> | Rosary | `type=rosary`, `is_sequential=true` | 5 mysteries (parent) → decades → prayers with `repeat_count=10` |
> | Stations | `type=stations` | 14 `station` items, each with image, reflection, audio chapter |
> | Divine Mercy | `type=chaplet` | ordered prayers with repeat counts |
> | Novena | `type=novena` | 9 day items |
> | Litany | `type=litany` | alternating `antiphon` / `response` |
>
> One renderer (task 1.4.8) walks the tree. Each new devotion is seed data.

---

## B1. Church hierarchy

### `ecclesiastical_province`
`id` · `country_id` (FK) · `name` · `slug` (unique) · `metropolitan_see_id` (FK → `diocese`, nullable)

### `diocese`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `country_id` | uuid | FK |
| `province_id` | uuid | FK |
| `name` | varchar(160) | |
| `slug` | varchar(180) | unique |
| `type` | enum | `archdiocese` \| `diocese` \| `vicariate` \| `prefecture` |
| `patron_saint`, `bishop_name` | varchar(160) | nullable |
| `seat_city`, `state` | varchar(120) | |
| `established_date` | date | nullable |
| `website`, `email`, `phone` | varchar | nullable |
| `logo_media_id` | uuid | FK |
| **`publication_status`** | enum | `hidden` \| `in_progress` \| `published` |
| `published_at` | timestamptz | nullable |
| `verified_parish_count` | int | cached; recomputed on parish publish |
| `coverage_note` | varchar(200) | e.g. `Verified March 2027` — shown in-app |
| `rollout_priority` | smallint | seeding queue order |
| `interest_count` | int | cached from `diocese_interest` |

**Index:** `(publication_status)` · `(country_id, publication_status)`

> **The directory query filters on `publication_status = 'published'`.** Enforce in the query layer, not the UI. A diocese being seeded is invisible to the app until an admin publishes it, so data entry happens in the open without leaking half-finished records.

### `diocese_interest` — demand signal
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `diocese_id` | uuid | FK, nullable — null when the user typed a name not yet in the hierarchy |
| `requested_name` | varchar(160) | free text fallback |
| `device_id` | uuid | FK |
| `user_id` | uuid | FK, nullable |
| `state` | varchar(120) | nullable — coarse location for unknown dioceses |

**Unique:** `(device_id, diocese_id)` — one vote per device per diocese

> Drives `rollout_priority` in the back office. This is how you learn where your users actually are rather than guessing which diocese to seed next.

### `deanery`
`id` · `diocese_id` (FK) · `name` · `slug`

### `parish` ★ core entity
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `diocese_id` | uuid | FK, denormalised for query performance |
| `deanery_id` | uuid | FK, nullable |
| `parent_parish_id` | uuid | self-FK — set for outstations |
| `name` | varchar(200) | |
| `slug` | varchar(220) | unique |
| `type` | enum | `parish` \| `outstation` \| `chaplaincy` \| `cathedral` \| `shrine` |
| `patron_saint` | varchar(160) | nullable |
| `address_line`, `city`, `lga`, `state` | varchar | |
| `location` | `geography(Point,4326)` | **GIST index** |
| `phone`, `email`, `website` | varchar | nullable |
| `parish_priest_name` | varchar(160) | nullable |
| `assistant_priests` | jsonb | array of names |
| `established_date` | date | nullable |
| `description` | text | nullable |
| `cover_media_id` | uuid | FK |
| `status` | enum | `draft` \| `published` \| `archived` |
| `search_vector` | tsvector | GIN, generated |
| `verified_at` | timestamptz | last human verification |

**Indexes:** `GIST(location)` · `GIN(search_vector)` · `(diocese_id, status)` · `(parent_parish_id)` · `(updated_at)`

```sql
-- Nearest parishes, ordered by true distance.
-- Note the diocese join: an unpublished diocese is invisible even if its
-- parishes are individually marked published.
SELECT p.id, p.name, ST_Distance(p.location, :point) AS metres
FROM parish p
JOIN diocese d ON d.id = p.diocese_id
WHERE p.status = 'published' AND p.deleted_at IS NULL
  AND d.publication_status = 'published' AND d.deleted_at IS NULL
  AND ST_DWithin(p.location, :point, :radius_metres)
ORDER BY p.location <-> :point
LIMIT 20;
```

### `mass_schedule`
`id` · `parish_id` (FK) · `day_of_week` (smallint 0–6, null if `specific_date`) · `specific_date` (date) · `start_time` (time) · `language` (enum: `english`\|`igbo`\|`yoruba`\|`hausa`\|`latin`\|`other`) · `type` (enum: `sunday`\|`weekday`\|`vigil`\|`holy_day`\|`adoration`\|`confession`\|`novena`) · `notes` · `effective_from` · `effective_to`

### `parish_contact` ★ clergy **and** pastoral team
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `parish_id` | uuid | FK |
| **`contact_group`** | enum | `clergy` \| `pastoral_team` — the design's two separate repeaters |
| `role` | varchar(120) | free text: "Parish Priest", "Ass. Parish Priest", "Parish Catechist", "CWO Chairperson" |
| `full_name` | varchar(160) | |
| `phone`, `email` | varchar | nullable |
| **`is_public`** | boolean | default false |
| `sort_order` | smallint | |

**Index:** `(parish_id, contact_group, sort_order)`

> **`is_public` is not optional.** Publishing a catechist's personal mobile number without consent is a data-protection problem under the NDPR and a trust problem with parishes. Default to hidden; require an explicit tick to publish.

### `parish_activity`
`id` · `parish_id` (FK) · `name` (varchar 160) · **`schedule_text`** (varchar 200) · `description` (text, nullable) · `category` (varchar, nullable) · `sort_order`

> **`schedule_text` is deliberately free text.** Real entries are "First Thursday/Friday", "1st Sunday: workers & tithe", "Wed from 6:30am". Structuring this will fight reality and produce wrong data.

### `parish_gallery_album`
`id` · `parish_id` (FK) · `title` (varchar 160) · `event_date` (date, nullable) · `cover_media_id` (FK) · `sort_order` · `status` (enum)

`parish_gallery_item` gains **`album_id`** (FK, nullable).

> From the design: *"Each album represents an activity or event (e.g. Harvest 2025, Christmas Mass). This is separate from the parish building photos above."* An item with `album_id IS NULL` is a building photo.

**Index:** `(parish_id, day_of_week)`

> **Vigil Masses are Saturday evening but fulfil the Sunday obligation.** Store `day_of_week = 6` with `type = 'vigil'`, surface under Sunday.

---

## B2. Liturgical calendar & readings

### `liturgical_day`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `country_id` | uuid | FK |
| `date` | date | |
| `season` | enum | `advent` \| `christmas` \| `ordinary` \| `lent` \| `triduum` \| `easter` |
| `week_of_season`, `day_of_week` | smallint | |
| `sunday_cycle` | enum | `A` \| `B` \| `C` |
| `weekday_cycle` | enum | `I` \| `II` |
| `liturgical_color` | enum | `green` \| `white` \| `red` \| `violet` \| `rose` \| `black` \| **`gold`** |
| `rosary_mystery_set` | enum | `joyful` \| `luminous` \| `sorrowful` \| `glorious` — the "Today's Rosary" field |
| `is_holy_day_of_obligation` | boolean | **country-specific** |
| `import_id` | uuid | FK → `liturgical_year_import` — provenance |
| `source_reference` | varchar(160) | e.g. `Nigerian Ordo 2026/2027, p.44` |

**Unique:** `(country_id, date)` — *not* `date` alone. National calendars diverge.

> No `generated_by` column: nothing is generated. Every row traces to an imported Ordo page.

### `liturgical_year_import`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `country_id` | uuid | FK |
| `year_label` | varchar(20) | `2026/2027` — liturgical year, begins at Advent |
| `source_document` | varchar(160) | `Nigerian Ordo 2026/2027` |
| `start_date`, `end_date` | date | coverage |
| `file_media_id` | uuid | FK — the uploaded spreadsheet, retained |
| `uploaded_by_admin_id` | uuid | FK |
| `row_count`, `inserted_count`, `updated_count` | int | |
| `status` | enum | `uploaded` \| `validated` \| `committed` \| `rolled_back` \| `failed` |
| `error_report` | jsonb | `[{row, column, message}]` |
| `committed_at`, `rolled_back_at` | timestamptz | |

**Unique:** `(country_id, year_label)` where `status = 'committed'` — one committed Ordo per year.

### `celebration`
`id` · `liturgical_day_id` (FK) · `name` · `rank` (enum: `solemnity`\|`feast`\|`memorial`\|`optional_memorial`\|`ferial`) · `precedence` (smallint, lower wins) · `saint_id` (FK, nullable) · `is_proper_to_country` (boolean) · `liturgical_color` · `is_primary`

**Index:** `(liturgical_day_id, precedence)`

### `saint`
`id` · `name` · `feast_date` (month-day) · `biography` · `patronage` · `birth_year` · `death_year` · `canonization_date` · `image_media_id`

### `reading_set` ★ multi-Mass days
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `liturgical_day_id` | uuid | FK |
| `celebration_id` | uuid | FK, nullable |
| `mass_type` | enum | `day` \| `vigil` \| `night` \| `dawn` \| `ritual` |
| `cycle` | varchar(2) | nullable |
| `label` | varchar(120) | e.g. "Mass during the Night" |
| `has_second_reading` | boolean | Sundays & feasts |
| **`reflection_html`** | text | "Today's Reflection" — **required before publish** |
| **`personal_devotion_html`** | text | "Personal Devotion" — nullable |
| `sort_order` | smallint | |

**Unique:** `(liturgical_day_id, mass_type, cycle)`

> **Why this exists:** Christmas has four distinct Mass sets with different readings; the Easter Vigil has nine. One-set-per-date is wrong and expensive to fix later. The back office presents a **day-centric editor with a Mass-set selector** (task 1.3.13) — one form, but an admin can add sets to a date.
>
> **Reflection and devotion are original content**, not Lectionary text. Someone must write them 365 days a year, and a doctrinal error there is as damaging as a wrong Gospel — so they pass through the same verification gate.

### `mass_proper`
`id` · `reading_set_id` (FK) · `type` (enum: `entrance_antiphon` \| `collect` \| `prayer_after_communion` \| `offertory` \| `communion_antiphon`) · `body_html` (sanitised) · `source_reference`

**Unique:** `(reading_set_id, type)`

> **Different copyright holder.** These are **Missal** texts, not Lectionary. Add a licence row for the Missal alongside the Lectionary translation, and raise both in the task 0.1 permission conversation.

### `psalm_stanza`
`id` · `reading_id` (FK) · `sequence` (smallint) · `body_html`

**Index:** `(reading_id, sequence)`

> The renderer inserts `reading.psalm_response` between stanzas, matching the design. Storing the psalm as one blob cannot produce that layout.

### `reading`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `reading_set_id` | uuid | FK |
| `type` | enum | `first` \| `psalm` \| `second` \| `acclamation` \| `gospel` \| `sequence` |
| `sequence` | smallint | display order |
| `citation` | varchar(120) | display string, e.g. `Lk 21:25-28, 34-36` |
| `heading` | varchar(200) | nullable — "First Reading", "Gospel" |
| **`intro_line`** | varchar(240) | "A reading from the holy Gospel according to Luke (Lk 9:28b-36)" — **wording varies; store it, don't derive it** |
| `title` | varchar(240) | the reading's theme, e.g. "The Transfiguration of the Lord" |
| **`closing_line`** | varchar(120) | "The word of the Lord." / "The Gospel of the Lord." |
| `body_html` | text | **sanitised on write** — the text as printed in the Lectionary |
| `psalm_response` | varchar(300) | psalms only |
| `is_shorter_form` | boolean | the Lectionary's optional shorter readings |
| `translation_id` | uuid | FK → `bible_translation` |
| `audio_media_id` | uuid | FK, nullable — Phase 3 |
| **`verification_status`** | enum | `draft` \| `ocr_raw` \| `proofread` \| `verified` |
| `proofread_by_admin_id`, `proofread_at` | uuid, timestamptz | first pass |
| `verified_by_admin_id`, `verified_at` | uuid, timestamptz | **must differ from proofreader for Sundays & solemnities** |
| **`published_by_admin_id`**, `published_at` | uuid, timestamptz | set on super-admin override |
| **`override_reason`** | text | **mandatory** when published below `verified` |
| `import_batch_id` | uuid | FK, nullable — provenance |
| `source_reference` | varchar(160) | `Lectionary Vol. II, p. 341` |

**Index:** `(reading_set_id, sequence)` · `(verification_status)` · `(import_batch_id)`

> **Publish gate:** only `verification_status = 'verified'` rows are exposed by `/readings` or `/sync`. Enforce in the query layer, not the UI.
>
> **Super-admin override** (decision, Doc 4 §2): a `super_admin` may publish a row below `verified`, but `override_reason` is mandatory and the action writes to `audit_log` with actor, row, prior state and reason. The `auto_publish_readings` setting is **super-admin only** and each use is logged. Everyone else — including `admin` and `content_editor` — is bound by the gate.
>
> Surface overrides in the back office: a persistent banner listing readings currently published below `verified`, so a shortcut taken under deadline pressure doesn't quietly become the norm.

### `reading_import_batch`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `filename` | varchar(260) | |
| `format` | enum | `xlsx` \| `csv` \| `json` \| `docx` |
| `source_reference` | varchar(200) | `Lectionary Vol. II, pp. 340–352` |
| `file_media_id` | uuid | FK — original upload retained for audit |
| `uploaded_by_admin_id` | uuid | FK |
| `date_range_start`, `date_range_end` | date | coverage |
| `row_count`, `inserted_count`, `updated_count`, `skipped_count` | int | |
| `status` | enum | `uploaded` \| `validated` \| `committed` \| `rolled_back` \| `failed` |
| `error_report` | jsonb | `[{row, column, message}]` |
| `committed_at`, `rolled_back_at` | timestamptz | |

**Index:** `(status, created_at)` · `(date_range_start, date_range_end)`

> **Rollback semantics:** committing a batch stamps `import_batch_id` on every row it touched and snapshots prior values in `audit_log`. Rollback restores from that snapshot and sets `status = 'rolled_back'`. This is the safety net that makes bulk upload of thousands of scripture passages an acceptable risk.

### `bible_translation`
`id` · `country_id` (FK) · `name` · `abbreviation` · `licence_holder` · `licence_reference` · `permission_document_url` · `is_approved_lectionary` (boolean)

> Keep this populated. When asked under what authority you publish these texts, this table is the answer. **Licences are territorial** — hence `country_id`.

---

## B3. Trivia *(Phase 4)*

### `trivia_category`
`id` · `name` · `slug` · `icon` · `sort_order` · `country_id`

### `trivia_question`
`id` · `category_id` (FK) · `difficulty` (enum: `easy`\|`medium`\|`hard`) · `question_html` · `explanation_html` · `source_reference` (varchar — **cite the authority; doctrinal errors are serious**) · `image_media_id` · `status`

### `trivia_option`
`id` · `question_id` (FK) · `text` · `is_correct` (boolean) · `sequence`

### `trivia_attempt`
`id` · `user_id` (FK, nullable) · `question_id` (FK) · `selected_option_id` · `is_correct` · `answered_at`

> Streaks and scores are derived from `trivia_attempt`, never stored as a mutable counter.

---

## B4. Articles — Catholic history *(Phase 4)*

### `article_series`
`id` · `title` · `slug` · `description` · `cover_media_id` · `sort_order`

### `article`
`id` · `series_id` (FK, nullable) · `category_id` (FK) · `slug` (unique) · `title` · `subtitle` · `author` · `body_html` · `cover_media_id` · `reading_minutes` · `tags` (jsonb) · `published_at` · `status` · `search_vector` (GIN) · `country_id`

---

## B5. Media

### `media_asset`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `storage_key` | varchar(300) | R2 object key |
| `bucket` | varchar(80) | |
| `kind` | enum | **`image` \| `audio` \| `document`** |
| `mime_type` | varchar(60) | allowlist enforced |
| `width`, `height` | int | images |
| `duration_ms` | int | **audio** |
| `bitrate_kbps` | smallint | **audio** |
| `size_bytes` | bigint | |
| `blurhash` | varchar(60) | image placeholder |
| `variants` | jsonb | `{thumb, medium, large}` or `{low, high}` for audio |
| `uploaded_by_user_id` | uuid | FK, nullable |
| `moderation_status` | enum | `pending` \| `auto_passed` \| `auto_flagged` \| `approved` \| `rejected` |
| `moderation_labels` | jsonb | Vision/Rekognition output |

### `parish_gallery_item`
`id` · `parish_id` (FK) · `media_asset_id` (FK) · `caption` · `event_date` · `sort_order` · `status`

---

## B6. Users, auth & contributions

### `app_user`
`id` · `email` (unique, nullable) · `phone` · `display_name` · `avatar_media_id` · `auth_provider` (`email`\|`google`\|`apple`) · `provider_uid` · `password_hash` (nullable) · `email_verified_at` · `status` · `points` · `locale` · `timezone` · `country_id`

### `admin_user`
`id` · `email` (unique) · `name` · `password_hash` · `role` (`super_admin`\|`admin`\|`diocese_admin`\|`content_editor`) · `diocese_scope_id` (FK, nullable) · `status` (`pending`\|`active`\|`suspended`) · `mfa_secret` · `last_login_at` · `invited_by`

> **No self-registration.** A super admin creates accounts.

### `contributor_profile`
`id` · `user_id` (FK, unique) · `status` (`pending`\|`approved`\|`rejected`\|`revoked`) · `applied_at` · `reviewed_by_admin_id` · `reviewed_at` · `diocese_id` · `parish_affiliation_id` · `bio` · `verification_notes` · `rejection_reason`

### `submission` ★ moderation core
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `submitter_user_id` | uuid | FK |
| `entity_type` | enum | `parish` \| `parish_info` \| `mass_schedule` \| `gallery` \| `announcement` |
| `target_entity_id` | uuid | null for creations |
| `operation` | enum | `create` \| `update` \| `delete` |
| `payload` | jsonb | proposed values |
| `diff` | jsonb | `{field: {before, after}}` |
| `status` | enum | `pending` \| `approved` \| `rejected` \| `withdrawn` \| `superseded` |
| `reviewed_by_admin_id` | uuid | FK, nullable |
| `reviewed_at` | timestamptz | |
| `rejection_reason` | text | |
| `applied_entity_version` | int | optimistic-lock guard |
| `diocese_id` | uuid | denormalised for admin scoping |

**Index:** `(status, diocese_id, created_at)` · `(submitter_user_id)` · `(target_entity_id)`

> **Never write directly from a contribution.** Store payload, compute diff, apply on approval.

### `submission_attachment`
`submission_id` (FK) · `media_asset_id` (FK) · `sort_order`

### `announcement`
`id` · `parish_id` (FK) · `title` · `body_html` · `event_date` · `expires_at` · `media_asset_id` · `status` · `created_by_user_id` · `approved_by_admin_id`

**Index:** `(parish_id, status, expires_at)`

### `audit_log`
`id` · `actor_type` (`admin`\|`user`\|`system`) · `actor_id` · `action` · `entity_type` · `entity_id` · `before` (jsonb) · `after` (jsonb) · `ip_address` · `user_agent` · `created_at`

**Append-only.**

---

## B7. Notifications runtime

### `device`
`id` · `user_id` (FK, **nullable**) · `fcm_token` (unique) · `platform` · `app_version` · `locale` · `timezone` · `country_id` · `last_seen_at` · `is_active`

**Index:** `(fcm_token)` unique · `(user_id)` · `(is_active, timezone)`

### `parish_follow`
`user_id` (FK) · `parish_id` (FK) · `created_at` — composite PK

### `scheduled_notification`
`id` · `topic_id` (FK) · `title` · `body` · `data` (jsonb deep-link payload) · `target_criteria` (jsonb) · `scheduled_for` · `status` (`scheduled`\|`processing`\|`sent`\|`failed`\|`cancelled`) · `sent_count` · `failed_count`

### `notification_receipt`
`id` · `scheduled_notification_id` (FK) · `device_id` (FK) · `status` (`sent`\|`failed`\|`invalid_token`) · `error_code` · `sent_at`

> **Prune aggressively.** On `invalid_token` / `UNREGISTERED`, set `device.is_active = false`.

---

## B8. Sync, gamification & monetisation

### `content_version`
`resource` (varchar, PK) · `version` (bigint) · `updated_at`

### `app_setting`
`key` (varchar, PK) · `value` (text) · `value_type` (enum: `string`\|`int`\|`bool`\|`json`) · `description` · `updated_by_admin_id` · `updated_at`

Seeded keys: `app_name` · `support_email` · `max_gallery_images_per_parish` · `email_notify_on_submission` · `allow_contributor_updates` · `auto_publish_readings` *(super admin only)* · `maintenance_mode` · `maintenance_message` · `bank_account_details`.

> **`maintenance_mode` needs a mobile counterpart** — a blocking screen with `maintenance_message`, served from `/bootstrap`. The setting exists in the design with nothing on the app side to honour it (task 1.7.7).

### `notification_inbox_item` — the in-app inbox
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `device_id` | uuid | FK |
| `scheduled_notification_id` | uuid | FK, nullable |
| `topic_id` | uuid | FK |
| `title`, `body` | varchar / text | denormalised so history survives topic changes |
| `icon`, `deep_link` | varchar | |
| `read_at`, `deleted_at` | timestamptz | per-device state |
| `created_at` | timestamptz | day grouping in the UI |

**Index:** `(device_id, deleted_at, created_at DESC)` · `(device_id, read_at)`

> **This was missing from v2.2 entirely.** Push *delivery* is not an inbox: the design has All / Unread tabs, day grouping (Today / Yesterday / dated), per-item delete and an unread badge. Mirrored in Drift so history reads offline; backfilled from `GET /notifications/inbox` on reinstall.

### `contribution_points_ledger` *(Phase 4)*
`id` · `user_id` (FK) · `submission_id` (FK, nullable) · `points` (int, may be negative) · `reason` (enum) · `created_at`

> Ledger, not a counter. `app_user.points` is a cached sum, always reconcilable.

### `sponsorship` *(Phase 5)*
`id` · `sponsor_name` · `slot` (enum) · `media_asset_id` · `target_url` · `starts_at` · `ends_at` · `impressions` · `clicks` · `status`

### `donation` *(Phase 5 — deferred)*
`id` · `user_id` (nullable) · `amount_kobo` (bigint) · `currency` · `provider` · `provider_reference` (unique) · `status` · `created_at`

> **Not built in Phase 1.** Bank details are shown from Remote Config; no gateway, no webhook, no payment records. Store money as integer minor units (kobo) — **never floats** — when this arrives.

---

# PART C — API SURFACE

## C1. Public (no auth)

```
GET  /api/v1/bootstrap                        → modules, notification topics, config
GET  /api/v1/sync/manifest                    → version per resource
GET  /api/v1/sync/{resource}?since={ts}       → delta since timestamp

GET  /api/v1/calendar/{date}                  → liturgical day + celebrations
GET  /api/v1/calendar?from=&to=               → range for month view
GET  /api/v1/readings/{date}?mass_type=       → reading sets + readings
GET  /api/v1/content/categories               → content tree
GET  /api/v1/content/collections?type=        → prayers, rosary, stations, chaplets
GET  /api/v1/content/collections/{slug}       → collection + nested items

GET  /api/v1/parishes?q=&diocese=&state=      → paginated, published dioceses only
GET  /api/v1/parishes/nearby?lat=&lng=&r=     → PostGIS, distance-ordered
GET  /api/v1/parishes/{slug}                  → detail + schedules + gallery
GET  /api/v1/dioceses                         → hierarchy + publication_status
GET  /api/v1/coverage                         → published dioceses, counts, notes
POST /api/v1/coverage/interest                → register interest in a diocese
POST /api/v1/parishes/suggest                 → anonymous parish submission

POST /api/v1/devices                          → register FCM token
GET  /api/v1/devices/{id}/subscriptions       → topics + current settings
PUT  /api/v1/devices/{id}/subscriptions       → bulk update
```

> **`/bootstrap` is what makes the client extensible.** One call returns the module registry, notification topics and remote config. The home screen, drawer and settings screen are all rendered from its response — so new modules and notification types appear without an app update.

## C2. Authenticated user *(Phase 2)*

```
POST /api/v1/auth/register · /login · /refresh · /forgot-password
POST /api/v1/auth/social                      → Google / Apple
GET  /api/v1/me · PATCH /api/v1/me

POST /api/v1/contributor/apply
GET  /api/v1/contributor/status

POST /api/v1/submissions                      → propose a change
GET  /api/v1/submissions/mine
DELETE /api/v1/submissions/{id}               → withdraw

POST /api/v1/media/presign                    → presigned upload URL †
POST /api/v1/parishes/{id}/follow · DELETE
```

† Built in **Phase 1** (task 1.2.6) for admin uploads. Phase 2 extends it to approved contributors with tighter limits.

## C3. Back office (admin)

```
POST /api/v1/admin/auth/login                 → + MFA for super_admin
GET  /api/v1/admin/dashboard                  → pending counts by category

CRUD /api/v1/admin/parishes · /dioceses · /deaneries · /mass-schedules
POST /api/v1/admin/parishes/import            → CSV bulk import
POST /api/v1/admin/parishes/import/dry-run    → validate before committing

CRUD /api/v1/admin/parishes/{id}/contacts · /activities · /gallery-albums
CRUD /api/v1/admin/settings                   → app_setting key/value

GET  /api/v1/admin/rollout                    → dioceses by status, counts, interest
POST /api/v1/admin/dioceses/{id}/publish      → guarded: refuses on 0 verified parishes
POST /api/v1/admin/dioceses/{id}/unpublish
GET  /api/v1/admin/coverage/interest          → demand ranking for seeding order

CRUD /api/v1/admin/readings · /reading-sets · /celebrations · /saints
GET  /api/v1/admin/readings/by-date/{date}    → day-by-day editor payload

POST /api/v1/admin/ordo/import                → upload annual Ordo (xlsx/csv)
POST /api/v1/admin/ordo/import/{id}/validate  → dry-run, returns error report
POST /api/v1/admin/ordo/import/{id}/commit
POST /api/v1/admin/ordo/import/{id}/rollback
GET  /api/v1/admin/ordo/imports               → history

POST /api/v1/admin/readings/import            → xlsx | csv | json | docx
POST /api/v1/admin/readings/import/{id}/validate   → dry-run + per-row errors
GET  /api/v1/admin/readings/import/{id}/preview    → diff vs current
POST /api/v1/admin/readings/import/{id}/commit
POST /api/v1/admin/readings/import/{id}/rollback
GET  /api/v1/admin/readings/import/template   → download the XLSX template

POST /api/v1/admin/readings/{id}/proofread
POST /api/v1/admin/readings/{id}/verify       → rejects if same admin proofread it
POST /api/v1/admin/readings/{id}/override-publish  → super_admin only; reason required
GET  /api/v1/admin/readings/unverified?from=&to=   → the entry team's work queue
GET  /api/v1/admin/readings/overridden        → currently published below 'verified'

CRUD /api/v1/admin/admins                     → admin_user only
GET  /api/v1/admin/app-users                  → app_user, read-only
POST /api/v1/admin/app-users/{id}/suspend · /promote-contributor
GET  /api/v1/admin/contributor-applications

CRUD /api/v1/admin/content/categories · /collections · /items
POST /api/v1/admin/content/items/reorder      → drag-reorder persistence
CRUD /api/v1/admin/modules                    → app_module registry
CRUD /api/v1/admin/notification-topics
POST /api/v1/admin/notifications/broadcast

GET  /api/v1/admin/submissions?status=&type=&diocese=
GET  /api/v1/admin/submissions/{id}           → includes computed diff
POST /api/v1/admin/submissions/{id}/approve · /reject
POST /api/v1/admin/submissions/bulk-approve

CRUD /api/v1/admin/admins                     → super_admin only
POST /api/v1/admin/users/{id}/promote         → contributor → admin
GET  /api/v1/admin/users · /audit-log
```

---

# PART D — SYNC STRATEGY

The single most important mechanism in the app.

1. **Ship a seed database.** CI builds `assets/seed.db` with 12 months of readings, all content collections, and every published parish. First launch copies it into place — fully useful before the first network call. **Text and images only; never audio.**

2. **Manifest check** on launch and resume (throttled to 6h). `GET /sync/manifest`:
   ```json
   { "readings": 1723640000, "parishes": 1723641200, "content": 1723500000 }
   ```

3. **Pull only what moved.** `GET /sync/parishes?since=...&cursor=...` returns changed rows including tombstones (`deleted_at` set).

4. **Apply in a transaction.** Upsert by `id`, hard-delete tombstoned rows, then update the local version marker. Never partially apply.

5. **Rolling window for readings** — 90 days back, 365 forward. Prune beyond that. Expose a **"download readings through [date]"** control so users can pre-fetch before travelling, or before Lent.

### Rules

- **Only `verified` readings sync.** A reading in `draft`, `ocr_raw` or `proofread` is invisible to `/sync` and `/readings`. Enforce in the query layer.
- **Corrections propagate automatically.** Fixing a typo in a Gospel bumps `updated_at`; every device self-corrects on next sync. This is a genuine advantage over apps that ship content fixes by store update.
- **Rollback is a sync event.** Rolling back an import batch restores prior values and bumps `updated_at`, so devices converge on the restored text. Never hard-delete readings a client may hold.
- **Server time is authoritative.** Never use device clocks for sync cursors.
- **Sync runs in a background isolate.** It must never block the UI.
- **Content sync is one-way (server → client).** Contributions post separately via `/submissions`; no bidirectional merge, no conflict resolution.
- **Audio is never synced.** It streams, or downloads on explicit user request, tracked in a client-only `offline_download` table.
- **Every syncable table needs `updated_at` and `deleted_at`.**

---

# PART E — FEATURE → DATA → API MAP

| Feature | Tables | Endpoints | Phase |
|---|---|---|---|
| Home screen / navigation | `app_module` | `/bootstrap` | 1 |
| Daily readings | `liturgical_day`, `celebration`, `reading_set`, `reading` | `/readings/{date}` | 1 |
| Calendar | `liturgical_day`, `celebration`, `saint` | `/calendar` | 1 |
| Ordo import (annual) | `liturgical_year_import`, `liturgical_day`, `celebration` | `/admin/ordo/import` | 1 |
| Readings bulk upload | `reading_import_batch`, `reading`, `reading_set` | `/admin/readings/import` | 1 |
| Proofread / verify queue | `reading` (`verification_status`), `audit_log` | `/admin/readings/unverified` | 1 |
| Parish list & search | `parish`, `diocese`, `deanery` | `/parishes` | 1 |
| Coverage & rollout | `diocese.publication_status`, `diocese_interest` | `/coverage`, `/admin/rollout` | 1 |
| Suggest my parish (anonymous) | `submission` (`submitter_user_id` null) | `/parishes/suggest` | 1 |
| Parish detail | `parish`, `mass_schedule`, `parish_contact`, `parish_activity`, `parish_gallery_album`, `parish_gallery_item` | `/parishes/{slug}` | 1 |
| Mass propers (antiphon, collect) | `mass_proper` | `/readings/{date}` | 1 |
| Reflection & personal devotion | `reading_set.reflection_html`, `.personal_devotion_html` | `/readings/{date}` | 1 |
| In-app notification inbox | `notification_inbox_item` | `/notifications/inbox` | 1 |
| Settings & maintenance mode | `app_setting` | `/bootstrap`, `/admin/settings` | 1 |
| Latin / English toggle | `content_item_translation` | `/content/collections/{slug}` | 1 |
| Nearest parish / map | `parish` (GIST) | `/parishes/nearby` | 1 |
| Directions | — | none (deep link) | 1 |
| Short prayers | `content_category`, `content_collection`, `content_item` | `/content/collections` | 1 |
| Customisable notifications | `notification_topic`, `device_notification_subscription`, `scheduled_notification` | `/devices/{id}/subscriptions` | 1 |
| Back office parish mgmt | `parish`, `diocese`, `deanery`, `mass_schedule` | `/admin/parishes` | 1 |
| Back office content mgmt | `content_collection`, `content_item`, `app_module`, `notification_topic` | `/admin/content/*` | 1 |
| Support us (bank details) | — (Remote Config) | none | 1 |
| User accounts | `app_user` | `/auth/*`, `/me` | 2 |
| Contributions & approval | `submission`, `submission_attachment`, `audit_log` | `/submissions`, `/admin/submissions` | 2 |
| Announcements | `announcement`, `parish_follow` | `/parishes/{id}/follow` | 2 |
| **Rosary** | `content_collection` (`type=rosary`), `content_item` | `/content/collections/{slug}` | 3 |
| **Stations of the Cross** | `content_collection` (`type=stations`), `content_item`, `media_asset` | same | 3 |
| **Divine Mercy** | `content_collection` (`type=chaplet`), `content_item` | same | 3 |
| **Audio playback** | `media_asset` (`kind=audio`), `content_item.audio_start_ms` | streamed from R2 | 3 |
| Readings audio | `reading.audio_media_id` | `/readings/{date}` | 3 |
| Trivia | `trivia_category`, `trivia_question`, `trivia_option`, `trivia_attempt` | `/trivia/*` | 4 |
| Catholic history | `article`, `article_series` | `/articles` | 4 |
| Hymnal | `content_collection` (`type=devotion`) or dedicated `hymn` | `/hymns` | 4 |
| Points | `contribution_points_ledger` | `/me/points` | 4 |
| Sponsorship / donations | `sponsorship`, `donation` | `/admin/sponsorships` | 5 |

> **Note the Phase 3 rows: no new tables.** That is the extensibility spine working as designed.

---

# PART F — BUILD ORDER

```
0.5 Play Console ──────────────────────────────► gates internal testing
0.1 licensing ─────────────────────────────────► gates PUBLISHING content
0.2 Ordo + Lectionary vols 1-3 in hand ────────► gates 1.3.1 / 1.3.4
       │
1.1 foundations (hosted env, schema, auth, OpenAPI, INTERNAL TRACK)
       │        └─ 1.1.9 skeleton app live to testers in WEEK ONE
       │
       ├──► 1.2 back office parishes ──► CSV import ──► SEEDING BEGINS ════════╗
       │         └─ 1.2.8 rollout console      (diocese 1 gates launch;        ║
       │                                        the rest continue after)       ║
       ├──► 1.3 back office content ──┬─► 1.3.1 ORDO IMPORT (annual scaffold)  ║
       │                              ├─► 1.3.3/1.3.4 READINGS ENTRY ══════════╣
       │                              │        └─ 1.3.8 proofread → verify     ║
       │                              └─► 1.3.6 GENERIC CONTENT FRAMEWORK      ║
       │                                        │                              ║
       ├──► 1.4 mobile core                     │                              ║
       │        ├─ 1.4.3 sync engine ◄── hardest task, strongest developer     ║
       │        ├─ 1.4.5 server-driven home                                    ║
       │        └─ 1.4.8 generic renderer ◄─────┘ makes Phase 3 cheap          ║
       │                                                                       ║
       ├──► 1.5 parish directory ──► OPEN CLOSED TEST TRACK (14-day clock)     ║
       │         └─ 1.5.7 coverage UI · 1.5.8 suggest-my-parish                ║
       │                                                                       ║
       ├──► 1.6 notifications ──► 1.6.4 topic registry                         ║
       │                                                                       ║
       └──► 1.7 launch prep ◄═════════════════════════════════════════════════╝
                 │                    (needs ONE published diocese, not all)
                 └──► PRODUCTION LAUNCH (month 11)
                           │
                           └──► seeding continues as normal operations ──►►►
                           │
                           ├──► Phase 2: contributions
                           └──► Phase 3: devotions & audio — data + renderers
```

**Ship 1.2 and 1.3 by month 3** so seeding runs in parallel with mobile development. As of v2.2 data is no longer on the critical path — one published diocese gates launch, and the rest is continuous operations — but the earlier those tools land, the more dioceses are live on day one.

**Three tasks determine whether later phases are cheap or expensive:** 1.3.6 (content framework), 1.4.8 (generic renderer), 1.6.4 (notification topics). Roughly 104 hours combined. Skipping them makes every devotion in Phase 3 a schema migration plus a release — an easy 200+ hours of avoidable work, paid later and under pressure.
