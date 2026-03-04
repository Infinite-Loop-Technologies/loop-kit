import type { CSSProperties, PointerEvent, ReactNode, KeyboardEvent } from 'react';
import { useCallback } from 'react';
import type { RawInput, RawKeyInputType, RawPointerInputType } from '@loop-kit/graphite-core';
import { useScope } from './useScope.js';

export type InputBoundaryProps = {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    tabIndex?: number;
};

export function InputBoundary({
    children,
    className,
    style,
    tabIndex = 0,
}: InputBoundaryProps) {
    const { scope } = useScope();

    const emit = useCallback(
        (input: RawInput) => {
            scope.interactionRuntime.handleInput(input);
        },
        [scope],
    );

    const toPointerInput = useCallback(
        (kind: RawPointerInputType, event: PointerEvent<HTMLDivElement>): RawInput => ({
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
        }),
        [],
    );

    const toKeyInput = useCallback(
        (kind: RawKeyInputType, event: KeyboardEvent<HTMLDivElement>): RawInput => ({
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
        }),
        [],
    );

    return (
        <div
            className={className}
            style={style}
            tabIndex={tabIndex}
            onPointerDown={(event) => emit(toPointerInput('pointerdown', event))}
            onPointerMove={(event) => emit(toPointerInput('pointermove', event))}
            onPointerUp={(event) => emit(toPointerInput('pointerup', event))}
            onPointerCancel={(event) => emit(toPointerInput('pointercancel', event))}
            onKeyDown={(event) => emit(toKeyInput('keydown', event))}
            onKeyUp={(event) => emit(toKeyInput('keyup', event))}
        >
            {children}
        </div>
    );
}

function readDataset(target: EventTarget | null): Record<string, string | undefined> | undefined {
    if (!(target instanceof HTMLElement)) {
        return undefined;
    }

    const dataset: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(target.dataset)) {
        dataset[key] = value;
    }

    return dataset;
}
