# HUMAN_INBOX.md

- Put only explicit human-facing asks, setup steps, decisions, or answers needed from the user here.
- Use markdown checkboxes for actionable human tasks.
- Add categories when useful.
- End each actionable item with a follow-up note in parentheses, for example: `(followup: message me "I set the env vars; wire up the next step.")`
- When a checklist item is blocked on the human, note the blocker on that checklist item too.
- Clear resolved items instead of letting them accumulate.

## Workflow / Repo Policy

- [ ] Decide whether this repo should have a real shared `dev` branch on GitHub or whether the docs should be simplified to a `main` plus short-lived feature branch workflow. The current docs say `dev` is the integration branch, but the remote only exposes `main` and older feature branches. (followup: message me "I decided the shared integration branch policy: ...")

## Auth / Environment

- [ ] Fill in `apps/forge/.env.example` locally with `INSTANT_APP_ID` and `INSTANT_ADMIN_TOKEN` when you want Forge auth and workspace bootstrap to work end-to-end. (followup: message me "I set the Forge InstantDB env vars; wire up the workspace flow.")
- [ ] Decide whether Forge auth should center on InstantDB magic-code, Clerk via `apps/platform-api`, or an explicit hybrid. The current codebase points in multiple directions. (followup: message me "Use <chosen auth direction>; align Forge and platform-api around it.")
- [ ] If `apps/platform-api` auth routes should run locally, set `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. (followup: message me "I set the Clerk env vars; finish wiring platform-api auth.")
