import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', '')
  const apiUrl = env.VITE_API_URL || ''
  const isLocalhost = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')
  const isProduction = mode === 'production'
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    base: isProduction && !isLocalhost ? '/' : './',
    server: {
      port: 5175,
      proxy: (isProduction || !isLocalhost) && apiUrl ? undefined : {   
        '/api': {
          target: 'http://localhost:5005',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:5005',
          changeOrigin: true,
        }
      }
    }
  }
})
