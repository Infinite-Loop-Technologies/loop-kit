import { Activity } from "lucide-react"
import type { ReactNode } from "react"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { type LabId, labs } from "@/shared/labs"

export interface AppShellProps {
  readonly activeLab: LabId
  readonly onActiveLabChange: (lab: LabId) => void
  readonly children: ReactNode
}

export const AppShell = ({ activeLab, onActiveLabChange, children }: AppShellProps) => {
  const active = labs.find((lab) => lab.id === activeLab) ?? labs[0]

  return (
    <div className="workbench-shell grid min-h-screen grid-cols-[260px_1fr]">
      <aside className="workbench-sidebar border-r">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-md">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">Loop Kit</div>
              <div className="text-xs text-muted-foreground">Examples workbench</div>
            </div>
          </div>
        </div>
        <Separator />
        <nav className="grid gap-1 p-2">
          {labs.map((lab) => (
            <button
              key={lab.id}
              type="button"
              onClick={() => onActiveLabChange(lab.id)}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-md px-3 text-left text-sm transition",
                activeLab === lab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <lab.Icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate font-medium">{lab.label}</span>
                <span
                  className={cn(
                    "block truncate text-xs",
                    activeLab === lab.id ? "text-primary-foreground/75" : "text-muted-foreground"
                  )}
                >
                  {lab.description}
                </span>
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="min-w-0">
        <header className="workbench-header flex h-16 items-center border-b px-5">
          <div>
            <div className="text-sm font-semibold">{active.label}</div>
            <div className="text-xs">{active.description}</div>
          </div>
        </header>

        <div className="p-5">{children}</div>
      </main>
    </div>
  )
}
