export const DOCK_SCHEMA_VERSION = 1;
const DEFAULT_EPSILON = 1e-6;
const DEFAULT_PANEL_TITLE = 'Panel';
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
function cloneValue(value) {
    const structured = globalThis.structuredClone;
    if (typeof structured === 'function') {
        try {
            return structured(value);
        }
        catch {
            // fallback
        }
    }
    return JSON.parse(JSON.stringify(value));
}
function createId(prefix) {
    const random = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).slice(2, 10);
    return `${prefix}-${random}`;
}
function toIds(value) {
    if (!Array.isArray(value))
        return [];
    const next = [];
    for (const entry of value) {
        if (typeof entry !== 'string')
            continue;
        const id = entry.trim();
        if (!id || next.includes(id))
            continue;
        next.push(id);
    }
    return next;
}
function nodeChildren(node) {
    if (!node)
        return [];
    return toIds(node.links?.children);
}
function setNodeChildren(node, children) {
    node.links = node.links ?? {};
    node.links.children = [...children];
}
function nodeParentId(node) {
    if (!node)
        return undefined;
    return toIds(node.links?.parent)[0];
}
function setNodeParent(node, parentId) {
    node.links = node.links ?? {};
    if (!parentId) {
        delete node.links.parent;
        return;
    }
    node.links.parent = [parentId];
}
function normalizeRect(value) {
    const input = isRecord(value) ? value : {};
    const toNum = (entry, fallback) => {
        const next = Number(entry);
        return Number.isFinite(next) ? next : fallback;
    };
    return {
        x: toNum(input.x, 0),
        y: toNum(input.y, 0),
        width: Math.max(60, toNum(input.width, 320)),
        height: Math.max(60, toNum(input.height, 220)),
    };
}
function normalizeWeights(weights, count, epsilon) {
    if (count <= 0)
        return [];
    const next = weights
        .slice(0, count)
        .map((entry) => Number(entry))
        .map((entry) => (Number.isFinite(entry) && entry > 0 ? entry : 0));
    if (next.length !== count) {
        return Array.from({ length: count }, () => 1 / count);
    }
    const total = next.reduce((sum, value) => sum + value, 0);
    if (!Number.isFinite(total) || total <= epsilon) {
        return Array.from({ length: count }, () => 1 / count);
    }
    const normalized = next.map((value) => value / total);
    const head = normalized.slice(0, normalized.length - 1);
    normalized[normalized.length - 1] = 1 - head.reduce((sum, value) => sum + value, 0);
    return normalized;
}
function isStructuralNode(node) {
    return Boolean(node && (node.kind === 'split' || node.kind === 'group' || node.kind === 'panel'));
}
export function createPanelNode(id, title = DEFAULT_PANEL_TITLE, data = {}) {
    return {
        id,
        kind: 'panel',
        data: {
            title,
            ...data,
        },
        links: {
            children: [],
        },
    };
}
export function createGroupNode(id, panelIds, activePanelId) {
    return {
        id,
        kind: 'group',
        data: {
            activePanelId: activePanelId ?? panelIds[0] ?? null,
        },
        links: {
            children: [...panelIds],
        },
    };
}
export function createSplitNode(id, direction, childIds, weights) {
    return {
        id,
        kind: 'split',
        data: {
            direction,
            weights: normalizeWeights(weights ?? [], childIds.length, DEFAULT_EPSILON),
        },
        links: {
            children: [...childIds],
        },
    };
}
export function createFloatRootNode(id) {
    return {
        id,
        kind: 'float-root',
        data: {},
        links: {
            children: [],
        },
    };
}
export function createFloatWindowNode(id, childId, rect) {
    return {
        id,
        kind: 'float-window',
        data: {
            rect: normalizeRect(rect),
        },
        links: {
            children: [childId],
        },
    };
}
export function cloneDockState(state) {
    return cloneValue(state);
}
/**
 * Creates a valid dock state. Any partial/invalid input graph is normalized.
 */
export function createDockState(init = {}) {
    const firstPanel = createPanelNode(createId('panel'), 'Welcome');
    const firstGroup = createGroupNode(createId('group'), [firstPanel.id], firstPanel.id);
    const floatRoot = createFloatRootNode(init.floatRootId ?? createId('float-root'));
    const state = {
        dockMeta: {
            schemaVersion: DOCK_SCHEMA_VERSION,
        },
        rootId: init.rootId ?? firstGroup.id,
        floatRootId: floatRoot.id,
        nodes: {
            [firstPanel.id]: firstPanel,
            [firstGroup.id]: firstGroup,
            [floatRoot.id]: floatRoot,
            ...(init.nodes ?? {}),
        },
    };
    normalizeDock(state);
    return state;
}
/**
 * Convenience helper to boot a valid dock tree from a flat panel list.
 */
export function createDockStateFromPanels(panels) {
    const entries = panels.length > 0 ? panels : [{ title: 'Panel 1' }];
    const nodes = {};
    const panelIds = [];
    for (const entry of entries) {
        const panelId = entry.id ?? createId('panel');
        panelIds.push(panelId);
        nodes[panelId] = createPanelNode(panelId, entry.title ?? DEFAULT_PANEL_TITLE);
    }
    const group = createGroupNode(createId('group'), panelIds, panelIds[0]);
    const floatRoot = createFloatRootNode(createId('float-root'));
    nodes[group.id] = group;
    nodes[floatRoot.id] = floatRoot;
    const state = {
        dockMeta: {
            schemaVersion: DOCK_SCHEMA_VERSION,
        },
        rootId: group.id,
        floatRootId: floatRoot.id,
        nodes,
    };
    normalizeDock(state);
    return state;
}
const migrations = {
    1: (state) => {
        state.dockMeta = { schemaVersion: 1 };
    },
};
/**
 * Hydrates unknown persisted data and migrates it to the current dock schema.
 */
export function migrateDockState(input) {
    if (!isRecord(input)) {
        return createDockState();
    }
    const raw = input;
    const state = {
        dockMeta: {
            schemaVersion: Number.isFinite(Number(raw.dockMeta?.schemaVersion))
                ? Math.max(0, Math.trunc(Number(raw.dockMeta?.schemaVersion)))
                : 0,
        },
        rootId: typeof raw.rootId === 'string' ? raw.rootId : createId('group'),
        floatRootId: typeof raw.floatRootId === 'string' ? raw.floatRootId : createId('float-root'),
        nodes: {},
    };
    if (isRecord(raw.nodes)) {
        for (const [nodeId, value] of Object.entries(raw.nodes)) {
            if (!isRecord(value))
                continue;
            if (typeof value.id !== 'string')
                continue;
            if (value.kind !== 'split' &&
                value.kind !== 'group' &&
                value.kind !== 'panel' &&
                value.kind !== 'float-root' &&
                value.kind !== 'float-window') {
                continue;
            }
            state.nodes[nodeId] = {
                id: value.id,
                kind: value.kind,
                data: isRecord(value.data) ? { ...value.data } : {},
                links: {
                    children: toIds(value.links?.children),
                    parent: toIds(value.links?.parent),
                },
            };
        }
    }
    const fromVersion = state.dockMeta.schemaVersion;
    for (let version = fromVersion + 1; version <= DOCK_SCHEMA_VERSION; version += 1) {
        const migration = migrations[version];
        if (migration)
            migration(state);
    }
    state.dockMeta.schemaVersion = DOCK_SCHEMA_VERSION;
    normalizeDock(state);
    return state;
}
function ensureFloatRoot(state) {
    const existing = state.nodes[state.floatRootId];
    if (existing && existing.kind === 'float-root') {
        existing.links = existing.links ?? {};
        existing.links.children = toIds(existing.links.children);
        return existing;
    }
    const created = createFloatRootNode(createId('float-root'));
    state.floatRootId = created.id;
    state.nodes[created.id] = created;
    return created;
}
function ensureRoot(state) {
    const current = state.nodes[state.rootId];
    if (isStructuralNode(current))
        return current.id;
    for (const node of Object.values(state.nodes)) {
        if (isStructuralNode(node)) {
            state.rootId = node.id;
            return node.id;
        }
    }
    const panel = createPanelNode(createId('panel'), DEFAULT_PANEL_TITLE);
    const group = createGroupNode(createId('group'), [panel.id], panel.id);
    state.nodes[panel.id] = panel;
    state.nodes[group.id] = group;
    state.rootId = group.id;
    return group.id;
}
function sanitizeNodeShapes(state) {
    for (const node of Object.values(state.nodes)) {
        node.links = node.links ?? {};
        node.links.children = toIds(node.links.children);
        const parent = toIds(node.links.parent);
        if (parent.length > 0 && typeof parent[0] === 'string') {
            node.links.parent = [parent[0]];
        }
        else {
            delete node.links.parent;
        }
        if (node.kind === 'panel') {
            node.data = isRecord(node.data) ? node.data : {};
            node.links.children = [];
            continue;
        }
        if (node.kind === 'group') {
            node.data = isRecord(node.data)
                ? node.data
                : { activePanelId: null };
            continue;
        }
        if (node.kind === 'split') {
            node.data = isRecord(node.data)
                ? node.data
                : { direction: 'row', weights: [] };
            node.data.direction = node.data.direction === 'col' ? 'col' : 'row';
            continue;
        }
        if (node.kind === 'float-window') {
            node.data = isRecord(node.data)
                ? node.data
                : { rect: normalizeRect(undefined) };
            node.data.rect = normalizeRect(node.data.rect);
        }
    }
}
function buildParentMap(state) {
    const parentByChild = new Map();
    for (const node of Object.values(state.nodes)) {
        const nextChildren = [];
        for (const childId of nodeChildren(node)) {
            if (!state.nodes[childId])
                continue;
            if (childId === node.id)
                continue;
            if (parentByChild.has(childId))
                continue;
            parentByChild.set(childId, node.id);
            nextChildren.push(childId);
        }
        setNodeChildren(node, nextChildren);
    }
    for (const node of Object.values(state.nodes)) {
        const parentId = parentByChild.get(node.id);
        setNodeParent(node, parentId);
    }
    return parentByChild;
}
function pruneToStructuralRoot(state) {
    const keep = new Set();
    const visit = (id) => {
        if (keep.has(id))
            return;
        const node = state.nodes[id];
        if (!isStructuralNode(node))
            return;
        keep.add(id);
        for (const childId of nodeChildren(node)) {
            visit(childId);
        }
    };
    visit(state.rootId);
    const floatRoot = state.nodes[state.floatRootId];
    if (floatRoot && floatRoot.kind === 'float-root') {
        keep.add(floatRoot.id);
        const nextFloatChildren = [];
        for (const windowId of nodeChildren(floatRoot)) {
            const windowNode = state.nodes[windowId];
            if (!windowNode || windowNode.kind !== 'float-window')
                continue;
            const childId = nodeChildren(windowNode).find((candidate) => {
                const child = state.nodes[candidate];
                return Boolean(child && isStructuralNode(child) && !keep.has(candidate));
            });
            if (!childId)
                continue;
            nextFloatChildren.push(windowId);
            keep.add(windowId);
            keep.add(childId);
            setNodeChildren(windowNode, [childId]);
            setNodeParent(windowNode, floatRoot.id);
            const childNode = state.nodes[childId];
            if (childNode) {
                setNodeParent(childNode, windowNode.id);
            }
        }
        setNodeChildren(floatRoot, nextFloatChildren);
        setNodeParent(floatRoot, undefined);
    }
    for (const nodeId of Object.keys(state.nodes)) {
        if (!keep.has(nodeId)) {
            delete state.nodes[nodeId];
        }
    }
}
function compressStructuralNode(state, nodeId) {
    const node = state.nodes[nodeId];
    if (!node || !isStructuralNode(node))
        return null;
    if (node.kind === 'panel') {
        setNodeChildren(node, []);
        return node.id;
    }
    if (node.kind === 'group') {
        const panels = nodeChildren(node).filter((id) => state.nodes[id]?.kind === 'panel');
        setNodeChildren(node, panels);
        const active = node.data.activePanelId;
        node.data.activePanelId = typeof active === 'string' && panels.includes(active) ? active : panels[0] ?? null;
        return panels.length > 0 ? node.id : null;
    }
    const children = nodeChildren(node)
        .map((id) => compressStructuralNode(state, id))
        .filter((id) => typeof id === 'string' && Boolean(state.nodes[id]));
    const unique = [];
    for (const childId of children) {
        if (!unique.includes(childId)) {
            unique.push(childId);
        }
    }
    if (unique.length === 0)
        return null;
    if (unique.length === 1)
        return unique[0] ?? null;
    setNodeChildren(node, unique);
    node.data.weights = normalizeWeights(node.data.weights, unique.length, DEFAULT_EPSILON);
    return node.id;
}
/**
 * Enforces structural invariants (root validity, parent consistency, split/group shape).
 */
export function normalizeDock(state, options = {}) {
    const epsilon = Number.isFinite(options.epsilon) ? Math.max(1e-9, options.epsilon ?? DEFAULT_EPSILON) : DEFAULT_EPSILON;
    state.dockMeta = {
        schemaVersion: DOCK_SCHEMA_VERSION,
    };
    state.nodes = isRecord(state.nodes) ? state.nodes : {};
    sanitizeNodeShapes(state);
    ensureFloatRoot(state);
    ensureRoot(state);
    buildParentMap(state);
    const compressedRoot = compressStructuralNode(state, state.rootId);
    if (!compressedRoot) {
        const panel = createPanelNode(createId('panel'), DEFAULT_PANEL_TITLE);
        const group = createGroupNode(createId('group'), [panel.id], panel.id);
        state.nodes[panel.id] = panel;
        state.nodes[group.id] = group;
        state.rootId = group.id;
    }
    else {
        state.rootId = compressedRoot;
    }
    buildParentMap(state);
    const rootNode = state.nodes[state.rootId];
    if (rootNode) {
        setNodeParent(rootNode, undefined);
    }
    const floatRoot = ensureFloatRoot(state);
    setNodeParent(floatRoot, undefined);
    for (const windowId of nodeChildren(floatRoot)) {
        const windowNode = state.nodes[windowId];
        if (!windowNode || windowNode.kind !== 'float-window')
            continue;
        windowNode.data.rect = normalizeRect(windowNode.data.rect);
        setNodeParent(windowNode, floatRoot.id);
    }
    pruneToStructuralRoot(state);
    for (const node of Object.values(state.nodes)) {
        if (node.kind === 'split') {
            node.data.weights = normalizeWeights(node.data.weights, nodeChildren(node).length, epsilon);
        }
    }
}
function findGroupContainingPanel(state, panelId) {
    const panel = state.nodes[panelId];
    if (!panel || panel.kind !== 'panel')
        return null;
    const parentId = nodeParentId(panel);
    if (parentId) {
        const parent = state.nodes[parentId];
        if (parent?.kind === 'group' && nodeChildren(parent).includes(panelId)) {
            return parent;
        }
    }
    for (const node of Object.values(state.nodes)) {
        if (node.kind === 'group' && nodeChildren(node).includes(panelId)) {
            return node;
        }
    }
    return null;
}
function findFirstGroup(state, nodeId, seen = new Set()) {
    if (seen.has(nodeId))
        return null;
    seen.add(nodeId);
    const node = state.nodes[nodeId];
    if (!node || !isStructuralNode(node))
        return null;
    if (node.kind === 'group')
        return node;
    for (const childId of nodeChildren(node)) {
        const found = findFirstGroup(state, childId, seen);
        if (found)
            return found;
    }
    return null;
}
function findParentByChildMembership(state, childId) {
    const hintedParentId = nodeParentId(state.nodes[childId]);
    if (hintedParentId) {
        const hintedParent = state.nodes[hintedParentId];
        if (hintedParent && nodeChildren(hintedParent).includes(childId)) {
            return hintedParentId;
        }
    }
    for (const node of Object.values(state.nodes)) {
        if (nodeChildren(node).includes(childId)) {
            return node.id;
        }
    }
    return undefined;
}
function detachPanel(state, panelId) {
    const group = findGroupContainingPanel(state, panelId);
    if (!group)
        return null;
    const remaining = nodeChildren(group).filter((id) => id !== panelId);
    setNodeChildren(group, remaining);
    if (!group.data.activePanelId || !remaining.includes(group.data.activePanelId)) {
        group.data.activePanelId = remaining[0] ?? null;
    }
    return group;
}
function applyMovePanel(state, payload) {
    const panel = state.nodes[payload.panelId];
    const targetGroup = state.nodes[payload.target.groupId];
    if (!panel || panel.kind !== 'panel' || !targetGroup || targetGroup.kind !== 'group') {
        return false;
    }
    const sourceGroup = findGroupContainingPanel(state, payload.panelId);
    if (!sourceGroup)
        return false;
    if (payload.target.zone === 'center' || payload.target.zone === 'tabbar') {
        if (sourceGroup.id === targetGroup.id && payload.target.zone === 'center') {
            const activeChanged = targetGroup.data.activePanelId !== payload.panelId;
            targetGroup.data.activePanelId = payload.panelId;
            return activeChanged;
        }
        const sourceChildrenBefore = nodeChildren(sourceGroup);
        const sourceIndexBefore = sourceChildrenBefore.indexOf(payload.panelId);
        const targetChildrenBefore = nodeChildren(targetGroup);
        const requestedIndex = typeof payload.target.index === 'number'
            ? Math.max(0, Math.trunc(payload.target.index))
            : null;
        const remainingSource = detachPanel(state, payload.panelId);
        if (!remainingSource)
            return false;
        const targetChildren = nodeChildren(targetGroup).filter((id) => id !== payload.panelId);
        let insertionIndex;
        if (requestedIndex === null || payload.target.zone === 'center') {
            insertionIndex = targetChildren.length;
        }
        else {
            let normalizedRequestedIndex = requestedIndex;
            if (sourceGroup.id === targetGroup.id &&
                sourceIndexBefore >= 0 &&
                sourceIndexBefore < requestedIndex) {
                normalizedRequestedIndex -= 1;
            }
            insertionIndex = Math.max(0, Math.min(targetChildren.length, normalizedRequestedIndex));
        }
        targetChildren.splice(insertionIndex, 0, payload.panelId);
        setNodeChildren(targetGroup, targetChildren);
        const activeChanged = targetGroup.data.activePanelId !== payload.panelId;
        targetGroup.data.activePanelId = payload.panelId;
        if (sourceGroup.id === targetGroup.id) {
            const orderChanged = sourceChildrenBefore.join('|') !== targetChildren.join('|') ||
                targetChildrenBefore.join('|') !== targetChildren.join('|');
            return orderChanged || activeChanged;
        }
        return true;
    }
    if (sourceGroup.id === targetGroup.id && nodeChildren(sourceGroup).length <= 1) {
        return false;
    }
    const remainingSource = detachPanel(state, payload.panelId);
    if (!remainingSource)
        return false;
    const wrapper = createGroupNode(createId('group'), [payload.panelId], payload.panelId);
    state.nodes[wrapper.id] = wrapper;
    const direction = payload.target.zone === 'left' || payload.target.zone === 'right' ? 'row' : 'col';
    const targetParentId = findParentByChildMembership(state, targetGroup.id);
    const targetParent = targetParentId ? state.nodes[targetParentId] : undefined;
    if (targetParent && targetParent.kind === 'split' && targetParent.data.direction === direction) {
        const children = nodeChildren(targetParent);
        const targetIndex = children.indexOf(targetGroup.id);
        if (targetIndex >= 0) {
            const insertIndex = payload.target.zone === 'left' || payload.target.zone === 'top'
                ? targetIndex
                : targetIndex + 1;
            children.splice(insertIndex, 0, wrapper.id);
            setNodeChildren(targetParent, children);
            targetParent.data.weights = normalizeWeights(targetParent.data.weights, children.length, DEFAULT_EPSILON);
            return true;
        }
    }
    const split = createSplitNode(createId('split'), direction, payload.target.zone === 'left' || payload.target.zone === 'top'
        ? [wrapper.id, targetGroup.id]
        : [targetGroup.id, wrapper.id], [0.5, 0.5]);
    state.nodes[split.id] = split;
    if (!targetParentId) {
        state.rootId = split.id;
    }
    else {
        const parent = state.nodes[targetParentId];
        if (!parent)
            return false;
        const children = nodeChildren(parent);
        const index = children.indexOf(targetGroup.id);
        if (index < 0)
            return false;
        children[index] = split.id;
        setNodeChildren(parent, children);
        if (parent.kind === 'split') {
            parent.data.weights = normalizeWeights(parent.data.weights, children.length, DEFAULT_EPSILON);
        }
    }
    return true;
}
function applyReducer(state, action) {
    switch (action.type) {
        case 'activate-panel': {
            const group = state.nodes[action.payload.groupId];
            if (!group || group.kind !== 'group')
                return false;
            if (!nodeChildren(group).includes(action.payload.panelId))
                return false;
            if (group.data.activePanelId === action.payload.panelId)
                return false;
            group.data.activePanelId = action.payload.panelId;
            return true;
        }
        case 'move-panel':
            return applyMovePanel(state, action.payload);
        case 'resize-split': {
            const split = state.nodes[action.payload.splitId];
            if (!split || split.kind !== 'split')
                return false;
            const children = nodeChildren(split);
            if (children.length < 2)
                return false;
            split.data.weights = normalizeWeights(action.payload.weights, children.length, DEFAULT_EPSILON);
            return true;
        }
        case 'remove-panel': {
            const panel = state.nodes[action.payload.panelId];
            if (!panel || panel.kind !== 'panel')
                return false;
            detachPanel(state, action.payload.panelId);
            delete state.nodes[action.payload.panelId];
            return true;
        }
        case 'add-panel': {
            const panelId = action.payload.panelId?.trim() || createId('panel');
            if (state.nodes[panelId])
                return false;
            state.nodes[panelId] = createPanelNode(panelId, action.payload.title ?? DEFAULT_PANEL_TITLE);
            const preferred = action.payload.groupId ? state.nodes[action.payload.groupId] : undefined;
            const group = preferred && preferred.kind === 'group'
                ? preferred
                : findFirstGroup(state, state.rootId);
            if (!group) {
                const nextGroup = createGroupNode(createId('group'), [panelId], panelId);
                state.nodes[nextGroup.id] = nextGroup;
                state.rootId = nextGroup.id;
            }
            else {
                const children = nodeChildren(group);
                children.push(panelId);
                setNodeChildren(group, children);
                if (action.payload.activate ?? true) {
                    group.data.activePanelId = panelId;
                }
            }
            return true;
        }
        default:
            return false;
    }
}
/**
 * Applies one semantic dock action and returns a normalized next state when changed.
 */
export function reduceDockIntent(state, action) {
    const draft = cloneDockState(state);
    const changed = applyReducer(draft, action);
    if (!changed)
        return null;
    normalizeDock(draft);
    return draft;
}
export function applyDockPolicy(state, policy = {}) {
    const minWeight = Math.max(0, Math.min(0.45, Number(policy.minWeight ?? 0)));
    for (const node of Object.values(state.nodes)) {
        if (node.kind !== 'split')
            continue;
        const childCount = nodeChildren(node).length;
        if (childCount < 2)
            continue;
        let weights = normalizeWeights(node.data.weights, childCount, DEFAULT_EPSILON);
        if (minWeight > 0) {
            weights = weights.map((value) => Math.max(minWeight, value));
            weights = normalizeWeights(weights, childCount, DEFAULT_EPSILON);
        }
        if (policy.rebalanceSplits) {
            weights = Array.from({ length: childCount }, () => 1 / childCount);
        }
        node.data.weights = weights;
    }
}
/**
 * Reports invariant violations without mutating state.
 */
export function assertDockInvariants(state, epsilon = DEFAULT_EPSILON) {
    const issues = [];
    const root = state.nodes[state.rootId];
    if (!root || !isStructuralNode(root)) {
        issues.push({ code: 'root.invalid', message: 'Missing structural root node.' });
    }
    const floatRoot = state.nodes[state.floatRootId];
    if (!floatRoot || floatRoot.kind !== 'float-root') {
        issues.push({ code: 'float-root.invalid', message: 'Missing float root node.' });
    }
    const parentCounts = new Map();
    for (const node of Object.values(state.nodes)) {
        for (const childId of nodeChildren(node)) {
            parentCounts.set(childId, (parentCounts.get(childId) ?? 0) + 1);
        }
    }
    for (const [nodeId, count] of parentCounts.entries()) {
        if (count > 1) {
            issues.push({
                code: 'node.multi-parent',
                nodeId,
                message: `Node "${nodeId}" has ${count.toString(10)} parents.`,
            });
        }
    }
    for (const node of Object.values(state.nodes)) {
        if (node.kind === 'split') {
            const children = nodeChildren(node);
            if (children.length < 2) {
                issues.push({ code: 'split.children', nodeId: node.id, message: 'Split must have at least two children.' });
            }
            if (node.data.weights.length !== children.length) {
                issues.push({ code: 'split.weights.length', nodeId: node.id, message: 'Split weights length mismatch.' });
            }
            const total = node.data.weights.reduce((sum, value) => sum + value, 0);
            if (Math.abs(total - 1) > epsilon) {
                issues.push({ code: 'split.weights.sum', nodeId: node.id, message: 'Split weights must sum to 1.' });
            }
            continue;
        }
        if (node.kind === 'group') {
            const children = nodeChildren(node);
            if (children.length < 1) {
                issues.push({ code: 'group.children', nodeId: node.id, message: 'Group must contain at least one panel.' });
            }
            for (const childId of children) {
                if (state.nodes[childId]?.kind !== 'panel') {
                    issues.push({ code: 'group.child.kind', nodeId: node.id, message: 'Group children must be panels.' });
                }
            }
            if (!node.data.activePanelId || !children.includes(node.data.activePanelId)) {
                issues.push({ code: 'group.active', nodeId: node.id, message: 'Group active panel must reference a child.' });
            }
            continue;
        }
        if (node.kind === 'panel' && nodeChildren(node).length > 0) {
            issues.push({ code: 'panel.children', nodeId: node.id, message: 'Panels may not have children.' });
            continue;
        }
        if (node.kind === 'float-window') {
            if (nodeChildren(node).length !== 1) {
                issues.push({ code: 'float-window.children', nodeId: node.id, message: 'Float window must have exactly one child.' });
            }
        }
    }
    return issues;
}
//# sourceMappingURL=model.js.map