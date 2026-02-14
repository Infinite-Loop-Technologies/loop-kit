import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    outputFileTracingRoot: path.join(process.cwd(), '../..'),
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '', // Leave empty if no specific port is used
                pathname: '/**', // Matches any path on the hostname
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)', // or '/playground/:path*' if you only need it on a subset
                headers: [
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp',
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
