"use client"

import { createStore } from "@loop-kit/common"
import { useStore } from "@loop-kit/common-react"

const counterStore = createStore({ count: 0 })

export function UseStoreExample() {
  const state = useStore(counterStore)

  return (
    <button
      type="button"
      className="rounded-2xl border border-border px-4 py-3 text-sm"
      onClick={() => counterStore.update((current) => ({ count: current.count + 1 }))}
    >
      Count: {state.count}
    </button>
  )
}
