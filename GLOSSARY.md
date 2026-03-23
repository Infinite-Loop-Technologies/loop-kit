# Glossary

## Vision
A repo-spanning strategic direction that can contain multiple project plans and many next actions.

## Project Plan
A large desired outcome with support material and linked next actions. Project plans should stay outcome-oriented.

## Next Action
An immediate executable unit of work stored under `docs/next-actions/`. It should be substantial enough for a focused session, but not broken down into tiny 2-minute chores.

## Agent Inbox
The durable async queue at `docs/agent-inbox/`. Humans, scripts, webhooks, and agents can drop new material here for future processing.

## Human Inbox
The handoff queue at `docs/human-inbox/` for work blocked on a person. When the human response is ready, it can be pushed back into the agent inbox.

## Emergency Scan
A fast pass over `docs/agent-inbox/` before pulling from active next actions. Urgent items get handled first; the rest are clarified into plans or next actions.

## Weekly Review
The recurring cleanup and reconciliation loop that processes inboxes, keeps plans and next actions aligned, and fixes stale repo knowledge.

## Workspace
The current repository as a working environment for code, docs, automation, and future Loop/Forge runtime surfaces.

## OCI Unit
A publishable artifact stored in an OCI registry. In the current vision, this can include wasm components, WIT packages, executables, DLLs, npm packages, Rust crates, containers, and related metadata.

## Capability Shape
An explicit interface boundary, typically described in WIT, that allows units to compose safely across implementation languages and runtime boundaries.

## Provider
A concrete capability implementation, whether built in, native, wasm-based, or exposed through an adapter boundary.

## Adapter
A bridge that makes a non-native boundary usable through the preferred capability model, for example wRPC over stdio to an executable.

## WIT
The WebAssembly Interface Type definitions that describe capability boundaries, imports, exports, and cross-language contracts.

## Patch Plan
A useful workflow concept for declarative changes, but no longer the intended center of the long-term platform architecture.

## Lane
A still-useful reference/distribution concept from earlier Loop work, but no longer the primary place to invest compared with OCI-backed artifact flows.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/next-actions/active/002-knowledge-workflow-hygiene.md](docs/next-actions/active/002-knowledge-workflow-hygiene.md)
<!-- markdown-backlinks:end -->
