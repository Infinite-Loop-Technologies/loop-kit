import { describe, expect, test } from "vitest"

import { createInteractionRuntime } from "@loop-kit/interaction"
import type { InteractionTarget, InteractionTargetId } from "@loop-kit/interaction"

import { createDragDropLabService } from "../domain/dragDropLab"
import type { DragDropLabItemId } from "../domain/dragDropLab"
import { createDragDropDemoDockState } from "../domain/workbenchDockPresets"
import {
  createDragDropLabRuntime,
  createDragDropLabTargetId,
  installDragDropLabInteractionPolicy,
  makeDragDropLabTargetData,
} from "./DragDropLabRuntime"

describe("DragDropLab interaction policy", () => {
  test("commits reorder through the service on drag end", async () => {
    const setup = await createPolicySetup()
    const source = setup.registerItem("inbox")
    const target = setup.registerItem("verify")

    setup.interaction.env.signals.dragStart.emit(createDragSignal(source))
    setup.interaction.env.signals.dragEnd.emit(createDragSignal(source, target))

    expect(setup.service.state.get().items.map((item) => item.id)).toEqual([
      "plan",
      "build",
      "inbox",
      "verify",
      "handoff",
    ])
    expect(setup.runtime.env.state.get().activeItemId).toBeUndefined()

    await setup.dispose()
  })

  test("commits append reorder through the list-end target", async () => {
    const setup = await createPolicySetup()
    const source = setup.registerItem("inbox")
    const listEnd = setup.registerListEnd()

    setup.interaction.env.signals.dragStart.emit(createDragSignal(source))
    setup.interaction.env.signals.dragEnd.emit(createDragSignal(source, listEnd))

    expect(setup.service.state.get().items.map((item) => item.id)).toEqual([
      "plan",
      "build",
      "verify",
      "handoff",
      "inbox",
    ])

    await setup.dispose()
  })

  test("ignores same-target drops", async () => {
    const setup = await createPolicySetup()
    const source = setup.registerItem("inbox")

    setup.interaction.env.signals.dragStart.emit(createDragSignal(source))
    setup.interaction.env.signals.dragEnd.emit(createDragSignal(source, source))

    expect(setup.service.state.get().items.map((item) => item.id)).toEqual([
      "inbox",
      "plan",
      "build",
      "verify",
      "handoff",
    ])

    await setup.dispose()
  })

  test("updates state-driven drag ghost data during drag moves", async () => {
    const setup = await createPolicySetup()
    const source = setup.registerItem("inbox")
    const target = setup.registerItem("verify")

    setup.interaction.env.signals.dragStart.emit(
      createDragSignal(source, undefined, { x: 4, y: 8 })
    )
    expect(setup.runtime.env.state.get().activeItemId).toBe("inbox")
    expect(setup.runtime.env.state.get().activeScopeId).toBe("test")
    expect(setup.runtime.env.state.get().overItemId).toBe("inbox")
    expect(setup.runtime.env.state.get().overScopeId).toBe("test")
    expect(setup.runtime.env.state.get().pointerPosition).toEqual({ x: 4, y: 8 })

    setup.interaction.env.signals.dragMove.emit(createDragSignal(source, target, { x: 24, y: 32 }))
    expect(setup.runtime.env.state.get().activeItemId).toBe("inbox")
    expect(setup.runtime.env.state.get().overItemId).toBe("verify")
    expect(setup.runtime.env.state.get().overScopeId).toBe("test")
    expect(setup.runtime.env.state.get().pointerPosition).toEqual({ x: 24, y: 32 })

    const listEnd = setup.registerListEnd()
    setup.interaction.env.signals.dragMove.emit(createDragSignal(source, listEnd, { x: 24, y: 96 }))
    expect(setup.runtime.env.state.get().overItemId).toBeUndefined()
    expect(setup.runtime.env.state.get().overScopeId).toBe("test")
    expect(setup.runtime.env.state.get().overListEndScopeId).toBe("test")
    expect(setup.runtime.env.state.get().pointerPosition).toEqual({ x: 24, y: 96 })

    setup.interaction.env.signals.dragEnd.emit(createDragSignal(source, target))
    expect(setup.runtime.env.state.get().activeItemId).toBeUndefined()
    expect(setup.runtime.env.state.get().activeScopeId).toBeUndefined()
    expect(setup.runtime.env.state.get().overItemId).toBeUndefined()
    expect(setup.runtime.env.state.get().overScopeId).toBeUndefined()
    expect(setup.runtime.env.state.get().overListEndScopeId).toBeUndefined()
    expect(setup.runtime.env.state.get().pointerPosition).toBeUndefined()

    await setup.dispose()
  })

  test("tracks constrained zone preview without reordering on drop", async () => {
    const setup = await createPolicySetup()
    const source = setup.registerItem("inbox")
    const zone = setup.registerZone("blocked")

    setup.interaction.env.signals.dragStart.emit(createDragSignal(source))
    setup.interaction.env.signals.dragMove.emit(createDragSignal(source, zone))
    expect(setup.runtime.env.state.get().overZoneId).toBe("blocked")

    setup.interaction.env.signals.dragEnd.emit(createDragSignal(source, zone))

    expect(setup.service.state.get().items.map((item) => item.id)).toEqual([
      "inbox",
      "plan",
      "build",
      "verify",
      "handoff",
    ])
    expect(setup.runtime.env.state.get().overZoneId).toBeUndefined()

    await setup.dispose()
  })

  test("removes signal subscriptions on disposal", async () => {
    const setup = await createPolicySetup()
    const source = setup.registerItem("inbox")
    const target = setup.registerItem("verify")

    await setup.lease.dispose()

    setup.interaction.env.signals.dragStart.emit(createDragSignal(source))
    setup.interaction.env.signals.dragEnd.emit(createDragSignal(source, target))

    expect(setup.service.state.get().items.map((item) => item.id)).toEqual([
      "inbox",
      "plan",
      "build",
      "verify",
      "handoff",
    ])

    await setup.dispose()
  })
})

describe("Workbench DnD Dock preset", () => {
  test("creates non-closeable tabs that can be split by Dock policy", () => {
    const state = createDragDropDemoDockState()
    const root = state.layout.roots.main

    expect(root?.type).toBe("group")
    if (root?.type === "group") {
      expect(root.stackMode).toBe("tabs")
      expect(root.panelIds).toHaveLength(4)
      expect(root.activePanelId).toBe(root.panelIds[0])
    }
    expect(state.panels.every((panel) => panel.closable === false)).toBe(true)
    expect(state.panels.map((panel) => panel.kind)).toEqual([
      "dnd.physical",
      "dnd.guideline",
      "dnd.constrained",
      "dnd.nested-dock",
    ])
  })
})

const createPolicySetup = async () => {
  const service = createDragDropLabService()
  const runtime = createDragDropLabRuntime(service)
  const interaction = createInteractionRuntime()
  const lease = await interaction.install(
    installDragDropLabInteractionPolicy({
      service,
      runtime,
    })
  )

  return {
    interaction,
    lease,
    runtime,
    service,
    registerItem: (itemId: string): InteractionTarget =>
      interaction.registerTarget({
        id: createDragDropLabTargetId("drag-lab-item", itemId),
        roles: ["draggable", "dropzone"],
        data: makeDragDropLabTargetData({
          kind: "drag-lab-item",
          itemId: itemId as DragDropLabItemId,
          scopeId: "test",
        }),
      }).value,
    registerZone: (zoneId: string): InteractionTarget =>
      interaction.registerTarget({
        id: createDragDropLabTargetId("drag-lab-zone", zoneId),
        roles: ["dropzone"],
        data: makeDragDropLabTargetData({
          kind: "drag-lab-zone",
          scopeId: "test",
          zoneId,
        }),
      }).value,
    registerListEnd: (): InteractionTarget =>
      interaction.registerTarget({
        id: createDragDropLabTargetId("drag-lab-list-end", "test"),
        roles: ["dropzone"],
        data: makeDragDropLabTargetData({
          kind: "drag-lab-list-end",
          scopeId: "test",
        }),
      }).value,
    dispose: async () => {
      await lease.dispose()
      await interaction.dispose()
      await runtime.dispose()
    },
  }
}

const createDragSignal = (
  source: InteractionTarget,
  target?: InteractionTarget,
  position = { x: 0, y: 0 }
) => ({
  source,
  target,
  pointerId: 1,
  position,
  modifiers: { alt: false, ctrl: false, meta: false, shift: false },
})
