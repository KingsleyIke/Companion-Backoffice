# Back-office design references

Drop the back-office screenshots here, **named after the screen**. The filename is how you point an agent at a specific design:

> `Read docs/design/back-office/parishes-add.png and implement task 1.2.2.`

Expected files:

```
login.png
dashboard.png
users-all.png
users-create.png
readings-list.png
readings-add.png
readings-edit.png
parishes-list.png
parishes-add.png
approvals.png
settings.png
```

`Screenshot 2026-08-17 at 14.32.11.png` is useless for this. Rename them.

---

## Screens that do not exist yet

Doc 4 §5.2 lists the missing import surface — **the largest design gap in the project**, roughly 40% of milestone 1.3:

- Ordo → Import
- Readings → Bulk Upload
- Parishes → Bulk Import
- Import History (with rollback)
- Readings → Verification Queue
- Rollout Console

Also missing: the restructured user screens (Doc 4 §5.1), since `admin_user` and `app_user` are separate tables.

---

## Do not put the Figma React code in this repo

It lives in its own repo or a local folder. NX will otherwise try to lint and build it. See Doc 5 §2.

**Before that code goes anywhere an agent can read it, delete every `MOCK_*` constant from `shared-models.ts`.** Doc 6 §3 explains why: the mock reading is dated to a Thursday but labelled Sunday, carries Year C readings for a Year A date, and uses the US translation rather than the Nigerian lectionary. It is plausible enough to survive review and wrong enough to matter.
