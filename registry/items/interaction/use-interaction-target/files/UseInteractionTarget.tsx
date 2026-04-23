"use client"

import { createInteractionTargetId } from "@loop-kit/interaction-core"
import { InteractionProvider, useInteractionTarget } from "@loop-kit/interaction-react"

export function UseInteractionTargetExample() {
  return (
    <InteractionProvider>
      <InnerTarget />
    </InteractionProvider>
  )
}

function InnerTarget() {
  const target = useInteractionTarget<HTMLButtonElement>({
    id: createInteractionTargetId("registry-interaction-target"),
    kind: "GenericTarget",
    roles: ["pressable", "focusable"],
  })

  return (
    <button
      type="button"
      {...target}
      data-interaction-target-id="registry-interaction-target"
      className="rounded-2xl border border-border px-4 py-3 text-sm"
    >
      Registered interaction target
    </button>
  )
}
