
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const backend = {
  target: 'http://backend:8000',
  changeOrigin: true
}

export default defineConfig({
  plugins: [vue()],

  server: {
    host: '0.0.0.0',
    port: 5173,

    watch: {
      usePolling: true
    },

    proxy: {
      '/api': backend,
      '/sanctum': backend,
      '/login': backend,
      '/register': backend,
      '/logout': backend
    }
  }
})



