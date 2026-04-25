/**
 * Small shared interaction vocabulary.
 *
 * These roles are intentionally global. Domain packages can add their own
 * target kinds and capabilities on top without redefining basic interaction
 * semantics.
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
] as const;

export type InteractionRole = (typeof interactionRoles)[number];
