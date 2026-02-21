import { computeLayoutRects, rectToStyle, } from './geometry';
import { createDockIntentNames } from './intents';
import { createDockInteractionController, } from './interaction';
import { applyOverlayRect } from './debugOverlay';
import { migrateDockState } from './model';
function readAtPath(root, path) {
    let current = root;
    for (const segment of path) {
        if (typeof current !== 'object' || current === null) {
            return undefined;
        }
        current = current[String(segment)];
    }
    return current;
}
function applyRectStyles(element, layoutRect) {
    const style = rectToStyle(layoutRect);
    if (style.left)
        element.style.left = style.left;
    if (style.top)
        element.style.top = style.top;
    if (style.width)
        element.style.width = style.width;
    if (style.height)
        element.style.height = style.height;
}
class DockDebugRendererImpl {
    store;
    mount;
    dockPath;
    selectDock;
    layoutOptions;
    names;
    historyChannel;
    overlayEl;
    surfaceEl;
    unsubCommit;
    controller;
    tabDragActivationDistance;
    currentLayout = null;
    renderFrame = null;
    resizeFrame = null;
    pendingResizeIntent = null;
    constructor(options) {
        this.store = options.store;
        this.mount = options.mount;
        this.dockPath = options.dockPath ?? ['dock'];
        this.selectDock = options.selectDock;
        this.layoutOptions = options.layoutOptions ?? {};
        this.names = createDockIntentNames(options.intentPrefix);
        this.historyChannel = options.historyChannel ?? 'dock';
        this.tabDragActivationDistance = Math.max(2, options.tabDragActivationDistance ?? 6);
        this.mount.innerHTML = '';
        this.mount.style.position = 'relative';
        this.mount.style.overflow = 'hidden';
        this.mount.style.background = '#0b1220';
        this.mount.style.color = '#d9e2f2';
        this.mount.style.fontFamily = "'Consolas', 'Menlo', monospace";
        this.surfaceEl = document.createElement('div');
        this.surfaceEl.style.position = 'absolute';
        this.surfaceEl.style.inset = '0';
        this.overlayEl = document.createElement('div');
        this.overlayEl.style.position = 'absolute';
        this.overlayEl.style.pointerEvents = 'none';
        this.overlayEl.style.border = '2px solid #38bdf8';
        this.overlayEl.style.background = 'rgba(56, 189, 248, 0.16)';
        this.overlayEl.style.borderRadius = '6px';
        this.overlayEl.style.boxSizing = 'border-box';
        this.overlayEl.style.display = 'none';
        this.mount.appendChild(this.surfaceEl);
        this.mount.appendChild(this.overlayEl);
        this.controller = createDockInteractionController({
            hitTestOptions: options.hitTestOptions,
            minWeight: options.minWeight,
            onDropTargetChange: (target) => applyOverlayRect(this.overlayEl, target),
        });
        this.unsubCommit = this.store.onCommit(() => {
            this.scheduleRender();
        });
        this.scheduleRender();
    }
    render() {
        this.renderFrame = null;
        const dockState = this.readDockState();
        const bounds = {
            x: 0,
            y: 0,
            width: Math.max(1, this.mount.clientWidth),
            height: Math.max(1, this.mount.clientHeight),
        };
        this.currentLayout = computeLayoutRects(dockState, bounds, this.layoutOptions);
        this.surfaceEl.innerHTML = '';
        for (const group of this.currentLayout.groups) {
            this.renderGroup(group);
        }
        for (const handle of this.currentLayout.splitHandles) {
            this.renderSplitHandle(handle, dockState);
        }
    }
    dispose() {
        this.controller.cancelPanelDrag();
        this.controller.cancelResize();
        if (this.renderFrame !== null) {
            cancelAnimationFrame(this.renderFrame);
            this.renderFrame = null;
        }
        if (this.resizeFrame !== null) {
            cancelAnimationFrame(this.resizeFrame);
            this.resizeFrame = null;
        }
        this.unsubCommit();
    }
    scheduleRender() {
        if (this.renderFrame !== null)
            return;
        this.renderFrame = requestAnimationFrame(() => this.render());
    }
    readDockState() {
        const raw = this.selectDock
            ? this.selectDock(this.store.getState())
            : readAtPath(this.store.getState(), this.dockPath);
        return migrateDockState(raw);
    }
    mapIntentName(name) {
        switch (name) {
            case 'dock/move-panel':
                return this.names.movePanel;
            case 'dock/resize':
                return this.names.resize;
            default:
                return name;
        }
    }
    dispatch(intent) {
        if (!intent)
            return;
        const options = {
            metadata: {
                domain: 'dock',
                transient: Boolean(intent.transient),
            },
            history: intent.transient ? false : this.historyChannel,
            event: intent.transient ? false : undefined,
        };
        this.store.dispatchIntent(this.mapIntentName(intent.name), intent.payload, options);
    }
    queueTransientResize(intent) {
        if (!intent)
            return;
        this.pendingResizeIntent = intent;
        if (this.resizeFrame !== null)
            return;
        this.resizeFrame = requestAnimationFrame(() => {
            this.resizeFrame = null;
            const pending = this.pendingResizeIntent;
            this.pendingResizeIntent = null;
            this.dispatch(pending);
        });
    }
    flushTransientResize() {
        if (this.resizeFrame !== null) {
            cancelAnimationFrame(this.resizeFrame);
            this.resizeFrame = null;
        }
        if (this.pendingResizeIntent) {
            this.dispatch(this.pendingResizeIntent);
            this.pendingResizeIntent = null;
        }
    }
    renderGroup(group) {
        const groupEl = document.createElement('div');
        groupEl.style.position = 'absolute';
        groupEl.style.boxSizing = 'border-box';
        groupEl.style.border = '1px solid #334155';
        groupEl.style.borderRadius = '6px';
        groupEl.style.background = '#111827';
        groupEl.style.overflow = 'hidden';
        applyRectStyles(groupEl, group.rect);
        const tabBar = document.createElement('div');
        tabBar.style.position = 'absolute';
        tabBar.style.left = '0';
        tabBar.style.top = '0';
        tabBar.style.right = '0';
        tabBar.style.height = `${group.tabBarRect.height}px`;
        tabBar.style.display = 'flex';
        tabBar.style.alignItems = 'stretch';
        tabBar.style.background = '#1f2937';
        tabBar.style.borderBottom = '1px solid #334155';
        tabBar.style.userSelect = 'none';
        const content = document.createElement('div');
        content.style.position = 'absolute';
        content.style.left = '0';
        content.style.right = '0';
        content.style.top = `${group.tabBarRect.height}px`;
        content.style.bottom = '0';
        content.style.padding = '8px';
        content.style.fontSize = '12px';
        content.style.color = '#cbd5e1';
        content.textContent =
            group.activePanelId !== null
                ? `active: ${group.activePanelId}`
                : 'empty group';
        for (const panelId of group.panelIds) {
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.textContent = panelId;
            tab.style.flex = '0 0 auto';
            tab.style.border = 'none';
            tab.style.padding = '0 10px';
            tab.style.fontSize = '11px';
            tab.style.cursor = 'grab';
            tab.style.background = panelId === group.activePanelId ? '#0f172a' : 'transparent';
            tab.style.color = panelId === group.activePanelId ? '#f8fafc' : '#93a4bc';
            tab.style.borderRight = '1px solid #334155';
            tab.addEventListener('click', () => {
                this.store.dispatchIntent(this.names.activatePanel, {
                    groupId: group.id,
                    panelId,
                }, {
                    metadata: { domain: 'dock' },
                    history: false,
                });
            });
            tab.addEventListener('pointerdown', (event) => {
                if (event.button !== 0)
                    return;
                const pointerId = event.pointerId;
                const startX = event.clientX;
                const startY = event.clientY;
                let dragging = false;
                const onMove = (moveEvent) => {
                    const dx = moveEvent.clientX - startX;
                    const dy = moveEvent.clientY - startY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (!dragging && distance >= this.tabDragActivationDistance) {
                        dragging = true;
                        this.controller.startPanelDrag(panelId);
                        tab.style.cursor = 'grabbing';
                        event.preventDefault();
                    }
                    if (!dragging || !this.currentLayout)
                        return;
                    this.controller.updatePointer({ x: moveEvent.clientX, y: moveEvent.clientY }, this.currentLayout);
                };
                const onUp = (upEvent) => {
                    if (upEvent.pointerId !== pointerId)
                        return;
                    document.removeEventListener('pointermove', onMove);
                    document.removeEventListener('pointerup', onUp);
                    tab.style.cursor = 'grab';
                    if (!dragging || !this.currentLayout) {
                        this.controller.cancelPanelDrag();
                        return;
                    }
                    const intent = this.controller.endPanelDrag({ x: upEvent.clientX, y: upEvent.clientY }, this.currentLayout);
                    this.dispatch(intent);
                };
                document.addEventListener('pointermove', onMove, { passive: true });
                document.addEventListener('pointerup', onUp);
            });
            tabBar.appendChild(tab);
        }
        groupEl.appendChild(tabBar);
        groupEl.appendChild(content);
        this.surfaceEl.appendChild(groupEl);
    }
    renderSplitHandle(handle, dockState) {
        const splitNode = dockState.nodes[handle.splitId];
        if (!splitNode || splitNode.kind !== 'split')
            return;
        const splitRect = this.currentLayout?.nodes[handle.splitId]?.rect;
        if (!splitRect)
            return;
        const handleEl = document.createElement('div');
        handleEl.style.position = 'absolute';
        handleEl.style.boxSizing = 'border-box';
        handleEl.style.background = 'rgba(125, 211, 252, 0.16)';
        handleEl.style.border = '1px solid rgba(125, 211, 252, 0.42)';
        handleEl.style.borderRadius = '3px';
        handleEl.style.cursor = handle.direction === 'row' ? 'col-resize' : 'row-resize';
        applyRectStyles(handleEl, handle.rect);
        handleEl.addEventListener('pointerdown', (event) => {
            if (event.button !== 0)
                return;
            event.preventDefault();
            this.controller.startResize({
                splitId: handle.splitId,
                handleIndex: handle.index,
                direction: handle.direction,
                startPoint: { x: event.clientX, y: event.clientY },
                splitSize: handle.direction === 'row' ? splitRect.width : splitRect.height,
                weights: splitNode.data.weights,
            });
            const onMove = (moveEvent) => {
                const transientIntent = this.controller.updateResize({
                    x: moveEvent.clientX,
                    y: moveEvent.clientY,
                });
                this.queueTransientResize(transientIntent);
            };
            const onUp = (upEvent) => {
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onUp);
                this.flushTransientResize();
                const finalIntent = this.controller.endResize({
                    x: upEvent.clientX,
                    y: upEvent.clientY,
                });
                this.dispatch(finalIntent);
            };
            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
        });
        this.surfaceEl.appendChild(handleEl);
    }
}
/**
 * Mounts a lightweight DOM renderer for dock state and interactions.
 * Useful for debugging layout/targets without coupling to React.
 */
export function createDockDebugRenderer(options) {
    return new DockDebugRendererImpl(options);
}
//# sourceMappingURL=debugRenderer.js.map