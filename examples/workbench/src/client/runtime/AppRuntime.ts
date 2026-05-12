import type { Runtime } from "@loop-kit/common/Runtime"
import { createRuntime } from "@loop-kit/common/Runtime"
import { createDockRuntime, createDockService } from "@loop-kit/dock"
import { createInteractionRuntime } from "@loop-kit/interaction"

import { createDragDropLabService } from "../domain/dragDropLab"
import { createWorkbenchDockState } from "../domain/workbenchDockFixture"
import { createDragDropDemoDockState } from "../domain/workbenchDockPresets"
import { createDragDropLabRuntime } from "./DragDropLabRuntime"

export interface WorkbenchAppRuntimeEnv {
  readonly dock: ReturnType<typeof createDockService>
  readonly dockRuntime: ReturnType<typeof createDockRuntime>
  readonly dragDropDock: ReturnType<typeof createDockService>
  readonly dragDropDockRuntime: ReturnType<typeof createDockRuntime>
  readonly dragDropLab: ReturnType<typeof createDragDropLabService>
  readonly dragDropLabRuntime: ReturnType<typeof createDragDropLabRuntime>
  readonly interaction: ReturnType<typeof createInteractionRuntime>
}

export interface AppRuntime extends Runtime<WorkbenchAppRuntimeEnv> {}

export const createAppRuntime = (): AppRuntime => {
  const dock = createDockService({ initialState: createWorkbenchDockState() })
  const dockRuntime = createDockRuntime({ dock })
  const dragDropDock = createDockService({ initialState: createDragDropDemoDockState() })
  const dragDropDockRuntime = createDockRuntime({ dock: dragDropDock })
  const dragDropLab = createDragDropLabService()
  const dragDropLabRuntime = createDragDropLabRuntime(dragDropLab)
  const interaction = createInteractionRuntime()

  return createRuntime({
    dock,
    dockRuntime,
    dragDropDock,
    dragDropDockRuntime,
    dragDropLab,
    dragDropLabRuntime,
    interaction,
  })
}
