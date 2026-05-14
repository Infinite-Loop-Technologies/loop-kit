/**
 * Public target contracts for the interaction runtime.
 *
 * Targets are explicit runtime registrations, not React tree nodes. Domain
 * packages register semantic boundaries with ids, roles, optional parent ids,
 * and optional DOM handles for bridge resolution.
 *
 * @module
 */

import type { Brand } from "@loop-kit/common/Brand";

import type { InteractionRect } from "./InteractionGeometry.js";
import type {
  InteractionCapabilities,
  InteractionRole,
} from "./InteractionRoles.js";

export type InteractionTargetId = string & Brand<"InteractionTargetId">;

export interface InteractionTargetRegistration {
  readonly id: InteractionTargetId;
  readonly parentId?: InteractionTargetId | undefined;
  readonly roles: ReadonlyArray<InteractionRole>;
  readonly capabilities?: InteractionCapabilities | undefined;
  readonly data?: unknown;
  readonly element?: Element | null | undefined;
  readonly getElement?: (() => Element | null) | undefined;
  readonly getRect?: (() => InteractionRect | null) | undefined;
  readonly priority?: number | undefined;
}

export interface InteractionTarget {
  readonly id: InteractionTargetId;
  readonly parentId?: InteractionTargetId | undefined;
  readonly roles: ReadonlyArray<InteractionRole>;
  readonly capabilities: InteractionCapabilities;
  readonly data: unknown;
  readonly getElement: () => Element | null;
  readonly getRect: () => InteractionRect | null;
  readonly priority: number;
}

export interface InteractionTargetRegistry {
  readonly register: (
    registration: InteractionTargetRegistration,
  ) => InteractionTarget;
  readonly unregister: (targetId: InteractionTargetId) => void;
  readonly get: (
    targetId: InteractionTargetId,
  ) => InteractionTarget | undefined;
  readonly getAncestry: (
    targetId: InteractionTargetId,
  ) => ReadonlyArray<InteractionTarget>;
  readonly resolveFromDomNode: (
    node: EventTarget | null,
  ) => InteractionTarget | undefined;
  readonly closestWithRole: (
    targetId: InteractionTargetId,
    role: InteractionRole,
  ) => InteractionTarget | undefined;
  readonly hasRole: (
    targetId: InteractionTargetId,
    role: InteractionRole,
  ) => boolean;
  readonly clear: () => void;
}
