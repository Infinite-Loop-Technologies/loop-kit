---
name: project-bootstrap
description: Initialize project context at the start of work by setting up Engram memory, checking CKB/code-intelligence health, gathering lightweight repo status, and capturing durable project notes. Use when beginning work in a repository, resuming an existing codebase after time away, verifying memory/tooling is available, or when a user asks to initialize project context, bootstrap repo health checks, or save durable project direction.
---

# Project Bootstrap

Bootstrap project context with the smallest useful set of checks and durable notes. Prefer this skill when starting or resuming work so later implementation is grounded in memory, repository status, and available code-intelligence tooling.

## Workflow

1. Start or continue a memory session when the task is substantial.
2. Save the user prompt if it establishes durable goals or constraints.
3. Search Engram for existing project context before doing major work.
4. Check CKB health with `mcp__ckb__getStatus`.
5. Gather only lightweight repo context that helps execution:
   - repository root or working directory
   - `git status --short` when git context matters
   - key package manager or verification commands when the repo documents them
6. Record durable architecture, decision, workflow, or debugging notes back into Engram when new information appears.
7. End the memory session with a short summary if you opened one for the task.

## Default Checks

Run these in order unless the user asked for something narrower:

1. Memory:
   - `mem_session_start`
   - `mem_save_prompt`
   - `mem_search` for architecture, decisions, conventions, known bugs, commands, and scripts
2. Code intelligence:
   - `ckb.getStatus`
   - if unavailable, report the concrete blocker such as missing index or LSP setup
3. Repo shape:
   - inspect the local `AGENTS.md` or equivalent repo instructions if present
   - read only the relevant sections
4. Verification guidance:
   - identify the documented fast verification commands
   - do not run broad verification unless it is useful for the task

## Memory Rules

Save durable notes when you learn something likely to matter in future sessions:

- architectural boundaries
- trust or security constraints
- build, test, release, or local-dev workflows
- recurring bugs or root causes
- naming or package conventions
- roadmap priorities that change implementation choices

Use concise, factual memory entries with `What`, `Why`, `Where`, and `Learned`.

## Reporting

When reporting bootstrap results to the user, include:

- whether memory was initialized or updated
- whether CKB is healthy and, if not, the concrete remediation
- any key repo instructions or constraints discovered
- any durable notes saved
- the next useful action

## Failure Handling

If a skill, tool, or server expected in the workflow is broken:

- diagnose it concretely
- fix it when the repair is local and reasonably scoped
- otherwise tell the user exactly what is broken and what command or config is needed
- do not silently skip a broken skill that should be working

## Example Prompt

`Use $project-bootstrap to initialize memory, check CKB and repo health, and save any durable project context before we start implementation.`

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
