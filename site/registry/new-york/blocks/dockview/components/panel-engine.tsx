// layout-types.ts
export type PanelId = string;
export type GroupId = string;
export type WindowId = string;

export type PanelModel = {
    id: PanelId;
    title?: string;
    // later: type, props, componentKey, etc.
};

export type GroupModel = {
    id: GroupId;
    title?: string;
    panels: PanelModel[];
    activePanelId?: PanelId;
};

export type WindowModel = {
    id: WindowId;
    title?: string;
    groups: GroupModel[];
    activeGroupId?: GroupId;
};

export type LayoutState = {
    windows: WindowModel[];
};

export const defaultLayout: LayoutState = {
    windows: [
        {
            id: 'window1',
            groups: [
                {
                    id: 'group1',
                    panels: [{ id: 'panel1', title: 'Panel 1' }],
                    activePanelId: 'panel1',
                },
            ],
            activeGroupId: 'group1',
        },
    ],
};
