import path from 'node:path';
import {
    err,
    parseLoopRef,
    type LoopWorkspaceConfig,
    type Result,
} from '@loop-kit/loop-contracts';
import type { ProviderHost } from '../providers/host.js';
import type { LaneProvider } from '../providers/capabilities/lane.js';
import type { ResolveComponentResult } from '../types.js';
import { resolveLaneInstanceForRef } from '../lanes/instanceResolver.js';

export async function resolveComponentRef(
    workspaceRoot: string,
    host: ProviderHost,
    config: LoopWorkspaceConfig,
    refText: string,
    options: {
        authenticateLane?: (
            laneId: string,
            provider: LaneProvider,
        ) => Promise<Result<void>>;
    } = {},
): Promise<Result<ResolveComponentResult>> {
    const parsed = parseLoopRef(refText);
    if (!parsed.ok) {
        return parsed;
    }
    const override = config.overrides.components[refText];
    let effectiveRef = parsed.value;
    if (override?.ref) {
        const parsedOverrideRef = parseLoopRef(override.ref);
        if (!parsedOverrideRef.ok) {
            return err({
                code: 'lane.override_invalid_ref',
                message: `Invalid component override ref for ${refText}.`,
                details: {
                    refText,
                    overrideRef: override.ref,
                },
            });
        }
        effectiveRef = parsedOverrideRef.value;
    }

    const laneResolution = resolveLaneInstanceForRef(
        config,
        (kind) => host.getLaneProviderByKind(kind),
        effectiveRef,
        'component',
        {
            laneId: override?.laneId,
        },
    );
    if (!laneResolution.ok) {
        return laneResolution;
    }

    if (options.authenticateLane) {
        const authResult = await options.authenticateLane(
            laneResolution.value.laneId,
            laneResolution.value.provider,
        );
        if (!authResult.ok) {
            return authResult;
        }
    }

    const resolved = await laneResolution.value.provider.resolveComponent({
        laneId: laneResolution.value.laneId,
        workspaceRoot,
        ref: laneResolution.value.ref,
    });

    if (!resolved.ok) {
        return resolved;
    }

    return {
        ok: true,
        value: {
            manifest: resolved.value.manifest,
            baseDir: path.resolve(resolved.value.baseDir),
            snapshotId: resolved.value.snapshotId,
            laneId: laneResolution.value.laneId,
        },
    };
}
