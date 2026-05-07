import type { Runtime } from "@loop-kit/common/Runtime"
import { createRuntime } from "@loop-kit/common/Runtime"
import { createDockRuntime, createDockService } from "@loop-kit/dock"
import { createInteractionRuntime } from "@loop-kit/interaction"

import { createDragDropLabService } from "../domain/dragDropLab"
import { createWorkbenchDockState } from "../domain/workbenchDockFixture"
import { createDragDropLabRuntime } from "./DragDropLabRuntime"

export interface WorkbenchAppRuntimeEnv {
  readonly dock: ReturnType<typeof createDockService>
  readonly dockRuntime: ReturnType<typeof createDockRuntime>
  readonly dragDropLab: ReturnType<typeof createDragDropLabService>
  readonly dragDropLabRuntime: ReturnType<typeof createDragDropLabRuntime>
  readonly interaction: ReturnType<typeof createInteractionRuntime>
}

export interface AppRuntime extends Runtime<WorkbenchAppRuntimeEnv> {}

export const createAppRuntime = (): AppRuntime => {
  const dock = createDockService({ initialState: createWorkbenchDockState() })
  const dockRuntime = createDockRuntime({ dock })
  const dragDropLab = createDragDropLabService()
  const dragDropLabRuntime = createDragDropLabRuntime(dragDropLab)
  const interaction = createInteractionRuntime()

  return createRuntime({
    dock,
    dockRuntime,
    dragDropLab,
    dragDropLabRuntime,
    interaction,
  })
}
