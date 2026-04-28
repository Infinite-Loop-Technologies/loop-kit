/**
 * Internal geometry math wrappers.
 *
 * Public geometry helpers live in DockGeometry. This file is reserved for
 * layout-engine-only calculations that should remain easy to swap later.
 *
 * @module
 */

import type { DockAxis, DockPoint, DockRect } from "../DockGeometry.js"
import { clampRatio } from "../DockGeometry.js"

export const getResizeRatioFromPoint = (
  rect: DockRect,
  axis: DockAxis,
  point: DockPoint
): number => {
  if (axis === "horizontal") return clampRatio((point.x - rect.x) / rect.width)
  return clampRatio((point.y - rect.y) / rect.height)
}
