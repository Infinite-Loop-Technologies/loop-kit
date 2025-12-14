# Repository Guidelines

## Loop-kit Doctrine (read first)

-   Audience is expert: keep com munication terse, actionable, and avoid restating obvious context.
-   Components-first: WASM components are the default unit; native components are allowed when practical. Shared components should run on both client and server when possible.
-   Capabilities are central: WASI is only a baseline. loop-kit needs richer caps (UI/DOM, GPU/WebGPU, data/storage, FS/net/IO/logging, fibers). Providers may be WASM, native libs, or host executables; capability proxies across hosts are expected.
-   Hosts/transports: immediate path is a local Wasmtime host CLI; wRPC/wasmCloud/OCI is legacy/backlog and should remain modular for future reuse. Interop and portability outweigh lock-in.
-   Tooling philosophy: keep the shipped CLI minimal (bootstrap/run) while bootstrapping a Rust host CLI crate for experiments. Workspaces are expected to ship their own CLIs/IDEs/editors; loop-kit is SDKs, protocols, and bootstrap tools, not a monolithic runtime.
-   Near-term focus: local tooling + runnable WASM component examples; the site is not a priority until the host/tooling loop is solid.
-   Platform vision: loop cloud is a managed + self-hostable registry/code platform with loop-native source control and Git as a sidecar. Dogfood everything; examples must be functional starter kits, not toy demos. Favor incremental migration for existing stacks.
-   Systems mindset: lean into the reactive incremental effect/fiber runtime (UseGPU/React-inspired) and incremental dataflow for state sync, rollback, and optimistic flows. Optimize for reusability, composability, and low-latency multiplayer scenarios.

## Agent role

-   Act as a research assistant: keep track of open questions, surface tradeoffs, and link to knowledge file s.
-   Consult and update the knowledge base when relevant:
    -   JS engine benchmarking: `knowledge/js-engines-benchmarking.md`
    -   Capability providers and transports: `knowledge/capabilities-runtime.md`
    -   Benchmark plan: `benchmarks/README.md` and `benchmarks/runtime-matrix.md`
-   Note open loops and next actions in those files instead of leaving them only in chat.

## Project Structure & Module Organization

-   Monorepo managed by `pnpm`. Root scripts fan out with `pnpm -r ...`.
-   `packages/cli`: Ink-based TypeScript CLI (`src/`, built to `dist/` via tsdown).
-   `packages/registry`: Shared TypeScript registry library consumed by the CLI and site (`src/`, output in `dist/`).
-   `packages/site`: Next.js app for the registry UI; uses Tailwind tooling and extensive component libs.
-   Workspace config lives in `.vscode/`, `.idea/`, and shared lockfiles (`pnpm-lock.yaml` at root and per package).

## Build, Test, and Development Commands

-   Install deps once: `pnpm install`.
-   Build everything: `pnpm build` (runs `pnpm -r build` across all packages).
-   CLI dev loop: `pnpm --filter @loop/cli dev` (watches and rebuilds `packages/cli`).
-   Registry library dev: `pnpm --filter @loop-kit/registry dev`.
-   Site dev server: `pnpm --filter registry dev` (Next.js, defaults to Turbopack).
-   Site lint: `pnpm --filter registry lint`.
-   Release scripts: `pnpm release:patch` or `pnpm release:minor` (publishes workspaces; ensure you are authenticated first).

## Coding Style & Naming Conventions

-   TypeScript-first, ESM modules. Keep strict typing; favor explicit return types for public APIs.
-   React components: PascalCase filenames/exports; hooks start with `use...`; utility modules in camelCase.
-   Prefer functional components and composition over inhe ritance; keep side effects in hooks.
-   Align spacing with existing files (2-space indents in manifests/configs).
-   Run `pnpm --filter registry lint` before committing site changes; mirror existing tsdown configs for CLI and registry builds.

## Testing Guidelines

-   No dedicated automated test suite yet; rely on `lint` plus manual verification.
-   For CLI changes: `pnpm --filter @loop/cli build` then `node packages/cli/dist/index.js ...` to smoke test commands.
-   For site changes: exercise key flows in the dev server (forms, drag-and-drop, editor interactions) and check console output for warnings.
-   When adding tests, co-locate with sources using `.test.ts(x)` naming; prefer lightweight runners (Vitest/Jest) consistent with package needs.

## Commit & Pull Request Guidelines

-   Commit messages: imperative and scoped (e.g., `feat(cli): add bundle subcommand`, `chore(site): update deps`). Conventional style is encouraged.
-   Pull requests: concise summary, linked issue if applicable, and screenshots/GIFs for UI-visible changes.
-   Note any new commands, environment variables, or migration steps in the PR description.
-   Ensure `pnpm build` and package-specific lints pass before requesting review.

## Security & Configuration Tips

-   Do not commit secrets; prefer `.env.local` for site runtime config and keep it out of version control.
-   Lockfiles are committed; avoid hand-editing them—rerun `pnpm install` to refresh.
-   When publishing, confirm versions and tags carefully; releases propagate to all public workspaces.
