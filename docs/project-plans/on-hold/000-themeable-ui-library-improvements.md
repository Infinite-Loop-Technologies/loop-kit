# Themeable UI Library Improvements

## Desired Outcome

I want an extremely themeable UI library. We already have a start to this in `packages/ui`. There are some nice components, and a very basic themeability design token system. But it is not enough! I want the ability to create themes and switch them at runtime, drastically changing the look. I specifically want to create example themes during this execution plan that show off a liquid glass UI effect, a neobrutalism effect with animations, bright colors, and contrast - and a dark grey slate glowing theme. Each of those themes should make heavy usage of interesting effects, animations, textured backgrounds, 9-slice borders even, and perhaps even Rive, which lets you embed interactive animations: <https://rive.app/docs/getting-started/introduction>.

I also want this UI library to be retargettable. What I mean is, I want it to be built out of primitives like `<Panel>` and `<Text>` and more. Then, I want the ability to swap those out with something else - not just a completely different component with different style. But a different UI rendering solution. For example, Ink in a TUI. This is not the first priority for this library.

I also want this library to have fantastic state management using an special intent->state system inspired by this article: <https://acko.net/blog/i-is-for-intent/>
In fact, that is why Graphite exists, that's exactly what it's for.

## Backlinks

<!-- markdown-backlinks:start -->
- None.
<!-- markdown-backlinks:end -->
