// 注意：在 .js 入口文件中，建议保留手动导入以确保稳定性
// 自动导入主要适用于 .vue 组件文件
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// 导入 Element Plus 自定义主题（包含样式和变量配置）
import './styles/element-theme.scss'
// 然后导入我们的全局样式
import './styles/main.scss'
// 最后导入 Element Plus 组件样式覆盖
import './styles/element-plus.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
