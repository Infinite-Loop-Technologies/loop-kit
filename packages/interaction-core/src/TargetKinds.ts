/**
 * Interaction-core target kinds.
 *
 * The core package only needs a small generic kind vocabulary. Domain packages
 * are expected to define richer typed kinds for their own targets.
 */

import { String, brand, defineKind } from "@loop-kit/common";

export const InteractionTargetKind = brand("InteractionTargetKind", String);
export type InteractionTargetKind = typeof InteractionTargetKind.Type;

export const GenericTargetKind = defineKind("GenericTarget");
