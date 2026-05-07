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
  <div className="workbench-muted-surface rounded-md border border-border p-3">
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </div>
    <div className="grid gap-1 text-xs text-foreground">
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
