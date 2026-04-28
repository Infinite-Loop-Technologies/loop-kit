/**
 * Headless renderer contracts.
 *
 * These types describe renderer inputs without picking React, DOM, terminal UI,
 * or another host. `@loop-kit/dock-react` adapts them to React components.
 *
 * @module
 */

import type { DockPanel, DockSurface } from "./DockNode.js"
import type { DockRuntimeState } from "./DockRuntime.js"
import type { DockState } from "./DockState.js"

export interface DockRenderModel {
  readonly state: DockState
  readonly runtimeState: DockRuntimeState
}

export interface DockPanelRenderInput {
  readonly panel: DockPanel
  readonly state: DockState
  readonly runtimeState: DockRuntimeState
}

export interface DockSurfaceRenderInput {
  readonly surface: DockSurface
  readonly state: DockState
  readonly runtimeState: DockRuntimeState
}
