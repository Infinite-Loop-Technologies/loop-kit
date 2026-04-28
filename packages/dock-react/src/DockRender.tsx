/**
 * React renderer for committed dock state.
 *
 * This component renders the current state through a registry and target hooks.
 * It is a useful debug/default renderer, not the final polished product UI.
 *
 * @module
 */

import type { ReactNode } from "react"

import type { DockLayoutNode } from "@loop-kit/dock"

import { useDockRegistry, useDockRuntimeState, useDockState } from "./DockHooks.js"
import { renderDockNode } from "./__internal/renderDockNode.js"

export interface DockRenderProps {
  readonly node?: DockLayoutNode | null | undefined
}

export const DockRender = ({ node }: DockRenderProps): ReactNode => {
  const state = useDockState()
  const runtimeState = useDockRuntimeState()
  const registry = useDockRegistry()
  const root = node === undefined ? state.layout.roots.main : node

  return (
    <>
      {renderDockNode({ node: root, state, runtimeState, registry })}
      {state.layout.modals
        .filter((modal) => modal.open)
        .map((modal) => (
          <div
            key={modal.id}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              display: "grid",
              placeItems: "center",
              background: "rgba(15, 23, 42, 0.35)",
            }}
          >
            <div
              style={{
                width: 420,
                maxWidth: "calc(100vw - 32px)",
                background: "white",
                border: "1px solid #d0d5dd",
              }}
            >
              <div style={{ padding: 10, borderBottom: "1px solid #e4e7ec", fontWeight: 600 }}>
                {modal.title}
              </div>
              {renderDockNode({ node: modal.root, state, runtimeState, registry })}
            </div>
          </div>
        ))}
    </>
  )
}
