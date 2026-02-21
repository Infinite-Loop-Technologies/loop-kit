const DEFAULT_TAB_HEIGHT = 28;
const DEFAULT_SPLITTER_SIZE = 8;
const DEFAULT_EDGE_PX = 32;
const DEFAULT_HYSTERESIS = 8;
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function containsPoint(rect, point) {
    return (point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height);
}
function insetRect(rect, amount) {
    return {
        x: rect.x + amount,
        y: rect.y + amount,
        width: Math.max(0, rect.width - amount * 2),
        height: Math.max(0, rect.height - amount * 2),
    };
}
function expandRect(rect, amount) {
    return {
        x: rect.x - amount,
        y: rect.y - amount,
        width: rect.width + amount * 2,
        height: rect.height + amount * 2,
    };
}
function centerDistance(rect, point) {
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    const dx = point.x - cx;
    const dy = point.y - cy;
    return Math.sqrt(dx * dx + dy * dy);
}
function asSplit(node) {
    return node?.kind === 'split' ? node : null;
}
function asGroup(node) {
    return node?.kind === 'group' ? node : null;
}
function nodeChildren(state, nodeId) {
    const node = state.nodes[nodeId];
    if (!node?.links?.children)
        return [];
    return node.links.children.filter((id) => typeof id === 'string' && id in state.nodes);
}
function normalizeWeights(weights, count) {
    if (count <= 0)
        return [];
    const next = weights
        .slice(0, count)
        .map((entry) => (Number.isFinite(entry) && entry > 0 ? entry : 0));
    if (next.length !== count) {
        return Array.from({ length: count }, () => 1 / count);
    }
    const total = next.reduce((sum, value) => sum + value, 0);
    if (!Number.isFinite(total) || total <= 1e-9) {
        return Array.from({ length: count }, () => 1 / count);
    }
    return next.map((value) => value / total);
}
function splitRect(rect, direction, weights) {
    const slices = [];
    let cursor = direction === 'row' ? rect.x : rect.y;
    const size = direction === 'row' ? rect.width : rect.height;
    for (let index = 0; index < weights.length; index += 1) {
        const weight = weights[index] ?? 0;
        const remaining = direction === 'row'
            ? rect.x + rect.width - cursor
            : rect.y + rect.height - cursor;
        const segmentSize = index === weights.length - 1
            ? remaining
            : size * weight;
        const nextRect = direction === 'row'
            ? {
                x: cursor,
                y: rect.y,
                width: Math.max(0, segmentSize),
                height: rect.height,
            }
            : {
                x: rect.x,
                y: cursor,
                width: rect.width,
                height: Math.max(0, segmentSize),
            };
        slices.push(nextRect);
        cursor += segmentSize;
    }
    return slices;
}
export function computeLayoutRects(state, bounds, options = {}) {
    const tabBarHeight = Math.max(20, Math.trunc(options.tabBarHeight ?? DEFAULT_TAB_HEIGHT));
    const splitterSize = Math.max(2, Math.trunc(options.splitterSize ?? DEFAULT_SPLITTER_SIZE));
    const layout = {
        bounds,
        rootId: state.rootId,
        nodes: {},
        groups: [],
        splitHandles: [],
    };
    const visit = (nodeId, rect, parentId) => {
        const node = state.nodes[nodeId];
        if (!node)
            return;
        layout.nodes[nodeId] = {
            id: nodeId,
            kind: node.kind,
            rect,
            parentId,
        };
        if (node.kind === 'panel') {
            return;
        }
        if (node.kind === 'group') {
            const panelIds = nodeChildren(state, nodeId).filter((childId) => state.nodes[childId]?.kind === 'panel');
            const tabBarRect = {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: Math.min(tabBarHeight, rect.height),
            };
            const contentRect = {
                x: rect.x,
                y: rect.y + tabBarRect.height,
                width: rect.width,
                height: Math.max(0, rect.height - tabBarRect.height),
            };
            layout.groups.push({
                id: nodeId,
                kind: 'group',
                rect,
                parentId,
                tabBarRect,
                contentRect,
                panelIds,
                activePanelId: typeof node.data.activePanelId === 'string' ? node.data.activePanelId : null,
            });
            for (const panelId of panelIds) {
                layout.nodes[panelId] = {
                    id: panelId,
                    kind: 'panel',
                    rect: contentRect,
                    parentId: nodeId,
                };
            }
            return;
        }
        if (node.kind !== 'split') {
            return;
        }
        const children = nodeChildren(state, nodeId).filter((childId) => {
            const child = state.nodes[childId];
            return Boolean(child && child.kind !== 'float-root' && child.kind !== 'float-window');
        });
        if (children.length === 0) {
            return;
        }
        const weights = normalizeWeights(node.data.weights ?? [], children.length);
        const childRects = splitRect(rect, node.data.direction, weights);
        for (const [index, childId] of children.entries()) {
            const childRect = childRects[index];
            if (!childRect)
                continue;
            visit(childId, childRect, nodeId);
            if (index < children.length - 1) {
                const handleRect = node.data.direction === 'row'
                    ? {
                        x: childRect.x + childRect.width - splitterSize / 2,
                        y: childRect.y,
                        width: splitterSize,
                        height: childRect.height,
                    }
                    : {
                        x: childRect.x,
                        y: childRect.y + childRect.height - splitterSize / 2,
                        width: childRect.width,
                        height: splitterSize,
                    };
                layout.splitHandles.push({
                    id: `${nodeId}:${index.toString(10)}`,
                    splitId: nodeId,
                    index,
                    direction: node.data.direction,
                    rect: handleRect,
                });
            }
        }
    };
    visit(state.rootId, bounds, undefined);
    return layout;
}
function candidateScore(rect, point, base = 1) {
    return base + 1 / (1 + centerDistance(rect, point));
}
export function hitTest(point, layout, options = {}, previousTarget) {
    const edgePx = clamp(options.edgePx ?? DEFAULT_EDGE_PX, 8, 96);
    const hysteresis = clamp(options.hysteresisPx ?? DEFAULT_HYSTERESIS, 0, 32);
    if (previousTarget && containsPoint(expandRect(previousTarget.rect, hysteresis), point)) {
        return previousTarget;
    }
    let best = null;
    for (const group of layout.groups) {
        const tabRect = group.tabBarRect;
        if (containsPoint(tabRect, point)) {
            const tabWidth = group.panelIds.length > 0 ? tabRect.width / group.panelIds.length : tabRect.width;
            const index = tabWidth > 0
                ? clamp(Math.floor((point.x - tabRect.x) / tabWidth), 0, Math.max(0, group.panelIds.length))
                : group.panelIds.length;
            const target = {
                groupId: group.id,
                zone: 'tabbar',
                rect: tabRect,
                score: candidateScore(tabRect, point, 1.2),
                index,
            };
            if (!best || target.score > best.score)
                best = target;
        }
        const leftRect = { x: group.rect.x, y: group.rect.y, width: edgePx, height: group.rect.height };
        const rightRect = {
            x: group.rect.x + group.rect.width - edgePx,
            y: group.rect.y,
            width: edgePx,
            height: group.rect.height,
        };
        const topRect = { x: group.rect.x, y: group.rect.y, width: group.rect.width, height: edgePx };
        const bottomRect = {
            x: group.rect.x,
            y: group.rect.y + group.rect.height - edgePx,
            width: group.rect.width,
            height: edgePx,
        };
        const edgeTargets = [
            { groupId: group.id, zone: 'left', rect: leftRect, score: candidateScore(leftRect, point, 1.1) },
            { groupId: group.id, zone: 'right', rect: rightRect, score: candidateScore(rightRect, point, 1.1) },
            { groupId: group.id, zone: 'top', rect: topRect, score: candidateScore(topRect, point, 1.1) },
            { groupId: group.id, zone: 'bottom', rect: bottomRect, score: candidateScore(bottomRect, point, 1.1) },
        ];
        for (const target of edgeTargets) {
            if (!containsPoint(target.rect, point))
                continue;
            if (!best || target.score > best.score)
                best = target;
        }
        const centerRect = insetRect(group.rect, edgePx);
        if (containsPoint(centerRect, point)) {
            const target = {
                groupId: group.id,
                zone: 'center',
                rect: centerRect,
                score: candidateScore(centerRect, point, 1.0),
            };
            if (!best || target.score > best.score)
                best = target;
        }
    }
    return best;
}
export function computeDropOverlay(target) {
    if (!target)
        return null;
    return target.rect;
}
export function rectToStyle(rect) {
    return {
        left: `${rect.x.toFixed(2)}px`,
        top: `${rect.y.toFixed(2)}px`,
        width: `${Math.max(0, rect.width).toFixed(2)}px`,
        height: `${Math.max(0, rect.height).toFixed(2)}px`,
    };
}
//# sourceMappingURL=geometry.js.map