import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 只压缩大于 10KB 的文件
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Bundle 分析 - 构建后生成 stats.html
    visualizer({
      open: false, // 构建后不自动打开
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }) as any,
  ],
  build: {
    // 代码分割策略
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心库
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // i18n相关
          'i18n': ['react-i18next', 'i18next'],
          // 工具库
          'utils': ['axios'],
          // 管理后台打包到单独chunk
          'admin': [
            './src/pages/admin/AdminLogin',
            './src/pages/admin/AdminLayout',
            './src/pages/admin/Interpretations',
            './src/pages/admin/Orders',
            './src/pages/admin/Settings',
          ],
        },
      },
    },
    // 生产环境移除 console
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false,
      },
      compress: {
        drop_console: true,
        drop_debugger: true,
      } as any,
    },
    // chunk 大小警告阈值
    chunkSizeWarningLimit: 500,
    // 关闭 sourcemap 减小体积
    sourcemap: false,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
