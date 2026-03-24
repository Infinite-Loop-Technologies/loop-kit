# Local OCI Registry Modes And Auth

## Outcome

Lock the first registry posture down so implementation work stops stalling on vague registry questions.

## Links

- Project plan: [../../project-plans/on-hold/003-loop-refactor.md](../../project-plans/on-hold/003-loop-refactor.md)
- Vision: [../../visions/active/000-forge-local-oci-capability-platform.md](../../visions/active/000-forge-local-oci-capability-platform.md)
- Support material: [../../ref/loop-kit-fundamentals/oci-registry-and-client.md](../../ref/loop-kit-fundamentals/oci-registry-and-client.md)
- Experiment code: [../../../experiments/oci-lab/README.md](../../../experiments/oci-lab/README.md)

## Next Actions

- Keep `distribution/distribution:edge` as the baseline local registry for now.
- Use persistent mode for daily development and an ephemeral `--rm` mode for e2e.
- Document when localhost can stay anonymous and what hosted registry will be the first authenticated target.
- Decide the first credential source for hosted registries: Docker credential helpers, env vars, or both.

## Notes

- This should stay implementation-facing. The goal is not to invent a grand registry strategy before the client path works.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/on-hold/003-loop-refactor.md](../../project-plans/on-hold/003-loop-refactor.md)
<!-- markdown-backlinks:end -->
