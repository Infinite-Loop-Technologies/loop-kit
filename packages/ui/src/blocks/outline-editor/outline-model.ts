export type OutlineNodeKind = 'item' | 'reference';

export type OutlineNode = {
    id: string;
    parentId: string | null;
    childIds: string[];
    text: string;
    collapsed: boolean;
    kind: OutlineNodeKind;
    targetId?: string;
};

export type OutlineDocument = {
    rootId: string;
    zoomRootId: string;
    nodes: Record<string, OutlineNode>;
};

export type OutlineVisibleRow = {
    id: string;
    depth: number;
};

export interface OutlineModel {
    createSample(): OutlineDocument;
    getResolvedText(doc: OutlineDocument, nodeId: string): string;
    setNodeText(doc: OutlineDocument, nodeId: string, text: string): OutlineDocument;
    insertSiblingAfter(
        doc: OutlineDocument,
        nodeId: string
    ): { doc: OutlineDocument; newNodeId: string };
    insertChild(
        doc: OutlineDocument,
        parentId: string
    ): { doc: OutlineDocument; newNodeId: string };
    addReferenceAfter(
        doc: OutlineDocument,
        nodeId: string
    ): { doc: OutlineDocument; newNodeId: string };
    indentNode(doc: OutlineDocument, nodeId: string): OutlineDocument;
    outdentNode(doc: OutlineDocument, nodeId: string): OutlineDocument;
    deleteNode(
        doc: OutlineDocument,
        nodeId: string
    ): { doc: OutlineDocument; nextFocusId: string | null };
    toggleCollapsed(doc: OutlineDocument, nodeId: string): OutlineDocument;
    zoomTo(doc: OutlineDocument, nodeId: string): OutlineDocument;
    zoomOut(doc: OutlineDocument): OutlineDocument;
    listVisibleRows(doc: OutlineDocument): OutlineVisibleRow[];
    getBreadcrumb(doc: OutlineDocument): string[];
}

let outlineIdCounter = 1;

function nextId() {
    outlineIdCounter += 1;
    return `node-${outlineIdCounter}`;
}

function cloneDocument(doc: OutlineDocument): OutlineDocument {
    const nodes: Record<string, OutlineNode> = {};
    for (const [id, node] of Object.entries(doc.nodes)) {
        nodes[id] = {
            ...node,
            childIds: [...node.childIds],
        };
    }
    return {
        ...doc,
        nodes,
    };
}

function createNode(
    text: string,
    parentId: string | null,
    kind: OutlineNodeKind = 'item',
    targetId?: string
): OutlineNode {
    return {
        id: nextId(),
        parentId,
        childIds: [],
        text,
        collapsed: false,
        kind,
        targetId,
    };
}

function moveNode(
    doc: OutlineDocument,
    nodeId: string,
    nextParentId: string,
    nextIndex: number
) {
    const node = doc.nodes[nodeId];
    const previousParentId = node.parentId;
    if (!previousParentId) {
        return;
    }

    const previousParent = doc.nodes[previousParentId];
    const currentIndex = previousParent.childIds.indexOf(nodeId);
    if (currentIndex >= 0) {
        previousParent.childIds.splice(currentIndex, 1);
    }

    const nextParent = doc.nodes[nextParentId];
    nextParent.childIds.splice(nextIndex, 0, nodeId);
    node.parentId = nextParentId;
}

function normalizeZoomRoot(doc: OutlineDocument) {
    if (!doc.nodes[doc.zoomRootId]) {
        doc.zoomRootId = doc.rootId;
    }
}

function createSample(): OutlineDocument {
    outlineIdCounter = 0;

    const root = createNode('Workspace', null);
    const product = createNode('Product Plan', root.id);
    const release = createNode('Release Checklist', root.id);
    const blockers = createNode('Blockers', root.id);
    const references = createNode('Reference: Product Plan', root.id, 'reference', product.id);

    const productUi = createNode('UI polish pass', product.id);
    const productDocs = createNode('Docs and onboarding', product.id);
    const productQa = createNode('QA pass + smoke tests', product.id);
    product.childIds.push(productUi.id, productDocs.id, productQa.id);

    const docsReference = createNode(
        'Reference: Docs and onboarding',
        release.id,
        'reference',
        productDocs.id
    );
    const releaseNotes = createNode('Draft release notes', release.id);
    release.childIds.push(releaseNotes.id, docsReference.id);

    const blockerOne = createNode('Fix drag-and-drop regression', blockers.id);
    const blockerTwo = createNode('Finalize auth edge-cases', blockers.id);
    blockers.childIds.push(blockerOne.id, blockerTwo.id);

    root.childIds.push(product.id, release.id, blockers.id, references.id);

    const nodes: Record<string, OutlineNode> = {};
    for (const node of [
        root,
        product,
        release,
        blockers,
        references,
        productUi,
        productDocs,
        productQa,
        docsReference,
        releaseNotes,
        blockerOne,
        blockerTwo,
    ]) {
        nodes[node.id] = node;
    }

    return {
        rootId: root.id,
        zoomRootId: root.id,
        nodes,
    };
}

const outlineModelImpl: OutlineModel = {
    createSample,
    getResolvedText(doc, nodeId) {
        const node = doc.nodes[nodeId];
        if (!node) return '';

        if (node.kind === 'reference' && node.targetId && doc.nodes[node.targetId]) {
            return doc.nodes[node.targetId].text;
        }

        return node.text;
    },
    setNodeText(doc, nodeId, text) {
        const next = cloneDocument(doc);
        const node = next.nodes[nodeId];
        if (!node) return doc;

        const resolvedTargetId =
            node.kind === 'reference' && node.targetId ? node.targetId : nodeId;

        const target = next.nodes[resolvedTargetId];
        if (!target) return doc;

        target.text = text;
        return next;
    },
    insertSiblingAfter(doc, nodeId) {
        const next = cloneDocument(doc);
        const node = next.nodes[nodeId];
        if (!node?.parentId) {
            return { doc, newNodeId: nodeId };
        }

        const parent = next.nodes[node.parentId];
        const index = parent.childIds.indexOf(nodeId);
        const created = createNode('', parent.id);

        next.nodes[created.id] = created;
        parent.childIds.splice(index + 1, 0, created.id);

        return { doc: next, newNodeId: created.id };
    },
    insertChild(doc, parentId) {
        const next = cloneDocument(doc);
        const parent = next.nodes[parentId];
        if (!parent) {
            return { doc, newNodeId: parentId };
        }

        const created = createNode('', parent.id);
        next.nodes[created.id] = created;
        parent.childIds.push(created.id);
        parent.collapsed = false;

        return { doc: next, newNodeId: created.id };
    },
    addReferenceAfter(doc, nodeId) {
        const next = cloneDocument(doc);
        const node = next.nodes[nodeId];
        if (!node?.parentId) {
            return { doc, newNodeId: nodeId };
        }

        const parent = next.nodes[node.parentId];
        const index = parent.childIds.indexOf(nodeId);
        const targetId = node.kind === 'reference' && node.targetId ? node.targetId : node.id;
        const created = createNode(`Reference: ${this.getResolvedText(next, node.id)}`, parent.id, 'reference', targetId);

        next.nodes[created.id] = created;
        parent.childIds.splice(index + 1, 0, created.id);

        return { doc: next, newNodeId: created.id };
    },
    indentNode(doc, nodeId) {
        const next = cloneDocument(doc);
        const node = next.nodes[nodeId];
        if (!node?.parentId) return doc;

        const parent = next.nodes[node.parentId];
        const index = parent.childIds.indexOf(nodeId);
        if (index <= 0) return doc;

        const previousSiblingId = parent.childIds[index - 1];
        const previousSibling = next.nodes[previousSiblingId];
        if (!previousSibling) return doc;

        moveNode(next, nodeId, previousSiblingId, previousSibling.childIds.length);
        previousSibling.collapsed = false;
        normalizeZoomRoot(next);
        return next;
    },
    outdentNode(doc, nodeId) {
        const next = cloneDocument(doc);
        const node = next.nodes[nodeId];
        if (!node?.parentId) return doc;

        const parent = next.nodes[node.parentId];
        const grandParentId = parent.parentId;
        if (!grandParentId) return doc;

        const grandParent = next.nodes[grandParentId];
        const parentIndex = grandParent.childIds.indexOf(parent.id);
        if (parentIndex < 0) return doc;

        moveNode(next, nodeId, grandParentId, parentIndex + 1);
        normalizeZoomRoot(next);
        return next;
    },
    deleteNode(doc, nodeId) {
        if (nodeId === doc.rootId) {
            return { doc, nextFocusId: doc.rootId };
        }

        const next = cloneDocument(doc);
        const node = next.nodes[nodeId];
        if (!node?.parentId) {
            return { doc, nextFocusId: null };
        }

        const parent = next.nodes[node.parentId];
        const index = parent.childIds.indexOf(node.id);
        if (index < 0) {
            return { doc, nextFocusId: node.parentId };
        }

        for (const childId of node.childIds) {
            const child = next.nodes[childId];
            if (child) {
                child.parentId = parent.id;
            }
        }

        parent.childIds.splice(index, 1, ...node.childIds);
        delete next.nodes[node.id];

        if (next.zoomRootId === node.id) {
            next.zoomRootId = parent.id;
        }

        normalizeZoomRoot(next);
        const previousSiblingId = parent.childIds[index - 1] ?? null;
        return { doc: next, nextFocusId: previousSiblingId ?? parent.id };
    },
    toggleCollapsed(doc, nodeId) {
        const next = cloneDocument(doc);
        const node = next.nodes[nodeId];
        if (!node) return doc;
        node.collapsed = !node.collapsed;
        return next;
    },
    zoomTo(doc, nodeId) {
        if (!doc.nodes[nodeId]) return doc;
        return {
            ...doc,
            zoomRootId: nodeId,
        };
    },
    zoomOut(doc) {
        if (doc.zoomRootId === doc.rootId) return doc;

        const current = doc.nodes[doc.zoomRootId];
        if (!current?.parentId) {
            return {
                ...doc,
                zoomRootId: doc.rootId,
            };
        }

        return {
            ...doc,
            zoomRootId: current.parentId,
        };
    },
    listVisibleRows(doc) {
        const rows: OutlineVisibleRow[] = [];

        const walk = (parentId: string, depth: number) => {
            const parent = doc.nodes[parentId];
            if (!parent) return;

            for (const childId of parent.childIds) {
                rows.push({ id: childId, depth });
                const child = doc.nodes[childId];
                if (child && !child.collapsed) {
                    walk(childId, depth + 1);
                }
            }
        };

        walk(doc.zoomRootId, 0);
        return rows;
    },
    getBreadcrumb(doc) {
        const breadcrumb: string[] = [];
        let currentId: string | null = doc.zoomRootId;

        while (currentId) {
            breadcrumb.push(currentId);
            const current: OutlineNode | undefined = doc.nodes[currentId];
            currentId = current?.parentId ?? null;
        }

        breadcrumb.reverse();
        return breadcrumb;
    },
};

export const outlineModel: OutlineModel = outlineModelImpl;
