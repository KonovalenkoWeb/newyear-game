/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build'],
  },
  resolve: {
    alias: {
      '@shared': new URL('./packages/shared/src', import.meta.url).pathname,
      // TODO: Lägg till när server och web skapas
      // '@server': new URL('./apps/server/src', import.meta.url).pathname,
      // '@web': new URL('./apps/web/src', import.meta.url).pathname,
    },
  },
});