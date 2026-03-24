# Registry Client And Cache Package

## Outcome

Define the dedicated client layer that owns OCI reference handling, transfer behavior, local cache access, and Loop-specific registry metadata instead of leaking registry concerns across the host and CLI.

## Links

- Project plan: [../../project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
- Support material: [../../ref/loop-kit-fundamentals/oci-registry-and-client.md](../../ref/loop-kit-fundamentals/oci-registry-and-client.md)
- Support material: [../../ref/loop-kit-fundamentals/host-kernel-boundaries.md](../../ref/loop-kit-fundamentals/host-kernel-boundaries.md)

## Next Actions

- Propose the first package split for the registry client, cache manager, and metadata translation layer.
- Define reference normalization, auth hooks, digest verification, and resumable transfer behavior.
- Define how the host and CLI consume the client without re-embedding registry logic.
- Define what persistent cache metadata needs to exist for installs, executions, and inspection tooling.

## Notes

- A custom client is expected here. Avoid pretending a general-purpose OCI SDK will answer all of Loop's UX and metadata needs by itself.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/active/003-loop-refactor.md](../../project-plans/active/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
