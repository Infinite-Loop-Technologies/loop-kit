import type {
    DockAttachPanelInput,
    DockDismissLayerInput,
    DockEnsurePanelInput,
    DockMoveGroupInput,
    DockOpenPanelInput,
    DockResizeGroupInput,
    DockResizeSplitInput,
    DockSetGroupModeInput,
    DockSplitPanelInput,
    DockV2PanelId,
    DockV2State,
} from './v2/types.js';

export type DockCommand =
    | {
          input: DockAttachPanelInput;
          type: 'dock.attach-panel';
      }
    | {
          groupId: string;
          type: 'dock.close-group';
      }
    | {
          panelId: DockV2PanelId;
          type: 'dock.close-panel';
      }
    | {
          input: DockDismissLayerInput;
          type: 'dock.dismiss-layer';
      }
    | {
          input: DockEnsurePanelInput;
          type: 'dock.ensure-panel';
      }
    | {
          panelId: DockV2PanelId;
          type: 'dock.focus-panel';
      }
    | {
          input: DockMoveGroupInput;
          type: 'dock.move-group';
      }
    | {
          input: DockOpenPanelInput;
          type: 'dock.open-panel';
      }
    | {
          input: DockResizeGroupInput;
          type: 'dock.resize-group';
      }
    | {
          input: DockResizeSplitInput;
          type: 'dock.resize-split';
      }
    | {
          state: DockV2State;
          type: 'dock.replace-state';
      }
    | {
          input: DockSetGroupModeInput;
          type: 'dock.set-group-mode';
      }
    | {
          input: DockSplitPanelInput;
          type: 'dock.split-panel';
      };
