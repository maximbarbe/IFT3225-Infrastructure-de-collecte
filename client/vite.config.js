import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from "dotenv";
dotenv.config()


const BACKEND_URL = process.env.BACKEND_URL

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Redirige les appels vers le backend Express pour connecter la carte
  server: {
    proxy: {
      "/locations": BACKEND_URL,
      "/locations/active": BACKEND_URL,
      "/users": BACKEND_URL,
      "/ambiance": BACKEND_URL,
      '/observations': BACKEND_URL
    }
  }
})
