/**
 * Primary React root bridge for interaction.
 *
 * InteractionRoot provides a runtime, creates a DOM root, installs the DOM
 * bridge, and optionally installs default pointer/keyboard synthesis. It does
 * not install domain policies.
 *
 * @module
 */

import { type HTMLAttributes, type ReactNode, useEffect, useState } from "react"

import type { RuntimeLease } from "@loop-kit/common/Runtime"

import type { InteractionRuntime } from "../InteractionRuntime.js"
import { installDomBridge } from "../installDomBridge.js"
import { installKeyboardSignalSynthesis } from "../installKeyboardSignalSynthesis.js"
import {
  type PointerSignalSynthesisOptions,
  installPointerSignalSynthesis,
} from "../installPointerSignalSynthesis.js"
import { InteractionProvider } from "./InteractionProvider.js"

export interface InteractionRootProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  readonly runtime: InteractionRuntime
  readonly installDefaults?: boolean | undefined
  readonly pointer?: PointerSignalSynthesisOptions | undefined
  readonly children?: ReactNode | undefined
}

export const InteractionRoot = ({
  runtime,
  installDefaults = false,
  pointer,
  children,
  ...divProps
}: InteractionRootProps): ReactNode => {
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!rootElement) return

    let disposed = false
    const leases: Array<RuntimeLease<void>> = []

    void (async () => {
      const domBridge = await runtime.install(installDomBridge(rootElement))
      if (disposed) {
        await domBridge.dispose()
        return
      }
      leases.push(domBridge)

      if (!installDefaults) return

      const [pointerSynthesis, keyboardSynthesis] = await runtime.installAll([
        installPointerSignalSynthesis(pointer),
        installKeyboardSignalSynthesis(),
      ])

      if (disposed) {
        await pointerSynthesis.dispose()
        await keyboardSynthesis.dispose()
        return
      }

      leases.push(pointerSynthesis, keyboardSynthesis)
    })()

    return () => {
      disposed = true
      for (const lease of leases.toReversed()) void lease.dispose()
    }
  }, [installDefaults, pointer, rootElement, runtime])

  return (
    <InteractionProvider runtime={runtime}>
      <div {...divProps} ref={setRootElement}>
        {children}
      </div>
    </InteractionProvider>
  )
}
