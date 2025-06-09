import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '10.90.25.125',
    port: 3002,
    proxy: {
      "/api": {
        target: "http://10.90.25.125:5000",
        changeOrigin: true,
      },
    },
  },
})
