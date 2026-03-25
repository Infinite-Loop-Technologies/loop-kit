import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [
        '@loop-kit/dock',
        '@loop-kit/graphite',
        '@loop-kit/graphite-core',
        '@loop-kit/graphite-react',
        '@loop-kit/graphite-systems',
        '@loop-kit/ui',
    ],
    typescript: {
        ignoreBuildErrors: true,
    },
    webpack: (config) => {
        config.resolve.extensionAlias = {
            '.js': ['.ts', '.tsx', '.js'],
            '.mjs': ['.mts', '.mjs'],
        };
        return config;
    },
};

export default withPWA(nextConfig);
