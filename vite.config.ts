import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'markdown-loader',
      transform(_code, id) {
        if (id.endsWith('.md')) {
          const content = fs.readFileSync(id, 'utf-8');
          return `export default ${JSON.stringify(content)};`;
        }
      }
    }
  ],
  base: '/opi-sem4-lab3-frontend/',
  css: {
    preprocessorOptions: {
      scss: {
        // Silence Sass deprecation warnings from node_modules
        quietDeps: true,
        // Optional: silence specific deprecations (if quietDeps isn't enough)
        // silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function']
      }
    }
  }
})
