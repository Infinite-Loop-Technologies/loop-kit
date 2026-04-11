import {
    createDockV2Group,
    createDockV2Panel,
    createDockV2State,
    normalizeDockV2Policies,
    normalizeWeights,
} from './model.js';
import { failure, success } from './result.js';
import type {
    DockAttachPanelInput,
    DockDismissLayerInput,
    DockEnsurePanelInput,
    DockMoveGroupInput,
    DockOpenPanelInput,
    DockResizeGroupInput,
    DockResizeSplitInput,
    DockSetGroupModeInput,
    DockV2SplitChild,
    DockSplitPanelInput,
    DockV2Controller,
    DockV2ControllerOptions,
    DockV2ControllerResult,
    DockV2Error,
    DockV2Group,
    DockV2GroupId,
    DockV2GroupPolicies,
    DockV2LayerId,
    DockV2PanelId,
    DockV2SplitNode,
    DockV2SplitNodeId,
    DockV2State,
} from './types.js';

function createError(code: DockV2Error['code'], message: string): DockV2Error {
    return {
        code,
        message,
    };
}

function cloneState(state: DockV2State): DockV2State {
    return createDockV2State(state);
}

function uniqueId(prefix: string, existing: readonly string[]): string {
    let index = existing.length + 1;
    while (existing.includes(`${prefix}-${index}`)) {
        index += 1;
    }
    return `${prefix}-${index}`;
}

function findGroupContainingPanel(
    state: DockV2State,
    panelId: DockV2PanelId,
): DockV2Group | null {
    for (const group of Object.values(state.groups)) {
        if (group.panelIds.includes(panelId)) {
            return group;
        }
    }
    return null;
}

function removeItem<T>(items: readonly T[], target: T): T[] {
    const index = items.indexOf(target);
    if (index < 0) {
        return [...items];
    }
    return [...items.slice(0, index), ...items.slice(index + 1)];
}

function insertAt<T>(items: readonly T[], item: T, index?: number): T[] {
    if (typeof index !== 'number' || Number.isNaN(index)) {
        return [...items, item];
    }
    const safeIndex = Math.max(0, Math.min(items.length, Math.trunc(index)));
    return [...items.slice(0, safeIndex), item, ...items.slice(safeIndex)];
}

function resolveActivePanelId(group: DockV2Group) {
    if (group.mode === 'queue') {
        return group.panelIds[0];
    }
    if (group.mode === 'swap') {
        return group.panelIds[group.panelIds.length - 1];
    }
    return group.activePanelId && group.panelIds.includes(group.activePanelId)
        ? group.activePanelId
        : group.panelIds[0];
}

function ensureGroupCanMutate(
    group: DockV2Group | undefined,
    policy: keyof DockV2GroupPolicies,
): DockV2Error | null {
    if (!group) {
        return createError('group-not-found', 'Dock group was not found.');
    }
    const policies = normalizeDockV2Policies(group.policies);
    if (!policies[policy]) {
        return createError('group-locked', `Dock group "${group.id}" is locked for ${policy}.`);
    }
    return null;
}

function removePanelReference(
    group: DockV2Group,
    panelId: DockV2PanelId,
): DockV2Group {
    const next = createDockV2Group(group);
    next.panelIds = removeItem(next.panelIds, panelId);

    if (next.mode === 'split' && next.splitRootId && next.splitNodes) {
        const removeFromChild = (child: DockV2SplitChild): DockV2SplitChild | null => {
            if (child.kind === 'panel') {
                return child.panelId === panelId ? null : child;
            }
            const splitNodes = next.splitNodes;
            if (!splitNodes) {
                return null;
            }
            const node = splitNodes[child.splitId];
            if (!node) {
                return null;
            }
            const left = removeFromChild(node.children[0]);
            const right = removeFromChild(node.children[1]);
            if (!left && !right) {
                delete splitNodes[node.id];
                return null;
            }
            if (!left || !right) {
                delete splitNodes[node.id];
                return left ?? right;
            }
            splitNodes[node.id] = {
                ...node,
                children: [left, right],
            };
            return {
                kind: 'split',
                splitId: node.id,
            };
        };

        const rootRef = removeFromChild({
            kind: 'split',
            splitId: next.splitRootId,
        });
        if (!rootRef) {
            next.mode = next.panelIds.length > 1 ? 'tabs' : 'single';
            next.splitNodes = undefined;
            next.splitRootId = undefined;
        } else if (rootRef.kind === 'panel') {
            next.mode = next.panelIds.length > 1 ? 'tabs' : 'single';
            next.splitNodes = undefined;
            next.splitRootId = undefined;
            next.activePanelId = rootRef.panelId;
        } else {
            next.splitRootId = rootRef.splitId;
        }
    }

    next.activePanelId = resolveActivePanelId(next);
    return next;
}

function appendPanelToGroup(
    group: DockV2Group,
    panelId: DockV2PanelId,
    activate = true,
): DockV2Group | DockV2Error {
    const next = createDockV2Group(group);
    if (next.panelIds.includes(panelId)) {
        return next;
    }
    switch (next.mode) {
        case 'single':
            if (next.panelIds.length > 0) {
                return createError(
                    'invalid-operation',
                    `Group "${group.id}" only accepts a single panel.`,
                );
            }
            next.panelIds = [panelId];
            break;
        case 'swap':
            next.panelIds = [panelId];
            break;
        case 'queue':
        case 'stack':
        case 'tabs':
            next.panelIds = [...next.panelIds, panelId];
            break;
        case 'split':
            return createError(
                'invalid-operation',
                `Attach panels to split groups via splitPanel or setGroupMode first.`,
            );
        default:
            return createError('invalid-operation', `Unsupported group mode "${next.mode}".`);
    }
    if (activate) {
        next.activePanelId =
            next.mode === 'queue' ? next.panelIds[0] : next.panelIds[next.panelIds.length - 1];
    } else {
        next.activePanelId = resolveActivePanelId(next);
    }
    return next;
}

function closeGroupInternal(
    state: DockV2State,
    groupId: DockV2GroupId,
): DockV2ControllerResult {
    const group = state.groups[groupId];
    const policyError = ensureGroupCanMutate(group, 'closeable');
    if (policyError) {
        return failure(policyError);
    }

    const next = cloneState(state);
    const owningLayer = next.layers[group.layerId];
    if (owningLayer) {
        owningLayer.groupIds = removeItem(owningLayer.groupIds, groupId);
    }

    for (const panelId of group.panelIds) {
        delete next.panels[panelId];
    }
    delete next.groups[groupId];

    if (next.activeGroupId === groupId) {
        next.activeGroupId = owningLayer?.groupIds[0];
    }
    if (next.focusedPanelId && group.panelIds.includes(next.focusedPanelId)) {
        next.focusedPanelId = next.activeGroupId
            ? next.groups[next.activeGroupId]?.activePanelId
            : undefined;
    }

    return success(next);
}

function detachPanelFromGroup(
    state: DockV2State,
    groupId: DockV2GroupId,
    panelId: DockV2PanelId,
) {
    const group = state.groups[groupId];
    if (!group) {
        return;
    }

    const updated = removePanelReference(group, panelId);
    if (updated.panelIds.length <= 0) {
        const owningLayer = state.layers[group.layerId];
        if (owningLayer) {
            owningLayer.groupIds = removeItem(owningLayer.groupIds, groupId);
        }
        delete state.groups[groupId];
        if (state.activeGroupId === groupId) {
            state.activeGroupId = owningLayer?.groupIds[0];
        }
        if (state.focusedPanelId === panelId) {
            state.focusedPanelId = state.activeGroupId
                ? state.groups[state.activeGroupId]?.activePanelId
                : undefined;
        }
        return;
    }

    state.groups[groupId] = updated;
}

function createImplicitGroup(
    state: DockV2State,
    layerId: DockV2LayerId,
    input: DockOpenPanelInput | DockEnsurePanelInput,
): DockV2Group {
    const id = uniqueId('group', Object.keys(state.groups));
    return createDockV2Group({
        chrome: input.group?.chrome,
        id,
        layerId,
        layout: {
            placement: {
                kind: 'inline',
            },
            ...(input.group?.layout ?? {}),
        },
        mode: input.group?.mode ?? 'single',
        panelIds: [],
        policies: input.group?.policies,
        title: input.group?.title ?? input.panel.title,
    });
}

function resolveTargetLayerId(
    state: DockV2State,
    inputLayerId?: DockV2LayerId,
): DockV2LayerId | null {
    if (inputLayerId) {
        return state.layers[inputLayerId] ? inputLayerId : null;
    }
    return state.activeLayerId ?? state.layerOrder[0] ?? null;
}

function ensureGroupModeReadyForSplit(group: DockV2Group): DockV2Group {
    const next = createDockV2Group(group);
    if (next.mode !== 'split') {
        next.mode = 'split';
        next.splitNodes = next.splitNodes ?? {};
    }
    return next;
}

function replacePanelInSplit(
    group: DockV2Group,
    targetPanelId: DockV2PanelId,
    splitNode: DockV2SplitNode,
): DockV2Group {
    const next = createDockV2Group(group);
    const walk = (child: DockV2SplitChild): DockV2SplitChild => {
        if (child.kind === 'panel') {
            return child.panelId === targetPanelId
                ? {
                      kind: 'split',
                      splitId: splitNode.id,
                  }
                : child;
        }
        const node = next.splitNodes?.[child.splitId];
        if (!node) {
            return child;
        }
        next.splitNodes![node.id] = {
            ...node,
            children: [walk(node.children[0]), walk(node.children[1])],
        };
        return {
            kind: 'split',
            splitId: node.id,
        };
    };

    next.splitNodes = {
        ...(next.splitNodes ?? {}),
        [splitNode.id]: splitNode,
    };
    if (!next.splitRootId) {
        next.splitRootId = splitNode.id;
        return next;
    }

    const updatedRoot = walk({
        kind: 'split',
        splitId: next.splitRootId,
    });
    if (updatedRoot.kind === 'split') {
        next.splitRootId = updatedRoot.splitId;
    }
    return next;
}

function buildInitialSplitGroup(
    group: DockV2Group,
    panelId: DockV2PanelId,
    siblingPanelId: DockV2PanelId,
    direction: 'row' | 'col',
    position: 'after' | 'before',
    splitId: DockV2SplitNodeId,
): DockV2Group {
    const next = ensureGroupModeReadyForSplit(group);
    next.splitNodes = {
        ...(next.splitNodes ?? {}),
        [splitId]: {
            children:
                position === 'before'
                    ? [
                          {
                              kind: 'panel',
                              panelId: siblingPanelId,
                          },
                          {
                              kind: 'panel',
                              panelId,
                          },
                      ]
                    : [
                          {
                              kind: 'panel',
                              panelId,
                          },
                          {
                              kind: 'panel',
                              panelId: siblingPanelId,
                          },
                      ],
            direction,
            id: splitId,
            weights: [0.5, 0.5],
        },
    };
    next.splitRootId = splitId;
    next.activePanelId = siblingPanelId;
    return next;
}

export function createDockV2Controller(
    initialState: DockV2State,
    options: DockV2ControllerOptions = {},
): DockV2Controller {
    let current = createDockV2State(initialState);

    const commit = (state: DockV2State): DockV2ControllerResult => {
        current = createDockV2State(state);
        options.onChange?.(current);
        return success(current);
    };

    return {
        getState() {
            return current;
        },
        replaceState(state) {
            current = createDockV2State(state);
            options.onChange?.(current);
            return current;
        },
        openPanel(input) {
            const next = cloneState(current);
            if (next.panels[input.panel.id]) {
                return failure(
                    createError(
                        'panel-exists',
                        `Panel "${input.panel.id}" already exists in dock state.`,
                    ),
                );
            }

            const targetGroup = input.groupId ? next.groups[input.groupId] : undefined;
            const targetLayerId = targetGroup?.layerId ?? resolveTargetLayerId(next, input.layerId);
            if (!targetLayerId || !next.layers[targetLayerId]) {
                return failure(createError('layer-not-found', 'Target dock layer was not found.'));
            }

            let group = targetGroup;
            if (!group) {
                group = createImplicitGroup(next, targetLayerId, input);
                next.groups[group.id] = group;
                next.layers[targetLayerId].groupIds = [
                    ...next.layers[targetLayerId].groupIds,
                    group.id,
                ];
            }

            const groupPolicyError = ensureGroupCanMutate(group, 'attachable');
            if (groupPolicyError) {
                return failure(groupPolicyError);
            }

            next.panels[input.panel.id] = createDockV2Panel(input.panel);
            const updatedGroup = appendPanelToGroup(group, input.panel.id, input.activate ?? true);
            if ('code' in updatedGroup) {
                delete next.panels[input.panel.id];
                return failure(updatedGroup);
            }

            next.groups[group.id] = updatedGroup;
            next.activeGroupId = group.id;
            next.activeLayerId = targetLayerId;
            next.focusedPanelId = next.groups[group.id].activePanelId;

            if (next.layers[targetLayerId].kind === 'overlay') {
                const overlay = next.layers[targetLayerId].overlay;
                if (overlay?.behavior === 'replace' && next.layers[targetLayerId].groupIds.length > 1) {
                    const keepGroupId = group.id;
                    for (const existingGroupId of [...next.layers[targetLayerId].groupIds]) {
                        if (existingGroupId === keepGroupId) {
                            continue;
                        }
                        const closed = closeGroupInternal(next, existingGroupId);
                        if (closed.ok) {
                            Object.assign(next, closed.value);
                        }
                    }
                    next.layers[targetLayerId].groupIds = [keepGroupId];
                } else if (
                    overlay?.maxGroups &&
                    next.layers[targetLayerId].groupIds.length > overlay.maxGroups
                ) {
                    next.layers[targetLayerId].groupIds = next.layers[targetLayerId].groupIds.slice(
                        -overlay.maxGroups,
                    );
                }
            }

            return commit(next);
        },
        ensurePanel(input) {
            const existing = current.panels[input.panel.id];
            if (existing) {
                return this.focusPanel(existing.id);
            }
            return this.openPanel(input);
        },
        closePanel(panelId) {
            const sourceGroup = findGroupContainingPanel(current, panelId);
            if (!sourceGroup) {
                return failure(createError('panel-not-found', `Panel "${panelId}" was not found.`));
            }
            const policyError = ensureGroupCanMutate(sourceGroup, 'closeable');
            if (policyError) {
                return failure(policyError);
            }
            const next = cloneState(current);
            const group = removePanelReference(next.groups[sourceGroup.id], panelId);
            delete next.panels[panelId];

            if (group.panelIds.length <= 0) {
                const closed = closeGroupInternal(next, group.id);
                return closed.ok ? commit(closed.value) : closed;
            }

            next.groups[group.id] = group;
            next.activeGroupId = group.id;
            next.focusedPanelId = group.activePanelId;
            return commit(next);
        },
        closeGroup(groupId) {
            const closed = closeGroupInternal(current, groupId);
            return closed.ok ? commit(closed.value) : closed;
        },
        focusPanel(panelId) {
            const sourceGroup = findGroupContainingPanel(current, panelId);
            if (!sourceGroup) {
                return failure(createError('panel-not-found', `Panel "${panelId}" was not found.`));
            }
            const next = cloneState(current);
            const group = createDockV2Group(next.groups[sourceGroup.id]);
            group.activePanelId = panelId;
            next.groups[group.id] = group;
            next.focusedPanelId = panelId;
            next.activeGroupId = group.id;
            next.activeLayerId = group.layerId;
            return commit(next);
        },
        moveGroup(input) {
            const next = cloneState(current);
            const group = next.groups[input.groupId];
            if (!group) {
                return failure(createError('group-not-found', `Group "${input.groupId}" was not found.`));
            }
            const policyError = ensureGroupCanMutate(group, 'movable');
            if (policyError) {
                return failure(policyError);
            }
            const targetLayer = next.layers[input.layerId];
            if (!targetLayer) {
                return failure(createError('layer-not-found', `Layer "${input.layerId}" was not found.`));
            }
            const sourceLayer = next.layers[group.layerId];
            if (sourceLayer) {
                sourceLayer.groupIds = removeItem(sourceLayer.groupIds, group.id);
            }
            targetLayer.groupIds = insertAt(targetLayer.groupIds, group.id, input.index);
            group.layerId = targetLayer.id;
            next.groups[group.id] = group;
            next.activeLayerId = targetLayer.id;
            return commit(next);
        },
        resizeGroup(input) {
            const next = cloneState(current);
            const group = next.groups[input.groupId];
            if (!group) {
                return failure(createError('group-not-found', `Group "${input.groupId}" was not found.`));
            }
            const policyError = ensureGroupCanMutate(group, 'resizable');
            if (policyError) {
                return failure(policyError);
            }
            group.layout = {
                ...(group.layout ?? {}),
                ...input.layout,
            };
            next.groups[group.id] = group;
            return commit(next);
        },
        resizeSplit(input) {
            const next = cloneState(current);
            const group = next.groups[input.groupId];
            if (!group) {
                return failure(createError('group-not-found', `Group "${input.groupId}" was not found.`));
            }
            const policyError = ensureGroupCanMutate(group, 'resizable');
            if (policyError) {
                return failure(policyError);
            }
            const splitNode = group.splitNodes?.[input.splitId];
            if (!splitNode) {
                return failure(createError('split-not-found', `Split "${input.splitId}" was not found.`));
            }
            splitNode.weights = normalizeWeights(input.weights);
            next.groups[group.id] = group;
            return commit(next);
        },
        setGroupMode(input) {
            const next = cloneState(current);
            const group = next.groups[input.groupId];
            if (!group) {
                return failure(createError('group-not-found', `Group "${input.groupId}" was not found.`));
            }
            if (input.mode === 'split' && group.panelIds.length < 2) {
                return failure(
                    createError(
                        'invalid-operation',
                        `Group "${group.id}" needs at least two panels before it can become split.`,
                    ),
                );
            }
            const updated = createDockV2Group(group);
            updated.mode = input.mode;
            if (input.mode !== 'split') {
                updated.splitNodes = undefined;
                updated.splitRootId = undefined;
            } else if (!updated.splitRootId) {
                const left = updated.panelIds[0];
                const right = updated.panelIds[1];
                if (!left || !right) {
                    return failure(
                        createError(
                            'invalid-operation',
                            `Group "${group.id}" needs at least two panels before it can become split.`,
                        ),
                    );
                }
                const splitId = uniqueId(
                    'split',
                    Object.keys(next.groups).concat(Object.keys(updated.splitNodes ?? {})),
                );
                updated.splitNodes = {
                    ...(updated.splitNodes ?? {}),
                    [splitId]: {
                        children: [
                            {
                                kind: 'panel',
                                panelId: left,
                            },
                            {
                                kind: 'panel',
                                panelId: right,
                            },
                        ],
                        direction: 'row',
                        id: splitId,
                        weights: [0.5, 0.5],
                    },
                };
                updated.splitRootId = splitId;
                updated.activePanelId = right;
            }
            next.groups[group.id] = updated;
            return commit(next);
        },
        splitPanel(input) {
            const next = cloneState(current);
            const group = next.groups[input.groupId];
            if (!group) {
                return failure(createError('group-not-found', `Group "${input.groupId}" was not found.`));
            }
            const policyError = ensureGroupCanMutate(group, 'splittable');
            if (policyError) {
                return failure(policyError);
            }
            if (!group.panelIds.includes(input.panelId)) {
                return failure(
                    createError(
                        'panel-not-found',
                        `Panel "${input.panelId}" is not part of group "${group.id}".`,
                    ),
                );
            }

            let newPanelId = input.newPanelId;
            if (input.newPanel) {
                if (next.panels[input.newPanel.id]) {
                    return failure(
                        createError(
                            'panel-exists',
                            `Panel "${input.newPanel.id}" already exists in dock state.`,
                        ),
                    );
                }
                next.panels[input.newPanel.id] = createDockV2Panel(input.newPanel);
                newPanelId = input.newPanel.id;
            }

            if (!newPanelId) {
                newPanelId = group.panelIds.find((id) => id !== input.panelId);
            }

            if (!newPanelId || !next.panels[newPanelId]) {
                return failure(
                    createError(
                        'panel-not-found',
                        'splitPanel requires an existing sibling panel or a new panel payload.',
                    ),
                );
            }

            const sourceGroup = findGroupContainingPanel(next, newPanelId);
            if (sourceGroup && sourceGroup.id !== group.id) {
                detachPanelFromGroup(next, sourceGroup.id, newPanelId);
            }

            const updated = ensureGroupModeReadyForSplit(group);
            if (!updated.panelIds.includes(newPanelId)) {
                updated.panelIds = [...updated.panelIds, newPanelId];
            }
            const splitId = uniqueId(
                'split',
                Object.keys(updated.splitNodes ?? {}).concat(Object.keys(next.groups)),
            );

            const nextGroup =
                updated.splitRootId && updated.splitNodes
                    ? replacePanelInSplit(updated, input.panelId, {
                          children:
                              input.position === 'before'
                                  ? [
                                        {
                                            kind: 'panel',
                                            panelId: newPanelId,
                                        },
                                        {
                                            kind: 'panel',
                                            panelId: input.panelId,
                                        },
                                    ]
                                  : [
                                        {
                                            kind: 'panel',
                                            panelId: input.panelId,
                                        },
                                        {
                                            kind: 'panel',
                                            panelId: newPanelId,
                                        },
                                    ],
                          direction: input.direction,
                          id: splitId,
                          weights: [0.5, 0.5],
                      })
                    : buildInitialSplitGroup(
                          updated,
                          input.panelId,
                          newPanelId,
                          input.direction,
                          input.position ?? 'after',
                          splitId,
                      );

            next.groups[group.id] = nextGroup;
            next.focusedPanelId = newPanelId;
            next.activeGroupId = group.id;
            return commit(next);
        },
        attachPanel(input) {
            const next = cloneState(current);
            const targetGroup = next.groups[input.groupId];
            if (!targetGroup) {
                return failure(createError('group-not-found', `Group "${input.groupId}" was not found.`));
            }
            const targetPolicyError = ensureGroupCanMutate(targetGroup, 'attachable');
            if (targetPolicyError) {
                return failure(targetPolicyError);
            }
            if (!next.panels[input.panelId]) {
                return failure(createError('panel-not-found', `Panel "${input.panelId}" was not found.`));
            }

            const sourceGroup = findGroupContainingPanel(next, input.panelId);
            if (sourceGroup) {
                next.groups[sourceGroup.id] = removePanelReference(sourceGroup, input.panelId);
                if (next.groups[sourceGroup.id].panelIds.length <= 0) {
                    const closed = closeGroupInternal(next, sourceGroup.id);
                    if (closed.ok) {
                        Object.assign(next, closed.value);
                    }
                }
            }

            const updatedTarget = createDockV2Group(targetGroup);
            if (updatedTarget.mode === 'split') {
                return failure(
                    createError(
                        'invalid-operation',
                        `Use splitPanel to attach into split group "${updatedTarget.id}".`,
                    ),
                );
            }
            updatedTarget.panelIds = insertAt(updatedTarget.panelIds, input.panelId, input.index);
            updatedTarget.activePanelId =
                input.activate === false ? resolveActivePanelId(updatedTarget) : input.panelId;
            next.groups[updatedTarget.id] = updatedTarget;
            next.focusedPanelId = updatedTarget.activePanelId;
            next.activeGroupId = updatedTarget.id;
            next.activeLayerId = updatedTarget.layerId;
            return commit(next);
        },
        dismissLayer(input) {
            const layer = current.layers[input.layerId];
            if (!layer) {
                return failure(createError('layer-not-found', `Layer "${input.layerId}" was not found.`));
            }
            const next = cloneState(current);
            const targetLayer = next.layers[input.layerId];
            const groupsToDismiss =
                targetLayer.kind === 'overlay' && targetLayer.overlay?.behavior === 'queue'
                    ? targetLayer.groupIds.slice(0, 1)
                    : targetLayer.kind === 'overlay' &&
                        targetLayer.overlay?.behavior === 'stack'
                      ? targetLayer.groupIds.slice(-1)
                      : [...targetLayer.groupIds];
            for (const groupId of groupsToDismiss) {
                const closed = closeGroupInternal(next, groupId);
                if (closed.ok) {
                    Object.assign(next, closed.value);
                }
            }
            return commit(next);
        },
    };
}
