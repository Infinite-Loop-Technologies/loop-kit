"use client"

export function BasicDockDemo() {
  return (
    <div className="grid gap-3 rounded-3xl border border-dashed border-border bg-background/80 p-6">
      <div className="text-sm font-medium">Basic Dock preview</div>
      <div className="text-sm text-muted-foreground">
        Basic installable source now uses the real dock service, runtime, and React renderer.
      </div>
    </div>
  )
}
