import { createStore } from "@loop-kit/common/Store"

export type DragDropLabItemId = string & { readonly __brand: "DragDropLabItemId" }

export interface DragDropLabItem {
  readonly id: DragDropLabItemId
  readonly title: string
  readonly description: string
}

export interface DragDropLabState {
  readonly items: ReadonlyArray<DragDropLabItem>
  readonly selectedItemId?: DragDropLabItemId | undefined
}

export interface DragDropLabService {
  readonly state: ReturnType<typeof createStore<DragDropLabState>>
  readonly reorderItem: (sourceId: DragDropLabItemId, targetId?: DragDropLabItemId) => boolean
  readonly selectItem: (itemId: DragDropLabItemId) => void
  readonly reset: () => void
}

const item = (id: string, title: string, description: string): DragDropLabItem => ({
  id: id as DragDropLabItemId,
  title,
  description,
})

export const createInitialDragDropLabState = (): DragDropLabState => ({
  items: [
    item("inbox", "Inbox", "Registered source and drop target"),
    item("plan", "Plan", "Explicit parentId under the list boundary"),
    item("build", "Build", "Drag policy listens through InteractionRuntime"),
    item("verify", "Verify", "Service commits the order"),
    item("handoff", "Handoff", "Runtime records transient events"),
  ],
  selectedItemId: "inbox" as DragDropLabItemId,
})

export const createDragDropLabService = (): DragDropLabService => {
  const state = createStore(createInitialDragDropLabState())

  return {
    state,

    reorderItem: (sourceId, targetId) => {
      if (sourceId === targetId) return false

      let changed = false
      state.update((current) => {
        const nextItems = current.items.filter((item) => item.id !== sourceId)
        const source = current.items.find((item) => item.id === sourceId)
        const targetIndex = targetId
          ? nextItems.findIndex((item) => item.id === targetId)
          : nextItems.length
        if (!source || targetIndex < 0) return current
        nextItems.splice(targetIndex, 0, source)
        if (nextItems.every((item, index) => item.id === current.items[index]?.id)) {
          return current
        }
        changed = true

        return {
          ...current,
          items: nextItems,
          selectedItemId: sourceId,
        }
      })

      return changed
    },

    selectItem: (itemId) => {
      state.update((current) => ({
        ...current,
        selectedItemId: itemId,
      }))
    },

    reset: () => {
      state.set(createInitialDragDropLabState())
    },
  }
}
