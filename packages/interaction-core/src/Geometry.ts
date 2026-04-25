/**
 * Portable geometry helpers for interaction runtimes.
 *
 * Core interaction logic should reason about points and rectangles without
 * depending on DOM-specific types.
 */

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export const distanceBetweenPoints = (a: Point, b: Point): number =>
  Math.hypot(a.x - b.x, a.y - b.y);
