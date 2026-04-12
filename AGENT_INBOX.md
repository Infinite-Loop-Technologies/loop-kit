# AGENT_INBOX.md

- Keep this as a capture list for future-relevant notes that are not part of the current slice yet.
- Process items quickly: toss, do, move to `CHECKLIST.md`, move to `HUMAN_INBOX.md`, or fold into `ARCHITECTURE.md` / `references/`.
- Do not move an item out of this file and then put the same note back here.
- If a capture becomes long, put the long-form note under `references/inbox/` with an obvious filename and link to it from here.

## Product / Architecture Captures

- `apps/platform-api` now shows up in the root docs, but its actual relationship to Forge and Volt is still unclear. Decide whether it is Forge's future backend, Volt-adjacent infrastructure, or a separate experiment.
- `volt.workspace.ts` currently coordinates only `demo`, `forge`, and `site`. `dock-demo`, `loom-demo`, and `platform-api` all live outside the workspace topology even though the repo increasingly talks about a shared runtime model. That split might be intentional, or it might be drift.
- Forge auth direction is currently split: `apps/forge/src/lib/forge-session.tsx` is using InstantDB magic-code auth and workspace bootstrap, while `apps/platform-api` is wired around Clerk-protected routes plus Workflow DevKit demos. This likely needs one explicit product decision instead of parallel partial implementations.
- The root scripts expose app-level dev commands, but there is still no clean "bring up the whole interesting local stack" command that includes whichever backend/auth/workflow surfaces Forge is supposed to depend on.

## Cleanup / Hygiene Captures

- The repo root is accumulating `.tmp-forge-*.log` files plus `.tmp-chrome-netlog.json`. A small Bun cleanup tool or a documented temp-artifact convention would prevent this from becoming background sludge.
- `examples/volt-jco-node-fetch-upstream` exists but is still effectively invisible from the top-level docs. Either document why it exists or decide whether it still deserves to live here.

## Automation / Ritual Ideas

- Add a "mind sweep" automation that scans `CHECKLIST.md`, inboxes, and `references/` filenames first, then writes idea captures into `AGENT_INBOX.md` without pretending they are ready-to-execute tasks.
- Add a periodic garbage-collection automation: prune stale branches, stale temp files, stale checklist items, and resolved human asks, then capture anything ambiguous instead of silently deleting it.
- Add an audit automation that does not fix code by default; it should inspect repo shape, validation pain, security/config smells, and documentation drift, then dump findings into `AGENT_INBOX.md` or `references/inbox/`.
- Consider a durable `references/repo-rituals.md` or similar if the prompt library grows into actual process guidance rather than just reusable automation prompts.
