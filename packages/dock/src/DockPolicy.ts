/**
 * Dock policy model.
 *
 * Policies answer "may this happen?" questions for committed service commands
 * and interaction interpretation. They are plain composable functions rather
 * than a closed policy language.
 *
 * @module
 */

import type { DockRect } from "./DockGeometry.js"
import type {
  DockGroupId,
  DockModalId,
  DockPanelId,
  DockSplitId,
  DockSurfaceId,
} from "./DockIds.js"
import type { DockPlacement, DockStackMode } from "./DockNode.js"
import type { DockState } from "./DockState.js"

export interface DockPolicyDecision {
  readonly ok: boolean
  readonly reason?: string | undefined
}

export interface DockPolicyContext {
  readonly state: DockState
}

export interface DockFocusPolicyInput extends DockPolicyContext {
  readonly panelId?: DockPanelId | undefined
  readonly surfaceId?: DockSurfaceId | undefined
}

export interface DockClosePolicyInput extends DockPolicyContext {
  readonly panelId?: DockPanelId | undefined
  readonly modalId?: DockModalId | undefined
  readonly surfaceId?: DockSurfaceId | undefined
}

export interface DockDragPolicyInput extends DockPolicyContext {
  readonly panelId?: DockPanelId | undefined
  readonly surfaceId?: DockSurfaceId | undefined
}

export interface DockDropPolicyInput extends DockPolicyContext {
  readonly panelId: DockPanelId
  readonly placement: DockPlacement
}

export interface DockSplitPolicyInput extends DockPolicyContext {
  readonly groupId: DockGroupId
  readonly placement: DockPlacement
}

export interface DockResizePolicyInput extends DockPolicyContext {
  readonly splitId: DockSplitId
  readonly ratio: number
}

export interface DockModalPolicyInput extends DockPolicyContext {
  readonly modalId: DockModalId
}

export interface DockResizeConstraints {
  readonly minRatio: number
  readonly maxRatio: number
}

export interface DockPolicy {
  readonly canFocus?: (input: DockFocusPolicyInput) => DockPolicyDecision
  readonly canClose?: (input: DockClosePolicyInput) => DockPolicyDecision
  readonly canDrag?: (input: DockDragPolicyInput) => DockPolicyDecision
  readonly canDrop?: (input: DockDropPolicyInput) => DockPolicyDecision
  readonly canSplit?: (input: DockSplitPolicyInput) => DockPolicyDecision
  readonly canResize?: (input: DockResizePolicyInput) => DockPolicyDecision
  readonly canModalClickBehind?: (input: DockModalPolicyInput) => DockPolicyDecision
  readonly getAllowedPlacements?: (input: DockSplitPolicyInput) => ReadonlyArray<DockPlacement>
  readonly getStackMode?: (
    input: DockPolicyContext & { readonly groupId: DockGroupId }
  ) => DockStackMode
  readonly getResizeConstraints?: (
    input: DockPolicyContext & { readonly splitId: DockSplitId }
  ) => DockResizeConstraints
  readonly getConstrainedRect?: (
    input: DockPolicyContext & { readonly surfaceId: DockSurfaceId }
  ) => DockRect | null
}

export const dockPolicyAllow: DockPolicyDecision = { ok: true }

export const dockPolicyReject = (reason: string): DockPolicyDecision => ({
  ok: false,
  reason,
})

export const createDefaultDockPolicy = (): DockPolicy => ({
  canFocus: () => dockPolicyAllow,
  canClose: ({ state, panelId, modalId }) => {
    if (panelId) {
      const panel = state.panels.find((item) => item.id === panelId)
      return panel?.closable === false
        ? dockPolicyReject("Panel cannot be closed.")
        : dockPolicyAllow
    }
    if (modalId) {
      const modal = state.layout.modals.find((item) => item.id === modalId)
      return modal?.open === false ? dockPolicyReject("Modal is not open.") : dockPolicyAllow
    }
    return dockPolicyAllow
  },
  canDrag: () => dockPolicyAllow,
  canDrop: () => dockPolicyAllow,
  canSplit: () => dockPolicyAllow,
  canResize: () => dockPolicyAllow,
  canModalClickBehind: () => dockPolicyAllow,
  getStackMode: () => "tabs",
  getResizeConstraints: () => ({ minRatio: 0.1, maxRatio: 0.9 }),
})

export const composeDockPolicies = (
  ...policies: ReadonlyArray<DockPolicy | undefined>
): DockPolicy => {
  const activePolicies = policies.filter((policy): policy is DockPolicy => Boolean(policy))

  return {
    canFocus: (input) => firstRejected(activePolicies.map((policy) => policy.canFocus?.(input))),
    canClose: (input) => firstRejected(activePolicies.map((policy) => policy.canClose?.(input))),
    canDrag: (input) => firstRejected(activePolicies.map((policy) => policy.canDrag?.(input))),
    canDrop: (input) => firstRejected(activePolicies.map((policy) => policy.canDrop?.(input))),
    canSplit: (input) => firstRejected(activePolicies.map((policy) => policy.canSplit?.(input))),
    canResize: (input) => firstRejected(activePolicies.map((policy) => policy.canResize?.(input))),
    canModalClickBehind: (input) =>
      firstRejected(activePolicies.map((policy) => policy.canModalClickBehind?.(input))),
    getAllowedPlacements: (input) => {
      for (const policy of activePolicies.toReversed()) {
        const placements = policy.getAllowedPlacements?.(input)
        if (placements) return placements
      }
      return [input.placement]
    },
    getStackMode: (input) => {
      for (const policy of activePolicies.toReversed()) {
        const stackMode = policy.getStackMode?.(input)
        if (stackMode) return stackMode
      }
      return "tabs"
    },
    getResizeConstraints: (input) => {
      for (const policy of activePolicies.toReversed()) {
        const constraints = policy.getResizeConstraints?.(input)
        if (constraints) return constraints
      }
      return { minRatio: 0.1, maxRatio: 0.9 }
    },
    getConstrainedRect: (input) => {
      for (const policy of activePolicies.toReversed()) {
        const rect = policy.getConstrainedRect?.(input)
        if (rect) return rect
      }
      return null
    },
  }
}

const firstRejected = (
  decisions: ReadonlyArray<DockPolicyDecision | undefined>
): DockPolicyDecision => decisions.find((decision) => decision && !decision.ok) ?? dockPolicyAllow
