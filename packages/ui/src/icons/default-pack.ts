import {
    Check,
    ChevronRight,
    Menu,
    Moon,
    Search,
    Sun,
    X,
} from 'lucide-react';

import { createIconRegistry } from './registry';

export const defaultIconRegistry = createIconRegistry({
    icons: {
        check: Check,
        chevronRight: ChevronRight,
        menu: Menu,
        moon: Moon,
        search: Search,
        sun: Sun,
        x: X,
    },
});
