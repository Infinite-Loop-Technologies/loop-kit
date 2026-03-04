# @loop-kit/loop-kernel

Library-first loop kernel runtime.

## Design

- No CLI I/O assumptions (no prompts, no terminal formatting, no `process.exit`)
- Structured results (`Result`, diagnostics, patch plans, graph model)
- Provider host for lane/patch/toolchain capabilities
- Deterministic patch executor with dry-run diff support
- Loop patch IR stays independent but leaves adapter seams for future Graphite integration

## Built-in v0 Capabilities

- Lanes: `local`, `file`, `git` stub, `http` stub
- Commands/services: init, doctor/fix, graph, new app/pkg, add/update/diff/extract, lane, toolchain
- Toolchain adapter: TypeScript

## Usage

```ts
import { createKernel } from '@loop-kit/loop-kernel';

const kernel = createKernel({ workspaceRoot: process.cwd() });
const doctor = await kernel.doctor();
if (doctor.ok) {
    console.log(doctor.value.diagnostics);
}
```

## Package Tasks

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
