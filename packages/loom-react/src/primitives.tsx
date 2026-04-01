import * as React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as RadixSelect from '@radix-ui/react-select';
import * as RadixSwitch from '@radix-ui/react-switch';
import * as RadixTabs from '@radix-ui/react-tabs';

import type {
    IconName,
    PrimitiveState,
    PrimitiveVariantName,
    ResolvedStyles,
} from '@loop-kit/loom-core';

import {
    useLoomIcon,
    useLoomPrimitive,
    type LoomImplementationMap,
    type LoomIconComponent,
    type LoomPrimitiveImplementation,
    type LoomPrimitiveImplementationProps,
} from './runtime';

function cx(...values: Array<string | undefined | false>) {
    return values.filter(Boolean).join(' ');
}

function toReactStyle(style?: Record<string, string | number | undefined>): React.CSSProperties | undefined {
    return style ? (style as React.CSSProperties) : undefined;
}

function toDataAttributes(data?: Record<string, string | number | boolean | undefined>) {
    if (!data) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
            const normalized = key.startsWith('data-') ? key : `data-${key}`;
            return [normalized, value];
        }),
    );
}

function mergeRootProps(
    styles: ResolvedStyles,
    className?: string,
    style?: React.CSSProperties,
) {
    const root = styles.root;
    return {
        className: cx(root?.className, className),
        style: {
            ...(toReactStyle(root?.style) ?? {}),
            ...(root?.vars as React.CSSProperties | undefined),
            ...(style ?? {}),
        },
        ...toDataAttributes(root?.data),
    };
}

function stripInternalProps<TProps extends object>(
    props: LoomPrimitiveImplementationProps<TProps>,
) {
    const {
        blueprintKey: _blueprintKey,
        colorMode: _colorMode,
        state: _state,
        styles: _styles,
        tokens: _tokens,
        variants: _variants,
        ...rest
    } = props;

    return rest as TProps;
}

type VariantProps = Partial<Record<PrimitiveVariantName, string>>;

type SpaceTokenKey = '0' | '1' | '2' | '3' | '4' | '5' | '6';
type SizeToken = 'sm' | 'md' | 'lg' | 'xl';
type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
type Kind = 'solid' | 'outline' | 'ghost' | 'soft';
type Density = 'compact' | 'comfortable' | 'roomy';
type Emphasis = 'subtle' | 'medium' | 'strong';

export type CommonPrimitiveProps = {
    className?: string;
    style?: React.CSSProperties;
};

export type BoxProps = React.HTMLAttributes<HTMLDivElement> & CommonPrimitiveProps;
export type SurfaceProps = React.HTMLAttributes<HTMLDivElement> &
    CommonPrimitiveProps &
    VariantProps & {
        tone?: Tone;
        emphasis?: Emphasis;
    };
export type PanelProps = React.HTMLAttributes<HTMLDivElement> &
    CommonPrimitiveProps &
    VariantProps & {
        tone?: Tone;
        density?: Density;
        emphasis?: Emphasis;
    };
export type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> &
    CommonPrimitiveProps &
    VariantProps;
export type SeparatorProps = React.HTMLAttributes<HTMLDivElement> &
    CommonPrimitiveProps & {
        orientation?: 'horizontal' | 'vertical';
        tone?: Tone;
    };
export type StackProps = React.HTMLAttributes<HTMLDivElement> &
    CommonPrimitiveProps &
    VariantProps & {
        gap?: SpaceTokenKey | string;
        align?: React.CSSProperties['alignItems'];
        justify?: React.CSSProperties['justifyContent'];
    };
export type InlineProps = StackProps;
export type GridProps = React.HTMLAttributes<HTMLDivElement> &
    CommonPrimitiveProps &
    VariantProps & {
        columns?: number | string;
        gap?: SpaceTokenKey | string;
    };
export type TextProps = React.HTMLAttributes<HTMLElement> &
    CommonPrimitiveProps &
    VariantProps & {
        as?: 'p' | 'span' | 'div';
        tone?: Tone;
        size?: SizeToken;
        emphasis?: Emphasis;
    };
export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
    CommonPrimitiveProps &
    VariantProps & {
        level?: 1 | 2 | 3 | 4 | 5 | 6;
        tone?: Tone;
        size?: SizeToken;
    };
export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
    CommonPrimitiveProps &
    VariantProps & {
        tone?: Tone;
    };
export type CodeProps = React.HTMLAttributes<HTMLElement> &
    CommonPrimitiveProps &
    VariantProps & {
        tone?: Tone;
        size?: SizeToken;
    };
export type IconProps = CommonPrimitiveProps &
    VariantProps & {
        name: IconName;
        size?: 'sm' | 'md' | 'lg';
        title?: string;
        tone?: Tone;
    };
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
    CommonPrimitiveProps &
    VariantProps & {
        endIcon?: IconName;
        tone?: Tone;
        kind?: Kind;
        size?: 'sm' | 'md' | 'lg';
        startIcon?: IconName;
    };
export type IconButtonProps = Omit<ButtonProps, 'children' | 'endIcon' | 'startIcon'> & {
    label?: string;
    name: IconName;
};
export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
    CommonPrimitiveProps &
    VariantProps & {
        tone?: Tone;
        size?: 'sm' | 'md' | 'lg';
        prefix?: React.ReactNode;
        suffix?: React.ReactNode;
    };
export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
    CommonPrimitiveProps &
    VariantProps & {
        tone?: Tone;
        size?: 'sm' | 'md' | 'lg';
    };
export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> &
    CommonPrimitiveProps &
    VariantProps & {
        label?: React.ReactNode;
        tone?: Tone;
        size?: 'sm' | 'md' | 'lg';
    };
export type SwitchProps = CommonPrimitiveProps &
    VariantProps & {
        checked?: boolean;
        defaultChecked?: boolean;
        disabled?: boolean;
        label?: React.ReactNode;
        onCheckedChange?: (checked: boolean) => void;
        size?: 'sm' | 'md' | 'lg';
        tone?: Tone;
    };
export type SelectOption = {
    label: string;
    value: string;
};
export type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> &
    CommonPrimitiveProps &
    VariantProps & {
        options?: readonly SelectOption[];
        placeholder?: string;
        tone?: Tone;
        size?: 'sm' | 'md' | 'lg';
    };
export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
    CommonPrimitiveProps &
    VariantProps & {
        tone?: Tone;
        kind?: Kind;
    };
export type DialogProps = CommonPrimitiveProps & {
    children?: React.ReactNode;
    description?: React.ReactNode;
    footer?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: React.ReactNode;
    trigger?: React.ReactNode;
};
export type MenuItem = {
    disabled?: boolean;
    id: string;
    label: React.ReactNode;
    onSelect?: () => void;
};
export type MenuProps = CommonPrimitiveProps &
    VariantProps & {
        items: readonly MenuItem[];
        tone?: Tone;
        trigger: React.ReactNode;
    };
export type TabsItem = {
    content: React.ReactNode;
    id: string;
    label: React.ReactNode;
};
export type TabsProps = CommonPrimitiveProps &
    VariantProps & {
        defaultValue?: string;
        items: readonly TabsItem[];
        onValueChange?: (value: string) => void;
        value?: string;
    };
export type TableColumn<TRow> = {
    cell?: (row: TRow) => React.ReactNode;
    header: React.ReactNode;
    key: string;
};
export type TableProps<TRow = Record<string, unknown>> = CommonPrimitiveProps &
    VariantProps & {
        columns: readonly TableColumn<TRow>[];
        rows: readonly TRow[];
    };

function primitiveStateFromProps(props: Record<string, unknown>): PrimitiveState {
    return {
        checked: Boolean(props.checked),
        disabled: Boolean(props.disabled),
        invalid: Boolean(props['aria-invalid']),
        open: Boolean(props.open),
        selected: Boolean(props['aria-selected']),
    };
}

function themedSpace(gap: string | undefined) {
    if (!gap) {
        return undefined;
    }
    if (/^\d$/.test(gap)) {
        return `var(--loom-space-${gap})`;
    }
    return gap;
}

function iconPixelSize(size: string | undefined) {
    switch (size) {
        case 'sm':
            return 14;
        case 'lg':
            return 20;
        case 'xl':
            return 24;
        case 'md':
        default:
            return 16;
    }
}

const MissingIconGlyph: LoomIconComponent = ({ className, size = 16, style, title }) => (
    <svg
        aria-hidden={title ? undefined : true}
        className={className}
        fill='none'
        height={size}
        role='img'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.75'
        style={style}
        viewBox='0 0 24 24'
        width={size}>
        {title ? <title>{title}</title> : null}
        <rect height='14' rx='2.5' width='14' x='5' y='5' />
        <path d='m9 9 6 6' />
        <path d='m15 9-6 6' />
    </svg>
);

type BoxImplementationProps = LoomPrimitiveImplementationProps<BoxProps>;
const BoxImplementation: LoomPrimitiveImplementation<BoxProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => <div {...props} {...mergeRootProps(styles, className, style)} />;

const SurfaceImplementation: LoomPrimitiveImplementation<SurfaceProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => <div {...props} {...mergeRootProps(styles, className, style)} />;

const PanelImplementation: LoomPrimitiveImplementation<PanelProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => <section {...props} {...mergeRootProps(styles, className, style)} />;

const ScrollAreaImplementation: LoomPrimitiveImplementation<ScrollAreaProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => (
    <div
        {...props}
        {...mergeRootProps(styles, className, {
            overflow: 'auto',
            ...style,
        })}
    />
);

const SeparatorImplementation: LoomPrimitiveImplementation<SeparatorProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    orientation = 'horizontal',
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => (
    <div
        {...props}
        {...mergeRootProps(styles, className, {
            height: orientation === 'horizontal' ? 1 : '100%',
            width: orientation === 'horizontal' ? '100%' : 1,
            ...style,
        })}
    />
);

const StackImplementation: LoomPrimitiveImplementation<StackProps> = ({
    align,
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    gap,
    justify,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => (
    <div
        {...props}
        {...mergeRootProps(styles, className, {
            display: 'flex',
            flexDirection: 'column',
            gap: themedSpace(gap),
            alignItems: align,
            justifyContent: justify,
            ...style,
        })}
    />
);

const InlineImplementation: LoomPrimitiveImplementation<InlineProps> = ({
    align,
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    gap,
    justify,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => (
    <div
        {...props}
        {...mergeRootProps(styles, className, {
            display: 'flex',
            flexWrap: 'wrap',
            gap: themedSpace(gap),
            alignItems: align,
            justifyContent: justify,
            ...style,
        })}
    />
);

const GridImplementation: LoomPrimitiveImplementation<GridProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    columns,
    gap,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => (
    <div
        {...props}
        {...mergeRootProps(styles, className, {
            display: 'grid',
            gap: themedSpace(gap),
            gridTemplateColumns:
                typeof columns === 'number'
                    ? `repeat(${columns}, minmax(0, 1fr))`
                    : columns,
            ...style,
        })}
    />
);

const TextImplementation: LoomPrimitiveImplementation<TextProps> = ({
    as = 'p',
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => {
    const Component = as;
    return <Component {...props} {...mergeRootProps(styles, className, style)} />;
};

const HeadingImplementation: LoomPrimitiveImplementation<HeadingProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    level = 2,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => {
    const Tag = `h${level}` as React.ElementType;
    return <Tag {...props} {...mergeRootProps(styles, className, style)} />;
};

const LinkImplementation: LoomPrimitiveImplementation<LinkProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => <a {...props} {...mergeRootProps(styles, className, style)} />;

const CodeImplementation: LoomPrimitiveImplementation<CodeProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => <code {...props} {...mergeRootProps(styles, className, style)} />;

const IconImplementation: LoomPrimitiveImplementation<IconProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    name,
    size = 'md',
    state: _state,
    style,
    styles,
    title,
    tokens: _tokens,
    variants: _variants,
}) => {
    const Glyph = useLoomIcon(name) ?? MissingIconGlyph;

    return (
        <span {...mergeRootProps(styles, className, style)}>
            <Glyph
                className={styles.glyph?.className}
                size={iconPixelSize(size)}
                style={{
                    ...(toReactStyle(styles.glyph?.style) ?? {}),
                    ...(styles.glyph?.vars as React.CSSProperties | undefined),
                }}
                title={title}
            />
        </span>
    );
};

const ButtonImplementation: LoomPrimitiveImplementation<ButtonProps> = ({
    blueprintKey: _blueprintKey,
    children,
    className,
    colorMode: _colorMode,
    endIcon,
    size,
    startIcon,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => {
    const StartGlyph = startIcon ? useLoomIcon(startIcon) ?? MissingIconGlyph : null;
    const EndGlyph = endIcon ? useLoomIcon(endIcon) ?? MissingIconGlyph : null;

    return (
        <button {...props} {...mergeRootProps(styles, className, style)}>
            {StartGlyph ? (
                <StartGlyph
                    className={styles.icon?.className}
                    size={iconPixelSize(size)}
                    style={toReactStyle(styles.icon?.style)}
                />
            ) : null}
            <span className={styles.label?.className} style={toReactStyle(styles.label?.style)}>
                {children}
            </span>
            {EndGlyph ? (
                <EndGlyph
                    className={styles.icon?.className}
                    size={iconPixelSize(size)}
                    style={toReactStyle(styles.icon?.style)}
                />
            ) : null}
        </button>
    );
};

const IconButtonImplementation: LoomPrimitiveImplementation<IconButtonProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    label,
    name,
    size,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => {
    const Glyph = useLoomIcon(name) ?? MissingIconGlyph;

    return (
        <button
            aria-label={label ?? name}
            title={label}
            {...props}
            {...mergeRootProps(styles, className, style)}>
            <Glyph
                className={styles.icon?.className}
                size={iconPixelSize(size)}
                style={toReactStyle(styles.icon?.style)}
            />
        </button>
    );
};

const InputImplementation: LoomPrimitiveImplementation<InputProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    prefix,
    state: _state,
    style,
    styles,
    suffix,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => (
    <label
        {...toDataAttributes(styles.root?.data)}
        className={cx(styles.root?.className)}
        style={{
            ...(toReactStyle(styles.root?.style) ?? {}),
            ...(styles.root?.vars as React.CSSProperties | undefined),
        }}>
        {prefix ? <span>{prefix}</span> : null}
        <input {...props} className={cx(styles.field?.className, className)} style={{ ...(toReactStyle(styles.field?.style) ?? {}), ...(style ?? {}) }} />
        {suffix ? <span>{suffix}</span> : null}
    </label>
);

const TextAreaImplementation: LoomPrimitiveImplementation<TextAreaProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => <textarea {...props} className={cx(styles.field?.className, className)} style={{ ...(toReactStyle(styles.field?.style) ?? {}), ...(style ?? {}) }} />;

const CheckboxImplementation: LoomPrimitiveImplementation<CheckboxProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    label,
    size: _size,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => (
    <label
        className={cx(styles.root?.className)}
        style={toReactStyle(styles.root?.style)}>
        <input {...props} type='checkbox' className={cx(styles.control?.className, className)} style={{ ...(toReactStyle(styles.control?.style) ?? {}), ...(style ?? {}) }} />
        {label ? <span style={toReactStyle(styles.label?.style)}>{label}</span> : null}
    </label>
);

const SwitchImplementation: LoomPrimitiveImplementation<SwitchProps> = ({
    blueprintKey: _blueprintKey,
    checked,
    className,
    colorMode: _colorMode,
    defaultChecked,
    disabled,
    label,
    onCheckedChange,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
}) => (
    <label className={cx(styles.root?.className)} style={toReactStyle(styles.root?.style)}>
        <RadixSwitch.Root
            checked={checked}
            className={cx(styles.track?.className, className)}
            defaultChecked={defaultChecked}
            disabled={disabled}
            onCheckedChange={onCheckedChange}
            style={{ ...(toReactStyle(styles.track?.style) ?? {}), ...(style ?? {}) }}>
            <RadixSwitch.Thumb className={styles.thumb?.className} style={toReactStyle(styles.thumb?.style)} />
        </RadixSwitch.Root>
        {label ? <span style={toReactStyle(styles.label?.style)}>{label}</span> : null}
    </label>
);

const SelectImplementation: LoomPrimitiveImplementation<SelectProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    size,
    options = [],
    placeholder,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    value,
    onChange,
    defaultValue,
    variants: _variants,
    ...props
}) => {
    const Chevron = useLoomIcon('chevronDown') ?? MissingIconGlyph;

    return (
        <span {...mergeRootProps(styles, undefined, undefined)}>
            <select
                {...props}
                className={cx(styles.trigger?.className, className)}
                defaultValue={defaultValue}
                onChange={onChange}
                style={{ ...(toReactStyle(styles.trigger?.style) ?? {}), ...(style ?? {}) }}
                value={value}>
                {placeholder ? <option value=''>{placeholder}</option> : null}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <Chevron
                className={styles.icon?.className}
                size={iconPixelSize(size)}
                style={toReactStyle(styles.icon?.style)}
            />
        </span>
    );
};

const BadgeImplementation: LoomPrimitiveImplementation<BadgeProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
    ...props
}) => <span {...props} {...mergeRootProps(styles, className, style)} />;

const DialogImplementation: LoomPrimitiveImplementation<DialogProps> = ({
    blueprintKey: _blueprintKey,
    children,
    className,
    colorMode: _colorMode,
    description,
    footer,
    onOpenChange,
    open,
    state: _state,
    styles,
    title,
    tokens: _tokens,
    trigger,
    variants: _variants,
}) => (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
        {trigger ? <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger> : null}
        <RadixDialog.Portal>
            <RadixDialog.Overlay className={styles.overlay?.className} style={toReactStyle(styles.overlay?.style)} />
            <RadixDialog.Content className={cx(styles.content?.className, className)} style={toReactStyle(styles.content?.style)}>
                {title ? <RadixDialog.Title>{title}</RadixDialog.Title> : null}
                {description ? <RadixDialog.Description>{description}</RadixDialog.Description> : null}
                <div style={toReactStyle(styles.body?.style)}>{children}</div>
                {footer ? <div style={toReactStyle(styles.footer?.style)}>{footer}</div> : null}
            </RadixDialog.Content>
        </RadixDialog.Portal>
    </RadixDialog.Root>
);

const MenuImplementation: LoomPrimitiveImplementation<MenuProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    items,
    state: _state,
    styles,
    tokens: _tokens,
    trigger,
    variants: _variants,
}) => (
    <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
            <DropdownMenu.Content className={cx(styles.content?.className, className)} style={toReactStyle(styles.content?.style)}>
                {items.map((item) => (
                    <DropdownMenu.Item
                        key={item.id}
                        disabled={item.disabled}
                        onSelect={item.onSelect}
                        style={toReactStyle(styles.item?.style)}>
                        {item.label}
                    </DropdownMenu.Item>
                ))}
            </DropdownMenu.Content>
        </DropdownMenu.Portal>
    </DropdownMenu.Root>
);

const TabsImplementation: LoomPrimitiveImplementation<TabsProps> = ({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    defaultValue,
    items,
    onValueChange,
    state: _state,
    styles,
    tokens: _tokens,
    value,
    variants: _variants,
}) => {
    const initial = value ?? defaultValue ?? items[0]?.id;
    return (
        <RadixTabs.Root className={className} defaultValue={initial} onValueChange={onValueChange} value={value}>
            <RadixTabs.List className={styles.list?.className} style={toReactStyle(styles.list?.style)}>
                {items.map((item) => (
                    <RadixTabs.Trigger
                        key={item.id}
                        className={styles.trigger?.className}
                        style={toReactStyle(styles.trigger?.style)}
                        value={item.id}>
                        {item.label}
                    </RadixTabs.Trigger>
                ))}
            </RadixTabs.List>
            {items.map((item) => (
                <RadixTabs.Content
                    key={item.id}
                    className={styles.content?.className}
                    style={toReactStyle(styles.content?.style)}
                    value={item.id}>
                    {item.content}
                </RadixTabs.Content>
            ))}
        </RadixTabs.Root>
    );
};

const TableImplementation = <TRow,>({
    blueprintKey: _blueprintKey,
    className,
    colorMode: _colorMode,
    columns,
    rows,
    state: _state,
    style,
    styles,
    tokens: _tokens,
    variants: _variants,
}: LoomPrimitiveImplementationProps<TableProps<TRow>>) => (
    <table className={cx(styles.root?.className, className)} style={{ ...(toReactStyle(styles.root?.style) ?? {}), ...(style ?? {}) }}>
        <thead className={styles.head?.className} style={toReactStyle(styles.head?.style)}>
            <tr className={styles.row?.className} style={toReactStyle(styles.row?.style)}>
                {columns.map((column) => (
                    <th key={column.key} className={styles.cell?.className} style={toReactStyle(styles.cell?.style)}>
                        {column.header}
                    </th>
                ))}
            </tr>
        </thead>
        <tbody className={styles.body?.className} style={toReactStyle(styles.body?.style)}>
            {rows.map((row, index) => (
                <tr key={index} className={styles.row?.className} style={toReactStyle(styles.row?.style)}>
                    {columns.map((column) => (
                        <td key={column.key} className={styles.cell?.className} style={toReactStyle(styles.cell?.style)}>
                            {column.cell ? column.cell(row) : null}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    </table>
);

export const defaultLoomImplementationMap: LoomImplementationMap = {
    box: BoxImplementation as LoomPrimitiveImplementation<object>,
    surface: SurfaceImplementation as LoomPrimitiveImplementation<object>,
    panel: PanelImplementation as LoomPrimitiveImplementation<object>,
    'scroll-area': ScrollAreaImplementation as LoomPrimitiveImplementation<object>,
    separator: SeparatorImplementation as LoomPrimitiveImplementation<object>,
    stack: StackImplementation as LoomPrimitiveImplementation<object>,
    inline: InlineImplementation as LoomPrimitiveImplementation<object>,
    grid: GridImplementation as LoomPrimitiveImplementation<object>,
    text: TextImplementation as LoomPrimitiveImplementation<object>,
    heading: HeadingImplementation as LoomPrimitiveImplementation<object>,
    link: LinkImplementation as LoomPrimitiveImplementation<object>,
    code: CodeImplementation as LoomPrimitiveImplementation<object>,
    icon: IconImplementation as LoomPrimitiveImplementation<object>,
    button: ButtonImplementation as LoomPrimitiveImplementation<object>,
    'icon-button': IconButtonImplementation as LoomPrimitiveImplementation<object>,
    input: InputImplementation as LoomPrimitiveImplementation<object>,
    'text-area': TextAreaImplementation as LoomPrimitiveImplementation<object>,
    checkbox: CheckboxImplementation as LoomPrimitiveImplementation<object>,
    switch: SwitchImplementation as LoomPrimitiveImplementation<object>,
    select: SelectImplementation as LoomPrimitiveImplementation<object>,
    badge: BadgeImplementation as LoomPrimitiveImplementation<object>,
    dialog: DialogImplementation as LoomPrimitiveImplementation<object>,
    menu: MenuImplementation as LoomPrimitiveImplementation<object>,
    tabs: TabsImplementation as LoomPrimitiveImplementation<object>,
    table: TableImplementation as LoomPrimitiveImplementation<object>,
};

function renderPrimitive<TProps extends object>(
    key: keyof typeof defaultLoomImplementationMap,
    props: TProps,
) {
    const state = primitiveStateFromProps(props as Record<string, unknown>);
    const { colorMode, Implementation, styles, tokens, variants } = useLoomPrimitive(key, props, state);
    const Component = (Implementation ??
        defaultLoomImplementationMap[key]) as LoomPrimitiveImplementation<TProps>;

    return (
        <Component
            {...props}
            blueprintKey={key}
            colorMode={colorMode}
            state={state}
            styles={styles}
            tokens={tokens}
            variants={variants}
        />
    );
}

export function Box(props: BoxProps) {
    return renderPrimitive('box', props);
}

export function Surface(props: SurfaceProps) {
    return renderPrimitive('surface', props);
}

export function Panel(props: PanelProps) {
    return renderPrimitive('panel', props);
}

export function ScrollArea(props: ScrollAreaProps) {
    return renderPrimitive('scroll-area', props);
}

export function Separator(props: SeparatorProps) {
    return renderPrimitive('separator', props);
}

export function Stack(props: StackProps) {
    return renderPrimitive('stack', props);
}

export function Inline(props: InlineProps) {
    return renderPrimitive('inline', props);
}

export function Grid(props: GridProps) {
    return renderPrimitive('grid', props);
}

export function Text(props: TextProps) {
    return renderPrimitive('text', props);
}

export function Heading(props: HeadingProps) {
    return renderPrimitive('heading', props);
}

export function Link(props: LinkProps) {
    return renderPrimitive('link', props);
}

export function Code(props: CodeProps) {
    return renderPrimitive('code', props);
}

export function Icon(props: IconProps) {
    return renderPrimitive('icon', props);
}

export function Button(props: ButtonProps) {
    return renderPrimitive('button', props);
}

export function IconButton(props: IconButtonProps) {
    return renderPrimitive('icon-button', props);
}

export function Input(props: InputProps) {
    return renderPrimitive('input', props);
}

export function TextArea(props: TextAreaProps) {
    return renderPrimitive('text-area', props);
}

export function Checkbox(props: CheckboxProps) {
    return renderPrimitive('checkbox', props);
}

export function Switch(props: SwitchProps) {
    return renderPrimitive('switch', props);
}

export function Select(props: SelectProps) {
    return renderPrimitive('select', props);
}

export function Badge(props: BadgeProps) {
    return renderPrimitive('badge', props);
}

export function Dialog(props: DialogProps) {
    return renderPrimitive('dialog', props);
}

export function Menu(props: MenuProps) {
    return renderPrimitive('menu', props);
}

export function Tabs(props: TabsProps) {
    return renderPrimitive('tabs', props);
}

export function Table<TRow>(props: TableProps<TRow>) {
    return renderPrimitive('table', props as TableProps<TRow> & Record<string, unknown>);
}
