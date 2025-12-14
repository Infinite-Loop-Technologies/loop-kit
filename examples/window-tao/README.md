# Window demo (Tao + pixels)

Goal: minimal native host that exposes `loop:window` (Tao/winit) and a `present-rgba` surface (pixels crate). A WASM component built with `cargo-component` calls the WIT APIs to open a window, pump events, and fill a buffer.

Status: scaffold only; host/component code not yet implemented.

Planned layout

-   `host/` (Rust): Wasmtime host linking `wit/loop-window` providers to Tao + pixels. Loads a component path from args.
-   `component/` (Rust via `cargo-component`): uses generated bindings for `loop:window` to create a window, request frames, handle events, and blit a color gradient.
-   `wit/` (optional): local copy of `loop-window` WIT for the component build (or use `wit-deps` to pull from the repo root).

Rough steps (when we implement)

1. Build component: `cargo component build -p window-demo-component`.
2. Run host against it: `cargo run -p window-demo-host -- target/component.wasm`.
3. See a window with a simple gradient and console-logged input events.

Notes

-   Targeting Windows first (Tao/winit defaults); swap pixels for wgpu later to exercise `loop:gfx`.
-   Input/events come via `next-event`; frame pacing via `request-frame`.
