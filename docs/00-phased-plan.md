# Nigerian Catholic Church App — Phased Delivery Plan

**Version 1.0 · August 2026**

---

## Stack (locked)

| Layer | Choice |
|---|---|
| Database | PostgreSQL + PostGIS |
| Backend | NestJS on Node, TypeORM |
| Back office | Angular + Angular Material |
| Mobile | Flutter + Drift (SQLite, offline-first) |
| Images | Cloudflare R2, signed uploads via API |
| Push | FCM + BullMQ/Redis fan-out |
| Maps | MapLibre + Protomaps basemap; deep-link out for directions |
| Calendar source | Annual Nigerian Ordo import (no library) |
| Readings source | Lectionary vols 1–3, entered via back office |

**Repos:** `platform` monorepo (API + back office + shared types) · `mobile` (Flutter, consumes generated OpenAPI client).

---

## The sequencing principle

Data seeding takes **months of calendar time** and is not developer work. The plan is therefore built so that **the back office ships before the mobile app** — the moment admins can enter parishes and readings, content entry runs in parallel with mobile development instead of after it.

Get this wrong and you finish a beautiful app with an empty database and a three-month wait before launch.

---

## Phase 0 — Clear the blockers

**Duration:** 3–4 weeks, running alongside early Phase 1
**Effort:** ~60–80 hours, mostly non-code

The only phase that can kill the project. Do it first.

| Task | Why it matters |
|---|---|
| **Secure lectionary/Bible text permission** | Written permission from the relevant conference or publisher. Copyrighted — this is not optional. |
| Confirm liturgical calendar for Nigeria | National calendar, proper feasts, local observances |
| Source parish seed data | OSM extract (`amenity=place_of_worship` + `denomination=catholic`), GCatholic, Catholic-Hierarchy, diocesan directories |
| Open diocesan conversations | Endorsement is the single largest driver of adoption; it takes months, so start now |
| Register Google Play account ($25) | 14-day closed-test clock starts here, not at launch |
| Draft privacy policy | Required by both stores |

**Exit criteria:** written content permission in hand (or a confirmed open-licensed alternative), and a raw parish dataset of 3,000+ records to clean.

---

## Phase 1 — Ship the daily habit

**Goal:** A user opens the app every morning for readings, and can find their nearest parish with directions. Admins can populate everything.

**Effort:** ~980 hours · **Duration:** 7–8 months at 30 hrs/week

### Milestones

| # | Milestone | Weeks | Output |
|---|---|---|---|
| 1.1 | **Foundations** | 4 | Monorepo, docker-compose local stack, schema + migrations, admin auth + roles, CI, OpenAPI → client generation |
| 1.2 | **Back office: parishes** | 5 | Parish CRUD, **CSV bulk import**, gallery upload, hierarchy (province → diocese → deanery → parish → outstation), map picker for coordinates |
| 1.3 | **Back office: content** | 4 | Multi-day readings upload, readings editor, feast overrides, prayers CRUD, publish/unpublish |
| 1.4 | **Mobile: readings core** | 7 | App shell, offline sync engine, bundled SQLite seed, calendar (month/week), daily readings, prayers, feast of the day |
| 1.5 | **Mobile: parish directory** | 5 | List, search, filters, parish detail, gallery, map view, nearest-to-me (PostGIS), directions deep-link, mass times |
| 1.6 | **Notifications** | 4 | FCM + BullMQ scheduler, feast reminders, daily readings reminder, settings (on/off, time, days-early, sound, category) |
| 1.7 | **Launch prep** | 4 | Side drawer, share, "Support us" (Paystack link), ad slots built but **disabled** via Remote Config, QA, store submission, closed test |

> **1.2 and 1.3 are the unlock.** Once they ship, hand the back office to your data-entry helpers and let seeding run for the remaining four months of development.

### In scope

**Mobile:** Home · Calendar · Daily readings (offline) · Parish list, search, filters · Parish detail + gallery · Maps + directions · Nearest parish · Feast notifications + settings · Prayers · Side drawer (about, contact, share, support us) · Settings

**Back office:** Login + forgot password (no self-signup) · Dashboard · Parish CRUD + bulk import · Gallery upload · Readings bulk upload + editor · Feast management · Prayers CRUD · Admin account creation

**Backend:** Admin auth + RBAC · Parish + geospatial API · Calendar/readings API · Delta sync endpoint · Signed upload URLs + image resize pipeline · Notification scheduler

### Deliberately excluded

No user accounts. No contributions. No moderation queue. No points. No ads enabled. No hymnal, catechism, doctrine, trivia, or news.

**Why:** this half carries **zero moderation burden**. Once shipped it costs ~$50/month to run and needs no daily human attention — so it can sit in the store building an audience while you build Phase 2.

### Exit criteria

- **One diocese complete, verified and published** — not national coverage. Quality over breadth: one trustworthy diocese beats twenty half-entered ones.
- A written rollout order for the remaining dioceses, ranked by user interest data
- 12 months of readings loaded and verified (two-person sign-off on Sundays)
- One full liturgical year of Ordo imported
- Live on both stores
- Daily readings work in airplane mode
- Push notification delivered to a real device on a real feast day
- Uncovered areas show honest coverage messaging, never an empty list

> Adding dioceses is continuous back-office work that runs for months after launch. Blocking release on national coverage was the largest schedule risk in earlier versions of this plan.

---

## Phase 2 — Open contributions

**Goal:** Users keep the parish data fresh; admins approve everything before it goes live.

**Effort:** ~620 hours · **Duration:** 5 months

### Milestones

| # | Milestone | Weeks | Output |
|---|---|---|---|
| 2.1 | **User accounts** | 2 | Mobile signup/login/forgot password, Google + Apple sign-in, profile, account deletion |
| 2.2 | **Contributor application** | 2 | "Become a contributor" flow, application queue, admin approve/reject with reason |
| 2.3 | **Submission engine** | 4 | Every contribution as a proposed change with before/after diff, status lifecycle, audit trail, rate limiting |
| 2.4 | **Contributor actions** | 4 | Suggest new parish/outstation, update parish info, upload gallery images, post announcements, update mass times |
| 2.5 | **Approval back office** | 4 | Queues per category, side-by-side diff review, approve/edit/reject, bulk actions, moderation dashboard |
| 2.6 | **Admin hierarchy** | 2 | Sub-admins, granular permissions, diocese-scoped admins, convert contributor → admin, subscriber list |
| 2.7 | **Announcements + ads** | 2 | Follow a parish, announcement push notifications, enable AdMob with category blocking |

### Design notes

- **Contributions are proposed changes, never direct writes.** Store the diff, apply on approval. This gives you rollback, audit trail, and contributor scoring for free.
- **Scope admins by diocese.** A parish priest in Enugu should not be approving submissions for Lagos. Building this in Phase 2 is cheap; retrofitting it is not.
- **Image moderation is mandatory.** Any app accepting public photo uploads will eventually receive something inappropriate. Automated safety screening before it reaches the human queue.
- **Ads: block gambling, loans, dating, alcohol.** Never on readings, prayers or calendar screens. Keep every placement behind Remote Config so a bad ad can be killed in minutes, not app-release days.

### Exit criteria

Median approval turnaround under 48 hours · 100+ approved contributions · zero unmoderated content reaching production.

---

## Phase 3 — Deepen engagement

**Effort:** ~350–450 hours · **Duration:** 2–3 months

- **Hymnal** — offline, searchable by number/title/first line *(licensing required)*
- **Daily prayers** — expanded set, scheduled prayer reminders
- **Points & recognition** — contributor scoring, leaderboard, eligibility view
- **News** — diocesan and national Catholic news feed
- **In-app feedback** and suggestions

---

## Phase 4 — Catechism & monetisation

**Effort:** ~300–400 hours · **Duration:** 2–3 months

- **Catechism** *(copyright Libreria Editrice Vaticana — permission required)*
- **Catholic doctrine** reference
- **Trivia** + gamification
- **Enhanced parish listings** — paid tier for parishes/dioceses
- **Direct sponsorship slots** — sold to Catholic publishers, schools, pilgrimage operators
- **Supporter tier** — IAP removing ads, unlocking extras

---

## Timeline

| Phase | Effort | Duration | Cumulative |
|---|---|---|---|
| Phase 0 | ~70h | 3–4 weeks (runs in parallel) | Month 1 |
| Phase 1 | ~980h | 7–8 months | **Month 8 — first launch** |
| Phase 2 | ~620h | 5 months | Month 13 |
| Phase 3 | ~400h | 3 months | Month 16 |
| Phase 4 | ~350h | 3 months | Month 19 |

At 30 hrs/week solo. Halve the elapsed time with a second developer on the mobile track.

---

## Money by phase

| Phase | Cash cost | Revenue at end of phase |
|---|---|---|
| 0 | $25 (Play fee) | — |
| 1 | ~$700 (Apple, infra, store assets) **plus ₦1.5M–4M content entry if paid** | Donations only, ~$50–150/mo |
| 2 | ~$1,200/yr running | Ads + donations, ~$400–900/mo |
| 3 | ~$2,000/yr running | ~$700–1,300/mo |
| 4 | ~$4,000/yr running | ~$1,000–2,000/mo |

**Break-even lands during Phase 2**, at roughly 5,000–10,000 engaged users. Infrastructure never becomes the dominant cost — moderation labour does, from Phase 2 onward.

---

## Parallel workstreams

Three tracks run continuously and are not developer time:

1. **Content entry** — 5,000+ readings across the 3-year and 2-year cycles, ~200 feasts, prayers, later hymns. Budget ₦1.5M–4M for paid entry and proofreading, or organise volunteers. *An error in the Sunday readings costs you the trust of every parish at once — proofread everything twice.*
2. **Parish data verification** — clean the OSM extract, verify coordinates, confirm names and dioceses. Phase 2 contributions eventually maintain this, but the first 3,000 records are on you.
3. **Diocesan relationships** — the gap between 15,000 and 250,000 users is almost entirely whether dioceses promote the app. Start in Phase 0, keep going forever.

---

## Top risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Content licensing denied** | Project-ending | Resolve in Phase 0, before any code |
| Seeding stalls | Launch slips indefinitely | Ship back office by month 3; start entry immediately |
| Contribution spam/abuse | Reputational | Approval-only writes, image screening, rate limits |
| Inappropriate ads served | Reputational | Category blocking, Remote Config kill switch, never on devotional screens |
| Scope creep back into Phase 1 | 2 years to launch | The Phase 1 exclusion list is a contract with yourself |

---

## The one rule

**Nothing moves into Phase 1 that isn't already there.** Every feature in Phases 2–4 will feel urgent at some point during the build. The plan only works if Phase 1 ships in month 8 — an app in users' hands, teaching you what parishes actually want, beats a more complete app two years from now.
