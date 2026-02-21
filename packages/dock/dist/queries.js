import { computeLayoutRects, } from './geometry';
import { migrateDockState } from './model';
function readAtPath(root, path) {
    let current = root;
    for (const segment of path) {
        if (typeof current !== 'object' || current === null) {
            return undefined;
        }
        current = current[String(segment)];
    }
    return current;
}
function resolveDock(state, options) {
    const raw = options.selectDock ? options.selectDock(state) : readAtPath(state, options.path ?? ['dock']);
    return migrateDockState(raw);
}
export function createDockLayoutQuery(bounds, queryOptions = {}, layoutOptions = {}) {
    return (state) => {
        const dockState = resolveDock(state, queryOptions);
        return computeLayoutRects(dockState, bounds, layoutOptions);
    };
}
export function createDockPanelQuery(options = {}) {
    return (state) => {
        const dockState = resolveDock(state, options);
        const panels = [];
        for (const node of Object.values(dockState.nodes)) {
            if (node.kind !== 'panel')
                continue;
            const panel = node;
            const groupId = panel.links?.parent?.[0];
            panels.push({
                id: panel.id,
                title: typeof panel.data?.title === 'string' ? panel.data.title : panel.id,
                groupId,
            });
        }
        panels.sort((left, right) => left.title.localeCompare(right.title));
        return panels;
    };
}
export function createDockFocusQuery(options = {}) {
    return (state) => {
        const dockState = resolveDock(state, options);
        const root = dockState.nodes[dockState.rootId];
        if (!root) {
            return {
                activeGroupId: null,
                activePanelId: null,
            };
        }
        const stack = [root.id];
        const visited = new Set();
        while (stack.length > 0) {
            const nextId = stack.shift();
            if (!nextId || visited.has(nextId))
                continue;
            visited.add(nextId);
            const node = dockState.nodes[nextId];
            if (!node)
                continue;
            if (node.kind === 'group') {
                return {
                    activeGroupId: node.id,
                    activePanelId: typeof node.data.activePanelId === 'string' ? node.data.activePanelId : null,
                };
            }
            for (const childId of node.links?.children ?? []) {
                stack.push(childId);
            }
        }
        return {
            activeGroupId: null,
            activePanelId: null,
        };
    };
}
//# sourceMappingURL=queries.js.map