// oxlint-disable no-empty-file
/**
 * # PLAN
 * I'm gonna figure out a good workflow that I don't hate for UI stuff.
 * Probably CSS-in-TS. Maybe design tokens.
 *
 */

import { useRef, useEffect, useState } from 'react';
import {
    draggable,
    dropTargetForElements,
    monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';

export default function () {
    return (
        <>
            <DraggableThingy />
            <DraggableThingy />
            <DropArea />
        </>
    );
}

function DraggableThingy() {
    const ref = useRef(null);
    // Idea: def build hooks and comps for common dnd stuff
    useEffect(() => {
        const el = ref.current;

        return combine(
            draggable({
                element: el!,
            }),
            monitorForElements({})
        );
    }, []);

    return <div ref={ref} className='w-30 h-30 bg-green-400 rounded-2xl'></div>;
}
function DropArea() {
    const ref = useRef(null);
    // Idea: def build hooks and comps for common dnd stuff
    useEffect(() => {
        const el = ref.current;
        return dropTargetForElements({ element: el! });
    }, []);

    return <div ref={ref} className='w-30 h-30 bg-red-400 rounded-2xl'></div>;
}
