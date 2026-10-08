import { defineConfig } from 'vite';
export default defineConfig({ base: '/vendor/whiteboard/', build: { outDir: '../../vendor/whiteboard', emptyOutDir: true, chunkSizeWarningLimit: 1500 } });
