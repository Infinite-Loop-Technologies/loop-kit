export const dockActionIds = {
    closePanel: 'dock.close-panel',
    dismissLayer: 'dock.dismiss-layer',
    focusPanel: 'dock.focus-panel',
    openPanel: 'dock.open-panel',
    splitPanel: 'dock.split-panel',
    toggleLayer: 'dock.toggle-layer',
} as const;

export type DockActionId = (typeof dockActionIds)[keyof typeof dockActionIds];
