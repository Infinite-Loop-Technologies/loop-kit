import * as React from 'react';
import {
    SortableContext,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type {
    DockDropIndicator,
    DockGroupLayout,
    DockLayoutMap,
    DockNodeId,
    DockSplitHandleLayout,
} from '@loop-kit/dock';
import { GripVertical, X } from 'lucide-react';

function cx(...values: Array<string | undefined | false>) {
    return values.filter(Boolean).join(' ');
}

const srOnlyStyle: React.CSSProperties = {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: 1,
};

type DockTabProps = {
    active: boolean;
    groupId: DockNodeId;
    onActivate: (panelId: DockNodeId, groupId: DockNodeId) => void;
    onClose: (panelId: DockNodeId) => void;
    panelId: DockNodeId;
    title: string;
};

function DockTab({
    active,
    groupId,
    onActivate,
    onClose,
    panelId,
    title,
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

    return (
        <div
            ref={setNodeRef}
            aria-selected={active}
            data-dock-tab-group={groupId}
            data-dock-tab-id={panelId}
            data-testid={`dock-tab-${panelId}`}
            onClick={() => onActivate(panelId, groupId)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onActivate(panelId, groupId);
                }
            }}
            style={{
                alignItems: 'center',
                background: active
                    ? 'color-mix(in oklch, var(--loom-color-surface-raised) 82%, transparent)'
                    : 'transparent',
                border: `1px solid ${active ? 'var(--loom-color-border-strong)' : 'transparent'}`,
                borderRadius: 'calc(var(--loom-radius-sm) + 2px)',
                color: active ? 'var(--loom-color-text)' : 'var(--loom-color-text-muted)',
                cursor: isDragging ? 'grabbing' : 'grab',
                display: 'inline-flex',
                gap: '0.4rem',
                maxWidth: '14rem',
                minHeight: '2rem',
                minWidth: 0,
                opacity: isDragging ? 0.65 : 1,
                padding: '0 0.65rem',
                position: 'relative',
                transform: transform
                    ? CSS.Transform.toString(transform)
                    : undefined,
                transition: transition ?? 'background 140ms ease',
            }}
            {...attributes}
            {...listeners}>
            <GripVertical
                aria-hidden='true'
                size={12}
                style={{
                    color: 'var(--loom-color-text-muted)',
                    flexShrink: 0,
                }}
            />
            <span
                style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                {title}
            </span>
            <button
                onClick={(event) => {
                    event.stopPropagation();
                    onClose(panelId);
                }}
                onPointerDown={(event) => {
                    event.stopPropagation();
                }}
                style={{
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '999px',
                    color: 'inherit',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    flexShrink: 0,
                    height: '1.2rem',
                    justifyContent: 'center',
                    width: '1.2rem',
                }}
                type='button'>
                <X size={12} />
                <span style={srOnlyStyle}>Close tab</span>
            </button>
            {active ? (
                <span
                    style={{
                        background: 'var(--loom-color-accent)',
                        borderRadius: '999px',
                        bottom: '0.12rem',
                        height: 2,
                        left: '0.75rem',
                        position: 'absolute',
                        right: '0.75rem',
                    }}
                />
            ) : null}
        </div>
    );
}

type DockGroupProps = {
    activePanelId: DockNodeId | null;
    group: DockGroupLayout;
    layout: DockLayoutMap;
    onActivatePanel: (panelId: DockNodeId, groupId: DockNodeId) => void;
    onClosePanel: (panelId: DockNodeId) => void;
    panelTitle: (panelId: DockNodeId) => string;
    renderPanelBody?: (
        panelId: DockNodeId | null,
        groupId: DockNodeId,
    ) => React.ReactNode;
};

export function DockGroup({
    activePanelId,
    group,
    layout,
    onActivatePanel,
    onClosePanel,
    panelTitle,
    renderPanelBody,
}: DockGroupProps) {
    return (
        <section
            data-group-id={group.id}
            data-layout-node={layout.nodes[group.id]?.kind}
            data-panel-count={group.panelIds.length}
            data-testid={`dock-group-${group.id}`}
            style={{
                background:
                    'color-mix(in oklch, var(--loom-color-surface) 88%, transparent)',
                border: '1px solid var(--loom-color-border)',
                borderRadius: 'var(--loom-radius-lg)',
                boxShadow: 'var(--loom-shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                inset: `${group.rect.y}px auto auto ${group.rect.x}px`,
                overflow: 'hidden',
                position: 'absolute',
                width: `${group.rect.width}px`,
                height: `${group.rect.height}px`,
            }}>
            <header
                data-testid={`dock-group-header-${group.id}`}
                style={{
                    alignItems: 'center',
                    background:
                        'color-mix(in oklch, var(--loom-color-surface-sunken) 74%, transparent)',
                    borderBottom: '1px solid var(--loom-color-border)',
                    display: 'flex',
                    gap: '0.35rem',
                    minHeight: '2rem',
                    overflow: 'hidden',
                    padding: '0.35rem',
                }}>
                <SortableContext
                    items={group.panelIds}
                    strategy={horizontalListSortingStrategy}>
                    {group.panelIds.map((panelId) => (
                        <DockTab
                            key={panelId}
                            active={panelId === activePanelId}
                            groupId={group.id}
                            onActivate={onActivatePanel}
                            onClose={onClosePanel}
                            panelId={panelId}
                            title={panelTitle(panelId)}
                        />
                    ))}
                </SortableContext>
            </header>

            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflow: 'auto',
                    padding: '0.9rem',
                }}>
                {renderPanelBody ? (
                    renderPanelBody(activePanelId, group.id)
                ) : activePanelId ? (
                    <div style={{ display: 'grid', gap: '0.35rem' }}>
                        <strong>{panelTitle(activePanelId)}</strong>
                        <span
                            style={{
                                color: 'var(--loom-color-text-muted)',
                                fontSize: '0.78rem',
                            }}>
                            {activePanelId}
                        </span>
                    </div>
                ) : (
                    <span style={{ color: 'var(--loom-color-text-muted)' }}>
                        Empty group
                    </span>
                )}
            </div>
        </section>
    );
}

type DockSplitHandleProps = {
    active?: boolean;
    handle: DockSplitHandleLayout;
    onPointerDown: (
        event: React.PointerEvent<HTMLButtonElement>,
        handle: DockSplitHandleLayout,
    ) => void;
};

export function DockSplitHandle({
    active = false,
    handle,
    onPointerDown,
}: DockSplitHandleProps) {
    const vertical = handle.direction === 'row';

    return (
        <button
            data-handle-id={handle.id}
            data-testid={`dock-split-handle-${handle.id}`}
            onPointerDown={(event) => onPointerDown(event, handle)}
            style={{
                background: 'transparent',
                border: 'none',
                cursor: vertical ? 'col-resize' : 'row-resize',
                inset: `${handle.rect.y}px auto auto ${handle.rect.x}px`,
                padding: 0,
                position: 'absolute',
                width: `${handle.rect.width}px`,
                height: `${handle.rect.height}px`,
                zIndex: 20,
            }}
            type='button'>
            <span
                aria-hidden='true'
                style={{
                    background: active
                        ? 'var(--loom-color-accent)'
                        : 'var(--loom-color-border-strong)',
                    borderRadius: '999px',
                    inset: vertical
                        ? '0.35rem auto 0.35rem 50%'
                        : '50% 0.35rem auto 0.35rem',
                    position: 'absolute',
                    transform: vertical
                        ? 'translateX(-50%)'
                        : 'translateY(-50%)',
                    width: vertical ? 2 : undefined,
                    height: vertical ? undefined : 2,
                }}
            />
            <span style={srOnlyStyle}>Resize split</span>
        </button>
    );
}

type DockOverlayProps = {
    indicator: DockDropIndicator | null;
    showLabel?: boolean;
};

export function DockOverlay({
    indicator,
    showLabel = false,
}: DockOverlayProps) {
    if (!indicator) {
        return null;
    }

    return (
        <div
            data-dock-indicator-kind={indicator.kind}
            data-dock-indicator-label={indicator.label}
            data-testid='dock-drop-indicator'
            style={{
                background:
                    indicator.kind === 'zone'
                        ? 'color-mix(in oklch, var(--loom-color-accent) 18%, transparent)'
                        : 'var(--loom-color-accent)',
                border:
                    indicator.kind === 'zone'
                        ? '1px solid color-mix(in oklch, var(--loom-color-accent) 75%, white 10%)'
                        : 'none',
                borderRadius:
                    indicator.kind === 'zone'
                        ? 'var(--loom-radius-md)'
                        : '999px',
                boxShadow:
                    indicator.kind === 'line'
                        ? '0 0 0 1px color-mix(in oklch, var(--loom-color-surface) 70%, white 20%)'
                        : undefined,
                inset: `${indicator.rect.y}px auto auto ${indicator.rect.x}px`,
                pointerEvents: 'none',
                position: 'absolute',
                width: `${indicator.rect.width}px`,
                height: `${indicator.rect.height}px`,
                zIndex: 30,
            }}>
            {showLabel ? (
                <span
                    style={{
                        background: 'var(--loom-color-accent)',
                        borderRadius: '999px',
                        color: 'var(--loom-color-accent-text)',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        left: 0,
                        letterSpacing: '0.08em',
                        padding: '0.2rem 0.45rem',
                        position: 'absolute',
                        textTransform: 'uppercase',
                        top: '-1.6rem',
                    }}>
                    {indicator.label}
                </span>
            ) : null}
        </div>
    );
}
