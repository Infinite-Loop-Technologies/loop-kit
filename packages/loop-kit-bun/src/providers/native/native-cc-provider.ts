import { cc, FFIType } from 'bun:ffi';
import type {
    Provider,
    CapabilityRequest,
    CapabilityResponse,
} from '../../runtime/provider';
import { ProviderTier } from '../../runtime/tiers';
import type { CapabilityId } from '../../runtime/ids';
import type { BunFile } from 'bun';

export type CcSymbolSpec = Record<string, { args: any[]; returns: any }>;

export class NativeCcProvider implements Provider {
    readonly tier = ProviderTier.Native;
    private symbols: any;

    constructor(
        public readonly id: string,
        public readonly capabilities: ReadonlyArray<CapabilityId>,
        sourceFile: BunFile,
        symbols: CcSymbolSpec,
        private handler: (
            symbols: any,
            req: CapabilityRequest
        ) => CapabilityResponse | Promise<CapabilityResponse>
    ) {
        const out = cc({ source: sourceFile, symbols });
        this.symbols = out.symbols;
    }

    async init() {}
    async handle(req: CapabilityRequest) {
        return this.handler(this.symbols, req);
    }
    async dispose() {}
}
