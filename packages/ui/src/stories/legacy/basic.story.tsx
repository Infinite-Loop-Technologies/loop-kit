import { Button } from '../../legacy/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../legacy/ui/card';
import type { UiStory } from '../types';

export const legacyStories: UiStory[] = [
    {
        id: 'legacy.card-button',
        title: 'Legacy Card + Button',
        section: 'legacy',
        tags: ['legacy', 'card', 'button'],
        render: () => (
            <Card>
                <CardHeader>
                    <CardTitle>Legacy Surface</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button>Legacy button</Button>
                </CardContent>
            </Card>
        ),
    },
];
