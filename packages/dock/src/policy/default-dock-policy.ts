import type { OverlaySpec } from '@loop-kit/interaction';

import { normalizeDockV2Policies } from '../v2/model.js';
import type { DockPolicy, DockPolicyContext } from './dock-policy.js';

function panelKinds(value: unknown) {
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function canGroupAcceptPanel(context: DockPolicyContext) {
    const allowedKinds = panelKinds(context.drop.group.meta?.acceptsKinds);
    if (allowedKinds.length === 0) {
        return true;
    }
    return allowedKinds.includes(context.drag.panel.kind);
}

function compatibleFamilies(context: DockPolicyContext) {
    const dragFamily = context.drag.panel.meta?.family;
    const dropFamily = context.drop.group.meta?.family;
    if (!dragFamily || !dropFamily) {
        return true;
    }
    return dragFamily === dropFamily;
}

function overlayForZone(context: DockPolicyContext): OverlaySpec {
    return {
        data: {
            groupId: context.drop.group.id,
            panelId: context.drop.panel?.id,
            zone: context.drop.zone,
        },
        id: `dock-drop-${context.drop.group.id}-${context.drop.zone}`,
        label: `${context.drag.panel.title} → ${context.drop.group.title ?? context.drop.group.id} (${context.drop.zone})`,
        mode: 'ghost',
        position: {
            x: 0,
            y: 0,
        },
    };
}

export const defaultDockPolicy: DockPolicy = {
    canDrop(context) {
        return this.canHostPanel(context) && this.canMoveBetweenGroups(context);
    },
    canHostPanel(context) {
        return compatibleFamilies(context) && canGroupAcceptPanel(context);
    },
    canMoveBetweenGroups(context) {
        const sourcePolicies = normalizeDockV2Policies(context.drag.group.policies);
        const targetPolicies = normalizeDockV2Policies(context.drop.group.policies);
        if (!sourcePolicies.movable) {
            return false;
        }
        if (!targetPolicies.attachable && context.drop.zone !== 'left' && context.drop.zone !== 'right' && context.drop.zone !== 'top' && context.drop.zone !== 'bottom') {
            return false;
        }
        return true;
    },
    canSplit(context) {
        const sourceNeverSplit = context.drag.panel.meta?.neverSplit === true;
        const targetNeverSplit = context.drop.panel?.meta?.neverSplit === true;
        if (sourceNeverSplit || targetNeverSplit) {
            return false;
        }
        return normalizeDockV2Policies(context.drop.group.policies).splittable;
    },
    resolveOverlayBehavior(context) {
        return overlayForZone(context);
    },
};
