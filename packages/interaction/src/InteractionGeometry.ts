/**
 * Shared geometry types for the interaction runtime.
 *
 * This file defines simple viewport coordinates and rectangles used by pointer
 * synthesis and target registration. It does not own layout measurement;
 * callers provide `getRect` when a target can be measured.
 *
 * @module
 */

export interface InteractionPoint {
  readonly x: number
  readonly y: number
}

export interface InteractionRect extends InteractionPoint {
  readonly width: number
  readonly height: number
}

export const getDistancePx = (a: InteractionPoint, b: InteractionPoint): number =>
  Math.hypot(a.x - b.x, a.y - b.y)

export const getPointFromClientCoordinates = (
  clientX: number,
  clientY: number
): InteractionPoint => ({
  x: clientX,
  y: clientY,
})
