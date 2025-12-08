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
    path: '/pageid/:id',
    name: 'PageDetail',
    component: () => import('@/views/Home/Home.vue'),
    meta: {
      keepAlive: false,
      title: '木木的ootd',
      requiresAuth: false // 公开页面，不需要登录
    }
  }
]

export default homeRoutes
