import type { CSSProperties, SVGProps } from 'react';

import {
    createIconRegistry,
    defaultIconRegistry,
    mergeIconRegistries,
    type IconRegistry,
} from '../icons';
import {
    Button as BaseButton,
    Link as BaseLink,
    Panel as BasePanel,
    Text as BaseText,
    type LinkProps,
    type PanelProps,
    type PrimitiveButtonProps,
    type TextProps,
} from '../primitives';
import {
    defaultUiSkinDefinitions,
    resolveUiSkin,
    useOptionalUiProviderState,
} from '../skins';
import type { UiThemePackDefinition } from './provider';

function FancySearchIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' {...props}>
            <rect x='3' y='3' width='12' height='12' rx='2' />
            <path d='m14.5 14.5 6 6' />
        </svg>
    );
}

function FancyMenuIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' {...props}>
            <path d='M4 6h16' />
            <path d='M4 12h16' />
            <path d='M4 18h10' />
        </svg>
    );
}

const brutalistIconRegistry: IconRegistry = mergeIconRegistries(
    createIconRegistry({
        icons: {
            menu: FancyMenuIcon,
            search: FancySearchIcon,
        },
    }),
    defaultIconRegistry,
);

function TexturedPanel({ style, ...props }: PanelProps) {
    const ui = useOptionalUiProviderState();
    const frameUrl = ui?.assetResolver.resolve('asset://asset/frame/ornate-01');

    return (
        <BasePanel
            {...props}
            style={{
                border: frameUrl ? '18px solid transparent' : undefined,
                borderImageOutset: frameUrl ? '1' : undefined,
                borderImageRepeat: frameUrl ? 'stretch' : undefined,
                borderImageSlice: frameUrl ? '24 fill' : undefined,
                borderImageSource: frameUrl ? `url(${frameUrl})` : undefined,
                boxShadow:
                    '0 18px 42px color-mix(in oklch, var(--accent) 18%, transparent), var(--loop-elevation-level2)',
                ...style,
            }}
        />
    );
}

function LiquidPanel({ style, ...props }: PanelProps) {
    return (
        <BasePanel
            {...props}
            style={{
                background:
                    'linear-gradient(180deg, color-mix(in oklch, white 18%, var(--card)) 0%, color-mix(in oklch, var(--card) 88%, transparent) 100%)',
                borderColor: 'color-mix(in oklch, white 32%, var(--border))',
                boxShadow:
                    '0 24px 64px color-mix(in oklch, var(--accent) 22%, transparent), inset 0 1px 0 color-mix(in oklch, white 32%, transparent)',
                ...style,
            }}
        />
    );
}

function NeoPanel({ style, ...props }: PanelProps) {
    return (
        <BasePanel
            {...props}
            style={{
                background: 'var(--card)',
                border: '3px solid var(--foreground)',
                borderRadius: 'calc(var(--loop-radius-sm) / 2)',
                boxShadow: '8px 8px 0 color-mix(in oklch, var(--accent) 58%, black 12%)',
                ...style,
            }}
        />
    );
}

function SlatePanel({ style, ...props }: PanelProps) {
    return (
        <BasePanel
            {...props}
            style={{
                background:
                    'linear-gradient(180deg, color-mix(in oklch, var(--card) 92%, white 3%) 0%, color-mix(in oklch, var(--background) 94%, black 8%) 100%)',
                borderColor: 'color-mix(in oklch, var(--accent) 26%, var(--border))',
                boxShadow:
                    '0 18px 56px color-mix(in oklch, black 62%, transparent), 0 0 0 1px color-mix(in oklch, var(--accent) 12%, transparent)',
                ...style,
            }}
        />
    );
}

function LiquidButton({ style, ...props }: PrimitiveButtonProps) {
    return (
        <BaseButton
            {...props}
            style={{
                background:
                    'linear-gradient(180deg, color-mix(in oklch, white 18%, var(--primary)) 0%, var(--primary) 100%)',
                boxShadow:
                    '0 16px 26px color-mix(in oklch, var(--primary) 22%, transparent), inset 0 1px 0 color-mix(in oklch, white 24%, transparent)',
                ...style,
            }}
        />
    );
}

function NeoButton({ style, ...props }: PrimitiveButtonProps) {
    return (
        <BaseButton
            {...props}
            style={{
                border: '3px solid var(--foreground)',
                borderRadius: '0.45rem',
                boxShadow: '5px 5px 0 color-mix(in oklch, var(--foreground) 70%, transparent)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                ...style,
            }}
        />
    );
}

function SlateText({ style, ...props }: TextProps) {
    return (
        <BaseText
            {...props}
            style={{
                color: 'color-mix(in oklch, var(--foreground) 92%, white 8%)',
                ...style,
            }}
        />
    );
}

function TexturedLink({ style, ...props }: LinkProps) {
    return (
        <BaseLink
            {...props}
            style={{
                color: 'var(--primary)',
                textDecoration: 'underline',
                textDecorationThickness: '0.12em',
                ...style,
            }}
        />
    );
}

function previewStyleForPack(id: string): CSSProperties {
    if (id === 'liquid-glass') {
        return {
            background:
                'radial-gradient(circle at top left, color-mix(in oklch, var(--primary) 16%, transparent), transparent 48%), var(--card)',
        };
    }

    if (id === 'neo-brutal') {
        return {
            background:
                'linear-gradient(135deg, color-mix(in oklch, var(--primary) 22%, var(--card)) 0%, var(--card) 70%)',
        };
    }

    return {};
}

export const defaultThemePacks: Record<string, UiThemePackDefinition> = {
    'textured-panels': {
        id: 'textured-panels',
        label: 'Textured Panels',
        description: 'Textured cards with 9-slice ornamental borders and warmer editorial chrome.',
        tags: ['texture', 'ornament', '9-slice'],
        skin: defaultUiSkinDefinitions['textured-panels'],
        components: {
            Link: TexturedLink,
            Panel: TexturedPanel,
        },
    },
    'liquid-glass': {
        id: 'liquid-glass',
        label: 'Liquid Glass',
        description: 'Soft glass panels, heavy blur, and luminous call-to-action surfaces.',
        tags: ['glass', 'luminous'],
        skin: defaultUiSkinDefinitions['liquid-glass'],
        components: {
            Button: LiquidButton,
            Panel: LiquidPanel,
        },
    },
    'neo-brutal': {
        id: 'neo-brutal',
        label: 'Neo Brutal',
        description: 'Hard borders, blunt depth, louder iconography, and high-contrast geometry.',
        tags: ['neobrutalism', 'contrast'],
        skin: defaultUiSkinDefinitions['neo-brutal'],
        components: {
            Button: NeoButton,
            Panel: NeoPanel,
        },
        iconRegistry: brutalistIconRegistry,
    },
    'slate-glow': {
        id: 'slate-glow',
        label: 'Slate Glow',
        description: 'Shadowy slate surfaces with subtle glow tuned for operator-heavy UIs.',
        tags: ['slate', 'glow', 'operator'],
        skin: defaultUiSkinDefinitions['slate-glow'],
        components: {
            Panel: SlatePanel,
            Text: SlateText,
        },
    },
};

export function resolveDefaultThemePack(id: string): UiThemePackDefinition {
    return defaultThemePacks[id] ?? defaultThemePacks['slate-glow']!;
}

export function describeThemePackSurface(id: string): {
    pack: UiThemePackDefinition;
    previewStyle: CSSProperties;
} {
    const pack = resolveDefaultThemePack(id);
    return {
        pack: {
            ...pack,
            skin: resolveUiSkin(pack.skin, defaultUiSkinDefinitions),
        },
        previewStyle: previewStyleForPack(pack.id),
    };
}
