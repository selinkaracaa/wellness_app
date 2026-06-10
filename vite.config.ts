import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Proxy API calls to the Express backend (npm run server / dev:all).
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
