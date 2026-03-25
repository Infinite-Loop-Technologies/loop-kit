# Sleek Tech Stack

Fast-prototyping, high-performance startup stack.

## Core Stack

- Desktop shell: [ElectroBun docs](https://blackboard.sh/electrobun/docs/llms.txt)
- Web app loaded into desktop shell by URL: Next.js, but in PWA mode so it can work as a PWA on IOS, and perhaps can get caching/local benefits in ElectroBun. [Next.js docs](https://nextjs.org/docs/llms.txt)
- App data and default auth path: InstantDB
- Billing: Polar
- UI system: [packages/ui/README.md](../../../packages/ui/README.md)
- State/runtime ideas: [packages/graphite/README.md](../../../packages/graphite/README.md) and [packages/graphite-core/README.md](../../../packages/graphite-core/README.md)
- Web deployment: Vercel

## Notes

- Clerk is optional if InstantDB auth is not enough.
- Use Velopack plus Azure Code Signing only if ElectroBun's installer or update story is not good enough.
- InstantDB has good blob storage, but Vercel Blob is a viable alternative.

## Usage Guide

- Make use of the installed InstantDB skills in `.agents\skills\instantdb`, and use the InstantDB MCP server.

## TODO

- Decide what the backend should be.
- Add an OpenTelemetry plan.

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
