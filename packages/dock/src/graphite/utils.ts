import type {
    DockGroupNode,
    DockNode,
    DockNodeId,
    DockSplitNode,
    DockState,
    Rect,
} from './types.js';

export function cloneDockState(state: DockState): DockState {
    const clonedNodes: Record<DockNodeId, DockNode> = {};
    for (const [nodeId, node] of Object.entries(state.nodes)) {
        if (node.kind === 'panel') {
            clonedNodes[nodeId] = {
                ...node,
                data: { ...node.data },
                links: {
                    children: [...(node.links?.children ?? [])],
                },
            };
            continue;
        }

        if (node.kind === 'group') {
            clonedNodes[nodeId] = {
                ...node,
                data: { ...node.data },
                links: {
                    children: [...(node.links?.children ?? [])],
                },
            };
            continue;
        }

        clonedNodes[nodeId] = {
            ...node,
            data: {
                ...node.data,
                weights: [...node.data.weights],
            },
            links: {
                children: [...(node.links?.children ?? [])],
            },
        };
    }

    return {
        ...state,
        nodes: clonedNodes,
    };
}

export function clamp(value: number, min: number, max: number): number {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

export function normalizeWeights(
    weights: readonly number[],
    expectedLength: number,
): number[] {
    if (expectedLength <= 0) {
        return [];
    }

    const filtered = weights
        .slice(0, expectedLength)
        .map((entry) => (Number.isFinite(entry) && entry > 0 ? entry : 0))
        .filter((entry) => entry > 0);
    if (filtered.length !== expectedLength) {
        const equal = 1 / expectedLength;
        return Array.from({ length: expectedLength }, () => equal);
    }

    const total = filtered.reduce((sum, entry) => sum + entry, 0);
    if (total <= 0) {
        const equal = 1 / expectedLength;
        return Array.from({ length: expectedLength }, () => equal);
    }

    return filtered.map((entry) => entry / total);
}

export function findParentNodeId(
    dockState: DockState,
    nodeId: DockNodeId,
): DockNodeId | null {
    for (const node of Object.values(dockState.nodes)) {
        if (!node.links?.children?.includes(nodeId)) {
            continue;
        }
        return node.id;
    }
    return null;
}

export function isSplitNode(node: DockNode | undefined): node is DockSplitNode {
    return Boolean(node && node.kind === 'split');
}

export function isGroupNode(node: DockNode | undefined): node is DockGroupNode {
    return Boolean(node && node.kind === 'group');
}

export function rectContains(rect: Rect, x: number, y: number): boolean {
    return (
        x >= rect.x &&
        y >= rect.y &&
        x <= rect.x + rect.width &&
        y <= rect.y + rect.height
    );
}

export function uniqueNodeId(
    dockState: DockState,
    prefix: string,
    startAt = 1,
): DockNodeId {
    let index = Math.max(1, Math.trunc(startAt));
    while (dockState.nodes[`${prefix}-${index}`]) {
        index += 1;
    }
    return `${prefix}-${index}`;
}

