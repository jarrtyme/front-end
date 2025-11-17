<template>
  <div class="apple-layout">
    <!-- 顶部导航栏 -->
    <header class="apple-header" :class="{ 'header-scrolled': isScrolled }">
      <nav class="nav-container">
        <ul class="nav-menu">
          <li
            v-for="menu in menuItems"
            :key="menu.key"
            class="nav-item"
            :class="{ active: activeMenu === menu.key }"
            @mouseenter="handleMenuEnter(menu.key)"
            @mouseleave="handleMenuLeave(menu.key)"
          >
            <span class="nav-link" @click="handleMenuClick(menu)">{{ menu.label }}</span>

            <!-- 下拉菜单 -->
            <div
              v-if="menu.children && menu.children.length > 0"
              class="dropdown-menu"
              :class="{ show: activeDropdown === menu.key }"
              @mouseenter="handleMenuEnter(menu.key)"
              @mouseleave="handleMenuLeave(menu.key)"
            >
              <div class="dropdown-content">
                <div
                  v-for="child in menu.children"
                  :key="child.key"
                  class="dropdown-item"
                  :class="{ active: route.path === child.path }"
                  @click="handleSubMenuClick(child)"
                >
                  <div class="dropdown-item-content">
                    <div class="dropdown-item-title">{{ child.label }}</div>
                    <div v-if="child.description" class="dropdown-item-desc">
                      {{ child.description }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>

        <!-- 右侧用户信息 -->
        <div class="nav-right">
          <div
            class="user-menu"
            @mouseenter="handleUserMenuEnter"
            @mouseleave="handleUserMenuLeave"
          >
            <div class="user-avatar">
              <el-avatar :size="28" :src="userStore.userInfo?.avatar">
                {{ userStore.userName?.charAt(0) || 'U' }}
              </el-avatar>
            </div>
            <div
              class="user-dropdown"
              :class="{ show: showUserDropdown }"
              @mouseenter="handleUserMenuEnter"
              @mouseleave="handleUserMenuLeave"
            >
              <div class="user-info">
                <div class="user-name">{{ userStore.userName || '管理员' }}</div>
                <div class="user-email">{{ userStore.userInfo?.email || '' }}</div>
              </div>
              <div class="user-dropdown-divider"></div>
              <div class="user-dropdown-item" @click="handleProfile">
                <el-icon><User /></el-icon>
                <span>个人中心</span>
              </div>
              <div class="user-dropdown-item" @click="handleSettings">
                <el-icon><Setting /></el-icon>
                <span>设置</span>
              </div>
              <div class="user-dropdown-divider"></div>
              <div class="user-dropdown-item logout" @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <!-- 主内容区域 -->
    <main class="apple-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { User, Setting, SwitchButton } from '@element-plus/icons-vue'

defineOptions({
  name: 'AdminLayout'
})

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 滚动状态
const isScrolled = ref(false)

// 激活的下拉菜单
const activeDropdown = ref('')
const showUserDropdown = ref(false)

// 菜单项配置
const menuItems = ref([
  {
    key: 'dashboard',
    label: '仪表盘',
    path: '/admin/dashboard',
    children: []
  },
  {
    key: 'management',
    label: '管理',
    path: '/admin',
    children: [
      {
        key: 'users',
        label: '用户管理',
        path: '/admin/users',
        description: '管理系统用户和权限'
      },
      {
        key: 'clothing',
        label: '服装管理',
        path: '/admin/clothing',
        description: '管理服装信息和库存'
      },
      {
        key: 'page-components',
        label: '组件管理',
        path: '/admin/page-components',
        description: '管理页面组件，包含媒体和描述'
      },
      {
        key: 'pages',
        label: '页面管理',
        path: '/admin/pages',
        description: '管理页面配置，组合多个组件'
      }
    ]
  },
  {
    key: 'tools',
    label: '工具',
    path: '/admin',
    children: [
      {
        key: 'upload',
        label: '文件管理',
        path: '/admin/upload',
        description: '上传和管理文件，支持媒体库描述管理'
      }
    ]
  },
  {
    key: 'settings',
    label: '设置',
    path: '/admin/settings',
    children: []
  }
])

// 当前激活的菜单
const activeMenu = computed(() => {
  const path = route.path
  for (const menu of menuItems.value) {
    if (path.startsWith(menu.path)) {
      return menu.key
    }
  }
  return ''
})

// 处理菜单鼠标进入
const handleMenuEnter = key => {
  activeDropdown.value = key
}

// 处理菜单鼠标离开
const handleMenuLeave = key => {
  setTimeout(() => {
    if (activeDropdown.value === key) {
      activeDropdown.value = ''
    }
  }, 100)
}

// 处理菜单点击（无子菜单时直接跳转）
const handleMenuClick = menu => {
  if (!menu.children || menu.children.length === 0) {
    router.push(menu.path)
    activeDropdown.value = ''
  }
}

// 处理子菜单点击
const handleSubMenuClick = child => {
  router.push(child.path)
  activeDropdown.value = ''
}

// 处理用户菜单
const handleUserMenuEnter = () => {
  showUserDropdown.value = true
}

const handleUserMenuLeave = () => {
  setTimeout(() => {
    showUserDropdown.value = false
  }, 100)
}

// 处理个人中心
const handleProfile = () => {
  router.push('/admin/profile')
  showUserDropdown.value = false
}

// 处理设置
const handleSettings = () => {
  router.push('/admin/settings')
  showUserDropdown.value = false
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    // 用户取消操作
  } finally {
    showUserDropdown.value = false
  }
}

// 监听滚动
onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 10
  }
  window.addEventListener('scroll', handleScroll)
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>

<style lang="scss" scoped>
.apple-layout {
  min-height: 100vh;
  background-color: #f5f5f7;
}

.apple-header {
  position: sticky;
  top: 0;
  z-index: 18;
  background-color: rgba(255, 255, 255, 0.463);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &.header-scrolled {
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
}

.nav-logo {
  font-size: 17px;
  font-weight: 400;
  color: #1d1d1f;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.7;
  }
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0;
  flex: 1;
  justify-content: center;
}

.nav-item {
  position: relative;
  margin: 0 8px;

  &.active {
    .nav-link {
      color: #1d1d1f;
    }
  }
}

.nav-link {
  display: block;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 400;
  color: #1d1d1f;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.3s;
  line-height: 44px;
  white-space: nowrap;

  &:hover {
    opacity: 0.7;
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top center;

  &.show {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    margin-top: 8px;
  }
}

.dropdown-content {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-radius: 12px;
  padding: 8px 0;
  min-width: 240px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 0.5px solid rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &.active {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.dropdown-item-content {
  .dropdown-item-title {
    font-size: 13px;
    font-weight: 400;
    color: #1d1d1f;
    margin-bottom: 2px;
  }

  .dropdown-item-desc {
    font-size: 11px;
    color: #86868b;
    line-height: 1.4;
  }
}

.nav-right {
  display: flex;
  align-items: center;
}

.user-menu {
  position: relative;
}

.user-avatar {
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.7;
  }
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-radius: 12px;
  padding: 8px 0;
  min-width: 200px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 0.5px solid rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(-8px);

  &.show {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0);
  }
}

.user-info {
  padding: 12px 16px;

  .user-name {
    font-size: 13px;
    font-weight: 500;
    color: #1d1d1f;
    margin-bottom: 4px;
  }

  .user-email {
    font-size: 11px;
    color: #86868b;
  }
}

.user-dropdown-divider {
  height: 0.5px;
  background-color: rgba(0, 0, 0, 0.1);
  margin: 8px 0;
}

.user-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 13px;
  color: #1d1d1f;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &.logout {
    color: #ff3b30;
  }

  .el-icon {
    font-size: 16px;
  }
}

.apple-main {
  min-height: calc(100vh - 44px);
  padding: 0;
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式设计
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .nav-container {
    padding: 0 16px;
  }
}
</style>
