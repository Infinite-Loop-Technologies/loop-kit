import { hitTest, } from './geometry';
const EPSILON = 1e-6;
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function normalizeWeights(weights) {
    const next = weights.map((entry) => (Number.isFinite(entry) && entry > 0 ? entry : 0));
    const total = next.reduce((sum, value) => sum + value, 0);
    if (total <= EPSILON) {
        return Array.from({ length: next.length }, () => 1 / Math.max(1, next.length));
    }
    return next.map((value) => value / total);
}
function weightsEqual(left, right) {
    if (left.length !== right.length)
        return false;
    for (let index = 0; index < left.length; index += 1) {
        if (Math.abs((left[index] ?? 0) - (right[index] ?? 0)) > EPSILON) {
            return false;
        }
    }
    return true;
}
function resizeWeights(weights, handleIndex, deltaRatio, minWeight) {
    const left = weights[handleIndex];
    const right = weights[handleIndex + 1];
    if (typeof left !== 'number' || typeof right !== 'number') {
        return null;
    }
    const pairTotal = left + right;
    const minLeft = Math.min(minWeight, pairTotal / 2);
    const minRight = Math.min(minWeight, pairTotal / 2);
    const nextLeft = clamp(left + deltaRatio, minLeft, pairTotal - minRight);
    const nextRight = pairTotal - nextLeft;
    const next = [...weights];
    next[handleIndex] = nextLeft;
    next[handleIndex + 1] = nextRight;
    return normalizeWeights(next);
}
/**
 * Creates an ephemeral interaction state machine for panel drag/drop + split resize.
 * It never mutates Graphite directly; it only emits intents.
 */
export function createDockInteractionController(options = {}) {
    let dragSession = null;
    let resizeSession = null;
    const emitDropTarget = (target) => {
        options.onDropTargetChange?.(target);
    };
    return {
        startPanelDrag(panelId) {
            dragSession = {
                kind: 'panel',
                panelId,
                lastTarget: null,
            };
            emitDropTarget(null);
        },
        updatePointer(point, layout) {
            if (!dragSession)
                return null;
            const nextTarget = hitTest(point, layout, options.hitTestOptions, dragSession.lastTarget);
            if (nextTarget?.groupId !== dragSession.lastTarget?.groupId || nextTarget?.zone !== dragSession.lastTarget?.zone || nextTarget?.index !== dragSession.lastTarget?.index) {
                dragSession.lastTarget = nextTarget;
                emitDropTarget(nextTarget);
            }
            return dragSession.lastTarget;
        },
        endPanelDrag(point, layout) {
            if (!dragSession)
                return null;
            const target = hitTest(point, layout, options.hitTestOptions, dragSession.lastTarget);
            const panelId = dragSession.panelId;
            dragSession = null;
            emitDropTarget(null);
            if (!target)
                return null;
            return {
                name: 'dock/move-panel',
                payload: {
                    panelId,
                    target: {
                        groupId: target.groupId,
                        zone: target.zone,
                        index: target.index,
                    },
                },
            };
        },
        cancelPanelDrag() {
            dragSession = null;
            emitDropTarget(null);
        },
        startResize(start) {
            resizeSession = {
                kind: 'resize',
                splitId: start.splitId,
                handleIndex: start.handleIndex,
                direction: start.direction,
                startPoint: start.startPoint,
                splitSize: Math.max(1, start.splitSize),
                startWeights: normalizeWeights([...start.weights]),
                latestWeights: normalizeWeights([...start.weights]),
                minWeight: Math.max(0, Math.min(0.45, start.minWeight ?? options.minWeight ?? 0.05)),
            };
        },
        updateResize(point) {
            if (!resizeSession)
                return null;
            const axisDelta = resizeSession.direction === 'row'
                ? point.x - resizeSession.startPoint.x
                : point.y - resizeSession.startPoint.y;
            const ratioDelta = axisDelta / resizeSession.splitSize;
            const next = resizeWeights(resizeSession.startWeights, resizeSession.handleIndex, ratioDelta, resizeSession.minWeight);
            if (!next)
                return null;
            if (weightsEqual(next, resizeSession.latestWeights))
                return null;
            resizeSession.latestWeights = next;
            return {
                name: 'dock/resize',
                transient: true,
                payload: {
                    splitId: resizeSession.splitId,
                    weights: next,
                    transient: true,
                },
            };
        },
        endResize(point) {
            if (!resizeSession)
                return null;
            const transient = this.updateResize(point);
            const weights = transient && transient.name === 'dock/resize'
                ? transient.payload.weights
                : resizeSession.latestWeights;
            const splitId = resizeSession.splitId;
            resizeSession = null;
            return {
                name: 'dock/resize',
                transient: false,
                payload: {
                    splitId,
                    weights,
                    transient: false,
                },
            };
        },
        cancelResize() {
            resizeSession = null;
        },
        getDropTarget() {
            return dragSession?.lastTarget ?? null;
        },
    };
}
//# sourceMappingURL=interaction.js.map