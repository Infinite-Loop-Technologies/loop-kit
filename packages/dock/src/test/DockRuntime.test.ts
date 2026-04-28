import { describe, expect, test } from "vitest"

import {
  createDockPanelId,
  createDockRuntime,
  createDockService,
  createDockSplitId,
} from "../index.js"

describe("DockRuntime", () => {
  test("begins, updates, and clears drag previews", () => {
    const runtime = createDockRuntime({ dock: createDockService() })
    const panelId = createDockPanelId()

    runtime.beginDrag({ panelId, position: { x: 1, y: 2 } })
    expect(runtime.env.state.get().dragPreview?.panelId).toBe(panelId)

    runtime.updateDragPreview({ position: { x: 3, y: 4 } })
    expect(runtime.env.state.get().dragPreview?.position).toEqual({ x: 3, y: 4 })

    runtime.clearDragPreview()
    expect(runtime.env.state.get().dragPreview).toBeUndefined()
  })

  test("begins, updates, and clears resize previews", () => {
    const runtime = createDockRuntime({ dock: createDockService() })
    const splitId = createDockSplitId()

    runtime.beginResize({ splitId, ratio: 0.4 })
    expect(runtime.env.state.get().resizePreview?.splitId).toBe(splitId)

    runtime.updateResizePreview({ ratio: 0.6 })
    expect(runtime.env.state.get().resizePreview?.ratio).toBe(0.6)

    runtime.clearResizePreview()
    expect(runtime.env.state.get().resizePreview).toBeUndefined()
  })
})
