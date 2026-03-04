import path from 'node:path';
import {
    err,
    ok,
    type LoopRef,
    type LoopWorkspaceConfig,
    type Result,
} from '@loop-kit/loop-contracts';
import type { LaneProvider } from '../providers/capabilities/lane.js';

export type LaneTarget = 'component' | 'module';

export type ResolvedLaneInstance = {
    laneId: string;
    lane: LoopWorkspaceConfig['lanes'][string];
    provider: LaneProvider;
    ref: LoopRef;
};

function laneDirectory(target: LaneTarget): 'components' | 'modules' {
    return target === 'component' ? 'components' : 'modules';
}

function refToLocalId(ref: LoopRef): string | null {
    if (ref.kind === 'local') {
        return ref.id;
    }

    if (ref.kind === 'loop') {
        return `${ref.namespace}/${ref.name}`;
    }

    return null;
}

function laneRootPath(lane: LoopWorkspaceConfig['lanes'][string]): string {
    const configPath = lane.config.path;
    if (typeof configPath === 'string' && configPath.length > 0) {
        return configPath;
    }

    const configRoot = lane.config.root;
    if (typeof configRoot === 'string' && configRoot.length > 0) {
        return configRoot;
    }

    return '.';
}

function normalizeRefForLane(
    ref: LoopRef,
    laneId: string,
    lane: LoopWorkspaceConfig['lanes'][string],
    target: LaneTarget,
): Result<LoopRef> {
    if (lane.kind === 'local') {
        const localId = refToLocalId(ref);
        if (!localId) {
            return err({
                code: 'lane.ref_incompatible',
                message: `Lane instance ${laneId} (kind=local) cannot resolve ref kind ${ref.kind}.`,
                details: { laneId, laneKind: lane.kind, target, refKind: ref.kind },
            });
        }

        return ok({
            kind: 'local',
            id: localId,
        });
    }

    if (lane.kind === 'file') {
        if (ref.kind === 'file') {
            return ok(ref);
        }

        const localId = refToLocalId(ref);
        if (!localId) {
            return err({
                code: 'lane.ref_incompatible',
                message: `Lane instance ${laneId} (kind=file) cannot resolve ref kind ${ref.kind}.`,
                details: { laneId, laneKind: lane.kind, target, refKind: ref.kind },
            });
        }

        const normalizedPath = path
            .join(laneRootPath(lane), laneDirectory(target), ...localId.split('/'))
            .replace(/\\/g, '/');
        return ok({
            kind: 'file',
            path: normalizedPath,
        });
    }

    if (lane.kind === 'git') {
        if (ref.kind !== 'git') {
            return err({
                code: 'lane.ref_incompatible',
                message: `Lane instance ${laneId} (kind=git) cannot resolve ref kind ${ref.kind}.`,
                details: { laneId, laneKind: lane.kind, target, refKind: ref.kind },
            });
        }

        return ok(ref);
    }

    if (lane.kind === 'http') {
        if (ref.kind !== 'http') {
            return err({
                code: 'lane.ref_incompatible',
                message: `Lane instance ${laneId} (kind=http) cannot resolve ref kind ${ref.kind}.`,
                details: { laneId, laneKind: lane.kind, target, refKind: ref.kind },
            });
        }

        return ok(ref);
    }

    return ok(ref);
}

function selectLaneId(
    config: LoopWorkspaceConfig,
    refKind: LoopRef['kind'],
    target: LaneTarget,
    forcedLaneId?: string,
): string {
    if (forcedLaneId) {
        return forcedLaneId;
    }

    const mapped = config.defaults.refKindMap[refKind];
    if (mapped) {
        return mapped;
    }

    return target === 'component'
        ? config.defaults.componentLane
        : config.defaults.moduleLane;
}

export function resolveLaneInstanceForRef(
    config: LoopWorkspaceConfig,
    getProviderByKind: (kind: string) => LaneProvider | undefined,
    ref: LoopRef,
    target: LaneTarget,
    options: {
        laneId?: string;
    } = {},
): Result<ResolvedLaneInstance> {
    const laneId = selectLaneId(config, ref.kind, target, options.laneId);
    const lane = config.lanes[laneId];
    if (!lane) {
        return err({
            code: 'lane.instance_not_found',
            message: `Configured lane instance not found: ${laneId}`,
            details: { laneId, target, refKind: ref.kind },
        });
    }

    const provider = getProviderByKind(lane.kind);
    if (!provider) {
        return err({
            code: 'lane.provider_not_found',
            message: `No lane provider registered for kind: ${lane.kind}`,
            details: { laneId, laneKind: lane.kind, target },
        });
    }

    const normalizedRef = normalizeRefForLane(ref, laneId, lane, target);
    if (!normalizedRef.ok) {
        return normalizedRef;
    }

    return ok({
        laneId,
        lane,
        provider,
        ref: normalizedRef.value,
    });
}
