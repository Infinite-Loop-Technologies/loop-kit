import type { DockGroupId, DockPanel, DockPanelId, DockState } from "@loop-kit/dock"
import { createDockGroup, createDockState } from "@loop-kit/dock"

export interface WorkbenchDockTabPresetPanel {
  readonly id: string
  readonly title: string
  readonly kind: string
  readonly metadata?: Readonly<Record<string, unknown>> | undefined
}

export interface WorkbenchDockTabPresetOptions {
  readonly groupId: string
  readonly panels: ReadonlyArray<WorkbenchDockTabPresetPanel>
  readonly activePanelId?: string | undefined
}

export const createWorkbenchDockTabPreset = ({
  groupId,
  panels,
  activePanelId = panels[0]?.id,
}: WorkbenchDockTabPresetOptions): DockState => {
  const dockPanels: ReadonlyArray<DockPanel> = panels.map((panel) => ({
    id: toDockPanelId(panel.id),
    title: panel.title,
    kind: panel.kind,
    closable: false,
    metadata: panel.metadata,
  }))
  const active = activePanelId ? toDockPanelId(activePanelId) : undefined

  return createDockState({
    panels: dockPanels,
    root: createDockGroup({
      id: toDockGroupId(groupId),
      panelIds: dockPanels.map((panel) => panel.id),
      activePanelId: active,
      stackMode: "tabs",
    }),
    focusedPanelId: active,
    selectedPanelId: active,
  })
}

export const createDragDropDemoDockState = (): DockState =>
  createWorkbenchDockTabPreset({
    groupId: "dnd-demo-tabs",
    panels: [
      { id: "dnd-physical", title: "Physical reorder", kind: "dnd.physical" },
      { id: "dnd-guideline", title: "Guide line", kind: "dnd.guideline" },
      { id: "dnd-constrained", title: "Constrained zones", kind: "dnd.constrained" },
      { id: "dnd-nested-dock", title: "Nested Dock", kind: "dnd.nested-dock" },
    ],
  })

const toDockPanelId = (id: string): DockPanelId => `panel:${id}` as DockPanelId
const toDockGroupId = (id: string): DockGroupId => `group:${id}` as DockGroupId
