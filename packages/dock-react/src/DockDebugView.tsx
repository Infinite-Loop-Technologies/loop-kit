/**
 * Minimal debug dock view.
 *
 * This proves state-to-render, target registration, modals, drop previews, and
 * resize previews without trying to be the final UI pass.
 *
 * @module
 */

import type { ReactNode } from "react"

import { DockProvider } from "./DockProvider.js"
import { DockRoot } from "./DockRoot.js"

export const DockDebugView = (): ReactNode => (
  <DockProvider debugInitialState>
    <DockRoot
      style={{
        minHeight: 520,
        [borderKey]: "1px solid var(--border, ButtonBorder)",
        fontFamily: "system-ui, sans-serif",
        [colorKey]: "var(--foreground, CanvasText)",
        [backgroundKey]: "var(--background, Canvas)",
      }}
    />
  </DockProvider>
)

const [backgroundKey, borderKey, colorKey] = ["background", "border", "color"] as const
