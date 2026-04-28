import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/FlightScheduler/',
  plugins: [react()],
  server: {
    host: true,
    port: 8080,
    strictPort: true,
  },
})
