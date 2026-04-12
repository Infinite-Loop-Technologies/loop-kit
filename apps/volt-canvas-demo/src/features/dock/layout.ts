import {
  createDockGroup,
  createDockLayer,
  createDockPanel,
  createDockState,
  type DockController,
  type DockGroup,
  type DockGroupMode,
  type DockState,
} from "@loop-kit/dock";
import { groupIds, layerIds, panelIds } from "./schema";

type FloatingRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

function px(value: number) {
  return `${Math.round(value)}px`;
}

function floatingRect(
  left: number,
  top: number,
  width: number,
  height: number,
) {
  return {
    height: px(height),
    kind: "floating" as const,
    left: px(left),
    top: px(top),
    width: px(width),
  };
}

function parsePixel(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function readFloatingRect(group: DockGroup): FloatingRect | null {
  const placement = group.layout?.placement;
  if (!placement || placement.kind !== "floating") {
    return null;
  }
  return {
    height: parsePixel(placement.height ?? group.layout?.height, 320),
    left: parsePixel(placement.left, 0),
    top: parsePixel(placement.top, 0),
    width: parsePixel(placement.width ?? group.layout?.width, 420),
  };
}

export function createCanvasDemoDockState(): DockState {
  return createDockState({
    activeGroupId: groupIds.canvas,
    activeLayerId: layerIds.main,
    focusedPanelId: panelIds.canvas,
    groups: {
      [groupIds.browser]: createDockGroup({
        chrome: { framed: true, showTabs: true, showTitlebar: true },
        id: groupIds.browser,
        layerId: layerIds.windows,
        layout: { placement: floatingRect(180, 72, 560, 420) },
        meta: { acceptsKinds: ["browser-view", "reference-card", "timeline"], family: "window" },
        mode: "tabs",
        panelIds: [panelIds.browserMain, panelIds.browserDocs],
        policies: { closeable: true, movable: true, reorderable: true, splittable: true },
        title: "Browser Stack",
      }),
      [groupIds.canvas]: createDockGroup({
        chrome: { framed: false, showTabs: false, showTitlebar: false },
        id: groupIds.canvas,
        layerId: layerIds.main,
        layout: { basis: "auto", grow: 1, min: "0" },
        meta: { acceptsKinds: ["canvas"], family: "canvas" },
        mode: "single",
        panelIds: [panelIds.canvas],
        policies: { attachable: false, closeable: false, movable: false, reorderable: false, splittable: false },
        title: "Canvas",
      }),
      [groupIds.inspector]: createDockGroup({
        chrome: { framed: true, showTabs: false, showTitlebar: true },
        id: groupIds.inspector,
        layerId: layerIds.windows,
        layout: { placement: floatingRect(820, 96, 360, 300) },
        meta: { acceptsKinds: ["inspector"], family: "window" },
        mode: "single",
        panelIds: [panelIds.inspector],
        policies: { closeable: true, movable: true, reorderable: false, splittable: false },
        title: "Inspector",
      }),
      [groupIds.notes]: createDockGroup({
        chrome: { framed: true, showTabs: false, showTitlebar: true },
        id: groupIds.notes,
        layerId: layerIds.windows,
        layout: { placement: floatingRect(760, 440, 420, 360) },
        meta: { acceptsKinds: ["notes", "timeline"], family: "window" },
        mode: "stack",
        panelIds: [panelIds.notes, panelIds.timeline],
        policies: { closeable: true, movable: true, reorderable: true, splittable: false },
        title: "Notes Stack",
      }),
    },
    layerOrder: [layerIds.main, layerIds.peek, layerIds.command, layerIds.windows],
    layers: {
      [layerIds.command]: createDockLayer({
        groupIds: [],
        id: layerIds.command,
        kind: "overlay",
        overlay: { behavior: "replace", interaction: "modal", maxGroups: 1 },
      }),
      [layerIds.main]: createDockLayer({
        flow: { direction: "horizontal", gap: "0", reorder: "horizontal-only" },
        groupIds: [groupIds.canvas],
        id: layerIds.main,
        kind: "flow",
      }),
      [layerIds.peek]: createDockLayer({
        groupIds: [],
        id: layerIds.peek,
        kind: "overlay",
        overlay: { behavior: "replace", interaction: "passthrough", maxGroups: 1 },
      }),
      [layerIds.windows]: createDockLayer({
        groupIds: [groupIds.browser, groupIds.inspector, groupIds.notes],
        id: layerIds.windows,
        kind: "floating",
      }),
    },
    panels: {
      [panelIds.browserDocs]: createDockPanel({
        id: panelIds.browserDocs,
        kind: "reference-card",
        meta: { family: "window" },
        title: "Dockview Notes",
      }),
      [panelIds.browserMain]: createDockPanel({
        id: panelIds.browserMain,
        kind: "browser-view",
        meta: { family: "window" },
        title: "Electrobun Browser",
      }),
      [panelIds.canvas]: createDockPanel({
        id: panelIds.canvas,
        kind: "canvas",
        meta: { family: "canvas", neverSplit: true },
        title: "Infinite Canvas",
      }),
      [panelIds.command]: createDockPanel({
        id: panelIds.command,
        kind: "command-palette",
        meta: { family: "overlay", neverSplit: true },
        title: "Command Palette",
      }),
      [panelIds.inspector]: createDockPanel({
        id: panelIds.inspector,
        kind: "inspector",
        meta: { family: "window", neverSplit: true },
        title: "Inspector",
      }),
      [panelIds.notes]: createDockPanel({
        id: panelIds.notes,
        kind: "notes",
        meta: { family: "window" },
        title: "Notes",
      }),
      [panelIds.peek]: createDockPanel({
        id: panelIds.peek,
        kind: "peek",
        meta: { family: "overlay", neverSplit: true },
        title: "Help Peek",
      }),
      [panelIds.timeline]: createDockPanel({
        id: panelIds.timeline,
        kind: "timeline",
        meta: { family: "window" },
        title: "Activity",
      }),
    },
  });
}

export function autoTileFloatingGroups(
  controller: DockController,
  layerId = layerIds.windows,
) {
  const state = controller.getState();
  const layer = state.layers[layerId];
  if (!layer) {
    return;
  }

  const tiledGroups = layer.groupIds
    .map((groupId) => state.groups[groupId])
    .filter(
      (group): group is DockGroup =>
        group != null && group.layout?.placement?.kind === "floating",
    );

  if (tiledGroups.length === 0) {
    return;
  }

  const columns = Math.max(1, Math.ceil(Math.sqrt(tiledGroups.length)));
  const width = 420;
  const height = 300;
  const gap = 28;
  const originLeft = 120;
  const originTop = 84;

  tiledGroups.forEach((group, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    controller.resizeGroup(
      {
        groupId: group.id,
        layout: {
          placement: floatingRect(
            originLeft + column * (width + gap),
            originTop + row * (height + gap),
            width,
            height,
          ),
        },
      },
    );
  });
}

export function toggleCommandPalette(controller: DockController) {
  const state = controller.getState();
  const layer = state.layers[layerIds.command];
  if (layer?.groupIds.length) {
    controller.dismissLayer({ layerId: layerIds.command });
    return;
  }

  controller.openPanel({
    group: {
      chrome: { framed: false, showTabs: false, showTitlebar: false },
      layout: { placement: { kind: "center", top: "5rem", width: "min(44rem, calc(100vw - 3rem))" } },
      mode: "swap",
      policies: { closeable: true, movable: false, reorderable: false, splittable: false },
      title: "Command Palette",
    },
    groupId: groupIds.command,
    layerId: layerIds.command,
    panel: createDockPanel({
      id: panelIds.command,
      kind: "command-palette",
      meta: { family: "overlay", neverSplit: true },
      title: "Command Palette",
    }),
  });
}

export function toggleHelpPeek(controller: DockController) {
  const state = controller.getState();
  const layer = state.layers[layerIds.peek];
  if (layer?.groupIds.length) {
    controller.dismissLayer({ layerId: layerIds.peek });
    return;
  }

  controller.openPanel({
    group: {
      chrome: { framed: true, showTabs: false, showTitlebar: true },
      layout: {
        placement: {
          edge: "right",
          kind: "edge",
          width: "24rem",
        },
      },
      mode: "swap",
      policies: { closeable: true, movable: false, reorderable: false, splittable: false },
      title: "Help Peek",
    },
    groupId: groupIds.peek,
    layerId: layerIds.peek,
    panel: createDockPanel({
      id: panelIds.peek,
      kind: "peek",
      meta: { family: "overlay", neverSplit: true },
      title: "Help Peek",
    }),
  });
}

export function setBrowserGroupMode(
  controller: DockController,
  mode: DockGroupMode,
) {
  controller.setGroupMode({
    groupId: groupIds.browser,
    mode,
  });
}

export function openBrowserPanel(controller: DockController) {
  const nextId = `panel-browser-extra-${Date.now().toString(36)}`;
  controller.openPanel({
    activate: true,
    groupId: groupIds.browser,
    layerId: layerIds.windows,
    panel: createDockPanel({
      id: nextId,
      kind: "browser-view",
      meta: { family: "window" },
      title: `Browser ${nextId.slice(-4)}`,
    }),
  });
  return nextId;
}
