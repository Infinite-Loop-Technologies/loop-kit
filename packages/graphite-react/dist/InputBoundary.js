import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from 'react';
import { useScope } from './useScope.js';
export function InputBoundary({ children, className, style, tabIndex = 0, }) {
    const { scope } = useScope();
    const emit = useCallback((input) => {
        scope.interactionRuntime.handleInput(input);
    }, [scope]);
    const toPointerInput = useCallback((kind, event) => ({
        kind,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        button: event.button,
        buttons: event.buttons,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        target: {
            dataset: readDataset(event.target),
        },
    }), []);
    const toKeyInput = useCallback((kind, event) => ({
        kind,
        key: event.key,
        code: event.code,
        repeat: event.repeat,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        target: {
            dataset: readDataset(event.target),
        },
    }), []);
    return (_jsx("div", { className: className, style: style, tabIndex: tabIndex, onPointerDown: (event) => emit(toPointerInput('pointerdown', event)), onPointerMove: (event) => emit(toPointerInput('pointermove', event)), onPointerUp: (event) => emit(toPointerInput('pointerup', event)), onPointerCancel: (event) => emit(toPointerInput('pointercancel', event)), onKeyDown: (event) => emit(toKeyInput('keydown', event)), onKeyUp: (event) => emit(toKeyInput('keyup', event)), children: children }));
}
function readDataset(target) {
    if (!(target instanceof HTMLElement)) {
        return undefined;
    }
    const dataset = {};
    for (const [key, value] of Object.entries(target.dataset)) {
        dataset[key] = value;
    }
    return dataset;
}
//# sourceMappingURL=InputBoundary.js.map