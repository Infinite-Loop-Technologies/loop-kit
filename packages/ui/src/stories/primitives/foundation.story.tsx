import { Button, Panel, Text } from '../../primitives';
import type { UiStory } from '../types';

export const primitiveStories: UiStory[] = [
    {
        id: 'primitives.foundation',
        title: 'Foundation Primitives',
        section: 'primitives',
        tags: ['panel', 'button', 'text', 'tokens'],
        render: () => (
            <Panel style={{ padding: '1rem' }}>
                <Text as='h3' style={{ marginBottom: '0.75rem' }}>
                    Token-native primitives
                </Text>
                <Text tone='muted' style={{ marginBottom: '1rem' }}>
                    Panel, Button, and Text are driven by theme CSS variables.
                </Text>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button>Primary</Button>
                    <Button tone='outline'>Outline</Button>
                    <Button tone='danger'>Danger</Button>
                </div>
            </Panel>
        ),
    },
];
