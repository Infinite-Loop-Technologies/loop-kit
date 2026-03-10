import type {
    DockDropTarget,
    DockGroupLayout,
    DockInteractionIntent,
    DockLayoutMap,
    DockMovePanelIntentPayload,
    DockResizeIntentPayload,
    DockResizeSessionStart,
    Point,
    Rect,
} from './types.js';
import { clamp, rectContains } from './utils.js';

export type DockHitTestOptions = {
    edgeRatio?: number;
    minEdgePx?: number;
    maxEdgePx?: number;
    hysteresisPx?: number;
};

export type DockDropResolveContext = {
    point: Point;
    layout: DockLayoutMap;
    panelId: string | null;
    rawTarget: DockDropTarget | null;
    currentTarget: DockDropTarget | null;
};

export type CreateDockInteractionControllerOptions = {
    minWeight?: number;
    hitTestOptions?: DockHitTestOptions;
    resolveDropTarget?: (
        context: DockDropResolveContext,
    ) => DockDropTarget | null;
    onDropTargetChange?: (target: DockDropTarget | null) => void;
};

type ResizeSession = DockResizeSessionStart & {
    normalizedWeights: number[];
};

export type DockInteractionController = {
    startPanelDrag: (panelId: string) => void;
    updatePointer: (point: Point, layout: DockLayoutMap) => void;
    endPanelDrag: (point: Point, layout: DockLayoutMap) => DockInteractionIntent | null;
    cancelPanelDrag: () => void;
    startResize: (session: DockResizeSessionStart) => void;
    updateResize: (point: Point) => DockInteractionIntent | null;
    endResize: (point: Point) => DockInteractionIntent | null;
    cancelResize: () => void;
    getDropTarget: () => DockDropTarget | null;
};

const DEFAULT_HIT_TEST_OPTIONS: Required<DockHitTestOptions> = {
    edgeRatio: 0.28,
    minEdgePx: 20,
    maxEdgePx: 84,
    hysteresisPx: 10,
};

export function createDockInteractionController(
    options: CreateDockInteractionControllerOptions = {},
): DockInteractionController {
    const hitTestOptions = {
        ...DEFAULT_HIT_TEST_OPTIONS,
        ...options.hitTestOptions,
    };
    const minWeight = clamp(options.minWeight ?? 0.06, 0.02, 0.45);

    let activePanelId: string | null = null;
    let dropTarget: DockDropTarget | null = null;
    let resizeSession: ResizeSession | null = null;

    const setDropTarget = (next: DockDropTarget | null) => {
        if (isSameDropTarget(dropTarget, next)) {
            return;
        }
        dropTarget = next;
        options.onDropTargetChange?.(next);
    };

    const updateDropTarget = (point: Point, layout: DockLayoutMap) => {
        const rawTarget = activePanelId
            ? resolveRawDropTarget(point, layout, hitTestOptions)
            : null;
        const resolved = options.resolveDropTarget
            ? options.resolveDropTarget({
                  point,
                  layout,
                  panelId: activePanelId,
                  rawTarget,
                  currentTarget: dropTarget,
              })
            : rawTarget;
        setDropTarget(resolved);
    };

    return {
        startPanelDrag(panelId) {
            activePanelId = panelId;
            setDropTarget(null);
        },
        updatePointer(point, layout) {
            if (!activePanelId) {
                return;
            }
            updateDropTarget(point, layout);
        },
        endPanelDrag(point, layout) {
            if (!activePanelId) {
                return null;
            }
            updateDropTarget(point, layout);
            const target = dropTarget;
            const panelId = activePanelId;
            activePanelId = null;
            setDropTarget(null);

            if (!target) {
                return null;
            }

            const sourceGroupId = findPanelGroup(layout.groups, panelId);
            if (!sourceGroupId) {
                return null;
            }

            const payload: DockMovePanelIntentPayload = {
                panelId,
                sourceGroupId,
                targetGroupId: target.groupId,
                zone: target.zone,
                ...(typeof target.index === 'number'
                    ? { index: target.index }
                    : {}),
            };

            return {
                name: 'dock/move-panel',
                payload,
            };
        },
        cancelPanelDrag() {
            activePanelId = null;
            setDropTarget(null);
        },
        startResize(session) {
            resizeSession = {
                ...session,
                normalizedWeights: normalizeWeightsForResize(session.weights),
            };
        },
        updateResize(point) {
            if (!resizeSession) {
                return null;
            }
            const weights = computeResizeWeights(resizeSession, point, minWeight);
            const payload: DockResizeIntentPayload = {
                splitId: resizeSession.splitId,
                handleIndex: resizeSession.handleIndex,
                weights,
            };

            return {
                name: 'dock/resize',
                payload,
                transient: true,
            };
        },
        endResize(point) {
            if (!resizeSession) {
                return null;
            }
            const weights = computeResizeWeights(resizeSession, point, minWeight);
            const payload: DockResizeIntentPayload = {
                splitId: resizeSession.splitId,
                handleIndex: resizeSession.handleIndex,
                weights,
            };
            resizeSession = null;

            return {
                name: 'dock/resize',
                payload,
                transient: false,
            };
        },
        cancelResize() {
            resizeSession = null;
        },
        getDropTarget() {
            return dropTarget;
        },
    };
}

function normalizeWeightsForResize(weights: readonly number[]): number[] {
    const positive = weights.map((entry) =>
        Number.isFinite(entry) && entry > 0 ? entry : 0,
    );
    const total = positive.reduce((sum, entry) => sum + entry, 0);
    if (total <= 0) {
        const equal = 1 / Math.max(1, positive.length);
        return Array.from({ length: positive.length }, () => equal);
    }
    return positive.map((entry) => entry / total);
}

function computeResizeWeights(
    session: ResizeSession,
    point: Point,
    minWeight: number,
): number[] {
    const weights = [...session.normalizedWeights];
    const leftIndex = session.handleIndex;
    const rightIndex = session.handleIndex + 1;
    if (leftIndex < 0 || rightIndex >= weights.length) {
        return weights;
    }

    const total = weights[leftIndex] + weights[rightIndex];
    if (total <= 0) {
        return weights;
    }

    const deltaPx =
        session.direction === 'row'
            ? point.x - session.startPoint.x
            : point.y - session.startPoint.y;
    const deltaRatio = deltaPx / Math.max(1, session.splitSize);
    const minSideWeight = Math.min(minWeight, total / 2);
    const nextLeft = clamp(
        weights[leftIndex] + deltaRatio,
        minSideWeight,
        total - minSideWeight,
    );
    const nextRight = total - nextLeft;
    weights[leftIndex] = nextLeft;
    weights[rightIndex] = nextRight;
    return weights;
}

function findPanelGroup(groups: DockGroupLayout[], panelId: string): string | null {
    const group = groups.find((entry) => entry.panelIds.includes(panelId));
    return group?.id ?? null;
}

function resolveRawDropTarget(
    point: Point,
    layout: DockLayoutMap,
    options: Required<DockHitTestOptions>,
): DockDropTarget | null {
    const candidates: DockDropTarget[] = [];
    for (const group of layout.groups) {
        const target = rawTargetForGroup(group, point, options);
        if (target) {
            candidates.push(target);
        }
    }

    if (candidates.length <= 0) {
        return null;
    }

    candidates.sort((left, right) => {
        if (left.score !== right.score) {
            return right.score - left.score;
        }
        return distanceToRectCenter(left.rect, point) - distanceToRectCenter(right.rect, point);
    });
    return candidates[0];
}

function rawTargetForGroup(
    group: DockGroupLayout,
    point: Point,
    options: Required<DockHitTestOptions>,
): DockDropTarget | null {
    if (!rectContains(group.rect, point.x, point.y)) {
        return null;
    }

    if (rectContains(group.tabBarRect, point.x, point.y)) {
        return {
            groupId: group.id,
            zone: 'tabbar',
            rect: group.tabBarRect,
            index: tabInsertionIndex(group, point.x),
            score: 30,
        };
    }

    const contentRect = groupContentRect(group);
    const edgeRect = resolveEdgeRect(contentRect, point, options);
    if (edgeRect) {
        return {
            groupId: group.id,
            zone: edgeRect.zone,
            rect: edgeRect.rect,
            score: 20,
        };
    }

    return {
        groupId: group.id,
        zone: 'center',
        rect: contentRect,
        score: 10,
    };
}

function groupContentRect(group: DockGroupLayout): Rect {
    const top = group.tabBarRect.y + group.tabBarRect.height;
    return {
        x: group.rect.x,
        y: top,
        width: group.rect.width,
        height: Math.max(0, group.rect.y + group.rect.height - top),
    };
}

function resolveEdgeRect(
    rect: Rect,
    point: Point,
    options: Required<DockHitTestOptions>,
): { zone: 'left' | 'right' | 'top' | 'bottom'; rect: Rect } | null {
    const edgeX = clamp(rect.width * options.edgeRatio, options.minEdgePx, options.maxEdgePx);
    const edgeY = clamp(rect.height * options.edgeRatio, options.minEdgePx, options.maxEdgePx);

    if (point.x <= rect.x + edgeX) {
        return {
            zone: 'left',
            rect: {
                x: rect.x,
                y: rect.y,
                width: edgeX,
                height: rect.height,
            },
        };
    }
    if (point.x >= rect.x + rect.width - edgeX) {
        return {
            zone: 'right',
            rect: {
                x: rect.x + rect.width - edgeX,
                y: rect.y,
                width: edgeX,
                height: rect.height,
            },
        };
    }
    if (point.y <= rect.y + edgeY) {
        return {
            zone: 'top',
            rect: {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: edgeY,
            },
        };
    }
    if (point.y >= rect.y + rect.height - edgeY) {
        return {
            zone: 'bottom',
            rect: {
                x: rect.x,
                y: rect.y + rect.height - edgeY,
                width: rect.width,
                height: edgeY,
            },
        };
    }

    return null;
}

function tabInsertionIndex(group: DockGroupLayout, pointX: number): number {
    const panelCount = Math.max(1, group.panelIds.length);
    const step = group.tabBarRect.width / panelCount;
    const rawIndex = Math.round((pointX - group.tabBarRect.x) / Math.max(1, step));
    return clamp(rawIndex, 0, group.panelIds.length);
}

function distanceToRectCenter(rect: Rect, point: Point): number {
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    const dx = point.x - cx;
    const dy = point.y - cy;
    return Math.sqrt(dx * dx + dy * dy);
}

function isSameDropTarget(
    left: DockDropTarget | null,
    right: DockDropTarget | null,
): boolean {
    if (!left || !right) {
        return left === right;
    }

    return (
        left.groupId === right.groupId &&
        left.zone === right.zone &&
        left.index === right.index &&
        left.rect.x === right.rect.x &&
        left.rect.y === right.rect.y &&
        left.rect.width === right.rect.width &&
        left.rect.height === right.rect.height
    );
}

