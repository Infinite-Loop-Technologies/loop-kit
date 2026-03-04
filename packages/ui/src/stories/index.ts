import { primitiveStories } from './primitives/foundation.story';
import { blockStories } from './blocks';
import { legacyStories } from './legacy/basic.story';

export type { UiStory } from './types';

export const stories = [...primitiveStories, ...blockStories, ...legacyStories];
