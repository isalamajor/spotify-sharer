import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Redirige las importaciones de 'url' usadas por dependencias a nuestro shim
      'url': path.resolve(__dirname, 'src/shims/url.js'),
      'node:url': path.resolve(__dirname, 'src/shims/url.js'),
    }
  },
  optimizeDeps: {
    exclude: ['lightningcss']
  },
})
