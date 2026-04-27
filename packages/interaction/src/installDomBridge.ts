/**
 * DOM bridge installer for raw input signals.
 *
 * This bridge attaches listeners to a supplied root EventTarget and emits raw
 * pointer, keyboard, and focus signals. It does not synthesize clicks, drags,
 * shortcuts, or domain behavior.
 *
 * @module
 */

import { type Installer, installedVoid } from "@loop-kit/common/Runtime"

import { getPointFromClientCoordinates } from "./InteractionGeometry.js"
import type { InteractionEnv } from "./InteractionRuntime.js"
import type {
  InteractionRawFocusSignal,
  InteractionRawKeySignal,
  InteractionRawPointerSignal,
} from "./InteractionSignals.js"
import type { InteractionKeyboardModifiers } from "./InteractionState.js"

export const installDomBridge =
  (root: EventTarget): Installer<InteractionEnv> =>
  (runtime) => {
    const onPointerDown = (event: Event): void => {
      runtime.env.signals.rawPointerDown.emit(createRawPointerSignal(event))
    }
    const onPointerMove = (event: Event): void => {
      runtime.env.signals.rawPointerMove.emit(createRawPointerSignal(event))
    }
    const onPointerUp = (event: Event): void => {
      runtime.env.signals.rawPointerUp.emit(createRawPointerSignal(event))
    }
    const onPointerCancel = (event: Event): void => {
      runtime.env.signals.rawPointerCancel.emit(createRawPointerSignal(event))
    }
    const onKeyDown = (event: Event): void => {
      runtime.env.signals.rawKeyDown.emit(createRawKeySignal(event))
    }
    const onKeyUp = (event: Event): void => {
      runtime.env.signals.rawKeyUp.emit(createRawKeySignal(event))
    }
    const onFocusIn = (event: Event): void => {
      runtime.env.signals.rawFocusIn.emit(createRawFocusSignal(event))
    }
    const onFocusOut = (event: Event): void => {
      runtime.env.signals.rawFocusOut.emit(createRawFocusSignal(event))
    }

    root.addEventListener("pointerdown", onPointerDown)
    root.addEventListener("pointermove", onPointerMove)
    root.addEventListener("pointerup", onPointerUp)
    root.addEventListener("pointercancel", onPointerCancel)
    root.addEventListener("keydown", onKeyDown)
    root.addEventListener("keyup", onKeyUp)
    root.addEventListener("focusin", onFocusIn)
    root.addEventListener("focusout", onFocusOut)

    return installedVoid(() => {
      root.removeEventListener("pointerdown", onPointerDown)
      root.removeEventListener("pointermove", onPointerMove)
      root.removeEventListener("pointerup", onPointerUp)
      root.removeEventListener("pointercancel", onPointerCancel)
      root.removeEventListener("keydown", onKeyDown)
      root.removeEventListener("keyup", onKeyUp)
      root.removeEventListener("focusin", onFocusIn)
      root.removeEventListener("focusout", onFocusOut)
    })
  }

const createRawPointerSignal = (event: Event): InteractionRawPointerSignal => {
  const pointerEvent = event as PointerEvent

  return {
    pointerId: pointerEvent.pointerId ?? 0,
    position: getPointFromClientCoordinates(pointerEvent.clientX ?? 0, pointerEvent.clientY ?? 0),
    button: pointerEvent.button ?? 0,
    buttons: pointerEvent.buttons ?? 0,
    modifiers: getModifiers(pointerEvent),
    eventTarget: event.target,
    nativeEvent: event,
  }
}

const createRawKeySignal = (event: Event): InteractionRawKeySignal => {
  const keyboardEvent = event as KeyboardEvent

  return {
    key: keyboardEvent.key ?? "",
    code: keyboardEvent.code ?? "",
    repeat: keyboardEvent.repeat ?? false,
    modifiers: getModifiers(keyboardEvent),
    eventTarget: event.target,
    nativeEvent: event,
  }
}

const createRawFocusSignal = (event: Event): InteractionRawFocusSignal => {
  const focusEvent = event as FocusEvent

  return {
    eventTarget: event.target,
    relatedTarget: focusEvent.relatedTarget,
    nativeEvent: event,
  }
}

const getModifiers = (
  event: Pick<MouseEvent | KeyboardEvent, "altKey" | "ctrlKey" | "metaKey" | "shiftKey">
): InteractionKeyboardModifiers => ({
  alt: event.altKey,
  ctrl: event.ctrlKey,
  meta: event.metaKey,
  shift: event.shiftKey,
})
