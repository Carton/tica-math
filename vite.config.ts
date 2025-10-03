import { defineConfig } from 'vite'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  root: 'src',
  publicDir: 'assets',
  base: process.env.NODE_ENV === 'production' ? '/math-game/' : '/', // GitHub Pages路径
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

        // 复制所有配置文件（自动检测目录中的所有文件）
        try {
          const files = fs.readdirSync(configDir);
          files.forEach(file => {
            // 只复制文件（跳过目录）
            const srcPath = path.join(configDir, file);
            const stat = fs.statSync(srcPath);
            if (stat.isFile()) {
              const destPath = path.join(targetDir, file);
              fs.copyFileSync(srcPath, destPath);
              console.log(`✅ 复制配置文件: ${file}`);
            }
          });
        } catch (error) {
          console.error('❌ 复制配置文件时出错:', error);
        }
      }
    }
  ]
})