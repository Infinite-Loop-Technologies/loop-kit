/**
 * Geometry primitives for dock layout, hit testing, previews, and resizing.
 *
 * These helpers are deliberately small and DOM-free. They operate on viewport
 * style rectangles but do not measure elements or own rendering.
 *
 * @module
 */

export interface DockPoint {
  readonly x: number
  readonly y: number
}

export interface DockSize {
  readonly width: number
  readonly height: number
}

export interface DockRect extends DockPoint, DockSize {}

export type DockEdge = "left" | "right" | "top" | "bottom"
export type DockAxis = "horizontal" | "vertical"

export interface DockSplitRectResult {
  readonly leading: DockRect
  readonly trailing: DockRect
}

export const containsPoint = (rect: DockRect, point: DockPoint): boolean =>
  point.x >= rect.x &&
  point.y >= rect.y &&
  point.x <= rect.x + rect.width &&
  point.y <= rect.y + rect.height

export const clampRatio = (ratio: number, min = 0.1, max = 0.9): number =>
  Math.min(max, Math.max(min, Number.isFinite(ratio) ? ratio : 0.5))

export const splitRect = (rect: DockRect, axis: DockAxis, ratio: number): DockSplitRectResult => {
  const clamped = clampRatio(ratio)
  if (axis === "horizontal") {
    const leadingWidth = rect.width * clamped
    return {
      leading: { ...rect, width: leadingWidth },
      trailing: {
        x: rect.x + leadingWidth,
        y: rect.y,
        width: rect.width - leadingWidth,
        height: rect.height,
      },
    }
  }

  const leadingHeight = rect.height * clamped
  return {
    leading: { ...rect, height: leadingHeight },
    trailing: {
      x: rect.x,
      y: rect.y + leadingHeight,
      width: rect.width,
      height: rect.height - leadingHeight,
    },
  }
}

export const insetRect = (
  rect: DockRect,
  inset: number | Partial<Record<DockEdge, number>>
): DockRect => {
  const left = typeof inset === "number" ? inset : (inset.left ?? 0)
  const right = typeof inset === "number" ? inset : (inset.right ?? 0)
  const top = typeof inset === "number" ? inset : (inset.top ?? 0)
  const bottom = typeof inset === "number" ? inset : (inset.bottom ?? 0)

  return {
    x: rect.x + left,
    y: rect.y + top,
    width: Math.max(0, rect.width - left - right),
    height: Math.max(0, rect.height - top - bottom),
  }
}

export const rectIntersection = (a: DockRect, b: DockRect): DockRect | null => {
  const x = Math.max(a.x, b.x)
  const y = Math.max(a.y, b.y)
  const right = Math.min(a.x + a.width, b.x + b.width)
  const bottom = Math.min(a.y + a.height, b.y + b.height)
  if (right <= x || bottom <= y) return null
  return { x, y, width: right - x, height: bottom - y }
}
