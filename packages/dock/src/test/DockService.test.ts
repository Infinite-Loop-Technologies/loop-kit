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
})

const createPanel = (title: string): DockPanel => ({
  id: createDockPanelId(),
  title,
  kind: `test.${title.toLowerCase()}`,
})
