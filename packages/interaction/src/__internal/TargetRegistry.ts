/**
 * In-memory target registry for InteractionRuntime.
 *
 * The registry keeps committed runtime registrations by target id and a weak
 * DOM element index for bridge lookup. It does not infer hierarchy from DOM or
 * React; parent-child relationships are explicit via `parentId`.
 *
 * @module
 */

import { type LookupMap, createLookupMap } from "@loop-kit/common/Lookup"

import { type InteractionRole, targetHasRole } from "../InteractionRoles.js"
import type {
  InteractionTarget,
  InteractionTargetId,
  InteractionTargetRegistration,
  InteractionTargetRegistry,
} from "../InteractionTarget.js"
import { getElementFromEventTarget, getParentElement } from "./DomTargetResolution.js"

export const createTargetRegistry = (): InteractionTargetRegistry => {
  const targetsById = createLookupMap<InteractionTargetId, InteractionTarget, string>({
    lookup: (id) => id,
  })
  const targetIdsByElement = new WeakMap<Element, Set<InteractionTargetId>>()

  const indexTargetElement = (target: InteractionTarget): void => {
    const element = target.getElement()
    if (!element) return

    let ids = targetIdsByElement.get(element)
    if (!ids) {
      ids = new Set()
      targetIdsByElement.set(element, ids)
    }
    ids.add(target.id)
  }

  const removeTargetElementIndex = (target: InteractionTarget): void => {
    const element = target.getElement()
    if (!element) return

    const ids = targetIdsByElement.get(element)
    if (!ids) return
    ids.delete(target.id)
    if (ids.size === 0) targetIdsByElement.delete(element)
  }

  const getTarget = (targetId: InteractionTargetId): InteractionTarget | undefined =>
    targetsById.get(targetId)

  const registry: InteractionTargetRegistry = {
    register: (registration) => {
      const previous = targetsById.get(registration.id)
      if (previous) removeTargetElementIndex(previous)

      const capturedElement = registration.element ?? null
      const getElement = registration.getElement ?? (() => capturedElement)
      const getRect = registration.getRect ?? (() => null)

      const target: InteractionTarget = {
        id: registration.id,
        parentId: registration.parentId,
        roles: [...registration.roles],
        capabilities: registration.capabilities ?? {},
        data: registration.data,
        getElement,
        getRect,
        priority: registration.priority ?? 0,
      }

      targetsById.set(target.id, target)
      indexTargetElement(target)
      return target
    },

    unregister: (targetId) => {
      const target = targetsById.get(targetId)
      if (!target) return
      removeTargetElementIndex(target)
      targetsById.delete(targetId)
    },

    get: getTarget,

    getAncestry: (targetId) => {
      const ancestry: Array<InteractionTarget> = []
      const seen = new Set<InteractionTargetId>()
      let current = getTarget(targetId)

      while (current && !seen.has(current.id)) {
        ancestry.push(current)
        seen.add(current.id)
        current = current.parentId ? getTarget(current.parentId) : undefined
      }

      return ancestry
    },

    resolveFromDomNode: (node) => {
      let element = getElementFromEventTarget(node)

      while (element) {
        const ids = targetIdsByElement.get(element)
        const target = ids ? getHighestPriorityTarget(ids, targetsById) : null
        if (target) return target
        element = getParentElement(element)
      }

      return undefined
    },

    closestWithRole: (targetId, role) => {
      for (const target of registry.getAncestry(targetId)) {
        if (targetHasRole(target.roles, role)) return target
      }
      return undefined
    },

    hasRole: (targetId, role) => {
      const target = getTarget(targetId)
      return target ? targetHasRole(target.roles, role) : false
    },

    clear: () => {
      targetsById.clear()
    },
  }

  return registry
}

const getHighestPriorityTarget = (
  ids: ReadonlySet<InteractionTargetId>,
  targetsById: LookupMap<InteractionTargetId, InteractionTarget>
): InteractionTarget | null => {
  let selected: InteractionTarget | null = null

  for (const id of ids) {
    const target = targetsById.get(id)
    if (!target) continue
    if (!selected || target.priority > selected.priority) selected = target
  }

  return selected
}
