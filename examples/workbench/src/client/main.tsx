import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { App } from "./App"
import { AppRuntimeProvider } from "./bridges/AppRuntimeBridge"
import { createAppRuntime } from "./runtime/AppRuntime"

const root = document.getElementById("root")
if (!root) throw new Error("Missing #root.")

const runtime = createAppRuntime()

createRoot(root).render(
  <StrictMode>
    <AppRuntimeProvider runtime={runtime}>
      <App />
    </AppRuntimeProvider>
  </StrictMode>
)
