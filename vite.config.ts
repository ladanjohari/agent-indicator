import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Two jobs live in this file.
//
// 1. `build.lib` turns src/index.ts into the package other people install.
//    React is marked external so the built file borrows the copy of React the
//    installing app already has, instead of shipping a second one.
// 2. `test` configures Vitest, which reuses this same config so tests see the
//    project exactly the way the app does.
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      // Two entries, two files. `ai-sdk` is a separate one so that installing
      // this package never drags AI SDK shaped code into an app that does not
      // use it.
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        'ai-sdk': resolve(import.meta.dirname, 'src/ai-sdk/index.ts'),
      },
      formats: ['es'],
      cssFileName: 'agent-indicator',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
