'use client';

import * as React from 'react';
import {
    ChevronDown,
    ChevronRight,
    Link2,
    Plus,
    Rows3,
    Undo2,
    Redo2,
} from 'lucide-react';
import {
    GraphiteProvider,
    useHistory,
    useIntent,
    useQuery,
} from '@loop-kit/graphite/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { OutlineDocument, OutlineNode, outlineModel } from './outline-model';
import {
    createGraphiteOutlineStore,
    type OutlineGraphiteState,
} from '../../../systems/graphite-outline';

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
        node: OutlineNode,
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
                'group flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors',
                isActive ? 'bg-accent/60' : 'hover:bg-accent/30',
            )}
            style={{ paddingLeft: `${depth * 18 + 8}px` }}>
            {hasChildren ? (
                <button
                    type='button'
                    className='inline-flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent'
                    onClick={() => onToggleCollapsed(node.id)}
                    aria-label={
                        node.collapsed ? 'Expand children' : 'Collapse children'
                    }>
                    {node.collapsed ? (
                        <ChevronRight className='size-3.5' />
                    ) : (
                        <ChevronDown className='size-3.5' />
                    )}
                </button>
            ) : (
                <span className='inline-flex size-5 items-center justify-center' />
            )}

            <button
                type='button'
                className={cn(
                    'inline-flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent',
                    isZoomRoot && 'text-primary',
                )}
                onClick={() => onZoom(node.id)}
                aria-label='Zoom into node'>
                <span
                    className={cn(
                        'size-2 rounded-full bg-current',
                        isZoomRoot && 'ring-2 ring-primary/30',
                    )}
                />
            </button>

            <Input
                ref={(input) => registerInput(node.id, input)}
                value={resolvedText}
                onFocus={() => onFocus(node.id)}
                onChange={(event) => onChangeText(node.id, event.target.value)}
                onKeyDown={(event) => onKeyDown(event, node)}
                className={cn(
                    'h-8 border-0 bg-transparent px-2 shadow-none dark:bg-transparent focus-visible:bg-accent/55 focus-visible:ring-0',
                    isReference && 'italic',
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

function extractFocusRequest(metadata: unknown): FocusRequest | null {
    if (!metadata || typeof metadata !== 'object') return null;
    const raw = metadata as Record<string, unknown>;
    const id = raw.focusId;
    if (typeof id !== 'string' || id.length === 0) return null;
    return {
        id,
        atEnd: raw.focusAtEnd === true,
    };
}

function OutlineEditorScene() {
    const dispatchIntent = useIntent<OutlineGraphiteState>();
    const history = useHistory<OutlineGraphiteState>();
    const doc = useQuery<OutlineGraphiteState, OutlineDocument>(
        (state) => state.doc,
    );
    const rows = useQuery<
        OutlineGraphiteState,
        { id: string; depth: number }[]
    >((state) => outlineModel.listVisibleRows(state.doc));
    const breadcrumb = useQuery<OutlineGraphiteState, string[]>((state) =>
        outlineModel.getBreadcrumb(state.doc),
    );

    const [activeId, setActiveId] = React.useState<string | null>(null);
    const [focusRequest, setFocusRequest] = React.useState<FocusRequest | null>(
        null,
    );
    const inputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

    const zoomRoot = doc.nodes[doc.zoomRootId];
    const zoomRootLabel =
        doc.zoomRootId === doc.rootId
            ? 'Workspace'
            : outlineModel.getResolvedText(doc, doc.zoomRootId) || 'Untitled';

    const registerInput = React.useCallback(
        (id: string, node: HTMLInputElement | null) => {
            inputRefs.current[id] = node;
        },
        [],
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

    const runIntent = React.useCallback(
        (name: string, payload: unknown) => {
            const record = dispatchIntent(name, payload);
            if (!record) return;
            const request = extractFocusRequest(record.metadata);
            if (request) {
                setFocusRequest(request);
            }
        },
        [dispatchIntent],
    );

    const handleChangeText = React.useCallback(
        (id: string, text: string) => {
            runIntent('outline/set-text', { id, text });
        },
        [runIntent],
    );

    const handleAddChild = React.useCallback(
        (id: string) => {
            runIntent('outline/insert-child', { parentId: id });
        },
        [runIntent],
    );

    const handleAddReference = React.useCallback(
        (id: string) => {
            runIntent('outline/add-reference-after', { id });
        },
        [runIntent],
    );

    const handleKeyboard = React.useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>, node: OutlineNode) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                runIntent('outline/insert-sibling-after', { id: node.id });
                return;
            }

            if (event.key === 'Tab') {
                event.preventDefault();
                runIntent(
                    event.shiftKey ? 'outline/outdent' : 'outline/indent',
                    {
                        id: node.id,
                    },
                );
                return;
            }

            if (
                event.key === 'Backspace' &&
                event.currentTarget.value.length === 0
            ) {
                event.preventDefault();
                runIntent('outline/delete', { id: node.id });
                return;
            }

            if (
                event.key === 'ArrowLeft' &&
                node.childIds.length > 0 &&
                !node.collapsed
            ) {
                event.preventDefault();
                runIntent('outline/toggle-collapsed', { id: node.id });
            }

            if (
                event.key === 'ArrowRight' &&
                node.childIds.length > 0 &&
                node.collapsed
            ) {
                event.preventDefault();
                runIntent('outline/toggle-collapsed', { id: node.id });
            }
        },
        [runIntent],
    );

    const activeLabel = activeId
        ? outlineModel.getResolvedText(doc, activeId)
        : null;

    return (
        <div className='space-y-4'>
            <div className='flex flex-wrap items-center gap-2 rounded-lg border bg-card/60 p-2'>
                <div className='flex min-w-0 items-center gap-1 text-sm text-muted-foreground'>
                    {breadcrumb.map((id, index) => {
                        const label =
                            id === doc.rootId
                                ? 'Workspace'
                                : outlineModel.getResolvedText(doc, id) ||
                                  'Untitled';

                        return (
                            <React.Fragment key={id}>
                                {index > 0 ? (
                                    <span className='text-muted-foreground/60'>
                                        /
                                    </span>
                                ) : null}
                                <button
                                    type='button'
                                    className={cn(
                                        'truncate rounded px-1.5 py-0.5 hover:bg-accent',
                                        id === doc.zoomRootId &&
                                            'text-foreground font-medium',
                                    )}
                                    onClick={() =>
                                        runIntent('outline/zoom-to', { id })
                                    }>
                                    {label}
                                </button>
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className='ml-auto flex items-center gap-2'>
                    {activeLabel ? (
                        <Badge
                            variant='secondary'
                            className='max-w-[14rem] truncate'>
                            {activeLabel}
                        </Badge>
                    ) : null}
                    <Button
                        size='sm'
                        variant='outline'
                        onClick={() => runIntent('outline/zoom-out', undefined)}
                        disabled={doc.zoomRootId === doc.rootId}>
                        Zoom Out
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        onClick={() =>
                            runIntent('outline/insert-child', {
                                parentId: doc.zoomRootId,
                            })
                        }>
                        <Plus className='mr-1 size-4' />
                        New Item
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        onClick={() => history.undo()}
                        disabled={!history.canUndo}>
                        <Undo2 className='mr-1 size-4' />
                        Undo
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        onClick={() => history.redo()}
                        disabled={!history.canRedo}>
                        <Redo2 className='mr-1 size-4' />
                        Redo
                    </Button>
                    <Button
                        size='sm'
                        variant='secondary'
                        onClick={() => {
                            runIntent('outline/reset-sample', undefined);
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
                    <span className='font-medium text-foreground'>
                        Outliner
                    </span>
                    <span className='mx-2 text-muted-foreground/60'>-</span>
                    <span>
                        Graphite-powered outline: Tab/Shift+Tab to nest, Enter
                        for sibling, bullet icon to zoom. Reference nodes map to
                        graph links.
                    </span>
                </div>

                <div className='p-2'>
                    <div className='px-2 pb-2'>
                        <h2 className='truncate text-base font-semibold text-foreground'>
                            {zoomRootLabel}
                        </h2>
                    </div>
                    {rows.length === 0 ? (
                        <div className='rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground'>
                            No items inside{' '}
                            <strong className='font-medium text-foreground'>
                                {zoomRootLabel || zoomRoot?.text || 'this node'}
                            </strong>
                            . Add a child to start outlining.
                        </div>
                    ) : (
                        <div className='space-y-0'>
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
                                            runIntent('outline/zoom-to', { id })
                                        }
                                        onToggleCollapsed={(id) =>
                                            runIntent(
                                                'outline/toggle-collapsed',
                                                { id },
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

export default function OutlineEditor() {
    const store = React.useMemo(() => createGraphiteOutlineStore(), []);
    return (
        <GraphiteProvider store={store}>
            <OutlineEditorScene />
        </GraphiteProvider>
    );
}
