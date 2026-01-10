import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use '/' for Vercel unless you are specifically using a sub-path like /my-app/
  base: '/', 
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Cleaning up manualChunks for standard deployments
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 5173,
    host: 'localhost',
    open: true
  }
})