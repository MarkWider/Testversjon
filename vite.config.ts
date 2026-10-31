import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Network tests (*.live.test.ts) run only via `pnpm test:live`.
  test: { exclude: ['**/node_modules/**', '**/dist/**', '**/*.live.test.ts'] },
})
