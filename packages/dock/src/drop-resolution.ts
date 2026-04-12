import { failure, success, type Result } from './v2/result.js';
import type { DockCommand } from './commands.js';
import type { DockPolicy, DockDropDescriptor, DockDragDescriptor } from './policy/dock-policy.js';
import type { DockV2Error, DockV2State } from './v2/types.js';

export type DockDropResolution = Result<
    {
        command: DockCommand;
        overlay?: import('@loop-kit/interaction').OverlaySpec;
    },
    DockV2Error
>;

function error(message: string): DockV2Error {
    return {
        code: 'invalid-operation',
        message,
    };
}

export function resolveDockDrop(
    state: DockV2State,
    drag: DockDragDescriptor,
    drop: DockDropDescriptor,
    policy: DockPolicy,
): DockDropResolution {
    const context = {
        drag,
        drop,
        state,
    };

    if (!policy.canDrop(context)) {
        return failure(error(`Dock policy rejected dropping "${drag.panel.id}" into "${drop.group.id}".`));
    }

    if (drop.zone === 'center' || drop.zone === 'tab') {
        return success({
            command: {
                input: {
                    activate: true,
                    groupId: drop.group.id,
                    panelId: drag.panel.id,
                },
                type: 'dock.attach-panel',
            },
            overlay: policy.resolveOverlayBehavior(context),
        });
    }

    if (!drop.panel) {
        return failure(error('Split drops require a target panel.'));
    }
    if (!policy.canSplit(context)) {
        return failure(error(`Dock policy rejected splitting "${drop.panel.id}".`));
    }

    return success({
        command: {
            input: {
                direction: drop.zone === 'left' || drop.zone === 'right' ? 'row' : 'col',
                groupId: drop.group.id,
                newPanelId: drag.panel.id,
                panelId: drop.panel.id,
                position: drop.zone === 'left' || drop.zone === 'top' ? 'before' : 'after',
            },
            type: 'dock.split-panel',
        },
        overlay: policy.resolveOverlayBehavior(context),
    });
}
