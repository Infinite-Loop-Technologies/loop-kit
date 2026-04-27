/**
 * Keyboard and focus signal synthesis installer.
 *
 * This installer normalizes raw key/focus bridge events into keyPressed,
 * keyReleased, and focusChanged signals while updating runtime keyboard/focus
 * state. It intentionally does not implement shortcut routing.
 *
 * @module
 */

import { type Installer, installedVoid } from "@loop-kit/common/Runtime"

import type { InteractionEnv } from "./InteractionRuntime.js"
import type { InteractionRawFocusSignal, InteractionRawKeySignal } from "./InteractionSignals.js"
import type { InteractionKeyboardModifiers } from "./InteractionState.js"
import type { InteractionTarget } from "./InteractionTarget.js"

export const installKeyboardSignalSynthesis = (): Installer<InteractionEnv> => (runtime) => {
  const resolveTarget = (
    signal: InteractionRawKeySignal | InteractionRawFocusSignal
  ): InteractionTarget | undefined =>
    runtime.env.targets.resolveFromDomNode(signal.eventTarget ?? null)

  const updateKeyboard = (
    key: string,
    modifiers: InteractionKeyboardModifiers,
    pressed: boolean
  ): void => {
    runtime.env.state.update((state) => {
      const pressedKeys = new Set(state.keyboard.pressedKeys)
      if (pressed) {
        pressedKeys.add(key)
      } else {
        pressedKeys.delete(key)
      }

      return {
        ...state,
        keyboard: {
          modifiers,
          pressedKeys,
        },
      }
    })
  }

  const emitFocusChanged = (
    current: InteractionTarget | undefined,
    nativeEvent: Event | undefined
  ): void => {
    const previousId = runtime.env.state.get().focusTargetId
    if (previousId === current?.id) return

    const previous = previousId ? runtime.env.targets.get(previousId) : undefined
    runtime.env.state.update((state) => ({
      ...state,
      focusTargetId: current?.id,
    }))
    runtime.env.signals.focusChanged.emit({
      previous,
      current,
      nativeEvent,
    })
  }

  const unsubscribers = [
    runtime.env.signals.rawKeyDown.subscribe((signal) => {
      updateKeyboard(signal.key, signal.modifiers, true)
      runtime.env.signals.keyPressed.emit({
        key: signal.key,
        code: signal.code,
        repeat: signal.repeat,
        modifiers: signal.modifiers,
        target: resolveTarget(signal),
        nativeEvent: signal.nativeEvent,
      })
    }),

    runtime.env.signals.rawKeyUp.subscribe((signal) => {
      updateKeyboard(signal.key, signal.modifiers, false)
      runtime.env.signals.keyReleased.emit({
        key: signal.key,
        code: signal.code,
        repeat: signal.repeat,
        modifiers: signal.modifiers,
        target: resolveTarget(signal),
        nativeEvent: signal.nativeEvent,
      })
    }),

    runtime.env.signals.rawFocusIn.subscribe((signal) => {
      emitFocusChanged(resolveTarget(signal), signal.nativeEvent)
    }),

    runtime.env.signals.rawFocusOut.subscribe((signal) => {
      const relatedTarget = runtime.env.targets.resolveFromDomNode(signal.relatedTarget ?? null)
      emitFocusChanged(relatedTarget, signal.nativeEvent)
    }),
  ]

  return installedVoid(() => {
    for (const unsubscribe of unsubscribers) unsubscribe()
  })
}
