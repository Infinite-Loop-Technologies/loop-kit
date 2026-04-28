/**
 * Internal layout tree traversal utilities.
 *
 * This module is a small home for generic traversal that should not become a
 * public API until there is a concrete external use.
 *
 * @module
 */

import type { DockLayoutNode } from "../DockNode.js"

export const visitDockLayoutNode = (
  node: DockLayoutNode | null,
  visitor: (node: DockLayoutNode) => void
): void => {
  if (!node) return
  visitor(node)
  if (node.type === "split") {
    visitDockLayoutNode(node.leading, visitor)
    visitDockLayoutNode(node.trailing, visitor)
  }
}

export const mapDockLayoutNode = (
  node: DockLayoutNode,
  mapper: (node: DockLayoutNode) => DockLayoutNode
): DockLayoutNode => {
  const mapped =
    node.type === "split"
      ? {
          ...node,
          leading: mapDockLayoutNode(node.leading, mapper),
          trailing: mapDockLayoutNode(node.trailing, mapper),
        }
      : node
  return mapper(mapped)
}
