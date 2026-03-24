# Sleek Tech Stack

Fast-prototyping, high-performance startup stack.

## Core Stack

- Desktop shell: [ElectroBun docs](https://blackboard.sh/electrobun/docs/llms.txt)
- Web app loaded into desktop shell by URL: Next.js
- App data and default auth path: [InstantDB docs](https://www.instantdb.com/llms.txt)
- Billing: Polar
- UI system: [packages/ui/README.md](../../../packages/ui/README.md)
- State/runtime ideas: [packages/graphite/README.md](../../../packages/graphite/README.md) and [packages/graphite-core/README.md](../../../packages/graphite-core/README.md)
- Web deployment: Vercel

## Notes

- Clerk is optional if InstantDB auth is not enough.
- Use Velopack plus Azure Code Signing only if ElectroBun's installer or update story is not good enough.

## TODO

- Decide what the backend should be.
- Add an OpenTelemetry plan.

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
