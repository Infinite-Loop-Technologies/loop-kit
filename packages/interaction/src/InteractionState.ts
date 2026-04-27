/**
 * Runtime/session state for interaction.
 *
 * This store captures current input/session facts such as the latest pointer
 * position, active drag, focus target, and keyboard state. It is not domain
 * truth; services and domain packages own committed business state.
 *
 * @module
 */

import { type Store, createStore } from "@loop-kit/common/Store"

import type { InteractionPoint } from "./InteractionGeometry.js"
import type { InteractionTargetId } from "./InteractionTarget.js"

export interface InteractionPointerState {
  readonly pointerId: number
  readonly position: InteractionPoint
  readonly targetId?: InteractionTargetId | undefined
  readonly isDown: boolean
}

export interface InteractionDragSession {
  readonly pointerId: number
  readonly sourceTargetId: InteractionTargetId
  readonly currentTargetId?: InteractionTargetId | undefined
  readonly startPosition: InteractionPoint
  readonly currentPosition: InteractionPoint
}

export interface InteractionKeyboardModifiers {
  readonly alt: boolean
  readonly ctrl: boolean
  readonly meta: boolean
  readonly shift: boolean
}

export interface InteractionState {
  readonly pointer?: InteractionPointerState | undefined
  readonly hoverTargetId?: InteractionTargetId | undefined
  readonly focusTargetId?: InteractionTargetId | undefined
  readonly drag?: InteractionDragSession | undefined
  readonly keyboard: {
    readonly modifiers: InteractionKeyboardModifiers
    readonly pressedKeys: ReadonlySet<string>
  }
}

export const emptyInteractionKeyboardModifiers: InteractionKeyboardModifiers = {
  alt: false,
  ctrl: false,
  meta: false,
  shift: false,
}

export const createInitialInteractionState = (): InteractionState => ({
  keyboard: {
    modifiers: emptyInteractionKeyboardModifiers,
    pressedKeys: new Set(),
  },
})

export const createInteractionStateStore = (): Store<InteractionState> =>
  createStore(createInitialInteractionState())
