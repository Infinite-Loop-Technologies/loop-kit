# WIT usage notes

-   Place types/records inside a world or interface; avoid loose package-level types. Keep shared types in the world and refer to them from inline interfaces.
-   Import existing packages with `use package:name@version` (e.g., `use wasi:clocks/monotonic@0.2.0`). Prefer reusing WASI worlds (CLI, filesystem, clocks, http/sockets) instead of inventing new ones.
-   Worlds should spell out imports/exports explicitly; avoid implicit host glue.
-   Validate early and often: `wasm-tools component wit validate wit/loop-core/world.wit`.
-   Compose packages with `wasm-tools component wit compose` and manage deps via `wit-deps` when graphs get larger.
-   WIT design overview: https://component-model.bytecodealliance.org/design/wit.html.
