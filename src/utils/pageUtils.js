/**
 * 页面相关工具函数
 */

/**
 * 生成页面URL
 * @param {Object} page - 页面对象
 * @param {string} page.name - 页面名称
 * @param {string} page._id - 页面ID
 * @returns {string|null} 页面URL，如果无法生成则返回 null
 */
export function getPageUrl(page) {
  if (!page) return null

  // 如果页面名称是 "home"，使用根路径
  if (page.name === 'home') {
    return '/'
  }

  // 优先使用页面名称（支持中文），如果没有名称则使用ID
  const pageId = page.name || page._id
  if (!pageId) {
    return null
  }

  return `/pageid/${encodeURIComponent(pageId)}`
}

/**
 * 生成完整的页面URL（包含域名）
 * @param {Object} page - 页面对象
 * @returns {string|null} 完整的页面URL
 */
export function getFullPageUrl(page) {
  const pageUrl = getPageUrl(page)
  if (!pageUrl) {
    return null
  }
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined' || !window.location) {
    console.warn('getFullPageUrl: window.location 不可用，返回相对路径')
    return pageUrl
  }
  return window.location.origin + pageUrl
}

/**
 * 检查页面是否可以访问（已发布且启用）
 * @param {Object} page - 页面对象
 * @returns {boolean} 是否可以访问
 */
export function isPageAccessible(page) {
  return page && page.isPublished && page.isActive
}
