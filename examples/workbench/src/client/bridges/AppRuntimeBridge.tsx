import { createContext, useContext } from "react"
import type { ReactNode } from "react"

import type { AppRuntime } from "../runtime/AppRuntime"

const AppRuntimeContext = createContext<AppRuntime | null>(null)

export const AppRuntimeProvider = ({
  children,
  runtime,
}: {
  readonly children: ReactNode
  readonly runtime: AppRuntime
}) => <AppRuntimeContext.Provider value={runtime}>{children}</AppRuntimeContext.Provider>

export const useAppRuntime = (): AppRuntime => {
  const runtime = useContext(AppRuntimeContext)
  if (!runtime) throw new Error("AppRuntimeProvider is missing.")
  return runtime
}
