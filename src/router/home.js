/**
 * 首页相关路由配置
 */

const homeRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/Home.vue'),
    meta: {
      keepAlive: true,
      title: 'ootd diary',
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
  },
  {
    path: '/clothing/:id',
    name: 'ClothingDetail',
    component: () => import('@/views/Home/Home.vue'),
    meta: {
      keepAlive: false,
      title: '服装详情',
      requiresAuth: false // 公开页面，不需要登录
    }
  }
]

export default homeRoutes
