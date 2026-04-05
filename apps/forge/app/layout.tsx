import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { IBM_Plex_Mono, Inter } from 'next/font/google';

import './globals.css';

const forgeSans = Inter({
    subsets: ['latin'],
    variable: '--font-forge-sans',
});

const forgeMono = IBM_Plex_Mono({
    subsets: ['latin'],
    variable: '--font-forge-mono',
    weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
    title: 'Forge Prototype',
    description:
        'Forge prototype for policy-aware agent workflows, Jazz-backed collaboration, and OCI-driven runtime control.',
    icons: {
        icon: '/icon.svg',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang='en'>
            <body className={`${forgeSans.variable} ${forgeMono.variable}`}>{children}</body>
        </html>
    );
}
