import { createCliRenderer } from '@opentui/core';
import { createRoot } from '@opentui/react';
import {
    CanvasApp,
    disableMouse,
    showCursor,
    exitAltBuffer,
} from './__internal/tui';
import Entry from './entry';

async function main() {
    const renderer = await createCliRenderer();
    createRoot(renderer).render(<Entry />);
}

main().catch((err) => {
    disableMouse();
    showCursor();
    exitAltBuffer();
    console.error(err);
    process.exit(1);
});
