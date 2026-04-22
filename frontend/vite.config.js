import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Aqui nós conectamos o React e o novo Tailwind v4 juntos!
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Toda vez que o React tentar acessar /api, o Vite redireciona para o backend na porta 3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})