import { cn } from "@/lib/utils"

export interface ChecklistItemProps {
  readonly done?: boolean | undefined
  readonly label: string
}

export const ChecklistItem = ({ done = false, label }: ChecklistItemProps) => (
  <div className="workbench-panel flex items-start gap-3 rounded-md border p-3 text-sm">
    <div
      className={cn(
        "mt-0.5 h-4 w-4 rounded-full border",
        done ? "border-primary bg-primary" : "border-input bg-background"
      )}
    />
    <span className="leading-6 text-card-foreground">{label}</span>
  </div>
)
