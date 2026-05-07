import { describe, expect, test } from "vitest"

import {
  type InteractionRawPointerSignal,
  type InteractionTargetId,
  createInteractionRuntime,
  installDomBridge,
  installKeyboardSignalSynthesis,
  installPointerSignalSynthesis,
} from "../src/index.js"

describe("InteractionRuntime targets", () => {
  test("registers, returns, and unregisters targets through lease disposal", async () => {
    const runtime = createInteractionRuntime()
    const id = "target" as InteractionTargetId

    const lease = runtime.registerTarget({
      id,
      roles: ["pressable"],
    })

    expect(runtime.getTarget(id)?.id).toBe(id)

    await lease.dispose()

    expect(runtime.getTarget(id)).toBeUndefined()
    await runtime.dispose()
  })

  test("returns explicit parent ancestry", async () => {
    const runtime = createInteractionRuntime()
    const parentId = "parent" as InteractionTargetId
    const childId = "child" as InteractionTargetId

    runtime.registerTarget({ id: parentId, roles: ["command-boundary"] })
    runtime.registerTarget({
      id: childId,
      parentId,
      roles: ["pressable"],
    })

    expect(runtime.getTargetAncestry(childId).map((target) => target.id)).toEqual([
      childId,
      parentId,
    ])

    await runtime.dispose()
  })

  test("resolves DOM node by closest element and target priority", async () => {
    const runtime = createInteractionRuntime()
    const element = createElement()
    const lowId = "low" as InteractionTargetId
    const highId = "high" as InteractionTargetId

    runtime.registerTarget({
      id: lowId,
      roles: ["pressable"],
      element,
      priority: 1,
    })
    runtime.registerTarget({
      id: highId,
      roles: ["pressable"],
      element,
      priority: 2,
    })

    expect(runtime.resolveTargetFromDomNode(element)?.id).toBe(highId)

    await runtime.dispose()
  })
})

describe("pointer synthesis", () => {
  test("emits click from raw pointer down and up", async () => {
    const runtime = createInteractionRuntime()
    const element = createElement()
    const targetId = "button" as InteractionTargetId
    const clicks: Array<InteractionTargetId | undefined> = []

    runtime.registerTarget({
      id: targetId,
      roles: ["pressable"],
      element,
    })
    const lease = await runtime.install(installPointerSignalSynthesis())
    const unsubscribe = runtime.env.signals.click.subscribe((signal) => {
      clicks.push(signal.target?.id)
    })

    runtime.env.signals.rawPointerDown.emit(createRawPointerSignal(element, 0, 0))
    runtime.env.signals.rawPointerUp.emit(createRawPointerSignal(element, 0, 0))

    expect(clicks).toEqual([targetId])

    unsubscribe()
    await lease.dispose()
    await runtime.dispose()
  })

  test("emits dragStart after movement crosses threshold", async () => {
    const runtime = createInteractionRuntime()
    const element = createElement()
    const targetId = "drag-source" as InteractionTargetId
    const dragStarts: Array<InteractionTargetId> = []

    runtime.registerTarget({
      id: targetId,
      roles: ["draggable"],
      element,
    })
    const lease = await runtime.install(installPointerSignalSynthesis({ dragThresholdPx: 4 }))
    const unsubscribe = runtime.env.signals.dragStart.subscribe((signal) => {
      dragStarts.push(signal.source.id)
    })

    runtime.env.signals.rawPointerDown.emit(createRawPointerSignal(element, 0, 0))
    runtime.env.signals.rawPointerMove.emit(createRawPointerSignal(element, 5, 0))

    expect(dragStarts).toEqual([targetId])

    unsubscribe()
    await lease.dispose()
    await runtime.dispose()
  })

  test("prevents native selection only after a draggable target crosses threshold", async () => {
    const runtime = createInteractionRuntime()
    const element = createElement()
    const targetId = "drag-source" as InteractionTargetId
    const preventDefaultCalls: Array<string> = []

    runtime.registerTarget({
      id: targetId,
      roles: ["draggable"],
      element,
    })
    const lease = await runtime.install(installPointerSignalSynthesis({ dragThresholdPx: 4 }))

    runtime.env.signals.rawPointerDown.emit(createRawPointerSignal(element, 0, 0))
    runtime.env.signals.rawPointerMove.emit(
      createRawPointerSignal(element, 2, 0, () => preventDefaultCalls.push("below"))
    )
    runtime.env.signals.rawPointerMove.emit(
      createRawPointerSignal(element, 5, 0, () => preventDefaultCalls.push("dragging"))
    )

    expect(preventDefaultCalls).toEqual(["dragging"])

    await lease.dispose()
    await runtime.dispose()
  })

  test("does not start drag or suppress native selection for text input targets", async () => {
    const runtime = createInteractionRuntime()
    const element = createElement()
    const targetId = "text-input" as InteractionTargetId
    const dragStarts: Array<InteractionTargetId> = []
    const preventDefaultCalls: Array<string> = []

    runtime.registerTarget({
      id: targetId,
      roles: ["text-input", "focusable"],
      element,
    })
    const lease = await runtime.install(installPointerSignalSynthesis({ dragThresholdPx: 4 }))
    const unsubscribe = runtime.env.signals.dragStart.subscribe((signal) => {
      dragStarts.push(signal.source.id)
    })

    runtime.env.signals.rawPointerDown.emit(createRawPointerSignal(element, 0, 0))
    runtime.env.signals.rawPointerMove.emit(
      createRawPointerSignal(element, 8, 0, () => preventDefaultCalls.push("text"))
    )

    expect(dragStarts).toEqual([])
    expect(preventDefaultCalls).toEqual([])

    unsubscribe()
    await lease.dispose()
    await runtime.dispose()
  })
})

describe("DOM bridge", () => {
  test("removes raw event listeners on lease disposal", async () => {
    const runtime = createInteractionRuntime()
    const root = new EventTarget()
    let pointerDownCount = 0

    const lease = await runtime.install(installDomBridge(root))
    const unsubscribe = runtime.env.signals.rawPointerDown.subscribe(() => {
      pointerDownCount++
    })

    root.dispatchEvent(createPointerEvent("pointerdown"))
    await lease.dispose()
    root.dispatchEvent(createPointerEvent("pointerdown"))

    expect(pointerDownCount).toBe(1)

    unsubscribe()
    await runtime.dispose()
  })
})

describe("keyboard synthesis", () => {
  test("updates pressed keys and emits key signals", async () => {
    const runtime = createInteractionRuntime()
    const keyPressed: Array<string> = []
    const keyReleased: Array<string> = []

    const lease = await runtime.install(installKeyboardSignalSynthesis())
    const unsubscribePressed = runtime.env.signals.keyPressed.subscribe((signal) => {
      keyPressed.push(signal.key)
    })
    const unsubscribeReleased = runtime.env.signals.keyReleased.subscribe((signal) => {
      keyReleased.push(signal.key)
    })

    runtime.env.signals.rawKeyDown.emit({
      key: "Shift",
      code: "ShiftLeft",
      repeat: false,
      modifiers: { alt: false, ctrl: false, meta: false, shift: true },
    })

    expect(runtime.env.state.get().keyboard.pressedKeys.has("Shift")).toBe(true)

    runtime.env.signals.rawKeyUp.emit({
      key: "Shift",
      code: "ShiftLeft",
      repeat: false,
      modifiers: { alt: false, ctrl: false, meta: false, shift: false },
    })

    expect(runtime.env.state.get().keyboard.pressedKeys.has("Shift")).toBe(false)
    expect(keyPressed).toEqual(["Shift"])
    expect(keyReleased).toEqual(["Shift"])

    unsubscribePressed()
    unsubscribeReleased()
    await lease.dispose()
    await runtime.dispose()
  })
})

const createElement = (parentElement: Element | null = null): Element =>
  ({
    parentElement,
    tagName: "DIV",
    getBoundingClientRect: () => ({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    }),
  }) as Element

const createRawPointerSignal = (
  eventTarget: EventTarget,
  x: number,
  y: number,
  preventDefault?: (() => void) | undefined
): InteractionRawPointerSignal => ({
  pointerId: 1,
  position: { x, y },
  button: 0,
  buttons: 1,
  modifiers: { alt: false, ctrl: false, meta: false, shift: false },
  eventTarget,
  nativeEvent: preventDefault ? ({ preventDefault } as unknown as Event) : undefined,
})

const createPointerEvent = (type: string): Event => {
  const event = new Event(type)
  Object.defineProperties(event, {
    pointerId: { value: 1 },
    clientX: { value: 0 },
    clientY: { value: 0 },
    button: { value: 0 },
    buttons: { value: 1 },
    altKey: { value: false },
    ctrlKey: { value: false },
    metaKey: { value: false },
    shiftKey: { value: false },
  })
  return event
}
