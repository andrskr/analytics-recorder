import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts()],
  build: {
    sourcemap: true,
    // leave minification up to consumer applications
    minify: false,
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'AnalyticsRecorder',
      fileName: 'analytics-recorder',
    },
    rollupOptions: {
      external: ['React'],
      output: {
        globals: {
          react: 'React',
        },
      },
    },
  },
});
