import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
    err,
    ok,
    type LoopWorkspaceConfig,
    type Result,
} from '@loop-kit/loop-contracts';
import type { LaneProvider } from './capabilities/lane.js';
import type { PatchAdapter } from './capabilities/patchAdapter.js';
import type { ToolchainAdapter } from './capabilities/toolchain.js';
import { resolveModuleRef } from '../modules/resolve.js';

export class ProviderHost {
    private readonly laneProvidersByKind = new Map<string, LaneProvider>();
    private readonly patchAdapters = new Map<string, PatchAdapter>();
    private readonly toolchainAdapters = new Map<string, ToolchainAdapter>();

    registerLaneProvider(provider: LaneProvider): void {
        this.laneProvidersByKind.set(provider.kind, provider);
    }

    registerPatchAdapter(provider: PatchAdapter): void {
        this.patchAdapters.set(provider.id, provider);
    }

    registerToolchainAdapter(provider: ToolchainAdapter): void {
        this.toolchainAdapters.set(provider.id, provider);
    }

    getLaneProvider(id: string): LaneProvider | undefined {
        return this.getLaneProviderByKind(id);
    }

    getLaneProviderByKind(kind: string): LaneProvider | undefined {
        return this.laneProvidersByKind.get(kind);
    }

    getPatchAdapter(id: string): PatchAdapter | undefined {
        return this.patchAdapters.get(id);
    }

    getToolchainAdapter(id: string): ToolchainAdapter | undefined {
        return this.toolchainAdapters.get(id);
    }

    listLaneProviders(): LaneProvider[] {
        return Array.from(this.laneProvidersByKind.values());
    }

    listToolchainAdapters(): ToolchainAdapter[] {
        return Array.from(this.toolchainAdapters.values());
    }

    async loadEnabledModules(
        workspaceRoot: string,
        config: LoopWorkspaceConfig,
        options: {
            authenticateLane?: (
                laneId: string,
                provider: LaneProvider,
            ) => Promise<Result<void>>;
        } = {},
    ): Promise<Result<{ loaded: string[] }>> {
        const loaded: string[] = [];

        for (const moduleEntry of config.modules) {
            const resolved = await resolveModuleRef(
                workspaceRoot,
                this,
                config,
                moduleEntry.ref,
                {
                    authenticateLane: options.authenticateLane,
                },
            );
            if (!resolved.ok) {
                return resolved;
            }

            const manifest = resolved.value.manifest;
            const baseDir = path.resolve(resolved.value.baseDir);

            const entryPath = path.resolve(baseDir, manifest.entry);
            let imported: Record<string, unknown>;
            try {
                imported = await import(pathToFileURL(entryPath).href);
            } catch (error) {
                return err({
                    code: 'module.import_failed',
                    message: `Failed to import module entry at ${entryPath}`,
                    details: { error: String(error) },
                });
            }

            if (typeof imported.registerProviders === 'function') {
                await (imported.registerProviders as (host: ProviderHost, config: Record<string, unknown>) => Promise<void> | void)(this, moduleEntry.config ?? {});
            } else if (typeof imported.default === 'function') {
                await (imported.default as (host: ProviderHost, config: Record<string, unknown>) => Promise<void> | void)(this, moduleEntry.config ?? {});
            } else {
                return err({
                    code: 'module.missing_register_hook',
                    message: `Module ${manifest.id} does not export registerProviders/default.`,
                });
            }

            loaded.push(manifest.id);
        }

        return ok({ loaded });
    }
}
