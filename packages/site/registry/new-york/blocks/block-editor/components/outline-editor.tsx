'use client';

import {
    BlockNoteSchema,
    defaultBlockSpecs,
    defaultInlineContentSpecs,
    defaultStyleSpecs,
} from '@blocknote/core';
import {
    DragHandleButton,
    SideMenu,
    SideMenuController,
    useCreateBlockNote,
} from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
// import '@blocknote/core/fonts/inter.css';
import '@blocknote/shadcn/style.css';
import './theme.css';
// TODO: make a reusable concept of a useTheme hook - a dependency that is resolved from wherever the user wants - do this by just grabbing it from @/hooks or something.
import { useTheme } from 'next-themes';

export default function OutlineEditor() {
    // Creates a new editor instance.
    const editor = useCreateBlockNote({
        // Sets attributes on DOM elements in the editor.
        // domAttributes: {
        //     // Adds a class to all `blockContainer` elements.
        //     block: {},
        //     blockContent: {},
        //     blockGroup: {},
        //     editor: {},
        //     inlineContent: {},
        // },
        initialContent: [
            { type: 'toggleListItem', content: 'List item 1' },
            { type: 'toggleListItem', content: 'List item 1' },
            { type: 'toggleListItem', content: 'List item 1' },
        ],
    });
    const { theme, resolvedTheme, systemTheme, forcedTheme } = useTheme();

    if (!editor) return null;
    // Renders the editor instance using a React component.
    return (
        <BlockNoteView
            editor={editor}
            sideMenu={false}
            theme={resolvedTheme as 'dark' | 'light'}
            data-theming-css-demo></BlockNoteView>
    );
}
