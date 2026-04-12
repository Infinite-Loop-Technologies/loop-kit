export type LoomStyleValue = string | number;
export type LoomStyleObject = Record<string, LoomStyleValue | undefined>;
export type LoomDataAttributes = Record<string, string | number | boolean | undefined>;
export type LoomCssVariables = Record<`--${string}`, LoomStyleValue | undefined>;

/**
 * ResolvedStyles is the renderer-facing output of recipe resolution.
 * Implementation components consume this structure to attach classes, inline
 * styles, data attributes, and CSS variables to concrete DOM.
 */
export type PartStyles = {
    className?: string;
    style?: LoomStyleObject;
    data?: LoomDataAttributes;
    vars?: LoomCssVariables;
};

export type ResolvedStyles<TPart extends string = string> = Partial<Record<TPart, PartStyles>>;

export function mergePartStyles(left?: PartStyles, right?: PartStyles): PartStyles | undefined {
    if (!left && !right) {
        return undefined;
    }

    return {
        className: [left?.className, right?.className].filter(Boolean).join(' ') || undefined,
        style: {
            ...(left?.style ?? {}),
            ...(right?.style ?? {}),
        },
        data: {
            ...(left?.data ?? {}),
            ...(right?.data ?? {}),
        },
        vars: {
            ...(left?.vars ?? {}),
            ...(right?.vars ?? {}),
        },
    };
}

export function mergeResolvedStyles<TPart extends string = string>(
    base?: ResolvedStyles<TPart>,
    override?: ResolvedStyles<TPart>,
): ResolvedStyles<TPart> {
    const next: ResolvedStyles<TPart> = {
        ...(base ?? {}),
    };

    for (const part of Object.keys(override ?? {}) as TPart[]) {
        next[part] = mergePartStyles(base?.[part], override?.[part]);
    }

    return next;
}
