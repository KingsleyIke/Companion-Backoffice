# Document 5 — Repo Setup & Driving the AI Agent

**Version:** 1.0 · August 2026

Your two repos exist. This document says where every file goes, and how to prompt an agent so it uses them.

---

## 1. What goes where

Both repos get a `CLAUDE.md` at the root and a `docs/` folder. **Docs are duplicated deliberately** — an agent working in the mobile repo cannot read files in the platform repo.

### `catholic-platform/`

```
CLAUDE.md                    ← from CLAUDE.platform.md, renamed
docs/
├── 01-project-charter-and-tech-spec.md
├── 02-work-breakdown-and-data-model.md
├── 03-day-one-setup-no-docker.md
├── 04-ui-review-and-reconciliation.md
├── 05-repo-setup-and-agent-prompting.md
├── phased-plan.md
└── design/
    └── back-office/
        ├── login.png
        ├── dashboard.png
        ├── users-all.png
        ├── users-create.png
        ├── readings-list.png
        ├── readings-add.png
        ├── readings-edit.png
        ├── parishes-list.png
        ├── parishes-add.png
        ├── approvals.png
        └── settings.png
```

### `catholic-mobile/`

```
CLAUDE.md                    ← from CLAUDE.mobile.md, renamed
docs/
├── 01-project-charter-and-tech-spec.md
├── 02-work-breakdown-and-data-model.md
├── 04-ui-review-and-reconciliation.md
├── 05-repo-setup-and-agent-prompting.md
└── design/
    └── mobile/
        ├── home.png
        ├── drawer.png
        ├── notifications-inbox.png
        ├── find-parish.png
        ├── parish-detail.png
        ├── gallery.png
        ├── become-contributor.png
        ├── daily-readings.png
        ├── calendar.png
        ├── prayers.png
        ├── rosary-prayers.png
        ├── rosary-mysteries.png
        ├── rosary-litany.png
        ├── stations-list.png
        ├── stations-detail.png
        └── benediction.png
```

**Name the images after the screen.** `home.png` is worth ten `Screenshot 2026-08-17 at 14.32.11.png`. The filename is how you point the agent at a screen.

### Commit

```bash
cd catholic-platform
mkdir -p docs/design/back-office
# copy files in, then:
git add CLAUDE.md docs/
git commit -m "docs: add project specification, design references and agent instructions"
git push
```

Same for `catholic-mobile` with `docs/design/mobile`.

> **If your agent isn't Claude Code**, rename the file: Cursor uses `.cursorrules`, and `AGENTS.md` is becoming a cross-tool convention. The content is identical — only the filename changes. Symlinking one to the other works fine.

---

## 2. The Figma React code

**Do not put it in either repo.** NX will try to lint and build anything in the workspace, and you'd be writing ignore rules for code with a finite life.

Third repo, `catholic-design-reference`, or just a local folder. Its only job is to be read once so an agent can extract:

1. **Design tokens** → `tokens.scss` (platform) and `theme.dart` (mobile). This is task **1.1.10** and where most of the value is.
2. **Per-screen layout specs** — hierarchy and component inventory, better than reading screenshots.
3. **Copy and icon inventory** — every string, already written.

Then it can be archived.

---

## 3. Prompting the agent

### The pattern that works

**Name the task ID. Name the doc. Name the design file. State the constraint.**

```
Implement task 1.2.9 (parish contacts + pastoral team).

Read docs/02-work-breakdown-and-data-model.md section B1 for the
parish_contact schema, and docs/design/back-office/parishes-add.png
for the form layout.

Note contact_group distinguishes the two repeaters in the design, and
is_public defaults to false. Write the migration, entity, DTOs,
controller, service and tests.
```

Compare with *"add parish contacts"* — which gets you a plausible table with the wrong shape, no `is_public`, and no migration.

### Rules of thumb

**Start every session with orientation.** Agents don't remember yesterday.

> `Read CLAUDE.md and docs/02-work-breakdown-and-data-model.md Part B. Summarise the reading-related tables and the verification gate before we start.`

If the summary is wrong, correct it before writing code.

**One task ID per session.** Doc 2's tasks are sized at 6–44 hours; that's still too big for one prompt. Break 1.3.4 (bulk upload, 44h) into parser → dry-run → error report → commit → rollback, each its own prompt.

**Ask for the plan before the code** on anything touching schema or sync:

> `Don't write code yet. Read task 1.4.3 and Doc 2 Part D, then propose the sync engine's structure — files, classes, order of work. I'll review before you implement.`

**Make it write tests in the same prompt.** Retrofitted tests test what the code does, not what it should do.

**Never let it invent liturgical data.** If a prompt needs a calendar or readings, the answer is always *import from the Ordo* or *ask*.

> Add to any content-related prompt: `If you need liturgical data, stop and ask. Do not generate feast days, dates or readings.`

**Review every migration by hand** before it runs. You have no local database to restore from.

### Two areas to understand line by line

Everything else can be reviewed loosely. These two, you must be able to debug alone at 11pm:

- **The Drift/Postgres schema**
- **The sync engine** (task 1.4.3)

The failure mode of agent-assisted development isn't bad code — it's 40,000 lines you can't debug when the sync engine drops a day's readings.

---

## 4. Prompt cookbook

Adapt these. Each assumes the agent has read `CLAUDE.md`.

**Foundations (1.1.4 — schema)**
> `Implement task 1.1.4. Read docs/02 Part B in full and create TypeORM entities for section B1 (church hierarchy) only. Every entity extends BaseEntity. Generate one migration. Do not run it — show it to me first.`

**Back-office screen (1.2.2 — parish CRUD)**
> `Implement task 1.2.2. Read docs/design/back-office/parishes-add.png and docs/02 section B1. Build the Angular form using the generated API client — do not hand-write HTTP calls. Note Doc 4 §6.1: replace the raw latitude/longitude inputs with a map picker.`

**Reading editor (1.3.3)**
> `Implement task 1.3.3. Read docs/design/back-office/readings-add.png and readings-edit.png, plus docs/02 section B2. The design shows one Liturgy Type per date — per Doc 4 §2 we add a Mass-set selector so Christmas and the Easter Vigil work. Include the verification state control (Draft → Proofread → Verified) which the design omits.`

**Mobile screen (1.4.7 — daily readings)**
> `Implement task 1.4.7. Read docs/design/mobile/daily-readings.png and docs/02 sections B2 and Part D. All data reads from Drift — no network calls in this screen. Include the font-size control (Doc 4 §6.14) and reserve a slot for the Phase 3 audio player.`

**Sync engine (1.4.3 — plan first)**
> `Read task 1.4.3, docs/02 Part D, and CLAUDE.md's offline-first section. Do not write code. Propose the structure: files, classes, order of work, and how you'll test the offline path. I'll review before you implement.`

**Design tokens (1.1.10)**
> `Read the design-reference React code. Extract every colour, spacing value, font size, weight, border radius and shadow into a single token set. Output tokens.scss and theme.dart. Flag any inconsistencies — the mobile app is maroon and the back office is blue, so tell me which values conflict.`

---

## 5. First week

| Day | Prompt target |
|---|---|
| 1 | Commit `CLAUDE.md` + `docs/` to both repos. Have the agent read them and summarise the stack, hard rules and verification gate. Correct anything wrong. |
| 2 | Task 1.1.1–1.1.3: NX scaffold, `BaseEntity`, typed config, TypeORM datasource against Supabase dev |
| 3 | Task 1.1.4 (B1 hierarchy only) + first migration. **Review by hand before running.** |
| 4 | Task 1.1.7: Swagger + client generation, then `GET /api/v1/dioceses` returning real rows |
| 5 | Back office lists dioceses via the **generated** client. Task 1.1.9: first build to the Play internal track. |

When day 5 works you've proven hosted Postgres, migrations, generated contracts, and the store pipeline. Everything after is repetition of a known-good pattern.

**Also on day 1, not in a repo:** email the CBCN Secretariat about Lectionary and Missal permission (task 0.1), and register the Google Play account (task 0.5). Both are calendar-time blockers no agent can accelerate.
