/**
 * Debug helpers for demos and tests.
 *
 * These helpers create a small representative dock state. They are not a
 * visual design system and should not become product UI.
 *
 * @module
 */

import { createDockPanelId } from "./DockIds.js"
import {
  createDockGroup,
  createDockLayout,
  createDockModal,
  createDockSplit,
} from "./DockLayout.js"
import type { DockPanel } from "./DockNode.js"
import { createDockState } from "./DockState.js"

export const createDebugDockState = () => {
  const explorer: DockPanel = {
    id: createDockPanelId(),
    title: "Explorer",
    kind: "debug.explorer",
  }
  const editor: DockPanel = {
    id: createDockPanelId(),
    title: "Editor",
    kind: "debug.editor",
  }
  const inspector: DockPanel = {
    id: createDockPanelId(),
    title: "Inspector",
    kind: "debug.inspector",
  }
  const alerts: DockPanel = {
    id: createDockPanelId(),
    title: "Alert",
    kind: "debug.alert",
  }

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

  return createDockState({
    panels: [explorer, editor, inspector, alerts],
    layout: createDockLayout({
      main: createDockSplit({ axis: "horizontal", leading: left, trailing: main, ratio: 0.22 }),
      right,
      modals: [createDockModal({ title: "Debug Alert", root: modalRoot, open: true })],
    }),
    focusedPanelId: editor.id,
    selectedPanelId: editor.id,
  })
}
