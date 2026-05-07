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
  readonly renderModals?: boolean | undefined
}

export const DockRender = ({
  node,
  renderModals = node === undefined,
}: DockRenderProps): ReactNode => {
  const state = useDockState()
  const runtimeState = useDockRuntimeState()
  const registry = useDockRegistry()
  const root = node === undefined ? state.layout.roots.main : node

  return (
    <>
      {renderDockNode({ node: root, state, runtimeState, registry })}
      {renderModals
        ? state.layout.modals
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
                  [backgroundKey]: token("background", "Canvas"),
                  opacity: 0.96,
                }}
              >
                <div
                  style={{
                    width: 420,
                    maxWidth: "calc(100vw - 32px)",
                    [backgroundKey]: token("card", "Canvas"),
                    [colorKey]: token("card-foreground", "CanvasText"),
                    [borderKey]: `1px solid ${token("border", "ButtonBorder")}`,
                  }}
                >
                  <div
                    style={{
                      padding: 10,
                      [borderBottomKey]: `1px solid ${token("border", "ButtonBorder")}`,
                      fontWeight: 600,
                    }}
                  >
                    {modal.title}
                  </div>
                  {renderDockNode({
                    node: modal.root,
                    state,
                    runtimeState,
                    registry,
                  })}
                </div>
              </div>
            ))
        : null}
    </>
  )
}

const [backgroundKey, borderKey, borderBottomKey, colorKey] = [
  "background",
  "border",
  "borderBottom",
  "color",
] as const

const token = (name: string, fallback: string): string => `var(--${name}, ${fallback})`
