/**
 * Internal validation helpers for dock state.
 *
 * These helpers return small booleans/messages so DockService can keep its
 * public recoverable failures typed as DockError.
 *
 * @module
 */

import type { DockGroupId, DockPanelId, DockSplitId } from "../DockIds.js"
import { findGroupById, findSplitById, getPanelById } from "../DockLayout.js"
import type { DockState } from "../DockState.js"

export const hasPanel = (state: DockState, panelId: DockPanelId): boolean =>
  Boolean(getPanelById(state.panels, panelId))

export const hasGroup = (state: DockState, groupId: DockGroupId): boolean =>
  Boolean(findGroupById(state.layout, groupId))

export const hasSplit = (state: DockState, splitId: DockSplitId): boolean =>
  Boolean(findSplitById(state.layout, splitId))
