'use client';

import React from 'react';
import { LiveCanvas } from '@use-gpu/react/mjs/index.mjs';

import LiveShadertoy from './live-shadertoy';

type Pointer = [number, number];

function clamp01(value: number) {
    return Math.max(0, Math.min(1, value));
}

export default function ShadertoyDemo() {
    const pointerRef = React.useRef<Pointer>([0.5, 0.5]);
    const [pointer, setPointer] = React.useState<Pointer>([0.5, 0.5]);

    const updatePointer = React.useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            const rect = event.currentTarget.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            const next: Pointer = [
                clamp01((event.clientX - rect.left) / rect.width),
                clamp01((event.clientY - rect.top) / rect.height),
            ];

            pointerRef.current = next;
            setPointer(next);
        },
        []
    );

    const handlePointerLeave = React.useCallback(() => {
        const center: Pointer = [0.5, 0.5];
        pointerRef.current = center;
        setPointer(center);
    }, []);

    const getTime = React.useCallback(() => performance.now() / 1000, []);
    const getMouse = React.useCallback(() => pointerRef.current, []);

    return (
        <div className='relative min-h-[430px] overflow-hidden rounded-xl border bg-black'>
            <div className='absolute inset-0'>
                <LiveCanvas>
                    {(canvas) => (
                        <LiveShadertoy
                            canvas={canvas}
                            getTime={getTime}
                            getMouse={getMouse}
                        />
                    )}
                </LiveCanvas>
            </div>

            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.16),transparent_40%)]' />

            <div className='pointer-events-none absolute left-3 top-3 rounded-md border border-white/20 bg-black/45 px-2.5 py-1.5 text-[11px] font-medium text-white/90 backdrop-blur'>
                iTime + mouse linked via WGSL linker | mouse:{' '}
                {pointer[0].toFixed(2)}, {pointer[1].toFixed(2)}
            </div>

            <div
                className='absolute inset-0 z-10 cursor-crosshair'
                onPointerDown={updatePointer}
                onPointerMove={updatePointer}
                onPointerLeave={handlePointerLeave}
            />
        </div>
    );
}
