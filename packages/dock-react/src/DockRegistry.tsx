/**
 * React render registry for dock panels and surfaces.
 *
 * The registry maps dock panel/surface kinds to components. It does not own
 * domain state; components receive explicit props and may opt into bridge hooks.
 *
 * @module
 */

import type { ComponentType, ReactNode } from "react"

import type {
  DockPanel,
  DockPanelRenderInput,
  DockSurface,
  DockSurfaceRenderInput,
} from "@loop-kit/dock"

export interface DockPanelComponentProps extends DockPanelRenderInput {
  readonly panel: DockPanel
}

export interface DockSurfaceComponentProps extends DockSurfaceRenderInput {
  readonly surface: DockSurface
}

export interface DockRegistry {
  readonly renderPanel: (props: DockPanelComponentProps) => ReactNode
  readonly renderSurface: (props: DockSurfaceComponentProps) => ReactNode
}

export interface CreateDockRegistryOptions {
  readonly panels?: Readonly<Record<string, ComponentType<DockPanelComponentProps>>> | undefined
  readonly surfaces?: Readonly<Record<string, ComponentType<DockSurfaceComponentProps>>> | undefined
  readonly fallbackPanel?: ComponentType<DockPanelComponentProps> | undefined
  readonly fallbackSurface?: ComponentType<DockSurfaceComponentProps> | undefined
}

export const createDockRegistry = ({
  panels = {},
  surfaces = {},
  fallbackPanel = DefaultPanel,
  fallbackSurface = DefaultSurface,
}: CreateDockRegistryOptions = {}): DockRegistry => ({
  renderPanel: (props) => {
    const Component = panels[props.panel.kind] ?? fallbackPanel
    return <Component {...props} />
  },
  renderSurface: (props) => {
    const Component = surfaces[props.surface.kind] ?? fallbackSurface
    return <Component {...props} />
  },
})

const DefaultPanel = ({ panel }: DockPanelComponentProps): ReactNode => (
  <div style={{ padding: 12 }}>
    <strong>{panel.title}</strong>
    <div style={{ color: "#667085", fontSize: 12 }}>{panel.kind}</div>
  </div>
)

const DefaultSurface = ({ surface }: DockSurfaceComponentProps): ReactNode => (
  <div style={{ padding: 12 }}>
    <strong>{surface.title ?? surface.kind}</strong>
  </div>
)
