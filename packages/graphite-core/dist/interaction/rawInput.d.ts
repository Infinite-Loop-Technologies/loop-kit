export type RawPointerInputType = 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel';
export type RawKeyInputType = 'keydown' | 'keyup';
export type RawInputTarget = {
    dataset?: Record<string, string | undefined>;
};
export type RawPointerInput = {
    kind: RawPointerInputType;
    pointerId: number;
    x: number;
    y: number;
    button?: number;
    buttons?: number;
    shiftKey?: boolean;
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    target?: RawInputTarget;
};
export type RawKeyInput = {
    kind: RawKeyInputType;
    key: string;
    code?: string;
    repeat?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    target?: RawInputTarget;
};
export type RawInput = RawPointerInput | RawKeyInput;
export declare function isPointerInput(input: RawInput): input is RawPointerInput;
//# sourceMappingURL=rawInput.d.ts.map