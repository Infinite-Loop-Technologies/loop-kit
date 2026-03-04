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

function resolveManifestPath(workspaceRoot: string, refPath: string, fileName: string): string {
    const absolute = path.isAbsolute(refPath) ? refPath : path.resolve(workspaceRoot, refPath);
    return absolute.endsWith('.json') ? absolute : path.join(absolute, fileName);
}

async function computeSnapshotId(
    baseDir: string,
    manifest: { files: Array<{ source: string }> },
): Promise<string> {
    let aggregate = JSON.stringify(manifest);
    for (const entry of manifest.files) {
        const sourcePath = path.resolve(baseDir, entry.source);
        if (await nodeFsGateway.exists(sourcePath)) {
            aggregate += await nodeFsGateway.readText(sourcePath);
        }
    }

    return sha256(aggregate);
}

export class FileLaneProvider implements LaneProvider {
    readonly id = 'file';
    readonly kind = 'file';

    async resolveComponent(
        request: LaneResolveComponentRequest,
    ): Promise<Result<LaneResolveComponentResponse>> {
        if (request.ref.kind !== 'file') {
            return err({
                code: 'lane.file.invalid_ref',
                message: `File lane cannot resolve ref kind ${request.ref.kind}`,
            });
        }

        const manifestPath = resolveManifestPath(
            request.workspaceRoot,
            request.ref.path,
            'loop.component.json',
        );
        if (!(await nodeFsGateway.exists(manifestPath))) {
            return err({
                code: 'lane.file.component_missing',
                message: `Missing component manifest at ${manifestPath}`,
            });
        }

        let raw: unknown;
        try {
            raw = await nodeFsGateway.readJson<unknown>(manifestPath);
        } catch (error) {
            return err({
                code: 'lane.file.component_invalid_json',
                message: `Invalid component JSON at ${manifestPath}`,
                details: { error: String(error) },
            });
        }

        const parsed = ComponentManifestSchema.safeParse(raw);
        if (!parsed.success) {
            return err({
                code: 'lane.file.component_invalid_schema',
                message: `Component schema validation failed for ${manifestPath}`,
                details: { issues: parsed.error.issues },
            });
        }

        return ok({
            manifest: parsed.data,
            baseDir: path.dirname(manifestPath),
            snapshotId:
                parsed.data.snapshot ??
                (await computeSnapshotId(path.dirname(manifestPath), parsed.data)),
        });
    }

    async resolveModule(
        request: LaneResolveModuleRequest,
    ): Promise<Result<LaneResolveModuleResponse>> {
        if (request.ref.kind !== 'file') {
            return err({
                code: 'lane.file.invalid_ref',
                message: `File lane cannot resolve module ref kind ${request.ref.kind}`,
            });
        }

        const manifestPath = resolveManifestPath(
            request.workspaceRoot,
            request.ref.path,
            'loop.module.json',
        );

        if (!(await nodeFsGateway.exists(manifestPath))) {
            return err({
                code: 'lane.file.module_missing',
                message: `Missing module manifest at ${manifestPath}`,
            });
        }

        let raw: unknown;
        try {
            raw = await nodeFsGateway.readJson<unknown>(manifestPath);
        } catch (error) {
            return err({
                code: 'lane.file.module_invalid_json',
                message: `Invalid module JSON at ${manifestPath}`,
                details: { error: String(error) },
            });
        }

        const parsed = ModuleManifestSchema.safeParse(raw);
        if (!parsed.success) {
            return err({
                code: 'lane.file.module_invalid_schema',
                message: `Module schema validation failed for ${manifestPath}`,
                details: { issues: parsed.error.issues },
            });
        }

        return ok({
            manifest: parsed.data,
            baseDir: path.dirname(manifestPath),
            snapshotId: sha256(JSON.stringify(parsed.data)),
        });
    }

    async getAuthStatus(): Promise<{ authenticated: boolean; message?: string }> {
        return {
            authenticated: true,
            message: 'File lane does not require authentication.',
        };
    }

    async auth(): Promise<Result<{ authenticated: boolean; message?: string }>> {
        return ok({
            authenticated: true,
            message: 'File lane does not require authentication.',
        });
    }
}
