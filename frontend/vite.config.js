import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Aqui nós conectamos o React e o novo Tailwind v4 juntos!
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})