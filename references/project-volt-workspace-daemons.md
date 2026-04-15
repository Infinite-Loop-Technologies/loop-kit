# Volt Workspace Daemons

Volt currently uses a daemon-per-workspace-root model.

## Decision

- A Volt daemon is scoped to one workspace root.
- Multiple daemons can run at once if they belong to different workspace roots.
- The daemon state must carry explicit workspace metadata so tooling can tell them apart.

## Why

- The repo already has multiple Volt-enabled apps and demos.
- Users may open more than one checkout of the repo, or other projects using Volt.
- A single global daemon would be ambiguous and brittle.
- Workspace-local state keeps watcher ownership and invalidation bounded.

## Required State

The daemon should expose:

- `workspace.id`
- `workspace.name`
- `workspace.rootDir`
- `configs`
- `pid`
- `status`
- `mode`
- `resources`

## Operational Rule

Daemon start/stop/status tooling should always refer to the current workspace root, not a global singleton.

## UX Implication

TUI and MCP surfaces should label state by workspace identity, especially once Volt can manage multiple projects or multiple repo checkouts in one shell session.
