/**
 * Dock-specific interaction target kinds.
 */

import {
  String,
  defineTypedKind,
  union,
} from "@loop-kit/common";
import { DockPanelId, DockSplitId, DockTabGroupId, DockWindowId } from "./DockIds.js";

export const DockTabTarget = defineTypedKind("DockTab", {
  panelId: DockPanelId,
  groupId: DockTabGroupId,
});

export const DockDropzoneTarget = defineTypedKind("DockDropzone", {
  groupId: DockTabGroupId,
  side: union("left", "right", "top", "bottom", "center"),
});

export const DockPanelBodyTarget = defineTypedKind("DockPanelBody", {
  panelId: DockPanelId,
});

export const DockResizeHandleTarget = defineTypedKind("DockResizeHandle", {
  splitId: DockSplitId,
  axis: union("horizontal", "vertical"),
});

export const DockWindowTitlebarTarget = defineTypedKind("DockWindowTitlebar", {
  windowId: DockWindowId,
});

export const DockModalBoundaryTarget = defineTypedKind("DockModalBoundary", {
  modalId: String,
});
