import { defineConfig } from 'vite'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  root: 'src',
  publicDir: 'assets',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/game': resolve(__dirname, 'src/game'),
      '@/assets': resolve(__dirname, 'src/assets')
    }
  },
  css: {
    devSourcemap: true
  },
  optimizeDeps: {
    include: ['phaser']
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'robots.txt'],
      manifest: {
        name: 'Tica 侦探事务所：数字谜案',
        short_name: 'Tica谜案',
        start_url: '.',
        display: 'standalone',
        background_color: '#0b1021',
        theme_color: '#0b1021',
        icons: []
      }
    })
  ]
})