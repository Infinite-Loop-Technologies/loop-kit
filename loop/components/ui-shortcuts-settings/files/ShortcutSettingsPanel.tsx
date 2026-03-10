import type { GraphState } from '@loop-kit/graphite';
import {
    ShortcutSettingsBlock,
    type GraphiteIntentRegistryEntry,
    type GraphiteShortcutBinding,
    type QueryBuilderField,
} from '@loop-kit/ui/blocks';

type ShortcutSettingsPanelProps<TState extends GraphState = GraphState> = {
    intents: readonly GraphiteIntentRegistryEntry<TState>[];
    bindings: readonly GraphiteShortcutBinding[];
    onBindingsChange: (next: GraphiteShortcutBinding[]) => void;
};

const contextFields: QueryBuilderField[] = [
    { key: 'panelCount', label: 'Panel Count', type: 'number' },
    { key: 'themeMode', label: 'Theme Mode', type: 'string' },
    { key: 'shortcutsEnabled', label: 'Shortcuts Enabled', type: 'boolean' },
];

export function ShortcutSettingsPanel<TState extends GraphState = GraphState>({
    intents,
    bindings,
    onBindingsChange,
}: ShortcutSettingsPanelProps<TState>) {
    return (
        <ShortcutSettingsBlock
            intents={intents}
            bindings={bindings}
            onBindingsChange={onBindingsChange}
            contextFields={contextFields}
        />
    );
}
