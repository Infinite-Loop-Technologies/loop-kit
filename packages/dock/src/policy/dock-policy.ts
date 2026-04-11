import type { OverlaySpec } from '@loop-kit/interaction';

import type { DockCommand } from '../commands.js';
import type { DockV2Group, DockV2Panel, DockV2State } from '../v2/types.js';

export type DockDropZone = 'center' | 'left' | 'right' | 'tab' | 'top' | 'bottom';

export type DockDragDescriptor = {
    group: DockV2Group;
    panel: DockV2Panel;
};

export type DockDropDescriptor = {
    group: DockV2Group;
    panel?: DockV2Panel;
    zone: DockDropZone;
};

export type DockPolicyContext = {
    drag: DockDragDescriptor;
    drop: DockDropDescriptor;
    state: DockV2State;
};

export type DockDropPlan = {
    command: DockCommand;
    overlay?: OverlaySpec;
};

export type DockPolicy = {
    canDrop: (context: DockPolicyContext) => boolean;
    canHostPanel: (context: DockPolicyContext) => boolean;
    canMoveBetweenGroups: (context: DockPolicyContext) => boolean;
    canSplit: (context: DockPolicyContext) => boolean;
    resolveOverlayBehavior: (context: DockPolicyContext) => OverlaySpec | undefined;
};
