import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChecklistItem } from "@/components/workbench/ChecklistItem"
import { LabGrid } from "@/components/workbench/LabGrid"

import { DockLab } from "./DockLab"

export const ModalsLab = () => (
  <LabGrid>
    <Card>
      <CardHeader>
        <CardTitle>Modal policy checks</CardTitle>
        <CardDescription>
          The custom workbench modal layer registers backdrop and modal-surface targets so the
          headless dock policy can react to Escape and outside clicks.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <ChecklistItem done label="Open modal through DockService.openModal." />
        <ChecklistItem done label="Close through direct command, Escape, or registered backdrop." />
        <ChecklistItem
          done
          label="Modal queue and focused panel state are visible in the inspector."
        />
      </CardContent>
    </Card>
    <DockLab />
  </LabGrid>
)
