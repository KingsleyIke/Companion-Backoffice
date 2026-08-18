# Document 4 — UI Review & Design/Architecture Reconciliation

**Project:** Catholic Companion (Nigerian Catholic Church Directory & Liturgical Companion)
**Version:** 1.0 · August 2026
**Reviewed:** ~28 mobile screens · ~14 back-office screens

> Read alongside Doc 2 v2.3, which now carries the schema and tasks this review produced.

---

## 1. Verdict

The designs are in better shape than most specs I review, and in two places they independently arrived at the architecture in the docs — which is strong validation, not coincidence.

**Validated by the designs:**

| Design | Confirms |
|---|---|
| Home screen: uniform grid of title + image + route tiles | `app_module` registry (Doc 2 B0) |
| Approvals: Field / Current Value / Proposed Value table, review note required on reject | `submission.diff` + apply-on-approve |
| Church Prayers: categories → items with Latin subtitles | `content_category` + `content_collection` |
| Stations, Rosary, Benediction: ordered, nestable, some with responses | `content_item` tree + `is_sequential` |
| Parish form: Role / Full Name / Phone / Email repeater | `parish_contact` |
| Parish list: Country → Diocese → Deanery filters | hierarchy model |

**The designs are also richer than the spec.** They added roughly 234 hours to Phase 1 — see §7. That's not a criticism; it's the cost of a more complete product, and §7 offers trims if the date matters more.

---

## 2. Decisions taken

Recorded so nobody relitigates them.

| Conflict | Decision |
|---|---|
| **Readings publish gate** — designs show Draft/Published + auto-publish; docs specify 4-state verification | **Keep all four states** (`draft → ocr_raw → proofread → verified`). **Super admin may override** with a mandatory reason, written to `audit_log`. `auto_publish_readings` is restricted to super admin and logged per use. |
| **User model** — designs show one table with role enum; docs split mobile/admin | **Keep them split.** `admin_user` and `app_user` remain separate auth surfaces. The back office prototype's single "All Users" table needs restructuring — see §5.1. |
| **Multi-Mass days** — designs have one Liturgy Type per date | **Add a Mass-set selector.** The day-centric editor stays, but an admin can add multiple sets (Vigil / Night / Dawn / Day) to one date. Christmas and the Easter Vigil work correctly. |
| **Bulk upload** — entirely absent from the designs | **Must be designed.** See §5.2. Highest-priority design gap. |

---

## 3. Schema changes the designs require

### 3.1 Parish

| Change | Reason |
|---|---|
| **`parish_contact`** — `parish_id`, **`contact_group`** (`clergy` \| `pastoral_team`), `role`, `full_name`, `phone`, `email`, `is_public`, `sort_order` | Design has *two* contact collections — "Parish Contacts (Priest, Catechist…)" and "Pastoral Team (Societies & Lay Leaders)". One table with a group discriminator, not two tables. `is_public` matters — see §6.13 |
| **`parish_activity`** — `parish_id`, `name`, `schedule_text`, `description`, `sort_order` | "Church Activities" repeater. **`schedule_text` is free text** — "First Thursday/Friday", "1st Sunday: workers & tithe" will not parse, and forcing structure will fight reality |
| **`parish_gallery_album`** — `parish_id`, `title`, `event_date`, `cover_media_id`, `sort_order`, `status` | Design is explicit: *"Each album represents an activity or event (e.g. Harvest 2025). This is separate from the parish building photos above."* `parish_gallery_item` gains `album_id` |
| `parish.social_links` jsonb | Platform + handle repeater |
| `parish.status` enum → `draft` \| `pending_review` \| `published` \| `archived` | Design uses Active/Pending/Inactive. Map Active→published, Pending→pending_review, Inactive→archived |

### 3.2 Readings & calendar

| Change | Reason |
|---|---|
| **`mass_proper`** — `reading_set_id`, `type` (`entrance_antiphon` \| `collect` \| `prayer_after_communion`), `body_html` | "Before the Readings" and "After Communion" sections. **Note: these come from the Missal, not the Lectionary — a different copyright holder.** Add a second `bible_translation`-style licence row for the Missal |
| `reading.intro_line` | "A reading from the holy Gospel according to Luke (Lk 9:28b-36)" — wording varies, don't derive it |
| `reading.closing_line` | "The word of the Lord." / "The Gospel of the Lord." |
| **`psalm_stanza`** — `reading_id`, `sequence`, `body_html` | Stanzas repeater. Renderer inserts the response between stanzas |
| `reading_set.reflection_html` (required), `reading_set.personal_devotion_html` | "Today's Reflection" and "Personal Devotion". **Original content — someone must write it daily, and it carries the same doctrinal risk as scripture, so it goes through the same verification gate** |
| `reading_set.is_optional_second_reading` | "+ Add Second Reading (Sundays & Feasts)" |
| `liturgical_day.rosary_mystery_set` enum | "Today's Rosary" dropdown |
| `liturgical_color` enum **+ `gold`** | Design offers Gold; the docs' enum lacked it |
| `reading.published_by_admin_id`, `published_at`, `override_reason` | Super-admin override trail |

### 3.3 Devotional content

| Change | Reason |
|---|---|
| **`content_item_translation`** — `item_id`, `language`, `title`, `body_html`, `response_text` | Benediction has an **English / Latin / Both** toggle. A single `language` per collection can't express parallel text. A table (not two columns) because Igbo/Yoruba are already in your `mass_schedule` language enum — you will want them |
| `content_collection.diocese_id` (nullable) | **Stations exists in four versions**, two diocese-specific ("Archdiocese of Abuja", "Archdiocese of Lagos"). Diocese-scoped devotional content is a real requirement |
| `content_collection.days_of_week` jsonb | Rosary mysteries map to days ("Mondays & Saturdays") |
| `content_item.response_text` | Litany two-column invocation/response |
| `content_item.prayer_html` | Station has Scripture + **Reflection** + **Prayer** as three distinct blocks |

### 3.4 Platform

| Change | Reason |
|---|---|
| **`app_setting`** — key/value/type/updated_by | Settings screen: app name, support email, max gallery images, toggles, **maintenance mode** |
| **`notification_inbox_item`** — device-scoped, `read_at`, `deleted_at`, `title`, `body`, `icon`, `deep_link` | The in-app notification inbox (All / Unread tabs, per-item delete, grouped by day) is **not in the docs at all**. Push delivery ≠ an inbox with history and read state |

---

## 4. Placeholder data — do not let this reach code

**The mobile calendar mockup is liturgically wrong throughout.** A sample:

| Shown | Actual |
|---|---|
| All Saints — 1 Aug (and again 21 Aug) | 1 November |
| Christ the King — 17 Aug | Last Sunday of the liturgical year (late Nov) |
| Immaculate Conception — 15 Aug | 8 December |
| The Annunciation — 10 Aug | 25 March |
| Holy Trinity — 8 Aug · Corpus Christi — 13 Aug | Movable, May/June |
| St Maximilian Kolbe — 18 Aug *(also the readings screen header)* | **14 August** |
| St Francis of Assisi — 11 Aug and 31 Aug | 4 October |
| "First Sunday in Ordinary Time" — on Tuesdays, repeatedly | — |

Weekday alignment is correct (1 Aug 2026 *is* a Saturday), so only the celebrations are placeholder. **Every one of these must come from the imported Ordo.** The specific risk: a developer or an agent copies this into seed data or test fixtures, and it silently becomes the app's reference. Strip it before handing the code to anyone.

---

## 5. Missing screens

### 5.1 Back office: user model restructure

With `admin_user` and `app_user` split, the single "All Users" table can't stand. Replace with:

- **Users → Admins** — `admin_user` CRUD. Roles: `super_admin`, `admin`, `diocese_admin`, `content_editor`. Diocese scope selector for `diocese_admin`. This is where "Create User" lives.
- **Users → App Users** — `app_user`, **read-only**, with actions: view, suspend, promote to contributor, approve/revoke contributor. No password field — mobile users set their own.
- **Users → Contributor Applications** — the `contributor_profile` queue with approve/reject + reason.

The current design's mixed role enum (`superAdmin` / `admin` / `contributor` / `user` in one grid) is exactly the thing the split is meant to prevent.

### 5.2 Back office: bulk upload — the big gap

**None of the import surface is designed, and it is roughly 40% of milestone 1.3.** Required:

| Screen | Contents |
|---|---|
| **Ordo → Import** | Upload annual XLSX/CSV · dry-run · per-row error report · preview · commit · rollback |
| **Readings → Bulk Upload** | XLSX/CSV/JSON/DOCX picker · **download template** · dry-run · per-row error report · preview diff vs existing · commit |
| **Parishes → Bulk Import** | CSV picker · dry-run · error report · commit |
| **Import History** | All batches with date range, row counts, status, and a **Rollback** action per batch |
| **Readings → Verification Queue** | Filter by date range and state · proofread / verify actions · flags where the same admin would sign off twice |
| **Rollout Console** | Dioceses by publication status, verified-parish counts, user-interest ranking (Doc 2 task 1.2.8) |

Design the error report carefully — it's what your data-entry team will live in. Row number, column, message, and a jump-to-row.

### 5.3 Mobile

- **Coverage / empty states** for uncovered dioceses (Doc 2 task 1.5.7)
- **Suggest my parish** (task 1.5.8)
- **Maintenance mode** blocking screen
- **Audio player** slot on readings and devotions — reserve the space now

---

## 6. UI recommendations

### Must fix

1. **Add a map picker for parish coordinates.** Raw latitude/longitude text inputs will put parishes in the Atlantic. Drag-to-place on a map, with a reverse-geocoded address shown for confirmation. This is the single highest-value back-office fix — bad coordinates make "nearest parish" worse than useless.
2. **Add verification state to Add/Edit Reading** — Draft → Proofread → Verified, showing who did each and when, plus the super-admin override with a required reason.
3. **Fix the contributor signup form.** Currently: Gender is **required**, there's no password, no social sign-in, no consent checkbox, no parish affiliation. Remove Gender or make it optional (there's no stated purpose, and under NDPR collecting it needs one); add terms/privacy consent; add password or Google/Apple sign-in; add diocese/parish affiliation; add a **"pending approval"** state, because becoming a contributor requires admin approval and the form implies it's instant.
4. **Hide "Logout" in the mobile drawer when nobody is signed in.** The app is designed to work with no account — a Logout link contradicts that.
5. **Design the maintenance-mode screen.** The setting exists with no mobile counterpart.
6. **Strip the placeholder liturgical data** (§4) before this code goes to any developer or agent.

### Should fix

7. **Home tile contrast.** Text sits on photos with a thin scrim; Hymn Book and Questions Catholics Ask are hard to read. Add a stronger bottom-up gradient and verify 4.5:1.
8. **Colour-code the calendar by liturgical colour.** You already capture it and the design ignores it — every cell reads pink. Also handle two celebrations on one date.
9. **Pick one affordance per prayer row.** Every row has both `+` and `>`. Expand inline *or* navigate, not both.
10. **Remove the redundant gallery control** — "+2 more" overlay and "View 2 More Photos" button do the same thing.
11. **Show sync and download state.** For an offline-first app there is currently nothing but a manual "Sync Readings Now" button. Users need last-synced time, what's downloaded, and how far ahead readings are cached.
12. **Tap-to-call parish phone numbers**, and add a per-contact "hide from public" toggle. Publishing a catechist's personal mobile without consent is a real problem — hence `parish_contact.is_public`. *(Also: the mock shows the same number for two different people.)*
13. **Confirmation on destructive actions.** Parish list trash icon and notification delete both fire without one.
14. **Font-size control on the readings screen.** It's in the spec, absent from the design, and this audience skews older.
15. **Cascading filters.** Diocese should filter by Country, Deanery by Diocese. And hide the mobile Country filter while only Nigeria is published.
16. **Share one token file across both apps.** Mobile is maroon, back office is bright blue — they read as unrelated products. Low priority for an internal tool, but a shared `tokens` file costs nothing now.

### Consider

17. **A bead/progress indicator for the Rosary.** "Begin All Stations" gives Stations a guided mode; the Rosary is reference-only. `repeat_count` already supports guided prayer.
18. **Better dashboard metrics.** "Daily Readings: 1" tells you nothing. Use *days covered in the next 30*, *unverified readings*, *dioceses published*, *median approval turnaround*.
19. **Empty states throughout the back office.** Several screens will render as blank white on day one.

---

## 7. Effort impact

| Area | Added |
|---|---|
| Parish contacts, pastoral team, activities, gallery albums, social links | 56h |
| Mass propers, psalm stanzas, reflection/devotion, closing lines | 32h |
| Mass-set selector (multi-Mass days) | 16h |
| Super-admin override + audit | 8h |
| **Bulk upload / import UI (undesigned)** | **24h** |
| In-app notification inbox | 30h |
| Latin/English/Both translations + renderer | 20h |
| Manual sync + sync status UI | 12h |
| `app_setting` + maintenance mode | 12h |
| Diocese-scoped content | 6h |
| **Phase 1 total** | **+234h → ~1,370h** |
| Contributor signup rework (Phase 2) | +12h → 632h |

**Launch moves to ~month 11.** If that matters more than completeness, the cheapest 50 hours to defer:

- **In-app notification inbox → Phase 2** (30h). Push notifications alone work at launch; the inbox is a nice-to-have.
- **Latin/English toggle → Phase 3** (20h), shipping with Benediction rather than before it.

Both are clean deferrals — no schema change, no rework.

---

## 8. Open items

- **Back-office visual language** — keep the blue, or align to the mobile maroon?
- **Who writes the daily reflection and personal devotion?** It's original content, needed 365 days a year, and carries doctrinal risk. This is an unowned recurring commitment.
- **Missal licence** — entrance antiphons, collects and prayers after communion are Missal texts, a separate permission from the Lectionary. Add it to the task 0.1 conversation.
- **Figma React code** — extract design tokens and per-screen layout specs. Do **not** port it: the back office is Angular and mobile is Flutter, so the markup is throwaway either way.
