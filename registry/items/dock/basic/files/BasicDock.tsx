"use client"

import {
  createDockLayout,
  createDockPanelId,
  createDockState,
  createDockTabGroup,
} from "@loop-kit/dock"
import { DockProvider, DockRender } from "@loop-kit/dock-react"

const navigatorId = createDockPanelId("registry-basic-navigator")
const contentId = createDockPanelId("registry-basic-content")

export function BasicDock() {
  return (
    <DockProvider
      initialState={createDockState({
        panels: [
          { id: navigatorId, title: "Navigator", kind: "navigator" },
          { id: contentId, title: "Content", kind: "content" },
        ],
        layout: createDockLayout({
          root: createDockTabGroup([navigatorId, contentId], contentId),
        }),
      })}
      registry={{
        navigator: () => (
          <div className="rounded-2xl border border-border/70 p-4 text-sm text-muted-foreground">
            Installable navigation panel
          </div>
        ),
        content: () => (
          <div className="rounded-2xl border border-border/70 p-4 text-sm text-muted-foreground">
            Installable content panel
          </div>
        ),
      }}
    >
      <div className="h-[28rem]">
        <DockRender />
      </div>
    </DockProvider>
  )
}
