import { createInteractionRuntime } from "@loop-kit/interaction"
import { InteractionRoot, useInteractionTarget } from "@loop-kit/interaction/react"
import { StrictMode, useEffect, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"

import type { InteractionTargetId } from "@loop-kit/interaction"

const runtime = createInteractionRuntime()
const targetId = "simple:pressable" as InteractionTargetId

const App = () => {
  const [message, setMessage] = useState("Click or press Space inside the target.")

  useEffect(() => {
    const cleanups = [
      runtime.env.signals.click.subscribe((signal) => {
        setMessage(`Clicked ${signal.target?.id ?? "unknown target"}`)
      }),
      runtime.env.signals.keyPressed.subscribe((signal) => {
        if (signal.key === " " || signal.key === "Enter") {
          setMessage(`Key ${signal.key === " " ? "Space" : signal.key} reached the runtime.`)
        }
      }),
    ]

    return () => {
      for (const cleanup of cleanups) cleanup()
    }
  }, [])

  return (
    <InteractionRoot
      runtime={runtime}
      installDefaults
      className="grid min-h-screen place-items-center p-6"
    >
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">
          @loop-kit/interaction
        </div>
        <h1 className="text-2xl font-semibold">Simple runtime smoke test</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This example proves the workspace package link, Bun HTML bundling, React bridge, DOM
          bridge, pointer synthesis, and keyboard synthesis.
        </p>
        <SimpleTarget />
        <div className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
          {message}
        </div>
      </div>
    </InteractionRoot>
  )
}

const SimpleTarget = () => {
  const options = useMemo(
    () => ({
      id: targetId,
      roles: ["pressable", "focusable"] as const,
      capabilities: { pointer: true, keyboard: true },
    }),
    []
  )
  const ref = useInteractionTarget<HTMLButtonElement>(options)

  return (
    <button
      ref={ref}
      type="button"
      className="mt-5 h-12 w-full rounded-md bg-slate-900 px-4 text-sm font-medium text-white outline-none transition hover:bg-slate-700 focus:ring-2 focus:ring-slate-400"
    >
      Registered interaction target
    </button>
  )
}

const root = document.getElementById("root")
if (!root) throw new Error("Missing #root.")

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
