import {
    Check,
    ChevronRight,
    Copy,
    Menu,
    Moon,
    Plus,
    Redo2,
    Search,
    Settings2,
    Sun,
    Undo2,
    Wrench,
    X,
} from 'lucide-react';

import { createIconRegistry } from './registry';

export const defaultIconRegistry = createIconRegistry({
    icons: {
        check: Check,
        chevronRight: ChevronRight,
        copy: Copy,
        menu: Menu,
        moon: Moon,
        plus: Plus,
        redo2: Redo2,
        search: Search,
        settings2: Settings2,
        sun: Sun,
        undo2: Undo2,
        wrench: Wrench,
        x: X,
    },
});
