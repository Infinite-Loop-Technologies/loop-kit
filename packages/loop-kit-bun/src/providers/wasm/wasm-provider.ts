// providers/wasm/wasm-provider.ts
// providers/wasm/wasm-provider.ts
import type { Provider } from '../../runtime/provider';
import { ProviderTier } from '../../runtime/tiers';

export class WasmProvider implements Provider {
    readonly tier = ProviderTier.Wasm;

    constructor(public readonly id: string, private componentPath: string) {}

    async init() {
        // later: Wasmtime + WIT
    }

    async handle(req: any) {
        return { ok: true, value: null };
    }

    async dispose() {}
}
