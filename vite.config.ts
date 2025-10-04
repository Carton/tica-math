import { defineConfig } from 'vite'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  root: 'src',
  publicDir: 'assets',
  base: process.env.NODE_ENV === 'production' ? '/tica-math/' : '/', // GitHub Pages路径
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500, // 增加警告限制到 1500KB
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      },
      output: {
        manualChunks: {
          // 将 Phaser 单独分离出来
          phaser: ['phaser'],
          // 将其他大的第三方库分离
          vendor: ['workbox-precaching', 'workbox-routing', 'workbox-strategies', 'workbox-expiration']
        }
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
      strategies: 'generateSW',
      precacheEntries: [
        // 预缓存核心图片文件
        'images/bg_office.jpg',
        'images/bg_desk.jpg',
        'images/paper_note.webp',
        'images/stamp_true.webp',
        'images/stamp_false.webp',
        'images/icons_magnify.png',
        'images/icons_watch.png',
        'images/icons_light.png',
      ],
      runtimeCaching: [
        {
          urlPattern: /^https?:\/\/.*\.(?:ogg|mp3)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'audio-cache',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
      manifest: {
        name: 'Tica 侦探事务所：数字谜案',
        short_name: 'Tica 数字谜案',
        start_url: '.',
        display: 'standalone',
        background_color: '#0b1021',
        theme_color: '#0b1021',
        icons: [],
        description: '一款侦探主题的数学学习游戏，教导孩子快速计算验证技巧',
        categories: ['education', 'games', 'puzzle'],
        lang: 'zh-CN'
      }
    }),
    {
      name: 'copy-game-config',
      closeBundle() {
        // 复制游戏配置文件
        const configDir = path.join(__dirname, 'src/game/config');
        const targetDir = path.join(__dirname, 'dist/game/config');

        // 确保目标目录存在
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // 复制所有 JSON 配置文件（自动检测目录中的 *.json 文件）
        try {
          const files = fs.readdirSync(configDir);
          files.forEach(file => {
            // 只复制 .json 文件
            if (file.endsWith('.json')) {
              const srcPath = path.join(configDir, file);
              const destPath = path.join(targetDir, file);
              if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, destPath);
                console.log(`✅ 复制配置文件: ${file}`);
              }
            }
          });
        } catch (error) {
          console.error('❌ 复制配置文件时出错:', error);
        }
      }
    }
  ]
})