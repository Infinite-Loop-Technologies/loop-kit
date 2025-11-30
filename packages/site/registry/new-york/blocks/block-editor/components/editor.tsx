'use client';

import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
// import '@blocknote/core/fonts/inter.css';
// import '@blocknote/shadcn/style.css';
import './theme.css';
// TODO: make a reusable concept of a useTheme hook - a dependency that is resolved from wherever the user wants - do this by just grabbing it from @/hooks or something.
import { useTheme } from 'next-themes';

export default function Editor() {
    // Creates a new editor instance.
    const editor = useCreateBlockNote();
    const { theme, resolvedTheme, systemTheme, forcedTheme } = useTheme();

    if (!editor) return null;
    // Renders the editor instance using a React component.
    return (
        <>
            <h1>{resolvedTheme}</h1>
            <BlockNoteView
                editor={editor}
                shadCNComponents={
                    {
                        // Pass modified ShadCN components from your project here.
                        // Otherwise, the default ShadCN components will be used.
                    }
                }
                // theme={resolvedTheme as 'dark' | 'light'}
                className='bn-container'
                data-theming-css-demo
            />
        </>
    );
}
