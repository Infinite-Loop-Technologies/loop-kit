import { z } from 'zod';

import { TokenSchema } from '../tokens/schema';

export const ThemeModeSchema = z.enum(['light', 'dark']);

export const ThemeSchema = z.object({
    id: z.string().min(1),
    mode: ThemeModeSchema,
    tokens: TokenSchema,
});

export type ThemeMode = z.infer<typeof ThemeModeSchema>;
export type ThemeDefinition = z.infer<typeof ThemeSchema>;
