import { MoveDiagonal2, X } from "lucide-react"
import type { CSSProperties, ReactNode, Ref } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface DockGroupUiProps {
  readonly dropRef: Ref<HTMLElement>
  readonly header: ReactNode
  readonly children: ReactNode
}

export const DockGroupUi = ({ dropRef, header, children }: DockGroupUiProps) => (
  <section
    ref={dropRef}
    className="grid h-full min-h-0 min-w-0 grid-rows-[36px_1fr] overflow-hidden rounded-md border border-border bg-card text-card-foreground"
  >
    <div className="flex items-stretch overflow-hidden border-b border-border bg-muted">
      {header}
    </div>
    <div className="min-h-0 overflow-auto">{children}</div>
  </section>
)

export interface DockTabUiProps {
  readonly refCallback: Ref<HTMLButtonElement>
  readonly active: boolean
  readonly insertionBefore?: boolean | undefined
  readonly title: string
}

export const DockTabUi = ({
  refCallback,
  active,
  insertionBefore = false,
  title,
}: DockTabUiProps) => (
  <div className="relative flex min-w-0">
    {insertionBefore ? (
      <div className="absolute bottom-1 left-0 top-1 z-10 w-1 rounded-full bg-ring" />
    ) : null}
    <button
      ref={refCallback}
      type="button"
      className={cn(
        "min-w-0 border-r border-border px-3 text-left text-xs font-medium outline-none transition focus:ring-2 focus:ring-ring",
        active
          ? "bg-card text-card-foreground"
          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <span className="block truncate">{title}</span>
    </button>
  </div>
)

export interface DockSplitUiProps {
  readonly containerRef?: Ref<HTMLDivElement> | undefined
  readonly axis: "horizontal" | "vertical"
  readonly ratio: number
  readonly handleRef: Ref<HTMLDivElement>
  readonly leading: ReactNode
  readonly trailing: ReactNode
}

export const DockSplitUi = ({
  containerRef,
  axis,
  ratio,
  handleRef,
  leading,
  trailing,
}: DockSplitUiProps) => (
  <div
    ref={containerRef}
    className="grid h-full min-h-0 min-w-0"
    style={
      axis === "horizontal"
        ? ({ gridTemplateColumns: `${ratio}fr 6px ${1 - ratio}fr` } satisfies CSSProperties)
        : ({ gridTemplateRows: `${ratio}fr 6px ${1 - ratio}fr` } satisfies CSSProperties)
    }
  >
    {leading}
    <div
      ref={handleRef}
      className={cn(
        "bg-border outline-none transition hover:bg-ring focus:bg-ring",
        axis === "horizontal" ? "cursor-col-resize" : "cursor-row-resize"
      )}
    />
    {trailing}
  </div>
)

export interface DockEmptyUiProps {
  readonly label: string
}

export const DockEmptyUi = ({ label }: DockEmptyUiProps) => (
  <div className="grid h-full place-items-center rounded-md border border-dashed border-border bg-muted text-sm text-muted-foreground">
    {label}
  </div>
)

export interface DockFloatingWindowUiProps {
  readonly titlebarRef: Ref<HTMLDivElement>
  readonly resizeRef: Ref<HTMLDivElement>
  readonly active: boolean
  readonly title: string
  readonly frame: CSSProperties
  readonly onClose: () => void
  readonly children: ReactNode
}

export const DockFloatingWindowUi = ({
  titlebarRef,
  resizeRef,
  active,
  title,
  frame,
  onClose,
  children,
}: DockFloatingWindowUiProps) => (
  <div
    className={cn(
      "absolute grid grid-rows-[36px_1fr] overflow-hidden rounded-lg border bg-card text-card-foreground shadow-lg",
      active ? "border-ring" : "border-border"
    )}
    style={frame}
  >
    <div
      ref={titlebarRef}
      className="flex cursor-grab items-center justify-between border-b border-border bg-muted px-3 text-sm font-medium text-muted-foreground"
    >
      <span className="truncate">{title}</span>
      <div className="flex shrink-0 items-center gap-1">
        <Button size="icon" variant="ghost" onClick={onClose} aria-label={`Close ${title}`}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
    <div className="min-h-0 overflow-auto">{children}</div>
    <div
      ref={resizeRef}
      className="absolute bottom-1 right-1 grid h-5 w-5 cursor-nwse-resize place-items-center rounded-sm text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
    >
      <MoveDiagonal2 className="h-3.5 w-3.5" />
    </div>
  </div>
)

export interface DockModalUiProps {
  readonly backdropRef: Ref<HTMLDivElement>
  readonly surfaceRef: Ref<HTMLDivElement>
  readonly title: string
  readonly onClose: () => void
  readonly children: ReactNode
}

export const DockModalUi = ({
  backdropRef,
  surfaceRef,
  title,
  onClose,
  children,
}: DockModalUiProps) => (
  <div
    ref={backdropRef}
    className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-6"
  >
    <div
      ref={surfaceRef}
      tabIndex={-1}
      className="grid max-h-[80vh] w-full max-w-xl grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-xl outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="text-sm font-semibold">{title}</div>
        <Button size="icon" variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="min-h-[220px] overflow-auto p-3">{children}</div>
    </div>
  </div>
)
