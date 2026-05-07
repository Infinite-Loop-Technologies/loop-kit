import { useSyncExternalStore } from "react"

import { useAppRuntime } from "./AppRuntimeBridge"

export const useDragDropLabState = () => {
  const { dragDropLab } = useAppRuntime().env
  return useSyncExternalStore(
    dragDropLab.state.subscribe,
    dragDropLab.state.get,
    dragDropLab.state.get
  )
}

export const useDragDropLabRuntimeState = () => {
  const { dragDropLabRuntime } = useAppRuntime().env
  return useSyncExternalStore(
    dragDropLabRuntime.env.state.subscribe,
    dragDropLabRuntime.env.state.get,
    dragDropLabRuntime.env.state.get
  )
}

export const useDragDropLabCommands = () => {
  const { dragDropLab, dragDropLabRuntime } = useAppRuntime().env

  return {
    reset: () => {
      dragDropLab.reset()
      dragDropLabRuntime.clearDragPreview()
      dragDropLabRuntime.pushEvent("reset list")
    },
  }
}
