import {
    $delete,
    $set,
    type GraphPath,
    type GraphState,
    type IntentCompilerContext,
} from '@loop-kit/graphite';
import type { GraphiteStore } from '@loop-kit/graphite';
import type {
    DockGroupNode,
    DockMovePanelIntentPayload,
    DockNode,
    DockNodeId,
    DockPanelNode,
    DockPanelSummary,
    DockResizeIntentPayload,
    DockSplitDirection,
    DockSplitNode,
    DockState,
} from './types.js';
import {
    cloneDockState,
    findParentNodeId,
    isGroupNode,
    isSplitNode,
    normalizeWeights,
    uniqueNodeId,
} from './utils.js';

type DockIntents = ReturnType<typeof createDockIntentNames>;

export function createPanelNode(id: DockNodeId, title: string): DockPanelNode {
    return {
        id,
        kind: 'panel',
        data: {
            title,
        },
        links: {
            children: [],
        },
    };
}

export function createGroupNode(
    id: DockNodeId,
    panelIds: DockNodeId[] = [],
    activePanelId?: DockNodeId,
): DockGroupNode {
    return {
        id,
        kind: 'group',
        data: {
            activePanelId: activePanelId ?? panelIds[0],
        },
        links: {
            children: [...panelIds],
        },
    };
}

export function createSplitNode(
    id: DockNodeId,
    direction: DockSplitDirection,
    children: DockNodeId[],
    weights: number[],
): DockSplitNode {
    return {
        id,
        kind: 'split',
        data: {
            direction,
            weights: normalizeWeights(weights, children.length),
        },
        links: {
            children: [...children],
        },
    };
}

export function createDockState(input: DockState): DockState {
    return cloneDockState(input);
}

export function createDockIntentNames(prefix = 'dock') {
    return {
        addPanel: `${prefix}/add-panel`,
        removePanel: `${prefix}/remove-panel`,
        activatePanel: `${prefix}/activate-panel`,
        movePanel: `${prefix}/move-panel`,
        resize: `${prefix}/resize`,
    } as const;
}

type RegisterDockIntentsOptions = {
    path?: GraphPath;
    intentPrefix?: string;
};

function patchSetAtPath(path: GraphPath, value: DockState): Record<string, unknown> {
    let patch: unknown = $set(value);
    for (let index = path.length - 1; index >= 0; index -= 1) {
        patch = {
            [String(path[index])]: patch,
        };
    }

    return patch as Record<string, unknown>;
}

function patchDeleteAtPath(path: GraphPath): Record<string, unknown> {
    let patch: unknown = $delete();
    for (let index = path.length - 1; index >= 0; index -= 1) {
        patch = {
            [String(path[index])]: patch,
        };
    }

    return patch as Record<string, unknown>;
}

function getValueAtPath(root: unknown, path: GraphPath): unknown {
    let current = root;
    for (const segment of path) {
        if (!current || typeof current !== 'object') {
            return undefined;
        }
        current = (current as Record<string, unknown>)[String(segment)];
    }
    return current;
}

function getDockStateAtPath<TState extends GraphState>(
    state: Readonly<TState>,
    path: GraphPath,
): DockState | null {
    const value = getValueAtPath(state, path);
    if (!value || typeof value !== 'object') {
        return null;
    }
    const candidate = value as DockState;
    if (
        typeof candidate.rootId !== 'string' ||
        !candidate.nodes ||
        typeof candidate.nodes !== 'object'
    ) {
        return null;
    }

    return candidate;
}

function findGroupContainingPanel(
    dockState: DockState,
    panelId: DockNodeId,
): DockGroupNode | null {
    for (const node of Object.values(dockState.nodes)) {
        if (!isGroupNode(node)) {
            continue;
        }
        if (node.links.children.includes(panelId)) {
            return node;
        }
    }

    return null;
}

function findActiveGroup(dockState: DockState): DockGroupNode | null {
    const queue: DockNodeId[] = [dockState.rootId];
    const seen = new Set<DockNodeId>();

    while (queue.length > 0) {
        const nextNodeId = queue.shift();
        if (!nextNodeId || seen.has(nextNodeId)) {
            continue;
        }
        seen.add(nextNodeId);

        const node = dockState.nodes[nextNodeId];
        if (!node) {
            continue;
        }
        if (node.kind === 'group') {
            return node;
        }

        for (const childId of node.links.children) {
            queue.push(childId);
        }
    }

    return null;
}

function toInsertionIndex(length: number, index: number | undefined): number {
    if (typeof index !== 'number' || Number.isNaN(index)) {
        return length;
    }
    return Math.max(0, Math.min(length, Math.trunc(index)));
}

function insertInArray<T>(items: T[], item: T, index: number): T[] {
    const safeIndex = Math.max(0, Math.min(items.length, index));
    return [...items.slice(0, safeIndex), item, ...items.slice(safeIndex)];
}

function removeFromArray<T>(items: T[], item: T): T[] {
    const index = items.indexOf(item);
    if (index < 0) {
        return [...items];
    }

    return [...items.slice(0, index), ...items.slice(index + 1)];
}

function normalizeGroupActivePanel(group: DockGroupNode): DockGroupNode {
    const children = group.links.children;
    const active = group.data.activePanelId;
    if (!active || !children.includes(active)) {
        return {
            ...group,
            data: {
                ...group.data,
                activePanelId: children[0],
            },
        };
    }

    return group;
}

function normalizeDockTree(dockState: DockState): DockState {
    const source = cloneDockState(dockState);
    const normalizedNodes: Record<DockNodeId, DockNode> = {};

    const visit = (
        nodeId: DockNodeId,
        parentId: DockNodeId | null,
    ): DockNodeId | null => {
        const node = source.nodes[nodeId];
        if (!node) {
            return null;
        }

        if (node.kind === 'panel') {
            normalizedNodes[node.id] = {
                ...node,
                data: {
                    ...node.data,
                },
                links: {
                    children: [],
                },
            };
            return node.id;
        }

        if (node.kind === 'group') {
            const nextChildren: DockNodeId[] = [];
            const seen = new Set<DockNodeId>();
            for (const childId of node.links.children) {
                if (seen.has(childId)) {
                    continue;
                }
                const child = source.nodes[childId];
                if (!child || child.kind !== 'panel') {
                    continue;
                }
                seen.add(childId);
                nextChildren.push(childId);
                if (!normalizedNodes[childId]) {
                    normalizedNodes[childId] = {
                        ...child,
                        data: {
                            ...child.data,
                        },
                        links: {
                            children: [],
                        },
                    };
                }
            }

            if (nextChildren.length <= 0 && parentId) {
                return null;
            }

            const activePanelId =
                typeof node.data.activePanelId === 'string' &&
                nextChildren.includes(node.data.activePanelId)
                    ? node.data.activePanelId
                    : nextChildren[0];
            const nextGroup: DockGroupNode = {
                ...node,
                data: {
                    ...node.data,
                    ...(activePanelId ? { activePanelId } : { activePanelId: undefined }),
                },
                links: {
                    children: nextChildren,
                },
            };
            normalizedNodes[nextGroup.id] = nextGroup;
            return nextGroup.id;
        }

        const nextChildren: DockNodeId[] = [];
        const seen = new Set<DockNodeId>();
        for (const childId of node.links.children) {
            const normalizedChildId = visit(childId, node.id);
            if (!normalizedChildId || seen.has(normalizedChildId)) {
                continue;
            }
            seen.add(normalizedChildId);
            nextChildren.push(normalizedChildId);
        }

        if (nextChildren.length <= 0) {
            return null;
        }
        if (nextChildren.length === 1) {
            return nextChildren[0]!;
        }

        const nextSplit: DockSplitNode = {
            ...node,
            data: {
                ...node.data,
                weights: normalizeWeights(node.data.weights, nextChildren.length),
            },
            links: {
                children: nextChildren,
            },
        };
        normalizedNodes[nextSplit.id] = nextSplit;
        return nextSplit.id;
    };

    let rootId = visit(source.rootId, null);
    if (!rootId) {
        const fallbackGroupId = uniqueNodeId(source, 'group-root', Object.keys(source.nodes).length + 1);
        normalizedNodes[fallbackGroupId] = createGroupNode(fallbackGroupId, []);
        rootId = fallbackGroupId;
    } else {
        const rootNode = normalizedNodes[rootId];
        if (rootNode?.kind === 'panel') {
            const fallbackGroupId = uniqueNodeId(source, 'group-root', Object.keys(source.nodes).length + 1);
            normalizedNodes[fallbackGroupId] = createGroupNode(
                fallbackGroupId,
                [rootNode.id],
                rootNode.id,
            );
            rootId = fallbackGroupId;
        }
    }

    return {
        ...source,
        rootId,
        nodes: normalizedNodes,
    };
}

function ensureGroupHasPanelNode(
    dockState: DockState,
    groupId: DockNodeId,
): DockGroupNode | null {
    const groupNode = dockState.nodes[groupId];
    if (!isGroupNode(groupNode)) {
        return null;
    }
    return groupNode;
}

function inferTargetGroupForAdd(
    dockState: DockState,
    groupId?: DockNodeId,
): DockGroupNode | null {
    if (groupId) {
        const explicit = ensureGroupHasPanelNode(dockState, groupId);
        if (explicit) {
            return explicit;
        }
    }

    return findActiveGroup(dockState);
}

function applyAddPanel(
    dockState: DockState,
    payload: { title?: string; groupId?: DockNodeId } | undefined,
): DockState | null {
    const targetGroup = inferTargetGroupForAdd(dockState, payload?.groupId);
    if (!targetGroup) {
        return null;
    }

    const next = cloneDockState(dockState);
    const title = payload?.title?.trim() || `Panel ${Object.keys(next.nodes).length + 1}`;
    const panelId = uniqueNodeId(next, 'panel', Object.keys(next.nodes).length + 1);
    const panelNode = createPanelNode(panelId, title);
    next.nodes[panelNode.id] = panelNode;

    const group = ensureGroupHasPanelNode(next, targetGroup.id);
    if (!group) {
        return null;
    }

    group.links.children = [...group.links.children, panelNode.id];
    group.data.activePanelId = panelNode.id;
    next.nodes[group.id] = group;

    return normalizeDockTree(next);
}

function applyActivatePanel(
    dockState: DockState,
    payload: { panelId?: DockNodeId; groupId?: DockNodeId } | undefined,
): DockState | null {
    if (!payload?.panelId || !payload.groupId) {
        return null;
    }

    const next = cloneDockState(dockState);
    const group = ensureGroupHasPanelNode(next, payload.groupId);
    if (!group || !group.links.children.includes(payload.panelId)) {
        return null;
    }

    group.data.activePanelId = payload.panelId;
    next.nodes[group.id] = group;
    return normalizeDockTree(next);
}

function applyRemovePanel(
    dockState: DockState,
    payload: { panelId?: DockNodeId } | undefined,
): DockState | null {
    const panelId = payload?.panelId;
    if (!panelId) {
        return null;
    }

    const sourceGroup = findGroupContainingPanel(dockState, panelId);
    if (!sourceGroup) {
        return null;
    }

    const next = cloneDockState(dockState);
    const group = ensureGroupHasPanelNode(next, sourceGroup.id);
    if (!group) {
        return null;
    }

    group.links.children = removeFromArray(group.links.children, panelId);
    next.nodes[group.id] = normalizeGroupActivePanel(group);
    delete next.nodes[panelId];
    return normalizeDockTree(next);
}

function replaceChild(
    children: DockNodeId[],
    target: DockNodeId,
    replacement: DockNodeId,
): DockNodeId[] {
    return children.map((entry) => (entry === target ? replacement : entry));
}

function applySplitMove(
    next: DockState,
    sourceGroup: DockGroupNode,
    targetGroup: DockGroupNode,
    panelId: DockNodeId,
    zone: 'left' | 'right' | 'top' | 'bottom',
) {
    const newGroupId = uniqueNodeId(next, 'group', Object.keys(next.nodes).length + 1);
    const newGroup = createGroupNode(newGroupId, [panelId], panelId);
    next.nodes[newGroupId] = newGroup;

    const source = ensureGroupHasPanelNode(next, sourceGroup.id);
    if (!source) {
        return;
    }
    source.links.children = removeFromArray(source.links.children, panelId);
    next.nodes[source.id] = normalizeGroupActivePanel(source);

    const splitDirection: DockSplitDirection =
        zone === 'left' || zone === 'right' ? 'row' : 'col';
    const insertBefore = zone === 'left' || zone === 'top';

    const parentId = findParentNodeId(next, targetGroup.id);
    const targetParent = parentId ? next.nodes[parentId] : undefined;

    if (isSplitNode(targetParent) && targetParent.data.direction === splitDirection) {
        const currentChildren = [...targetParent.links.children];
        const targetIndex = currentChildren.indexOf(targetGroup.id);
        if (targetIndex < 0) {
            return;
        }
        const insertIndex = insertBefore ? targetIndex : targetIndex + 1;
        targetParent.links.children = insertInArray(
            currentChildren,
            newGroupId,
            insertIndex,
        );
        targetParent.data.weights = normalizeWeights(
            targetParent.data.weights,
            targetParent.links.children.length,
        );
        next.nodes[targetParent.id] = targetParent;
        return;
    }

    const splitId = uniqueNodeId(next, 'split', Object.keys(next.nodes).length + 1);
    const orderedChildren = insertBefore
        ? [newGroupId, targetGroup.id]
        : [targetGroup.id, newGroupId];
    const splitNode = createSplitNode(splitId, splitDirection, orderedChildren, [0.5, 0.5]);
    next.nodes[splitId] = splitNode;

    if (parentId) {
        const parentNode = next.nodes[parentId];
        if (!parentNode) {
            return;
        }
        parentNode.links.children = replaceChild(
            parentNode.links.children,
            targetGroup.id,
            splitId,
        );
        next.nodes[parentId] = parentNode;
        return;
    }

    if (next.rootId === targetGroup.id) {
        next.rootId = splitId;
    }
}

function applyMovePanel(
    dockState: DockState,
    payload: DockMovePanelIntentPayload | undefined,
): DockState | null {
    if (!payload?.panelId || !payload.targetGroupId) {
        return null;
    }

    const next = cloneDockState(dockState);
    const sourceGroup =
        (payload.sourceGroupId
            ? ensureGroupHasPanelNode(next, payload.sourceGroupId)
            : null) ?? findGroupContainingPanel(next, payload.panelId);
    const targetGroup = ensureGroupHasPanelNode(next, payload.targetGroupId);
    if (!sourceGroup || !targetGroup) {
        return null;
    }

    const zone = payload.zone ?? 'tabbar';
    if (
        sourceGroup.id === targetGroup.id &&
        (zone === 'left' || zone === 'right' || zone === 'top' || zone === 'bottom')
    ) {
        return null;
    }
    if (zone === 'left' || zone === 'right' || zone === 'top' || zone === 'bottom') {
        applySplitMove(next, sourceGroup, targetGroup, payload.panelId, zone);
        return normalizeDockTree(next);
    }

    const source = ensureGroupHasPanelNode(next, sourceGroup.id);
    const target = ensureGroupHasPanelNode(next, targetGroup.id);
    if (!source || !target) {
        return null;
    }
    const sourcePanelIndex = source.links.children.indexOf(payload.panelId);
    if (sourcePanelIndex < 0) {
        return null;
    }
    const sourceChildrenBeforeMove = [...source.links.children];

    source.links.children = removeFromArray(source.links.children, payload.panelId);
    next.nodes[source.id] = normalizeGroupActivePanel(source);

    const sameGroup = source.id === target.id;
    const baseChildren = sameGroup
        ? source.links.children
        : target.links.children;
    let insertionIndex: number;
    if (sameGroup) {
        const requestedIndex = toInsertionIndex(sourceChildrenBeforeMove.length, payload.index);
        const adjustedIndex =
            requestedIndex > sourcePanelIndex ? requestedIndex - 1 : requestedIndex;
        insertionIndex = Math.max(0, Math.min(baseChildren.length, adjustedIndex));
    } else {
        insertionIndex = toInsertionIndex(baseChildren.length, payload.index);
    }
    const nextChildren = insertInArray(baseChildren, payload.panelId, insertionIndex);
    target.links.children = nextChildren;
    target.data.activePanelId = payload.panelId;
    next.nodes[target.id] = normalizeGroupActivePanel(target);

    return normalizeDockTree(next);
}

function applyResize(
    dockState: DockState,
    payload: DockResizeIntentPayload | undefined,
): DockState | null {
    if (!payload?.splitId || !Array.isArray(payload.weights)) {
        return null;
    }

    const next = cloneDockState(dockState);
    const node = next.nodes[payload.splitId];
    if (!isSplitNode(node)) {
        return null;
    }

    node.data.weights = normalizeWeights(payload.weights, node.links.children.length);
    next.nodes[node.id] = node;
    return next;
}

function applyDockIntent(
    dockState: DockState,
    intent: keyof DockIntents,
    payload: unknown,
): DockState | null {
    if (intent === 'addPanel') {
        return applyAddPanel(
            dockState,
            payload as { title?: string; groupId?: DockNodeId } | undefined,
        );
    }
    if (intent === 'removePanel') {
        return applyRemovePanel(
            dockState,
            payload as { panelId?: DockNodeId } | undefined,
        );
    }
    if (intent === 'activatePanel') {
        return applyActivatePanel(
            dockState,
            payload as { panelId?: DockNodeId; groupId?: DockNodeId } | undefined,
        );
    }
    if (intent === 'movePanel') {
        return applyMovePanel(
            dockState,
            payload as DockMovePanelIntentPayload | undefined,
        );
    }
    return applyResize(dockState, payload as DockResizeIntentPayload | undefined);
}

export function registerDockIntents<TState extends GraphState>(
    store: GraphiteStore<TState>,
    options: RegisterDockIntentsOptions = {},
): DockIntents {
    const path = options.path ?? ['dock'];
    const intentNames = createDockIntentNames(options.intentPrefix ?? 'dock');

    const register = (intent: keyof DockIntents) => {
        const intentName = intentNames[intent];
        store.registerIntent(
            intentName,
            (payload: unknown, context: IntentCompilerContext<TState>) => {
            const dockState = getDockStateAtPath(context.state, path);
            if (!dockState) {
                return null;
            }

            const nextState = applyDockIntent(dockState, intent, payload);
            if (!nextState) {
                return null;
            }

            return patchSetAtPath(path, nextState);
            },
        );
    };

    register('addPanel');
    register('removePanel');
    register('activatePanel');
    register('movePanel');
    register('resize');

    return intentNames;
}

export function createDockPanelQuery<TState extends GraphState>(
    options: {
        path?: GraphPath;
    } = {},
) {
    const path = options.path ?? ['dock'];
    return (state: Readonly<TState>): DockPanelSummary[] => {
        const dockState = getDockStateAtPath(state, path);
        if (!dockState) {
            return [];
        }

        const panels: DockPanelSummary[] = [];
        for (const node of Object.values(dockState.nodes)) {
            if (!isGroupNode(node)) {
                continue;
            }

            for (const childId of node.links.children) {
                const childNode = dockState.nodes[childId];
                if (!childNode || childNode.kind !== 'panel') {
                    continue;
                }
                panels.push({
                    id: childNode.id,
                    title: childNode.data.title,
                    groupId: node.id,
                });
            }
        }

        return panels;
    };
}

export function removeDockStateAtPath<TState extends GraphState>(
    path: GraphPath,
): Record<string, unknown> {
    return patchDeleteAtPath(path);
}

export function normalizeDockState(dockState: DockState): DockState {
    return normalizeDockTree(dockState);
}

export function serializeDockState(dockState: DockState): string {
    return JSON.stringify(normalizeDockTree(dockState));
}

export function deserializeDockState(serialized: string): DockState {
    const parsed = JSON.parse(serialized) as DockState;
    return normalizeDockTree(parsed);
}
