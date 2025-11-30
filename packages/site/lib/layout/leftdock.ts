'use client';

import type { Pane, Rect } from './leftdock/interfaces/leftdock-layout-core';

// Lightweight fallback tiler (equal distribution)
export function tileToPercentsFallback(panes: Pane[]): number[] {
    if (!panes.length) return [];
    const n = Math.round(100 / panes.length);
    const arr = Array(panes.length).fill(n);
    const diff = 100 - arr.reduce((a, b) => a + b, 0);
    if (diff) arr[0] += diff;
    return arr;
}

export async function tileToPercentsAsync(
    container: Rect,
    panes: Pane[],
    layoutName: string
): Promise<number[]> {
    // dynamic import to avoid SSR URL errors
    try {
        const mod = await import('./leftdock/leftdock_core.js'); // your compiled WASM wrapper
        const { core } = mod as any;
        const { computeLayout } = core;
        const rects = computeLayout({
            container,
            panes,
            layout: layoutName,
        }) as Array<{ id: string; x: number; y: number; w: number; h: number }>;
        const total = container.w; // simple horizontal perc
        return rects.map((r) => Math.max(5, Math.round((r.w / total) * 100)));
    } catch {
        return tileToPercentsFallback(panes);
    }
}

export function tileToPercents(
    container: Rect,
    panes: Pane[],
    layoutName: string
): number[] {
    return tileToPercentsFallback(panes);
}
