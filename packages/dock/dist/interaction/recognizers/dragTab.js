import { asNodeId, } from '@loop-kit/graphite-core';
import { buildPatchFromPreview, buildPreviewPatch } from '../../facet/patchBuilders.js';
import { scoreDockDropTarget } from '../../facet/policy.js';
import { DOCK_FACET, } from '../../facet/schema.js';
const SESSION_KEY = 'dock.dragTab.session';
export function createDragTabRecognizer() {
    return {
        id: 'dock.dragTab',
        onInput: (input, ctx) => {
            if (input.kind === 'pointerdown') {
                const hit = ctx.hitTest(input.x, input.y, input);
                if (!hit || hit.regionType !== 'tab') {
                    return;
                }
                const data = hit.data ?? {};
                const tabId = toNodeId(data.tabId) ?? hit.nodeId;
                const sourceGroupId = toNodeId(data.groupId);
                if (!tabId || !sourceGroupId) {
                    return;
                }
                const session = {
                    tabId,
                    sourceGroupId,
                };
                ctx.setSessionState(SESSION_KEY, session);
                return {
                    capture: true,
                    proposeScore: 100,
                };
            }
            const session = ctx.getSessionState(SESSION_KEY);
            if (!session) {
                return;
            }
            if (input.kind === 'pointermove') {
                const hit = ctx.hitTest(input.x, input.y, input);
                const score = scoreDockDropTarget(hit);
                if (!Number.isFinite(score)) {
                    return {
                        proposeScore: Number.NEGATIVE_INFINITY,
                    };
                }
                const preview = toPreviewIntent(hit, session);
                if (!preview) {
                    return {
                        proposeScore: Number.NEGATIVE_INFINITY,
                    };
                }
                if (preview.zoneId !== session.lastZoneId) {
                    const dockState = ctx.getStateView().getSlice(DOCK_FACET);
                    const rootId = dockState?.rootIds[0];
                    if (rootId) {
                        ctx.clearOverlay();
                        ctx.pushOverlayPatch(buildPreviewPatch(rootId, preview));
                        ctx.setSessionState(SESSION_KEY, {
                            ...session,
                            lastZoneId: preview.zoneId,
                        });
                    }
                }
                return {
                    proposeScore: score,
                };
            }
            if (input.kind === 'pointerup') {
                const state = ctx.getStateView().getSlice(DOCK_FACET);
                const preview = state?.preview;
                if (preview) {
                    const intentSnapshot = ctx.getIntentSnapshot();
                    const nextGroupId = asNodeId(`dock.group.generated.${Date.now()}`);
                    const patch = buildPatchFromPreview(intentSnapshot, preview, {
                        newGroupId: nextGroupId,
                    });
                    ctx.commitIntentPatch(patch, {
                        origin: 'dock.dragTab',
                        history: true,
                    });
                }
                ctx.clearOverlay();
                ctx.clearSessionState(SESSION_KEY);
                return {
                    proposeScore: 100,
                    releaseCapture: true,
                };
            }
            if (input.kind === 'pointercancel' || (input.kind === 'keydown' && input.key === 'Escape')) {
                ctx.clearOverlay();
                ctx.clearSessionState(SESSION_KEY);
                return {
                    proposeScore: 100,
                    releaseCapture: true,
                };
            }
            return {
                proposeScore: 0,
            };
        },
    };
}
function toPreviewIntent(hit, session) {
    if (!hit) {
        return undefined;
    }
    const data = hit.data ?? {};
    if (hit.regionType === 'tab') {
        const targetGroupId = toNodeId(data.groupId);
        if (!targetGroupId) {
            return undefined;
        }
        return {
            tabId: session.tabId,
            sourceGroupId: session.sourceGroupId,
            targetGroupId,
            region: 'center',
            zoneId: hit.zoneId,
            targetIndex: typeof data.index === 'number' ? data.index : undefined,
        };
    }
    const targetGroupId = toNodeId(data.targetGroupId) ?? hit.nodeId;
    const region = toDockRegion(data.region, hit.regionType);
    if (!targetGroupId || !region) {
        return undefined;
    }
    return {
        tabId: session.tabId,
        sourceGroupId: session.sourceGroupId,
        targetGroupId,
        region,
        zoneId: hit.zoneId,
    };
}
function toDockRegion(value, regionType) {
    if (value === 'center' || value === 'left' || value === 'right' || value === 'top' || value === 'bottom') {
        return value;
    }
    switch (regionType) {
        case 'drop-center':
            return 'center';
        case 'drop-left':
            return 'left';
        case 'drop-right':
            return 'right';
        case 'drop-top':
            return 'top';
        case 'drop-bottom':
            return 'bottom';
        default:
            return undefined;
    }
}
function toNodeId(value) {
    if (typeof value !== 'string') {
        return undefined;
    }
    return asNodeId(value);
}
//# sourceMappingURL=dragTab.js.map