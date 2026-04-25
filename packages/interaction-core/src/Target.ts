/**
 * Target registration contracts.
 *
 * A target is the semantic interaction node tracked by the runtime. Targets do
 * not have to match the React tree or the DOM tree one-to-one.
 */

import { String, brand } from "@loop-kit/common";
import type { Rect } from "./Geometry.js";
import type { InteractionRole } from "./Roles.js";

export const InteractionTargetId = brand("InteractionTargetId", String);
export type InteractionTargetId = typeof InteractionTargetId.Type;

export const createInteractionTargetId = (value: string): InteractionTargetId =>
  InteractionTargetId.orThrow(value);

export interface InteractionTarget<TData = unknown> {
  readonly id: InteractionTargetId;
  readonly kind: string;
  readonly parentId?: InteractionTargetId | undefined;
  readonly roles: ReadonlyArray<InteractionRole>;
  readonly capabilities?: Readonly<Record<string, unknown>> | undefined;
  readonly data?: TData | undefined;
  readonly getRect?: (() => Rect | null) | undefined;
  readonly getElement?: (() => unknown) | undefined;
}
