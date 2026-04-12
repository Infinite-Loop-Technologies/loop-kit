import { test, expect } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import {
    createDockV2Group,
    createDockV2Layer,
    createDockV2Panel,
    createDockV2State,
    type DockV2State,
} from '@loop-kit/dock';
import { DockProvider, DockStage, type DockPanelRegistry } from '../src/dock-v2';
import { LoomProvider, Text } from '@loop-kit/loom-react';
import { baseReactTheme } from '@loop-kit/loom-theme-base-react';

const registry: DockPanelRegistry = {
    kinds: {
        sample: ({ panel }) => <Text>{panel.title}</Text>,
    },
};

function renderDock(state: DockV2State, colorMode: 'light' | 'dark' = 'dark') {
    return renderToStaticMarkup(
        <LoomProvider colorMode={colorMode} themes={[baseReactTheme]}>
            <DockProvider initialState={state} registry={registry}>
                <DockStage />
            </DockProvider>
        </LoomProvider>,
    );
}

function createRendererState(): DockV2State {
    return createDockV2State({
        activeGroupId: 'group-main',
        activeLayerId: 'layer-main',
        focusedPanelId: 'panel-main',
        groups: {
            'group-main': createDockV2Group({
                chrome: {
                    showTabs: false,
                    showTitlebar: true,
                },
                id: 'group-main',
                layerId: 'layer-main',
                mode: 'single',
                panelIds: ['panel-main'],
                title: 'Main',
            }),
        },
        layerOrder: ['layer-main'],
        layers: {
            'layer-main': createDockV2Layer({
                groupIds: ['group-main'],
                id: 'layer-main',
                kind: 'flow',
            }),
        },
        panels: {
            'panel-main': createDockV2Panel({
                id: 'panel-main',
                kind: 'sample',
                title: 'Single Panel',
            }),
        },
    });
}

test('dock v2 renderer renders a single-panel group', () => {
    const markup = renderDock(createRendererState());

    expect(markup).toContain('Single Panel');
    expect(markup).toContain('data-dock-group="group-main"');
});

test('dock v2 renderer renders tab chrome for tabbed groups', () => {
    const state = createRendererState();
    state.groups['group-main'] = createDockV2Group({
        ...state.groups['group-main'],
        chrome: {
            showTabs: true,
            showTitlebar: true,
        },
        mode: 'tabs',
        panelIds: ['panel-main', 'panel-secondary'],
    });
    state.panels['panel-secondary'] = createDockV2Panel({
        id: 'panel-secondary',
        kind: 'sample',
        title: 'Secondary Tab',
    });

    const markup = renderDock(state);

    expect(markup).toContain('Single Panel');
    expect(markup).toContain('Secondary Tab');
    expect(markup).toContain('data-dock-group-mode="tabs"');
});

test('dock v2 renderer includes overlay layers', () => {
    const state = createRendererState();
    state.layerOrder.push('layer-overlay');
    state.layers['layer-overlay'] = createDockV2Layer({
        groupIds: ['group-overlay'],
        id: 'layer-overlay',
        kind: 'overlay',
        overlay: {
            behavior: 'replace',
            interaction: 'modal',
        },
    });
    state.groups['group-overlay'] = createDockV2Group({
        chrome: {
            showTabs: false,
            showTitlebar: false,
        },
        id: 'group-overlay',
        layerId: 'layer-overlay',
        layout: {
            placement: {
                kind: 'center',
            },
        },
        mode: 'swap',
        panelIds: ['panel-overlay'],
        title: 'Overlay',
    });
    state.panels['panel-overlay'] = createDockV2Panel({
        id: 'panel-overlay',
        kind: 'sample',
        title: 'Palette Overlay',
    });

    const markup = renderDock(state);

    expect(markup).toContain('data-dock-layer="layer-overlay"');
    expect(markup).toContain('Palette Overlay');
    expect(markup).toContain('data-dock-layer-backdrop="layer-overlay"');
});

test('dock v2 renderer exposes closable group chrome for inspector-style groups', () => {
    const state = createRendererState();
    state.groups['group-main'] = createDockV2Group({
        ...state.groups['group-main'],
        policies: {
            closeable: true,
        },
        title: 'Inspector',
    });

    const markup = renderDock(state);

    expect(markup).toContain('data-dock-close-group="group-main"');
    expect(markup).toContain('Inspector');
});

test('dock v2 renderer reflects locked group policies in markup', () => {
    const state = createRendererState();
    state.groups['group-main'] = createDockV2Group({
        ...state.groups['group-main'],
        policies: {
            closeable: false,
            splittable: false,
        },
    });

    const markup = renderDock(state);

    expect(markup).toContain('data-dock-group-closeable="false"');
    expect(markup).toContain('data-dock-group-splittable="false"');
    expect(markup).not.toContain('data-dock-close-group="group-main"');
});

test('dock v2 renderer survives theme switching without registry changes', () => {
    const state = createRendererState();

    const darkMarkup = renderDock(state, 'dark');
    const lightMarkup = renderDock(state, 'light');

    expect(darkMarkup).toContain('data-loom-color-mode="dark"');
    expect(lightMarkup).toContain('data-loom-color-mode="light"');
    expect(darkMarkup).toContain('Single Panel');
    expect(lightMarkup).toContain('Single Panel');
});

test('dock v2 renderer includes split resize handles for split groups', () => {
    const state = createRendererState();
    state.groups['group-main'] = createDockV2Group({
        ...state.groups['group-main'],
        mode: 'split',
        panelIds: ['panel-main', 'panel-secondary'],
        splitNodes: {
            'split-main': {
                children: [
                    {
                        kind: 'panel',
                        panelId: 'panel-main',
                    },
                    {
                        kind: 'panel',
                        panelId: 'panel-secondary',
                    },
                ],
                direction: 'row',
                id: 'split-main',
                weights: [0.6, 0.4],
            },
        },
        splitRootId: 'split-main',
    });
    state.panels['panel-secondary'] = createDockV2Panel({
        id: 'panel-secondary',
        kind: 'sample',
        title: 'Secondary Split',
    });

    const markup = renderDock(state);

    expect(markup).toContain('data-dock-split-handle="split-main"');
});

test('dock v2 renderer renders every panel for stack mode and exposes floating move chrome', () => {
    const state = createRendererState();
    state.layerOrder = ['layer-main', 'layer-floating'];
    state.layers['layer-floating'] = createDockV2Layer({
        groupIds: ['group-floating'],
        id: 'layer-floating',
        kind: 'floating',
    });
    state.groups['group-floating'] = createDockV2Group({
        chrome: {
            showTabs: false,
            showTitlebar: true,
        },
        id: 'group-floating',
        layerId: 'layer-floating',
        layout: {
            placement: {
                kind: 'floating',
                left: '120px',
                top: '80px',
                width: '360px',
            },
        },
        mode: 'stack',
        panelIds: ['panel-main', 'panel-secondary'],
        policies: {
            closeable: true,
        },
        title: 'Floating Stack',
    });
    state.panels['panel-secondary'] = createDockV2Panel({
        id: 'panel-secondary',
        kind: 'sample',
        title: 'Secondary Stack',
    });

    const markup = renderDock(state);

    expect(markup).toContain('data-dock-group-mode="stack"');
    expect(markup).toContain('data-dock-stack-panel="panel-main"');
    expect(markup).toContain('data-dock-stack-panel="panel-secondary"');
    expect(markup).toContain('Move');
});
