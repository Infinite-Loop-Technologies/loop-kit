/**
 * Runtime schemas for dock structures.
 */

import {
  FiniteNumber,
  String,
  array,
  brand,
  defineTypedKind,
  object,
  union,
} from "@loop-kit/common";
import {
  DockModalId,
  DockPanelId,
  DockSplitId,
  DockTabGroupId,
  DockWindowId,
} from "./DockIds.js";

export const DockPanelSchema = object({
  id: DockPanelId,
  title: String,
  kind: String,
});

export const DockTabGroupSchema = defineTypedKind("DockTabGroup", {
  id: DockTabGroupId,
  panelIds: array(DockPanelId),
  activePanelId: DockPanelId,
});

export const DockWindowFrameSchema = object({
  x: FiniteNumber,
  y: FiniteNumber,
  width: FiniteNumber,
  height: FiniteNumber,
});

export const DockLayoutNodeSchema = union(
  DockTabGroupSchema,
  defineTypedKind("DockSplit", {
    id: DockSplitId,
    axis: union("horizontal", "vertical"),
    ratio: FiniteNumber,
    leading: brand("DockLayoutPlaceholder", String),
    trailing: brand("DockLayoutPlaceholder", String),
  }),
);

export const DockWindowSchema = object({
  id: DockWindowId,
  title: String,
  frame: DockWindowFrameSchema,
});

export const DockModalSchema = object({
  id: DockModalId,
  title: String,
  open: union(true, false),
});
