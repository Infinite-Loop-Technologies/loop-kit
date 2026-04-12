import type { DockGroup, DockState } from "@loop-kit/dock";

export function isBrowserPanelKind(kind: string) {
  return kind === "browser-view";
}

export function listBrowserPanelIds(state: DockState) {
  return Object.values(state.panels)
    .filter((panel) => panel && isBrowserPanelKind(panel.kind))
    .map((panel) => panel.id);
}

function listVisibleGroupPanelIds(group: DockGroup) {
  if (group.mode === "stack" || group.mode === "split") {
    return group.panelIds;
  }

  const active = group.activePanelId ?? group.panelIds[0];
  return active ? [active] : [];
}

export function listVisibleBrowserPanelIds(state: DockState) {
  const visible = new Set<string>();

  for (const group of Object.values(state.groups)) {
    if (!group) {
      continue;
    }

    for (const panelId of listVisibleGroupPanelIds(group)) {
      const panel = state.panels[panelId];
      if (panel && isBrowserPanelKind(panel.kind)) {
        visible.add(panel.id);
      }
    }
  }

  return visible;
}
