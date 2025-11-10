/**
 * 首页相关路由配置
 */

const homeRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/Home.vue'),
    meta: {
      keepAlive: true,
      title: '首页',
      requiresAuth: false // 首页不需要登录
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: {
      keepAlive: true,
      title: '关于我们',
      requiresAuth: false
    }
  }
]

export default homeRoutes
