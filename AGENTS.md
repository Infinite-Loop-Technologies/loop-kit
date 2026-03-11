# AGENTS.md

## Purpose

This repository is the **loop-kit monorepo**. It contains the core loop-kit packages, shared tooling, supporting infrastructure, and **Forge**, the agentic development environment being built on top of loop-kit.

This repo is both **product code** and **platform code**. Changes here must optimize for:

- narrow, reviewable slices
- deterministic automation
- clear repository history
- explicit policy over implicit convention
- future migration flexibility

Agents working in this repository must preserve clarity, minimize blast radius, and avoid “helpful” scope creep.

---

## Non-negotiable rules

1. **Do not push directly to `main`.**
2. **Do not merge your own PRs into `main` unless explicitly instructed.**
3. **Prefer one issue or one coherent goal per branch.**
4. **Open Draft PRs early for work in progress.**
5. **Keep commits small, logical, and easy to review.**
6. **Do not mix unrelated refactors with the main task.**
7. **Do not expand scope unless you document why.**
8. **Run the relevant checks before asking for review.**
9. **Use feature flags for unfinished runtime behavior instead of long-lived hidden branches.**
10. **If blocked by missing context, state the constraint clearly instead of guessing.**

---

## Branching rules

Branch names should be narrow and descriptive.

Good examples:

- `feat/forge-preview-shell`
- `chore/ci-release-flow`
- `refactor/remove-nitric`

Avoid vague or oversized branch names such as:

- `new-forge`
- `big-refactor`
- `cleanup-everything`

Branch scope should match the actual unit of review. If the branch description stops being precise, the branch is probably too large.

---

## Pull request rules

- Default to a **Draft PR** first.
- Use Draft PRs for visibility, early CI, and incremental discussion.
- Mark a PR ready for review only when the slice is coherent.
- PR descriptions should include:
    - **purpose**
    - **scope**
    - **risks**
    - **linked issue(s)**
    - **rollout / feature-flag notes**
- Keep PRs focused. A reviewer should be able to explain the purpose of the PR in one or two sentences.

---

## CI rules

- PRs must pass the relevant **affected** checks.
- Production deployments must be **manual or tag-triggered only**.
- Do not change CI/CD behavior unless the task is explicitly about CI/CD.
- Do not weaken checks just to get a branch through.
- Prefer explicit scripts and task definitions over ad hoc CI logic.

---

## Deployment rules

- Preview deployments from PR workflows are allowed.
- Production deployments must go through the release workflow.
- Do not auto-enable unfinished user-facing behavior without an explicit flag or approval.
- Deployment automation must remain deliberate and inspectable.

---

## Refactor rules

- Separate **mechanical changes** from **behavioral changes** when practical.
- If a migration is large, split groundwork from behavior changes.
- Prefer extracting reusable groundwork first, then consuming it in follow-up changes.
- Do not hide structural rewrites inside feature work.

---

## Recovery rules

If a branch becomes messy, stop and summarize:

- what is safe
- what is risky
- what should be split
- what should be cherry-picked
- what should be discarded

Favor salvageable commits over forcing a giant merge. Preserve useful work, but restore reviewability.

---

## Human collaboration rules

- Link work to GitHub Issues whenever possible.
- Use Draft PRs to expose current state early.
- Leave concise notes when assumptions are made.
- When tradeoffs are introduced, document them clearly.
- Prefer clarity for the next human over cleverness for the current agent.

---

## Tooling posture

- The current repository direction is **Moonrepo + GitHub Actions**.
- Prefer explicit Moon tasks and repository scripts over orchestration sprawl.
- Do not introduce or reintroduce Dagger unless the task explicitly requires it.
- Local Git hooks may be used as guardrails, but they are not a replacement for CI or branch protection.

---

## Forge and loop-kit philosophy

This repository is moving toward stronger **policy-driven development**.

For now:

- **Git** is the storage and collaboration layer.
- **CI** is the enforcement layer.
- **Scripts, checks, and documented rules** are preferred over vague agent instructions.
- Future loop-kit and Forge semantics must be implemented through explicit tooling, policy, and code—not implied by prompts alone.

Agents should not pretend that future platform semantics already exist. If a rule is not enforced yet, either implement the enforcement or describe the gap plainly.

The goal is not just to make the repo pass today. The goal is to leave behind a system that remains understandable, enforceable, and evolvable.
