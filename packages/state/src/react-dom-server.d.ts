import type * as React from 'react';

declare module 'react-dom/server' {
    export function renderToString(element: React.ReactNode): string;
}
