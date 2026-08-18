# Copy this into `catholic-platform`

Delete this file afterwards — it's instructions, not project documentation.

## What to copy

```
CLAUDE.md                                    → repo root
docs/                                        → repo root
apps/back-office/src/styles/tokens.scss      → once the Angular app is scaffolded
```

```bash
cd /path/to/catholic-platform
cp -R /path/to/catholic-platform/{CLAUDE.md,docs} .
git add CLAUDE.md docs/
git commit -m "docs: project specification, design references and agent instructions"
git push
```

`tokens.scss` has nowhere to live until `apps/back-office` exists (task 1.1.1). Hold it, or park it in `docs/` and move it later.

## What's here

| File | Purpose |
|---|---|
| **`CLAUDE.md`** | **Agent instructions. Read automatically before every task.** Stack, hard rules, liturgical traps, prohibitions |
| `docs/00-phased-plan.md` | Five phases, milestones, costs, risks |
| `docs/01-project-charter-and-tech-spec.md` | Architecture, conventions, per-process tooling, **§9 domain glossary** |
| `docs/02-work-breakdown-and-data-model.md` | **The main reference.** Every task with an ID and hours, full schema, API surface, sync strategy |
| `docs/03-day-one-setup-no-docker.md` | Accounts, toolchain, Supabase connection gotchas |
| `docs/04-ui-review-and-reconciliation.md` | Design review, decisions taken, missing screens, UI fixes |
| `docs/05-repo-setup-and-agent-prompting.md` | How to prompt the agent, with a cookbook |
| `docs/06-code-reconciliation.md` | What the Figma code revealed — token audit, schema mismatches |

## Then

1. **Add the back-office screenshots** to `docs/design/back-office/`, named after their screens. See the README there.
2. **Have the agent read `CLAUDE.md` and `docs/02` Part B, then summarise the reading tables and the verification gate.** If the summary is wrong, correct it before any code is written.
3. Start at task **1.1.1**. Doc 5 §5 has a day-by-day first week.

## Two things today that no agent can help with

- **Email the CBCN Secretariat** about Lectionary **and Missal** permission (task 0.1). This is the only item that can end the project, and it costs nothing to start.
- **Register the Google Play account**, $25 (task 0.5). Internal testing starts in week one; the closed-test track's 14-day clock should expire long before launch.
