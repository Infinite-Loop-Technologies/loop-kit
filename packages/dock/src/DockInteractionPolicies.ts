/**
 * Dock policies installed into InteractionRuntime.
 *
 * These installers translate generic interaction signals into dock service and
 * runtime calls. They do not import React and do not own committed state.
 *
 * @module
 */

import type { Installer } from "@loop-kit/common/Runtime"
import { installedVoid } from "@loop-kit/common/Runtime"
import type { InteractionEnv } from "@loop-kit/interaction"

import type { DockPolicy } from "./DockPolicy.js"
import type { DockRuntime } from "./DockRuntime.js"
import type { DockService } from "./DockService.js"
import { getTopOpenModal } from "./DockState.js"
import {
  DockDropzoneTarget,
  DockModalSurfaceTarget,
  DockOverlayBackdropTarget,
  DockPanelTarget,
  DockResizeHandleTarget,
  DockTabTarget,
} from "./DockTargets.js"
import { getResizeRatioFromPoint } from "./__internal/DockGeometryMath.js"

export interface InstallDockInteractionPolicyOptions {
  readonly dock: DockService
  readonly runtime: DockRuntime
  readonly policy?: DockPolicy | undefined
}

export const installDockClickPolicy =
  ({ dock }: InstallDockInteractionPolicyOptions): Installer<InteractionEnv> =>
  (interaction) => {
    const unsubscribe = interaction.env.signals.click.subscribe((signal) => {
      const tab = DockTabTarget.match(signal.target)
      if (tab) {
        dock.selectPanel(tab.panelId)
        return
      }

      const panel = DockPanelTarget.match(signal.target)
      if (panel) {
        dock.focusPanel(panel.panelId)
        return
      }

      const backdrop = DockOverlayBackdropTarget.match(signal.target)
      if (backdrop) {
        const topModal = backdrop.modalId
          ? dock.state.get().layout.modals.find((modal) => modal.id === backdrop.modalId)
          : getTopOpenModal(dock.state.get())
        if (!topModal?.closeOnOutsideClick) return
        const decision = dock.policy.canModalClickBehind?.({
          state: dock.state.get(),
          modalId: topModal.id,
        }) ?? { ok: true }
        if (decision.ok) dock.closeModal(topModal.id)
      }
    })

    return installedVoid(unsubscribe)
  }

export const installDockDragPolicy =
  ({ dock, runtime }: InstallDockInteractionPolicyOptions): Installer<InteractionEnv> =>
  (interaction) => {
    const cleanups = [
      interaction.env.signals.dragStart.subscribe((signal) => {
        const tab = DockTabTarget.match(signal.source)
        const panel = tab ?? DockPanelTarget.match(signal.source)
        if (!panel) return
        const decision = dock.policy.canDrag?.({
          state: dock.state.get(),
          panelId: panel.panelId,
        }) ?? { ok: true }
        if (!decision.ok) return
        runtime.beginDrag({
          panelId: panel.panelId,
          position: signal.position,
          rect: signal.source.getRect() ?? undefined,
        })
      }),
      interaction.env.signals.dragMove.subscribe((signal) => {
        const preview = runtime.env.state.get().dragPreview
        if (!preview?.panelId) return
        const dropzone = DockDropzoneTarget.match(signal.target)
        runtime.updateDragPreview({
          position: signal.position,
          placement: dropzone
            ? { targetGroupId: dropzone.groupId, side: dropzone.side }
            : undefined,
        })
      }),
      interaction.env.signals.dragEnd.subscribe((signal) => {
        const preview = runtime.env.state.get().dragPreview
        const dropzone = DockDropzoneTarget.match(signal.target)
        if (preview?.panelId && dropzone) {
          dock.commitDrop(preview.panelId, { targetGroupId: dropzone.groupId, side: dropzone.side })
        }
        runtime.clearDragPreview()
      }),
    ]

    return installedVoid(() => {
      for (const cleanup of cleanups) cleanup()
    })
  }

export const installDockResizePolicy =
  ({ dock, runtime }: InstallDockInteractionPolicyOptions): Installer<InteractionEnv> =>
  (interaction) => {
    const cleanups = [
      interaction.env.signals.dragStart.subscribe((signal) => {
        const handle = DockResizeHandleTarget.match(signal.source)
        if (!handle) return
        const state = dock.state.get()
        const decision = dock.policy.canResize?.({
          state,
          splitId: handle.splitId,
          ratio: 0.5,
        }) ?? { ok: true }
        if (!decision.ok) return
        runtime.beginResize({
          splitId: handle.splitId,
          ratio: 0.5,
          rect: signal.source.getRect() ?? undefined,
        })
      }),
      interaction.env.signals.dragMove.subscribe((signal) => {
        const preview = runtime.env.state.get().resizePreview
        if (!preview) return
        const handle = DockResizeHandleTarget.match(signal.source)
        const rect = signal.source.getRect()
        if (!handle || !rect) return
        runtime.updateResizePreview({
          ratio: getResizeRatioFromPoint(rect, handle.axis, signal.position),
          rect,
        })
      }),
      interaction.env.signals.dragEnd.subscribe(() => {
        const preview = runtime.env.state.get().resizePreview
        if (preview) dock.resizeSplit(preview.splitId, preview.ratio)
        runtime.clearResizePreview()
      }),
    ]

    return installedVoid(() => {
      for (const cleanup of cleanups) cleanup()
    })
  }

export const installDockModalPolicy =
  ({ dock }: InstallDockInteractionPolicyOptions): Installer<InteractionEnv> =>
  (interaction) => {
    const cleanups = [
      interaction.env.signals.keyPressed.subscribe((signal) => {
        if (signal.key !== "Escape") return
        const topModal = getTopOpenModal(dock.state.get())
        if (!topModal?.closeOnEscape) return
        dock.closeModal(topModal.id)
      }),
      interaction.env.signals.click.subscribe((signal) => {
        const modal = DockModalSurfaceTarget.match(signal.target)
        if (modal) return
        const backdrop = DockOverlayBackdropTarget.match(signal.target)
        if (!backdrop) return
        const topModal = backdrop.modalId
          ? dock.state.get().layout.modals.find((item) => item.id === backdrop.modalId)
          : getTopOpenModal(dock.state.get())
        if (!topModal?.closeOnOutsideClick) return
        const decision = dock.policy.canModalClickBehind?.({
          state: dock.state.get(),
          modalId: topModal.id,
        }) ?? { ok: true }
        if (decision.ok) dock.closeModal(topModal.id)
      }),
    ]

    return installedVoid(() => {
      for (const cleanup of cleanups) cleanup()
    })
  }

export const installDefaultDockInteraction =
  (options: InstallDockInteractionPolicyOptions): Installer<InteractionEnv> =>
  async (interaction) => {
    const leases = await interaction.installAll([
      installDockClickPolicy(options),
      installDockDragPolicy(options),
      installDockResizePolicy(options),
      installDockModalPolicy(options),
    ])

    return installedVoid(async () => {
      for (const lease of leases.toReversed()) await lease.dispose()
    })
  }
