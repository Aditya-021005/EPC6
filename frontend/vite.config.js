import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://13.60.94.157:8005',
        changeOrigin: true,
      },
      '/images': {
        target: 'http://13.60.94.157:8005',
        changeOrigin: true,
        rewrite: (path) => `/static${path}`,
      },
      '/media': {
        target: 'http://13.60.94.157:8005',
        changeOrigin: true,
      },
    },
  },
})
