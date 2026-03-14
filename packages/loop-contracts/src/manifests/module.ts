import { z } from 'zod';

export const ModuleCapabilitySchema = z.object({
    kind: z.enum(['lane-provider', 'patch-adapter', 'toolchain-adapter', 'ui-extension']),
    id: z.string().min(1),
    description: z.string().optional(),
});

export const UiExtensionSlotSchema = z.enum(['panel.surface']);

export const ModuleBrowserUiExtensionSchema = z.object({
    slot: UiExtensionSlotSchema,
    export: z.string().min(1),
});

export const ModuleBrowserEntrySchema = z.object({
    entry: z.string().min(1),
    uiExtensions: z.array(ModuleBrowserUiExtensionSchema).default([]),
});

export const ModuleManifestSchema = z.object({
    schemaVersion: z.literal('1'),
    kind: z.literal('module'),
    id: z.string().min(1),
    name: z.string().min(1),
    version: z.string().min(1),
    entry: z.string().min(1),
    provides: z.array(ModuleCapabilitySchema).default([]),
    browser: ModuleBrowserEntrySchema.optional(),
    configSchema: z.union([z.string().url(), z.record(z.string(), z.unknown())]).optional(),
    permissions: z.array(z.string()).default([]),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ModuleCapability = z.infer<typeof ModuleCapabilitySchema>;
export type ModuleBrowserEntry = z.infer<typeof ModuleBrowserEntrySchema>;
export type ModuleBrowserUiExtension = z.infer<typeof ModuleBrowserUiExtensionSchema>;
export type ModuleManifest = z.infer<typeof ModuleManifestSchema>;
export type UiExtensionSlot = z.infer<typeof UiExtensionSlotSchema>;
