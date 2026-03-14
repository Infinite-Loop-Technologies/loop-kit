import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: '127.0.0.1',
        port: 4173,
        strictPort: true,
        fs: {
            allow: [path.resolve(__dirname, '../..')],
        },
    },
    preview: {
        host: '127.0.0.1',
        port: 4173,
        strictPort: true,
    },
    resolve: {
        dedupe: ['react', 'react-dom'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
