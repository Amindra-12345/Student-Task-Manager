import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change the proxy target to whatever port the backend listens on.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
})
