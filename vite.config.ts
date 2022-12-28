/// <reference types="vitest" />

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
    dts({ insertTypesEntry: true }),
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
  test: {
    mockReset: true,
    environment: 'happy-dom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      clean: true,
      all: true,
      include: ['src/**/*.ts?(x)'],
      exclude: ['src/tests/**/*'],
      lines: 75,
      functions: 75,
      branches: 75,
      statements: 75,
    },
  },
});
