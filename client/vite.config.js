import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Redirige les appels vers le backend Express pour connecter la carte
  server: {
    proxy: {
      "/locations": "http://localhost:8383"
    }
  }
})
