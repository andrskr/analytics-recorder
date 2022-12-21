import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
    dts(),
  ],
  // define: {
  //   'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  // },
  build: {
    sourcemap: true,
    // leave minification up to consumer applications?
    minify: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AnalyticsRecorder',
      fileName: 'analytics-recorder',
    },
    rollupOptions: {
      external: ['react'],
      output: {
        globals: {
          react: 'React',
        },
      },
    },
  },
});
