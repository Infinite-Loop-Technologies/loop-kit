import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChecklistItem } from "@/components/workbench/ChecklistItem"
import { LabGrid } from "@/components/workbench/LabGrid"

import { DockLab } from "./DockLab"

export const TabsLab = () => (
  <LabGrid>
    <Card>
      <CardHeader>
        <CardTitle>Tab behavior to prove</CardTitle>
        <CardDescription>
          Dock tabs are semantic interaction targets. Selection belongs to the dock service; pointer
          synthesis and target resolution belong to interaction.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <ChecklistItem done label="Clicking a tab selects and focuses its panel." />
        <ChecklistItem done label="Dragging a tab starts a transient dock drag preview." />
        <ChecklistItem done label="Side dropzones expose legal dock placement targets." />
      </CardContent>
    </Card>
    <DockLab />
  </LabGrid>
)
