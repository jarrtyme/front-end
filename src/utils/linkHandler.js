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
 * 优先使用内部链接，否则使用外部链接
 * @param {Object} item - 数据项对象
 * @param {string} link - 组件级别的链接（可选）
 * @param {Object} router - Vue Router 实例
 */
export function handleItemClick(item, link, router) {
  if (!item) return
  console.log(item, link)

  const itemLink =
    item.link && typeof item.link === 'string' && item.link.trim() ? item.link.trim() : ''
  const componentLink = link && typeof link === 'string' && link.trim() ? link.trim() : ''

  // 收集所有可用的链接
  const links = []
  if (itemLink) links.push({ link: itemLink, isExternal: isExternalLink(itemLink) })
  if (componentLink) links.push({ link: componentLink, isExternal: isExternalLink(componentLink) })

  if (links.length === 0) return

  // 优先选择内部链接（非外部链接）
  const internalLink = links.find(l => !l.isExternal)
  if (internalLink) {
    handleLinkClick(internalLink.link, router)
    return
  }

  // 如果没有内部链接，使用外部链接
  const externalLink = links.find(l => l.isExternal)
  if (externalLink) {
    handleLinkClick(externalLink.link, router)
  }
}
