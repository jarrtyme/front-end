// 自动导入：createRouter, createWebHistory 等 API 已自动导入
// 注意：在 .js 配置文件中，建议保留手动导入以确保稳定性
import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import homeRoutes from './home'
import layoutRoutes from './layout'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Auth.vue'),
      meta: {
        keepAlive: false,
        title: '登录',
        requiresAuth: false
      }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Auth.vue'),
      meta: {
        keepAlive: false,
        title: '注册',
        requiresAuth: false
      }
    },
    // 首页相关路由
    ...homeRoutes,
    // 后台管理布局相关路由
    ...layoutRoutes
  ]
})

// 路由守卫：处理需要登录的页面和菜单权限
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${import.meta.env.VITE_APP_TITLE || 'Vue3 官网'} - ${to.meta.title}`
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 保存要访问的页面，登录后跳转回来
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 如果已登录且需要菜单权限检查
  if (to.meta.requiresAuth && userStore.isLoggedIn && to.meta.menuKey) {
    // 确保菜单权限已加载
    if (userStore.menuPermissions.length === 0) {
      await userStore.loadMenuPermissions()
    }

    // 检查是否有菜单权限
    if (!userStore.hasMenuPermission(to.meta.menuKey)) {
      // 没有权限，跳转到仪表盘或首页
      ElMessage.warning('您没有访问该页面的权限')
      next('/admin/dashboard')
      return
    }
  }

  // 允许访问
  next()
})

export default router
