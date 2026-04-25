/**
 * Committed dock state.
 *
 * This is the service-owned domain truth. Preview state such as drag hover and
 * transient resize sessions belongs in the dock runtime, not here.
 */

import type { DockPanelId } from "./DockIds.js";
import { createDockHistoryState, type DockHistoryState } from "./DockHistory.js";
import type { DockLayout, DockPanel } from "./DockNode.js";

export interface DockState {
  readonly layout: DockLayout;
  readonly panels: ReadonlyArray<DockPanel>;
  readonly focusedPanelId?: DockPanelId | undefined;
  readonly selectedPanelId?: DockPanelId | undefined;
  readonly history: DockHistoryState;
}

export const createDockState = ({
  layout,
  panels,
  focusedPanelId,
  selectedPanelId,
}: {
  readonly layout: DockLayout;
  readonly panels: ReadonlyArray<DockPanel>;
  readonly focusedPanelId?: DockPanelId | undefined;
  readonly selectedPanelId?: DockPanelId | undefined;
}): DockState => ({
  layout,
  panels,
  focusedPanelId,
  selectedPanelId,
  history: createDockHistoryState(),
});
