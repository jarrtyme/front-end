import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'
import ElementPlus from 'unplugin-element-plus/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // 生产环境使用相对路径，便于部署
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dirs: ['src/stores'],
      resolvers: [ElementPlusResolver()],
      dts: true,
      eslintrc: {
        enabled: true
      }
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: false
        })
      ]
    }),
    ElementPlus({
      useSource: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`,
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import']
      }
    }
  },
  server: {
    host: '0.0.0.0', // 监听所有网络接口，允许通过 IP 地址访问
    port: 8080,
    open: true,
    https: false, // 开发服务器使用 HTTP，如果需要 HTTPS 可以设置为 true
    proxy: {
      '/api': {
        // 使用环境变量配置代理目标，开发环境代理到本地后端
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
        secure: false, // 允许 HTTPS 请求代理到 HTTP 服务器（开发环境）
        ws: true // 支持 WebSocket
      }
    }
  },
  build: {
    outDir: 'dist', // 构建输出目录
    assetsDir: 'assets', // 静态资源目录
    sourcemap: false, // 生产环境不生成 sourcemap，减小体积
    minify: 'esbuild', // 使用 esbuild 压缩（Vite 默认，速度快）
    chunkSizeWarningLimit: 1000, // chunk 大小警告阈值（KB）
    rollupOptions: {
      output: {
        // 手动分包，优化加载性能
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus', '@element-plus/icons-vue']
        }
      }
    },
    // 生产环境移除 console 和 debugger
    esbuild: {
      drop: ['console', 'debugger']
    }
  }
})
