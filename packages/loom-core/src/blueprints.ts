export type PrimitiveKey =
    | 'box'
    | 'surface'
    | 'panel'
    | 'scroll-area'
    | 'separator'
    | 'stack'
    | 'inline'
    | 'grid'
    | 'text'
    | 'heading'
    | 'link'
    | 'code'
    | 'button'
    | 'icon-button'
    | 'input'
    | 'text-area'
    | 'checkbox'
    | 'switch'
    | 'select'
    | 'badge'
    | 'dialog'
    | 'menu'
    | 'tabs'
    | 'table';

export type PrimitiveVariantName =
    | 'tone'
    | 'kind'
    | 'size'
    | 'density'
    | 'emphasis'
    | 'interactive';

export type PrimitiveState = {
    active?: boolean;
    checked?: boolean;
    disabled?: boolean;
    focusVisible?: boolean;
    hovered?: boolean;
    invalid?: boolean;
    open?: boolean;
    pressed?: boolean;
    selected?: boolean;
};

export type BlueprintVariantDefinition = {
    values: readonly string[];
    default: string;
};

export type SemanticPropMapping = {
    variant: PrimitiveVariantName;
    values: Record<string, string>;
};

export type PrimitiveBlueprint<TPart extends string = string> = {
    key: PrimitiveKey;
    parts: readonly TPart[];
    variants: Partial<Record<PrimitiveVariantName, BlueprintVariantDefinition>>;
    defaultVariants?: Partial<Record<PrimitiveVariantName, string>>;
    semanticProps?: Record<string, SemanticPropMapping>;
};

export type ResolvedVariantValues = Partial<Record<PrimitiveVariantName, string>>;

function createBlueprint<TPart extends string>(
    blueprint: PrimitiveBlueprint<TPart>,
): PrimitiveBlueprint<TPart> {
    return blueprint;
}

const standardVariants = {
    tone: {
        values: ['neutral', 'accent', 'success', 'warning', 'danger', 'info', 'muted'],
        default: 'neutral',
    },
    kind: {
        values: ['solid', 'outline', 'ghost', 'soft'],
        default: 'solid',
    },
    size: {
        values: ['sm', 'md', 'lg'],
        default: 'md',
    },
    density: {
        values: ['compact', 'comfortable', 'roomy'],
        default: 'comfortable',
    },
    emphasis: {
        values: ['subtle', 'medium', 'strong'],
        default: 'medium',
    },
    interactive: {
        values: ['off', 'on'],
        default: 'on',
    },
} satisfies Record<PrimitiveVariantName, BlueprintVariantDefinition>;

export const primitiveBlueprints = {
    box: createBlueprint({
        key: 'box',
        parts: ['root'],
        variants: {},
    }),
    surface: createBlueprint({
        key: 'surface',
        parts: ['root'],
        variants: {
            tone: standardVariants.tone,
            emphasis: standardVariants.emphasis,
        },
    }),
    panel: createBlueprint({
        key: 'panel',
        parts: ['root', 'header', 'body', 'footer'],
        variants: {
            tone: standardVariants.tone,
            emphasis: standardVariants.emphasis,
            density: standardVariants.density,
        },
    }),
    'scroll-area': createBlueprint({
        key: 'scroll-area',
        parts: ['root', 'viewport'],
        variants: {
            emphasis: standardVariants.emphasis,
        },
    }),
    separator: createBlueprint({
        key: 'separator',
        parts: ['root'],
        variants: {
            tone: standardVariants.tone,
        },
    }),
    stack: createBlueprint({
        key: 'stack',
        parts: ['root'],
        variants: {
            density: standardVariants.density,
        },
    }),
    inline: createBlueprint({
        key: 'inline',
        parts: ['root'],
        variants: {
            density: standardVariants.density,
        },
    }),
    grid: createBlueprint({
        key: 'grid',
        parts: ['root'],
        variants: {
            density: standardVariants.density,
        },
    }),
    text: createBlueprint({
        key: 'text',
        parts: ['root'],
        variants: {
            tone: standardVariants.tone,
            size: standardVariants.size,
            emphasis: standardVariants.emphasis,
        },
    }),
    heading: createBlueprint({
        key: 'heading',
        parts: ['root'],
        variants: {
            tone: standardVariants.tone,
            size: {
                values: ['sm', 'md', 'lg', 'xl'],
                default: 'lg',
            },
            emphasis: standardVariants.emphasis,
        },
    }),
    link: createBlueprint({
        key: 'link',
        parts: ['root'],
        variants: {
            tone: standardVariants.tone,
            emphasis: standardVariants.emphasis,
        },
    }),
    code: createBlueprint({
        key: 'code',
        parts: ['root'],
        variants: {
            tone: standardVariants.tone,
            size: standardVariants.size,
        },
    }),
    button: createBlueprint({
        key: 'button',
        parts: ['root', 'label', 'icon'],
        variants: {
            tone: standardVariants.tone,
            kind: standardVariants.kind,
            size: standardVariants.size,
            interactive: standardVariants.interactive,
        },
        semanticProps: {
            appearance: {
                variant: 'kind',
                values: {
                    primary: 'solid',
                    secondary: 'soft',
                    plain: 'ghost',
                },
            },
        },
    }),
    'icon-button': createBlueprint({
        key: 'icon-button',
        parts: ['root', 'icon'],
        variants: {
            tone: standardVariants.tone,
            kind: standardVariants.kind,
            size: standardVariants.size,
            interactive: standardVariants.interactive,
        },
    }),
    input: createBlueprint({
        key: 'input',
        parts: ['root', 'field', 'prefix', 'suffix'],
        variants: {
            tone: standardVariants.tone,
            size: standardVariants.size,
            emphasis: standardVariants.emphasis,
        },
    }),
    'text-area': createBlueprint({
        key: 'text-area',
        parts: ['root', 'field'],
        variants: {
            tone: standardVariants.tone,
            size: standardVariants.size,
            emphasis: standardVariants.emphasis,
        },
    }),
    checkbox: createBlueprint({
        key: 'checkbox',
        parts: ['root', 'control', 'label'],
        variants: {
            tone: standardVariants.tone,
            size: standardVariants.size,
            interactive: standardVariants.interactive,
        },
    }),
    switch: createBlueprint({
        key: 'switch',
        parts: ['root', 'track', 'thumb', 'label'],
        variants: {
            tone: standardVariants.tone,
            size: standardVariants.size,
            interactive: standardVariants.interactive,
        },
    }),
    select: createBlueprint({
        key: 'select',
        parts: ['root', 'trigger', 'content'],
        variants: {
            tone: standardVariants.tone,
            size: standardVariants.size,
            emphasis: standardVariants.emphasis,
        },
    }),
    badge: createBlueprint({
        key: 'badge',
        parts: ['root'],
        variants: {
            tone: standardVariants.tone,
            kind: standardVariants.kind,
        },
    }),
    dialog: createBlueprint({
        key: 'dialog',
        parts: ['overlay', 'content', 'header', 'body', 'footer'],
        variants: {
            tone: standardVariants.tone,
            emphasis: standardVariants.emphasis,
        },
    }),
    menu: createBlueprint({
        key: 'menu',
        parts: ['trigger', 'content', 'item'],
        variants: {
            tone: standardVariants.tone,
            emphasis: standardVariants.emphasis,
        },
    }),
    tabs: createBlueprint({
        key: 'tabs',
        parts: ['root', 'list', 'trigger', 'content'],
        variants: {
            tone: standardVariants.tone,
            emphasis: standardVariants.emphasis,
        },
    }),
    table: createBlueprint({
        key: 'table',
        parts: ['root', 'head', 'body', 'row', 'cell'],
        variants: {
            tone: standardVariants.tone,
            density: standardVariants.density,
        },
    }),
} satisfies Record<PrimitiveKey, PrimitiveBlueprint<string>>;

export function getBlueprint<TKey extends PrimitiveKey>(
    key: TKey,
): (typeof primitiveBlueprints)[TKey] {
    return primitiveBlueprints[key];
}

export function resolveBlueprintVariants(
    blueprint: PrimitiveBlueprint<string>,
    input?: Record<string, unknown>,
    explicit?: ResolvedVariantValues,
): ResolvedVariantValues {
    const variants: ResolvedVariantValues = {
        ...(blueprint.defaultVariants ?? {}),
    };

    for (const [variantName, definition] of Object.entries(blueprint.variants) as Array<
        [PrimitiveVariantName, BlueprintVariantDefinition]
    >) {
        variants[variantName] = variants[variantName] ?? definition.default;
    }

    for (const [propName, mapping] of Object.entries(blueprint.semanticProps ?? {})) {
        const raw = input?.[propName];
        if (typeof raw !== 'string') {
            continue;
        }
        const mapped = mapping.values[raw];
        if (mapped) {
            variants[mapping.variant] = mapped;
        }
    }

    for (const [variantName, definition] of Object.entries(blueprint.variants) as Array<
        [PrimitiveVariantName, BlueprintVariantDefinition]
    >) {
        const raw = input?.[variantName];
        if (typeof raw === 'string' && definition.values.includes(raw)) {
            variants[variantName] = raw;
        }
    }

    for (const [variantName, value] of Object.entries(explicit ?? {}) as Array<
        [PrimitiveVariantName, string]
    >) {
        const definition = blueprint.variants[variantName];
        if (definition && definition.values.includes(value)) {
            variants[variantName] = value;
        }
    }

    return variants;
}
