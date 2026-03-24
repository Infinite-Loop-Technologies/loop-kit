import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
    title: 'Forge Prototype',
    description:
        'Forge prototype for policy-aware agent workflows, Jazz-backed collaboration, and OCI-driven runtime control.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang='en'>
            <body>{children}</body>
        </html>
    );
}
