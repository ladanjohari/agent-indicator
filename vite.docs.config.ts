import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The docs site is its own small app. It imports the library from source, so
// an example on the page cannot drift from the component it documents.
//
// `base` matters: GitHub Pages serves this from a folder named after the repo,
// not from the root of the domain, so every asset path needs that prefix.
export default defineConfig({
  root: 'docs',
  base: '/agent-indicator/',
  plugins: [react()],
  // Its own port, so the docs site and the workbench can run side by side.
  // PORT wins when something else has already taken 5174.
  server: { port: Number(process.env.PORT) || 5174 },
  build: {
    outDir: '../dist-docs',
    emptyOutDir: true,
  },
})
