import type { ReactNode } from "react"

export const LabGrid = ({ children }: { readonly children: ReactNode }) => (
  <div className="grid gap-4">{children}</div>
)
