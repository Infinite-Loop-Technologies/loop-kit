/**
 * Signal surface for the interaction runtime.
 *
 * Raw signals are normalized occurrences from bridges. Structured signals are
 * synthesized runtime occurrences. Stores hold current state; these signals
 * only represent things that happened.
 *
 * @module
 */

import { type Signal, createSignal } from "@loop-kit/common/Signal"

import type { InteractionPoint } from "./InteractionGeometry.js"
import type { InteractionKeyboardModifiers } from "./InteractionState.js"
import type { InteractionTarget } from "./InteractionTarget.js"

export interface InteractionRawPointerSignal {
  readonly pointerId: number
  readonly position: InteractionPoint
  readonly button: number
  readonly buttons: number
  readonly modifiers: InteractionKeyboardModifiers
  readonly eventTarget?: EventTarget | null | undefined
  readonly nativeEvent?: Event | undefined
}

export interface InteractionRawKeySignal {
  readonly key: string
  readonly code: string
  readonly repeat: boolean
  readonly modifiers: InteractionKeyboardModifiers
  readonly eventTarget?: EventTarget | null | undefined
  readonly nativeEvent?: Event | undefined
}

export interface InteractionRawFocusSignal {
  readonly eventTarget?: EventTarget | null | undefined
  readonly relatedTarget?: EventTarget | null | undefined
  readonly nativeEvent?: Event | undefined
}

export interface InteractionPointerSignal {
  readonly target?: InteractionTarget | undefined
  readonly pointerId: number
  readonly position: InteractionPoint
  readonly modifiers: InteractionKeyboardModifiers
  readonly nativeEvent?: Event | undefined
}

export interface InteractionClickSignal extends InteractionPointerSignal {}

export interface InteractionDragSignal extends InteractionPointerSignal {
  readonly source: InteractionTarget
}

export interface InteractionTargetChangedSignal {
  readonly previous?: InteractionTarget | undefined
  readonly current?: InteractionTarget | undefined
  readonly nativeEvent?: Event | undefined
}

export interface InteractionKeySignal {
  readonly key: string
  readonly code: string
  readonly repeat: boolean
  readonly modifiers: InteractionKeyboardModifiers
  readonly target?: InteractionTarget | undefined
  readonly nativeEvent?: Event | undefined
}

export interface InteractionSignals {
  readonly rawPointerDown: Signal<InteractionRawPointerSignal>
  readonly rawPointerMove: Signal<InteractionRawPointerSignal>
  readonly rawPointerUp: Signal<InteractionRawPointerSignal>
  readonly rawPointerCancel: Signal<InteractionRawPointerSignal>
  readonly rawKeyDown: Signal<InteractionRawKeySignal>
  readonly rawKeyUp: Signal<InteractionRawKeySignal>
  readonly rawFocusIn: Signal<InteractionRawFocusSignal>
  readonly rawFocusOut: Signal<InteractionRawFocusSignal>

  readonly press: Signal<InteractionPointerSignal>
  readonly click: Signal<InteractionClickSignal>
  readonly doubleClick: Signal<InteractionClickSignal>
  readonly dragStart: Signal<InteractionDragSignal>
  readonly dragMove: Signal<InteractionDragSignal>
  readonly dragEnd: Signal<InteractionDragSignal>
  readonly hoverChanged: Signal<InteractionTargetChangedSignal>
  readonly focusChanged: Signal<InteractionTargetChangedSignal>
  readonly keyPressed: Signal<InteractionKeySignal>
  readonly keyReleased: Signal<InteractionKeySignal>
}

export const createInteractionSignals = (): InteractionSignals => ({
  rawPointerDown: createSignal(),
  rawPointerMove: createSignal(),
  rawPointerUp: createSignal(),
  rawPointerCancel: createSignal(),
  rawKeyDown: createSignal(),
  rawKeyUp: createSignal(),
  rawFocusIn: createSignal(),
  rawFocusOut: createSignal(),

  press: createSignal(),
  click: createSignal(),
  doubleClick: createSignal(),
  dragStart: createSignal(),
  dragMove: createSignal(),
  dragEnd: createSignal(),
  hoverChanged: createSignal(),
  focusChanged: createSignal(),
  keyPressed: createSignal(),
  keyReleased: createSignal(),
})

export const disposeInteractionSignals = (signals: InteractionSignals): void => {
  for (const signal of Object.values(signals)) signal[Symbol.dispose]()
}
