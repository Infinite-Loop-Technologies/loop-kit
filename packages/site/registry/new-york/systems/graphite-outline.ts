import {
    $set,
    createGraphStore,
    type GraphNode,
    type GraphState,
    type GraphiteRuntime,
} from '@loop-kit/graphite';

import {
    outlineModel,
    type OutlineDocument,
} from '../blocks/block-editor/components/outline-model';

export interface OutlineGraphiteState extends GraphState {
    doc: OutlineDocument;
    graphNodes: Record<string, GraphNode>;
}

function toGraphNodes(doc: OutlineDocument): Record<string, GraphNode> {
    const graphNodes: Record<string, GraphNode> = {};

    for (const node of Object.values(doc.nodes)) {
        const links: Record<string, string[]> = {};
        if (node.parentId) {
            links.parent = [node.parentId];
        }
        if (node.childIds.length > 0) {
            links.children = [...node.childIds];
        }
        if (node.kind === 'reference' && node.targetId) {
            links.refersTo = [node.targetId];
        }

        graphNodes[node.id] = {
            id: node.id,
            type: node.kind,
            data: {
                text: node.text,
                collapsed: node.collapsed,
                zoomRoot: doc.zoomRootId === node.id,
            },
            links,
        };
    }

    return graphNodes;
}

function createOutlineState(
    doc = outlineModel.createSample(),
): OutlineGraphiteState {
    return {
        doc,
        graphNodes: toGraphNodes(doc),
    };
}

function patchFromDoc(doc: OutlineDocument) {
    return {
        doc: $set(doc),
        graphNodes: $set(toGraphNodes(doc)),
    };
}

function bool(value: unknown) {
    return Boolean(value);
}

export function createGraphiteOutlineStore() {
    const store = createGraphStore<OutlineGraphiteState>({
        initialState: createOutlineState(),
        eventMode: 'when-observed',
        maxCommits: 300,
    });

    registerOutlineIntents(store);
    return store;
}

export function registerOutlineIntents(
    store: GraphiteRuntime<OutlineGraphiteState>,
) {
    store.registerIntent(
        'outline/set-text',
        (payload: { id?: string; text?: string }, { state }) => {
            if (!payload.id) return null;
            const nextDoc = outlineModel.setNodeText(
                state.doc,
                payload.id,
                payload.text ?? '',
            );
            if (nextDoc === state.doc) return null;

            return {
                patch: patchFromDoc(nextDoc),
                event: { name: 'outline.text.updated' },
            };
        },
    );

    store.registerIntent(
        'outline/insert-sibling-after',
        (payload: { id?: string }, { state }) => {
            if (!payload.id) return null;
            const result = outlineModel.insertSiblingAfter(
                state.doc,
                payload.id,
            );
            if (result.doc === state.doc) return null;
            return {
                patch: patchFromDoc(result.doc),
                metadata: {
                    focusId: result.newNodeId,
                },
                event: { name: 'outline.node.inserted.sibling' },
            };
        },
    );

    store.registerIntent(
        'outline/insert-child',
        (payload: { parentId?: string }, { state }) => {
            if (!payload.parentId) return null;
            const result = outlineModel.insertChild(
                state.doc,
                payload.parentId,
            );
            if (result.doc === state.doc) return null;
            return {
                patch: patchFromDoc(result.doc),
                metadata: {
                    focusId: result.newNodeId,
                },
                event: { name: 'outline.node.inserted.child' },
            };
        },
    );

    store.registerIntent(
        'outline/add-reference-after',
        (payload: { id?: string }, { state }) => {
            if (!payload.id) return null;
            const result = outlineModel.addReferenceAfter(
                state.doc,
                payload.id,
            );
            if (result.doc === state.doc) return null;
            return {
                patch: patchFromDoc(result.doc),
                metadata: {
                    focusId: result.newNodeId,
                    focusAtEnd: true,
                },
                event: { name: 'outline.reference.inserted' },
            };
        },
    );

    store.registerIntent(
        'outline/indent',
        (payload: { id?: string }, { state }) => {
            if (!payload.id) return null;
            const nextDoc = outlineModel.indentNode(state.doc, payload.id);
            if (nextDoc === state.doc) return null;
            return {
                patch: patchFromDoc(nextDoc),
                metadata: {
                    focusId: payload.id,
                },
                event: { name: 'outline.node.indented' },
            };
        },
    );

    store.registerIntent(
        'outline/outdent',
        (payload: { id?: string }, { state }) => {
            if (!payload.id) return null;
            const nextDoc = outlineModel.outdentNode(state.doc, payload.id);
            if (nextDoc === state.doc) return null;
            return {
                patch: patchFromDoc(nextDoc),
                metadata: {
                    focusId: payload.id,
                },
                event: { name: 'outline.node.outdented' },
            };
        },
    );

    store.registerIntent(
        'outline/delete',
        (payload: { id?: string }, { state }) => {
            if (!payload.id) return null;
            const result = outlineModel.deleteNode(state.doc, payload.id);
            if (result.doc === state.doc) return null;
            return {
                patch: patchFromDoc(result.doc),
                metadata: {
                    focusId: result.nextFocusId ?? undefined,
                    focusAtEnd: true,
                },
                event: { name: 'outline.node.deleted' },
            };
        },
    );

    store.registerIntent(
        'outline/toggle-collapsed',
        (payload: { id?: string }, { state }) => {
            if (!payload.id) return null;
            const nextDoc = outlineModel.toggleCollapsed(state.doc, payload.id);
            if (nextDoc === state.doc) return null;
            return {
                patch: patchFromDoc(nextDoc),
                event: { name: 'outline.node.collapsed.toggled' },
            };
        },
    );

    store.registerIntent(
        'outline/zoom-to',
        (payload: { id?: string }, { state }) => {
            if (!payload.id) return null;
            const nextDoc = outlineModel.zoomTo(state.doc, payload.id);
            if (nextDoc === state.doc) return null;
            return {
                patch: patchFromDoc(nextDoc),
                event: { name: 'outline.zoom.changed' },
            };
        },
    );

    store.registerIntent('outline/zoom-out', (_payload, { state }) => {
        const nextDoc = outlineModel.zoomOut(state.doc);
        if (nextDoc === state.doc) return null;
        return {
            patch: patchFromDoc(nextDoc),
            event: { name: 'outline.zoom.changed' },
        };
    });

    store.registerIntent('outline/reset-sample', (_payload) => {
        const sample = outlineModel.createSample();
        return {
            patch: patchFromDoc(sample),
            metadata: {
                focusId: undefined,
            },
            event: { name: 'outline.sample.reset' },
        };
    });

    store.registerIntent(
        'outline/focus',
        (payload: { id?: string; atEnd?: boolean }) => ({
            patch: {},
            metadata: {
                focusId: payload.id ?? undefined,
                focusAtEnd: bool(payload.atEnd),
            },
            event: false,
        }),
    );
}
