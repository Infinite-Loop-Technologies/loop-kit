# @loop-kit/loop-contracts

Shared loop wire contracts and schemas.

## Includes

- `loop.json` workspace schema
- `loop.component.json` and `loop.module.json` schemas
- Patch Plan IR and operation schemas
- Provider wire request/response schemas
- Ref parsing contracts (`local:`, `file:`, `git:`, `http(s):`, `loop://`, `npm:`)
- Result/diagnostic envelopes and lockfile schemas

## Usage

```ts
import {
    LoopWorkspaceConfigSchema,
    parseLoopRef,
} from '@loop-kit/loop-contracts';

const config = LoopWorkspaceConfigSchema.parse(rawConfig);
const ref = parseLoopRef('local:ui-button');
```

## Package Tasks

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
