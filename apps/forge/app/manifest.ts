import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Forge Prototype',
        short_name: 'Forge',
        description:
            'Policy-aware Forge prototype built on Next.js, Jazz, and an OCI-first local lab.',
        start_url: '/',
        display: 'standalone',
        background_color: '#111318',
        theme_color: '#111318',
        icons: [
            {
                src: '/forge-icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
                purpose: 'any',
            },
        ],
    };
}
