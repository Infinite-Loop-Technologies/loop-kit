'use client';

import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    SortableContext,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import type {
    DockDropIndicator,
    DockGroupLayout,
    DockLayoutMap,
    DockNodeId,
    DockSplitHandleLayout,
} from '@loop-kit/dock';
import { GripVertical, X } from 'lucide-react';

import { cn } from '@/lib/utils';

type DockTabProps = {
    panelId: DockNodeId;
    groupId: DockNodeId;
    title: string;
    active: boolean;
    onActivate: (panelId: DockNodeId, groupId: DockNodeId) => void;
    onClose: (panelId: DockNodeId) => void;
};

function DockTab({
    panelId,
    groupId,
    title,
    active,
    onActivate,
    onClose,
}: DockTabProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: panelId,
        data: {
            type: 'panel',
            panelId,
            groupId,
        },
    });

    const style: React.CSSProperties = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition: transition ?? undefined,
    };

    return (
        <div
            ref={setNodeRef}
            aria-selected={active}
            data-dock-tab-id={panelId}
            data-dock-tab-group={groupId}
            style={style}
            className={cn(
                'group relative inline-flex h-8 min-w-0 items-center gap-1 rounded-sm px-2 text-xs',
                'border border-transparent bg-transparent text-muted-foreground',
                'transition-colors hover:bg-accent/35 hover:text-foreground',
                active && 'bg-background/60 text-foreground',
                isDragging &&
                    'border-dashed border-border/80 bg-muted/40 text-transparent shadow-none',
            )}
            onClick={() => onActivate(panelId, groupId)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onActivate(panelId, groupId);
                }
            }}
            {...attributes}
            {...listeners}>
            <GripVertical
                className={cn(
                    'h-3 w-3 shrink-0 text-muted-foreground/70',
                    isDragging && 'opacity-40',
                )}
            />
            <span className='truncate'>{title}</span>
            <button
                type='button'
                className={cn(
                    'ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground',
                    'transition-opacity hover:bg-accent hover:text-foreground',
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                )}
                onPointerDown={(event) => {
                    event.stopPropagation();
                }}
                onClick={(event) => {
                    event.stopPropagation();
                    onClose(panelId);
                }}>
                <X className='h-3 w-3' />
                <span className='sr-only'>Close tab</span>
            </button>
            {active ? (
                <span className='pointer-events-none absolute inset-x-2 bottom-0 h-px rounded-full bg-foreground/70' />
            ) : null}
        </div>
    );
}

type DockGroupProps = {
    group: DockGroupLayout;
    layout: DockLayoutMap;
    activePanelId: DockNodeId | null;
    panelTitle: (panelId: DockNodeId) => string;
    onActivatePanel: (panelId: DockNodeId, groupId: DockNodeId) => void;
    onClosePanel: (panelId: DockNodeId) => void;
    renderPanelBody?: (panelId: DockNodeId | null, groupId: DockNodeId) => React.ReactNode;
};

export function DockGroup({
    group,
    layout,
    activePanelId,
    panelTitle,
    onActivatePanel,
    onClosePanel,
    renderPanelBody,
}: DockGroupProps) {
    const groupStyle: React.CSSProperties = {
        left: group.rect.x,
        top: group.rect.y,
        width: group.rect.width,
        height: group.rect.height,
    };

    return (
        <section
            className='absolute overflow-hidden rounded-md border border-border/80 bg-card/90 shadow-sm'
            style={groupStyle}
            data-group-id={group.id}
            data-panel-count={group.panelIds.length}
            data-layout-node={layout.nodes[group.id]?.kind}>
            <header className='flex h-8 items-center gap-1 border-b border-border/70 bg-muted/25 px-1'>
                <SortableContext
                    items={group.panelIds}
                    strategy={horizontalListSortingStrategy}>
                    {group.panelIds.map((panelId) => (
                        <DockTab
                            key={panelId}
                            panelId={panelId}
                            groupId={group.id}
                            title={panelTitle(panelId)}
                            active={panelId === activePanelId}
                            onActivate={onActivatePanel}
                            onClose={onClosePanel}
                        />
                    ))}
                </SortableContext>
            </header>

            <div className='h-[calc(100%-2rem)] overflow-hidden p-3 text-xs text-muted-foreground'>
                {renderPanelBody ? (
                    renderPanelBody(activePanelId, group.id)
                ) : activePanelId ? (
                    <div className='space-y-1'>
                        <p className='text-sm text-foreground'>
                            {panelTitle(activePanelId)}
                        </p>
                        <p className='text-[11px]'>{activePanelId}</p>
                    </div>
                ) : (
                    <p>Empty group</p>
                )}
            </div>
        </section>
    );
}

type DockSplitHandleProps = {
    handle: DockSplitHandleLayout;
    active?: boolean;
    onPointerDown: (
        event: React.PointerEvent<HTMLButtonElement>,
        handle: DockSplitHandleLayout,
    ) => void;
};

export function DockSplitHandle({
    handle,
    active = false,
    onPointerDown,
}: DockSplitHandleProps) {
    const style: React.CSSProperties = {
        left: handle.rect.x,
        top: handle.rect.y,
        width: handle.rect.width,
        height: handle.rect.height,
    };

    const vertical = handle.direction === 'row';

    return (
        <button
            type='button'
            data-handle-id={handle.id}
            className={cn(
                'group absolute z-20 rounded-sm bg-transparent',
                vertical ? 'cursor-col-resize' : 'cursor-row-resize',
            )}
            style={style}
            onPointerDown={(event) => onPointerDown(event, handle)}>
            <span
                className={cn(
                    'pointer-events-none absolute rounded-full bg-border/70 transition-colors duration-150',
                    vertical
                        ? 'bottom-2 left-1/2 top-2 w-px -translate-x-1/2'
                        : 'left-2 right-2 top-1/2 h-px -translate-y-1/2',
                    'group-hover:bg-primary/75',
                    active && 'bg-primary',
                )}
            />
            <span className='sr-only'>Resize split</span>
        </button>
    );
}

type DockOverlayProps = {
    indicator: DockDropIndicator | null;
    showLabel?: boolean;
};

export function DockOverlay({ indicator, showLabel = false }: DockOverlayProps) {
    if (!indicator) return null;

    return (
        <div
            className={cn(
                'pointer-events-none absolute z-30',
                indicator.kind === 'zone'
                    ? 'rounded-md border border-primary/80 bg-primary/15'
                    : 'rounded-sm bg-primary shadow-[0_0_0_1px_hsl(var(--background))]',
            )}
            style={{
                left: indicator.rect.x,
                top: indicator.rect.y,
                width: indicator.rect.width,
                height: indicator.rect.height,
            }}>
            {showLabel ? (
                <span className='absolute -top-6 left-0 rounded bg-primary/85 px-1.5 py-0.5 text-[10px] font-medium uppercase text-primary-foreground'>
                    {indicator.label}
                </span>
            ) : null}
        </div>
    );
}
