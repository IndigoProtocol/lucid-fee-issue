import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    hookTimeout: 0,
    testTimeout: 500_000,
    reporters: 'verbose',
    include: ['./tests/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
