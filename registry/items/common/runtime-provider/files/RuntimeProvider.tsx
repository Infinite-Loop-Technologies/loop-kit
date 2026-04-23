"use client"

import { createRuntime } from "@loop-kit/common"
import { createRequiredContext } from "@loop-kit/common-react"
import { useState, type ReactNode } from "react"

const [RuntimeContext, useRuntime] = createRequiredContext<ReturnType<typeof createRuntime<{ name: string }>>>("ExampleRuntime")

export function RuntimeProvider({
  children,
}: {
  children: ReactNode
}) {
  const [runtime] = useState(() => createRuntime({ name: "registry-runtime" }))

  return <RuntimeContext.Provider value={runtime}>{children}</RuntimeContext.Provider>
}

export function RuntimeConsumer() {
  const runtime = useRuntime()
  return <div className="text-sm text-muted-foreground">Runtime env: {runtime.env.name}</div>
}
