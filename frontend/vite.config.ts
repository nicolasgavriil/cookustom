import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const validateEnvironment = (command: string, mode: string) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (command === 'build' && !env.VITE_API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL must be set for production builds')
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  validateEnvironment(command, mode)

  return {
    plugins: [react(), tailwindcss()],
  }
})
