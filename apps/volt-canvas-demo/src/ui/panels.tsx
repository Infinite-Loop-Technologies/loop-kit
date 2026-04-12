import * as React from "react";
import { type DockGroup, type DockStore } from "@loop-kit/dock";
import { useDispatchAction } from "@loop-kit/interaction-react";
import type {
  DockPanelRegistry,
  DockPanelRendererProps,
} from "@loop-kit/loom-pack-dock";
import {
  Badge,
  Button,
  Heading,
  IconButton,
  Inline,
  Input,
  Panel,
  Stack,
  Text,
  TextArea,
} from "@loop-kit/loom-react";
import { canvasActionIds, canvasCommandItems } from "../actions/canvas-actions";
import { useCanvasDemoSelector } from "../app/store";
import {
  closePanelContextMenu,
  cycleTheme,
  navigateBrowserPanel,
  openPanelContextMenu,
  redoBrowserState,
  setCommandQuery,
  setBrowserDraftUrl,
  setBrowserDragging,
  setViewport,
  toggleColorMode,
  undoBrowserState,
} from "../commands/canvas-commands";
import { EmbeddedBrowserSurface } from "../features/browser/EmbeddedBrowserSurface";
import { readFloatingRect } from "../features/dock/layout";
import { groupIds, layerIds } from "../features/dock/schema";
import { useCanvasDemoDeps } from "../providers/app-deps";

const defaultBrowserPanelState = {
  draftUrl: "https://blackboard.sh/electrobun",
  url: "https://blackboard.sh/electrobun",
} as const;

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.closest(
    "button, input, textarea, select, a, [role='button'], [data-no-canvas-drag]",
  ) != null;
}

function usePanelContextMenu(panelId: string) {
  const deps = useCanvasDemoDeps();

  return React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      openPanelContextMenu(deps, panelId, event.clientX, event.clientY);
    },
    [deps, panelId],
  );
}

function useBrowserPanelState(panelId: string) {
  return (
    useCanvasDemoSelector((current) => current.browser.panels[panelId]) ??
    defaultBrowserPanelState
  );
}

function CanvasNode({ dockStore, group }: { dockStore: DockStore; group: DockGroup }) {
  const action = useDispatchAction();
  const deps = useCanvasDemoDeps();
  const rect = readFloatingRect(group);
  if (!rect) {
    return null;
  }

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || isInteractiveTarget(event.target)) {
        return;
      }

      event.preventDefault();
      const browserPanelIds = group.panelIds.filter(
        (panelId) => dockStore.getState().panels[panelId]?.kind === "browser-view",
      );
      const startPoint = { x: event.clientX, y: event.clientY };
      const startLeft = rect.left;
      const startTop = rect.top;
      let frame = 0;
      let nextPoint = startPoint;

      if (browserPanelIds.length > 0) {
        setBrowserDragging(deps, browserPanelIds, true);
      }

      const commitMove = () => {
        frame = 0;
        dockStore.resizeGroup(
          {
            groupId: group.id,
            layout: {
              placement: {
                height: `${rect.height}px`,
                kind: "floating",
                left: `${Math.round(startLeft + (nextPoint.x - startPoint.x))}px`,
                top: `${Math.round(startTop + (nextPoint.y - startPoint.y))}px`,
                width: `${rect.width}px`,
              },
            },
          },
          { history: false },
        );
      };

      const clear = () => {
        if (frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
        if (browserPanelIds.length > 0) {
          setBrowserDragging(deps, browserPanelIds, false);
        }
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", clear);
        document.removeEventListener("pointercancel", clear);
      };

      const onMove = (moveEvent: PointerEvent) => {
        nextPoint = { x: moveEvent.clientX, y: moveEvent.clientY };
        if (frame) {
          return;
        }
        frame = window.requestAnimationFrame(commitMove);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", clear);
      document.addEventListener("pointercancel", clear);
    },
    [deps, dockStore, group.id, group.panelIds, rect.height, rect.left, rect.top, rect.width],
  );

  return (
    <div
      onClick={() => {
        const panelId = dockStore.getState().groups[group.id]?.activePanelId;
        if (panelId) {
          dockStore.focusPanel(panelId, { history: false });
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }
        event.preventDefault();
        const panelId = dockStore.getState().groups[group.id]?.activePanelId;
        if (panelId) {
          dockStore.focusPanel(panelId, { history: false });
        }
      }}
      onPointerDown={onPointerDown}
      role="button"
      style={{
        background: "rgba(9, 20, 34, 0.86)",
        border: "1px solid rgba(132, 178, 255, 0.36)",
        borderRadius: "18px",
        boxShadow: "0 18px 40px rgba(4, 12, 24, 0.38)",
        color: "inherit",
        cursor: "grab",
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
        left: rect.left,
        minHeight: rect.height * 0.35,
        padding: "0.85rem 1rem",
        position: "absolute",
        textAlign: "left",
        top: rect.top,
        width: Math.max(180, rect.width * 0.4),
      }}
      tabIndex={0}
    >
      <Inline align="center" gap="2" justify="space-between">
        <Text emphasis="strong" size="sm">
          {group.title ?? group.id}
        </Text>
        <Badge kind="outline" tone="accent">
          {group.mode}
        </Badge>
      </Inline>
      <Text size="sm" tone="muted">
        {group.panelIds.length} panels in floating group
      </Text>
      <Inline gap="2">
        <Button
          data-no-canvas-drag
          kind="ghost"
          onClick={(event) => {
            event.stopPropagation();
            action(canvasActionIds.autoTileWindows);
          }}
          size="sm"
          type="button"
        >
          Tile
        </Button>
        <Button
          data-no-canvas-drag
          kind="ghost"
          onClick={(event) => {
            event.stopPropagation();
            action(canvasActionIds.setBrowserModeStack);
          }}
          size="sm"
          type="button"
        >
          Stack
        </Button>
      </Inline>
    </div>
  );
}

function CanvasPanel({ controller, state }: DockPanelRendererProps) {
  const action = useDispatchAction();
  const deps = useCanvasDemoDeps();
  const colorMode = useCanvasDemoSelector((current) => current.appearance.colorMode);
  const themeId = useCanvasDemoSelector((current) => current.appearance.themeId);
  const viewport = useCanvasDemoSelector((current) => current.workspace.viewport);

  const onBackgroundPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || event.button !== 0) {
        return;
      }

      const startPoint = { x: event.clientX, y: event.clientY };
      const startViewport = deps.state.workspace.getState().viewport;

      const onMove = (moveEvent: PointerEvent) => {
        setViewport(
          deps,
          () => ({
            scale: startViewport.scale,
            x: startViewport.x + (moveEvent.clientX - startPoint.x),
            y: startViewport.y + (moveEvent.clientY - startPoint.y),
          }),
          false,
        );
      };

      const clear = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", clear);
        document.removeEventListener("pointercancel", clear);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", clear);
      document.addEventListener("pointercancel", clear);
    },
    [deps],
  );

  const floatingGroups =
    state.layers[layerIds.windows]?.groupIds
      .map((groupId) => state.groups[groupId])
      .filter((group): group is DockGroup => group != null) ?? [];

  return (
    <Stack gap="3" style={{ display: "flex", flex: 1, minHeight: 0 }}>
      <Inline align="center" gap="2" justify="space-between">
        <Inline gap="2">
          <Badge tone="accent">Volt + Electrobun</Badge>
          <Badge kind="outline" tone="muted">
            {colorMode}
          </Badge>
          <Badge kind="outline" tone="muted">
            {themeId}
          </Badge>
        </Inline>
        <Inline gap="2">
          <Button onClick={() => action(canvasActionIds.openBrowserPanel)} type="button">
            Add Browser
          </Button>
          <Button kind="outline" onClick={() => action(canvasActionIds.autoTileWindows)} type="button">
            Auto Tile
          </Button>
          <Button kind="ghost" onClick={() => action(canvasActionIds.toggleCommandPalette)} type="button">
            Command Palette
          </Button>
          <Button kind="ghost" onClick={() => action(canvasActionIds.toggleHelpPeek)} type="button">
            Peek
          </Button>
        </Inline>
      </Inline>

      <div
        onPointerDown={onBackgroundPointerDown}
        onWheel={(event) => {
          event.preventDefault();
          const delta = event.deltaY > 0 ? -0.08 : 0.08;
          setViewport(
            deps,
            (current) => ({
              ...current,
              scale: Math.max(0.5, Math.min(1.8, current.scale + delta)),
            }),
            false,
          );
        }}
        style={{
          background:
            "radial-gradient(circle at top, rgba(118, 170, 255, 0.12), transparent 24%), repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0, rgba(255, 255, 255, 0.05) 1px, transparent 1px, transparent 56px), repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0, rgba(255, 255, 255, 0.05) 1px, transparent 1px, transparent 56px), linear-gradient(180deg, rgba(4, 10, 18, 0.16), rgba(3, 8, 14, 0.3))",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "26px",
          cursor: "grab",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            height: 2600,
            position: "absolute",
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
            transformOrigin: "0 0",
            width: 3400,
          }}
        >
          {floatingGroups.map((group) => (
            <CanvasNode dockStore={controller} group={group} key={group.id} />
          ))}
          <Panel
            emphasis="subtle"
            style={{
              bottom: 120,
              left: 180,
              maxWidth: "24rem",
              position: "absolute",
            }}
          >
            <Stack gap="2">
              <Heading level={3} size="sm">
                Infinite Canvas Bridge
              </Heading>
              <Text tone="muted">
                The canvas mirrors the floating Dock groups instead of owning a second
                window model. Drag nodes to move free-floating groups. Auto-tile is
                app-level policy driven by Dock APIs.
              </Text>
              <Text tone="muted">
                Active dock layer: {state.activeLayerId ?? "none"} · focused panel:{" "}
                {state.focusedPanelId ?? "none"}
              </Text>
            </Stack>
          </Panel>
        </div>
      </div>
    </Stack>
  );
}

function BrowserPanel({ panel }: DockPanelRendererProps) {
  const deps = useCanvasDemoDeps();
  const browserState = useBrowserPanelState(panel.id);
  const onContextMenu = usePanelContextMenu(panel.id);

  return (
    <Stack
      gap="3"
      onContextMenu={onContextMenu}
      style={{ display: "flex", flex: 1, minHeight: 0 }}
    >
      <Inline gap="2">
        <Input
          onChange={(event) => {
            setBrowserDraftUrl(deps, panel.id, event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter") {
              return;
            }
            navigateBrowserPanel(deps, panel.id, event.currentTarget.value.trim());
          }}
          placeholder="https://..."
          value={browserState.draftUrl}
        />
        <Button
          kind="outline"
          onClick={() => {
            navigateBrowserPanel(deps, panel.id, browserState.draftUrl.trim());
          }}
          type="button"
        >
          Go
        </Button>
        <IconButton
          kind="ghost"
          label={`Open panel menu for ${panel.title}`}
          name="moreHorizontal"
          onClick={(event) => {
            openPanelContextMenu(
              deps,
              panel.id,
              event.currentTarget.getBoundingClientRect().right - 8,
              event.currentTarget.getBoundingClientRect().bottom + 8,
            );
          }}
          size="sm"
        />
      </Inline>
      <EmbeddedBrowserSurface panelId={panel.id} url={browserState.url} />
    </Stack>
  );
}

function ReferencePanel({ panel }: DockPanelRendererProps) {
  const onContextMenu = usePanelContextMenu(panel.id);
  const action = useDispatchAction();
  return (
    <Panel emphasis="subtle" onContextMenu={onContextMenu}>
      <Stack gap="3">
        <Heading level={3} size="sm">
          Dock Notes
        </Heading>
        <Text tone="muted">
          Dock already has floating layers, overlay layers, closable groups, group modes,
          and the state/controller primitives required for auto-tiling. This demo keeps
          auto-tiling external so policy stays app-owned.
        </Text>
        <Inline gap="2">
          <Button kind="ghost" onClick={() => action(canvasActionIds.setBrowserModeTabs)} type="button">
            Tabs
          </Button>
          <Button kind="ghost" onClick={() => action(canvasActionIds.setBrowserModeSingle)} type="button">
            No Stack
          </Button>
          <Button kind="ghost" onClick={() => action(canvasActionIds.setBrowserModeStack)} type="button">
            Stack
          </Button>
          <Button kind="ghost" onClick={() => action(canvasActionIds.setBrowserModeQueue)} type="button">
            Queue
          </Button>
          <Button kind="ghost" onClick={() => action(canvasActionIds.setBrowserModeSwap)} type="button">
            Swap
          </Button>
        </Inline>
      </Stack>
    </Panel>
  );
}

function NotesPanel({ panel }: DockPanelRendererProps) {
  const onContextMenu = usePanelContextMenu(panel.id);
  return (
    <TextArea
      defaultValue={`- Floating groups are real Dock groups on a floating layer.\n- The canvas mirrors them instead of replacing Dock state.\n- Browser surfaces are attached through an external surface service.`}
      onContextMenu={onContextMenu}
      style={{ flex: 1, minHeight: "16rem", resize: "vertical" }}
    />
  );
}

function TimelinePanel({ panel }: DockPanelRendererProps) {
  const onContextMenu = usePanelContextMenu(panel.id);
  return (
    <Stack gap="2" onContextMenu={onContextMenu}>
      <Badge tone="accent">Activity</Badge>
      <Text tone="muted">Auto-tile arranged floating groups.</Text>
      <Text tone="muted">Context menu actions stay semantic and mutate Dock through commands.</Text>
      <Text tone="muted">Native browser surfaces are coordinated through a provider/runtime layer.</Text>
    </Stack>
  );
}

function InspectorPanel({ panel, state }: DockPanelRendererProps) {
  const onContextMenu = usePanelContextMenu(panel.id);
  const activeGroup = state.activeGroupId ? state.groups[state.activeGroupId] : null;
  const activeLayer = state.activeLayerId ? state.layers[state.activeLayerId] : null;
  return (
    <Stack gap="2" onContextMenu={onContextMenu}>
      <Heading level={3} size="sm">
        Active Dock State
      </Heading>
      <Text tone="muted">Focused panel: {state.focusedPanelId ?? "none"}</Text>
      <Text tone="muted">Active group: {activeGroup?.title ?? state.activeGroupId ?? "none"}</Text>
      <Text tone="muted">Active layer: {activeLayer?.id ?? "none"}</Text>
      <Text tone="muted">
        Browser group mode: {state.groups[groupIds.browser]?.mode ?? "unknown"}
      </Text>
    </Stack>
  );
}

function HelpPeekPanel() {
  const deps = useCanvasDemoDeps();
  const colorMode = useCanvasDemoSelector((current) => current.appearance.colorMode);
  const themeId = useCanvasDemoSelector((current) => current.appearance.themeId);
  const action = useDispatchAction();

  return (
    <Stack gap="3">
      <Heading level={3} size="sm">
        Passthrough Peek
      </Heading>
      <Text tone="muted">
        This layer uses Dock's overlay semantics with passthrough interaction, so the
        canvas remains interactive while the helper panel stays open.
      </Text>
      <Inline gap="2">
        <Button kind="outline" onClick={() => cycleTheme(deps)} type="button">
          Theme: {themeId}
        </Button>
        <Button kind="outline" onClick={() => toggleColorMode(deps)} type="button">
          Color: {colorMode}
        </Button>
      </Inline>
      <Inline gap="2">
        <Button kind="ghost" onClick={() => action(canvasActionIds.resetViewport)} type="button">
          Reset Canvas
        </Button>
        <Button kind="ghost" onClick={() => action(canvasActionIds.autoTileWindows)} type="button">
          Tile Windows
        </Button>
      </Inline>
    </Stack>
  );
}

function CommandPalettePanel({ controller }: DockPanelRendererProps) {
  const deps = useCanvasDemoDeps();
  const action = useDispatchAction();
  const query = useCanvasDemoSelector((current) => current.workspace.commandQuery);

  const filteredItems = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return canvasCommandItems;
    }
    return canvasCommandItems.filter((item) => {
      const haystack = [item.title, item.description, ...(item.keywords ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query]);

  return (
    <Panel emphasis="strong">
      <Stack gap="3">
        <Heading level={2} size="md">
          Command Palette
        </Heading>
        <Input
          autoFocus
          onChange={(event) => {
            setCommandQuery(deps, event.currentTarget.value);
          }}
          placeholder="Search actions, modes, and layout commands..."
          value={query}
        />
        <Stack gap="2" style={{ maxHeight: "26rem", overflow: "auto" }}>
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                action(item.actionId);
                controller.dismissLayer({ layerId: layerIds.command });
              }}
              style={{
                background: "rgba(11, 18, 30, 0.82)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                color: "inherit",
                cursor: "pointer",
                padding: "0.9rem 1rem",
                textAlign: "left",
              }}
              type="button"
            >
              <Inline align="center" gap="2" justify="space-between">
                <Text emphasis="strong">{item.title}</Text>
                {item.shortcut ? (
                  <Badge kind="outline" tone="muted">
                    {item.shortcut}
                  </Badge>
                ) : null}
              </Inline>
              <Text size="sm" tone="muted">
                {item.description}
              </Text>
            </button>
          ))}
        </Stack>
      </Stack>
    </Panel>
  );
}

export function createPanelRegistry(): DockPanelRegistry {
  return {
    kinds: {
      "browser-view": BrowserPanel,
      canvas: CanvasPanel,
      "command-palette": CommandPalettePanel,
      inspector: InspectorPanel,
      notes: NotesPanel,
      peek: HelpPeekPanel,
      "reference-card": ReferencePanel,
      timeline: TimelinePanel,
    },
  };
}

export function PanelContextMenu({ dockStore }: { dockStore: DockStore }) {
  const deps = useCanvasDemoDeps();
  const action = useDispatchAction();
  const contextMenu = useCanvasDemoSelector((current) => current.workspace.contextMenu);

  React.useEffect(() => {
    if (!contextMenu) {
      return;
    }

    const dismiss = () => {
      closePanelContextMenu(deps);
    };

    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [contextMenu, deps]);

  if (!contextMenu) {
    return null;
  }

  const panel = dockStore.getState().panels[contextMenu.panelId];

  return (
    <div
      onPointerDown={(event) => event.stopPropagation()}
      style={{
        left: contextMenu.x,
        position: "fixed",
        top: contextMenu.y,
        zIndex: 60,
      }}
    >
      <Panel emphasis="strong" style={{ minWidth: "16rem" }}>
        <Stack gap="2">
          <Text emphasis="strong">{panel?.title ?? contextMenu.panelId}</Text>
          <Button kind="ghost" onClick={() => action(canvasActionIds.deleteFocusedPanel)} type="button">
            Delete focused panel
          </Button>
          <Button kind="ghost" onClick={() => action(canvasActionIds.closeFocusedGroup)} type="button">
            Close focused group
          </Button>
          <Button kind="ghost" onClick={() => action(canvasActionIds.autoTileWindows)} type="button">
            Auto-tile windows
          </Button>
          <Button kind="ghost" onClick={() => action(canvasActionIds.setBrowserModeStack)} type="button">
            Browser mode: stack
          </Button>
          <Button kind="ghost" onClick={() => undoBrowserState(deps)} type="button">
            Undo browser changes
          </Button>
          <Button kind="ghost" onClick={() => redoBrowserState(deps)} type="button">
            Redo browser changes
          </Button>
        </Stack>
      </Panel>
    </div>
  );
}
