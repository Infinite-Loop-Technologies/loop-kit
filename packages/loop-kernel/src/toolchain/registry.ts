import type { ToolchainAdapter } from '../providers/capabilities/toolchain.js';

export class ToolchainRegistry {
    private readonly adapters = new Map<string, ToolchainAdapter>();

    register(adapter: ToolchainAdapter): void {
        this.adapters.set(adapter.id, adapter);
    }

    get(id: string): ToolchainAdapter | undefined {
        return this.adapters.get(id);
    }

    list(): ToolchainAdapter[] {
        return Array.from(this.adapters.values());
    }
}
