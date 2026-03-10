'use client';

import type { GraphState } from '@loop-kit/graphite';
import { Card, CardContent, CardHeader, CardTitle } from '../../legacy/ui/card';
import {
    GraphiteShortcutManager,
    type GraphiteShortcutBinding,
} from '../systems/graphite-shortcut-manager';
import type { QueryBuilderField } from '../systems/graphite-query-builder';
import type { GraphiteIntentRegistryEntry } from '../systems/graphite-intent-registry';

export type ShortcutSettingsBlockProps<TState extends GraphState = GraphState> = {
    intents: readonly GraphiteIntentRegistryEntry<TState>[];
    bindings: readonly GraphiteShortcutBinding[];
    onBindingsChange: (next: GraphiteShortcutBinding[]) => void;
    contextFields: readonly QueryBuilderField[];
    className?: string;
};

export function ShortcutSettingsBlock<TState extends GraphState = GraphState>({
    intents,
    bindings,
    onBindingsChange,
    contextFields,
    className,
}: ShortcutSettingsBlockProps<TState>) {
    return (
        <Card className={className}>
            <CardHeader className='pb-3'>
                <CardTitle className='text-sm'>Shortcut Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <GraphiteShortcutManager
                    intents={intents}
                    bindings={bindings}
                    onBindingsChange={onBindingsChange}
                    contextFields={contextFields}
                />
            </CardContent>
        </Card>
    );
}
