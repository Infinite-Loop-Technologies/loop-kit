import { describe, expect, test } from "vitest"

import { getLayoutDepth } from "../__internal/DockLayoutQuery.js"
import {
  containsPoint,
  createDockGroup,
  createDockPanelId,
  createDockSplit,
  createDockState,
  findGroupById,
  findGroupForPanel,
  findSplitById,
  insertPanelIntoLayout,
  splitRect,
} from "../index.js"

describe("Dock layout", () => {
  test("splits rectangles and hit tests points", () => {
    const rect = { x: 0, y: 0, width: 100, height: 50 }
    const split = splitRect(rect, "horizontal", 0.25)

    expect(split.leading.width).toBe(25)
    expect(split.trailing.x).toBe(25)
    expect(containsPoint(rect, { x: 50, y: 25 })).toBe(true)
    expect(containsPoint(rect, { x: 101, y: 25 })).toBe(false)
  })

  test("looks up groups, panels, and splits", () => {
    const leftPanelId = createDockPanelId()
    const rightPanelId = createDockPanelId()
    const left = createDockGroup({ panelIds: [leftPanelId], activePanelId: leftPanelId })
    const right = createDockGroup({ panelIds: [rightPanelId], activePanelId: rightPanelId })
    const split = createDockSplit({ axis: "horizontal", leading: left, trailing: right })
    const state = createDockState({ root: split })

    expect(findGroupById(state.layout, left.id)?.id).toBe(left.id)
    expect(findGroupForPanel(state.layout, rightPanelId)?.id).toBe(right.id)
    expect(findSplitById(state.layout, split.id)?.id).toBe(split.id)
  })

  test("resolves center and split placements", () => {
    const firstPanelId = createDockPanelId()
    const secondPanelId = createDockPanelId()
    const group = createDockGroup({ panelIds: [firstPanelId], activePanelId: firstPanelId })
    const state = createDockState({ root: group })

    const centered = insertPanelIntoLayout(
      state.layout,
      { targetGroupId: group.id, side: "center" },
      secondPanelId
    )
    expect(centered.roots.main?.type).toBe("group")

    const split = insertPanelIntoLayout(
      state.layout,
      { targetGroupId: group.id, side: "right" },
      secondPanelId
    )
    expect(split.roots.main?.type).toBe("split")
    expect(getLayoutDepth(split.roots.main)).toBe(2)
  })
})
