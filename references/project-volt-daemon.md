# Volt Daemon

The daemon remains part of Volt because shared local state, watchers, and owned runtime resources are part of the product.

## What The Daemon Is For

- workspace-scoped watchers
- affected-task invalidation
- integration refresh
- shared status for runtime resources
- owned task/flow/session lifecycle
- structured state that a dashboard or future agent surface can consume

## What The Daemon Is Not For

- replacing `volt dev`
- hiding process ownership
- inventing a magical background platform
- pretending durable workflows are solved just because local session state exists

## Current Guarantees

- one managed workspace daemon per workspace root
- multiple workspace daemons can exist at once when the user is working in multiple cloned or nested workspaces
- explicit pid, state, and log files under `.volt/daemon/`
- clean shutdown on `SIGINT` and `SIGTERM`
- daemon-managed resources are stopped during shutdown
- changed files and affected tasks are persisted in daemon state
- no orphaned daemon-owned watcher/resource processes by design

## State Model

Current daemon state is centered on:

- workspace identity metadata
- managed configs
- workspace mode
- resource snapshots
- recent changed files
- affected task names
- per-config status

Important paths:

- `.volt/daemon/workspace.pid`
- `.volt/daemon/workspace.log`
- `.volt/daemon/workspace.json`
- `.volt/daemon/workspace.snapshot`

Workspace identity should be explicit in daemon state so future multi-workspace UX can distinguish:

- workspace name
- workspace ID
- workspace root path
- managed config set

## Watch And Invalidations

The daemon now uses `@parcel/watcher` for:

- recursive workspace watching
- throttled/coalesced file events
- `writeSnapshot(...)`
- `getEventsSince(...)`
- ignore patterns for `.git`, `.volt`, `node_modules`, and build output

The affected-task layer is intentionally lightweight:

- explicit task `inputs`
- explicit task `watch`
- explicit dependencies
- no remote cache
- no giant inferred graph

When the daemon sees relevant changes it:

1. computes affected tasks per project
2. records recent changed files
3. refreshes affected artifacts/integrations where relevant
4. updates workspace state for dashboards and future tooling

## Resource Ownership

Daemon resources should be thought of as runtime handles, not ad hoc subprocesses.

Each handle should expose:

- `status()`
- `logs()`
- `events()`
- `wait()`
- `stop()`

That is the contract the experimental dashboard consumes.

## Dashboard

`volt dashboard` is intentionally experimental, but it is now the current keyboard-first OpenTUI surface for daemon state.

Its job is to prove that Volt’s daemon state is structured enough for:

- multiple resource panes
- per-resource lifecycle status
- recent logs
- recent invalidations
- lightweight task/resource inspection while other shell commands stay available
- future richer OpenTUI screens

The dashboard should stay a consumer of daemon state, not a second control plane.

Near-term CLI direction:

- move toward `volt` opening the interactive surface by default while explicit subcommands remain scriptable
- add daemon-backed task sessions before attempting true terminal multiplexing
- model `start`, `ps`, `attach`, and `stop` around daemon-owned handles instead of bolting process tables onto foreground-only commands
- make room for flow and future agent-workflow sessions in the same ownership model

## Relationship To Effect And Future Durable Workflows

Effect may help internally with cleanup and supervision, but the daemon should still look like Volt from the outside.

Future durable workflows can layer above the daemon.

Good split:

- daemon owns local watchers, resources, and shared workspace state
- future durable engine owns long waits, approvals, retries, and resumability

For agent workflows, the daemon should own the local session, logs, and live state even if a future durable engine owns resumability semantics.
