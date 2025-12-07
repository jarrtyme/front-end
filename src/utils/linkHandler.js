/**
 * 链接处理工具函数
 * 用于统一处理内部路由和外部链接的跳转
 */

/**
 * 判断是否为外部链接
 * @param {string} url - 链接地址
 * @returns {boolean} 是否为外部链接
 */
export function isExternalLink(url) {
  if (!url || typeof url !== 'string') return false
  return /^https?:\/\//i.test(url.trim())
}

/**
 * 处理链接点击
 * @param {string} link - 链接地址
 * @param {Object} router - Vue Router 实例
 */
export function handleLinkClick(link, router) {
  if (!link || typeof link !== 'string') return

  const trimmedLink = link.trim()
  if (!trimmedLink) return

  if (isExternalLink(trimmedLink)) {
    // 外部链接，新窗口打开
    window.location.href = trimmedLink
    // window.open(trimmedLink, '_blank', 'noopener,noreferrer')
  } else {
    // 内部路由
    try {
      router.push(trimmedLink)
    } catch (error) {
      console.error('路由跳转失败:', error)
    }
  }
}

/**
 * 处理 item 点击
 * 优先使用 clothingId，否则使用 link
 * @param {Object} item - 数据项对象
 * @param {string} link - 组件级别的链接（可选）
 * @param {Object} router - Vue Router 实例
 */
export function handleItemClick(item, link, router) {
  if (!item) return
  console.log(item, link)

  // 优先使用 clothingId
  if (item.clothingId) {
    router.push({ name: 'ClothingDetail', params: { id: item.clothingId } })
    return
  }

  // 其次使用 item 自身的 link（可能来自 item.link 或组件级别的 link）
  // 检查 link 是否为非空字符串
  if (item.link && typeof item.link === 'string' && item.link.trim()) {
    handleLinkClick(item.link, router)
    return
  }

  // 最后使用组件级别的 link（作为后备）
  // 检查 link 是否为非空字符串
  if (link && typeof link === 'string' && link.trim()) {
    handleLinkClick(link, router)
  }
}
