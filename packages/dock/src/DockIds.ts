/**
 * Dock domain identifiers.
 *
 * These ids are branded strings so service APIs stay explicit without forcing
 * the dock package to depend on a heavier persistence id policy.
 */

import { String, brand } from "@loop-kit/common";

export const DockPanelId = brand("DockPanelId", String);
export type DockPanelId = typeof DockPanelId.Type;

export const DockTabGroupId = brand("DockTabGroupId", String);
export type DockTabGroupId = typeof DockTabGroupId.Type;

export const DockSplitId = brand("DockSplitId", String);
export type DockSplitId = typeof DockSplitId.Type;

export const DockWindowId = brand("DockWindowId", String);
export type DockWindowId = typeof DockWindowId.Type;

export const DockModalId = brand("DockModalId", String);
export type DockModalId = typeof DockModalId.Type;

let dockIdCounter = 0;

const createDockEntityId = <T extends string>(prefix: T): string =>
  `${prefix}-${++dockIdCounter}`;

export const createDockPanelId = (value = createDockEntityId("panel")): DockPanelId =>
  DockPanelId.orThrow(value);

export const createDockTabGroupId = (
  value = createDockEntityId("group"),
): DockTabGroupId => DockTabGroupId.orThrow(value);

export const createDockSplitId = (value = createDockEntityId("split")): DockSplitId =>
  DockSplitId.orThrow(value);

export const createDockWindowId = (
  value = createDockEntityId("window"),
): DockWindowId => DockWindowId.orThrow(value);

export const createDockModalId = (value = createDockEntityId("modal")): DockModalId =>
  DockModalId.orThrow(value);
