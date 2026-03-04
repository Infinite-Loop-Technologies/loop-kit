import { z } from 'zod';

export const ColorTokensSchema = z.object({
    background: z.string(),
    foreground: z.string(),
    surface: z.string(),
    surfaceForeground: z.string(),
    border: z.string(),
    accent: z.string(),
    accentForeground: z.string(),
    muted: z.string(),
    mutedForeground: z.string(),
    danger: z.string(),
    dangerForeground: z.string(),
});

export const RadiusTokensSchema = z.object({
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
    xl: z.string(),
    pill: z.string(),
});

export const SpacingTokensSchema = z.object({
    xs: z.string(),
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
    xl: z.string(),
    xxl: z.string(),
});

export const TypographyTokensSchema = z.object({
    familySans: z.string(),
    familyMono: z.string(),
    sizeSm: z.string(),
    sizeMd: z.string(),
    sizeLg: z.string(),
    weightNormal: z.string(),
    weightMedium: z.string(),
    weightBold: z.string(),
    lineHeight: z.string(),
});

export const ElevationTokensSchema = z.object({
    level1: z.string(),
    level2: z.string(),
    level3: z.string(),
});

export const FxTokensSchema = z.object({
    panelTexture: z.string(),
    panelOverlayOpacity: z.string(),
    glassBlur: z.string(),
});

export const TokenSchema = z.object({
    colors: ColorTokensSchema,
    radius: RadiusTokensSchema,
    spacing: SpacingTokensSchema,
    typography: TypographyTokensSchema,
    elevation: ElevationTokensSchema,
    fx: FxTokensSchema,
});

export type Tokens = z.infer<typeof TokenSchema>;
