/**
 * 分页配置
 * 统一管理项目中的分页默认值和选项
 */

// 默认页码
export const DEFAULT_PAGE = 1

// 默认每页数量配置
export const DEFAULT_PAGE_SIZE = {
  LIST: 10, // 列表页面默认每页数量
  MEDIA_SELECTOR: 12, // 媒体选择器默认每页数量
  COMPONENT_SELECTOR: 10 // 组件选择器默认每页数量
}

// 分页选项配置
export const PAGE_SIZE_OPTIONS = {
  STANDARD: [10, 20, 50, 100], // 标准列表分页选项
  MEDIA: [12, 24, 48], // 媒体列表分页选项
  COMPONENT: [10, 20, 50] // 组件列表分页选项
}

/**
 * 获取默认每页数量
 * @param {string} type - 类型：'list' | 'media' | 'component'
 * @returns {number} 默认每页数量
 */
export function getDefaultPageSize(type = 'list') {
  const typeMap = {
    list: DEFAULT_PAGE_SIZE.LIST,
    media: DEFAULT_PAGE_SIZE.MEDIA_SELECTOR,
    component: DEFAULT_PAGE_SIZE.COMPONENT_SELECTOR
  }
  return typeMap[type] || DEFAULT_PAGE_SIZE.LIST
}

/**
 * 获取分页选项
 * @param {string} type - 类型：'standard' | 'media' | 'component'
 * @returns {Array<number>} 分页选项数组
 */
export function getPageSizeOptions(type = 'standard') {
  const typeMap = {
    standard: PAGE_SIZE_OPTIONS.STANDARD,
    media: PAGE_SIZE_OPTIONS.MEDIA,
    component: PAGE_SIZE_OPTIONS.COMPONENT
  }
  return typeMap[type] || PAGE_SIZE_OPTIONS.STANDARD
}
