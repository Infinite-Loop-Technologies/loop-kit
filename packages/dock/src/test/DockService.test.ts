import { describe, expect, test } from "vitest"

import {
  type DockPanel,
  createDefaultDockPolicy,
  createDockGroup,
  createDockModal,
  createDockPanelId,
  createDockService,
  createDockSplit,
  createDockState,
  createDockWindow,
  createDockWindowId,
} from "../index.js"

describe("DockService", () => {
  test("registers and unregisters panels", () => {
    const dock = createDockService()
    const panel = createPanel("One")

    expect(dock.registerPanel(panel).ok).toBe(true)
    expect(dock.getPanel(panel.id)).toEqual(panel)

    expect(dock.unregisterPanel(panel.id).ok).toBe(true)
    expect(dock.getPanel(panel.id)).toBeUndefined()
  })

  test("focuses and selects a panel", () => {
    const panel = createPanel("Editor")
    const group = createDockGroup({ panelIds: [panel.id], activePanelId: panel.id })
    const dock = createDockService({
      initialState: createDockState({ panels: [panel], root: group }),
    })

    expect(dock.focusPanel(panel.id).ok).toBe(true)
    expect(dock.selectPanel(panel.id).ok).toBe(true)
    expect(dock.state.get().focusedPanelId).toBe(panel.id)
    expect(dock.state.get().selectedPanelId).toBe(panel.id)
  })

  test("returns a Result error for an invalid panel", () => {
    const dock = createDockService()
    const result = dock.focusPanel(createDockPanelId())

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.type).toBe("DockPanelNotFound")
  })

  test("opens and closes modals", () => {
    const panel = createPanel("Alert")
    const modal = createDockModal({
      title: "Alert",
      root: createDockGroup({ panelIds: [panel.id], activePanelId: panel.id, stackMode: "modal" }),
    })
    const dock = createDockService({
      initialState: createDockState({ panels: [panel] }),
    })

    expect(dock.openModal(modal).ok).toBe(true)
    expect(dock.state.get().layout.modals[0]?.open).toBe(true)

    expect(dock.closeModal(modal.id).ok).toBe(true)
    expect(dock.state.get().layout.modals[0]?.open).toBe(false)
  })

  test("returns policy rejection for disallowed drops", () => {
    const source = createPanel("Source")
    const target = createPanel("Target")
    const group = createDockGroup({ panelIds: [target.id], activePanelId: target.id })
    const dock = createDockService({
      initialState: createDockState({ panels: [source, target], root: group }),
      policy: {
        ...createDefaultDockPolicy(),
        canDrop: () => ({ ok: false, reason: "No drops." }),
      },
    })

    const result = dock.commitDrop(source.id, { targetGroupId: group.id, side: "center" })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.type).toBe("DockPolicyRejected")
  })

  test("resizes splits with clamping", () => {
    const leading = createPanel("Left")
    const trailing = createPanel("Right")
    const split = createDockSplit({
      axis: "horizontal",
      leading: createDockGroup({ panelIds: [leading.id], activePanelId: leading.id }),
      trailing: createDockGroup({ panelIds: [trailing.id], activePanelId: trailing.id }),
      ratio: 0.5,
    })
    const dock = createDockService({
      initialState: createDockState({ panels: [leading, trailing], root: split }),
    })

    expect(dock.resizeSplit(split.id, 0.99).ok).toBe(true)
    const root = dock.state.get().layout.roots.main
    expect(root?.type).toBe("split")
    if (root?.type === "split") expect(root.ratio).toBe(0.9)
  })

  test("commits drops into tab groups", () => {
    const source = createPanel("Source")
    const target = createPanel("Target")
    const group = createDockGroup({ panelIds: [target.id], activePanelId: target.id })
    const dock = createDockService({
      initialState: createDockState({ panels: [source, target], root: group }),
    })

    expect(dock.commitDrop(source.id, { targetGroupId: group.id, side: "center" }).ok).toBe(true)
    const root = dock.state.get().layout.roots.main

    expect(root?.type).toBe("group")
    if (root?.type === "group") {
      expect(root.panelIds).toContain(source.id)
      expect(root.activePanelId).toBe(source.id)
    }
  })

  test("committing a center drop inside the same tab group keeps all panels reachable", () => {
    const explorer = createPanel("Explorer")
    const editor = createPanel("Editor")
    const group = createDockGroup({
      panelIds: [explorer.id, editor.id],
      activePanelId: editor.id,
    })
    const dock = createDockService({
      initialState: createDockState({ panels: [explorer, editor], root: group }),
    })

    expect(dock.commitDrop(explorer.id, { targetGroupId: group.id, side: "center" }).ok).toBe(true)

    const root = dock.state.get().layout.roots.main
    expect(root?.type).toBe("group")
    if (root?.type === "group") {
      expect(root.panelIds).toEqual([explorer.id, editor.id])
      expect(root.activePanelId).toBe(explorer.id)
    }
    expect(collectLayoutPanelIds(root)).toEqual(new Set([explorer.id, editor.id]))
  })

  test("rejects a drop when removing the source also removes the target group", () => {
    const explorer = createPanel("Explorer")
    const group = createDockGroup({ panelIds: [explorer.id], activePanelId: explorer.id })
    const dock = createDockService({
      initialState: createDockState({ panels: [explorer], root: group }),
    })

    const result = dock.commitDrop(explorer.id, { targetGroupId: group.id, side: "left" })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.type).toBe("DockInvalidPlacement")
    expect(dock.state.get().layout.roots.main).toEqual(group)
  })

  test("focuses floating windows by z-order and active state", () => {
    const one = createPanel("One")
    const two = createPanel("Two")
    const first = createDockWindow({
      title: "First",
      root: createDockGroup({ panelIds: [one.id], activePanelId: one.id }),
    })
    const second = createDockWindow({
      title: "Second",
      root: createDockGroup({ panelIds: [two.id], activePanelId: two.id }),
      active: true,
    })
    const dock = createDockService({
      initialState: createDockState({
        panels: [one, two],
        layout: {
          roots: { main: null },
          floatingWindows: [first, second],
          modals: [],
          overlays: [],
          layers: [],
        },
      }),
    })

    expect(dock.focusWindow(first.id).ok).toBe(true)

    const windows = dock.state.get().layout.floatingWindows
    expect(windows.at(-1)?.id).toBe(first.id)
    expect(windows.at(-1)?.active).toBe(true)
    expect(windows.find((window) => window.id === second.id)?.active).toBe(false)
  })

  test("moves and resizes floating windows", () => {
    const panel = createPanel("Window")
    const window = createDockWindow({
      title: "Window",
      root: createDockGroup({ panelIds: [panel.id], activePanelId: panel.id }),
      frame: { x: 10, y: 20, width: 300, height: 200 },
    })
    const dock = createDockService({
      initialState: createDockState({
        panels: [panel],
        layout: {
          roots: { main: null },
          floatingWindows: [window],
          modals: [],
          overlays: [],
          layers: [],
        },
      }),
    })

    expect(dock.moveWindow(window.id, { x: 40, y: 50 }).ok).toBe(true)
    expect(dock.state.get().layout.floatingWindows[0]?.frame).toMatchObject({
      x: 40,
      y: 50,
      width: 300,
      height: 200,
    })

    expect(dock.resizeWindow(window.id, { x: 40, y: 50, width: 480, height: 320 }).ok).toBe(true)
    expect(dock.state.get().layout.floatingWindows[0]?.frame).toEqual({
      x: 40,
      y: 50,
      width: 480,
      height: 320,
    })
  })

  test("closes floating windows and clears focused surface", () => {
    const panel = createPanel("Window")
    const window = createDockWindow({
      title: "Window",
      root: createDockGroup({ panelIds: [panel.id], activePanelId: panel.id }),
    })
    const dock = createDockService({
      initialState: createDockState({
        panels: [panel],
        layout: {
          roots: { main: null },
          floatingWindows: [window],
          modals: [],
          overlays: [],
          layers: [],
        },
        focusedSurfaceId: window.surfaceId,
        selectedSurfaceId: window.surfaceId,
      }),
    })

    expect(dock.closeWindow(window.id).ok).toBe(true)
    expect(dock.state.get().layout.floatingWindows).toEqual([])
    expect(dock.state.get().focusedSurfaceId).toBeUndefined()
    expect(dock.state.get().selectedSurfaceId).toBeUndefined()
  })

  test("returns an error for missing floating windows", () => {
    const dock = createDockService()
    const result = dock.closeWindow(createDockWindowId())

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.type).toBe("DockWindowNotFound")
  })

  test("respects close policy for floating windows", () => {
    const panel = createPanel("Window")
    const window = createDockWindow({
      title: "Window",
      root: createDockGroup({ panelIds: [panel.id], activePanelId: panel.id }),
    })
    const dock = createDockService({
      initialState: createDockState({
        panels: [panel],
        layout: {
          roots: { main: null },
          floatingWindows: [window],
          modals: [],
          overlays: [],
          layers: [],
        },
      }),
      policy: {
        canClose: () => ({ ok: false, reason: "Pinned window." }),
      },
    })

    const result = dock.closeWindow(window.id)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.type).toBe("DockPolicyRejected")
    expect(dock.state.get().layout.floatingWindows).toHaveLength(1)
  })
})

const createPanel = (title: string): DockPanel => ({
  id: createDockPanelId(),
  title,
  kind: `test.${title.toLowerCase()}`,
})

const collectLayoutPanelIds = (
  node: ReturnType<typeof createDockState>["layout"]["roots"]["main"]
): Set<DockPanel["id"]> => {
  if (!node) return new Set()
  if (node.type === "group") return new Set(node.panelIds)
  return new Set([...collectLayoutPanelIds(node.leading), ...collectLayoutPanelIds(node.trailing)])
}
