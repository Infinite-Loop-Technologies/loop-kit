import type { DragEndEvent, DragMoveEvent } from '@dnd-kit/core';
import type {
    DockGroupNode,
    DockNodeId,
    DockState,
    Point,
} from '@loop-kit/dock';

export function panelTitle(dock: DockState, panelId: DockNodeId): string {
    const node = dock.nodes[panelId];
    if (!node || node.kind !== 'panel') return panelId;
    return typeof node.data.title === 'string' ? node.data.title : panelId;
}

export function getRootGroup(dock: DockState): DockGroupNode | null {
    const seen = new Set<string>();
    const queue = [dock.rootId];

    while (queue.length > 0) {
        const nodeId = queue.shift();
        if (!nodeId || seen.has(nodeId)) continue;
        seen.add(nodeId);

        const node = dock.nodes[nodeId];
        if (!node) continue;
        if (node.kind === 'group') return node;

        for (const childId of node.links?.children ?? []) {
            queue.push(childId);
        }
    }

    return null;
}

export function getActivePanelRef(
    dock: DockState,
): { groupId: DockNodeId; panelId: DockNodeId } | null {
    const group = getRootGroup(dock);
    if (!group) return null;

    const panelId =
        typeof group.data.activePanelId === 'string'
            ? group.data.activePanelId
            : group.links?.children?.[0];
    if (!panelId) return null;

    return {
        groupId: group.id,
        panelId,
    };
}

export function dragCenterFromEvent(
    event: DragMoveEvent | DragEndEvent,
): Point | null {
    const translated = event.active.rect.current.translated;
    if (!translated) return null;
    return {
        x: translated.left + translated.width / 2,
        y: translated.top + translated.height / 2,
    };
}
