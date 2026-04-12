export const canvasActionIds = {
  autoTileWindows: "canvas.windows.auto-tile",
  closeFocusedGroup: "canvas.group.close-focused",
  deleteFocusedPanel: "canvas.panel.delete-focused",
  openBrowserPanel: "canvas.panel.open-browser",
  resetViewport: "canvas.viewport.reset",
  setBrowserModeQueue: "canvas.browser.mode.queue",
  setBrowserModeSingle: "canvas.browser.mode.single",
  setBrowserModeStack: "canvas.browser.mode.stack",
  setBrowserModeSwap: "canvas.browser.mode.swap",
  setBrowserModeTabs: "canvas.browser.mode.tabs",
  toggleCommandPalette: "canvas.command-palette.toggle",
  toggleHelpPeek: "canvas.peek.toggle",
} as const;

export type CanvasActionId =
  (typeof canvasActionIds)[keyof typeof canvasActionIds];

export type CanvasCommandItem = {
  actionId: CanvasActionId;
  description: string;
  id: string;
  keywords?: readonly string[];
  shortcut?: string;
  title: string;
};

export const canvasCommandItems: CanvasCommandItem[] = [
  {
    actionId: canvasActionIds.toggleCommandPalette,
    description: "Open the modal command layer to search demo actions.",
    id: "palette",
    keywords: ["command", "search", "actions"],
    shortcut: "Mod+K",
    title: "Toggle command palette",
  },
  {
    actionId: canvasActionIds.autoTileWindows,
    description: "Arrange the floating dock groups into a simple grid.",
    id: "tile",
    keywords: ["grid", "arrange", "windows"],
    shortcut: "Mod+Shift+T",
    title: "Auto-tile floating windows",
  },
  {
    actionId: canvasActionIds.openBrowserPanel,
    description: "Add another embedded Electrobun browser panel into the browser group.",
    id: "browser",
    keywords: ["webview", "cef", "browser"],
    shortcut: "Mod+Shift+B",
    title: "Open another browser panel",
  },
  {
    actionId: canvasActionIds.deleteFocusedPanel,
    description: "Delete the currently focused dock panel when policy allows it.",
    id: "delete",
    keywords: ["close", "remove", "panel"],
    shortcut: "Delete",
    title: "Delete focused panel",
  },
  {
    actionId: canvasActionIds.closeFocusedGroup,
    description: "Close the active dock group when it is closeable.",
    id: "group-close",
    keywords: ["close", "group", "window"],
    title: "Close focused group",
  },
  {
    actionId: canvasActionIds.toggleHelpPeek,
    description: "Toggle the passthrough help peek layer.",
    id: "peek",
    keywords: ["peek", "help", "overlay"],
    shortcut: "Mod+/",
    title: "Toggle help peek",
  },
  {
    actionId: canvasActionIds.setBrowserModeTabs,
    description: "Show browser-group panels as tabs.",
    id: "mode-tabs",
    keywords: ["browser", "mode", "tabs"],
    title: "Browser group: tabs",
  },
  {
    actionId: canvasActionIds.setBrowserModeSingle,
    description: "Show one active browser-group panel with no stack chrome.",
    id: "mode-single",
    keywords: ["browser", "mode", "single"],
    title: "Browser group: no stack",
  },
  {
    actionId: canvasActionIds.setBrowserModeStack,
    description: "Render every browser-group panel in one stacked column.",
    id: "mode-stack",
    keywords: ["browser", "mode", "stack"],
    title: "Browser group: stack",
  },
  {
    actionId: canvasActionIds.setBrowserModeSwap,
    description: "Keep only the latest browser-group panel visible.",
    id: "mode-swap",
    keywords: ["browser", "mode", "swap"],
    title: "Browser group: swap",
  },
  {
    actionId: canvasActionIds.setBrowserModeQueue,
    description: "Treat the browser group like a queue with one visible head item.",
    id: "mode-queue",
    keywords: ["browser", "mode", "queue"],
    title: "Browser group: queue",
  },
  {
    actionId: canvasActionIds.resetViewport,
    description: "Reset the infinite canvas pan and zoom.",
    id: "viewport-reset",
    keywords: ["canvas", "viewport", "zoom"],
    title: "Reset canvas viewport",
  },
];
