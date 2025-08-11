import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // For local development, don't set base path
  // base: './', // Remove this line for dev
  server: {
    port: 5173,
    host: true,
    open: true
  },
  // Only set base for production deployment
  base: process.env.NODE_ENV === 'production' ? '/ai-chatbot/' : '/',
})
