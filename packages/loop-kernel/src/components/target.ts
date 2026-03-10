import path from 'node:path';
import {
    err,
    ok,
    type ComponentManifest,
    type LoopWorkspaceConfig,
    type Result,
} from '@loop-kit/loop-contracts';

export type ComponentTargetKind = 'app' | 'pkg' | 'workspace';

type TargetValidationResult = {
    targetPath: string;
    targetKind: ComponentTargetKind;
};

function normalizePathForCompare(input: string): string {
    return input.replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/\/+$/, '');
}

export function normalizeTargetPath(
    workspaceRoot: string,
    targetPath: string | undefined,
    fallbackPath: string,
): string {
    if (!targetPath || targetPath === '.') {
        return fallbackPath;
    }

    if (path.isAbsolute(targetPath)) {
        return path.relative(workspaceRoot, targetPath) || '.';
    }

    return targetPath;
}

function inferTargetKind(
    config: LoopWorkspaceConfig,
    targetPath: string,
): ComponentTargetKind | null {
    if (targetPath === '.' || targetPath.length <= 0) {
        return 'workspace';
    }

    const normalizedTargetPath = normalizePathForCompare(targetPath);
    const appsDir = normalizePathForCompare(config.workspace.appsDir);
    const packagesDir = normalizePathForCompare(config.workspace.packagesDir);

    if (
        normalizedTargetPath === appsDir ||
        normalizedTargetPath.startsWith(`${appsDir}/`)
    ) {
        return 'app';
    }

    if (
        normalizedTargetPath === packagesDir ||
        normalizedTargetPath.startsWith(`${packagesDir}/`)
    ) {
        return 'pkg';
    }

    return null;
}

export function validateComponentTargetCompatibility(
    manifest: ComponentManifest,
    targetPath: string,
    workspaceConfig: LoopWorkspaceConfig,
): Result<TargetValidationResult> {
    const targetKind = inferTargetKind(workspaceConfig, targetPath);
    if (!targetKind) {
        return err({
            code: 'component.target_unknown',
            message: `Cannot infer target kind for "${targetPath}". Use a path under ${workspaceConfig.workspace.appsDir}/ or ${workspaceConfig.workspace.packagesDir}/.`,
            details: {
                targetPath,
                appsDir: workspaceConfig.workspace.appsDir,
                packagesDir: workspaceConfig.workspace.packagesDir,
            },
        });
    }

    if (targetKind === 'workspace') {
        return ok({
            targetPath,
            targetKind,
        });
    }

    const allowedTargets = manifest.targets ?? ['app', 'pkg'];
    if (!allowedTargets.includes(targetKind)) {
        return err({
            code: 'component.target_incompatible',
            message: `Component ${manifest.id} targets [${allowedTargets.join(', ')}] but destination "${targetPath}" resolves to "${targetKind}".`,
            details: {
                componentId: manifest.id,
                targetPath,
                targetKind,
                allowedTargets,
            },
        });
    }

    return ok({
        targetPath,
        targetKind,
    });
}
