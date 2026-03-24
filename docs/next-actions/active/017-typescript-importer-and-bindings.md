# TypeScript Importer And Bindings

## Outcome

Design the TypeScript-facing workflow that can recognize registry-backed imports, fetch the needed artifacts, and generate usable wrappers or bindings so Loop units feel local inside TS projects.

## Links

- Project plan: [../../project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- Support material: [../../ref/loop-kit-fundamentals/standard-surface-and-wit.md](../../ref/loop-kit-fundamentals/standard-surface-and-wit.md)
- Support material: [../../ref/loop-kit-fundamentals/workspace-and-automation.md](../../ref/loop-kit-fundamentals/workspace-and-automation.md)

## Next Actions

- Define the import syntax or reference conventions the watcher should recognize.
- Define when artifacts are fetched eagerly versus lazily.
- Define where generated wrappers, `.d.ts` files, and cache-backed shims should live.
- Define how WIT-to-TypeScript and TypeScript-to-WIT flows should relate instead of becoming two disconnected systems.

## Notes

- Prefer explicit generated outputs over spooky action at a distance.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
