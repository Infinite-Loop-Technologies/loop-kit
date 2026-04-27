/**
 * Small pointer session model for synthesis.
 *
 * Pointer synthesis tracks only enough information to distinguish press,
 * click, double click, hover, and a basic drag threshold. It is not a browser
 * event system and does not decide domain behavior.
 *
 * @module
 */

import type { InteractionPoint } from "../InteractionGeometry.js"
import type { InteractionTargetId } from "../InteractionTarget.js"

export interface PointerSession {
  readonly pointerId: number
  readonly sourceTargetId?: InteractionTargetId | undefined
  readonly startPosition: InteractionPoint
  readonly currentPosition: InteractionPoint
  readonly startedAt: number
  readonly isDragging: boolean
}

export interface LastClick {
  readonly targetId?: InteractionTargetId | undefined
  readonly position: InteractionPoint
  readonly clickedAt: number
}
