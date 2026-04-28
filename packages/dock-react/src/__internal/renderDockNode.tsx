/**
 * Internal recursive dock node renderer.
 *
 * This is intentionally modest default rendering. Production UIs should provide
 * registry components and styling appropriate to their app.
 *
 * @module
 */

import type { ReactNode } from "react"

import type {
  DockGroupId,
  DockLayoutNode,
  DockPanelId,
  DockRuntimeState,
  DockState,
} from "@loop-kit/dock"

import type { DockRegistry } from "../DockRegistry.js"
import {
  useDockDropzoneTarget,
  useDockResizeHandleTarget,
  useDockTabTarget,
} from "../DockTargetHooks.js"

export interface RenderDockNodeOptions {
  readonly node: DockLayoutNode | null
  readonly state: DockState
  readonly runtimeState: DockRuntimeState
  readonly registry: DockRegistry
}

export const renderDockNode = (options: RenderDockNodeOptions): ReactNode => {
  if (!options.node) return <div style={{ padding: 16, color: "#667085" }}>Empty dock</div>
  return <DockNodeView {...options} node={options.node} />
}

const DockNodeView = ({
  node,
  state,
  runtimeState,
  registry,
}: RenderDockNodeOptions & { readonly node: DockLayoutNode }): ReactNode => {
  if (node.type === "split") {
    const handleRef = useDockResizeHandleTarget<HTMLDivElement>(node.id, node.axis)
    const gridTemplate =
      node.axis === "horizontal"
        ? `${node.ratio}fr 6px ${1 - node.ratio}fr`
        : `${node.ratio}fr 6px ${1 - node.ratio}fr`

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: node.axis === "horizontal" ? gridTemplate : "1fr",
          gridTemplateRows: node.axis === "vertical" ? gridTemplate : "1fr",
          minHeight: 0,
          height: "100%",
        }}
      >
        <DockNodeView
          node={node.leading}
          state={state}
          runtimeState={runtimeState}
          registry={registry}
        />
        <div
          ref={handleRef}
          style={{
            background: "#e4e7ec",
            cursor: node.axis === "horizontal" ? "col-resize" : "row-resize",
          }}
        />
        <DockNodeView
          node={node.trailing}
          state={state}
          runtimeState={runtimeState}
          registry={registry}
        />
      </div>
    )
  }

  const activePanelId = node.activePanelId ?? node.panelIds[0]
  const activePanel = state.panels.find((panel) => panel.id === activePanelId)
  const dropCenterRef = useDockDropzoneTarget<HTMLDivElement>(node.id, "center")

  return (
    <section
      ref={dropCenterRef}
      style={{
        minWidth: 0,
        minHeight: 0,
        height: "100%",
        display: "grid",
        gridTemplateRows: "36px 1fr",
        background: "white",
        border: "1px solid #e4e7ec",
      }}
    >
      <div style={{ display: "flex", alignItems: "stretch", borderBottom: "1px solid #e4e7ec" }}>
        {node.panelIds.map((panelId) => {
          const panel = state.panels.find((item) => item.id === panelId)
          if (!panel) return null
          return (
            <DockTab
              key={panelId}
              panelId={panelId}
              groupId={node.id}
              title={panel.title}
              active={panelId === activePanelId}
            />
          )
        })}
      </div>
      <div style={{ minHeight: 0, overflow: "auto" }}>
        {activePanel ? (
          registry.renderPanel({ panel: activePanel, state, runtimeState })
        ) : (
          <div style={{ padding: 12, color: "#667085" }}>No active panel</div>
        )}
      </div>
    </section>
  )
}

const DockTab = ({
  panelId,
  groupId,
  title,
  active,
}: {
  readonly panelId: DockPanelId
  readonly groupId: DockGroupId
  readonly title: string
  readonly active: boolean
}): ReactNode => {
  const ref = useDockTabTarget<HTMLButtonElement>(panelId, groupId)
  return (
    <button
      ref={ref}
      type="button"
      style={{
        border: 0,
        borderRight: "1px solid #e4e7ec",
        background: active ? "#f2f4f7" : "white",
        padding: "0 10px",
        font: "inherit",
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {title}
    </button>
  )
}
