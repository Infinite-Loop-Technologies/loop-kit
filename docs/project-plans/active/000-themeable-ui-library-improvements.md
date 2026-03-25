# Themeable UI Library Improvements

## Desired Outcome

I want an extremely themeable UI library. We already have a start to this in `packages/ui`, but it needs to become a cleaner, more configurable system that can power Forge directly instead of acting like a demo-only theme layer.

The active direction is:

- treat skins/theme packs as data-first bundles
- keep everything token-driven by default
- allow theme packs to override primitives like `Panel`, `Text`, `Button`, and `Link`
- support swappable icon registries and asset packs
- make Dock work cleanly inside the new Forge Next.js prototype, not just inside `apps/ui-demo`

I specifically want example theme packs during this plan that show off:

- textured panels with 9-slice borders and richer ornament
- a liquid glass UI direction
- a neobrutalism high-contrast direction with vector-shape attitude
- a dark grey slate glowing direction in the Vercel-adjacent family

I also want this UI library to be retargettable. What I mean is, I want it to be built out of primitives like `<Panel>` and `<Text>` and more. Then, I want the ability to swap those out with something else - not just a completely different component with different style. But a different UI rendering solution. For example, Ink in a TUI. This is not the first priority for this library.

I also want this library to have fantastic state management using an special intent->state system inspired by this article: <https://acko.net/blog/i-is-for-intent/>
In fact, that is why Graphite exists, that's exactly what it's for.

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
