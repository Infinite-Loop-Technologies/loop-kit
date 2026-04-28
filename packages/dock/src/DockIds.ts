/**
 * Branded dock identifiers.
 *
 * This file gives every persisted dock entity a nominal id while keeping the
 * runtime representation simple strings. It does not own lookup tables or
 * lifecycle; services and runtimes own those concerns.
 *
 * @module
 */

import type { Brand } from "@loop-kit/common/Brand"
import { String as StringType, brand } from "@loop-kit/common/Type"

export const DockPanelId = brand("DockPanelId", StringType)
export type DockPanelId = typeof DockPanelId.Type

export const DockGroupId = brand("DockGroupId", StringType)
export type DockGroupId = typeof DockGroupId.Type

export const DockSplitId = brand("DockSplitId", StringType)
export type DockSplitId = typeof DockSplitId.Type

export const DockWindowId = brand("DockWindowId", StringType)
export type DockWindowId = typeof DockWindowId.Type

export const DockModalId = brand("DockModalId", StringType)
export type DockModalId = typeof DockModalId.Type

export const DockLayerId = brand("DockLayerId", StringType)
export type DockLayerId = typeof DockLayerId.Type

export const DockSurfaceId = brand("DockSurfaceId", StringType)
export type DockSurfaceId = typeof DockSurfaceId.Type

export const DockNodeId = brand("DockNodeId", StringType)
export type DockNodeId = typeof DockNodeId.Type

export type DockEntityId =
  | DockPanelId
  | DockGroupId
  | DockSplitId
  | DockWindowId
  | DockModalId
  | DockLayerId
  | DockSurfaceId
  | DockNodeId

export const createDockEntityId = <TBrand extends string>(prefix: string): string & Brand<TBrand> =>
  `${prefix}:${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}:${Math.random()}`}` as string &
    Brand<TBrand>

export const createDockPanelId = (): DockPanelId => createDockEntityId("panel")
export const createDockGroupId = (): DockGroupId => createDockEntityId("group")
export const createDockSplitId = (): DockSplitId => createDockEntityId("split")
export const createDockWindowId = (): DockWindowId => createDockEntityId("window")
export const createDockModalId = (): DockModalId => createDockEntityId("modal")
export const createDockLayerId = (): DockLayerId => createDockEntityId("layer")
export const createDockSurfaceId = (): DockSurfaceId => createDockEntityId("surface")
export const createDockNodeId = (): DockNodeId => createDockEntityId("node")
