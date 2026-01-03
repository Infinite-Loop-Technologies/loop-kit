import { Provider } from './provider';
import { CapabilityRequest } from './capability';

export class ProviderRegistry {
    private providers = new Map<string, Provider>();
    private capabilityMap = new Map<string, string>(); // capability → providerId

    register(provider: Provider, capabilities: string[]) {
        this.providers.set(provider.id, provider);
        for (const cap of capabilities) {
            this.capabilityMap.set(cap, provider.id);
        }
    }

    async dispatch(req: CapabilityRequest) {
        const providerId = this.capabilityMap.get(req.capability);
        if (!providerId) {
            throw new Error(`No provider for capability: ${req.capability}`);
        }

        const provider = this.providers.get(providerId)!;
        return provider.handle(req);
    }

    async shutdown() {
        for (const p of this.providers.values()) {
            await p.dispose();
        }
    }
}
