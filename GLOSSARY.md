Node: A piece of addressable state in the host graph. Nodes are pure data. Nodes do not run code. They have IDs, properties, and edges.

Edge (Link)

A typed relationship between nodes. Example: `parent`, `contains`, `refersTo`, `owns`, `renders`, `binds`.

Facet

A marker that a node “participates in” some schema/role. A facet is a set of fields + invariants. Example: `loop.fs.Entry`, `pulse.browser.Tab`, `pulse.ui.Space`.

Capability

A callable contract (function(s) + types + semantics). Capabilities are identified by stable IDs and have schemas. WIT can define capabilities, but the host uses an internal Interface IR.

Provider

An implementation of one or more capabilities. Providers are code + manifest (what they implement, what they require, how they run).

Binding

A rule connecting a capability request in some scope to a specific provider implementation. Bindings are data (often nodes) and are resolved deterministically.

Scope

A boundary that determines bindings, permissions, and ambient handles. Scopes are usually represented as nodes (or derived from a path in the node graph).

Session

A runtime instance of a provider (or ingestor) running with specific scope/permissions/resources. Sessions have lifecycle (start/stop/restart) and own resources.

Ingestor

A long-lived provider that materializes and maintains a subgraph from an external source (filesystem watcher, browser tabs, HTTP indexer, git repo, etc.). “Spawns nodes” and keeps them fresh.

Resolver

The host component that answers: given (capability, target node, calling scope), which provider session should handle it?

Interface IR

Host’s internal representation of capability contracts (types, functions, semantics). WIT compiles into Interface IR; TS/JSON Schema/etc could too.

View

A provider implementing UI rendering capabilities. A view renders a node into UI IR for a given slot (main panel, sidebar row, inline widget).

UI IR

A host-controlled intermediate representation of UI (not raw React elements). Allows sandboxed/remote providers to render safely. Host maps UI IR -> React (loopcn/ui).

Space

A node that defines a projection over the graph (query/filter/sort/group), plus UI policy (default view, keymap scope, actions).

Command

A named user-invokable operation with a `when` predicate (context). Commands resolve to actions (capability invocations).

Intent

A semantic user goal (e.g. “move selection left”, “open item”, “rename node”). Intents are input-agnostic; keybindings/mouse/gestures produce intents.

Action

A concrete executable recipe, usually “call capability X with args Y,” optionally parameterized. Commands map to actions.

Projection

A derived view of the graph (tree, list, search results). Projections can be cached/incremental.
