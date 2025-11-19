import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'
// 注意：已移除 unplugin-element-plus 插件
// 因为样式已通过 SCSS 手动导入（在 src/styles/element/index.scss 中）
// 使用该插件可能会导致样式冲突，覆盖自定义主题
// import ElementPlus from 'unplugin-element-plus/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // 使用绝对根路径，避免部署在子路由刷新时静态资源 404
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dirs: ['src/stores'],
      resolvers: [
        ElementPlusResolver({
          // 自动导入 Element Plus 的 API（如 ElMessage, ElMessageBox, ElNotification 等）
          importStyle: false // 样式已通过 SCSS 导入，不需要自动导入样式
        })
      ],
      dts: true, // 生成类型定义文件
      eslintrc: {
        enabled: true, // 生成 ESLint 配置文件
        filepath: './.eslintrc-auto-import.json' // ESLint 配置文件路径
      }
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: false // 样式已通过 SCSS 导入，不需要自动导入样式
        })
      ]
    })
    // 已移除 ElementPlus 插件，因为样式已通过 SCSS 手动导入
    // 这样可以避免样式冲突，确保自定义主题生效
    // ElementPlus({
    //   useSource: true
    // })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 通过 additionalData 自动导入项目变量
        // 这样所有 SCSS 文件在编译时都会自动包含项目变量
        // 注意：Element Plus 变量覆盖在 element/index.scss 中单独导入，避免重复执行
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
