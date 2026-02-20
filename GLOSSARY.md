## Graphite concepts

**Node** — A piece of addressable state in the Graphite graph. Nodes are pure data: they have IDs, properties, and edges. They do not run code.

**Edge (Link)** — A typed relationship between nodes. Examples: `parent`, `contains`, `refersTo`, `owns`.

**Intent** — A semantic user goal (e.g. "move selection left", "open item", "rename node"). Intents are input-agnostic; keybindings, mouse, and gestures all produce intents.

**Patch** — A description of a mutation to apply to the graph. Built using operators: `$set`, `$merge`, `$delete`, `$move`, `$link`, `$unlink`.

**Commit** — A finalized, applied patch recorded in history. Enables undo/redo.

**Projection** — A derived, cached view of the graph (tree, list, search results). Queries against the graph produce projections.

**Facet** — A marker that a node "participates in" some schema/role — a set of fields and invariants. Example: `loop.fs.Entry`, `loop.ui.Space`.

---

## Capability/host system (planned)

**Host** — A runtime environment that owns a Graphite graph and controls capability access. The first host will be a browser host. Hosts decide what capabilities modules can access.

**Capability** — A callable contract (functions + types + semantics) that a module can request from the host. Graphite itself is treated as a capability. Capabilities are identified by stable IDs.

**Module** — A sandboxed unit of code that runs inside a host. Modules are granted capabilities explicitly — they cannot access anything the host hasn't granted.

**Provider** — An implementation of one or more capabilities. Providers are registered with the host and resolved against requests from modules.

**Binding** — A rule connecting a capability request in a given scope to a specific provider. Bindings are data (often nodes) and resolve deterministically.

**Scope** — A boundary that determines which bindings and permissions apply. Scopes are usually represented as nodes or derived from a path in the node graph.

**Session** — A runtime instance of a provider running with specific scope/permissions/resources. Sessions have lifecycle (start/stop/restart) and own resources.

**Resolver** — The host component that answers: given (capability, target node, calling scope), which provider session should handle it?

---

## Component library concepts

**Block** — A full demo composition in the `registry/` directory. Analogous to blocks on the shadcn registry — larger, opinionated examples rather than single components.

**Registry** — The collection of components and blocks published via `shadcn build`. Currently uses the shadcn registry format; a first-party loop-kit registry is planned for the future.

---

## Future / planned

**loop-cloud** — Self-hostable (with a monetized offering) infrastructure for running loop-kit modules as long-running servers, hosting a Graphite sync server, and more.

**loop-kit CLI** — A new CLI for scaffolding and working with loop-kit projects (the previous CLI was removed).

**Ingestor** — A long-lived provider that materializes and maintains a subgraph from an external source (filesystem watcher, browser tabs, HTTP indexer, etc.).

**View** — A provider implementing UI rendering capabilities. Renders a node into a UI representation for a given slot (main panel, sidebar, inline widget).

**Space** — A node defining a projection over the graph (query/filter/sort/group) plus UI policy (default view, keymap scope, actions).

**Command** — A named, user-invokable operation with a `when` predicate (context). Commands resolve to capability invocations.

**Action** — A concrete executable recipe, usually "call capability X with args Y". Commands map to actions.
