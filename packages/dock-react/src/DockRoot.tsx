/**
 * Primary React dock root.
 *
 * DockRoot installs the dock interaction policies into an existing
 * InteractionRuntime and renders the current dock layout. DOM/input synthesis
 * is still owned by `@loop-kit/interaction/react`.
 *
 * @module
 */

import { type HTMLAttributes, type ReactNode, useEffect } from "react"

import { installDefaultDockInteraction } from "@loop-kit/dock"
import { InteractionRoot, useInteractionRuntime } from "@loop-kit/interaction/react"

import { useDockContext } from "./DockHooks.js"
import { DockRender } from "./DockRender.js"

export interface DockRootProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  readonly installDefaultInteraction?: boolean | undefined
  readonly installDefaultPointerKeyboard?: boolean | undefined
  readonly children?: ReactNode | undefined
}

export const DockRoot = ({
  installDefaultInteraction = true,
  installDefaultPointerKeyboard = true,
  children,
  ...divProps
}: DockRootProps): ReactNode => {
  const { dock, runtime } = useDockContext()
  const interaction = useInteractionRuntime()

  useEffect(() => {
    if (!installDefaultInteraction) return

    let disposed = false
    let dispose: (() => Promise<void>) | undefined

    void interaction.install(installDefaultDockInteraction({ dock, runtime })).then((lease) => {
      if (disposed) {
        void lease.dispose()
        return
      }
      dispose = lease.dispose
    })

    return () => {
      disposed = true
      if (dispose) void dispose()
    }
  }, [dock, installDefaultInteraction, interaction, runtime])

  return (
    <InteractionRoot
      runtime={interaction}
      installDefaults={installDefaultPointerKeyboard}
      {...divProps}
    >
      {children ?? <DockRender />}
    </InteractionRoot>
  )
}
