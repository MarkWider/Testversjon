import { defineConfig } from 'vitest/config'

// Network tests only (`pnpm test:live`). Ordinary `pnpm test` excludes these.
export default defineConfig({
  test: { include: ['src/**/*.live.test.ts'] },
})
