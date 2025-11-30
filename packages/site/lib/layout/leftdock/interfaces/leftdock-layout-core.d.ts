/** @module Interface leftdock:layout/core **/
export function computeLayout(input: ComputeInput): Array<PaneRect>;
export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}
export interface Pane {
    id: string;
    weight?: number;
    min?: number;
    max?: number;
}
export interface ComputeInput {
    container: Rect;
    panes: Array<Pane>;
    layout: string;
}
export interface PaneRect {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
}
