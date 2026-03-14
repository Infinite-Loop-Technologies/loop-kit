import type {
    UiExtensionDefinition,
    UiExtensionRegistry,
    UiExtensionSlotId,
} from './types';

export function createUiExtensionRegistry(input: {
    enabledExtensionIds?: readonly string[];
    extensions?: readonly UiExtensionDefinition[];
}): UiExtensionRegistry {
    const definitions = Object.fromEntries(
        (input.extensions ?? []).map((extension) => [extension.id, extension]),
    ) as Record<string, UiExtensionDefinition>;

    const enabledIds = (input.enabledExtensionIds ?? []).filter(
        (id, index, list) => Boolean(definitions[id]) && list.indexOf(id) === index,
    );

    const slots = new Map<UiExtensionSlotId, NonNullable<UiExtensionDefinition['slots']>[UiExtensionSlotId]>();

    for (const id of enabledIds) {
        const definition = definitions[id];
        if (!definition?.slots) {
            continue;
        }

        for (const [slotId, slot] of Object.entries(definition.slots) as [
            UiExtensionSlotId,
            NonNullable<UiExtensionDefinition['slots']>[UiExtensionSlotId],
        ][]) {
            if (slot) {
                slots.set(slotId, slot);
            }
        }
    }

    return {
        definitions,
        enabledIds,
        getSlot(slotId) {
            return slots.get(slotId);
        },
    };
}
