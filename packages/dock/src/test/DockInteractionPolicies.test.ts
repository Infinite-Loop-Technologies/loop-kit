import { describe, expect, test } from "vitest"

import type { InteractionTargetId } from "@loop-kit/interaction"
import { createInteractionRuntime } from "@loop-kit/interaction"

import {
  DockDropzoneTarget,
  DockOverlayBackdropTarget,
  type DockPanel,
  DockResizeHandleTarget,
  DockTabTarget,
  DockWindowResizeHandleTarget,
  DockWindowTitlebarTarget,
  createDockGroup,
  createDockLayout,
  createDockModal,
  createDockPanelId,
  createDockRuntime,
  createDockService,
  createDockSplit,
  createDockState,
  createDockWindow,
  installDefaultDockInteraction,
} from "../index.js"

describe("Dock interaction policies", () => {
  test("clicking a dock tab selects and focuses its panel", async () => {
    const panel = createPanel("Editor")
    const group = createDockGroup({ panelIds: [panel.id], activePanelId: panel.id })
    const dock = createDockService({
      initialState: createDockState({ panels: [panel], root: group }),
    })
    const dockRuntime = createDockRuntime({ dock })
    const interaction = createInteractionRuntime()
    await interaction.install(installDefaultDockInteraction({ dock, runtime: dockRuntime }))

    const tab = interaction.registerTarget({
      id: "tab" as InteractionTargetId,
      roles: ["pressable", "draggable"],
      data: DockTabTarget.make({ panelId: panel.id, groupId: group.id }),
    }).value

    interaction.env.signals.click.emit(createClick(tab))

    expect(dock.state.get().focusedPanelId).toBe(panel.id)
    expect(dock.state.get().selectedPanelId).toBe(panel.id)

    await interaction.dispose()
    await dockRuntime.dispose()
  })

  test("dragging a dock tab previews and commits a drop", async () => {
    const source = createPanel("Source")
    const target = createPanel("Target")
    const sourceGroup = createDockGroup({ panelIds: [source.id], activePanelId: source.id })
    const targetGroup = createDockGroup({ panelIds: [target.id], activePanelId: target.id })
    const split = createDockSplit({
      axis: "horizontal",
      leading: sourceGroup,
      trailing: targetGroup,
    })
    const dock = createDockService({
      initialState: createDockState({ panels: [source, target], root: split }),
    })
    const dockRuntime = createDockRuntime({ dock })
    const interaction = createInteractionRuntime()
    await interaction.install(installDefaultDockInteraction({ dock, runtime: dockRuntime }))

    const tab = interaction.registerTarget({
      id: "source-tab" as InteractionTargetId,
      roles: ["draggable"],
      data: DockTabTarget.make({ panelId: source.id, groupId: sourceGroup.id }),
    }).value
    const dropzone = interaction.registerTarget({
      id: "target-dropzone" as InteractionTargetId,
      roles: ["dropzone"],
      data: DockDropzoneTarget.make({ groupId: targetGroup.id, side: "center" }),
    }).value

    interaction.env.signals.dragStart.emit({
      source: tab,
      target: tab,
      pointerId: 1,
      position: { x: 0, y: 0 },
      modifiers: noModifiers,
    })
    interaction.env.signals.dragMove.emit({
      source: tab,
      target: dropzone,
      pointerId: 1,
      position: { x: 5, y: 0 },
      modifiers: noModifiers,
    })
    expect(dockRuntime.env.state.get().dragPreview?.placement?.targetGroupId).toBe(targetGroup.id)

    interaction.env.signals.dragEnd.emit({
      source: tab,
      target: dropzone,
      pointerId: 1,
      position: { x: 5, y: 0 },
      modifiers: noModifiers,
    })

    expect(dockRuntime.env.state.get().dragPreview).toBeUndefined()
    expect(dock.state.get().selectedPanelId).toBe(source.id)

    await interaction.dispose()
    await dockRuntime.dispose()
  })

  test("Escape closes the top modal", async () => {
    const panel = createPanel("Alert")
    const modal = createDockModal({
      title: "Alert",
      root: createDockGroup({ panelIds: [panel.id], activePanelId: panel.id, stackMode: "modal" }),
      open: true,
    })
    const dock = createDockService({
      initialState: createDockState({
        panels: [panel],
        layout: {
          roots: { main: null },
          floatingWindows: [],
          overlays: [],
          layers: [],
          modals: [modal],
        },
      }),
    })
    const dockRuntime = createDockRuntime({ dock })
    const interaction = createInteractionRuntime()
    await interaction.install(installDefaultDockInteraction({ dock, runtime: dockRuntime }))

    interaction.env.signals.keyPressed.emit({
      key: "Escape",
      code: "Escape",
      repeat: false,
      modifiers: noModifiers,
    })

    expect(dock.state.get().layout.modals[0]?.open).toBe(false)

    await interaction.dispose()
    await dockRuntime.dispose()
  })

  test("outside click respects modal click-behind policy", async () => {
    const panel = createPanel("Alert")
    const modal = createDockModal({
      title: "Alert",
      root: createDockGroup({ panelIds: [panel.id], activePanelId: panel.id, stackMode: "modal" }),
      open: true,
    })
    const dock = createDockService({
      initialState: createDockState({
        panels: [panel],
        layout: {
          roots: { main: null },
          floatingWindows: [],
          overlays: [],
          layers: [],
          modals: [modal],
        },
      }),
      policy: {
        canModalClickBehind: () => ({ ok: false, reason: "Blocked." }),
      },
    })
    const dockRuntime = createDockRuntime({ dock })
    const interaction = createInteractionRuntime()
    await interaction.install(installDefaultDockInteraction({ dock, runtime: dockRuntime }))

    const backdrop = interaction.registerTarget({
      id: "backdrop" as InteractionTargetId,
      roles: ["pressable"],
      data: DockOverlayBackdropTarget.make({ modalId: modal.id }),
    }).value

    interaction.env.signals.click.emit(createClick(backdrop))

    expect(dock.state.get().layout.modals[0]?.open).toBe(true)

    await interaction.dispose()
    await dockRuntime.dispose()
  })

  test("dragging a resize handle commits the preview ratio", async () => {
    const left = createPanel("Left")
    const right = createPanel("Right")
    const split = createDockSplit({
      axis: "horizontal",
      leading: createDockGroup({ panelIds: [left.id], activePanelId: left.id }),
      trailing: createDockGroup({ panelIds: [right.id], activePanelId: right.id }),
    })
    const dock = createDockService({
      initialState: createDockState({ panels: [left, right], root: split }),
    })
    const dockRuntime = createDockRuntime({ dock })
    const interaction = createInteractionRuntime()
    await interaction.install(installDefaultDockInteraction({ dock, runtime: dockRuntime }))

    const handle = interaction.registerTarget({
      id: "resize" as InteractionTargetId,
      roles: ["resize-handle", "draggable"],
      data: DockResizeHandleTarget.make({ splitId: split.id, axis: "horizontal" }),
      getRect: () => ({ x: 0, y: 0, width: 100, height: 10 }),
    }).value

    interaction.env.signals.dragStart.emit({
      source: handle,
      target: handle,
      pointerId: 1,
      position: { x: 50, y: 0 },
      modifiers: noModifiers,
    })
    interaction.env.signals.dragMove.emit({
      source: handle,
      target: handle,
      pointerId: 1,
      position: { x: 75, y: 0 },
      modifiers: noModifiers,
    })
    interaction.env.signals.dragEnd.emit({
      source: handle,
      target: handle,
      pointerId: 1,
      position: { x: 75, y: 0 },
      modifiers: noModifiers,
    })

    const root = dock.state.get().layout.roots.main
    expect(root?.type).toBe("split")
    if (root?.type === "split") expect(root.ratio).toBe(0.75)

    await interaction.dispose()
    await dockRuntime.dispose()
  })

  test("dragging a window titlebar commits a window move", async () => {
    const panel = createPanel("Window")
    const window = createDockWindow({
      title: "Window",
      root: createDockGroup({ panelIds: [panel.id], activePanelId: panel.id }),
      frame: { x: 20, y: 30, width: 320, height: 240 },
    })
    const dock = createDockService({
      initialState: createDockState({
        panels: [panel],
        layout: createDockLayout({ floatingWindows: [window] }),
      }),
    })
    const dockRuntime = createDockRuntime({ dock })
    const interaction = createInteractionRuntime()
    await interaction.install(installDefaultDockInteraction({ dock, runtime: dockRuntime }))

    const titlebar = interaction.registerTarget({
      id: "window-titlebar" as InteractionTargetId,
      roles: ["draggable"],
      data: DockWindowTitlebarTarget.make({ windowId: window.id }),
    }).value

    interaction.env.signals.dragStart.emit({
      source: titlebar,
      target: titlebar,
      pointerId: 1,
      position: { x: 100, y: 100 },
      modifiers: noModifiers,
    })
    interaction.env.signals.dragMove.emit({
      source: titlebar,
      target: titlebar,
      pointerId: 1,
      position: { x: 130, y: 150 },
      modifiers: noModifiers,
    })
    interaction.env.signals.dragEnd.emit({
      source: titlebar,
      target: titlebar,
      pointerId: 1,
      position: { x: 130, y: 150 },
      modifiers: noModifiers,
    })

    expect(dock.state.get().layout.floatingWindows[0]?.frame).toMatchObject({ x: 50, y: 80 })
    expect(dockRuntime.env.state.get().windowMovePreview).toBeUndefined()

    await interaction.dispose()
    await dockRuntime.dispose()
  })

  test("dragging a window resize handle commits a window resize", async () => {
    const panel = createPanel("Window")
    const window = createDockWindow({
      title: "Window",
      root: createDockGroup({ panelIds: [panel.id], activePanelId: panel.id }),
      frame: { x: 20, y: 30, width: 320, height: 240 },
    })
    const dock = createDockService({
      initialState: createDockState({
        panels: [panel],
        layout: createDockLayout({ floatingWindows: [window] }),
      }),
    })
    const dockRuntime = createDockRuntime({ dock })
    const interaction = createInteractionRuntime()
    await interaction.install(installDefaultDockInteraction({ dock, runtime: dockRuntime }))

    const handle = interaction.registerTarget({
      id: "window-resize" as InteractionTargetId,
      roles: ["resize-handle", "draggable"],
      data: DockWindowResizeHandleTarget.make({ windowId: window.id }),
    }).value

    interaction.env.signals.dragStart.emit({
      source: handle,
      target: handle,
      pointerId: 1,
      position: { x: 100, y: 100 },
      modifiers: noModifiers,
    })
    interaction.env.signals.dragMove.emit({
      source: handle,
      target: handle,
      pointerId: 1,
      position: { x: 150, y: 140 },
      modifiers: noModifiers,
    })
    interaction.env.signals.dragEnd.emit({
      source: handle,
      target: handle,
      pointerId: 1,
      position: { x: 150, y: 140 },
      modifiers: noModifiers,
    })

    expect(dock.state.get().layout.floatingWindows[0]?.frame).toMatchObject({
      width: 370,
      height: 280,
    })
    expect(dockRuntime.env.state.get().windowResizePreview).toBeUndefined()

    await interaction.dispose()
    await dockRuntime.dispose()
  })
})

const noModifiers = { alt: false, ctrl: false, meta: false, shift: false }

const createPanel = (title: string): DockPanel => ({
  id: createDockPanelId(),
  title,
  kind: `test.${title.toLowerCase()}`,
})

const createClick = (target: NonNullable<Parameters<typeof DockTabTarget.match>[0]>) => ({
  target,
  pointerId: 1,
  position: { x: 0, y: 0 },
  modifiers: noModifiers,
})
