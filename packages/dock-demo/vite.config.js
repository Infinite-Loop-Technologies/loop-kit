import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@loop-kit/graphite': resolve(__dirname, '../graphite/src/index.ts'),
            '@loop-kit/dock': resolve(__dirname, '../dock/src/index.ts'),
        },
    },
});
