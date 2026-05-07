import type { InteractionKeySignal, InteractionTargetId } from "@loop-kit/interaction"
import {
  InteractionRoot,
  useInteractionRuntime,
  useInteractionState,
  useInteractionTarget,
} from "@loop-kit/interaction/react"
import { ArrowDownUp, MousePointer2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InspectorRow } from "@/components/workbench/InspectorRow"
import { type LogEntry, LogTimeline, createLogEntry } from "@/components/workbench/LogTimeline"

import { useAppRuntime } from "../bridges/AppRuntimeBridge"

export const KeyboardLab = () => {
  const { interaction } = useAppRuntime().env

  return (
    <InteractionRoot
      runtime={interaction}
      installDefaults
      className="grid gap-4 lg:grid-cols-[1fr_340px]"
    >
      <KeyboardTargets />
      <InteractionInspector />
    </InteractionRoot>
  )
}

export const SignalsLab = () => {
  const { interaction } = useAppRuntime().env

  return (
    <InteractionRoot
      runtime={interaction}
      installDefaults
      className="grid gap-4 lg:grid-cols-[1fr_340px]"
    >
      <SignalTargets />
      <InteractionInspector />
    </InteractionRoot>
  )
}

const KeyboardTargets = () => {
  const parentId = "keyboard:scope" as InteractionTargetId
  const commandId = "keyboard:command-button" as InteractionTargetId
  const inputId = "keyboard:text-input" as InteractionTargetId
  const scopeRef = useInteractionTarget<HTMLDivElement>(
    useMemo(
      () => ({
        id: parentId,
        roles: ["command-boundary"] as const,
        capabilities: { keyboard: true },
      }),
      [parentId]
    )
  )
  const commandRef = useInteractionTarget<HTMLButtonElement>(
    useMemo(
      () => ({
        id: commandId,
        parentId,
        roles: ["pressable", "focusable"] as const,
        capabilities: { pointer: true, keyboard: true },
      }),
      [commandId, parentId]
    )
  )
  const inputRef = useInteractionTarget<HTMLInputElement>(
    useMemo(
      () => ({
        id: inputId,
        parentId,
        roles: ["focusable"] as const,
        capabilities: { keyboard: true },
      }),
      [inputId, parentId]
    )
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyboard target hierarchy</CardTitle>
        <CardDescription>
          Focus the input or button. The runtime resolves targets by explicit registration and
          parentId, not by guessing from React trees.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={scopeRef} className="workbench-muted-surface grid gap-4 rounded-md border p-4">
          <Button ref={commandRef}>
            <MousePointer2 className="h-4 w-4" />
            Command target
          </Button>
          <input
            ref={inputRef}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            placeholder="Type here and inspect key signals"
          />
        </div>
      </CardContent>
    </Card>
  )
}

const SignalTargets = () => {
  const targetId = "signals:pointer-card" as InteractionTargetId
  const ref = useInteractionTarget<HTMLButtonElement>(
    useMemo(
      () => ({
        id: targetId,
        roles: ["pressable", "draggable", "focusable"] as const,
        capabilities: { pointer: true, drag: true, keyboard: true },
      }),
      [targetId]
    )
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pointer signal surface</CardTitle>
        <CardDescription>
          Click, double-click, hover, or drag the target. The inspector records synthesized runtime
          signals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <button
          ref={ref}
          type="button"
          className="grid h-72 place-items-center rounded-md border border-dashed border-ring bg-accent text-center text-accent-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          <div>
            <ArrowDownUp className="mx-auto mb-3 h-8 w-8" />
            <div className="font-semibold">Registered pointer target</div>
            <div className="mt-1 text-sm text-accent-foreground/80">
              Drag threshold, click, double-click, and hover run here.
            </div>
          </div>
        </button>
      </CardContent>
    </Card>
  )
}

const InteractionInspector = () => {
  const runtime = useInteractionRuntime()
  const focusTargetId = useInteractionState((state) => state.focusTargetId)
  const hoverTargetId = useInteractionState((state) => state.hoverTargetId)
  const pressedKeySet = useInteractionState((state) => state.keyboard.pressedKeys)
  const pressedKeys = Array.from(pressedKeySet)
  const ancestry = focusTargetId
    ? runtime.getTargetAncestry(focusTargetId).map((target) => target.id)
    : []
  const [events, setEvents] = useState<ReadonlyArray<LogEntry>>([])

  useEffect(() => {
    const push = (message: string) =>
      setEvents((current) => [createLogEntry(message), ...current].slice(0, 12))
    const cleanups = [
      runtime.env.signals.keyPressed.subscribe((signal) => push(formatKeySignal("down", signal))),
      runtime.env.signals.keyReleased.subscribe((signal) => push(formatKeySignal("up", signal))),
      runtime.env.signals.press.subscribe((signal) =>
        push(`press ${signal.target?.id ?? "unknown"}`)
      ),
      runtime.env.signals.click.subscribe((signal) =>
        push(`click ${signal.target?.id ?? "unknown"}`)
      ),
      runtime.env.signals.doubleClick.subscribe((signal) =>
        push(`double click ${signal.target?.id ?? "unknown"}`)
      ),
      runtime.env.signals.hoverChanged.subscribe((signal) =>
        push(`hover ${signal.current?.id ?? "none"}`)
      ),
      runtime.env.signals.dragStart.subscribe((signal) => push(`drag start ${signal.source.id}`)),
      runtime.env.signals.dragMove.subscribe((signal) => push(`drag move ${signal.source.id}`)),
      runtime.env.signals.dragEnd.subscribe((signal) => push(`drag end ${signal.source.id}`)),
      runtime.env.signals.focusChanged.subscribe((signal) =>
        push(`focus ${signal.current?.id ?? "none"}`)
      ),
    ]

    return () => {
      for (const cleanup of cleanups) cleanup()
    }
  }, [runtime])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interaction inspector</CardTitle>
        <CardDescription>Current runtime state plus recent synthesized signals.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <InspectorRow label="Focus target" value={focusTargetId ?? "none"} />
        <InspectorRow label="Focus ancestry" value={ancestry.join(" > ") || "none"} />
        <InspectorRow label="Hover target" value={hoverTargetId ?? "none"} />
        <InspectorRow label="Pressed keys" value={pressedKeys.join(", ") || "none"} />
        <LogTimeline title="Signals" entries={events} />
      </CardContent>
    </Card>
  )
}

const formatKeySignal = (direction: "down" | "up", signal: InteractionKeySignal): string =>
  `${direction} ${signal.key} on ${signal.target?.id ?? "unknown"}`
