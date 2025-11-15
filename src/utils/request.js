// 封装请求工具，支持 HTTP 和 HTTPS
import logger from './logger'

const BASE_URL = import.meta.env.VITE_API_PREFIX || '/api'

/**
 * 获取 token（从 localStorage 或 sessionStorage）
 * @returns {string|null} token
 */
function getToken() {
  // 优先从 localStorage 获取，如果没有则从 sessionStorage 获取
  return localStorage.getItem('token') || sessionStorage.getItem('token') || null
}

/**
 * 获取完整的请求 URL
 * 支持相对路径和绝对路径
 * 如果是绝对路径且包含协议，直接使用
 * 如果是相对路径，使用 BASE_URL
 * @param {string} url - 请求地址
 * @returns {string} 完整的请求 URL
 */
function getRequestUrl(url) {
  // 如果已经是完整的 URL（包含协议），直接返回
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  // 如果是绝对路径（以 / 开头），使用 BASE_URL
  if (url.startsWith('/')) {
    // 判断当前页面协议，自动匹配
    const protocol = window.location.protocol
    const baseUrl = BASE_URL.startsWith('http')
      ? BASE_URL
      : `${protocol}//${window.location.host}${BASE_URL}`
    return `${baseUrl}${url}`
  }

  // 相对路径
  return `${BASE_URL}${url}`
}

/**
 * 检查 token 是否即将过期
 * @param {string} token - JWT token（有效期15天）
 * @param {number} thresholdSeconds - 过期阈值（秒），默认1小时，当token剩余时间小于此值时触发刷新
 * @returns {boolean} - 是否即将过期
 */
function isTokenExpiringSoon(token, thresholdSeconds = 3600) {
  if (!token) return false

  try {
    // 解析 JWT token（不验证签名）
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const payload = JSON.parse(atob(parts[1]))
    const exp = payload.exp

    if (!exp) return false

    const now = Math.floor(Date.now() / 1000)
    const expiresIn = exp - now

    // 如果剩余时间小于阈值，则认为即将过期
    return expiresIn > 0 && expiresIn < thresholdSeconds
  } catch (error) {
    logger.error('解析 token 失败:', error)
    return false
  }
}

/**
 * 更新 token
 * @param {string} newToken - 新的 token
 */
function updateToken(newToken) {
  if (newToken) {
    // 优先使用 store 更新（会根据 rememberMe 状态自动选择存储位置）
    try {
      import('@/stores/user')
        .then(({ useUserStore }) => {
          const userStore = useUserStore()
          // 使用当前的 rememberMe 状态来决定存储位置
          // setToken 方法会根据 rememberMe 自动选择 localStorage 或 sessionStorage
          userStore.setToken(newToken, userStore.rememberMe)
        })
        .catch(() => {
          // 如果导入失败，根据当前存储位置判断
          const isRemembered = !!localStorage.getItem('token')
          if (isRemembered) {
            localStorage.setItem('token', newToken)
          } else {
            sessionStorage.setItem('token', newToken)
          }
        })
    } catch (error) {
      // 如果导入失败，根据当前存储位置判断
      const isRemembered = !!localStorage.getItem('token')
      if (isRemembered) {
        localStorage.setItem('token', newToken)
      } else {
        sessionStorage.setItem('token', newToken)
      }
    }
  }
}

/**
 * 处理请求错误，自动尝试 HTTP/HTTPS 切换
 * @param {string} url - 原始 URL
 * @param {object} config - 请求配置
 * @param {number} retryCount - 重试次数
 * @returns {Promise}
 */
async function requestWithRetry(url, config, retryCount = 0) {
  try {
    const requestUrl = getRequestUrl(url)
    const response = await fetch(requestUrl, config)

    // 检查响应头中是否有新的 token（无感刷新）
    const newToken = response.headers.get('X-New-Token')
    if (newToken) {
      updateToken(newToken)
      logger.info('Token 已自动刷新')
    }

    // 尝试解析响应（无论成功与否）
    let responseData
    try {
      responseData = await response.json()
    } catch {
      // 如果响应不是 JSON，使用空对象
      responseData = {}
    }

    // 处理 401 未授权（token 过期或无效）
    if (response.status === 401 || responseData.code === 401) {
      // 清除 token 和用户信息（清除所有存储位置）
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('userInfo')

      // 清除用户 store（如果存在）
      try {
        // 动态导入避免循环依赖
        import('@/stores/user')
          .then(({ useUserStore }) => {
            const userStore = useUserStore()
            userStore.clearUserInfo()
          })
          .catch(() => {
            // 如果导入失败，忽略
          })
      } catch (error) {
        // 忽略错误
      }

      // 跳转到登录页（避免重复跳转）
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/register') {
        // 保存当前路径，登录后可以跳转回来
        const redirectPath =
          currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : ''

        // 在 sessionStorage 中存储提示消息，登录页面可以读取并显示
        sessionStorage.setItem('loginMessage', '登录已过期，请重新登录')

        // 跳转到登录页
        window.location.href = `/login${redirectPath}`
      }

      throw new Error(responseData.message || '登录已过期，请重新登录')
    }

    // 处理后端的业务错误码（即使HTTP状态码是200，但code不是成功状态）
    if (responseData.code && responseData.code !== 200 && responseData.code !== 201) {
      const errorMessage = responseData.message || `请求失败，错误码: ${responseData.code}`
      throw new Error(errorMessage)
    }

    // 处理其他HTTP错误状态码
    if (!response.ok) {
      const errorMessage =
        responseData.message || responseData.error || `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }

    return responseData
  } catch (error) {
    // 如果是协议问题，尝试切换协议（最多重试一次）
    if (retryCount === 0 && /^https?:\/\//i.test(url) && error.name !== 'TypeError') {
      const alternateUrl = url.replace(/^https:/i, 'http:').replace(/^http:/i, 'https:')
      logger.warn(`请求失败，尝试切换协议: ${url} -> ${alternateUrl}`)
      return requestWithRetry(alternateUrl, config, retryCount + 1)
    }

    logger.error('Request failed:', error)
    throw error
  }
}

/**
 * 通用请求方法
 * @param {string} url - 请求地址（支持相对路径和绝对路径）
 * @param {object} options - 请求配置
 * @param {string} options.method - 请求方法
 * @param {any} options.data - 请求数据（支持对象、FormData等）
 * @param {object} options.headers - 请求头
 * @param {boolean} options.isFormData - 是否为 FormData 请求（自动检测，也可手动指定）
 * @returns {Promise}
 */
export function request(url, options = {}) {
  const { method = 'GET', data, headers = {}, isFormData, ...rest } = options

  // 自动添加 Authorization header
  let token = getToken()

  // 如果 token 即将过期，尝试主动刷新（通过调用验证接口）
  if (token && isTokenExpiringSoon(token)) {
    // 在后台静默刷新 token（不阻塞当前请求）
    refreshTokenSilently()
  }

  const authHeaders = {}
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`
  }

  // 检测是否为 FormData
  const isFormDataRequest = isFormData !== undefined ? isFormData : data instanceof FormData

  const config = {
    method,
    headers: {
      // FormData 请求不设置 Content-Type，让浏览器自动设置 boundary
      ...(isFormDataRequest ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders,
      ...headers
    },
    ...rest
  }

  // 处理请求体
  if (data) {
    if (method === 'GET') {
      // GET 请求将参数拼接到 URL
      const params = new URLSearchParams(data).toString()
      url = `${url}?${params}`
    } else {
      // POST/PUT/DELETE 请求
      if (isFormDataRequest) {
        // FormData 直接使用
        config.body = data
      } else {
        // 其他情况序列化为 JSON
        config.body = JSON.stringify(data)
      }
    }
  }

  return requestWithRetry(url, config)
}

/**
 * 静默刷新 token（不阻塞主请求）
 */
let isRefreshing = false
let refreshPromise = null

async function refreshTokenSilently() {
  // 如果正在刷新，直接返回
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const token = getToken()
      if (!token) {
        return
      }

      // 调用验证接口，后端会在响应头返回新 token
      const baseUrl = import.meta.env.VITE_API_PREFIX || '/api'
      const verifyUrl = baseUrl.startsWith('http')
        ? `${baseUrl}/auth/verify`
        : `${window.location.protocol}//${window.location.host}${baseUrl}/auth/verify`

      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      // 检查响应头中是否有新的 token
      const newToken = response.headers.get('X-New-Token')
      if (newToken) {
        updateToken(newToken)
        logger.info('Token 已静默刷新')
      }
    } catch (error) {
      logger.error('刷新 token 失败:', error)
      // 刷新失败不抛出错误，让主请求继续执行
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/**
 * GET 请求
 */
export function get(url, params, options = {}) {
  return request(url, {
    method: 'GET',
    data: params,
    ...options
  })
}

/**
 * POST 请求
 */
export function post(url, data, options = {}) {
  return request(url, {
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT 请求
 */
export function put(url, data, options = {}) {
  return request(url, {
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE 请求
 */
export function del(url, options = {}) {
  return request(url, {
    method: 'DELETE',
    ...options
  })
}

/**
 * 文件上传请求（支持 FormData）
 * @param {string} url - 请求地址
 * @param {FormData} formData - FormData 对象
 * @param {object} options - 额外配置
 * @returns {Promise}
 */
export function upload(url, formData, options = {}) {
  return request(url, {
    method: 'POST',
    data: formData,
    isFormData: true,
    ...options
  })
}
