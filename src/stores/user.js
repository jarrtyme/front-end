import { defineStore } from 'pinia'
import { login as loginApi } from '@/api/auth'
import { getMyMenuPermissions } from '@/api/menuPermission'

export const useUserStore = defineStore('user', {
  state: () => {
    // 初始化时从存储中读取 token 和用户信息
    // 优先从 localStorage 读取，如果没有则从 sessionStorage 读取
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || ''
    const userInfoStr =
      localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || 'null'
    const userInfo = JSON.parse(userInfoStr)
    // 根据存储位置判断是否记住我
    const rememberMe = !!localStorage.getItem('token')

    return {
      token,
      userInfo,
      rememberMe,
      menuPermissions: [] // 菜单权限列表
    }
  },

  getters: {
    isLoggedIn: state => !!state.token,
    userName: state => state.userInfo?.username || '',
    userId: state => state.userInfo?.id || '',
    userRole: state => state.userInfo?.role || 'user',
    userVipLevel: state => state.userInfo?.vipLevel || 0,
    hasMenuPermission: state => {
      return menuKey => {
        // 如果没有菜单权限列表，返回false
        if (!state.menuPermissions || state.menuPermissions.length === 0) {
          return false
        }
        return state.menuPermissions.includes(menuKey)
      }
    }
  },

  actions: {
    // 设置 token（根据 rememberMe 选择存储方式）
    setToken(token, rememberMe = this.rememberMe) {
      this.token = token

      // 清除旧的存储
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')

      if (token) {
        if (rememberMe) {
          // 记住我：存储在 localStorage（持久化）
          localStorage.setItem('token', token)
        } else {
          // 不记住我：存储在 sessionStorage（会话级）
          sessionStorage.setItem('token', token)
        }
      }
    },

    // 设置用户信息（根据 rememberMe 选择存储方式）
    setUserInfo(userInfo, rememberMe = this.rememberMe) {
      this.userInfo = userInfo

      // 清除旧的存储
      localStorage.removeItem('userInfo')
      sessionStorage.removeItem('userInfo')

      if (userInfo) {
        const userInfoStr = JSON.stringify(userInfo)
        if (rememberMe) {
          // 记住我：存储在 localStorage（持久化）
          localStorage.setItem('userInfo', userInfoStr)
        } else {
          // 不记住我：存储在 sessionStorage（会话级）
          sessionStorage.setItem('userInfo', userInfoStr)
        }
      }

      // 如果用户信息更新，重新加载菜单权限
      if (userInfo) {
        this.loadMenuPermissions()
      }
    },

    // 设置记住我
    setRememberMe(remember) {
      this.rememberMe = remember

      // 如果已登录，需要迁移存储位置
      if (this.token) {
        const token = this.token
        const userInfo = this.userInfo
        this.setToken(token, remember)
        this.setUserInfo(userInfo, remember)
      }
    },

    // 登录
    async login(loginData, rememberMe = false) {
      const response = await loginApi(loginData)

      // 处理响应格式: {code: 200, message: "登录成功", data: {user, token}}
      if (response.code === 200 && response.data) {
        // 设置记住我状态
        this.setRememberMe(rememberMe)

        if (response.data.token) {
          this.setToken(response.data.token, rememberMe)
        }
        if (response.data.user) {
          this.setUserInfo(response.data.user, rememberMe)
        }
        return response
      } else {
        throw new Error(response.message || '登录失败')
      }
    },

    // 处理注册响应
    handleRegisterResponse(response, rememberMe = false) {
      // 设置记住我状态
      this.setRememberMe(rememberMe)

      // 后端返回格式: {code: 200, message: "注册成功", data: {user, token}}
      if (response.code === 200 && response.data) {
        if (response.data.token) {
          this.setToken(response.data.token, rememberMe)
        }
        if (response.data.user) {
          this.setUserInfo(response.data.user, rememberMe)
        }
      } else if (response.data && response.data.token && response.data.user) {
        // 兼容格式: {data: {user, token}}
        this.setToken(response.data.token, rememberMe)
        this.setUserInfo(response.data.user, rememberMe)
      } else if (response.token && response.user) {
        // 兼容格式: {token, user}
        this.setToken(response.token, rememberMe)
        this.setUserInfo(response.user, rememberMe)
      }
    },

    // 登出
    async logout() {
      // TODO: 调用登出 API
      // await logoutApi()

      this.clearUserInfo()
    },

    // 清除用户信息（清除所有存储）
    clearUserInfo() {
      this.token = ''
      this.userInfo = null
      this.rememberMe = false
      this.menuPermissions = []

      // 清除所有存储位置
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('userInfo')
    },

    // 加载菜单权限
    async loadMenuPermissions() {
      try {
        if (!this.token) {
          this.menuPermissions = []
          return
        }

        const response = await getMyMenuPermissions()
        if (response.code === 200 && response.data) {
          this.menuPermissions = response.data.menuPermissions || []
        } else {
          this.menuPermissions = []
        }
      } catch (error) {
        console.error('加载菜单权限失败:', error)
        this.menuPermissions = []
      }
    },

    // 设置菜单权限
    setMenuPermissions(menuPermissions) {
      this.menuPermissions = menuPermissions || []
    }
  }
})
