/**
 * Committed dock state.
 *
 * DockService owns this serializable graph. Runtime preview/session facts such
 * as active drags, hovered drop targets, and resize previews live in
 * DockRuntimeState instead.
 *
 * @module
 */

import type { DockHistoryState } from "./DockHistory.js"
import { createDockHistoryState } from "./DockHistory.js"
import type { DockModalId, DockPanelId, DockSurfaceId } from "./DockIds.js"
import type {
  DockLayout,
  DockLayoutNode,
  DockModalNode,
  DockPanel,
  DockSurface,
} from "./DockNode.js"

export interface DockState {
  readonly panels: ReadonlyArray<DockPanel>
  readonly surfaces: ReadonlyArray<DockSurface>
  readonly layout: DockLayout
  readonly focusedPanelId?: DockPanelId | undefined
  readonly selectedPanelId?: DockPanelId | undefined
  readonly focusedSurfaceId?: DockSurfaceId | undefined
  readonly selectedSurfaceId?: DockSurfaceId | undefined
  readonly modalQueue: ReadonlyArray<DockModalId>
  readonly history: DockHistoryState
}

export interface CreateDockStateOptions {
  readonly panels?: ReadonlyArray<DockPanel> | undefined
  readonly surfaces?: ReadonlyArray<DockSurface> | undefined
  readonly root?: DockLayoutNode | null | undefined
  readonly layout?: DockLayout | undefined
  readonly focusedPanelId?: DockPanelId | undefined
  readonly selectedPanelId?: DockPanelId | undefined
  readonly focusedSurfaceId?: DockSurfaceId | undefined
  readonly selectedSurfaceId?: DockSurfaceId | undefined
  readonly modalQueue?: ReadonlyArray<DockModalId> | undefined
  readonly history?: DockHistoryState | undefined
}

export const createDockState = ({
  panels = [],
  surfaces = [],
  root = null,
  layout,
  focusedPanelId,
  selectedPanelId,
  focusedSurfaceId,
  selectedSurfaceId,
  modalQueue = [],
  history = createDockHistoryState(),
}: CreateDockStateOptions = {}): DockState => ({
  panels,
  surfaces,
  layout:
    layout ??
    ({
      roots: { main: root },
      floatingWindows: [],
      modals: [],
      overlays: [],
      layers: [],
    } satisfies DockLayout),
  focusedPanelId,
  selectedPanelId,
  focusedSurfaceId,
  selectedSurfaceId,
  modalQueue,
  history,
})

export const getOpenModals = (state: DockState): ReadonlyArray<DockModalNode> =>
  state.layout.modals.filter((modal) => modal.open)

export const getTopOpenModal = (state: DockState): DockModalNode | undefined =>
  getOpenModals(state).at(-1)
