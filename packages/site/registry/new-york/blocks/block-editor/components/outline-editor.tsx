'use client';

import * as React from 'react';
import {
    ChevronDown,
    ChevronRight,
    Link2,
    Plus,
    Rows3,
    ZoomIn,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { OutlineDocument, OutlineNode, outlineModel } from './outline-model';

type FocusRequest = {
    id: string;
    atEnd?: boolean;
};

type OutlineRowProps = {
    doc: OutlineDocument;
    node: OutlineNode;
    depth: number;
    isActive: boolean;
    isZoomRoot: boolean;
    onFocus: (id: string) => void;
    onZoom: (id: string) => void;
    onToggleCollapsed: (id: string) => void;
    onAddChild: (id: string) => void;
    onAddReference: (id: string) => void;
    onChangeText: (id: string, text: string) => void;
    onKeyDown: (
        event: React.KeyboardEvent<HTMLInputElement>,
        node: OutlineNode
    ) => void;
    registerInput: (id: string, node: HTMLInputElement | null) => void;
};

function OutlineRow({
    doc,
    node,
    depth,
    isActive,
    isZoomRoot,
    onFocus,
    onZoom,
    onToggleCollapsed,
    onAddChild,
    onAddReference,
    onChangeText,
    onKeyDown,
    registerInput,
}: OutlineRowProps) {
    const resolvedText = outlineModel.getResolvedText(doc, node.id);
    const hasChildren = node.childIds.length > 0;
    const isReference = node.kind === 'reference';

    return (
        <div
            className={cn(
                'group flex items-center gap-2 rounded-md px-2 py-1.5',
                isActive && 'bg-accent/60'
            )}
            style={{ paddingLeft: `${depth * 18 + 8}px` }}>
            <button
                type='button'
                className='inline-flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent'
                onClick={() => {
                    if (hasChildren) {
                        onToggleCollapsed(node.id);
                    }
                }}
                aria-label={hasChildren ? 'Toggle children' : 'No children'}>
                {hasChildren ? (
                    node.collapsed ? (
                        <ChevronRight className='size-3.5' />
                    ) : (
                        <ChevronDown className='size-3.5' />
                    )
                ) : (
                    <span className='size-1.5 rounded-full bg-muted-foreground/70' />
                )}
            </button>

            <button
                type='button'
                className={cn(
                    'inline-flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent',
                    isZoomRoot && 'text-primary'
                )}
                onClick={() => onZoom(node.id)}
                aria-label='Zoom into node'>
                <ZoomIn className='size-3.5' />
            </button>

            <Input
                ref={(input) => registerInput(node.id, input)}
                value={resolvedText}
                onFocus={() => onFocus(node.id)}
                onChange={(event) => onChangeText(node.id, event.target.value)}
                onKeyDown={(event) => onKeyDown(event, node)}
                className={cn(
                    'h-8 border-0 bg-transparent px-2 shadow-none focus-visible:ring-1',
                    isReference && 'italic'
                )}
                placeholder='Untitled'
            />

            {isReference ? (
                <Badge variant='outline' className='h-5 px-1.5 text-[10px]'>
                    ref
                </Badge>
            ) : null}

            <button
                type='button'
                className='inline-flex size-6 items-center justify-center rounded text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-accent'
                onClick={() => onAddReference(node.id)}
                aria-label='Add reference node'>
                <Link2 className='size-3.5' />
            </button>
            <button
                type='button'
                className='inline-flex size-6 items-center justify-center rounded text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-accent'
                onClick={() => onAddChild(node.id)}
                aria-label='Add child node'>
                <Plus className='size-3.5' />
            </button>
        </div>
    );
}

export default function OutlineEditor() {
    const [doc, setDoc] = React.useState<OutlineDocument>(() =>
        outlineModel.createSample()
    );
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const [focusRequest, setFocusRequest] = React.useState<FocusRequest | null>(null);
    const inputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

    const rows = React.useMemo(() => outlineModel.listVisibleRows(doc), [doc]);
    const breadcrumb = React.useMemo(() => outlineModel.getBreadcrumb(doc), [doc]);
    const zoomRoot = doc.nodes[doc.zoomRootId];

    const registerInput = React.useCallback(
        (id: string, node: HTMLInputElement | null) => {
            inputRefs.current[id] = node;
        },
        []
    );

    React.useEffect(() => {
        if (!focusRequest) return;

        const target = inputRefs.current[focusRequest.id];
        if (target) {
            target.focus();
            if (focusRequest.atEnd) {
                const valueLength = target.value.length;
                target.setSelectionRange(valueLength, valueLength);
            }
            setActiveId(focusRequest.id);
        }

        setFocusRequest(null);
    }, [doc, focusRequest]);

    const apply = React.useCallback(
        (updater: (current: OutlineDocument) => OutlineDocument) => {
            setDoc((current) => updater(current));
        },
        []
    );

    const handleChangeText = React.useCallback(
        (id: string, text: string) => {
            apply((current) => outlineModel.setNodeText(current, id, text));
        },
        [apply]
    );

    const handleAddChild = React.useCallback(
        (id: string) => {
            apply((current) => {
                const result = outlineModel.insertChild(current, id);
                setFocusRequest({ id: result.newNodeId });
                return result.doc;
            });
        },
        [apply]
    );

    const handleAddReference = React.useCallback(
        (id: string) => {
            apply((current) => {
                const result = outlineModel.addReferenceAfter(current, id);
                setFocusRequest({ id: result.newNodeId, atEnd: true });
                return result.doc;
            });
        },
        [apply]
    );

    const handleKeyboard = React.useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>, node: OutlineNode) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                apply((current) => {
                    const result = outlineModel.insertSiblingAfter(current, node.id);
                    setFocusRequest({ id: result.newNodeId });
                    return result.doc;
                });
                return;
            }

            if (event.key === 'Tab') {
                event.preventDefault();
                apply((current) =>
                    event.shiftKey
                        ? outlineModel.outdentNode(current, node.id)
                        : outlineModel.indentNode(current, node.id)
                );
                setFocusRequest({ id: node.id });
                return;
            }

            if (event.key === 'Backspace' && event.currentTarget.value.length === 0) {
                event.preventDefault();
                apply((current) => {
                    const result = outlineModel.deleteNode(current, node.id);
                    if (result.nextFocusId) {
                        setFocusRequest({ id: result.nextFocusId, atEnd: true });
                    }
                    return result.doc;
                });
                return;
            }

            if (event.key === 'ArrowLeft' && node.childIds.length > 0 && !node.collapsed) {
                event.preventDefault();
                apply((current) => outlineModel.toggleCollapsed(current, node.id));
            }

            if (event.key === 'ArrowRight' && node.childIds.length > 0 && node.collapsed) {
                event.preventDefault();
                apply((current) => outlineModel.toggleCollapsed(current, node.id));
            }
        },
        [apply]
    );

    const activeLabel = activeId ? outlineModel.getResolvedText(doc, activeId) : null;

    return (
        <div className='space-y-4'>
            <div className='flex flex-wrap items-center gap-2 rounded-lg border bg-card/60 p-2'>
                <div className='flex min-w-0 items-center gap-1 text-sm text-muted-foreground'>
                    {breadcrumb.map((id, index) => {
                        const label =
                            id === doc.rootId
                                ? 'Workspace'
                                : outlineModel.getResolvedText(doc, id) || 'Untitled';

                        return (
                            <React.Fragment key={id}>
                                {index > 0 ? (
                                    <span className='text-muted-foreground/60'>/</span>
                                ) : null}
                                <button
                                    type='button'
                                    className={cn(
                                        'truncate rounded px-1.5 py-0.5 hover:bg-accent',
                                        id === doc.zoomRootId &&
                                            'text-foreground font-medium'
                                    )}
                                    onClick={() =>
                                        apply((current) =>
                                            outlineModel.zoomTo(current, id)
                                        )
                                    }>
                                    {label}
                                </button>
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className='ml-auto flex items-center gap-2'>
                    {activeLabel ? (
                        <Badge variant='secondary' className='max-w-[14rem] truncate'>
                            {activeLabel}
                        </Badge>
                    ) : null}
                    <Button
                        size='sm'
                        variant='outline'
                        onClick={() => apply((current) => outlineModel.zoomOut(current))}
                        disabled={doc.zoomRootId === doc.rootId}>
                        Zoom Out
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        onClick={() =>
                            apply((current) => {
                                const result = outlineModel.insertChild(
                                    current,
                                    current.zoomRootId
                                );
                                setFocusRequest({ id: result.newNodeId });
                                return result.doc;
                            })
                        }>
                        <Plus className='mr-1 size-4' />
                        New Item
                    </Button>
                    <Button
                        size='sm'
                        variant='secondary'
                        onClick={() => {
                            const sample = outlineModel.createSample();
                            setDoc(sample);
                            setActiveId(null);
                            setFocusRequest(null);
                        }}>
                        <Rows3 className='mr-1 size-4' />
                        Reset Sample
                    </Button>
                </div>
            </div>

            <div className='rounded-xl border bg-card'>
                <div className='border-b px-3 py-2 text-sm text-muted-foreground'>
                    <span className='font-medium text-foreground'>Outliner</span>
                    <span className='mx-2 text-muted-foreground/60'>-</span>
                    <span>
                        Tab/Shift+Tab to nest, Enter for sibling, icon to zoom. Reference
                        nodes mirror the source node.
                    </span>
                </div>

                <div className='p-2'>
                    {rows.length === 0 ? (
                        <div className='rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground'>
                            No items inside{' '}
                            <strong className='font-medium text-foreground'>
                                {zoomRoot?.text || 'this node'}
                            </strong>
                            . Add a child to start outlining.
                        </div>
                    ) : (
                        <div className='space-y-0.5'>
                            {rows.map((row) => {
                                const node = doc.nodes[row.id];
                                if (!node) return null;

                                return (
                                    <OutlineRow
                                        key={row.id}
                                        doc={doc}
                                        node={node}
                                        depth={row.depth}
                                        isActive={activeId === node.id}
                                        isZoomRoot={doc.zoomRootId === node.id}
                                        onFocus={setActiveId}
                                        onZoom={(id) =>
                                            apply((current) =>
                                                outlineModel.zoomTo(current, id)
                                            )
                                        }
                                        onToggleCollapsed={(id) =>
                                            apply((current) =>
                                                outlineModel.toggleCollapsed(
                                                    current,
                                                    id
                                                )
                                            )
                                        }
                                        onAddChild={handleAddChild}
                                        onAddReference={handleAddReference}
                                        onChangeText={handleChangeText}
                                        onKeyDown={handleKeyboard}
                                        registerInput={registerInput}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
