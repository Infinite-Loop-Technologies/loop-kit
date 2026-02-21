import type { DocDemoSize } from '@/lib/docs/types';

export const SUPPORTED_DEMO_ITEMS = [
    'block-editor',
    'code-editor',
    'dock',
    'physics',
    'shadertoy',
    'graphite-studio',
    'graphite-connectors',
    'graphite-query-table',
] as const;

export type SupportedDemoItem = (typeof SUPPORTED_DEMO_ITEMS)[number];
export type DemoRenderMode = 'inline' | 'iframe';

export const SUPPORTED_PLAYGROUND_PRESETS = ['starter', 'layout'] as const;
export type SupportedPlaygroundPreset =
    (typeof SUPPORTED_PLAYGROUND_PRESETS)[number];

export type DocsContentSegment =
    | {
          type: 'markdown';
          content: string;
      }
    | {
          type: 'demo';
          itemName: SupportedDemoItem;
          size?: DocDemoSize;
          mode: DemoRenderMode;
          title?: string;
      }
    | {
          type: 'registry-item-link';
          itemName: string;
          title?: string;
      }
    | {
          type: 'playground';
          preset: SupportedPlaygroundPreset;
          title?: string;
          height: number;
      };

function normalizeToken(value: string) {
    return value.trim().toLowerCase();
}

function isSupportedDemoItem(value: string): value is SupportedDemoItem {
    return (SUPPORTED_DEMO_ITEMS as readonly string[]).includes(
        normalizeToken(value),
    );
}

function isSupportedPlaygroundPreset(
    value: string,
): value is SupportedPlaygroundPreset {
    return (SUPPORTED_PLAYGROUND_PRESETS as readonly string[]).includes(
        normalizeToken(value),
    );
}

function parseDirectiveAttributes(input: string) {
    const attrs = new Map<string, string>();
    let stripped = input;
    const attrPattern =
        /([a-zA-Z][a-zA-Z0-9_-]*)\s*=\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^\s]+)/g;

    let match: RegExpExecArray | null = null;
    while ((match = attrPattern.exec(input)) !== null) {
        const key = match[1]?.toLowerCase();
        const rawValue = match[2] ?? '';
        if (!key) continue;
        stripped = stripped.replace(match[0], ' ');

        const unquoted =
            (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
            (rawValue.startsWith("'") && rawValue.endsWith("'"))
                ? rawValue.slice(1, -1)
                : rawValue;
        attrs.set(key, unquoted.trim());
    }

    const bare = stripped
        .split(/\s+/)
        .map((part) => part.trim())
        .filter(Boolean);

    return { attrs, bare };
}

function normalizeTitle(value?: string | null) {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return trimmed.slice(0, 120);
}

function toDemoSize(value?: string | null): DocDemoSize {
    return value === 'large' ? 'large' : 'default';
}

function toDemoMode(value?: string | null): DemoRenderMode {
    return value === 'iframe' ? 'iframe' : 'inline';
}

function toPlaygroundHeight(value?: string | null) {
    const next = Number(value);
    if (!Number.isFinite(next)) return 460;
    return Math.min(760, Math.max(320, Math.round(next)));
}

function parseDemoDirective(rawAttrs: string): DocsContentSegment | null {
    const { attrs, bare } = parseDirectiveAttributes(rawAttrs);
    const rawItem = attrs.get('item') ?? attrs.get('name') ?? bare[0];
    if (!rawItem || !isSupportedDemoItem(rawItem)) {
        return null;
    }

    return {
        type: 'demo',
        itemName: normalizeToken(rawItem) as SupportedDemoItem,
        size: attrs.has('size') ? toDemoSize(attrs.get('size')) : undefined,
        mode: toDemoMode(attrs.get('mode')),
        title: normalizeTitle(attrs.get('title')),
    };
}

function parsePlaygroundDirective(rawAttrs: string): DocsContentSegment | null {
    const { attrs, bare } = parseDirectiveAttributes(rawAttrs);
    const rawPreset = attrs.get('preset') ?? attrs.get('id') ?? bare[0];
    if (!rawPreset || !isSupportedPlaygroundPreset(rawPreset)) {
        return null;
    }

    return {
        type: 'playground',
        preset: normalizeToken(rawPreset) as SupportedPlaygroundPreset,
        title: normalizeTitle(attrs.get('title')),
        height: toPlaygroundHeight(attrs.get('height')),
    };
}

function parseRegistryItemLinkDirective(
    rawAttrs: string,
): DocsContentSegment | null {
    const { attrs, bare } = parseDirectiveAttributes(rawAttrs);
    const rawItem = attrs.get('item') ?? attrs.get('name') ?? bare[0];
    if (!rawItem) {
        return null;
    }

    const itemName = normalizeToken(rawItem);
    if (!itemName) {
        return null;
    }

    return {
        type: 'registry-item-link',
        itemName,
        title: normalizeTitle(attrs.get('title')),
    };
}

export function parseDocsContent(content: string): DocsContentSegment[] {
    const source = content ?? '';
    const segments: DocsContentSegment[] = [];
    const directivePattern =
        /\{\{\s*(demo|playground|registry-item-link)\b([^}]*)\}\}/gi;

    let cursor = 0;
    let match: RegExpExecArray | null = null;
    while ((match = directivePattern.exec(source)) !== null) {
        const full = match[0] ?? '';
        const kind = match[1]?.toLowerCase();
        const attrs = match[2] ?? '';
        const start = match.index;
        const end = start + full.length;
        const before = source.slice(cursor, start);

        if (before) {
            segments.push({ type: 'markdown', content: before });
        }

        const parsed =
            kind === 'demo'
                ? parseDemoDirective(attrs)
                : kind === 'playground'
                  ? parsePlaygroundDirective(attrs)
                  : kind === 'registry-item-link'
                    ? parseRegistryItemLinkDirective(attrs)
                    : null;

        if (parsed) {
            segments.push(parsed);
        } else {
            segments.push({ type: 'markdown', content: full });
        }

        cursor = end;
    }

    const trailing = source.slice(cursor);
    if (trailing) {
        segments.push({ type: 'markdown', content: trailing });
    }

    if (segments.length === 0) {
        return [{ type: 'markdown', content: source }];
    }

    return segments;
}
