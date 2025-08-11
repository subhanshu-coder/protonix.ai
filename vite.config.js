import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/protonix.ai/', // Your new repository name
  server: {
    port: 5173,
    host: true,
    open: true
  }
})
