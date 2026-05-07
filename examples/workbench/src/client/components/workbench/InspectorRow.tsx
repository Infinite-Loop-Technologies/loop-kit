export interface InspectorRowProps {
  readonly label: string
  readonly value: string
}

export const InspectorRow = ({ label, value }: InspectorRowProps) => (
  <div className="workbench-panel grid gap-1 rounded-md border px-3 py-2">
    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    <span className="truncate text-sm text-card-foreground">{value}</span>
  </div>
)
