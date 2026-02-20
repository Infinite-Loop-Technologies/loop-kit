'use client';

import { useCallback } from 'react';
import CodeMirror, {
    type ReactCodeMirrorProps,
} from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';

const defaultDemoCode = `console.log('TODO: Add syntax highlighting.');`;

/**
 * CodeMirror theme using ONLY CSS variables.
 * These point directly at your ShadCN/Tailwind tokens.
 */
export const myTheme = createTheme({
    theme: 'light', // doesn't matter; vars override everything
    settings: {
        background: 'var(--background)',
        backgroundImage: '',
        foreground: 'var(--foreground)',
        caret: 'var(--primary)',

        // selection
        selection: 'color-mix(in oklch, var(--primary) 25%, transparent)',
        selectionMatch: 'color-mix(in oklch, var(--primary) 25%, transparent)',

        // line highlight
        lineHighlight: 'color-mix(in oklch, var(--foreground) 8%, transparent)',

        // gutters
        gutterBackground: 'var(--background)',
        gutterForeground: 'var(--muted-foreground)',
    },

    styles: [
        { tag: t.comment, color: 'var(--muted-foreground)' },

        // variables & identifiers
        { tag: t.variableName, color: 'var(--primary)' },

        // strings
        {
            tag: [t.string, t.special(t.brace)],
            color: 'var(--accent-foreground)',
        },

        // literals
        {
            tag: [t.number, t.bool, t.null],
            color: 'var(--secondary-foreground)',
        },

        // keywords / operators
        { tag: t.keyword, color: 'var(--primary)' },
        { tag: t.operator, color: 'var(--foreground)' },

        // types / classes
        { tag: t.className, color: 'var(--foreground)' },
        { tag: t.definition(t.typeName), color: 'var(--foreground)' },
        { tag: t.typeName, color: 'var(--foreground)' },

        // jsx-ish tags
        { tag: t.angleBracket, color: 'var(--foreground)' },
        { tag: t.tagName, color: 'var(--primary)' },
        { tag: t.attributeName, color: 'var(--muted-foreground)' },
    ],
});

/**
 * Thin wrapper around @uiw/react-codemirror, with:
 * - same default behavior as before (markdown demo)
 * - ability to override value / extensions / props.
 */
export type CodeEditorProps = ReactCodeMirrorProps;

export default function CodeEditor(props: CodeEditorProps) {
    const { value, extensions, theme, onChange, onUpdate, ...rest } = props;

    const finalValue = value ?? defaultDemoCode;
    const finalExtensions = extensions ?? [
        markdown({
            base: markdownLanguage,
            codeLanguages: languages,
        }),
    ];

    const handleUpdate = useCallback<NonNullable<ReactCodeMirrorProps['onUpdate']>>(
        (viewUpdate) => {
            if (typeof onChange === 'function' && viewUpdate.docChanged) {
                onChange(viewUpdate.state.doc.toString(), viewUpdate);
            }
            onUpdate?.(viewUpdate);
        },
        [onChange, onUpdate]
    );

    return (
        <CodeMirror
            value={finalValue}
            extensions={finalExtensions}
            theme={theme ?? myTheme}
            onChange={undefined}
            onUpdate={handleUpdate}
            {...rest}
        />
    );
}
