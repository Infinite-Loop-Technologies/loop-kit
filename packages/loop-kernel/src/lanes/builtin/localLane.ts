import path from 'node:path';
import {
    ComponentManifestSchema,
    ModuleManifestSchema,
    err,
    ok,
    type LaneResolveComponentRequest,
    type LaneResolveComponentResponse,
    type LaneResolveModuleRequest,
    type LaneResolveModuleResponse,
    type Result,
} from '@loop-kit/loop-contracts';
import { nodeFsGateway } from '../../io/fsGateway.js';
import { sha256 } from '../../utils/hash.js';
import type { LaneProvider } from '../../providers/capabilities/lane.js';

async function computeSnapshotId(baseDir: string, manifest: { files: Array<{ source: string }> }): Promise<string> {
    let aggregate = JSON.stringify(manifest);
    for (const entry of manifest.files) {
        const sourcePath = path.resolve(baseDir, entry.source);
        if (await nodeFsGateway.exists(sourcePath)) {
            aggregate += await nodeFsGateway.readText(sourcePath);
        }
    }

    return sha256(aggregate);
}

async function resolveComponentFromDir(
    directory: string,
): Promise<Result<LaneResolveComponentResponse>> {
    const manifestPath = path.join(directory, 'loop.component.json');
    if (!(await nodeFsGateway.exists(manifestPath))) {
        return err({
            code: 'lane.local.component_missing',
            message: `Missing component manifest at ${manifestPath}`,
        });
    }

    let raw: unknown;
    try {
        raw = await nodeFsGateway.readJson<unknown>(manifestPath);
    } catch (error) {
        return err({
            code: 'lane.local.component_manifest_invalid_json',
            message: `Invalid JSON in ${manifestPath}`,
            details: { error: String(error) },
        });
    }

    const parsed = ComponentManifestSchema.safeParse(raw);
    if (!parsed.success) {
        return err({
            code: 'lane.local.component_manifest_invalid_schema',
            message: `Component manifest failed schema validation: ${manifestPath}`,
            details: { issues: parsed.error.issues },
        });
    }

    const snapshotId = parsed.data.snapshot ?? (await computeSnapshotId(directory, parsed.data));

    return ok({
        manifest: parsed.data,
        baseDir: directory,
        snapshotId,
    });
}

async function resolveModuleFromDir(
    directory: string,
): Promise<Result<LaneResolveModuleResponse>> {
    const manifestPath = path.join(directory, 'loop.module.json');
    if (!(await nodeFsGateway.exists(manifestPath))) {
        return err({
            code: 'lane.local.module_missing',
            message: `Missing module manifest at ${manifestPath}`,
        });
    }

    let raw: unknown;
    try {
        raw = await nodeFsGateway.readJson<unknown>(manifestPath);
    } catch (error) {
        return err({
            code: 'lane.local.module_manifest_invalid_json',
            message: `Invalid JSON in ${manifestPath}`,
            details: { error: String(error) },
        });
    }

    const parsed = ModuleManifestSchema.safeParse(raw);
    if (!parsed.success) {
        return err({
            code: 'lane.local.module_manifest_invalid_schema',
            message: `Module manifest failed schema validation: ${manifestPath}`,
            details: { issues: parsed.error.issues },
        });
    }

    const snapshotId = sha256(JSON.stringify(parsed.data));

    return ok({
        manifest: parsed.data,
        baseDir: directory,
        snapshotId,
    });
}

export class LocalLaneProvider implements LaneProvider {
    readonly id = 'local';
    readonly kind = 'local';

    async resolveComponent(
        request: LaneResolveComponentRequest,
    ): Promise<Result<LaneResolveComponentResponse>> {
        if (request.ref.kind !== 'local') {
            return err({
                code: 'lane.local.invalid_ref',
                message: `Local lane cannot resolve ref kind ${request.ref.kind}`,
            });
        }

        const directory = path.resolve(request.workspaceRoot, 'loop', 'components', request.ref.id);
        return resolveComponentFromDir(directory);
    }

    async resolveModule(
        request: LaneResolveModuleRequest,
    ): Promise<Result<LaneResolveModuleResponse>> {
        if (request.ref.kind !== 'local') {
            return err({
                code: 'lane.local.invalid_ref',
                message: `Local lane cannot resolve module ref kind ${request.ref.kind}`,
            });
        }

        const directory = path.resolve(request.workspaceRoot, 'loop', 'modules', request.ref.id);
        return resolveModuleFromDir(directory);
    }

    async getAuthStatus(): Promise<{ authenticated: boolean; message?: string }> {
        return {
            authenticated: true,
            message: 'Local lane does not require authentication.',
        };
    }

    async auth(): Promise<Result<{ authenticated: boolean; message?: string }>> {
        return ok({
            authenticated: true,
            message: 'Local lane does not require authentication.',
        });
    }
}
