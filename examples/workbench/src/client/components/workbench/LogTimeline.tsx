import { cn } from "@/lib/utils"

export interface LogEntry {
  readonly id: string
  readonly message: string
}

export interface LogTimelineProps {
  readonly title: string
  readonly entries: ReadonlyArray<LogEntry>
  readonly emptyLabel?: string | undefined
}

export const createLogEntry = (message: string): LogEntry => ({
  id: globalThis.crypto.randomUUID(),
  message,
})

export const LogTimeline = ({
  title,
  entries,
  emptyLabel = "No events yet.",
}: LogTimelineProps) => (
  <div className="workbench-muted-surface min-h-0 rounded-md border border-border p-3">
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </div>
    <div className="grid max-h-40 min-h-0 gap-1 overflow-y-auto pr-1 text-xs text-foreground">
      {entries.length === 0 ? <span>{emptyLabel}</span> : null}
      {entries.map((event) => (
        <span
          key={event.id}
          className={cn("truncate", event.message.includes("drag") && "font-medium")}
        >
          {event.message}
        </span>
      ))}
    </div>
  </div>
)
