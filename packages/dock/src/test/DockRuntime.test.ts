import { describe, expect, test } from "vitest"

import {
  createDockPanelId,
  createDockRuntime,
  createDockService,
  createDockSplitId,
  createDockWindowId,
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

  test("begins, updates, and clears window move previews", () => {
    const runtime = createDockRuntime({ dock: createDockService() })
    const windowId = createDockWindowId()
    const frame = { x: 10, y: 20, width: 320, height: 240 }

    runtime.beginWindowMove({
      windowId,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      originFrame: frame,
      frame,
    })
    expect(runtime.env.state.get().windowMovePreview?.windowId).toBe(windowId)

    runtime.updateWindowMovePreview({ frame: { ...frame, x: 30, y: 40 } })
    expect(runtime.env.state.get().windowMovePreview?.frame.x).toBe(30)

    runtime.clearWindowMovePreview()
    expect(runtime.env.state.get().windowMovePreview).toBeUndefined()
  })

  test("begins, updates, and clears window resize previews", () => {
    const runtime = createDockRuntime({ dock: createDockService() })
    const windowId = createDockWindowId()
    const frame = { x: 10, y: 20, width: 320, height: 240 }

    runtime.beginWindowResize({
      windowId,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      originFrame: frame,
      frame,
    })
    expect(runtime.env.state.get().windowResizePreview?.windowId).toBe(windowId)

    runtime.updateWindowResizePreview({ frame: { ...frame, width: 360 } })
    expect(runtime.env.state.get().windowResizePreview?.frame.width).toBe(360)

    runtime.clearWindowResizePreview()
    expect(runtime.env.state.get().windowResizePreview).toBeUndefined()
  })
})
