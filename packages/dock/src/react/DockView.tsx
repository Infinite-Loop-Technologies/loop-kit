import { useEffect, useMemo } from 'react';
import {
    InputBoundary,
    useRecognizer,
    useScope,
    useStateSlice,
} from '@loop-kit/graphite-react';
import type { DockLayoutNode, DockStateSlice } from '../facet/queries.js';
import { DOCK_FACET } from '../facet/schema.js';
import { buildDockLayoutCache, type Rect } from '../interaction/layoutCache.js';
import { createDragTabRecognizer } from '../interaction/recognizers/dragTab.js';
import { dockNodeAttrs, dockTabAttrs } from './dataAttrs.js';
import { Overlay } from './Overlay.js';

export type DockViewProps = {
    containerRect?: Rect;
};

const DEFAULT_CONTAINER: Rect = {
    x: 0,
    y: 0,
    width: 960,
    height: 540,
};

export function DockView({ containerRect = DEFAULT_CONTAINER }: DockViewProps) {
    const { scope } = useScope();
    const slice = useStateSlice<DockStateSlice>(DOCK_FACET);

    const recognizer = useMemo(() => createDragTabRecognizer(), []);
    useRecognizer(recognizer);

    const layoutCache = useMemo(
        () => buildDockLayoutCache(slice?.layoutIR ?? [], containerRect),
        [slice, containerRect],
    );

    useEffect(() => {
        scope.interactionRuntime.setHitTestProviders([
            {
                id: 'dock.layoutCache',
                hitTest: (x, y) => layoutCache.hitTest(x, y),
            },
        ]);
    }, [scope, layoutCache]);

    return (
        <InputBoundary
            style={{
                position: 'relative',
                width: containerRect.width,
                height: containerRect.height,
                overflow: 'hidden',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                background: '#f8fafc',
            }}
        >
            <div style={{ display: 'grid', gap: 8, width: '100%', height: '100%', padding: 8 }}>
                {(slice?.layoutIR ?? []).map((node) => renderGroup(node))}
            </div>
            <Overlay preview={slice?.preview} layoutCache={layoutCache} />
        </InputBoundary>
    );
}

function renderGroup(node: DockLayoutNode) {
    const splitDirection = node.splitDirection === 'vertical' ? 'column' : 'row';

    return (
        <div
            key={node.groupId}
            {...dockNodeAttrs(node.groupId)}
            style={{
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                background: '#ffffff',
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    gap: 4,
                    padding: '6px 8px',
                    background: '#e2e8f0',
                    borderBottom: '1px solid #cbd5e1',
                }}
            >
                {node.tabIds.map((tabId) => (
                    <button
                        key={tabId}
                        type="button"
                        {...dockTabAttrs(tabId)}
                        style={{
                            border: '1px solid #94a3b8',
                            borderRadius: 4,
                            padding: '4px 8px',
                            background: node.activeTabId === tabId ? '#0ea5e9' : '#f8fafc',
                            color: node.activeTabId === tabId ? '#ffffff' : '#0f172a',
                            fontSize: 12,
                        }}
                    >
                        {tabId}
                    </button>
                ))}
            </div>

            {node.children.length > 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: splitDirection, gap: 6, padding: 6 }}>
                    {node.children.map((child) => renderGroup(child))}
                </div>
            ) : (
                <div style={{ flex: 1, padding: 8, color: '#64748b', fontSize: 12 }}>Panel content</div>
            )}
        </div>
    );
}
