import type { DockPanel } from "@loop-kit/dock"
import {
  createDockGroup,
  createDockLayout,
  createDockModal,
  createDockPanelId,
  createDockSplit,
  createDockState,
  createDockWindow,
} from "@loop-kit/dock"

export const createWorkbenchDockState = () => {
  const explorer = createWorkbenchPanel("Explorer", "debug.explorer")
  const editor = createWorkbenchPanel("Editor", "debug.editor")
  const inspector = createWorkbenchPanel("Inspector", "debug.inspector")
  const alerts = createWorkbenchPanel("Alert", "debug.alert")
  const preview = createWorkbenchPanel("Preview", "debug.editor")
  const palette = createWorkbenchPanel("Command Palette", "debug.alert")

  const left = createDockGroup({ panelIds: [explorer.id], activePanelId: explorer.id, fixed: true })
  const main = createDockGroup({ panelIds: [editor.id], activePanelId: editor.id })
  const right = createDockGroup({
    panelIds: [inspector.id],
    activePanelId: inspector.id,
    fixed: true,
  })
  const modalRoot = createDockGroup({
    panelIds: [alerts.id],
    activePanelId: alerts.id,
    stackMode: "modal",
  })
  const previewRoot = createDockGroup({
    panelIds: [preview.id],
    activePanelId: preview.id,
    stackMode: "overlay",
  })
  const paletteRoot = createDockGroup({
    panelIds: [palette.id],
    activePanelId: palette.id,
    stackMode: "none",
  })

  const previewWindow = createDockWindow({
    title: "Preview",
    root: previewRoot,
    active: true,
    frame: { x: 420, y: 76, width: 340, height: 230 },
  })
  const paletteWindow = createDockWindow({
    title: "Command Palette",
    root: paletteRoot,
    frame: { x: 84, y: 96, width: 320, height: 190 },
  })

  return createDockState({
    panels: [explorer, editor, inspector, alerts, preview, palette],
    layout: createDockLayout({
      main: createDockSplit({ axis: "horizontal", leading: left, trailing: main, ratio: 0.22 }),
      right,
      floatingWindows: [paletteWindow, previewWindow],
      modals: [createDockModal({ title: "Debug Alert", root: modalRoot, open: false })],
    }),
    focusedPanelId: editor.id,
    selectedPanelId: editor.id,
    focusedSurfaceId: previewWindow.surfaceId,
    selectedSurfaceId: previewWindow.surfaceId,
  })
}

const createWorkbenchPanel = (title: string, kind: string): DockPanel => ({
  id: createDockPanelId(),
  title,
  kind,
})
