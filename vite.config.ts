import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // 👈 Ensures correct route resolution
  build: {
    outDir: 'dist'
  },
  server: {
    historyApiFallback: true // 👈 Handles local dev routing too
  }
})
