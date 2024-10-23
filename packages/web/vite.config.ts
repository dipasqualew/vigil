import * as path from 'path';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';


export default defineConfig({
    plugins: [vue()],
    define: {
        global: {},
    },
    resolve: {
        alias: {
            '~/web': path.resolve(__dirname, './src'),
        },
    },
    build: {
        sourcemap: true, // Ensures source maps are included in the build
    },
});


