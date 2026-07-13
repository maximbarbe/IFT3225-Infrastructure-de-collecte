import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_URL = "http://localhost:8383";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Redirige les appels vers le backend Express pour connecter la carte
  server: {
    proxy: {
      "/locations": BACKEND_URL,
      "/users/register": BACKEND_URL
    }
  }
})
