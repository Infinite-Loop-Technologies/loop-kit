/**
 * Internal target ancestry index.
 *
 * The runtime keeps an explicit semantic tree so policies do not depend on the
 * React component hierarchy as the source of truth.
 */

import { createRelation } from "@loop-kit/common";
import type { InteractionTargetId } from "../Target.js";

export interface TreeIndex {
  readonly setParent: (
    targetId: InteractionTargetId,
    parentId?: InteractionTargetId | undefined,
  ) => void;
  readonly removeTarget: (targetId: InteractionTargetId) => void;
  readonly getChildren: (targetId: InteractionTargetId) => ReadonlyArray<InteractionTargetId>;
  readonly getAncestors: (targetId: InteractionTargetId) => ReadonlyArray<InteractionTargetId>;
}

export const createTreeIndex = (): TreeIndex => {
  const relation = createRelation<InteractionTargetId, InteractionTargetId>();

  return {
    setParent: (targetId, parentId) => {
      relation.removeByA(targetId);
      if (parentId) relation.add(targetId, parentId);
    },
    removeTarget: (targetId) => {
      relation.removeByA(targetId);
      relation.removeByB(targetId);
    },
    getChildren: (targetId) => Array.from(relation.iterateA(targetId)),
    getAncestors: (targetId) => {
      const ancestors: InteractionTargetId[] = [];
      let current = Array.from(relation.iterateB(targetId))[0];
      while (current) {
        ancestors.push(current);
        current = Array.from(relation.iterateB(current))[0];
      }
      return ancestors;
    },
  };
};
