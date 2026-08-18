# Document 6 — Design Code Reconciliation

**Version:** 1.0 · August 2026
**Source read:** `Companion With Make/src` — `styles/theme.css`, `app/backoffice/models/shared-models.ts`, plus component colour audit

> Two deliverables came out of this: `tokens.scss` and `theme.dart` (task 1.1.10). This document records what the code revealed that the screenshots could not.

---

## 1. There is no design system in the code

`styles/theme.css` is **stock shadcn/ui defaults, untouched.** Its `--primary` is `#030213` — near-black navy. **There is no maroon anywhere in it.**

Every colour you see in the mobile app is hardcoded in individual components. The audit found:

| Value | Uses | Family |
|---|---|---|
| `#6b0f1a` | 7 | maroon — the de facto brand primary |
| `#3a0509` | 5 | maroon |
| `#2a0408` | 5 | maroon |
| `#8b1a26` | 2 | maroon |
| `#7a1520` | 2 | maroon |
| `#5a0d17` | 1 | maroon |
| `#2196f3` | 4 | back-office blue |
| `#1a1d2e`, `#1a2035` | 4 | back-office sidebar navy |

**Six near-identical maroons and two unrelated palettes.** The visual consistency in the mockups is coincidence, not system — which is exactly why a token file is worth the six hours, and why every developer and agent must be forbidden from writing a literal colour.

`tokens.scss` and `theme.dart` rationalise these into one 50–900 maroon scale plus a back-office blue scale. Values are marked **OBSERVED** (found in the code) or **DERIVED** (interpolated to complete the scale) so you can approve or replace the derived ones.

### One accessibility failure to fix

**`#2196f3` has a contrast ratio of 3.12:1 against white.** WCAG AA requires 4.50:1 for normal text. Any body text, link or small label in that blue **fails**. The token file keeps `$blue-500` for large headers and filled buttons, and adds `$blue-700: #1565c0` (5.75:1) for text.

The maroon family is fine — `#6b0f1a` is 12.29:1 on white, and even the lightest, `#8b1a26`, is 9.24:1.

**Revise task 1.1.10 from 6h to 12h.** It isn't "read the token file" — it's audit the components, define the scale, fix the blue, and replace every literal.

---

## 2. `shared-models.ts` vs the documented schema

The file is well commented and says *"when Supabase is connected these map 1-to-1 with database rows."* Mostly they can. Six places they shouldn't.

### Confirmed — no change needed

| Model | Matches |
|---|---|
| `ApprovalRequest.changes: Record<string, {old, new}>` | **`submission.diff`, exactly.** Independent arrival at the same shape |
| `ParishContact` / `PastoralTeamMember` | `parish_contact` with `contact_group` |
| `ParishActivity.time` as free text (`"First Thursday/Friday"`) | `parish_activity.schedule_text` — vindicates not structuring it |
| `GalleryAlbum` | `parish_gallery_album` |
| `PsalmEntry.stanzas: string[]` | `psalm_stanza` |
| `ReadingEntry` (heading / ref / title / text / closing) | `reading.heading` / `intro_line` / `title` / `body_html` / `closing_line` |
| `VestmentColor` including `Gold` | the extended enum |
| `entranceAntiphon`, `collect`, `prayerAfterCommunion` | `mass_proper` |

### Must change

**2.1 `MassTimes` loses information the product needs.**

```ts
sundayMasses: string[];                             // ["6:30am", "8:45am"]
weekdayMasses: { day: string; times: string[] }[];  // day: "Mon & Fri", "Mon–Fri"
```

Three problems. There is **nowhere to record language** — and Nigeria has Igbo, Yoruba, Latin and English Masses at the same parish; `mass_schedule.language` exists for exactly this. There is **no vigil distinction**, so a Saturday 6:30pm Mass that fulfils the Sunday obligation is filed under weekdays and users miss it. And `day: "Mon & Fri"` is **unparseable free text**, so "Mass starting near me soon" can never be built.

**Keep the normalised `mass_schedule` table.** The grouped Sunday / weekday / holy-day layout is a *presentation* concern — render it over normalised rows.

**2.2 `LiturgyType` conflates three orthogonal concepts.**

```ts
type LiturgyType = 'Ordinary Time' | 'Memorial' | 'Feast Day'
                 | 'Solemnity' | 'Sunday' | 'Weekday';
```

That mixes **season** (Ordinary Time), **rank** (Memorial / Feast / Solemnity) and **day type** (Sunday / Weekday) into one field. They vary independently — a Sunday can be a Solemnity in Ordinary Time, and this enum forces you to pick one and lose the others.

Keep them separate, as Doc 2 does: `liturgical_day.season`, `celebration.rank`, `reading_set.mass_type`.

**2.3 `GalleryAlbum.images: string[]` — "array of base64 or URLs".**

Base64 images must never reach the database. It would bloat every sync payload, defeat CDN caching, and make the mobile SQLite file enormous. Images are `media_asset` rows with R2 object keys.

**2.4 `Parish.archdiocese: string` and hardcoded hierarchy constants.**

`COUNTRIES`, `ARCHDIOCESES` and `DEANERIES` are hardcoded objects listing seven Nigerian archdioceses. Nigeria has around 60 dioceses. These must be foreign keys to the `country` → `ecclesiastical_province` → `diocese` → `deanery` tables and load from the API.

Worth noting: the constants already include Ghana, Kenya, Uganda, South Africa, the US and the UK — which vindicates the country-aware schema, and reinforces hiding the country filter until more than one country is published.

**2.5 `latitude`/`longitude` as strings.**

Must be `geography(Point, 4326)` with a GIST index, or "nearest parish" is a full table scan.

**2.6 No outstation concept.**

There is no `parentParishId`. Outstations are central in rural Nigeria and are why `parish.parent_parish_id` and `parish.type` exist.

---

## 3. The mock reading is more dangerous than obviously-wrong data

`MOCK_READINGS[0]` is dated **2026-02-26**, labelled `liturgyType: 'Sunday'`, `dayTitle: 'Second Sunday of Lent'`.

- **26 February 2026 is a Thursday.**
- Easter 2026 falls on 5 April, so Ash Wednesday is 18 February and the **Second Sunday of Lent 2026 is 1 March**.
- The readings given (Gen 15:5-12, 17-18 · Ps 27 · Phil 3:17–4:1 · **Lk** 9:28b-36) are the **Year C** set. Advent 2025 began **Year A**, so 2026's Second Sunday of Lent is Gen 12:1-4a · Ps 33 · 2 Tim 1:8b-10 · **Mt** 17:1-9.
- The acclamation cites **Matthew 17:5** while the Gospel is **Luke 9** — internally inconsistent.
- The psalm text ("The LORD is my light and my salvation") is **NABRE**, the US translation — not the Jerusalem Bible lectionary Nigeria uses.

Every one of those is individually plausible. That is precisely what makes it hazardous: it will pass a casual review, and an agent asked to "seed the database" will use it. **Delete `MOCK_READINGS`, `MOCK_PARISHES`, `MOCK_USERS` and `MOCK_APPROVALS` before this code goes into any repo an agent can read.**

---

## 4. Components with no screenshots yet

Present in the code, absent from what I reviewed in Doc 4:

**Contributor flows — Phase 2, already designed:** `UpdateParishInfo`, `UpdateMassTimes`, `UpdateParishContacts`, `UpdateChurchActivities`, `UpdateChurchAnnouncements`, `AddGalleryPhotos`.

**Content modules — Phase 3–5 in the plan, but UI already exists:** `AudioPrayers`, `ChurchHistory`, `ChurchTrivia`, `HymnBook`, `OrderOfMass`, `QuestionsCatholicsAsk`, `DivineMercy`, `SupportPage`.

Two things follow. The phase plan may be worth re-sequencing where UI already exists — building is cheaper when design is done. And **`AppSettings.tsx` is 39 KB**, which suggests far more notification granularity than assumed; check whether it hardcodes the toggle list, because task 1.6.4 requires those to be server-driven `notification_topic` rows.

**`imports/confession-guide.md` and `rosary-prayers.md` are real content**, not design — seed data for `content_collection`, and the only material in that folder worth keeping long-term.

---

## 5. Actions

| # | Action | Where |
|---|---|---|
| 1 | Adopt `tokens.scss` + `theme.dart`; approve or replace the DERIVED values | Both repos |
| 2 | Replace `#2196f3` with `$blue-700` for all text and links | Back office |
| 3 | Revise task 1.1.10 from 6h → 12h | Doc 2 |
| 4 | **Delete all `MOCK_*` constants** before the code reaches any repo | design-reference |
| 5 | Keep normalised `mass_schedule`; render the grouped view over it | Doc 2 B1 |
| 6 | Split `LiturgyType` into season / rank / mass_type | Doc 2 B2 |
| 7 | Hierarchy from the API, never hardcoded constants | Both |
| 8 | Extract `imports/*.md` as content seed data | Platform `seed/` |
| 9 | Audit `AppSettings.tsx` for hardcoded notification toggles | Doc 2 task 1.6.4 |
| 10 | Confirm outstation support in the parish form | Doc 4 §6 |
