import type {
    DockV2FlowConfig,
    DockV2Group,
    DockV2GroupPolicies,
    DockV2Layer,
    DockV2LayerId,
    DockV2Panel,
    DockV2State,
} from './types.js';

type LegacyDockNodeId = string;
type LegacyDockPanelNode = {
    id: LegacyDockNodeId;
    kind: 'panel';
    data: {
        title: string;
    };
    links: {
        children: [];
    };
};

type LegacyDockGroupNode = {
    id: LegacyDockNodeId;
    kind: 'group';
    data: {
        activePanelId?: LegacyDockNodeId;
    };
    links: {
        children: LegacyDockNodeId[];
    };
};

type LegacyDockSplitNode = {
    id: LegacyDockNodeId;
    kind: 'split';
    data: {
        direction: 'row' | 'col';
        weights: number[];
    };
    links: {
        children: LegacyDockNodeId[];
    };
};

type LegacyDockNode = LegacyDockPanelNode | LegacyDockGroupNode | LegacyDockSplitNode;
type LegacyDockState = {
    floatRootId?: string;
    nodes: Record<LegacyDockNodeId, LegacyDockNode>;
    rootId: LegacyDockNodeId;
};

const DEFAULT_GROUP_POLICIES: DockV2GroupPolicies = {
    attachable: true,
    closeable: true,
    movable: true,
    reorderable: true,
    resizable: true,
    splittable: true,
    stackable: true,
};

const DEFAULT_FLOW: DockV2FlowConfig = {
    direction: 'horizontal',
    reorder: 'horizontal-only',
};

export function normalizeDockV2Policies(
    policies?: Partial<DockV2GroupPolicies>,
): DockV2GroupPolicies {
    return {
        ...DEFAULT_GROUP_POLICIES,
        ...(policies ?? {}),
    };
}

export function normalizeWeights(weights: [number, number]): [number, number] {
    const left = Number.isFinite(weights[0]) ? Math.max(0.01, weights[0]) : 0.5;
    const right = Number.isFinite(weights[1]) ? Math.max(0.01, weights[1]) : 0.5;
    const sum = left + right;
    return [left / sum, right / sum];
}

export function createDockV2Panel(panel: DockV2Panel): DockV2Panel {
    return {
        ...panel,
        meta: panel.meta ? { ...panel.meta } : undefined,
        props: panel.props ? { ...panel.props } : undefined,
    };
}

export function createDockV2Group(group: DockV2Group): DockV2Group {
    return {
        ...group,
        activePanelId:
            group.activePanelId && group.panelIds.includes(group.activePanelId)
                ? group.activePanelId
                : group.panelIds[0],
        chrome: group.chrome ? { ...group.chrome } : undefined,
        layout: group.layout
            ? {
                  ...group.layout,
                  placement: group.layout.placement
                      ? { ...group.layout.placement }
                      : undefined,
              }
            : undefined,
        meta: group.meta ? { ...group.meta } : undefined,
        panelIds: [...group.panelIds],
        policies: normalizeDockV2Policies(group.policies),
        splitNodes: group.splitNodes
            ? Object.fromEntries(
                  Object.entries(group.splitNodes).map(([id, node]) => [
                      id,
                      {
                          ...node,
                          children: [
                              { ...node.children[0] },
                              { ...node.children[1] },
                          ] as typeof node.children,
                          weights: normalizeWeights(node.weights),
                      },
                  ]),
              )
            : undefined,
    };
}

export function createDockV2Layer(layer: DockV2Layer): DockV2Layer {
    return {
        ...layer,
        floating: layer.kind === 'floating' ? { reorder: 'free' } : undefined,
        flow: layer.kind === 'flow' ? { ...DEFAULT_FLOW, ...(layer.flow ?? {}) } : undefined,
        groupIds: [...layer.groupIds],
        meta: layer.meta ? { ...layer.meta } : undefined,
        overlay:
            layer.kind === 'overlay'
                ? {
                      behavior: 'replace',
                      interaction: 'modal',
                      ...(layer.overlay ?? {}),
                  }
                : undefined,
    };
}

export function createDockV2State(state: DockV2State): DockV2State {
    return {
        ...state,
        groups: Object.fromEntries(
            Object.entries(state.groups).map(([id, group]) => [id, createDockV2Group(group)]),
        ),
        layerOrder: [...state.layerOrder],
        layers: Object.fromEntries(
            Object.entries(state.layers).map(([id, layer]) => [id, createDockV2Layer(layer)]),
        ),
        panels: Object.fromEntries(
            Object.entries(state.panels).map(([id, panel]) => [id, createDockV2Panel(panel)]),
        ),
    };
}

function collectLegacyGroupIds(
    legacy: LegacyDockState,
    nodeId: LegacyDockNodeId,
    groupIds: LegacyDockNodeId[],
) {
    const node = legacy.nodes[nodeId];
    if (!node) {
        return;
    }
    if (node.kind === 'group') {
        groupIds.push(node.id);
        return;
    }
    for (const childId of node.links.children) {
        collectLegacyGroupIds(legacy, childId, groupIds);
    }
}

export function fromLegacyDockState(
    legacy: LegacyDockState,
    options: {
        layerId?: DockV2LayerId;
    } = {},
): DockV2State {
    const layerId = options.layerId ?? 'legacy-flow';
    const groupIds: LegacyDockNodeId[] = [];
    collectLegacyGroupIds(legacy, legacy.rootId, groupIds);

    const panels: Record<string, DockV2Panel> = {};
    const groups: Record<string, DockV2Group> = {};
    for (const node of Object.values(legacy.nodes)) {
        if (node.kind === 'panel') {
            panels[node.id] = createDockV2Panel({
                id: node.id,
                kind: 'legacy-panel',
                meta: {
                    legacyKind: node.kind,
                },
                title: node.data.title,
            });
            continue;
        }
        if (node.kind === 'group') {
            groups[node.id] = createDockV2Group({
                activePanelId: node.data.activePanelId,
                id: node.id,
                layerId,
                meta: {
                    legacyKind: node.kind,
                },
                mode: node.links.children.length > 1 ? 'tabs' : 'single',
                panelIds: [...node.links.children],
            });
        }
    }

    return createDockV2State({
        activeGroupId: groupIds[0],
        activeLayerId: layerId,
        focusedPanelId: groupIds[0] ? groups[groupIds[0]]?.activePanelId : undefined,
        groups,
        layerOrder: [layerId],
        layers: {
            [layerId]: createDockV2Layer({
                flow: {
                    direction: 'horizontal',
                    reorder: 'horizontal-only',
                },
                groupIds,
                id: layerId,
                kind: 'flow',
                meta: {
                    adaptedFromLegacyRootId: legacy.rootId,
                    legacyFloatRootId: legacy.floatRootId,
                },
            }),
        },
        panels,
    });
}
