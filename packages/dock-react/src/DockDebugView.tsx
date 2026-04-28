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
        border: "1px solid #d0d5dd",
        fontFamily: "system-ui, sans-serif",
        color: "#101828",
        background: "#f9fafb",
      }}
    />
  </DockProvider>
)
