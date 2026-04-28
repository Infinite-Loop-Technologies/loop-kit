/**
 * Internal placement helpers.
 *
 * Placement resolution turns simple target/side inputs into committed layout
 * positions. Policy still decides whether the resolved placement is allowed.
 *
 * @module
 */

import type { DockGroupId } from "../DockIds.js"
import type { DockPlacementSide } from "../DockNode.js"
import type { DockPlacement } from "../DockNode.js"

export const createDockPlacement = (
  targetGroupId: DockGroupId,
  side: DockPlacementSide
): DockPlacement => ({
  targetGroupId,
  side,
})

export const isSplitPlacement = (placement: DockPlacement): boolean => placement.side !== "center"
