import type { CapabilityId } from './ids';
import type { Provider } from './provider';
import type { CapabilityRequest, CapabilityResponse } from './provider';

export class LoopRuntime {
    private providers = new Map<string, Provider>();
    private byCapability = new Map<CapabilityId, Provider>();

    async addProvider(provider: Provider): Promise<void> {
        if (this.providers.has(provider.id)) {
            throw new Error(`Provider already registered: ${provider.id}`);
        }
        await provider.init({ id: provider.id });
        this.providers.set(provider.id, provider);

        for (const cap of provider.capabilities) {
            // v0 policy: first-wins (keep it simple)
            if (!this.byCapability.has(cap))
                this.byCapability.set(cap, provider);
        }
    }

    async call(req: CapabilityRequest): Promise<CapabilityResponse> {
        const p = this.byCapability.get(req.capability);
        if (!p)
            return { ok: false, error: `No provider for ${req.capability}` };
        return p.handle(req);
    }

    async shutdown(): Promise<void> {
        for (const p of this.providers.values()) {
            await p.dispose();
        }
        this.providers.clear();
        this.byCapability.clear();
    }
}
