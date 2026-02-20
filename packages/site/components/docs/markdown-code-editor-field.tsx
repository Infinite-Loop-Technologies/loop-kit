'use client';

import { useEffect, useMemo, useState } from 'react';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';

import CodeEditor from '@/registry/new-york/blocks/code-editor/components/code-editor';
import { cn } from '@/lib/utils';

type MarkdownCodeEditorFieldProps = {
    id: string;
    name?: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (nextValue: string) => void;
    height?: string;
    className?: string;
};

export function MarkdownCodeEditorField({
    id,
    name,
    value,
    defaultValue = '',
    onValueChange,
    height = '420px',
    className,
}: MarkdownCodeEditorFieldProps) {
    const isControlled = typeof value === 'string';
    const [internalValue, setInternalValue] = useState(defaultValue);

    useEffect(() => {
        if (!isControlled) {
            setInternalValue(defaultValue);
        }
    }, [defaultValue, isControlled]);

    const currentValue = isControlled ? value : internalValue;
    const extensions = useMemo(
        () => [
            markdown({
                base: markdownLanguage,
                codeLanguages: languages,
            }),
        ],
        []
    );

    function handleValueChange(nextValue: string) {
        if (!isControlled) {
            setInternalValue(nextValue);
        }
        onValueChange?.(nextValue);
    }

    return (
        <div className={cn('overflow-hidden rounded-md border', className)}>
            <CodeEditor
                id={id}
                value={currentValue}
                height={height}
                extensions={extensions}
                onChange={handleValueChange}
            />
            {name ? (
                <input type='hidden' name={name} value={currentValue} />
            ) : null}
        </div>
    );
}
