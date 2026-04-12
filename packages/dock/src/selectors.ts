import type { DockV2Group, DockV2Panel, DockV2PanelId, DockV2State } from './v2/types.js';

export function getDockGroup(state: DockV2State, groupId: string) {
    return state.groups[groupId];
}

export function getDockPanel(state: DockV2State, panelId: DockV2PanelId): DockV2Panel | undefined {
    return state.panels[panelId];
}

export function getDockGroupForPanel(state: DockV2State, panelId: DockV2PanelId): DockV2Group | undefined {
    return Object.values(state.groups).find((group) => group.panelIds.includes(panelId));
}
