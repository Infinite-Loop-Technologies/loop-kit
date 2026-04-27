/**
 * Role and capability vocabulary for interaction targets.
 *
 * Roles describe what a target can participate in. Capabilities keep room for
 * host packages to attach small behavioral flags without putting domain logic
 * into the interaction core.
 *
 * @module
 */

export const interactionRoles = [
  "pressable",
  "hoverable",
  "focusable",
  "selectable",
  "draggable",
  "dropzone",
  "resize-handle",
  "command-boundary",
  "text-input",
  "scroll-region",
] as const

export type InteractionRole = (typeof interactionRoles)[number]

export interface InteractionCapabilities {
  readonly pointer?: boolean | undefined
  readonly keyboard?: boolean | undefined
  readonly focus?: boolean | undefined
  readonly drag?: boolean | undefined
  readonly drop?: boolean | undefined
}

export const targetHasRole = (
  roles: ReadonlyArray<InteractionRole>,
  role: InteractionRole
): boolean => roles.includes(role)
