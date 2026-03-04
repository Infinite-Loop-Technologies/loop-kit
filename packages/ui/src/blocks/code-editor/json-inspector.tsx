/* ------------------------------------------------------------------ */
/* JSON Inspector                                                      */
/* ------------------------------------------------------------------ */

import { EditorView } from '@uiw/react-codemirror';
import { useMemo } from 'react';
import { json } from '@codemirror/lang-json';
import CodeEditor, { CodeEditorProps, myTheme } from './code-editor';

export type JsonInspectorProps = {
    /** Reactive object/value to inspect as JSON. */
    value: unknown;
    /** JSON indentation size. */
    indent?: number;
} & Omit<CodeEditorProps, 'value' | 'extensions' | 'theme'>;

/**
 * Read-only JSON inspector that uses CodeEditor under the hood.
 * Re-renders whenever `value` changes.
 */
export function JsonInspector({
    value,
    indent = 2,
    editable,
    readOnly,
    basicSetup = {
        lineNumbers: true,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
    },
    ...rest
}: JsonInspectorProps) {
    const stringified = useMemo(
        () => safeStringify(value, indent),
        [value, indent]
    );

    return (
        <CodeEditor
            value={stringified}
            extensions={[json(), EditorView.lineWrapping]}
            theme={myTheme}
            editable={false}
            readOnly={true}
            basicSetup={basicSetup}
            {...rest}
        />
    );
}

function safeStringify(value: unknown, indent: number): string {
    const seen = new WeakSet<object>();

    try {
        return JSON.stringify(
            value ?? null,
            (key, val) => {
                if (typeof val === 'bigint') {
                    return `${val.toString()}n`;
                }

                if (val instanceof Map) {
                    return {
                        $type: 'Map',
                        value: Array.from(val.entries()),
                    };
                }

                if (val instanceof Set) {
                    return {
                        $type: 'Set',
                        value: Array.from(val.values()),
                    };
                }

                if (typeof val === 'object' && val !== null) {
                    if (seen.has(val as object)) {
                        return '[Circular]';
                    }
                    seen.add(val as object);
                }

                return val;
            },
            indent
        );
    } catch (error) {
        return `/* Failed to stringify value as JSON */\n${String(error)}`;
    }
}
