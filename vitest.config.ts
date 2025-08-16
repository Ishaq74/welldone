import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
  resolve: {
    alias: {
      '@lib': './src/lib',
      '@components': './src/components',
      '@layouts': './src/layouts',
      '@pages': './src/pages',
    },
  },
});