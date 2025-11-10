/**
 * 后台管理布局相关路由配置
 */

const layoutRoutes = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/LayOut/layout.vue'),
    redirect: '/admin/dashboard',
    meta: {
      title: '后台管理',
      requiresAuth: true
    },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/LayOut/pages/dashboard/Dashboard.vue'),
        meta: {
          title: '仪表盘',
          requiresAuth: true
        }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/LayOut/pages/management/Users.vue'),
        meta: {
          title: '用户管理',
          requiresAuth: true
        }
      },
      {
        path: 'clothing',
        name: 'AdminClothing',
        component: () => import('@/views/LayOut/pages/management/ClotherMangement.vue'),
        meta: {
          title: '服装管理',
          requiresAuth: true
        }
      },
      {
        path: 'upload',
        name: 'AdminUpload',
        component: () => import('@/views/LayOut/pages/tools/Upload.vue'),
        meta: {
          title: '文件管理',
          requiresAuth: true
        }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/LayOut/pages/settings/Settings.vue'),
        meta: {
          title: '系统设置',
          requiresAuth: true
        }
      }
    ]
  }
]

export default layoutRoutes
