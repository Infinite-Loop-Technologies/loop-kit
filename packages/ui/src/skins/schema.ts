import { z } from 'zod';

import { ThemeSchema, type ThemeDefinition } from '../theme/schema';

export const UiSkinAssetsSchema = z.object({
    assets: z.record(z.string(), z.string()).default({}),
    textures: z.record(z.string(), z.string()).default({}),
});

export const UiSkinThemesSchema = z.object({
    light: ThemeSchema,
    dark: ThemeSchema,
});

export const PartialUiSkinThemesSchema = z.object({
    light: ThemeSchema.optional(),
    dark: ThemeSchema.optional(),
});

export const UiSkinDefinitionSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1).optional(),
    description: z.string().optional(),
    source: z.string().optional(),
    tags: z.array(z.string()).default([]),
    extends: z.string().min(1).optional(),
    themes: PartialUiSkinThemesSchema.default({}),
    assets: UiSkinAssetsSchema.default({
        assets: {},
        textures: {},
    }),
    iconAliases: z.record(z.string(), z.string()).default({}),
    metadata: z.record(z.string(), z.unknown()).default({}),
});

export const ResolvedUiSkinSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    description: z.string().optional(),
    source: z.string().optional(),
    tags: z.array(z.string()).default([]),
    themes: UiSkinThemesSchema,
    assets: UiSkinAssetsSchema.default({
        assets: {},
        textures: {},
    }),
    iconAliases: z.record(z.string(), z.string()).default({}),
    metadata: z.record(z.string(), z.unknown()).default({}),
});

export type UiSkinAssets = z.infer<typeof UiSkinAssetsSchema>;
export type UiSkinThemes = z.infer<typeof UiSkinThemesSchema>;
export type UiSkinDefinition = z.input<typeof UiSkinDefinitionSchema>;
export type ResolvedUiSkin = z.output<typeof ResolvedUiSkinSchema>;
export type ThemeSet = {
    light: ThemeDefinition;
    dark: ThemeDefinition;
};
