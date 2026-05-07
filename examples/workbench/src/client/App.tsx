import { useState } from "react"

import { AppShell } from "@/components/workbench/AppShell"
import type { LabId } from "@/shared/labs"

import { DockLab } from "./labs/DockLab"
import { DragDropLab } from "./labs/DragDropLab"
import { FloatingWindowsLab } from "./labs/FloatingWindowsLab"
import { KeyboardLab, SignalsLab } from "./labs/InteractionLabs"
import { ModalsLab } from "./labs/ModalLab"
import { OverviewLab } from "./labs/OverviewLab"
import { TabsLab } from "./labs/TabLab"

export const App = () => {
  const [activeLab, setActiveLab] = useState<LabId>("overview")

  return (
    <AppShell activeLab={activeLab} onActiveLabChange={setActiveLab}>
      {activeLab === "overview" ? <OverviewLab /> : null}
      {activeLab === "dock" ? <DockLab /> : null}
      {activeLab === "tabs" ? <TabsLab /> : null}
      {activeLab === "modals" ? <ModalsLab /> : null}
      {activeLab === "windows" ? <FloatingWindowsLab /> : null}
      {activeLab === "drag" ? <DragDropLab /> : null}
      {activeLab === "keyboard" ? <KeyboardLab /> : null}
      {activeLab === "signals" ? <SignalsLab /> : null}
    </AppShell>
  )
}
