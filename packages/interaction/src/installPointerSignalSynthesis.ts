/**
 * Pointer signal synthesis installer.
 *
 * This installer listens to raw pointer signals and emits a small structured
 * set: press, click, doubleClick, hover changes, and basic drag lifecycle. It
 * updates runtime/session state only; domain packages install their own
 * policies to react to these signals.
 *
 * @module
 */

import { type Installer, installedVoid } from "@loop-kit/common/Runtime"

import { getDistancePx } from "./InteractionGeometry.js"
import type { InteractionEnv } from "./InteractionRuntime.js"
import type { InteractionRawPointerSignal } from "./InteractionSignals.js"
import type { InteractionDragSession } from "./InteractionState.js"
import type { InteractionTarget } from "./InteractionTarget.js"
import type { LastClick, PointerSession } from "./__internal/PointerSession.js"

export interface PointerSignalSynthesisOptions {
  readonly dragThresholdPx?: number | undefined
  readonly doubleClickMs?: number | undefined
  readonly doubleClickDistancePx?: number | undefined
}

interface ResolvedPointerSignalSynthesisOptions {
  readonly dragThresholdPx: number
  readonly doubleClickMs: number
  readonly doubleClickDistancePx: number
}

export const defaultPointerSignalSynthesisOptions: ResolvedPointerSignalSynthesisOptions = {
  dragThresholdPx: 6,
  doubleClickMs: 300,
  doubleClickDistancePx: 6,
}

export const installPointerSignalSynthesis =
  (options: PointerSignalSynthesisOptions = {}): Installer<InteractionEnv> =>
  (runtime) => {
    const config: ResolvedPointerSignalSynthesisOptions = {
      dragThresholdPx:
        options.dragThresholdPx ?? defaultPointerSignalSynthesisOptions.dragThresholdPx,
      doubleClickMs: options.doubleClickMs ?? defaultPointerSignalSynthesisOptions.doubleClickMs,
      doubleClickDistancePx:
        options.doubleClickDistancePx ?? defaultPointerSignalSynthesisOptions.doubleClickDistancePx,
    }
    let session: PointerSession | undefined
    let lastClick: LastClick | undefined

    const resolveTarget = (signal: InteractionRawPointerSignal): InteractionTarget | undefined =>
      runtime.env.targets.resolveFromDomNode(signal.eventTarget ?? null)

    const emitHoverIfChanged = (
      current: InteractionTarget | undefined,
      nativeEvent: Event | undefined
    ): void => {
      const previousId = runtime.env.state.get().hoverTargetId
      if (previousId === current?.id) return

      const previous = previousId ? runtime.env.targets.get(previousId) : undefined
      runtime.env.state.update((state) => ({
        ...state,
        hoverTargetId: current?.id,
      }))
      runtime.env.signals.hoverChanged.emit({
        previous,
        current,
        nativeEvent,
      })
    }

    const emitDragEnd = (
      activeSession: PointerSession,
      signal: InteractionRawPointerSignal
    ): void => {
      if (!activeSession.isDragging || !activeSession.sourceTargetId) return

      const source = runtime.env.targets.get(activeSession.sourceTargetId)
      if (!source) return

      const target = resolveTarget(signal)
      runtime.env.signals.dragEnd.emit({
        source,
        target,
        pointerId: signal.pointerId,
        position: signal.position,
        modifiers: signal.modifiers,
        nativeEvent: signal.nativeEvent,
      })
    }

    const unsubscribers = [
      runtime.env.signals.rawPointerDown.subscribe((signal) => {
        const target = resolveTarget(signal)
        session = {
          pointerId: signal.pointerId,
          sourceTargetId: target?.id,
          startPosition: signal.position,
          currentPosition: signal.position,
          startedAt: Date.now(),
          isDragging: false,
        }

        runtime.env.state.update((state) => ({
          ...state,
          pointer: {
            pointerId: signal.pointerId,
            position: signal.position,
            targetId: target?.id,
            isDown: true,
          },
        }))

        runtime.env.signals.press.emit({
          target,
          pointerId: signal.pointerId,
          position: signal.position,
          modifiers: signal.modifiers,
          nativeEvent: signal.nativeEvent,
        })
      }),

      runtime.env.signals.rawPointerMove.subscribe((signal) => {
        const target = resolveTarget(signal)
        emitHoverIfChanged(target, signal.nativeEvent)

        runtime.env.state.update((state) => ({
          ...state,
          pointer: {
            pointerId: signal.pointerId,
            position: signal.position,
            targetId: target?.id,
            isDown: Boolean(session),
          },
        }))

        if (!session || session.pointerId !== signal.pointerId) return

        const distance = getDistancePx(session.startPosition, signal.position)
        const source = session.sourceTargetId
          ? runtime.env.targets.get(session.sourceTargetId)
          : undefined
        const wasDragging = session.isDragging
        const nextSession: PointerSession = {
          ...session,
          currentPosition: signal.position,
          isDragging: session.isDragging || Boolean(source && distance >= config.dragThresholdPx),
        }
        session = nextSession

        if (!source || !nextSession.isDragging) return

        const drag: InteractionDragSession = {
          pointerId: signal.pointerId,
          sourceTargetId: source.id,
          currentTargetId: target?.id,
          startPosition: nextSession.startPosition,
          currentPosition: signal.position,
        }

        runtime.env.state.update((state) => ({
          ...state,
          drag,
        }))

        const dragSignal = {
          source,
          target,
          pointerId: signal.pointerId,
          position: signal.position,
          modifiers: signal.modifiers,
          nativeEvent: signal.nativeEvent,
        }

        if (!wasDragging) {
          runtime.env.signals.dragStart.emit(dragSignal)
        } else {
          runtime.env.signals.dragMove.emit(dragSignal)
        }
      }),

      runtime.env.signals.rawPointerUp.subscribe((signal) => {
        const activeSession = session
        const target = resolveTarget(signal)

        runtime.env.state.update((state) => ({
          ...state,
          pointer: {
            pointerId: signal.pointerId,
            position: signal.position,
            targetId: target?.id,
            isDown: false,
          },
        }))

        if (activeSession?.pointerId === signal.pointerId) {
          emitDragEnd(activeSession, signal)

          const isClick = !activeSession.isDragging && activeSession.sourceTargetId === target?.id

          if (isClick) {
            const clickSignal = {
              target,
              pointerId: signal.pointerId,
              position: signal.position,
              modifiers: signal.modifiers,
              nativeEvent: signal.nativeEvent,
            }
            runtime.env.signals.click.emit(clickSignal)

            const now = Date.now()
            if (
              lastClick &&
              lastClick.targetId === target?.id &&
              now - lastClick.clickedAt <= config.doubleClickMs &&
              getDistancePx(lastClick.position, signal.position) <= config.doubleClickDistancePx
            ) {
              runtime.env.signals.doubleClick.emit(clickSignal)
            }

            lastClick = {
              targetId: target?.id,
              position: signal.position,
              clickedAt: now,
            }
          }
        }

        session = undefined
        runtime.env.state.update((state) => ({
          ...state,
          drag: undefined,
        }))
      }),

      runtime.env.signals.rawPointerCancel.subscribe((signal) => {
        if (session?.pointerId === signal.pointerId) {
          emitDragEnd(session, signal)
        }
        session = undefined
        runtime.env.state.update((state) => ({
          ...state,
          pointer: {
            pointerId: signal.pointerId,
            position: signal.position,
            isDown: false,
          },
          drag: undefined,
        }))
      }),
    ]

    return installedVoid(() => {
      for (const unsubscribe of unsubscribers) unsubscribe()
    })
  }
